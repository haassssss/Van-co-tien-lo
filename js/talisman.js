/**
 * js/talisman.js
 * Hệ thống Luyện Phù XÁC ĐỊNH 100% (KHÔNG NGẪU NHIÊN):
 * - 3 ô nguyên liệu: Phù Chỉ (số lá & trần phẩm), Chu Sa / Mực (hệ & loại phù; >=10% kích hoạt, >=30% tối đa), Phụ Liệu tùy chọn (kéo dài thời gian).
 * - Màn "Họa Phù": vẽ MỘT lá mẫu trên Canvas bằng chuột/cảm ứng, cả mẻ phù sao theo chất lượng lá mẫu.
 * - Điểm = Độ phủ đường mẫu × (1 - Độ lệch trung bình). Điểm >= 95% đạt "Phù Văn Hoàn Mỹ" (+1 phẩm giai).
 * - "Tự Động Họa": máy tự vẽ trên canvas, điểm tối đa 70% (theo cấp Phù Lục & tư chất), không có Hoàn Mỹ.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Talisman = {
  session: null,

  ensureTalismanState() {
    const State = window.TuTien.State;
    if (!State || !State.data) return null;
    const d = State.data;
    if (!d.talismanMaterials || typeof d.talismanMaterials !== 'object') {
      d.talismanMaterials = {
        hoang_chi: 12,
        thanh_linh_chi: 6,
        chu_sa_hoa: 10,
        thanh_loi_mac: 8,
        canh_kim_mac: 6,
        huyet_yeu_lang: 8,
        noc_huyet_doc_xa: 6,
        huyet_hac_hung: 4,
        huyet_xich_ho: 4,
        yeu_dan_phan: 4,
        hau_tho_mac: 6,
        tung_huong_phan: 6
      };
    }
    return d;
  },

  getMatDef(id) {
    return (window.TuTien.TALISMAN_MATERIALS || []).find(m => m.id === id) || null;
  },

  getMatQty(id) {
    const d = this.ensureTalismanState();
    return d ? Math.max(0, Math.floor(d.talismanMaterials[id] || 0)) : 0;
  },

  addMatQty(id, qty) {
    const d = this.ensureTalismanState();
    if (!d || qty <= 0) return;
    d.talismanMaterials[id] = Math.max(0, Math.floor((d.talismanMaterials[id] || 0) + qty));
  },

  consumeMatQty(id, qty) {
    const d = this.ensureTalismanState();
    if (!d || qty <= 0) return false;
    const have = this.getMatQty(id);
    if (have < qty) return false;
    d.talismanMaterials[id] = have - qty;
    return true;
  },

  getTalismanRank() {
    if (window.TuTien.Fields && typeof window.TuTien.Fields.getFieldState === 'function') {
      return window.TuTien.Fields.getFieldState('phu_luc').rank || 1;
    }
    return 1;
  },

  getTalismanTalentMult() {
    if (window.TuTien.Fields && typeof window.TuTien.Fields.getFieldTalentObj === 'function') {
      return window.TuTien.Fields.getFieldTalentObj('phu_luc').multiplier || 1.0;
    }
    return 1.0;
  },

  computeAutoCapPct() {
    const cfg = window.TuTien.CONFIG.talisman;
    const rank = this.getTalismanRank();
    const tal = this.getTalismanTalentMult();
    return Math.min(cfg.autoMaxScorePct || 70, 50 + (rank - 1) * 2 + Math.round((tal - 1) * 4));
  },

  analyzeInputs(paperSlot, inkSlot, addonSlot) {
    const pDef = paperSlot && paperSlot.matId ? this.getMatDef(paperSlot.matId) : null;
    const iDef = inkSlot && inkSlot.matId ? this.getMatDef(inkSlot.matId) : null;
    const aDef = addonSlot && addonSlot.matId ? this.getMatDef(addonSlot.matId) : null;

    const pQty = pDef ? Math.floor(paperSlot.qty || 0) : 0;
    const iQty = iDef ? Math.floor(inkSlot.qty || 0) : 0;
    const aQty = aDef ? Math.floor(addonSlot.qty || 0) : 0;

    if (!pDef || pQty <= 0 || !iDef || iQty <= 0) {
      return {
        valid: false,
        matchedTemplates: [],
        missingReason: 'Cần chọn ít nhất 1 Phù Chỉ (Ô 1) và 1 Chu Sa / Mực (Ô 2) để định hình Phù Văn.'
      };
    }

    const totalMat = pQty + iQty + aQty;
    const inkRatio = iQty / totalMat;
    if (inkRatio < 0.10) {
      return {
        valid: false,
        matchedTemplates: [],
        missingReason: 'Lượng Chu Sa / Mực phải chiếm ít nhất 10% tổng nguyên liệu để kích hoạt hệ Phù!'
      };
    }

    const isMaxInkEffect = inkRatio >= 0.30;
    const matchedTemplates = (window.TuTien.TALISMAN_TEMPLATES || []).filter(t => {
      const elOk = t.element === iDef.element;
      const tierOk = !t.minPaperTier || pDef.tier >= t.minPaperTier;
      return elOk && tierOk;
    });

    const durationMult = 1 + (aDef && aQty > 0 ? (aDef.durationBonusPct || 0.25) : 0);
    const maxGrade = Math.min(5, pDef.maxGrade || 3, Math.max(2, Math.ceil(this.getTalismanRank() / 2) + 1));

    return {
      valid: matchedTemplates.length > 0,
      paperDef: pDef,
      paperQty: pQty,
      inkDef: iDef,
      inkQty: iQty,
      inkRatioPct: Math.round(inkRatio * 100),
      isMaxInkEffect,
      addonDef: aDef,
      addonQty: aQty,
      durationMult,
      leafCount: pQty,
      baseGrade: Math.min(maxGrade, pDef.tier),
      maxGrade,
      matchedTemplates,
      missingReason: matchedTemplates.length ? '' : 'Chưa có mẫu Phù nào khớp với loại Mực và Phù Chỉ này.'
    };
  },

  isDrawing() {
    return !!(this.session && this.session.status === 'drawing');
  },

  checkPendingAbandonedSessionOnLoad() {
    const d = this.ensureTalismanState();
    if (!d || !d.activeTalismanSession) return;
    const saved = d.activeTalismanSession;
    d.activeTalismanSession = null;
    const refund = this.refundAbandoned(saved.entries || []);
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    setTimeout(() => {
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(`📜 Lần trước bạn rời Phù Án khi đang vẽ dở nên mất 50%! Đã hoàn: ${refund}`, 'warn');
      }
    }, 1300);
  },

  refundAbandoned(entries) {
    const penalty = (window.TuTien.CONFIG && window.TuTien.CONFIG.talisman && window.TuTien.CONFIG.talisman.abandonPenalty) || 0.5;
    const parts = [];
    (entries || []).forEach(ent => {
      const keep = Math.ceil(ent.qty * (1 - penalty));
      if (keep > 0) {
        this.addMatQty(ent.matId, keep);
        const def = this.getMatDef(ent.matId);
        parts.push(`${def ? def.icon : '📜'} ${def ? def.name : ent.matId} ×${keep}`);
      }
    });
    return parts.join(', ');
  },

  startDrawing(paperSlot, inkSlot, addonSlot, templateId, autoMode = false) {
    if (this.isDrawing()) return false;
    const analysis = this.analyzeInputs(paperSlot, inkSlot, addonSlot);
    if (!analysis.valid) return false;

    const tpl = analysis.matchedTemplates.find(t => t.id === templateId) || analysis.matchedTemplates[0];
    const entries = [
      { matId: analysis.paperDef.id, qty: analysis.paperQty },
      { matId: analysis.inkDef.id, qty: analysis.inkQty }
    ];
    if (analysis.addonDef && analysis.addonQty > 0) {
      entries.push({ matId: analysis.addonDef.id, qty: analysis.addonQty });
    }

    for (const ent of entries) {
      if (this.getMatQty(ent.matId) < ent.qty) return false;
    }
    entries.forEach(ent => this.consumeMatQty(ent.matId, ent.qty));

    this.session = {
      status: 'drawing', // 'drawing' | 'completed'
      autoMode: !!autoMode,
      tpl,
      analysis,
      entries,
      slotsSnapshot: {
        paper: { ...paperSlot },
        ink: { ...inkSlot },
        addon: addonSlot ? { ...addonSlot } : null
      },
      activeStrokeIdx: 0,
      strokeScores: [],
      autoProgress: 0,
      finalScorePct: 0,
      isPerfect: false,
      resultTalisman: null
    };

    const d = this.ensureTalismanState();
    if (d) {
      d.activeTalismanSession = { tplId: tpl.id, entries };
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }
    return true;
  },

  abandonDrawing() {
    if (!this.isDrawing()) return '';
    const refund = this.refundAbandoned(this.session.entries);
    this.session = null;
    const d = this.ensureTalismanState();
    if (d) {
      d.activeTalismanSession = null;
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`💨 Đã bỏ dở họa phù, hoàn lại 50% nguyên liệu: ${refund}`, 'warn');
    }
    return refund;
  },

  /**
   * Chấm điểm 1 nét người chơi vẽ trên Canvas: Điểm = Độ phủ đường mẫu × (1 - Độ lệch trung bình) — 100% xác định!
   */
  evaluateStroke(userPoints, canvasW, canvasH) {
    if (!this.isDrawing() || this.session.autoMode) return;
    const s = this.session;
    const tplPts = s.tpl.strokes[s.activeStrokeIdx];
    if (!tplPts || !userPoints || userPoints.length < 3) return;

    // Lấy mẫu 24 điểm đều dọc theo đường mẫu chuẩn
    const samplePts = [];
    for (let i = 0; i < tplPts.length - 1; i++) {
      const a = { x: tplPts[i][0] * canvasW, y: tplPts[i][1] * canvasH };
      const b = { x: tplPts[i + 1][0] * canvasW, y: tplPts[i + 1][1] * canvasH };
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        samplePts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      }
    }

    const tol = Math.max(26, canvasW * 0.12);
    let covered = 0;
    samplePts.forEach(sp => {
      let minD = Infinity;
      for (let j = 0; j < userPoints.length; j++) {
        const d = Math.hypot(userPoints[j].x - sp.x, userPoints[j].y - sp.y);
        if (d < minD) minD = d;
      }
      if (minD <= tol) covered += 1;
    });
    const coverage = samplePts.length > 0 ? covered / samplePts.length : 0;

    // Tính độ lệch trung bình của các điểm người chơi so với đường mẫu
    let devSum = 0;
    userPoints.forEach(up => {
      let minD = Infinity;
      for (let j = 0; j < samplePts.length; j++) {
        const d = Math.hypot(samplePts[j].x - up.x, samplePts[j].y - up.y);
        if (d < minD) minD = d;
      }
      devSum += Math.min(1, minD / (tol * 1.4));
    });
    const avgDev = userPoints.length > 0 ? devSum / userPoints.length : 1;

    const strokeScore = Math.max(0, Math.min(100, Math.round(coverage * (1 - avgDev * 0.65) * 100)));
    s.strokeScores.push(strokeScore);
    s.activeStrokeIdx += 1;

    if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(strokeScore >= 85 ? 3 : 1);

    if (s.activeStrokeIdx >= s.tpl.strokes.length) {
      const avg = Math.round(s.strokeScores.reduce((a, b) => a + b, 0) / s.strokeScores.length);
      this.finishDrawing(avg);
    } else if (window.TuTien.TalismanUI) {
      window.TuTien.TalismanUI.renderAll();
    }
  },

  update(dtMs) {
    if (!this.isDrawing() || !this.session.autoMode) return;
    const s = this.session;
    s.autoProgress += dtMs / 1000;
    const totalSec = s.tpl.strokes.length * 1.6;
    const doneCount = Math.min(s.tpl.strokes.length, Math.floor((s.autoProgress / totalSec) * s.tpl.strokes.length));
    if (doneCount !== s.activeStrokeIdx) {
      s.activeStrokeIdx = doneCount;
      if (window.TuTien.TalismanUI && window.TuTien.TalismanUI.isOpen) {
        window.TuTien.TalismanUI.redrawCanvas();
      }
    }
    if (s.autoProgress >= totalSec) {
      this.finishDrawing(this.computeAutoCapPct());
    }
  },

  finishDrawing(scorePct) {
    const s = this.session;
    if (!s) return;
    const cfg = window.TuTien.CONFIG.talisman;
    s.finalScorePct = Math.max(0, Math.min(100, Math.round(scorePct)));
    s.isPerfect = !s.autoMode && s.finalScorePct >= (cfg.perfectScorePct || 95);

    let bonus = 0;
    if (s.finalScorePct >= 80) bonus += 1;
    if (s.isPerfect) bonus += 1; // Phù Văn Hoàn Mỹ (+1 phẩm giai)
    const penalty = s.finalScorePct < 35 ? 1 : 0;

    const finalTier = Math.max(1, Math.min(s.analysis.maxGrade, s.analysis.baseGrade + bonus - penalty));
    const gradeObj = (window.TuTien.FORGE_GRADES || []).find(g => g.tier === finalTier) || { tier: 1, name: 'Phàm Phẩm', color: '#cbd5e1', mult: 1 };

    const inkMult = s.analysis.isMaxInkEffect ? 1.35 : 1.0;
    const finalPower = Number((s.tpl.basePower * gradeObj.mult * inkMult * (s.isPerfect ? 1.25 : 1.0)).toFixed(2));
    const finalDuration = Math.round(s.tpl.baseDurationSec * s.analysis.durationMult);

    s.resultTalisman = {
      id: `${s.tpl.id}_t${finalTier}${s.isPerfect ? '_perf' : ''}`,
      name: `${s.tpl.name}${s.isPerfect ? ' ★Hoàn Mỹ' : ''}`,
      tier: finalTier,
      gradeName: gradeObj.name,
      color: gradeObj.color,
      count: s.analysis.leafCount,
      buffType: s.tpl.buffType,
      power: finalPower,
      durationSec: finalDuration,
      scorePct: s.finalScorePct,
      isPerfect: s.isPerfect,
      desc: `${s.tpl.desc} (${finalDuration}s • Độ chuẩn ${s.finalScorePct}%)`
    };

    s.status = 'completed';
    const d = this.ensureTalismanState();
    if (d) {
      d.activeTalismanSession = null;
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }
    if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(finalTier);
    if (window.TuTien.TalismanUI) window.TuTien.TalismanUI.renderAll();
  },

  collectCompletedTalismans() {
    if (!this.session || this.session.status !== 'completed' || !this.session.resultTalisman) return null;
    const t = this.session.resultTalisman;
    const Inv = window.TuTien.Inventory;
    if (Inv) {
      Inv.addStackableItem(
        'talisman',
        t.id,
        t.name,
        '📜',
        { tier: t.tier, name: t.gradeName, color: t.color, mult: 1 },
        t.desc,
        t.count,
        {
          customTimedBuff: {
            name: t.name,
            icon: '📜',
            color: t.color,
            buffType: t.buffType,
            power: t.power,
            durationSec: t.durationSec
          }
        }
      );
    }
    const snap = this.session.slotsSnapshot;
    const tplId = this.session.tpl.id;
    this.session = null;
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    return { talisman: t, snapshot: snap, tplId };
  }
};
