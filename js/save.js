/**
 * js/save.js
 * Xử lý lưu/tải game từ localStorage (tương thích ngược hoàn toàn với mọi bản save cũ),
 * bảo toàn Linh Thạch 3 bậc (Hạ / Trung / Thượng Phẩm) và các Bí Tịch / Đan Phương / Phù Phương đã mở khóa.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Save = {
  STORAGE_KEY: 'tu_tien_idle_save_v1',

  saveToLocal() {
    try {
      const data = window.TuTien.State.data;
      if (!data) return false;
      data.lastSavedAt = Date.now();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      
      if (data.inventory && Array.isArray(data.inventory.items)) {
        data.inventory.items.forEach(it => {
          if (it.icon === '🪨' || it.templateId === 'da_khoang') it.icon = '⛰️';
          if (it.icon === '🪵' || it.templateId === 'go_linh_moc') it.icon = '🌲';
          if (it.icon === '🪙' || it.templateId === 'vang_tinh_kim') it.icon = '🌕';
        });
      }

      return true;
    } catch (err) {
      console.warn('Không thể lưu vào localStorage:', err);
      return false;
    }
  },

  loadFromLocal() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return this.applyLoadedData(parsed, true);
    } catch (err) {
      console.warn('Không thể đọc dữ liệu lưu:', err);
      return false;
    }
  },

  applyLoadedData(parsed, checkOffline = true) {
    if (!parsed || typeof parsed !== 'object') return false;
    const defaultData = window.TuTien.State.createDefaultData();

    const mergedFieldItems = { ...defaultData.fields.items };
    const isLegacyWithoutFields = !parsed.fields || !parsed.fields.items;

    if (parsed.fields && parsed.fields.items) {
      Object.keys(mergedFieldItems).forEach(fId => {
        if (parsed.fields.items[fId]) {
          mergedFieldItems[fId] = {
            ...mergedFieldItems[fId],
            ...parsed.fields.items[fId]
          };
        }
      });
    }

    window.TuTien.State.data = {
      ...defaultData,
      ...parsed,
      upgrades: { ...(parsed.upgrades || {}) },
      upgradeQualities: { ...(parsed.upgradeQualities || {}) },
      unlockedTechniques: { ...(parsed.unlockedTechniques || {}) },
      unlockedPillRecipes: { ...(parsed.unlockedPillRecipes || {}) },
      unlockedTalismanRecipes: { ...(parsed.unlockedTalismanRecipes || {}) },
      spiritStones: {
        ...defaultData.spiritStones,
        ...(parsed.spiritStones || {})
      },
      character: {
        ...defaultData.character,
        ...(parsed.character || {}),
        hasChosenFaction:
          parsed.character && typeof parsed.character.hasChosenFaction === 'boolean'
            ? parsed.character.hasChosenFaction
            : !!(parsed.character && parsed.character.faction),
        permBonusStats: {
          ...defaultData.character.permBonusStats,
          ...((parsed.character && parsed.character.permBonusStats) || {})
        }
      },
      fields: {
        ...defaultData.fields,
        ...(parsed.fields || {}),
        pills: {
          ...defaultData.fields.pills,
          ...((parsed.fields && parsed.fields.pills) || {})
        },
        buffs: {
          ...defaultData.fields.buffs,
          ...((parsed.fields && parsed.fields.buffs) || {})
        },
        items: mergedFieldItems
      },
      inventory: {
        ...defaultData.inventory,
        ...(parsed.inventory || {}),
        items: Array.isArray(parsed.inventory && parsed.inventory.items)
          ? parsed.inventory.items
          : [],
        cooldowns: {
          ...defaultData.inventory.cooldowns,
          ...((parsed.inventory && parsed.inventory.cooldowns) || {})
        }
      },
      prestige: {
        ...defaultData.prestige,
        ...(parsed.prestige || {}),
        upgrades: { ...((parsed.prestige && parsed.prestige.upgrades) || {}) }
      },
      achievements: { ...(parsed.achievements || {}) },
      stats: {
        ...defaultData.stats,
        ...(parsed.stats || {})
      },
      settings: {
        ...defaultData.settings,
        ...(parsed.settings || {})
      }
    };

    if (isLegacyWithoutFields && window.TuTien.Character) {
      const talents = window.TuTien.Character.rollFieldTalents();
      Object.keys(talents).forEach(fId => {
        if (window.TuTien.State.data.fields.items[fId]) {
          window.TuTien.State.data.fields.items[fId].talent = talents[fId];
        }
      });
    }

    if (!window.TuTien.State.data.stats.totalQiAllTime) {
      window.TuTien.State.data.stats.totalQiAllTime =
        window.TuTien.State.data.totalQiThisRun || window.TuTien.State.data.qi || 0;
    }

    if (window.TuTien.Inventory && window.TuTien.FORGE_MATERIALS) {
      const hasAnyMat = window.TuTien.FORGE_MATERIALS.some(m => window.TuTien.Inventory.getMaterialCountById(m.id) > 0);
      if (!hasAnyMat) {
        const q1 = window.TuTien.ITEM_QUALITIES[0];
        window.TuTien.FORGE_MATERIALS.forEach(mat => {
          const initQty = mat.id === "vang_tinh_kim" ? 1 : 3;
          window.TuTien.Inventory.addStackableItem("material", mat.id, mat.name, mat.icon, q1, mat.desc, initQty);
        });
      }
    }
    if (window.TuTien.Shop && window.TuTien.Shop.ensureState) {
      window.TuTien.Shop.ensureState();
      window.TuTien.Shop.syncCycle();
    }
    if (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.inventory && Array.isArray(window.TuTien.State.data.inventory.items)) {
      const tierPowerTable = { 1: 0.35, 2: 1.1, 3: 2.8, 4: 6.5, 5: 15.0 };
      window.TuTien.State.data.inventory.items.forEach(it => {
        if (it.category === 'artifact' && !it.combatStats) {
          const tier = Math.max(1, Math.min(5, it.qualityTier || (it.quality && it.quality.tier) || 1));
          const tp = tierPowerTable[tier] || 1.0;
          const sr = tier === 1 ? 2 : tier === 2 ? 4 : 7;
          const rf = 1 + (sr - 1) * 0.22;
          const bs = 0.08 * tp * rf;
          it.mult = tp;
          it.passiveBonus = Number((bs * 1.08).toFixed(3));
          it.clickBonus = Number((bs * 1.08).toFixed(3));
          it.combatStats = {
            hp: Math.round(60 * tp * rf),
            mp: Math.round(40 * tp * rf),
            attack: Math.round(16 * tp * rf),
            speed: Math.round(4 * tp * (1 + (sr - 1) * 0.15))
          };
          it.qualityColor = it.qualityColor || (it.quality && it.quality.color) || '#cbd5e1';
          it.effectDesc = `+${Math.round(it.passiveBonus * 100)}% Nền • +${Math.round(it.clickBonus * 100)}% Click • ⚔️+${it.combatStats.attack} Công • ❤️+${it.combatStats.hp} Máu • 💨+${it.combatStats.speed} Tốc`;
        }
      });
    }
    // _repairedShopArtifacts
    window.TuTien.State.resetRuntime();

    if (checkOffline && parsed.lastSavedAt) {
      this.processOfflineProgress(parsed.lastSavedAt);
    }

    return true;
  },

  getMaxOfflineHours() {
    const cfg = window.TuTien.CONFIG;
    const bonusHours = window.TuTien.State.getPrestigeUpgradeLevel('dao_van_be_quan') * 2;
    const fieldHours = window.TuTien.Fields ? window.TuTien.Fields.getOfflineHoursBonus() : 0;
    return cfg.baseMaxOfflineHours + bonusHours + fieldHours;
  },

  getOfflineEfficiency() {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const root = state.getCurrentRoot();
    const upgradeLvl = state.getPrestigeUpgradeLevel('dao_van_be_quan');
    return cfg.offlineEfficiency * root.bonuses.offlineBonus * (1 + upgradeLvl * 0.05);
  },

  processOfflineProgress(lastSavedAt) {
    const cfg = window.TuTien.CONFIG;
    const now = Date.now();
    const elapsedSec = Math.floor((now - lastSavedAt) / 1000);

    if (elapsedSec < cfg.minOfflineSecondsForPopup) {
      return;
    }

    const maxOfflineSec = this.getMaxOfflineHours() * 3600;
    const effectiveSec = Math.min(elapsedSec, maxOfflineSec);
    const passiveRate = window.TuTien.Cultivate.getBasePassiveRate();
    const efficiency = this.getOfflineEfficiency();
    const gainedQi = Math.floor(passiveRate * effectiveSec * efficiency);

    const fieldOfflineInfo = window.TuTien.Fields
      ? window.TuTien.Fields.processOfflineFields(effectiveSec)
      : { herbsGained: 0, expGained: 0, activeFieldName: null };

    if (gainedQi > 0) {
      window.TuTien.Cultivate.addQi(gainedQi);
      const formattedQi = window.TuTien.Utils.formatNumber(gainedQi);
      const durationStr = window.TuTien.Utils.formatDuration(effectiveSec);

      window.TuTien.State.addLog(
        `🧘 Bế quan ${durationStr}, hấp thụ được +${formattedQi} linh khí.`,
        'success'
      );

      setTimeout(() => {
        if (window.TuTien.UI) {
          window.TuTien.UI.showOfflinePopup(
            effectiveSec,
            elapsedSec > maxOfflineSec,
            gainedQi,
            fieldOfflineInfo
          );
        }
      }, 150);
    }
  },

  exportBase64() {
    const data = window.TuTien.State.data;
    data.lastSavedAt = Date.now();
    const jsonStr = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    bytes.forEach(b => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  },

  importBase64(base64Str) {
    try {
      const cleaned = (base64Str || '').trim();
      if (!cleaned) return false;
      const binary = atob(cleaned);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed.qi !== 'number' || typeof parsed.realmIndex !== 'number') {
        return false;
      }
      this.applyLoadedData(parsed, false);
      this.saveToLocal();
      window.TuTien.State.addLog('📥 Đã nhập dữ liệu truyền thừa thành công!', 'success');
      if (window.TuTien.UI) {
        window.TuTien.UI.updateAll();
      }
      if (window.TuTien.Profile) {
        window.TuTien.Profile.render();
      }
      return true;
    } catch (err) {
      console.error('Lỗi nhập Base64:', err);
      return false;
    }
  },

  hardReset() {
    localStorage.removeItem(this.STORAGE_KEY);
    window.TuTien.State.initNewGame();
    this.saveToLocal();
    if (window.TuTien.UI) {
      window.TuTien.UI.updateAll();
      window.TuTien.UI.checkFactionSelectionModal();
      window.TuTien.UI.showToast('Đã xóa dữ liệu và tái tạo Đạo Lộ mới!', 'info');
    }
    if (window.TuTien.Profile) {
      window.TuTien.Profile.render();
    }
  }
};
