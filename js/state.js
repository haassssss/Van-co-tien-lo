/**
 * js/state.js
 * Quản lý trạng thái trung tâm của người chơi:
 * - Linh Thạch 3 bậc (low: Hạ Phẩm, mid: Trung Phẩm, high: Thượng Phẩm; 100 Hạ = 1 Trung, 100 Trung = 1 Thượng)
 * - Danh sách Bí Tịch Công Pháp, Đan Phương và Phù Phương đã mở khóa trên Bản Đồ Xuất Quan
 * - Cài đặt `showDetailedDesc` (mặc định `false` để giao diện tóm tắt gọn gàng, có thể bật hoặc xem tại mục Giải Thích Chi Tiết trong Cài Đặt).
 */
window.TuTien = window.TuTien || {};

window.TuTien.State = {
  data: null,

  runtime: {
    boostRemainingMs: 0,
    currentComboBonus: 0,
    clickStreak: 0,
    idleTimeSec: 0,
    activeFortune: null,
    nextFortuneTimerSec: 25,
    logs: []
  },

  createDefaultFieldsData() {
    const items = {};
    if (window.TuTien.FIELDS) {
      window.TuTien.FIELDS.forEach(f => {
        items[f.id] = {
          rank: 1,
          exp: 0,
          totalExp: 0,
          talent: 'normal'
        };
      });
    }
    return {
      activeFieldId: null,
      herbs: 0,
      herbGrowProgress: 0,
      artifactsForged: 0,
      pills: {
        tu_khi_dan: 0,
        pha_canh_dan: 0,
        hoi_nguyen_dan: 0
      },
      buffs: {
        pillBoostRemainingMs: 0,
        pillBoostMultiplier: 1.5,
        combatBuffRemainingMs: 0,
        combatBuffMultiplier: 1.45,
        hpBuffRemainingMs: 0,
        hpBuffMultiplier: 1.4,
        nextBreakthroughBonus: 0,
        protectNextBreakthrough: false,
        antiLightningSkipChance: 0,
        antiLightningQualityName: null,
        talismanRemainingMs: 0,
        talismanMultiplier: 1.8,
        autoClickAccumMs: 0
      },
      items
    };
  },

  createDefaultData() {
    const initialRoot = window.TuTien.ROOTS[0].id;
    return {
      version: 8,
      qi: 0,
      totalQiThisRun: 0,
      realmIndex: 0,
      pityFailCount: 0,
      upgrades: {},
      upgradeQualities: {},
      unlockedTechniques: {},
      unlockedPillRecipes: {},
      unlockedTalismanRecipes: {},
      spiritStones: {
        low: 25,
        mid: 0,
        high: 0
      },
      character: {
        daoName: 'Vô Danh Đạo Nhân',
        gender: 'male',
        nextPrestigeGender: 'toggle',
        faction: 'chinh_dao',
        hasChosenFaction: false,
        aptitudeId: 'trung_pham',
        rerollCount: 0,
        permBonusStats: {
          hp: 0,
          mp: 0,
          speed: 0,
          attack: 0
        }
      },
      fields: this.createDefaultFieldsData(),
      inventory: {
        nextUid: 1,
        items: [],
        cooldowns: {
          pillReadyAt: 0,
          artifactReadyAt: 0,
          talismanReadyAt: 0
        }
      },
      prestige: {
        count: 0,
        daoVan: 0,
        totalDaoVanEarned: 0,
        rootId: initialRoot,
        upgrades: {}
      },
      achievements: {},
      stats: {
        totalClicks: 0,
        totalBreakthroughs: 0,
        failedBreakthroughs: 0,
        highestRealmIndex: 0,
        fortunesClaimed: 0,
        totalPlayTimeSec: 0,
        totalQiAllTime: 0,
        monstersDefeated: 0,
        roguesDefeated: 0
      },
      settings: {
        numberFormat: window.TuTien.CONFIG.defaultNumberFormat,
        fxQuality: window.TuTien.CONFIG.defaultFxQuality || 'high',
        musicEnabled: true,
        sfxEnabled: true,
        notificationsEnabled: true,
        showDetailedDesc: false
      },
      lastSavedAt: Date.now()
    };
  },

  initNewGame() {
    this.data = this.createDefaultData();
    if (window.TuTien.Prestige && window.TuTien.Prestige.rollRandomRoot) {
      this.data.prestige.rootId = window.TuTien.Prestige.rollRandomRoot().id;
    }
    if (window.TuTien.Character) {
      const apt = window.TuTien.Character.rollRandomAptitude();
      this.data.character.aptitudeId = apt.id;
      const talents = window.TuTien.Character.rollFieldTalents();
      Object.keys(talents).forEach(fId => {
        if (this.data.fields.items[fId]) {
          this.data.fields.items[fId].talent = talents[fId];
        }
      });
    }
    if (window.TuTien.Inventory && window.TuTien.HERB_TYPES) {
      const starterHerb = window.TuTien.HERB_TYPES[0];
      const q = window.TuTien.ITEM_QUALITIES[0];
      window.TuTien.Inventory.addStackableItem(
        'herb',
        starterHerb.id,
        starterHerb.name,
        starterHerb.icon,
        q,
        starterHerb.shortDesc || starterHerb.desc,
        3
      );
    }
    if (window.TuTien.Inventory && window.TuTien.FORGE_MATERIALS) {
      const q1 = window.TuTien.ITEM_QUALITIES[0];
      window.TuTien.FORGE_MATERIALS.forEach(mat => {
        const initQty = mat.id === "vang_tinh_kim" ? 1 : 3;
        window.TuTien.Inventory.addStackableItem("material", mat.id, mat.name, mat.icon, q1, mat.desc, initQty);
      });
    }
    this.resetRuntime();
    this.addLog('Bắt đầu bước lên con đường Tu Tiên nghịch thiên cải mệnh!');
  },

  resetRuntime() {
    const cfg = window.TuTien.CONFIG;
    this.runtime.boostRemainingMs = 0;
    this.runtime.currentComboBonus = 0;
    this.runtime.clickStreak = 0;
    this.runtime.idleTimeSec = 0;
    this.runtime.activeFortune = null;
    this.runtime.nextFortuneTimerSec = window.TuTien.Utils.randomRange(
      cfg.fortuneMinIntervalSec * 0.6,
      cfg.fortuneMaxIntervalSec * 0.8
    );
  },

  getCurrentRealm() {
    const idx = window.TuTien.Utils.clamp(
      this.data.realmIndex,
      0,
      window.TuTien.REALMS.length - 1
    );
    return window.TuTien.REALMS[idx];
  },

  getNextRealm() {
    if (this.data.realmIndex + 1 >= window.TuTien.REALMS.length) {
      return null;
    }
    return window.TuTien.REALMS[this.data.realmIndex + 1];
  },

  getCurrentRoot() {
    const found = window.TuTien.ROOTS.find(r => r.id === this.data.prestige.rootId);
    return found || window.TuTien.ROOTS[0];
  },

  getUpgradeLevel(id) {
    return (this.data && this.data.upgrades && this.data.upgrades[id]) || 0;
  },

  getPrestigeUpgradeLevel(id) {
    return (
      (this.data &&
        this.data.prestige &&
        this.data.prestige.upgrades &&
        this.data.prestige.upgrades[id]) ||
      0
    );
  },

  addLog(message, type = 'info') {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    this.runtime.logs.unshift({ time: timeStr, message, type });
    if (this.runtime.logs.length > 30) {
      this.runtime.logs.pop();
    }
    if (window.TuTien.UI && window.TuTien.UI.renderLogs) {
      window.TuTien.UI.renderLogs();
    }
  }
};
