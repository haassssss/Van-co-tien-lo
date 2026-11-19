/**
 * js/loadout.js
 * Quản lý 4 ô trang bị Chiến Kỹ (khóa khi đang chiến đấu) và tổng hợp Buff Đi Kèm từ 4 ô.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Loadout = {
  ensureState() {
    const State = window.TuTien.State;
    if (!State || !State.data) return ['thuong_quyen', 'hoi_xuan_so_cap', null, null];
    if (window.TuTien.Techniques) window.TuTien.Techniques.ensureState();
    if (!Array.isArray(State.data.combatLoadout) || State.data.combatLoadout.length !== 4) {
      State.data.combatLoadout = ['thuong_quyen', 'hoi_xuan_so_cap', null, null];
    }
    return State.data.combatLoadout;
  },

  isLocked() {
    return !!(window.TuTien.Combat && window.TuTien.Combat.isActive());
  },

  equipToSlot(slotIdx, techId) {
    if (this.isLocked()) {
      if (window.TuTien.UI) window.TuTien.UI.showToast('🔒 Đang trong trận chiến, không thể thay đổi 4 ô Chiến Kỹ!', 'warn');
      return false;
    }
    if (slotIdx < 0 || slotIdx > 3) return false;
    if (techId && !window.TuTien.Techniques.isLearned(techId)) return false;
    if (techId) {
      const useInfo = window.TuTien.Techniques.getUsability(techId);
      if (!useInfo.canUse) {
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(`🔒 Cảnh giới chưa đủ để trang bị công pháp này (${useInfo.label})!`, 'warn');
        }
        return false;
      }
    }

    const slots = this.ensureState();
    // Nếu công pháp đã nằm ở ô khác thì hoán đổi
    const prevIdx = techId ? slots.indexOf(techId) : -1;
    if (prevIdx !== -1 && prevIdx !== slotIdx) {
      slots[prevIdx] = slots[slotIdx];
    }
    slots[slotIdx] = techId || null;
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    return true;
  },

  /**
   * Tổng hợp toàn bộ Buff Đi Kèm từ 4 Công Pháp đang trang bị (nhân theo hệ số phẩm giai)
   */
  getActivePassiveBonuses() {
    const slots = this.ensureState();
    const Tech = window.TuTien.Techniques;
    const res = {
      atkPct: 0, defPct: 0, spdPct: 0, hpPct: 0,
      statusResist: 0, mpRegenPct: 0,
      elemDmg: {},
      labels: []
    };

    slots.forEach(id => {
      if (!id) return;
      const def = Tech.getDef(id);
      if (!def || !def.buffDiKem) return;
      const tier = Tech.getGradeTier(id) || 1;
      const gradeMult = Tech.getGradeObj(tier).mult || 1.0;
      const val = Number((def.buffDiKem.value * (0.8 + gradeMult * 0.2)).toFixed(3));
      const stat = def.buffDiKem.stat;

      if (stat.startsWith('elemDmg_')) {
        const el = stat.slice(8);
        res.elemDmg[el] = (res.elemDmg[el] || 0) + val;
      } else if (res[stat] !== undefined) {
        res[stat] += val;
      }
      res.labels.push(`${def.ten}: +${Math.round(val * 100)}% (${def.buffDiKem.label})`);
    });
    return res;
  }
};
