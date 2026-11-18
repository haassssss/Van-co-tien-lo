/**
 * js/fields.js
 * Xử lý toàn bộ logic 8 Lĩnh Vực (Bách Nghệ):
 * - Linh Điền trồng 4 loại Linh Thảo cơ bản (6 loại Linh Thảo hiếm hơn chỉ mọc trên Bản Đồ Xuất Quan 2000x2000).
 * - Kiểm tra mở khóa Đan Phương (`unlockedPillRecipes`) và Phù Phương (`unlockedTalismanRecipes`) trước khi luyện chế.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Fields = {
  getFieldState(fieldId) {
    const fieldsState = window.TuTien.State.data.fields;
    if (!fieldsState.items[fieldId]) {
      fieldsState.items[fieldId] = {
        rank: 1,
        exp: 0,
        totalExp: 0,
        talent: 'normal'
      };
    }
    return fieldsState.items[fieldId];
  },

  isPillRecipeUnlocked(recipe) {
    if (!recipe) return false;
    if (!recipe.requiresRecipeUnlock) return true;
    const data = window.TuTien.State.data;
    return !!(data.unlockedPillRecipes && data.unlockedPillRecipes[recipe.id]);
  },

  unlockPillRecipe(recipeId) {
    const data = window.TuTien.State.data;
    if (!data.unlockedPillRecipes) data.unlockedPillRecipes = {};
    const already = !!data.unlockedPillRecipes[recipeId];
    data.unlockedPillRecipes[recipeId] = true;
    return !already;
  },

  isTalismanRecipeUnlocked(recipe) {
    if (!recipe) return false;
    if (!recipe.requiresRecipeUnlock) return true;
    const data = window.TuTien.State.data;
    return !!(data.unlockedTalismanRecipes && data.unlockedTalismanRecipes[recipe.id]);
  },

  unlockTalismanRecipe(recipeId) {
    const data = window.TuTien.State.data;
    if (!data.unlockedTalismanRecipes) data.unlockedTalismanRecipes = {};
    const already = !!data.unlockedTalismanRecipes[recipeId];
    data.unlockedTalismanRecipes[recipeId] = true;
    return !already;
  },

  getFieldTalentObj(fieldId) {
    const st = this.getFieldState(fieldId);
    return window.TuTien.FIELD_TALENTS[st.talent] || window.TuTien.FIELD_TALENTS.normal;
  },

  getExpRequiredForNextRank(currentRank) {
    const cfg = window.TuTien.CONFIG;
    if (currentRank >= 9) return Infinity;
    return Math.round(cfg.fieldBaseExpReq * Math.pow(cfg.fieldExpGrowthMult, currentRank - 1));
  },

  getFieldRankTitle(fieldDef, rank) {
    const rankName = window.TuTien.FIELD_RANKS[Math.min(8, Math.max(0, rank - 1))];
    return `${rankName} ${fieldDef.titleSuffix}`;
  },

  getFieldExpRatePerSec(fieldId) {
    const cfg = window.TuTien.CONFIG;
    const State = window.TuTien.State;
    const apt = window.TuTien.Character.getCurrentAptitude();
    const talent = this.getFieldTalentObj(fieldId);

    const upgradeLvl = State.getUpgradeLevel('chu_thien_kinh');
    const prestigeLvl = State.getPrestigeUpgradeLevel('dao_van_than_thuc');
    const upgradeMult = (1 + upgradeLvl * 0.10) * (1 + prestigeLvl * 0.15);

    return cfg.fieldBaseExpPerSec * apt.multiplier * talent.multiplier * upgradeMult;
  },

  toggleActiveField(fieldId) {
    const fieldsState = window.TuTien.State.data.fields;
    if (fieldsState.activeFieldId === fieldId) {
      fieldsState.activeFieldId = null;
      window.TuTien.State.addLog('Đã tạm dừng hoạt động phụ Bách Nghệ.');
    } else {
      fieldsState.activeFieldId = fieldId;
      const def = window.TuTien.FIELDS.find(f => f.id === fieldId);
      if (def) {
        window.TuTien.State.addLog(`🛠️ Đã chọn 【${def.name}】 làm hoạt động tu luyện phụ!`);
      }
    }
    if (window.TuTien.UI) window.TuTien.UI.renderFieldsPanel();
    if (window.TuTien.Profile) window.TuTien.Profile.render();
  },

  addFieldExp(fieldId, amount) {
    if (amount <= 0 || isNaN(amount)) return;
    const st = this.getFieldState(fieldId);
    st.totalExp = (st.totalExp || 0) + amount;

    if (st.rank >= 9) {
      st.exp = 0;
      return;
    }

    st.exp += amount;
    let req = this.getExpRequiredForNextRank(st.rank);
    let leveledUp = false;

    while (st.rank < 9 && st.exp >= req) {
      st.exp -= req;
      st.rank += 1;
      leveledUp = true;
      req = this.getExpRequiredForNextRank(st.rank);
    }

    if (leveledUp) {
      const def = window.TuTien.FIELDS.find(f => f.id === fieldId);
      const title = def ? this.getFieldRankTitle(def, st.rank) : `Phẩm ${st.rank}`;
      window.TuTien.State.addLog(
        `🌟 Thăng cấp thông thạo Bách Nghệ! Đạt 【${title}】 (giảm Cooldown & tăng tỉ lệ ra Tiên Phẩm)!`,
        'success'
      );
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(`Thăng cấp thông thạo: ${title}!`, 'success');
        window.TuTien.UI.renderFieldsPanel();
      }
      if (window.TuTien.Profile) {
        window.TuTien.Profile.render();
      }
    }
  },

  getHerbProductionPerSec() {
    const fieldsState = window.TuTien.State.data.fields;
    const linhDienState = this.getFieldState('linh_dien');
    const talent = this.getFieldTalentObj('linh_dien');

    let rate = 0.12 * linhDienState.rank * (0.5 + 0.5 * talent.multiplier);
    if (fieldsState.activeFieldId === 'linh_dien') {
      rate *= 2.2;
    }
    return rate;
  },

  /**
   * Thu hoạch Linh Thảo ở Linh Điền (chỉ thu hoạch 4 loại cơ bản `mapOnly: false`;
   * các Linh Thảo quý hiếm `mapOnly: true` chỉ xuất hiện trên Bản Đồ Xuất Quan!)
   */
  harvestRandomQualityHerb(qty = 1, bonusScore = 0.35, allowMapOnly = false) {
    const Inv = window.TuTien.Inventory;
    const allHerbs = window.TuTien.HERB_TYPES || [];
    const pool = allowMapOnly ? allHerbs : allHerbs.filter(h => !h.mapOnly);
    if (!Inv || !pool.length) return null;

    const chosenHerb = pool[Math.floor(Math.random() * pool.length)];
    const qualityObj = Inv.rollItemQuality('linh_dien', bonusScore, 1);
    const effectDesc = `${chosenHerb.desc} (Nguyên liệu ${qualityObj.name} x${qualityObj.mult})`;

    Inv.addStackableItem(
      'herb',
      chosenHerb.id,
      chosenHerb.name,
      chosenHerb.icon,
      qualityObj,
      effectDesc,
      qty
    );

    return { herb: chosenHerb, quality: qualityObj, qty };
  },

  update(dtMs) {
    const State = window.TuTien.State;
    const fieldsState = State.data.fields;
    const dtSec = dtMs / 1000;

    if (fieldsState.buffs.pillBoostRemainingMs > 0) {
      fieldsState.buffs.pillBoostRemainingMs = Math.max(
        0,
        fieldsState.buffs.pillBoostRemainingMs - dtMs
      );
    }
    if (fieldsState.buffs.combatBuffRemainingMs > 0) {
      fieldsState.buffs.combatBuffRemainingMs = Math.max(
        0,
        fieldsState.buffs.combatBuffRemainingMs - dtMs
      );
    }
    if (fieldsState.buffs.hpBuffRemainingMs > 0) {
      fieldsState.buffs.hpBuffRemainingMs = Math.max(
        0,
        fieldsState.buffs.hpBuffRemainingMs - dtMs
      );
    }
    if (fieldsState.buffs.talismanRemainingMs > 0) {
      fieldsState.buffs.talismanRemainingMs = Math.max(
        0,
        fieldsState.buffs.talismanRemainingMs - dtMs
      );
      fieldsState.buffs.autoClickAccumMs = (fieldsState.buffs.autoClickAccumMs || 0) + dtMs;
      if (fieldsState.buffs.autoClickAccumMs >= 600) {
        fieldsState.buffs.autoClickAccumMs -= 600;
        const autoGain = window.TuTien.Cultivate.getClickPower() * 0.45;
        window.TuTien.Cultivate.addQi(autoGain);
      }
    }

    const herbGain = this.getHerbProductionPerSec() * dtSec;
    fieldsState.herbs = (fieldsState.herbs || 0) + herbGain;
    fieldsState.herbGrowProgress = (fieldsState.herbGrowProgress || 0) + herbGain;

    if (fieldsState.herbGrowProgress >= 1.0) {
      const wholeHerbs = Math.floor(fieldsState.herbGrowProgress);
      fieldsState.herbGrowProgress -= wholeHerbs;
      this.harvestRandomQualityHerb(wholeHerbs, 0.35, false);
    }

    const activeId = fieldsState.activeFieldId;
    if (activeId) {
      const def = window.TuTien.FIELDS.find(f => f.id === activeId);
      if (def) {
        const passiveQi = window.TuTien.Cultivate.getBasePassiveRate();
        const qiCost = passiveQi * (def.qiDrainFactor || 0.1) * dtSec;
        let efficiency = 1.0;

        if (State.data.qi >= qiCost) {
          State.data.qi -= qiCost;
        } else {
          efficiency = 0.35;
        }

        const expGain = this.getFieldExpRatePerSec(activeId) * efficiency * dtSec;
        this.addFieldExp(activeId, expGain);
      }
    }
  },

  onCultivateClick() {
    const cfg = window.TuTien.CONFIG;
    const activeId = window.TuTien.State.data.fields.activeFieldId;
    if (!activeId) return;

    const expPerClick =
      this.getFieldExpRatePerSec(activeId) * (cfg.fieldClickExpSecondsEquivalent || 0.25);
    this.addFieldExp(activeId, expPerClick);
  },

  processOfflineFields(effectiveSec) {
    if (effectiveSec <= 0) return { herbsGained: 0, expGained: 0, activeFieldName: null };
    const fieldsState = window.TuTien.State.data.fields;

    const herbsGained = Math.floor(this.getHerbProductionPerSec() * effectiveSec * 0.85);
    fieldsState.herbs = (fieldsState.herbs || 0) + herbsGained;

    let remainingToBag = herbsGained;
    while (remainingToBag > 0) {
      const batch = Math.min(remainingToBag, 5);
      this.harvestRandomQualityHerb(batch, 0.35, false);
      remainingToBag -= batch;
    }

    let expGained = 0;
    let activeFieldName = null;
    if (fieldsState.activeFieldId) {
      const def = window.TuTien.FIELDS.find(f => f.id === fieldsState.activeFieldId);
      if (def) {
        activeFieldName = def.name;
        expGained = Math.floor(
          this.getFieldExpRatePerSec(fieldsState.activeFieldId) * effectiveSec * 0.85
        );
        this.addFieldExp(fieldsState.activeFieldId, expGained);
      }
    }

    return { herbsGained, expGained, activeFieldName };
  },

  craftPill(pillId) {
    const recipe = window.TuTien.PILL_RECIPES.find(r => r.id === pillId);
    if (!recipe) return false;

    if (!this.isPillRecipeUnlocked(recipe)) {
      window.TuTien.UI.showToast(
        `Chưa có Đan Phương 【${recipe.name}】! Hãy vào Xuất Quan mua từ Vân Du Thương Nhân hoặc săn Quái!`,
        'warn'
      );
      return false;
    }

    const Inv = window.TuTien.Inventory;
    const remCd = Inv.getRemainingCooldownSec('pill');
    if (remCd > 0) {
      window.TuTien.UI.showToast(`Lò đan đang nguội, cần chờ ${remCd.toFixed(1)}s nữa!`, 'warn');
      return false;
    }

    const State = window.TuTien.State;
    const alchemyRank = this.getFieldState('luyen_dan').rank;

    if (alchemyRank < recipe.minRank) {
      window.TuTien.UI.showToast(
        `Cần đạt ${window.TuTien.FIELD_RANKS[recipe.minRank - 1]} Đan Sư để luyện ${recipe.name}!`,
        'warn'
      );
      return false;
    }

    const qiCost = Math.round(60 * Math.pow(1.8, recipe.minRank - 1));
    const availableHerbCount = Inv.getHerbCountById(recipe.requiredHerbId);

    if (availableHerbCount < recipe.herbCost || State.data.qi < qiCost) {
      window.TuTien.UI.showToast(
        `Cần ${recipe.herbCost} ${recipe.requiredHerbName} (đang có ${availableHerbCount}) và ${window.TuTien.Utils.formatNumber(qiCost)} Linh Khí!`,
        'warn'
      );
      return false;
    }

    const avgHerbTier = Inv.consumeHerbsById(recipe.requiredHerbId, recipe.herbCost) || 1;
    State.data.qi -= qiCost;
    Inv.triggerCooldown('pill');

    window.TuTien.CraftingMinigame.start('alchemy', recipe.name, alchemyRank, scoreRatio => {
      const quality = Inv.rollItemQuality('luyen_dan', scoreRatio, avgHerbTier);
      const effectDesc = `${recipe.getEffectText(alchemyRank)} (Phẩm chất ${quality.name} x${quality.mult})`;
      Inv.addStackableItem('pill', recipe.id, recipe.name, recipe.icon, quality, effectDesc, 1);

      this.addFieldExp('luyen_dan', recipe.herbCost * 6);
      if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(quality.tier);

      State.addLog(
        `⚗️ Khống hỏa thành đan: 1 viên 【${recipe.name} — ${quality.name}】 (đã cất vào Túi Đồ)!`,
        'success'
      );
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(
          `Ra lò: ${recipe.name} [${quality.name}]! Mở Túi Đồ để dùng.`,
          'success',
          quality.tier >= 4 ? 'happy' : 'normal'
        );
        window.TuTien.UI.updateAll();
      }
    });

    return true;
  },

  getForgeArtifactCost(recipeId = "thanh_van_kiem") {
    const count = window.TuTien.State.data.fields.artifactsForged || 0;
    const recipes = window.TuTien.ARTIFACT_RECIPES || [];
    const rec = recipes.find(r => r.id === recipeId) || recipes[0];
    const base = (rec && rec.qiCostBase) || 220;
    return Math.round(base * Math.pow(1.45, count));
  },

  /**
   * Đúc Pháp Bảo Bản Mệnh từ nguyên liệu Sắt, Đá, Gỗ, Vàng (`ARTIFACT_RECIPES`)
   */
  forgeArtifact(recipeId = "thanh_van_kiem") {
    const Inv = window.TuTien.Inventory;
    const remCd = Inv.getRemainingCooldownSec("artifact");
    if (remCd > 0) {
      window.TuTien.UI.showToast(`Đỉnh luyện khí đang nung, chờ ${remCd.toFixed(1)}s nữa!`, "warn");
      return false;
    }

    const recipes = window.TuTien.ARTIFACT_RECIPES || [];
    const recipe = recipes.find(r => r.id === recipeId) || recipes[0];
    if (!recipe) return false;

    const State = window.TuTien.State;
    const fieldsState = State.data.fields;
    const cost = this.getForgeArtifactCost(recipe.id);

    if (!Inv.canAffordMaterials(recipe.materials) || State.data.qi < cost) {
      const reqStr = recipe.materials
        .map(m => `${m.count} ${m.icon} ${m.name} (có ${Inv.getMaterialCountById(m.id)})`)
        .join(", ");
      window.TuTien.UI.showToast(
        `Cần ${reqStr} và ${window.TuTien.Utils.formatNumber(cost)} Linh Khí để rèn ${recipe.name}!`,
        "warn"
      );
      return false;
    }

    const avgMatTier = Inv.consumeMaterialsList(recipe.materials) || 1;
    State.data.qi -= cost;
    fieldsState.artifactsForged = (fieldsState.artifactsForged || 0) + 1;
    Inv.triggerCooldown("artifact");

    const smithRank = this.getFieldState("luyen_khi").rank;

    window.TuTien.CraftingMinigame.start("forging", recipe.name, smithRank, scoreRatio => {
      const quality = Inv.rollItemQuality("luyen_khi", scoreRatio, avgMatTier);
      const created = Inv.addArtifactItem(quality, smithRank, recipe.id);

      this.addFieldExp("luyen_khi", 35 + fieldsState.artifactsForged * 10);
      if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(quality.tier);

      State.addLog(
        `🗡️ Đoán tạo thành công 【${created.name} — ${quality.name}】 (${created.effectDesc})!`,
        "success"
      );
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(
          `Đúc thành công: ${created.name} [${quality.name}]! Xem tại Túi Đồ.`,
          "success",
          quality.tier >= 4 ? "happy" : "normal"
        );
        window.TuTien.UI.updateAll();
      }
    });

    return true;
  },

  tendSpiritField() {
    const State = window.TuTien.State;
    const rank = this.getFieldState('linh_dien').rank;
    const qiCost = Math.max(30, Math.round(window.TuTien.Cultivate.getBasePassiveRate() * 7));

    if (State.data.qi < qiCost) {
      window.TuTien.UI.showToast(
        `Cần ${window.TuTien.Utils.formatNumber(qiCost)} Linh Khí để tưới Linh Tuyền!`,
        'warn'
      );
      return false;
    }

    State.data.qi -= qiCost;
    const qty = 2 + Math.floor(rank / 3);
    const harvested = this.harvestRandomQualityHerb(qty, 0.65, false);
    this.addFieldExp('linh_dien', 16 + rank * 4);

    if (harvested && window.TuTien.UI) {
      window.TuTien.UI.renderFieldsPanel();
      window.TuTien.UI.updateRealtimeHUD();
      window.TuTien.UI.showToast(
        `Thu hoạch: +${harvested.qty} ${harvested.herb.name} [${harvested.quality.name}]!`,
        'success'
      );
    }
    return true;
  },

  craftTalisman(talismanId = 'ti_loi_phu') {
    const recipe =
      window.TuTien.TALISMAN_RECIPES.find(r => r.id === talismanId) ||
      window.TuTien.TALISMAN_RECIPES[0];

    if (!this.isTalismanRecipeUnlocked(recipe)) {
      window.TuTien.UI.showToast(
        `Chưa có Phù Phương 【${recipe.name}】! Hãy vào Xuất Quan mua từ Vân Du Thương Nhân hoặc săn Quái!`,
        'warn'
      );
      return false;
    }

    const Inv = window.TuTien.Inventory;
    const remCd = Inv.getRemainingCooldownSec('talisman');
    if (remCd > 0) {
      window.TuTien.UI.showToast(`Bút chu sa đang tụ linh, chờ ${remCd.toFixed(1)}s nữa!`, 'warn');
      return false;
    }

    const State = window.TuTien.State;
    const qiCost = Math.max(40, Math.round(window.TuTien.Cultivate.getBasePassiveRate() * 6));
    const haveHerbs = Inv.getHerbCountById(recipe.requiredHerbId);

    if (haveHerbs < recipe.herbCost || State.data.qi < qiCost) {
      window.TuTien.UI.showToast(
        `Cần ${recipe.herbCost} ${recipe.requiredHerbName} (có ${haveHerbs}) và ${window.TuTien.Utils.formatNumber(qiCost)} Linh Khí!`,
        'warn'
      );
      return false;
    }

    const avgHerbTier = Inv.consumeHerbsById(recipe.requiredHerbId, recipe.herbCost) || 1;
    State.data.qi -= qiCost;
    Inv.triggerCooldown('talisman');

    const talismanRank = this.getFieldState('phu_luc').rank;

    window.TuTien.CraftingMinigame.start('talisman', recipe.name, talismanRank, scoreRatio => {
      const quality = Inv.rollItemQuality('phu_luc', scoreRatio, avgHerbTier);
      let effectDesc = recipe.description;

      if (recipe.skipChanceByTier) {
        const skipPct = Math.round((recipe.skipChanceByTier[quality.tier] || 0.25) * 100);
        effectDesc = `Chống Lôi Kiếp: ${skipPct}% tỉ lệ bỏ qua hoàn toàn Thiên Kiếp khi đột phá Đại Cảnh Giới`;
      }

      Inv.addStackableItem('talisman', recipe.id, recipe.name, recipe.icon, quality, effectDesc, 1);
      this.addFieldExp('phu_luc', 30);
      if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(quality.tier);

      State.addLog(
        `📜 Họa phù thành công: 1 lá 【${recipe.name} — ${quality.name}】 (đã cất vào Túi Đồ)!`,
        'success'
      );
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(
          `Đã vẽ: ${recipe.name} [${quality.name}]! Mở Túi Đồ để dùng.`,
          'success',
          quality.tier >= 4 ? 'happy' : 'normal'
        );
        window.TuTien.UI.updateAll();
      }
    });

    return true;
  },

  activateSpiritTalisman() {
    return this.craftTalisman('ti_loi_phu');
  },

  getPassiveMultiplierFromFields() {
    const fieldsState = window.TuTien.State.data.fields;
    const tranPhapRank = this.getFieldState('tran_phap').rank;
    const linhThucRank = this.getFieldState('linh_thuc').rank;

    const equipBonuses = window.TuTien.Inventory
      ? window.TuTien.Inventory.getEquippedArtifactBonuses()
      : { passiveMult: 1, clickMult: 1 };

    let mult = equipBonuses.passiveMult;
    mult *= 1 + (tranPhapRank - 1) * 0.05;
    mult *= 1 + (linhThucRank - 1) * 0.03;

    if (fieldsState.buffs.pillBoostRemainingMs > 0) {
      mult *= fieldsState.buffs.pillBoostMultiplier || 1.5;
    }

    if (fieldsState.buffs.talismanRemainingMs > 0) {
      mult *= fieldsState.buffs.talismanMultiplier || 1.8;
    }

    return mult;
  },

  getClickMultiplierFromFields() {
    const nguThuRank = this.getFieldState('ngu_thu').rank;
    const equipBonuses = window.TuTien.Inventory
      ? window.TuTien.Inventory.getEquippedArtifactBonuses()
      : { passiveMult: 1, clickMult: 1 };

    let mult = equipBonuses.clickMult;
    mult *= 1 + (nguThuRank - 1) * 0.04;
    return mult;
  },

  getOfflineHoursBonus() {
    const tranPhapRank = this.getFieldState('tran_phap').rank;
    return (tranPhapRank - 1) * 0.5;
  },

  getBoostDurationBonusMs() {
    const linhThucRank = this.getFieldState('linh_thuc').rank;
    return (linhThucRank - 1) * 150;
  },

  getMaxComboBonus() {
    const phuLucRank = this.getFieldState('phu_luc').rank;
    return (phuLucRank - 1) * 0.2;
  },

  getBreakthroughPenaltyReduction() {
    const fieldsState = window.TuTien.State.data.fields;
    const yThuatRank = this.getFieldState('y_thuat').rank;
    let reduction = Math.min(0.60, (yThuatRank - 1) * 0.05);

    if (fieldsState.buffs.protectNextBreakthrough) {
      reduction = 1 - (1 - reduction) * 0.35;
    }
    return Math.min(0.90, reduction);
  },

  handlePrestigeRetention(newTalentsMap) {
    const cfg = window.TuTien.CONFIG;
    const fieldsState = window.TuTien.State.data.fields;
    const retainRatio = cfg.fieldPrestigeRetainRatio || 0.20;

    window.TuTien.FIELDS.forEach(def => {
      const oldItem = this.getFieldState(def.id);
      const retainedTotalExp = Math.floor((oldItem.totalExp || 0) * retainRatio);

      fieldsState.items[def.id] = {
        rank: 1,
        exp: 0,
        totalExp: 0,
        talent: newTalentsMap[def.id] || 'normal'
      };
      if (retainedTotalExp > 0) {
        this.addFieldExp(def.id, retainedTotalExp);
      }
    });

    fieldsState.activeFieldId = null;
    fieldsState.artifactsForged = 0;
    fieldsState.buffs = {
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
    };
  }
};
