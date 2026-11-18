/**
 * js/character.js
 * Xử lý hồ sơ nhân vật:
 * - Chọn đạo thống: Chính Đạo ('chinh_dao') hoặc Ma Đạo ('ma_dao')
 * - Tính toán 4 Chỉ Số Chiến Đấu: Máu (HP), Linh lực (MP), Tốc độ (SPD), Sức mạnh (ATK)
 *   (Mặc định 100 Máu, 100 Linh lực, 10 Tốc độ, 10 Sức mạnh + tăng theo Đột Phá, Công Pháp có Phẩm Chất, Pháp Bảo và Đan Dược).
 */
window.TuTien = window.TuTien || {};

window.TuTien.Character = {
  getGender() {
    const charData = window.TuTien.State.data && window.TuTien.State.data.character;
    return charData && charData.gender === 'female' ? 'female' : 'male';
  },

  setGender(newGender) {
    const g = newGender === 'female' ? 'female' : 'male';
    window.TuTien.State.data.character.gender = g;
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateCharacterArtwork();
    if (window.TuTien.Profile) window.TuTien.Profile.render();
    if (window.TuTien.Panels) window.TuTien.Panels.refreshActivePanel();
  },

  resolvePrestigeGender() {
    const charData = window.TuTien.State.data.character;
    const current = this.getGender();
    const pref = charData.nextPrestigeGender || 'toggle';

    if (pref === 'male') return 'male';
    if (pref === 'female') return 'female';
    if (pref === 'random') return Math.random() < 0.5 ? 'male' : 'female';
    return current === 'male' ? 'female' : 'male';
  },

  /**
   * Lấy thông tin đạo thống hiện tại ('chinh_dao' hoặc 'ma_dao')
   */
  getFactionId() {
    const charData = window.TuTien.State.data && window.TuTien.State.data.character;
    return charData && charData.faction === 'ma_dao' ? 'ma_dao' : 'chinh_dao';
  },

  getFactionConfig() {
    const id = this.getFactionId();
    return window.TuTien.CONFIG.factions[id] || window.TuTien.CONFIG.factions.chinh_dao;
  },

  /**
   * Chọn Chính Đạo hoặc Ma Đạo khi bắt đầu hoặc khi Chuyển Sinh
   */
  selectFaction(factionId) {
    const valid = factionId === 'ma_dao' ? 'ma_dao' : 'chinh_dao';
    const charData = window.TuTien.State.data.character;
    charData.faction = valid;
    charData.hasChosenFaction = true;

    // Đóng ngay bảng chọn Chính/Ma Đạo trước tiên để không bao giờ bị kẹt overlay
    const overlayEl = document.getElementById('faction-select-overlay');
    if (overlayEl) {
      overlayEl.classList.add('hidden');
    }

    const fCfg = this.getFactionConfig();
    window.TuTien.State.addLog(
      `☯️ Đạo hữu đã bước vào con đường 【${fCfg.name} — ${fCfg.subtitle}】!`,
      'success'
    );

    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(
        `Đã nhập môn ${fCfg.icon} ${fCfg.name}!`,
        valid === 'ma_dao' ? 'warn' : 'success',
        valid === 'ma_dao' ? 'angry' : 'happy'
      );
      window.TuTien.UI.updateAll();
    }
    if (window.TuTien.Profile) {
      window.TuTien.Profile.render();
    }
  },

  /**
   * Tính toán 4 Chỉ Số Chiến Đấu thực tế của nhân vật:
   * Mặc định: Máu 100, Linh lực 100, Tốc độ 10, Sức mạnh 10
   * Cộng thêm từ: Cảnh giới đã đột phá + Công pháp (nhân theo Phẩm Chất công pháp) + Pháp Bảo + Đan dược vĩnh viễn + Đan dược tạm thời + Chính/Ma Đạo
   */
  getCombatStats() {
    const cfg = window.TuTien.CONFIG.combatStats;
    const State = window.TuTien.State;
    const data = State.data;
    const realmIdx = data.realmIndex || 0;
    const majorIdx = Math.floor(realmIdx / 5);
    const factionCfg = this.getFactionConfig();

    // 1. Chỉ số nền + cộng theo từng tầng Đột Phá
    const realmScale = Math.pow(cfg.perMajorRealmStatMult || 1.35, majorIdx);
    let hp = (cfg.baseHp + realmIdx * cfg.perSubRealmHp) * realmScale;
    let mp = (cfg.baseMp + realmIdx * cfg.perSubRealmMp) * realmScale;
    let speed = cfg.baseSpeed + realmIdx * cfg.perSubRealmSpeed + majorIdx * 5;
    let attack = (cfg.baseAttack + realmIdx * cfg.perSubRealmAttack) * realmScale;

    // 2. Cộng thêm từ Công Pháp (nhân với Phẩm Chất của từng cuốn Công Pháp!)
    window.TuTien.UPGRADES.forEach(u => {
      const lvl = State.getUpgradeLevel(u.id);
      if (lvl > 0 && u.combatStatsPerLevel) {
        const qMult = window.TuTien.Upgrades
          ? window.TuTien.Upgrades.getUpgradeQualityObj(u.id).mult
          : 1.0;
        hp += (u.combatStatsPerLevel.hp || 0) * lvl * qMult;
        mp += (u.combatStatsPerLevel.mp || 0) * lvl * qMult;
        speed += (u.combatStatsPerLevel.speed || 0) * lvl * qMult;
        attack += (u.combatStatsPerLevel.attack || 0) * lvl * qMult;
      }
    });

    // 3. Cộng thêm vĩnh viễn từ Long Huyết Tẩy Tủy Đan
    const permStats = (data.character && data.character.permBonusStats) || {
      hp: 0,
      mp: 0,
      speed: 0,
      attack: 0
    };
    hp += permStats.hp || 0;
    mp += permStats.mp || 0;
    speed += permStats.speed || 0;
    attack += permStats.attack || 0;

    // 4. Nhân từ Pháp Bảo Bản Mệnh đang trang bị và Y Thuật / Ngự Thú
    const equipBonuses = window.TuTien.Inventory
      ? window.TuTien.Inventory.getEquippedArtifactBonuses()
      : { passiveMult: 1, clickMult: 1 };
    const yThuatRank = window.TuTien.Fields
      ? window.TuTien.Fields.getFieldState('y_thuat').rank
      : 1;
    const nguThuRank = window.TuTien.Fields
      ? window.TuTien.Fields.getFieldState('ngu_thu').rank
      : 1;

    hp *= equipBonuses.passiveMult * (1 + (yThuatRank - 1) * 0.10);
    attack *= equipBonuses.clickMult * (1 + (nguThuRank - 1) * 0.05);
    speed *= 1 + (nguThuRank - 1) * 0.05;

    // 5. Nhân từ nâng cấp Đạo Vận (Hồng Mông Linh Mạch & Bất Diệt Thần Thức)
    const pPassive = State.getPrestigeUpgradeLevel('dao_van_linh_mach');
    const pClick = State.getPrestigeUpgradeLevel('dao_van_than_thuc');
    hp *= 1 + pPassive * 0.15;
    mp *= 1 + pPassive * 0.15;
    attack *= 1 + pClick * 0.15;
    speed *= 1 + pClick * 0.10;

    // 6. Nhân đặc trưng Chính Đạo / Ma Đạo
    hp *= factionCfg.hpMult || 1.0;
    attack *= factionCfg.atkMult || 1.0;

    // 7. Nhân từ Đan Dược tăng chỉ số tạm thời (Cuồng Bạo Chiến Đan & Hồi Nguyên Đan)
    const buffs = (data.fields && data.fields.buffs) || {};
    if (buffs.combatBuffRemainingMs > 0) {
      const bMult = buffs.combatBuffMultiplier || 1.4;
      attack *= bMult;
      speed *= 1 + (bMult - 1) * 0.6;
    }
    if (buffs.hpBuffRemainingMs > 0) {
      hp *= buffs.hpBuffMultiplier || 1.4;
    }

    return {
      maxHp: Math.round(hp),
      maxMp: Math.round(mp),
      speed: Math.round(speed),
      attack: Math.round(attack)
    };
  },

  getCandidateCharacterImagePaths() {
    const cfg = window.TuTien.CONFIG;
    const realmIdx = window.TuTien.State.data ? window.TuTien.State.data.realmIndex : 0;
    const step = cfg.realmsPerCharacterSprite || 20;
    const realmTier = Math.floor(realmIdx / step) + 1;
    const gender = this.getGender();

    return [
      `assets/char_${gender}_realm_${realmTier}.png`,
      `assets/char_realm_${realmTier}.png`,
      `assets/char_${gender}.png`,
      `assets/character.png`
    ];
  },

  getCurrentAptitude() {
    const state = window.TuTien.State;
    const aptId = state.data && state.data.character ? state.data.character.aptitudeId : 'trung_pham';
    return (
      window.TuTien.APTITUDES.find(a => a.id === aptId) ||
      window.TuTien.APTITUDES[1]
    );
  },

  getLuckBonusLevel() {
    return window.TuTien.State.getPrestigeUpgradeLevel('dao_van_khi_van');
  },

  rollRandomAptitude(excludeCurrentId = null) {
    const cfg = window.TuTien.CONFIG;
    const weights = cfg.aptitudeWeights || {};
    const luckLvl = this.getLuckBonusLevel();
    const luckFactor = 1 + luckLvl * (cfg.luckBoostPerLevel || 0.25);

    const pool = window.TuTien.APTITUDES.map(apt => {
      let w = weights[apt.weightKey] !== undefined ? weights[apt.weightKey] : 10;
      if (apt.tier >= 3) {
        w *= Math.pow(luckFactor, apt.tier - 2);
      }
      if (excludeCurrentId && apt.id === excludeCurrentId && window.TuTien.APTITUDES.length > 1) {
        w *= 0.35;
      }
      return { apt, weight: w };
    });

    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const item of pool) {
      if (rand < item.weight) {
        return item.apt;
      }
      rand -= item.weight;
    }
    return pool[1].apt;
  },

  getRerollAptitudeCost() {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const rerollCount = (state.data.character && state.data.character.rerollCount) || 0;
    return Math.max(
      1,
      Math.round(cfg.rerollAptitudeBaseCost * Math.pow(cfg.rerollAptitudeCostMult, rerollCount))
    );
  },

  rerollAptitude() {
    const state = window.TuTien.State;
    const cost = this.getRerollAptitudeCost();
    if (state.data.prestige.daoVan < cost) {
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast('Không đủ Đạo Vận để nghịch thiên Đổi Mệnh!', 'warn');
      }
      return false;
    }

    state.data.prestige.daoVan -= cost;
    state.data.character.rerollCount = (state.data.character.rerollCount || 0) + 1;

    const oldApt = this.getCurrentAptitude();
    const newApt = this.rollRandomAptitude(oldApt.id);
    state.data.character.aptitudeId = newApt.id;

    state.addLog(
      `🔮 Nghịch thiên Đổi Mệnh (-${cost} Đạo Vận): Tư chất chuyển từ 【${oldApt.name}】 sang 【${newApt.name} (x${newApt.multiplier})】!`,
      'success'
    );

    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(
        `Đổi Mệnh thành công: ${newApt.name} (x${newApt.multiplier})!`,
        'success'
      );
      window.TuTien.UI.updateAll();
    }
    if (window.TuTien.Profile) {
      window.TuTien.Profile.render();
    }
    return true;
  },

  rollFieldTalents() {
    const fields = window.TuTien.FIELDS;
    const talentsMap = {};
    const indices = fields.map((_, idx) => idx);

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = indices[i];
      indices[i] = indices[j];
      indices[j] = tmp;
    }

    const giftedCount = window.TuTien.Utils.randomInt(1, 3);
    const luckLvl = this.getLuckBonusLevel();
    const geniusChance = Math.min(0.65, 0.28 + luckLvl * 0.05);

    indices.forEach((fieldIdx, order) => {
      const fieldId = fields[fieldIdx].id;
      if (order < giftedCount) {
        talentsMap[fieldId] = Math.random() < geniusChance ? 'genius' : 'good';
      } else {
        talentsMap[fieldId] = Math.random() < 0.55 ? 'normal' : 'none';
      }
    });

    return talentsMap;
  },

  setDaoName(newName) {
    const cleaned = (newName || '').trim().slice(0, 24);
    if (!cleaned) return false;
    window.TuTien.State.data.character.daoName = cleaned;
    window.TuTien.State.addLog(`✍️ Đạo hữu đã đổi Đạo Hiệu thành 【${cleaned}】.`);
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    if (window.TuTien.Profile) window.TuTien.Profile.render();
    return true;
  },

  getAvatarSymbol() {
    const realmIdx = window.TuTien.State.data.realmIndex;
    if (realmIdx >= 80) return '🌌';
    if (realmIdx >= 60) return '👑';
    if (realmIdx >= 40) return '⚔️';
    if (realmIdx >= 20) return '🧘';
    return '☯️';
  },

  getAggregatedStats() {
    const State = window.TuTien.State;
    const Cultivate = window.TuTien.Cultivate;
    const Save = window.TuTien.Save;
    const apt = this.getCurrentAptitude();
    const root = State.getCurrentRoot();
    const combat = this.getCombatStats();
    const factionCfg = this.getFactionConfig();

    const prestigePassiveLvl = State.getPrestigeUpgradeLevel('dao_van_linh_mach');
    const prestigeClickLvl = State.getPrestigeUpgradeLevel('dao_van_than_thuc');
    const daoVanPassiveMult = 1 + prestigePassiveLvl * 0.35;
    const daoVanClickMult = 1 + prestigeClickLvl * 0.40;

    return {
      daoName: State.data.character.daoName || 'Vô Danh Đạo Nhân',
      gender: this.getGender(),
      faction: factionCfg,
      avatar: this.getAvatarSymbol(),
      aptitude: apt,
      root: root,
      combat,
      combatStats: combat,
      passiveRate: Cultivate.getBasePassiveRate(),
      effectiveRate: Cultivate.getEffectiveRatePerSec(),
      clickPower: Cultivate.getClickPower(),
      maxCombo: Cultivate.getMaxTotalMultiplier(),
      boostDurationSec: (Cultivate.getMaxBoostDurationMs() / 1000).toFixed(2),
      maxOfflineHours: Save.getMaxOfflineHours(),
      offlineEfficiencyPct: Math.round(Save.getOfflineEfficiency() * 100),
      daoVanPassiveMult,
      daoVanClickMult
    };
  }
};
