/**
 * js/upgrades.js
 * Xử lý Công Pháp (Chính Đạo / Ma Đạo):
 * - Hỗ trợ Bí Tịch Công Pháp cần mở khóa trên Bản Đồ Xuất Quan (`requiresUnlock: true`)
 * - Giới hạn cấp tối đa mỗi cảnh giới: maxLevel = (realmIndex + 1) * config.upgradeLevelsPerRealm
 * - Mỗi Công Pháp có 5 bậc Phẩm Chất (Hạ Phẩm x1.0 -> Tiên Phẩm x4.5)
 */
window.TuTien = window.TuTien || {};

window.TuTien.Upgrades = {
  resolveDef(defOrId) {
    if (!defOrId) return null;
    if (typeof defOrId === 'string') {
      return window.TuTien.UPGRADES.find(u => u.id === defOrId) || null;
    }
    return defOrId;
  },

  /**
   * Kiểm tra một cuốn Công Pháp đã được mở khóa chưa (7 cuốn đầu mở sẵn, 6 cuốn Bí Tịch cần tìm ở Xuất Quan)
   */
  isUnlocked(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef) return false;
    if (!upgradeDef.requiresUnlock) return true;
    const data = window.TuTien.State.data;
    if (data.upgrades && data.upgrades[upgradeDef.id] > 0) return true;
    return !!(data.unlockedTechniques && data.unlockedTechniques[upgradeDef.id]);
  },

  /**
   * Mở khóa một Bí Tịch Công Pháp (khi đánh Quái rớt hoặc mua từ Thương Nhân Bí Cảnh)
   */
  unlockTechnique(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef) return false;
    const data = window.TuTien.State.data;
    if (!data.unlockedTechniques) data.unlockedTechniques = {};
    const already = this.isUnlocked(upgradeDef);
    data.unlockedTechniques[upgradeDef.id] = true;
    if (!already && (!data.upgrades[upgradeDef.id] || data.upgrades[upgradeDef.id] === 0)) {
      data.upgrades[upgradeDef.id] = 1; // Tặng ngay Tầng 1 khi lĩnh ngộ Bí Tịch!
    }
    return !already;
  },

  getDisplayName(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef) return '';
    const faction = window.TuTien.Character
      ? window.TuTien.Character.getFactionId()
      : 'chinh_dao';
    if (faction === 'ma_dao' && upgradeDef.maName) return upgradeDef.maName;
    if (faction === 'chinh_dao' && upgradeDef.chinhName) return upgradeDef.chinhName;
    return upgradeDef.name;
  },

  getMaxLevelForCurrentRealm(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    const cfg = window.TuTien.CONFIG;
    const realmIdx = window.TuTien.State.data ? window.TuTien.State.data.realmIndex : 0;
    const perRealm = cfg.upgradeLevelsPerRealm || 3;
    const realmCap = (realmIdx + 1) * perRealm;
    if (upgradeDef && upgradeDef.maxLevel) {
      return Math.min(upgradeDef.maxLevel, realmCap);
    }
    return realmCap;
  },

  isCappedByCurrentRealm(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef) return false;
    const maxForRealm = this.getMaxLevelForCurrentRealm(upgradeDef);
    return window.TuTien.State.getUpgradeLevel(upgradeDef.id) >= maxForRealm;
  },

  getUpgradeQualityTier(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    const id = upgradeDef ? upgradeDef.id : defOrId;
    const data = window.TuTien.State.data;
    if (!data.upgradeQualities) {
      data.upgradeQualities = {};
    }
    return data.upgradeQualities[id] || 1;
  },

  getUpgradeQualityObj(defOrId) {
    const tier = this.getUpgradeQualityTier(defOrId);
    const list = window.TuTien.ITEM_QUALITIES || [
      { tier: 1, name: 'Hạ Phẩm', mult: 1.0, color: '#cbd5e1' }
    ];
    return list.find(q => q.tier === tier) || list[0];
  },

  getRefineQualityCost(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef) return Infinity;
    const tier = this.getUpgradeQualityTier(upgradeDef.id);
    if (tier >= 5) return Infinity;
    const base = window.TuTien.CONFIG.techniqueRefineBaseCost || 180;
    return Math.round((base + upgradeDef.baseCost * 3) * Math.pow(3.6, tier - 1));
  },

  canRefineQuality(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef || !this.isUnlocked(upgradeDef)) return false;
    const tier = this.getUpgradeQualityTier(upgradeDef.id);
    if (tier >= 5) return false;
    const cost = this.getRefineQualityCost(upgradeDef);
    return window.TuTien.State.data.qi >= cost;
  },

  refineUpgradeQuality(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef || !this.canRefineQuality(upgradeDef)) return false;

    const State = window.TuTien.State;
    const cost = this.getRefineQualityCost(upgradeDef);
    State.data.qi -= cost;

    const newTier = Math.min(5, this.getUpgradeQualityTier(upgradeDef.id) + 1);
    State.data.upgradeQualities[upgradeDef.id] = newTier;
    const qObj = this.getUpgradeQualityObj(upgradeDef.id);
    const dispName = this.getDisplayName(upgradeDef);

    if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(newTier);
    State.addLog(
      `📖 Thăng phẩm Công Pháp: 【${dispName}】 đạt tới phẩm chất 【${qObj.name} (x${qObj.mult})】!`,
      'success'
    );

    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(
        `${dispName} đã thăng lên [${qObj.name} (x${qObj.mult})]!`,
        'success',
        'happy'
      );
      window.TuTien.UI.updateAll();
    }
    return true;
  },

  getUpgradeCost(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef) return Infinity;
    const cfg = window.TuTien.CONFIG;
    const currentLevel = window.TuTien.State.getUpgradeLevel(upgradeDef.id);
    const mult = upgradeDef.costMultiplier || cfg.upgradeCostMultiplierDefault;
    return Math.round(upgradeDef.baseCost * Math.pow(mult, currentLevel));
  },

  isMaxed(defOrId) {
    return this.isCappedByCurrentRealm(defOrId);
  },

  canAfford(defOrId) {
    const upgradeDef = this.resolveDef(defOrId);
    if (!upgradeDef || !this.isUnlocked(upgradeDef) || this.isMaxed(upgradeDef)) return false;
    const cost = this.getUpgradeCost(upgradeDef);
    return window.TuTien.State.data.qi >= cost;
  },

  buyUpgrade(upgradeId) {
    const upgradeDef = this.resolveDef(upgradeId);
    if (!upgradeDef) return false;

    if (!this.isUnlocked(upgradeDef)) {
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(
          'Bí tịch này chưa mở khóa! Hãy vào Xuất Quan đánh Quái hoặc mua từ Vân Du Thương Nhân.',
          'warn'
        );
      }
      return false;
    }

    if (this.isMaxed(upgradeDef)) {
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(
          'Đã đạt giới hạn cấp Công Pháp của cảnh giới hiện tại! Hãy Đột Phá Cảnh Giới để nâng tiếp.',
          'warn'
        );
      }
      return false;
    }

    if (!this.canAfford(upgradeDef)) return false;

    const state = window.TuTien.State;
    const cost = this.getUpgradeCost(upgradeDef);
    state.data.qi -= cost;
    const newLevel = state.getUpgradeLevel(upgradeDef.id) + 1;
    state.data.upgrades[upgradeDef.id] = newLevel;

    const dispName = this.getDisplayName(upgradeDef);
    state.addLog(`Đã tu luyện 【${dispName}】 lên tầng ${newLevel}.`);
    if (window.TuTien.UI) {
      window.TuTien.UI.renderUpgrades();
      window.TuTien.UI.updateHeaderAndStats();
    }
    return true;
  },

  getPrestigeUpgradeCost(pUpgradeDef) {
    const currentLevel = window.TuTien.State.getPrestigeUpgradeLevel(pUpgradeDef.id);
    return Math.max(
      1,
      Math.round(pUpgradeDef.baseCost * Math.pow(pUpgradeDef.costMultiplier, currentLevel))
    );
  },

  isPrestigeMaxed(pUpgradeDef) {
    if (!pUpgradeDef.maxLevel) return false;
    return window.TuTien.State.getPrestigeUpgradeLevel(pUpgradeDef.id) >= pUpgradeDef.maxLevel;
  },

  canAffordPrestige(pUpgradeDef) {
    if (this.isPrestigeMaxed(pUpgradeDef)) return false;
    const cost = this.getPrestigeUpgradeCost(pUpgradeDef);
    return window.TuTien.State.data.prestige.daoVan >= cost;
  },

  buyPrestigeUpgrade(pUpgradeId) {
    const pUpgradeDef = window.TuTien.PRESTIGE_UPGRADES.find(u => u.id === pUpgradeId);
    if (!pUpgradeDef || !this.canAffordPrestige(pUpgradeDef)) return false;

    const state = window.TuTien.State;
    const cost = this.getPrestigeUpgradeCost(pUpgradeDef);
    state.data.prestige.daoVan -= cost;
    const newLevel = state.getPrestigeUpgradeLevel(pUpgradeId) + 1;
    state.data.prestige.upgrades[pUpgradeId] = newLevel;

    state.addLog(`✨ Khắc ấn Đại Đạo 【${pUpgradeDef.name}】 cấp ${newLevel}!`, 'success');
    if (window.TuTien.UI) {
      window.TuTien.UI.renderPrestigePanel();
      window.TuTien.UI.updateHeaderAndStats();
    }
    return true;
  }
};
