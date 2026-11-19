/**
 * js/status.js
 * Xử lý logic Hiệu Ứng Trạng Thái (Thiêu Đốt, Trúng Độc, Đóng Băng + miễn nhiễm 2 hiệp,
 * Xích Khóa, Trói Buộc, Suy Yếu, Phá Giáp, Trì Hoãn, Buff) và Khắc Chế 7 Hệ.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Status = {
  getDef(id) {
    return (window.TuTien.STATUS_EFFECTS && window.TuTien.STATUS_EFFECTS[id]) || null;
  },

  getElementMultiplier(atkElem, defElem) {
    const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2) || {};
    if (cfg.elementAdvantage === false) return { mult: 1.0, label: '' };
    const eMap = window.TuTien.COMBAT_ELEMENTS || {};
    const a = eMap[atkElem];
    if (!a || !defElem) return { mult: 1.0, label: '' };
    if (Array.isArray(a.strongAgainst) && a.strongAgainst.includes(defElem)) {
      return { mult: cfg.advantageMult || 1.5, label: 'Khắc hệ!' };
    }
    if (Array.isArray(a.weakAgainst) && a.weakAgainst.includes(defElem)) {
      return { mult: cfg.disadvantageMult || 0.75, label: 'Bị khắc' };
    }
    return { mult: 1.0, label: '' };
  },

  applyEffect(targetUnit, effectId, turns, chancePct = 100) {
    const def = this.getDef(effectId);
    if (!def || !targetUnit) return { applied: false, reason: '' };
    if (!Array.isArray(targetUnit.statuses)) targetUnit.statuses = [];

    // Miễn nhiễm Đóng Băng 2 hiệp sau khi vừa tan băng để không bị khóa chết
    if (effectId === 'dong_bang' && (targetUnit.freezeImmunityTurns || 0) > 0) {
      return { applied: false, reason: 'Miễn nhiễm Đóng Băng' };
    }

    // Kiểm tra kháng hiệu ứng cho hiệu ứng gây hại (chỉ áp dụng khi tiLeHieuUng < 100 hoặc target có khangHieuUng)
    if (def.loai === 'gay_hai') {
      const resist = Math.min(0.85, Math.max(0, targetUnit.statusResist || 0));
      const effectiveChance = chancePct * (1 - resist);
      if (effectiveChance < 100) {
        const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2) || {};
        const roll = cfg.randomEnabled ? Math.random() * 100 : (effectiveChance >= 50 ? 0 : 100);
        if (roll > effectiveChance) {
          return { applied: false, reason: 'Kháng hiệu ứng' };
        }
      }
    }

    const dur = turns || def.soHiepMacDinh || 2;
    const existing = targetUnit.statuses.find(s => s.id === effectId);
    if (existing) {
      existing.turns = Math.max(existing.turns, dur);
      existing.stacks = Math.min(def.congDonToiDa || 1, (existing.stacks || 1) + 1);
    } else {
      targetUnit.statuses.push({ id: effectId, turns: dur, stacks: 1 });
    }
    return { applied: true, def };
  },

  cleanseHarmful(targetUnit) {
    if (!targetUnit || !Array.isArray(targetUnit.statuses)) return 0;
    const before = targetUnit.statuses.length;
    targetUnit.statuses = targetUnit.statuses.filter(s => {
      const def = this.getDef(s.id);
      return !(def && def.loai === 'gay_hai' && def.giaiTruDuoc);
    });
    return before - targetUnit.statuses.length;
  },

  hasFlag(unit, flagName) {
    if (!unit || !Array.isArray(unit.statuses)) return false;
    return unit.statuses.some(s => {
      const def = this.getDef(s.id);
      return !!(def && def[flagName]);
    });
  },

  getStatModifiers(unit) {
    let atkMod = 0, defMod = 0, spdMod = 0;
    if (unit && Array.isArray(unit.statuses)) {
      unit.statuses.forEach(s => {
        const def = this.getDef(s.id);
        if (!def) return;
        const st = s.stacks || 1;
        if (def.atkMod) atkMod += def.atkMod * st;
        if (def.defMod) defMod += def.defMod * st;
        if (def.spdMod) spdMod += def.spdMod * st;
      });
    }
    return {
      atkMult: Math.max(0.3, 1 + atkMod),
      defMult: Math.max(0.25, 1 + defMod),
      spdMult: Math.max(0.25, 1 + spdMod)
    };
  },

  /**
   * Xử lý sát thương theo hiệp (Thiêu Đốt, Trúng Độc) và giảm số hiệp còn lại ở cuối hiệp
   */
  processEndOfTurn(unit) {
    const logs = [];
    if (!unit || !Array.isArray(unit.statuses)) return logs;

    if ((unit.freezeImmunityTurns || 0) > 0) {
      unit.freezeImmunityTurns -= 1;
    }

    const nextList = [];
    unit.statuses.forEach(s => {
      const def = this.getDef(s.id);
      if (!def) return;

      if (def.dotHpPct && unit.currentHp > 0) {
        const dmg = Math.max(1, Math.round(unit.maxHp * def.dotHpPct * (s.stacks || 1)));
        unit.currentHp = Math.max(0, unit.currentHp - dmg);
        logs.push(`${def.icon} ${unit.name} chịu ${def.ten}${s.stacks > 1 ? ` (×${s.stacks})` : ''}: -${window.TuTien.Utils.formatNumber(dmg)} HP`);
      }

      s.turns -= 1;
      if (s.turns > 0) {
        nextList.push(s);
      } else if (s.id === 'dong_bang') {
        unit.freezeImmunityTurns = def.immunityAfterTurns || 2;
      }
    });

    unit.statuses = nextList;
    return logs;
  }
};
