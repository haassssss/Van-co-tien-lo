/**
 * js/forge.js
 * Hệ thống Rèn Pháp Bảo XÁC ĐỊNH 100% (KHÔNG NGẪU NHIÊN, KHÔNG NỔ LÒ):
 * - Cùng nguyên liệu + cùng chỉ số Luyện Khí + cùng thao tác Khống Hỏa = LUÔN ra cùng 1 Pháp Bảo!
 * - Tổng số lượng + loại nguyên liệu chính quyết định mẫu Pháp Bảo khớp từ 16 mẫu (js/data/artifacts.js).
 * - Tỷ lệ hệ nguyên liệu >= 10% kích hoạt Đạo Vận mức 1, >= 30% kích hoạt Đạo Vận mức tối đa (js/data/affixes.js).
 * - Phẩm giai = trung bình phẩm giai linh tài (làm tròn xuống) + thưởng Khống Hỏa (>=60%: +1, >=90%: +2) + Đốn Ngộ (+1), có trần theo mẫu & cấp Luyện Khí.
 * - Bỏ dở giữa lúc rèn: mất 50% linh tài (abandonPenalty trong config.js, làm tròn lên trả lại cho người chơi).
 * - Khai Khoáng AFK: tự động thu thập 20 linh tài theo thời gian (cả khi Offline).
 */
window.TuTien = window.TuTien || {};

window.TuTien.Forge = {
  // Trạng thái đang rèn (Khống Hỏa)
  session: null,

  // ---------------------------------------------------------------------------
  // 1. QUẢN LÝ KHO LINH TÀI RÈN & TƯƠNG THÍCH SAVE CŨ
  // ---------------------------------------------------------------------------

  ensureForgeState() {
    const State = window.TuTien.State;
    if (!State || !State.data) return null;
    const d = State.data;

    if (!d.forgeMaterials || typeof d.forgeMaterials !== 'object') {
      // Khởi tạo linh tài cơ bản cho người chơi mới hoặc save cũ để mở Lò Rèn thử ngay
      d.forgeMaterials = {
        sat_khoang: 12,
        da_khoang: 8,
        go_linh_moc: 8,
        bich_thuy_ngoc: 6,
        yeu_thu_huyet: 5,
        bach_ngan_tinh: 4,
        xich_dong_hoa: 4,
        han_bang_ngoc: 4
      };
    }

    // Đồng bộ 4 loại khoáng sản cũ từ Túi Trữ Vật nếu save cũ có nhiều hơn
    const Inv = window.TuTien.Inventory;
    if (Inv && !d._syncedLegacyOresToForge) {
      ['sat_khoang', 'da_khoang', 'go_linh_moc', 'vang_tinh_kim'].forEach(id => {
        const legacyQty = Inv.getMaterialCountById(id);
        if (legacyQty > 0) {
          d.forgeMaterials[id] = Math.max(d.forgeMaterials[id] || 0, legacyQty);
        }
      });
      d._syncedLegacyOresToForge = true;
    }

    if (!d.forgeCodex || typeof d.forgeCodex !== 'object') {
      d.forgeCodex = {}; // Lưu các mẫu Pháp Bảo đã rèn thành công lần đầu (Đồ Phổ)
    }

    if (!d.mining || typeof d.mining !== 'object') {
      d.mining = {
        enabled: true,
        accumulatorMs: 0,
        cycleIndex: 0,
        totalMined: 0
      };
    }

    if (!d.settings) d.settings = {};
    if (d.settings.blockContextAndSelect === undefined) {
      d.settings.blockContextAndSelect = true;
    }
    if (!d.settings.forgeKeys) {
      d.settings.forgeKeys = { addFire: 'KeyF', fanWind: 'KeyG', focusCalm: 'KeyH' };
    }

    return d;
  },

  getMaterialDef(matId) {
    return (window.TuTien.FORGE_MATERIALS_EXT || []).find(m => m.id === matId) || null;
  },

  getMaterialQty(matId) {
    const d = this.ensureForgeState();
    return d ? Math.max(0, Math.floor(d.forgeMaterials[matId] || 0)) : 0;
  },

  addMaterialQty(matId, qty) {
    const d = this.ensureForgeState();
    if (!d || qty <= 0) return;
    d.forgeMaterials[matId] = Math.max(0, Math.floor((d.forgeMaterials[matId] || 0) + qty));
  },

  consumeMaterialQty(matId, qty) {
    const d = this.ensureForgeState();
    if (!d || qty <= 0) return false;
    const have = this.getMaterialQty(matId);
    if (have < qty) return false;
    d.forgeMaterials[matId] = have - qty;
    return true;
  },

  getSmithRank() {
    if (window.TuTien.Fields && typeof window.TuTien.Fields.getFieldState === 'function') {
      return window.TuTien.Fields.getFieldState('luyen_khi').rank || 1;
    }
    return 1;
  },

  getSmithTalentMult() {
    if (window.TuTien.Fields && typeof window.TuTien.Fields.getFieldTalentObj === 'function') {
      return window.TuTien.Fields.getFieldTalentObj('luyen_khi').multiplier || 1.0;
    }
    return 1.0;
  },

  getGradeObj(tier) {
    const grades = window.TuTien.FORGE_GRADES || [];
    const clamped = Math.max(1, Math.min(grades.length, Math.floor(tier || 1)));
    return grades.find(g => g.tier === clamped) || grades[0];
  },

  // ---------------------------------------------------------------------------
  // 2. PHÂN TÍCH NGUYÊN LIỆU & NHẬN DẠNG THÀNH PHẨM XÁC ĐỊNH 100%
  // ---------------------------------------------------------------------------

  analyzeSlots(slots) {
    const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.forge) || {};
    const validEntries = [];
    let totalQty = 0;
    let tierWeightedSum = 0;
    const elementCounts = {};
    const roleCounts = {};

    (slots || []).forEach(s => {
      if (!s || !s.matId || !s.qty || s.qty <= 0) return;
      const def = this.getMaterialDef(s.matId);
      if (!def) return;
      const qty = Math.floor(s.qty);
      validEntries.push({ matId: s.matId, qty, def });
      totalQty += qty;
      tierWeightedSum += def.tier * qty;
      elementCounts[def.element] = (elementCounts[def.element] || 0) + qty;
      roleCounts[def.role] = (roleCounts[def.role] || 0) + qty;
    });

    if (totalQty === 0) {
      return {
        totalQty: 0,
        entries: [],
        dominantElement: 'hoa',
        dominantRole: null,
        baseTier: 1,
        affixes: [],
        matchedBlueprints: [],
        missingReason: 'Hãy chọn linh tài vào các ô bên trái (tổng từ 3 đến 50 viên) để bắt đầu rèn.'
      };
    }

    // Hệ chiếm nhiều nhất (nếu hòa nhau thì lấy theo thứ tự xuất hiện để luôn xác định)
    let dominantElement = validEntries[0].def.element;
    let maxElQty = -1;
    Object.keys(elementCounts).forEach(el => {
      if (elementCounts[el] > maxElQty) {
        maxElQty = elementCounts[el];
        dominantElement = el;
      }
    });

    // Nhóm vai trò chiếm nhiều nhất (kim_loai, ngoc, moc, linh_thach, tinh_huyet)
    let dominantRole = validEntries[0].def.role;
    let maxRoleQty = -1;
    Object.keys(roleCounts).forEach(rl => {
      if (roleCounts[rl] > maxRoleQty) {
        maxRoleQty = roleCounts[rl];
        dominantRole = rl;
      }
    });

    // Phẩm giai cơ sở = trung bình phẩm giai theo số lượng, làm tròn xuống
    const baseTier = Math.max(1, Math.floor(tierWeightedSum / totalQty));

    // Tính Đạo Vận theo tỷ lệ (>= 10% mức 1, >= 30% mức tối đa)
    const lv1Ratio = cfg.affixLevel1Ratio || 0.10;
    const maxRatio = cfg.affixMaxRatio || 0.30;
    const affixDefs = window.TuTien.FORGE_AFFIXES || {};
    const affixes = [];

    Object.keys(elementCounts).forEach(el => {
      const ratio = elementCounts[el] / totalQty;
      const aDef = affixDefs[el];
      if (!aDef || ratio < lv1Ratio) return;
      const isMax = ratio >= maxRatio;
      affixes.push({
        element: el,
        name: aDef.name,
        statKey: aDef.statKey,
        level: isMax ? 2 : 1,
        levelLabel: isMax ? 'Tối Đa' : 'Mức 1',
        ratioPct: Math.round(ratio * 100),
        baseValue: isMax ? aDef.maxValue : aDef.level1Value,
        def: aDef
      });
    });

    // Khớp mẫu Pháp Bảo từ 16 mẫu trong js/data/artifacts.js
    const allBlueprints = window.TuTien.ARTIFACT_BLUEPRINTS || [];
    const matchedBlueprints = allBlueprints.filter(bp => {
      const qtyOk = totalQty >= bp.minQty && totalQty <= bp.maxQty;
      const roleOk = (roleCounts[bp.primaryRole] || 0) > 0 && (bp.primaryRole === dominantRole || (roleCounts[bp.primaryRole] / totalQty) >= 0.4);
      return qtyOk && roleOk;
    });

    let missingReason = '';
    if (matchedBlueprints.length === 0) {
      if (totalQty < 3) {
        missingReason = `Tổng số lượng mới đạt ${totalQty} viên — cần ít nhất 3 linh tài để thành hình Pháp Bảo cỡ nhỏ (Phi Châm, Phi Đao, Ngọc Bội).`;
      } else if (totalQty > 50) {
        missingReason = `Tổng số lượng ${totalQty} viên vượt ngưỡng tối đa 50 viên của lò rèn! Hãy giảm bớt linh tài.`;
      } else {
        const roleName = (window.TuTien.FORGE_ROLES && window.TuTien.FORGE_ROLES[dominantRole]) || dominantRole;
        missingReason = `Với ${totalQty} linh tài (chính là ${roleName}), chưa có mẫu nào khớp khoảng số lượng này. Hãy thử chỉnh tổng số lượng (Nhỏ: 3–10, Trung: 11–28, Lớn: 29–50).`;
      }
    }

    return {
      totalQty,
      entries: validEntries,
      dominantElement,
      dominantRole,
      elementCounts,
      roleCounts,
      baseTier,
      affixes,
      matchedBlueprints,
      missingReason
    };
  },

  computeMaxPossibleTier(analysis, blueprint) {
    const smithRank = this.getSmithRank();
    const rankCap = Math.min(5, Math.max(2, Math.ceil(smithRank / 2) + 1));
    const maxTheoretical = analysis.baseTier + 3; // +2 Khống Hỏa 90% +1 Đốn Ngộ
    return Math.max(1, Math.min(5, blueprint ? blueprint.maxTier : 5, rankCap, maxTheoretical));
  },

  computeFinalTier(baseTier, blueprint, fireScorePct, hasDonNgo) {
    const cfg = window.TuTien.CONFIG.forge;
    const smithRank = this.getSmithRank();
    const rankCap = Math.min(5, Math.max(2, Math.ceil(smithRank / 2) + 1));

    let bonus = 0;
    if (fireScorePct >= (cfg.scoreBonusTier2Pct || 90)) bonus += 2;
    else if (fireScorePct >= (cfg.scoreBonusTier1Pct || 60)) bonus += 1;
    if (hasDonNgo) bonus += 1;

    // Điểm quá thấp (<30%) làm giảm 1 bậc phẩm giai (không bao giờ nổ lò hay mất đồ)
    let penalty = fireScorePct < 30 ? 1 : 0;

    const raw = Math.max(1, baseTier + bonus - penalty);
    return Math.min(5, blueprint.maxTier || 5, rankCap, raw);
  },

  computeAutoForgeCapPct() {
    const cfg = window.TuTien.CONFIG.forge;
    const rank = this.getSmithRank();
    const talMult = this.getSmithTalentMult();
    const raw = (cfg.autoForgeBaseCapPct || 56) + (rank - 1) * (cfg.autoForgeCapPerRank || 2) + Math.round((talMult - 1) * 4);
    return Math.min(cfg.autoForgeMaxCapPct || 70, Math.max(45, raw));
  },

  // ---------------------------------------------------------------------------
  // 3. QUÁ TRÌNH KHỐNG HỎA XÁC ĐỊNH 100% (F: THÊM LỬA, G: QUẠT GIÓ, H: NGƯNG THẦN)
  // ---------------------------------------------------------------------------

  isForging() {
    return !!(this.session && this.session.status === 'forging');
  },

  /**
   * Kiểm tra khi tải game: nếu người chơi tắt tab / reload giữa lúc đang rèn -> phạt bỏ dở 50% và thông báo rõ
   */
  checkPendingAbandonedSessionOnLoad() {
    const d = this.ensureForgeState();
    if (!d || !d.activeForgeSession) return;

    const saved = d.activeForgeSession;
    d.activeForgeSession = null;
    const refundSummary = this.refundAbandonedMaterials(saved.entries || []);
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();

    setTimeout(() => {
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(
          `🔥 Lần trước bạn rời lò khi đang rèn 【${saved.blueprintName || 'Pháp Bảo'}】 nên mất 50% linh tài! Đã hoàn lại: ${refundSummary}`,
          'warn'
        );
      }
    }, 800);
  },

  refundAbandonedMaterials(entries) {
    const penalty = (window.TuTien.CONFIG && window.TuTien.CONFIG.forge && window.TuTien.CONFIG.forge.abandonPenalty) || 0.5;
    const parts = [];
    (entries || []).forEach(ent => {
      const keep = Math.ceil(ent.qty * (1 - penalty)); // Làm tròn lên cho người chơi
      if (keep > 0) {
        this.addMaterialQty(ent.matId, keep);
        const def = this.getMaterialDef(ent.matId);
        parts.push(`${def ? def.icon : '📦'} ${def ? def.name : ent.matId} ×${keep}`);
      }
    });
    return parts.join(', ');
  },

  startForging(slots, blueprintId, autoMode = false) {
    if (this.isForging()) return false;
    const analysis = this.analyzeSlots(slots);
    if (!analysis.matchedBlueprints.length) return false;

    const blueprint =
      analysis.matchedBlueprints.find(bp => bp.id === blueprintId) ||
      analysis.matchedBlueprints[0];

    // Kiểm tra đủ linh tài trong kho
    for (const ent of analysis.entries) {
      if (this.getMaterialQty(ent.matId) < ent.qty) return false;
    }

    // Trừ linh tài ngay khi bắt đầu đốt lò
    analysis.entries.forEach(ent => this.consumeMaterialQty(ent.matId, ent.qty));

    const cfg = window.TuTien.CONFIG.forge;
    const durationSec = autoMode
      ? Number((blueprint.forgeTimeSec * (cfg.autoForgeTimeMult || 1.35)).toFixed(1))
      : blueprint.forgeTimeSec;

    this.session = {
      status: 'forging', // 'forging' | 'completed'
      autoMode: !!autoMode,
      blueprint,
      analysis,
      slotsSnapshot: slots.map(s => (s ? { matId: s.matId, qty: s.qty } : null)),
      elapsedSec: 0,
      durationSec,
      heat: blueprint.targetPattern.baseCenter,
      targetMin: blueprint.targetPattern.baseCenter - blueprint.targetPattern.width / 2,
      targetMax: blueprint.targetPattern.baseCenter + blueprint.targetPattern.width / 2,
      inZoneSec: 0,
      currentStreakSec: 0,
      maxStreakSec: 0,
      hasDonNgo: false,
      focusEnergy: 100,
      fireScorePct: 100,
      resultArtifact: null
    };

    // Lưu phiên đang rèn vào State để xử lý nếu người chơi F5/tắt tab giữa chừng
    const d = this.ensureForgeState();
    if (d) {
      d.activeForgeSession = {
        blueprintId: blueprint.id,
        blueprintName: blueprint.name,
        entries: analysis.entries.map(e => ({ matId: e.matId, qty: e.qty }))
      };
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }

    return true;
  },

  abandonForging() {
    if (!this.isForging()) return '';
    const entries = this.session.analysis.entries;
    const bpName = this.session.blueprint.name;
    const refundSummary = this.refundAbandonedMaterials(entries);

    this.session = null;
    const d = this.ensureForgeState();
    if (d) {
      d.activeForgeSession = null;
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }

    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`💨 Đã bỏ dở rèn 【${bpName}】, hoàn lại 50%: ${refundSummary}`, 'warn');
    }
    return refundSummary;
  },

  /**
   * Cập nhật vật lý Khống Hỏa (100% hàm xác định theo thời gian, KHÔNG Math.random!)
   */
  updateForgeTick(dtMs) {
    if (!this.isForging()) return;
    const s = this.session;
    const cfg = window.TuTien.CONFIG.forge;
    const dt = Math.min(0.05, dtMs / 1000);
    s.elapsedSec += dt;

    // 1. Vùng xanh mục tiêu di chuyển theo hàm sin/cos cố định gắn với mẫu Pháp Bảo
    const pat = s.blueprint.targetPattern;
    const t = s.elapsedSec;
    const targetCenter = Math.max(
      14,
      Math.min(86, pat.baseCenter + Math.sin(t * pat.freq1) * pat.amp1 + Math.cos(t * pat.freq2) * pat.amp2)
    );
    const halfW = pat.width * 0.5;
    s.targetMin = Math.max(2, targetCenter - halfW);
    s.targetMax = Math.min(98, targetCenter + halfW);

    // 2. Nhiệt độ tự biến động theo hàm cố định (không random)
    const naturalDrift = Math.cos(t * 1.15) * 18 + Math.sin(t * 2.2) * 9 - 5;

    if (s.autoMode) {
      // Chế độ Tự Động Rèn: máy tự giữ nhiệt nhưng bị giới hạn điểm tối đa & không có Đốn Ngộ
      const autoCap = this.computeAutoForgeCapPct();
      const desiredRatio = autoCap / 100;
      const curRatio = s.elapsedSec > 0 ? s.inZoneSec / s.elapsedSec : desiredRatio;
      const aimOffset = curRatio > desiredRatio ? halfW + 4 : 0;
      const aimHeat = targetCenter + (Math.sin(t * 1.3) >= 0 ? aimOffset : -aimOffset);
      s.heat += (aimHeat - s.heat) * Math.min(1, dt * 4.5);
    } else {
      const guard = window.TuTien.InputGuard;
      const addFire = guard && guard.isActionHeld('addFire');
      const fanWind = guard && guard.isActionHeld('fanWind');
      const focusHeld = guard && guard.isActionHeld('focusCalm') && s.focusEnergy > 1;

      let driftFactor = 1.0;
      if (focusHeld) {
        s.focusEnergy = Math.max(0, s.focusEnergy - (cfg.focusDrainPerSec || 28) * dt);
        driftFactor = 0.22; // Ngưng thần làm kim nhiệt cực kỳ ổn định!
      } else {
        s.focusEnergy = Math.min(100, s.focusEnergy + (cfg.focusRegenPerSec || 22) * dt);
      }

      let deltaHeat = naturalDrift * driftFactor;
      if (addFire) deltaHeat += cfg.heatRisePerSec || 36;
      if (fanWind) deltaHeat -= cfg.heatCoolPerSec || 38;

      s.heat = Math.max(0, Math.min(100, s.heat + deltaHeat * dt));
    }

    // 3. Chấm điểm % thời gian giữ kim trong vùng xanh + Đốn Ngộ
    const inZone = s.heat >= s.targetMin && s.heat <= s.targetMax;
    if (inZone) {
      s.inZoneSec += dt;
      if (!s.autoMode) {
        s.currentStreakSec += dt;
        if (s.currentStreakSec > s.maxStreakSec) s.maxStreakSec = s.currentStreakSec;
        if (!s.hasDonNgo && s.currentStreakSec >= (cfg.donNgoStreakSec || 5.5)) {
          s.hasDonNgo = true;
          if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(4);
        }
      }
    } else {
      s.currentStreakSec = 0;
    }

    let rawPct = s.elapsedSec > 0 ? (s.inZoneSec / s.elapsedSec) * 100 : 100;
    if (s.autoMode) {
      rawPct = Math.min(this.computeAutoForgeCapPct(), rawPct);
    }
    s.fireScorePct = Math.max(0, Math.min(100, Math.round(rawPct)));

    // 4. Hoàn thành khi hết thời gian rèn
    if (s.elapsedSec >= s.durationSec) {
      this.finishForging();
    }
  },

  finishForging() {
    const s = this.session;
    if (!s) return;

    const finalTier = this.computeFinalTier(s.analysis.baseTier, s.blueprint, s.fireScorePct, s.hasDonNgo);
    const gradeObj = this.getGradeObj(finalTier);
    const smithRank = this.getSmithRank();
    const talMult = this.getSmithTalentMult();

    // Công thức tổng quát: phẩm giai × số lượng × năng khiếu & cấp Luyện Khí
    const qtyScale = 0.65 + (s.analysis.totalQty / 20) * 0.55;
    const rankScale = 1 + (smithRank - 1) * 0.22;
    const powerScore = gradeObj.mult * qtyScale * rankScale * (0.85 + talMult * 0.15);

    const baseStat = 0.08 * powerScore;
    const passiveBonus = Number((s.blueprint.primaryStat === 'passive' || s.blueprint.primaryStat === 'balanced' ? baseStat * 1.18 : baseStat).toFixed(3));
    const clickBonus = Number((s.blueprint.primaryStat === 'click' || s.blueprint.primaryStat === 'balanced' ? baseStat * 1.18 : baseStat).toFixed(3));

    const combatHp = Math.round(65 * powerScore * (s.blueprint.primaryStat === 'defense' ? 1.25 : 1.0));
    const combatMp = Math.round(45 * powerScore);
    const combatAtk = Math.round(18 * powerScore * (s.blueprint.primaryStat === 'click' ? 1.25 : 1.0));
    const combatSpd = Math.round(4 * powerScore);

    // Tính giá trị thực của các Đạo Vận đã kích hoạt
    const affixesFinal = s.analysis.affixes.map(af => {
      const scaledVal = af.baseValue * (0.8 + gradeObj.mult * 0.16);
      return {
        element: af.element,
        name: af.name,
        statKey: af.statKey,
        level: af.level,
        levelLabel: af.levelLabel,
        value: Number(scaledVal.toFixed(3)),
        text: af.def.format(scaledVal)
      };
    });

    const affixDesc = affixesFinal.map(a => a.text).join(' • ');
    const elMeta = (window.TuTien.ELEMENT_META && window.TuTien.ELEMENT_META[s.analysis.dominantElement]) || { name: 'Kim' };

    const artifact = {
      category: 'artifact',
      templateId: s.blueprint.id,
      slot: s.blueprint.slot,
      shape: s.blueprint.shape,
      dominantElement: s.analysis.dominantElement,
      name: `${s.blueprint.name} (${elMeta.name})`,
      icon: (window.TuTien.ARTIFACT_SLOTS.find(sl => sl.id === s.blueprint.slot) || { icon: '⚔️' }).icon,
      qualityTier: gradeObj.tier,
      qualityName: gradeObj.name,
      qualityColor: gradeObj.color,
      mult: gradeObj.mult,
      passiveBonus,
      clickBonus,
      combatStats: { hp: combatHp, mp: combatMp, attack: combatAtk, speed: combatSpd },
      affixes: affixesFinal,
      fireScorePct: s.fireScorePct,
      hasDonNgo: s.hasDonNgo,
      equipped: false,
      effectDesc: `+${Math.round(passiveBonus * 100)}% Nền • +${Math.round(clickBonus * 100)}% Click • ⚔️+${combatAtk} Công • ❤️+${combatHp} Máu${affixDesc ? ' • ' + affixDesc : ''}`
    };

    s.status = 'completed';
    s.resultArtifact = artifact;

    // Ghi vào Đồ Phổ nếu rèn thành công lần đầu
    const d = this.ensureForgeState();
    if (d) {
      d.activeForgeSession = null;
      if (!d.forgeCodex[s.blueprint.id]) {
        d.forgeCodex[s.blueprint.id] = {
          bestTier: gradeObj.tier,
          count: 1
        };
      } else {
        d.forgeCodex[s.blueprint.id].count += 1;
        d.forgeCodex[s.blueprint.id].bestTier = Math.max(d.forgeCodex[s.blueprint.id].bestTier, gradeObj.tier);
      }
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }

    if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(gradeObj.tier);
    if (window.TuTien.CraftUI) window.TuTien.CraftUI.renderAll();
  },

  collectCompletedArtifact() {
    if (!this.session || this.session.status !== 'completed' || !this.session.resultArtifact) return null;
    const art = this.session.resultArtifact;
    const Inv = window.TuTien.Inventory;
    if (Inv) {
      const bag = Inv.getBagData();
      art.uid = bag.nextUid++;
      // Tự trang bị nếu ô trang bị cùng loại (slot) đang trống
      const sameSlotEquipped = bag.items.some(it => it.category === 'artifact' && it.equipped && it.slot === art.slot);
      art.equipped = !sameSlotEquipped;
      bag.items.unshift(art);
    }

    const snapshot = this.session.slotsSnapshot;
    const bpId = this.session.blueprint.id;
    this.session = null;

    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    return { art, snapshot, bpId };
  },

  // ---------------------------------------------------------------------------
  // 4. HOẠT ĐỘNG AFK "KHAI KHOÁNG" (TỰ CHẠY THEO THỜI GIAN & TÍNH KHI OFFLINE)
  // ---------------------------------------------------------------------------

  getUnlockedMiningMaterials() {
    const rank = this.getSmithRank();
    return (window.TuTien.FORGE_MATERIALS_EXT || []).filter(m => (m.minRank || 1) <= rank);
  },

  updateMining(dtMs) {
    const d = this.ensureForgeState();
    if (!d || !d.mining || !d.mining.enabled) return;

    const intervalMs = ((window.TuTien.CONFIG && window.TuTien.CONFIG.mining && window.TuTien.CONFIG.mining.baseIntervalSec) || 12) * 1000;
    d.mining.accumulatorMs += dtMs;

    if (d.mining.accumulatorMs >= intervalMs) {
      const cycles = Math.floor(d.mining.accumulatorMs / intervalMs);
      d.mining.accumulatorMs -= cycles * intervalMs;
      this.grantMiningCycles(cycles);
    }
  },

  grantMiningCycles(cycles) {
    const d = this.ensureForgeState();
    if (!d || cycles <= 0) return {};
    const pool = this.getUnlockedMiningMaterials();
    if (!pool.length) return {};

    const gained = {};
    const qtyPerCycle = 1 + Math.floor(this.getSmithRank() / 4);
    for (let i = 0; i < cycles; i++) {
      // Xoay vòng xác định qua danh sách linh tài đã mở khóa
      const mat = pool[d.mining.cycleIndex % pool.length];
      d.mining.cycleIndex += 1;
      d.mining.totalMined += qtyPerCycle;
      this.addMaterialQty(mat.id, qtyPerCycle);
      gained[mat.id] = (gained[mat.id] || 0) + qtyPerCycle;
    }
    return gained;
  },

  applyOfflineMining(offlineSec) {
    const d = this.ensureForgeState();
    if (!d || !d.mining || !d.mining.enabled || offlineSec < 12) return null;

    const maxHours = (window.TuTien.CONFIG && window.TuTien.CONFIG.mining && window.TuTien.CONFIG.mining.maxOfflineMiningHours) || 12;
    const cappedSec = Math.min(offlineSec, maxHours * 3600);
    const intervalSec = (window.TuTien.CONFIG && window.TuTien.CONFIG.mining && window.TuTien.CONFIG.mining.baseIntervalSec) || 12;
    const cycles = Math.floor(cappedSec / intervalSec);
    if (cycles <= 0) return null;

    return this.grantMiningCycles(cycles);
  },

  update(dtMs) {
    this.updateMining(dtMs);
    if (this.isForging()) {
      this.updateForgeTick(dtMs);
      if (window.TuTien.CraftUI && window.TuTien.CraftUI.isOpen) {
        window.TuTien.CraftUI.updateLiveForgeHUD();
      }
    }
  }
};
