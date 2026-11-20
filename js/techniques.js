/**
 * js/techniques.js
 * Quản lý 26 Công Pháp Chiến Đấu:
 * - Phẩm chất cố định 7 bậc: Phàm Phẩm -> Hoàng Giai -> Huyền Giai -> Địa Giai -> Thiên Giai -> Tiên Phẩm -> Thánh Phẩm.
 * - KHÔNG thể thăng giai; chỉ có thể kiếm công pháp phẩm chất cao hơn từ quái, boss, bí cảnh.
 * - Giới hạn cảnh giới:
 *   + Dưới Luyện Khí (<10): Phàm Phẩm (1)
 *   + Dưới Tử Phủ (<20): Hoàng Giai trở xuống (<=2)
 *   + Dưới Kim Thân (<30): Huyền Giai trở xuống (<=3)
 *   + Dưới Hóa Thần (<40): Địa Giai & Thiên Giai trở xuống (<=5)
 *   + Dưới Hợp Thể (<50): Tiên Phẩm trở xuống (<=6)
 *   + Dưới Độ Kiếp & cao hơn (>=50): Thánh Phẩm trở xuống (tất cả <=7)
 * - Vượt 1 bậc trên mức cảnh giới: dùng được nhưng chỉ phát huy 15% uy lực.
 * - Vượt từ 2 bậc trở lên: không thể sử dụng / trang bị.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Techniques = {
  ensureState() {
    const State = window.TuTien.State;
    if (!State || !State.data) return null;
    const d = State.data;
    if (!d.combatTechniques || typeof d.combatTechniques !== 'object') {
      d.combatTechniques = {
        thuong_quyen: 1,
        hoi_xuan_so_cap: 1
      };
    }
    if (!d.combatTechniques.thuong_quyen) d.combatTechniques.thuong_quyen = 1;
    if (!d.combatTechniques.hoi_xuan_so_cap) d.combatTechniques.hoi_xuan_so_cap = 1;
    return d.combatTechniques;
  },

  getDef(id) {
    return (window.TuTien.COMBAT_TECHNIQUES || []).find(t => t.id === id) || null;
  },

  getGradeObj(tier) {
    const list = (window.TuTien.CONFIG && window.TuTien.CONFIG.TECH_GRADES) || [
      { tier: 1, id: 'pham', name: 'Phàm Phẩm', color: '#cbd5e1', mult: 1.0, reqRealmIdx: 0, reqRealmName: 'Thối Thể - Sơ Kỳ' }
    ];
    return list.find(g => g.tier === tier) || list[0];
  },

  isLearned(id) {
    const s = this.ensureState();
    return !!(s && s[id]);
  },

  // Phẩm chất cố định theo bản thể công pháp (không thăng giai)
  getGradeTier(id) {
    const def = this.getDef(id);
    if (!def) return 1;
    return def.phamGiaiKhoiDau || 1;
  },

  getMaxFullTierForRealm(realmIdx) {
    const r = Number(realmIdx) || 0;
    if (r < 10) return 1; // Dưới Luyện Khí: Phàm Phẩm
    if (r < 20) return 2; // Dưới Tử Phủ: Hoàng Giai
    if (r < 30) return 3; // Dưới Kim Thân: Huyền Giai
    if (r < 40) return 5; // Dưới Hóa Thần: Địa Giai & Thiên Giai
    if (r < 50) return 6; // Dưới Hợp Thể: Tiên Phẩm
    return 7;             // Hợp Thể trở lên: Thánh Phẩm (tất cả)
  },

  getUsability(id, realmIdx = null) {
    const def = this.getDef(id);
    if (!def) return { canUse: false, powerMult: 0, status: 'locked', label: 'Không tồn tại' };
    if (def.yeuCauDaoLo) {
      const curFac = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.character && window.TuTien.State.data.character.faction) || 'chinh_dao';
      if (curFac !== def.yeuCauDaoLo) {
        const facName = def.yeuCauDaoLo === 'ma_dao' ? 'Ma Đạo' : 'Chính Đạo';
        return { canUse: false, powerMult: 0, status: 'locked', label: `Chỉ dành cho ${facName}`, reqName: facName };
      }
    }
    const rIdx = realmIdx !== null
      ? realmIdx
      : ((window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.realmIndex) || 0);
    const tier = def.phamGiaiKhoiDau || 1;
    const maxFull = this.getMaxFullTierForRealm(rIdx);
    const gr = this.getGradeObj(tier);

    if (tier <= maxFull) {
      return { canUse: true, powerMult: 1.0, status: 'full', label: '100% Uy Lực', reqName: gr.reqRealmName || '' };
    }
    if (tier === maxFull + 1) {
      return { canUse: true, powerMult: 0.15, status: 'weakened', label: 'Vượt bậc (15% uy lực)', reqName: gr.reqRealmName || '' };
    }
    return { canUse: false, powerMult: 0, status: 'locked', label: `Cần ${gr.reqRealmName || 'cảnh giới cao hơn'}`, reqName: gr.reqRealmName || '' };
  },

  grantTechnique(id, sourceLabel = '') {
    const s = this.ensureState();
    const def = this.getDef(id);
    if (!s || !def) return false;
    if (s[id]) return false;
    s[id] = def.phamGiaiKhoiDau || 1;
    const gr = this.getGradeObj(s[id]);
    if (window.TuTien.State) {
      window.TuTien.State.addLog(`📜 Lĩnh ngộ Chiến Kỹ 【${def.ten} — ${gr.name}】${sourceLabel ? ` (${sourceLabel})` : ''}!`, 'success');
    }
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`📜 Nhận Chiến Kỹ: ${def.ten} [${gr.name}]!`, 'success');
    }
    return true;
  },

  learnFromDrop(id) {
    return this.grantTechnique(id, 'Rơi từ chiến đấu');
  },

  buyLearn() {
    if (window.TuTien.UI) window.TuTien.UI.showToast('Chiến Kỹ cần tự kiếm từ Quái, Boss hoặc Bí Cảnh!', 'info');
    return false;
  },

  getUpgradeCost() {
    return Infinity;
  },

  canUpgrade() {
    return false;
  },

  upgradeGrade() {
    if (window.TuTien.UI) window.TuTien.UI.showToast('Công pháp chiến đấu có phẩm chất cố định, không thể thăng giai!', 'info');
    return false;
  }
};
