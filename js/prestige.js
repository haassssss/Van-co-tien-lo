/**
 * js/prestige.js
 * Xử lý hệ thống Chuyển Sinh (Prestige):
 * - Nhận Đạo Vận theo cảnh giới đã đạt
 * - Chuyển đổi giới tính (Nam Tu Sĩ <-> Nữ Tiên Tử) & cho phép chọn lại Chính Đạo / Ma Đạo ở kiếp mới
 * - Thức tỉnh ngẫu nhiên Linh Căn mới, Tư Chất mới và Năng Khiếu Lĩnh Vực mới
 * - Giữ lại một phần kinh nghiệm các Lĩnh Vực (mặc định 20% trong config.js) và giữ nguyên chỉ số Tẩy Tủy vĩnh viễn.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Prestige = {
  canPrestige() {
    const cfg = window.TuTien.CONFIG;
    return window.TuTien.State.data.realmIndex >= cfg.minRealmIndexForPrestige;
  },

  calculatePendingDaoVan() {
    if (!this.canPrestige()) return 0;
    const cfg = window.TuTien.CONFIG;
    const realmIdx = window.TuTien.State.data.realmIndex;
    const minIdx = cfg.minRealmIndexForPrestige || 60; // Độ Kiếp - Sơ Kỳ
    const extraRealms = Math.max(0, realmIdx - minIdx);
    return 200 + extraRealms * 10;
  },

  rollRandomRoot(excludeRootId = null) {
    const roots = window.TuTien.ROOTS;
    const pool = excludeRootId ? roots.filter(r => r.id !== excludeRootId) : roots;
    const totalWeight = pool.reduce((sum, r) => sum + r.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const root of pool) {
      if (rand < root.weight) {
        return root;
      }
      rand -= root.weight;
    }
    return pool[0];
  },

  performPrestige() {
    if (!this.canPrestige()) return false;

    const state = window.TuTien.State;
    const data = state.data;
    const gainedDaoVan = this.calculatePendingDaoVan();
    const newRoot = this.rollRandomRoot();
    const newAptitude = window.TuTien.Character.rollRandomAptitude();
    const newTalents = window.TuTien.Character.rollFieldTalents();
    const newGender = window.TuTien.Character.resolvePrestigeGender();

    data.prestige.count += 1;
    data.prestige.daoVan += gainedDaoVan;
    data.prestige.totalDaoVanEarned += gainedDaoVan;
    data.prestige.rootId = newRoot.id;

    data.character.gender = newGender;
    data.character.aptitudeId = newAptitude.id;
    data.character.rerollCount = 0;
    // Cho phép chọn lại Chính Đạo hoặc Ma Đạo ở kiếp mới
    data.character.hasChosenFaction = false;

    if (window.TuTien.Fields) {
      window.TuTien.Fields.handlePrestigeRetention(newTalents);
    }

    data.qi = 0;
    data.totalQiThisRun = 0;
    data.realmIndex = 0;
    data.pityFailCount = 0;
    data.upgrades = {};
    data.upgradeQualities = {};

    state.resetRuntime();

    const genderLabel = newGender === 'female' ? 'Nữ Tiên Tử' : 'Nam Tu Sĩ';
    state.addLog(
      `☯️ Chuyển Sinh kiếp thứ ${data.prestige.count} (${genderLabel})! +${gainedDaoVan} Đạo Vận • Linh Căn: 【${newRoot.name}】 • Tư Chất: 【${newAptitude.name} (x${newAptitude.multiplier})】!`,
      'success'
    );

    if (window.TuTien.Events) {
      window.TuTien.Events.checkAchievements();
    }
    if (window.TuTien.Save) {
      window.TuTien.Save.saveToLocal();
    }
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(
        `Chuyển sinh (${genderLabel})! +${gainedDaoVan} Đạo Vận • Tư chất: ${newAptitude.name}`,
        'success'
      );
      window.TuTien.UI.updateAll();
      window.TuTien.UI.checkFactionSelectionModal();
    }
    if (window.TuTien.Profile) {
      window.TuTien.Profile.render();
    }
    return true;
  }
};
