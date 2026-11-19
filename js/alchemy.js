/**
 * js/alchemy.js
 * Hệ thống Luyện Đan XÁC ĐỊNH 100% (KHÔNG NGẪU NHIÊN, KHÔNG NỔ LÒ):
 * - Loại đan do tỉ lệ dược liệu quyết định (>=10% kích hoạt, >=30% tối đa).
 * - Số viên đan do tổng số lượng dược liệu quyết định.
 * - Phẩm đan (Nhất Phẩm -> Cửu Phẩm) = phẩm cơ sở từ dược liệu + thưởng Hòa Dược, có trần theo cấp Luyện Đan.
 * - Giai đoạn 1 "Hòa Dược" (20-28s): mỗi dược liệu có 1 thanh dược lực (tối đa 4 thanh), vùng xanh đúng bằng tỉ lệ % của nó. Giữ F/G/H/J đẩy lực.
 * - Giai đoạn 2 "Ngưng Đan" (10s): vòng đan thu nhỏ dần, bấm Space đúng vạch (3-5 nhịp cố định) quyết định 0-3 Đan Vân (+15% hiệu lực/vân).
 */
window.TuTien = window.TuTien || {};

window.TuTien.Alchemy = {
  session: null,

  ensureAlchemyState() {
    const State = window.TuTien.State;
    if (!State || !State.data) return null;
    const d = State.data;

    if (!d.alchemyHerbs || typeof d.alchemyHerbs !== 'object') {
      d.alchemyHerbs = {
        tu_linh_thao: 12,
        pha_chuong_qua: 8,
        huyet_ngoc_sam: 8,
        loi_tam_thao: 6,
        thanh_thuy_lien: 6,
        hau_tho_linh_chi: 4
      };
    }

    // Đồng bộ thảo dược từ Túi Trữ Vật cũ nếu người chơi đã tích trữ nhiều hơn
    const Inv = window.TuTien.Inventory;
    if (Inv && !d._syncedLegacyHerbsToAlchemy) {
      (window.TuTien.ALCHEMY_MATERIALS || []).forEach(m => {
        const legacy = Inv.getHerbCountById(m.id);
        if (legacy > 0) {
          d.alchemyHerbs[m.id] = Math.max(d.alchemyHerbs[m.id] || 0, legacy);
        }
      });
      d._syncedLegacyHerbsToAlchemy = true;
    }

    if (!Array.isArray(d.activeTimedBuffs)) {
      d.activeTimedBuffs = [];
    }

    return d;
  },

  getHerbDef(id) {
    return (window.TuTien.ALCHEMY_MATERIALS || []).find(m => m.id === id) || null;
  },

  getHerbQty(id) {
    const d = this.ensureAlchemyState();
    return d ? Math.max(0, Math.floor(d.alchemyHerbs[id] || 0)) : 0;
  },

  addHerbQty(id, qty) {
    const d = this.ensureAlchemyState();
    if (!d || qty <= 0) return;
    d.alchemyHerbs[id] = Math.max(0, Math.floor((d.alchemyHerbs[id] || 0) + qty));
  },

  consumeHerbQty(id, qty) {
    const d = this.ensureAlchemyState();
    if (!d || qty <= 0) return false;
    const have = this.getHerbQty(id);
    if (have < qty) return false;
    d.alchemyHerbs[id] = have - qty;
    return true;
  },

  getAlchemyRank() {
    if (window.TuTien.Fields && typeof window.TuTien.Fields.getFieldState === 'function') {
      return window.TuTien.Fields.getFieldState('luyen_dan').rank || 1;
    }
    return 1;
  },

  getAlchemyTalentMult() {
    if (window.TuTien.Fields && typeof window.TuTien.Fields.getFieldTalentObj === 'function') {
      return window.TuTien.Fields.getFieldTalentObj('luyen_dan').multiplier || 1.0;
    }
    return 1.0;
  },

  getGradeName(grade) {
    const names = window.TuTien.PILL_RANK_NAMES || [];
    const idx = Math.max(0, Math.min(names.length - 1, Math.floor(grade) - 1));
    return names[idx] || 'Nhất Phẩm';
  },

  getGradeColor(grade) {
    const cols = window.TuTien.PILL_RANK_COLORS || [];
    const idx = Math.max(0, Math.min(cols.length - 1, Math.floor(grade) - 1));
    return cols[idx] || '#cbd5e1';
  },

  analyzeSlots(slots) {
    const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.alchemy) || {};
    const entries = [];
    let totalQty = 0;
    let gradeSum = 0;
    const elCounts = {};

    (slots || []).forEach(s => {
      if (!s || !s.herbId || !s.qty || s.qty <= 0) return;
      const def = this.getHerbDef(s.herbId);
      if (!def) return;
      const qty = Math.floor(s.qty);
      entries.push({ herbId: s.herbId, qty, def });
      totalQty += qty;
      gradeSum += def.grade * qty;
      elCounts[def.element] = (elCounts[def.element] || 0) + qty;
    });

    if (totalQty === 0) {
      return {
        totalQty: 0,
        entries: [],
        dominantElement: 'moc',
        pillCount: 0,
        baseGrade: 1,
        maxGrade: 1,
        matchedPills: [],
        missingReason: 'Hãy bỏ dược liệu vào các ô bên trái (tối thiểu 4 dược liệu để luyện thành 1 viên đan).'
      };
    }

    let dominantElement = entries[0].def.element;
    let maxEl = -1;
    Object.keys(elCounts).forEach(el => {
      if (elCounts[el] > maxEl) {
        maxEl = elCounts[el];
        dominantElement = el;
      }
    });

    const herbsPerPill = cfg.herbsPerPill || 4;
    const pillCount = Math.floor(totalQty / herbsPerPill);
    const baseGrade = Math.max(1, Math.min(9, Math.floor(gradeSum / totalQty)));
    const rankCap = Math.max(1, Math.min(9, this.getAlchemyRank()));
    const maxGrade = Math.min(9, rankCap, baseGrade + 3);

    // Khớp các loại đan theo hệ chiếm ưu thế & mốc 10%/30%
    const allPills = window.TuTien.ALCHEMY_PILLS || [];
    const matchedPills = allPills.filter(p => {
      const elRatio = (elCounts[p.mainElement] || 0) / totalQty;
      const qtyOk = !p.minTotalQty || totalQty >= p.minTotalQty;
      return pillCount >= 1 && elRatio >= (cfg.affixLevel1Ratio || 0.10) && qtyOk;
    });

    // Sắp xếp ưu tiên hệ chiếm tỷ lệ cao nhất
    matchedPills.sort((a, b) => (elCounts[b.mainElement] || 0) - (elCounts[a.mainElement] || 0));

    let missingReason = '';
    if (pillCount < 1) {
      missingReason = `Cần tối thiểu ${herbsPerPill} dược liệu để luyện thành 1 viên đan (hiện có ${totalQty}).`;
    } else if (matchedPills.length === 0) {
      missingReason = 'Chưa có hệ dược liệu nào đạt mốc 10% để thành đan.';
    }

    const activeEffects = Object.keys(elCounts)
      .filter(el => elCounts[el] / totalQty >= (cfg.affixLevel1Ratio || 0.10))
      .map(el => {
        const ratio = elCounts[el] / totalQty;
        return {
          element: el,
          ratioPct: Math.round(ratio * 100),
          isMax: ratio >= (cfg.affixMaxRatio || 0.30)
        };
      });

    // Thời gian Hòa Dược từ 20 đến 28 giây tùy số loại dược liệu & số viên
    const hoaDuocSec = Math.min(cfg.hoaDuocMaxSec || 28, (cfg.hoaDuocMinSec || 20) + Math.min(8, entries.length * 2));

    return {
      totalQty,
      entries,
      dominantElement,
      elCounts,
      pillCount,
      baseGrade,
      maxGrade,
      activeEffects,
      matchedPills,
      hoaDuocSec,
      ngungDanSec: cfg.ngungDanSec || 10,
      missingReason
    };
  },

  isBrewing() {
    return !!(this.session && (this.session.phase === 'hoa_duoc' || this.session.phase === 'ngung_dan'));
  },

  computeAutoCapPct() {
    const cfg = window.TuTien.CONFIG.alchemy;
    const rank = this.getAlchemyRank();
    const tal = this.getAlchemyTalentMult();
    return Math.min(cfg.autoMaxHoaDuocPct || 65, 45 + (rank - 1) * 2 + Math.round((tal - 1) * 4));
  },

  checkPendingAbandonedSessionOnLoad() {
    const d = this.ensureAlchemyState();
    if (!d || !d.activeAlchemySession) return;
    const saved = d.activeAlchemySession;
    d.activeAlchemySession = null;
    const refund = this.refundAbandonedHerbs(saved.entries || []);
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    setTimeout(() => {
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(`⚗️ Lần trước bạn rời Đan Lô giữa chừng nên mất 50% dược liệu! Đã hoàn: ${refund}`, 'warn');
      }
    }, 1100);
  },

  refundAbandonedHerbs(entries) {
    const penalty = (window.TuTien.CONFIG && window.TuTien.CONFIG.alchemy && window.TuTien.CONFIG.alchemy.abandonPenalty) || 0.5;
    const parts = [];
    (entries || []).forEach(ent => {
      const keep = Math.ceil(ent.qty * (1 - penalty));
      if (keep > 0) {
        this.addHerbQty(ent.herbId, keep);
        const def = this.getHerbDef(ent.herbId);
        parts.push(`${def ? def.icon : '🌿'} ${def ? def.name : ent.herbId} ×${keep}`);
      }
    });
    return parts.join(', ');
  },

  startBrewing(slots, pillId, autoMode = false) {
    if (this.isBrewing()) return false;
    const analysis = this.analyzeSlots(slots);
    if (!analysis.matchedPills.length) return false;

    const pillDef = analysis.matchedPills.find(p => p.id === pillId) || analysis.matchedPills[0];
    for (const ent of analysis.entries) {
      if (this.getHerbQty(ent.herbId) < ent.qty) return false;
    }

    analysis.entries.forEach(ent => this.consumeHerbQty(ent.herbId, ent.qty));

    const cfg = window.TuTien.CONFIG.alchemy;
    const hoaDuocDuration = autoMode ? Number((analysis.hoaDuocSec * (cfg.autoTimeMult || 1.35)).toFixed(1)) : analysis.hoaDuocSec;
    const ngungDanDuration = autoMode ? Number((analysis.ngungDanSec * (cfg.autoTimeMult || 1.35)).toFixed(1)) : analysis.ngungDanSec;

    // Khởi tạo thanh dược lực cho từng dược liệu (vùng xanh đặt đúng tại tỉ lệ % của dược liệu đó)
    const bars = analysis.entries.map((ent, idx) => {
      const ratioPct = Math.max(12, Math.min(88, Math.round((ent.qty / analysis.totalQty) * 100)));
      return {
        index: idx,
        herbId: ent.herbId,
        name: ent.def.name,
        icon: ent.def.icon,
        targetCenter: ratioPct,
        targetMin: Math.max(4, ratioPct - 11),
        targetMax: Math.min(96, ratioPct + 11),
        value: ratioPct,
        driftFreq: 0.75 + idx * 0.28,
        driftPhase: idx * 1.15
      };
    });

    this.session = {
      phase: 'hoa_duoc', // 'hoa_duoc' | 'ngung_dan' | 'completed'
      autoMode: !!autoMode,
      pillDef,
      analysis,
      slotsSnapshot: slots.map(s => (s ? { herbId: s.herbId, qty: s.qty } : null)),
      bars,
      elapsedSec: 0,
      hoaDuocDuration,
      allInZoneSec: 0,
      hoaDuocScorePct: 100,

      // Giai đoạn 2: Ngưng Đan
      condenseElapsed: 0,
      condenseDuration: ngungDanDuration,
      totalBeats: pillDef.beats || 3,
      currentBeat: 0,
      beatProgress: 0, // 0..1 (vòng thu nhỏ từ ngoài vào tâm, vạch mục tiêu ở 0.78)
      beatLocked: false,
      perfectHits: 0,
      danVan: 0,
      lastBeatFeedback: '',
      resultPill: null
    };

    const d = this.ensureAlchemyState();
    if (d) {
      d.activeAlchemySession = {
        pillId: pillDef.id,
        entries: analysis.entries.map(e => ({ herbId: e.herbId, qty: e.qty }))
      };
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }
    return true;
  },

  abandonBrewing() {
    if (!this.isBrewing()) return '';
    const entries = this.session.analysis.entries;
    const refund = this.refundAbandonedHerbs(entries);
    this.session = null;
    const d = this.ensureAlchemyState();
    if (d) {
      d.activeAlchemySession = null;
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`💨 Đã bỏ dở luyện đan, hoàn lại 50% dược liệu: ${refund}`, 'warn');
    }
    return refund;
  },

  triggerCondenseBeat() {
    if (!this.session || this.session.phase !== 'ngung_dan' || this.session.autoMode || this.session.beatLocked) return;
    const s = this.session;
    s.beatLocked = true;
    // Vạch mục tiêu ở beatProgress = 0.78 (sai số +/- 0.14 là chuẩn!)
    const diff = Math.abs(s.beatProgress - 0.78);
    if (diff <= 0.14) {
      s.perfectHits += 1;
      s.lastBeatFeedback = '✨ Chuẩn xác! Đan Vân ngưng tụ!';
      if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(3);
    } else {
      s.lastBeatFeedback = '💨 Lệch nhịp!';
    }
  },

  update(dtMs) {
    this.updateTimedBuffs(dtMs);
    if (!this.isBrewing()) return;

    const s = this.session;
    const cfg = window.TuTien.CONFIG.alchemy;
    const dt = Math.min(0.05, dtMs / 1000);

    if (s.phase === 'hoa_duoc') {
      s.elapsedSec += dt;
      const guard = window.TuTien.InputGuard;
      const t = s.elapsedSec;
      let allInside = true;

      s.bars.forEach((bar, i) => {
        // Hàm trôi cố định theo thời gian (0% Math.random)
        const drift = Math.sin(t * bar.driftFreq + bar.driftPhase) * 14 - (cfg.barDecayPerSec || 16);
        if (s.autoMode) {
          const cap = this.computeAutoCapPct() / 100;
          const curRatio = s.elapsedSec > 0 ? s.allInZoneSec / s.elapsedSec : cap;
          const aim = curRatio > cap ? bar.targetCenter - 14 : bar.targetCenter;
          bar.value += (aim - bar.value) * Math.min(1, dt * 4);
        } else {
          const held = guard && guard.isAlchemyActionHeld(`herb${i + 1}`);
          const push = held ? (cfg.barPushPerSec || 42) : 0;
          bar.value = Math.max(0, Math.min(100, bar.value + (drift + push) * dt));
        }

        if (bar.value < bar.targetMin || bar.value > bar.targetMax) {
          allInside = false;
        }
      });

      if (allInside) s.allInZoneSec += dt;
      let pct = s.elapsedSec > 0 ? (s.allInZoneSec / s.elapsedSec) * 100 : 100;
      if (s.autoMode) pct = Math.min(this.computeAutoCapPct(), pct);
      s.hoaDuocScorePct = Math.max(0, Math.min(100, Math.round(pct)));

      if (s.elapsedSec >= s.hoaDuocDuration) {
        // Chuyển sang Giai đoạn 2: Ngưng Đan
        s.phase = 'ngung_dan';
        s.condenseElapsed = 0;
        s.currentBeat = 0;
        s.beatProgress = 0;
        s.beatLocked = false;
        if (window.TuTien.AlchemyUI && window.TuTien.AlchemyUI.isOpen) {
          window.TuTien.AlchemyUI.renderAll();
        }
      }
    } else if (s.phase === 'ngung_dan') {
      s.condenseElapsed += dt;
      const beatLen = s.condenseDuration / s.totalBeats;
      const beatIdx = Math.floor(s.condenseElapsed / beatLen);
      if (beatIdx !== s.currentBeat && beatIdx < s.totalBeats) {
        s.currentBeat = beatIdx;
        s.beatLocked = false;
        s.lastBeatFeedback = '';
      }
      s.beatProgress = (s.condenseElapsed % beatLen) / beatLen;

      if (s.autoMode && !s.beatLocked && s.beatProgress >= 0.78) {
        s.beatLocked = true;
        if (s.perfectHits < (cfg.autoMaxDanVan || 1)) {
          s.perfectHits += 1;
          s.lastBeatFeedback = '🤖 Tự động ngưng 1 Đan Vân!';
        }
      }

      if (s.condenseElapsed >= s.condenseDuration) {
        this.finishBrewing();
      }
    }

    if (window.TuTien.AlchemyUI && window.TuTien.AlchemyUI.isOpen) {
      window.TuTien.AlchemyUI.updateLiveHUD();
    }
  },

  finishBrewing() {
    const s = this.session;
    if (!s) return;
    const cfg = window.TuTien.CONFIG.alchemy;

    // Tính số Đan Vân (0 đến 3) từ số nhịp bấm chuẩn
    const hitRatio = s.totalBeats > 0 ? s.perfectHits / s.totalBeats : 0;
    let danVan = hitRatio >= 0.95 ? 3 : hitRatio >= 0.65 ? 2 : hitRatio >= 0.3 ? 1 : 0;
    if (s.autoMode) danVan = Math.min(cfg.autoMaxDanVan || 1, danVan);
    s.danVan = danVan;

    // Phẩm đan (Nhất -> Cửu Phẩm) = phẩm cơ sở + thưởng Hòa Dược, trần theo cấp Luyện Đan
    let bonus = 0;
    if (s.hoaDuocScorePct >= 95) bonus = 3;
    else if (s.hoaDuocScorePct >= 80) bonus = 2;
    else if (s.hoaDuocScorePct >= 60) bonus = 1;
    const penalty = s.hoaDuocScorePct < 30 ? 1 : 0;
    const finalGrade = Math.max(1, Math.min(9, this.getAlchemyRank(), s.analysis.baseGrade + bonus - penalty));

    const danVanMult = 1 + danVan * (cfg.danVanBonusPct || 0.15);
    const ratioBoost = (s.analysis.elCounts[s.pillDef.mainElement] || 0) / s.analysis.totalQty >= 0.30 ? 1.35 : 1.0;
    const finalPower = Number((s.pillDef.basePower * (1 + (finalGrade - 1) * 0.28) * danVanMult * ratioBoost).toFixed(2));

    const gradeName = this.getGradeName(finalGrade);
    const gradeColor = this.getGradeColor(finalGrade);

    s.resultPill = {
      id: `${s.pillDef.id}_g${finalGrade}_v${danVan}`,
      pillId: s.pillDef.id,
      name: `${s.pillDef.name} (${danVan} Đan Vân)`,
      grade: finalGrade,
      gradeName,
      color: gradeColor,
      pillColor: s.pillDef.color,
      danVan,
      count: s.analysis.pillCount,
      buffType: s.pillDef.buffType,
      power: finalPower,
      durationSec: s.pillDef.durationSec,
      hoaDuocScorePct: s.hoaDuocScorePct,
      desc: `${s.pillDef.desc} Hiệu lực: +${Math.round(finalPower * 100)}% (${s.pillDef.durationSec}s)`
    };

    s.phase = 'completed';
    const d = this.ensureAlchemyState();
    if (d) {
      d.activeAlchemySession = null;
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }
    if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(Math.min(5, finalGrade));
    if (window.TuTien.AlchemyUI) window.TuTien.AlchemyUI.renderAll();
  },

  collectCompletedPills() {
    if (!this.session || this.session.phase !== 'completed' || !this.session.resultPill) return null;
    const p = this.session.resultPill;
    const Inv = window.TuTien.Inventory;
    if (Inv) {
      Inv.addStackableItem(
        'pill',
        p.id,
        p.name,
        '💊',
        { tier: Math.min(5, Math.ceil(p.grade / 2)), name: p.gradeName, color: p.color, mult: 1 + p.danVan * 0.15 },
        p.desc,
        p.count,
        {
          customTimedBuff: {
            name: p.name,
            icon: '💊',
            color: p.color,
            buffType: p.buffType,
            power: p.power,
            durationSec: p.durationSec
          }
        }
      );
    }
    const snap = this.session.slotsSnapshot;
    const pillId = this.session.pillDef.id;
    this.session = null;
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    return { pill: p, snapshot: snap, pillId };
  },

  // ---------------------------------------------------------------------------
  // HỆ THỐNG BUFF TẠM THỜI CÓ ĐỒNG HỒ ĐẾM NGƯỢC (DÙNG CHUNG CHO ĐAN & PHÙ MỚI)
  // ---------------------------------------------------------------------------

  activateTimedBuff(buffCfg) {
    const d = this.ensureAlchemyState();
    if (!d || !buffCfg) return;
    const existing = d.activeTimedBuffs.find(b => b.name === buffCfg.name && b.buffType === buffCfg.buffType);
    if (existing) {
      existing.remainingMs += (buffCfg.durationSec || 60) * 1000;
      existing.power = Math.max(existing.power, buffCfg.power);
    } else {
      d.activeTimedBuffs.push({
        name: buffCfg.name,
        icon: buffCfg.icon || '✨',
        color: buffCfg.color || '#4ade80',
        buffType: buffCfg.buffType,
        power: buffCfg.power || 0.25,
        remainingMs: (buffCfg.durationSec || 60) * 1000
      });
    }
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`✨ Kích hoạt 【${buffCfg.name}】 (${buffCfg.durationSec}s)!`, 'success');
    }
  },

  updateTimedBuffs(dtMs) {
    const d = this.ensureAlchemyState();
    if (!d || !d.activeTimedBuffs.length) return;

    let autoClickPower = 0;
    d.activeTimedBuffs.forEach(b => {
      b.remainingMs -= dtMs;
      if (b.buffType === 'autoclick' && b.remainingMs > 0) {
        autoClickPower += b.power || 2;
      }
    });
    d.activeTimedBuffs = d.activeTimedBuffs.filter(b => b.remainingMs > 0);

    // Nếu có Phù Tự Động Click -> tự vận công mỗi giây!
    if (autoClickPower > 0 && window.TuTien.Cultivate) {
      this._autoClickAcc = (this._autoClickAcc || 0) + (dtMs / 1000) * autoClickPower;
      if (this._autoClickAcc >= 1) {
        const clicks = Math.floor(this._autoClickAcc);
        this._autoClickAcc -= clicks;
        const clickGain = window.TuTien.Cultivate.getClickPower() * clicks;
        d.qi += clickGain;
        d.totalQiEarned += clickGain;
      }
    }
  },

  getActiveBuffSummary() {
    const d = this.ensureAlchemyState();
    const res = { speedPct: 0, clickPct: 0, breakthroughPct: 0, guardPct: 0, offlineHours: 0, list: [] };
    if (!d || !Array.isArray(d.activeTimedBuffs)) return res;
    d.activeTimedBuffs.forEach(b => {
      if (b.remainingMs <= 0) return;
      res.list.push(b);
      if (b.buffType === 'speed' || b.buffType === 'all') res.speedPct += b.power;
      if (b.buffType === 'click' || b.buffType === 'all') res.clickPct += b.power;
      if (b.buffType === 'breakthrough' || b.buffType === 'all') res.breakthroughPct += Math.min(0.25, b.power);
      if (b.buffType === 'guard') res.guardPct += Math.min(0.6, b.power);
      if (b.buffType === 'offline') res.offlineHours += b.power;
    });
    return res;
  }
};
