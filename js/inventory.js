/**
 * js/inventory.js
 * Hệ thống Túi Trữ Vật (Inventory) & Kho Linh Thạch 3 Bậc:
 * - Quản lý Linh Thạch Hạ Phẩm, Trung Phẩm, Thượng Phẩm (100 Hạ = 1 Trung, 100 Trung = 1 Thượng).
 * - Quản lý Pháp Bảo, 9 loại Đan Dược, 6 loại Linh Phù và 10 loại Linh Thảo có 5 bậc Phẩm Chất.
 */
window.TuTien = window.TuTien || {};

window.TuTien.ITEM_QUALITIES = [
  { id: 'ha_pham', tier: 1, name: 'Hạ Phẩm', mult: 1.0, color: '#cbd5e1', baseWeight: 50 },
  { id: 'trung_pham', tier: 2, name: 'Trung Phẩm', mult: 1.4, color: '#4ade80', baseWeight: 30 },
  { id: 'thuong_pham', tier: 3, name: 'Thượng Phẩm', mult: 2.0, color: '#38bdf8', baseWeight: 13 },
  { id: 'cuc_pham', tier: 4, name: 'Cực Phẩm', mult: 3.0, color: '#c084fc', baseWeight: 5.5 },
  { id: 'tien_pham', tier: 5, name: 'Tiên Phẩm', mult: 4.5, color: '#fbbf24', baseWeight: 1.5 }
];

window.TuTien.ARTIFACT_TEMPLATES = [
  { id: 'thanh_van_kiem', name: 'Thanh Vân Phi Kiếm', icon: '🗡️', focus: 'click' },
  { id: 'huyen_nguyen_chung', name: 'Huyền Nguyên Linh Chung', icon: '🔔', focus: 'passive' },
  { id: 'thai_at_kinh', name: 'Thái Ất Bảo Kính', icon: '💠', focus: 'balanced' },
  { id: 'cuu_long_dinh', name: 'Cửu Long Thần Đỉnh', icon: '🏺', focus: 'passive' },
  { id: 'tu_dien_chuy', name: 'Tử Điện Lôi Chùy', icon: '🔨', focus: 'click' }
];

window.TuTien.Inventory = {
  activeFilter: 'all',

  getBagData() {
    const data = window.TuTien.State.data;
    if (!data.inventory) {
      data.inventory = {
        nextUid: 1,
        items: [],
        cooldowns: {
          pillReadyAt: 0,
          artifactReadyAt: 0,
          talismanReadyAt: 0
        }
      };
    }
    return data.inventory;
  },

  // =========================================================================
  // HỆ THỐNG LINH THẠCH 3 BẬC (100 HẠ PHẨM = 1 TRUNG PHẨM, 100 TRUNG PHẨM = 1 THƯỢNG PHẨM)
  // =========================================================================
  getSpiritStones() {
    const data = window.TuTien.State.data;
    if (!data.spiritStones) {
      data.spiritStones = { low: 0, mid: 0, high: 0 };
    }
    return data.spiritStones;
  },

  /**
   * Tổng giá trị quy đổi ra đơn vị Linh Thạch Hạ Phẩm (1 Thượng = 10,000 Hạ; 1 Trung = 100 Hạ)
   */
  getTotalSpiritStonesInLow() {
    const st = this.getSpiritStones();
    return (st.low || 0) + (st.mid || 0) * 100 + (st.high || 0) * 10000;
  },

  /**
   * Tự động chuẩn hóa quy đổi: cứ 100 Hạ Phẩm -> 1 Trung Phẩm, cứ 100 Trung Phẩm -> 1 Thượng Phẩm
   */
  normalizeSpiritStones() {
    const st = this.getSpiritStones();
    let totalLow = Math.max(0, Math.floor(this.getTotalSpiritStonesInLow()));
    st.high = Math.floor(totalLow / 10000);
    totalLow %= 10000;
    st.mid = Math.floor(totalLow / 100);
    st.low = totalLow % 100;
    return st;
  },

  addSpiritStones(lowAdd = 0, midAdd = 0, highAdd = 0) {
    const st = this.getSpiritStones();
    st.low = (st.low || 0) + lowAdd;
    st.mid = (st.mid || 0) + midAdd;
    st.high = (st.high || 0) + highAdd;
    this.normalizeSpiritStones();
    return st;
  },

  canAffordSpiritStonesInLow(costInLow) {
    return this.getTotalSpiritStonesInLow() >= costInLow;
  },

  spendSpiritStonesInLow(costInLow) {
    const total = this.getTotalSpiritStonesInLow();
    if (total < costInLow) return false;
    const remain = total - costInLow;
    const st = this.getSpiritStones();
    st.high = Math.floor(remain / 10000);
    const remAfterHigh = remain % 10000;
    st.mid = Math.floor(remAfterHigh / 100);
    st.low = remAfterHigh % 100;
    return true;
  },

  formatSpiritStoneCost(costInLow) {
    if (costInLow >= 10000) {
      const high = Math.floor(costInLow / 10000);
      const mid = Math.floor((costInLow % 10000) / 100);
      return mid > 0
        ? `${high} Thượng • ${mid} Trung Phẩm LT`
        : `${high} Linh Thạch Thượng Phẩm`;
    }
    if (costInLow >= 100) {
      const mid = Math.floor(costInLow / 100);
      const low = costInLow % 100;
      return low > 0
        ? `${mid} Trung • ${low} Hạ Phẩm LT`
        : `${mid} Linh Thạch Trung Phẩm`;
    }
    return `${costInLow} Linh Thạch Hạ Phẩm`;
  },

  getQualityByTier(tier) {
    const clamped = window.TuTien.Utils.clamp(Math.round(tier), 1, 5);
    return (
      window.TuTien.ITEM_QUALITIES.find(q => q.tier === clamped) ||
      window.TuTien.ITEM_QUALITIES[0]
    );
  },

  rollItemQuality(fieldId, minigameScoreRatio = 0.5, herbQualityBonusTier = 1) {
    const Fields = window.TuTien.Fields;
    const rank = Fields.getFieldState(fieldId).rank;
    const talentMult = Fields.getFieldTalentObj(fieldId).multiplier;

    const masteryFactor =
      1 +
      (rank - 1) * 0.28 +
      (talentMult - 1) * 0.35 +
      minigameScoreRatio * 1.65 +
      (herbQualityBonusTier - 1) * 0.55;

    const weighted = window.TuTien.ITEM_QUALITIES.map(q => {
      let w = q.baseWeight;
      if (q.tier >= 2) {
        w *= Math.pow(masteryFactor, q.tier - 1);
      }
      if (minigameScoreRatio >= 0.88 && q.tier === 1) {
        w = 0.1;
      }
      return { quality: q, weight: w };
    });

    const total = weighted.reduce((s, x) => s + x.weight, 0);
    let rand = Math.random() * total;
    for (const entry of weighted) {
      if (rand < entry.weight) return entry.quality;
      rand -= entry.weight;
    }
    return weighted[0].quality;
  },

  getCraftCooldownSec(category) {
    const cfg = window.TuTien.CONFIG.crafting;
    const Fields = window.TuTien.Fields;
    let baseSec = cfg.pillBaseCooldownSec;
    let fieldId = 'luyen_dan';

    if (category === 'artifact') {
      baseSec = cfg.artifactBaseCooldownSec;
      fieldId = 'luyen_khi';
    } else if (category === 'talisman') {
      baseSec = cfg.talismanBaseCooldownSec;
      fieldId = 'phu_luc';
    }

    const rank = Fields.getFieldState(fieldId).rank;
    const reduction = Math.min(0.65, (rank - 1) * cfg.cooldownReductionPerRank);
    return Math.max(4, Number((baseSec * (1 - reduction)).toFixed(1)));
  },

  getRemainingCooldownSec(category) {
    const bag = this.getBagData();
    const now = Date.now();
    const key =
      category === 'artifact'
        ? 'artifactReadyAt'
        : category === 'talisman'
        ? 'talismanReadyAt'
        : 'pillReadyAt';
    const readyAt = bag.cooldowns[key] || 0;
    return Math.max(0, (readyAt - now) / 1000);
  },

  triggerCooldown(category) {
    const bag = this.getBagData();
    const cdSec = this.getCraftCooldownSec(category);
    const key =
      category === 'artifact'
        ? 'artifactReadyAt'
        : category === 'talisman'
        ? 'talismanReadyAt'
        : 'pillReadyAt';
    bag.cooldowns[key] = Date.now() + cdSec * 1000;
  },

  addStackableItem(category, templateId, name, icon, qualityObj, effectDesc, qty = 1, extraMeta = {}) {
    const bag = this.getBagData();
    const existing = bag.items.find(
      it =>
        it.category === category &&
        it.templateId === templateId &&
        it.qualityTier === qualityObj.tier
    );

    if (existing) {
      existing.count = (existing.count || 1) + qty;
      existing.effectDesc = effectDesc;
      return existing;
    }

    const newItem = {
      uid: bag.nextUid++,
      category,
      templateId,
      name,
      icon,
      qualityTier: qualityObj.tier,
      qualityName: qualityObj.name,
      qualityColor: qualityObj.color,
      mult: qualityObj.mult,
      effectDesc,
      count: qty,
      ...extraMeta
    };
    bag.items.unshift(newItem);
    return newItem;
  },

  getHerbCountById(herbId) {
    const bag = this.getBagData();
    let sum = 0;
    bag.items.forEach(it => {
      if (it.category === 'herb' && it.templateId === herbId) {
        sum += it.count || 0;
      }
    });
    return sum;
  },

  consumeHerbsById(herbId, neededCount) {
    if (this.getHerbCountById(herbId) < neededCount) return null;
    const bag = this.getBagData();

    const matching = bag.items
      .filter(it => it.category === 'herb' && it.templateId === herbId && it.count > 0)
      .sort((a, b) => b.qualityTier - a.qualityTier);

    let remain = neededCount;
    let tierSum = 0;

    for (const stack of matching) {
      if (remain <= 0) break;
      const take = Math.min(remain, stack.count);
      stack.count -= take;
      remain -= take;
      tierSum += take * stack.qualityTier;
    }

    bag.items = bag.items.filter(it => !(it.category === 'herb' && it.count <= 0));
    return tierSum / neededCount;
  },

  addArtifactItem(qualityObj, smithRank) {
    const bag = this.getBagData();
    const templates = window.TuTien.ARTIFACT_TEMPLATES;
    const tpl = templates[Math.floor(Math.random() * templates.length)];

    const baseStat = (0.08 + smithRank * 0.025) * qualityObj.mult;
    const passiveBonus =
      tpl.focus === 'passive'
        ? baseStat * 1.35
        : tpl.focus === 'balanced'
        ? baseStat
        : baseStat * 0.65;
    const clickBonus =
      tpl.focus === 'click'
        ? baseStat * 1.45
        : tpl.focus === 'balanced'
        ? baseStat
        : baseStat * 0.65;

    const realmFactor = Math.max(1, Math.floor(window.TuTien.State.data.realmIndex / 3) + 1);
    const combatHp = Math.round(25 * qualityObj.mult * smithRank * realmFactor);
    const combatMp = Math.round(18 * qualityObj.mult * smithRank * realmFactor);
    const combatAtk = Math.round(6 * qualityObj.mult * smithRank * realmFactor);
    const combatSpd = Math.round(2 * qualityObj.mult * Math.ceil(smithRank / 2));

    const equippedCount = bag.items.filter(it => it.category === 'artifact' && it.equipped).length;
    const maxEquip = window.TuTien.CONFIG.crafting.maxEquippedArtifacts || 3;
    const autoEquip = equippedCount < maxEquip;

    const item = {
      uid: bag.nextUid++,
      category: 'artifact',
      templateId: tpl.id,
      name: tpl.name,
      icon: tpl.icon,
      qualityTier: qualityObj.tier,
      qualityName: qualityObj.name,
      qualityColor: qualityObj.color,
      mult: qualityObj.mult,
      passiveBonus: Number(passiveBonus.toFixed(3)),
      clickBonus: Number(clickBonus.toFixed(3)),
      combatStats: {
        hp: combatHp,
        mp: combatMp,
        attack: combatAtk,
        speed: combatSpd
      },
      equipped: autoEquip,
      effectDesc: `+${Math.round(passiveBonus * 100)}% Nền • +${Math.round(clickBonus * 100)}% Click • ⚔️+${combatAtk} Công • ❤️+${combatHp} Máu • 💨+${combatSpd} Tốc`
    };

    bag.items.unshift(item);
    return item;
  },

  toggleEquipArtifact(uid) {
    const bag = this.getBagData();
    const item = bag.items.find(it => it.uid === uid && it.category === 'artifact');
    if (!item) return false;

    if (item.equipped) {
      item.equipped = false;
      window.TuTien.UI.showToast(`Đã tháo ${item.name} [${item.qualityName}]`, 'info');
    } else {
      const maxEquip = window.TuTien.CONFIG.crafting.maxEquippedArtifacts || 3;
      const equippedList = bag.items.filter(it => it.category === 'artifact' && it.equipped);
      if (equippedList.length >= maxEquip) {
        window.TuTien.UI.showToast(
          `Chỉ có thể trang bị tối đa ${maxEquip} Pháp Bảo Bản Mệnh! Hãy tháo bớt 1 món trước.`,
          'warn'
        );
        return false;
      }
      item.equipped = true;
      window.TuTien.UI.showToast(`Đã trang bị ${item.name} [${item.qualityName}]!`, 'success');
    }

    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    return true;
  },

  salvageArtifact(uid) {
    const bag = this.getBagData();
    const idx = bag.items.findIndex(it => it.uid === uid && it.category === 'artifact');
    if (idx === -1) return false;

    const item = bag.items[idx];
    const refundQi = Math.round(90 * item.mult * (window.TuTien.State.data.realmIndex + 1));
    bag.items.splice(idx, 1);
    window.TuTien.Cultivate.addQi(refundQi);

    window.TuTien.UI.showToast(
      `Đã phân giải ${item.name} [${item.qualityName}], thu hồi +${window.TuTien.Utils.formatNumber(refundQi)} Linh Khí!`,
      'info'
    );
    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    return true;
  },

  /**
   * Sử dụng 1 viên Đan Dược hoặc 1 lá Phù Văn từ Túi Trữ Vật (hỗ trợ đầy đủ 9 loại Đan & 6 loại Linh Phù)
   */
  useConsumableItem(uid) {
    const bag = this.getBagData();
    const idx = bag.items.findIndex(it => it.uid === uid);
    if (idx === -1) return false;

    const item = bag.items[idx];
    const State = window.TuTien.State;
    const fieldsState = State.data.fields;
    if (!State.data.character.permBonusStats) {
      State.data.character.permBonusStats = { hp: 0, mp: 0, speed: 0, attack: 0 };
    }
    const perm = State.data.character.permBonusStats;

    if (item.category === 'pill') {
      if (item.templateId === 'tu_khi_dan') {
        const boostMult = Number((1.35 + 0.35 * item.mult).toFixed(2));
        const durationSec = Math.round(45 + 15 * item.mult);
        fieldsState.buffs.pillBoostRemainingMs += durationSec * 1000;
        fieldsState.buffs.pillBoostMultiplier = Math.max(
          fieldsState.buffs.pillBoostMultiplier || 1.5,
          boostMult
        );
        State.addLog(
          `🟢 Phục dụng 【${item.name} - ${item.qualityName}】: Tốc độ hấp thụ x${boostMult} trong ${durationSec}s!`,
          'success'
        );
      } else if (item.templateId === 'pha_canh_dan') {
        const addChance = Number((0.08 * item.mult).toFixed(3));
        fieldsState.buffs.nextBreakthroughBonus = Math.min(
          0.65,
          (fieldsState.buffs.nextBreakthroughBonus || 0) + addChance
        );
        State.addLog(
          `🟡 Phục dụng 【${item.name} - ${item.qualityName}】: +${Math.round(addChance * 100)}% tỉ lệ cho lần Đột Phá kế tiếp!`,
          'success'
        );
      } else if (item.templateId === 'hoi_nguyen_dan') {
        const durationSec = Math.round(90 * item.mult);
        const hpMult = Number((1.25 + 0.15 * item.mult).toFixed(2));
        fieldsState.buffs.protectNextBreakthrough = true;
        fieldsState.buffs.hpBuffRemainingMs = (fieldsState.buffs.hpBuffRemainingMs || 0) + durationSec * 1000;
        fieldsState.buffs.hpBuffMultiplier = Math.max(fieldsState.buffs.hpBuffMultiplier || 1.4, hpMult);
        State.addLog(
          `🔵 Phục dụng 【${item.name} - ${item.qualityName}】: Tạm thời x${hpMult} Máu trong ${durationSec}s & hộ mạch đột phá!`,
          'success'
        );
      } else if (item.templateId === 'cuong_bao_dan') {
        const durationSec = Math.round(90 * item.mult);
        const combatMult = Number((1.25 + 0.20 * item.mult).toFixed(2));
        fieldsState.buffs.combatBuffRemainingMs =
          (fieldsState.buffs.combatBuffRemainingMs || 0) + durationSec * 1000;
        fieldsState.buffs.combatBuffMultiplier = Math.max(
          fieldsState.buffs.combatBuffMultiplier || 1.45,
          combatMult
        );
        State.addLog(
          `🔴 Phục dụng 【${item.name} - ${item.qualityName}】: Tạm thời x${combatMult} Sức Mạnh & Tốc Độ trong ${durationSec}s!`,
          'success'
        );
      } else if (item.templateId === 'han_ngoc_dan') {
        const durationSec = Math.round(90 * item.mult);
        const addMp = Math.round(45 * item.mult);
        const addHp = Math.round(30 * item.mult);
        perm.mp = (perm.mp || 0) + addMp;
        perm.hp = (perm.hp || 0) + addHp;
        fieldsState.buffs.pillBoostRemainingMs += durationSec * 1000;
        fieldsState.buffs.pillBoostMultiplier = Math.max(fieldsState.buffs.pillBoostMultiplier || 1.5, 2.2);
        State.addLog(
          `❄️ Phục dụng 【${item.name} - ${item.qualityName}】: x2.2 tốc độ nền (${durationSec}s) & Vĩnh viễn +${addMp} Linh Lực, +${addHp} Máu!`,
          'success'
        );
      } else if (item.templateId === 'xich_viem_ba_dan') {
        const durationSec = Math.round(120 * item.mult);
        const addAtk = Math.round(15 * item.mult);
        const addHp = Math.round(50 * item.mult);
        perm.attack = (perm.attack || 0) + addAtk;
        perm.hp = (perm.hp || 0) + addHp;
        fieldsState.buffs.combatBuffRemainingMs = (fieldsState.buffs.combatBuffRemainingMs || 0) + durationSec * 1000;
        fieldsState.buffs.combatBuffMultiplier = Math.max(fieldsState.buffs.combatBuffMultiplier || 1.5, 1.65);
        State.addLog(
          `🔥 Phục dụng 【${item.name} - ${item.qualityName}】: Cuồng hóa chiến lực (${durationSec}s) & Vĩnh viễn +${addAtk} Sức Mạnh, +${addHp} Máu!`,
          'success'
        );
      } else if (item.templateId === 'u_minh_than_dan') {
        const durationSec = Math.round(120 * item.mult);
        const addSpd = Math.round(6 * item.mult);
        const addAtk = Math.round(10 * item.mult);
        perm.speed = (perm.speed || 0) + addSpd;
        perm.attack = (perm.attack || 0) + addAtk;
        fieldsState.buffs.combatBuffRemainingMs = (fieldsState.buffs.combatBuffRemainingMs || 0) + durationSec * 1000;
        fieldsState.buffs.combatBuffMultiplier = Math.max(fieldsState.buffs.combatBuffMultiplier || 1.5, 1.6);
        State.addLog(
          `🟣 Phục dụng 【${item.name} - ${item.qualityName}】: Thần tốc chiến đấu (${durationSec}s) & Vĩnh viễn +${addSpd} Tốc Độ, +${addAtk} Sức Mạnh!`,
          'success'
        );
      } else if (item.templateId === 'long_huyet_dan') {
        const addHp = Math.round(45 * item.mult);
        const addMp = Math.round(35 * item.mult);
        const addAtk = Math.round(10 * item.mult);
        const addSpd = Math.max(1, Math.round(3 * item.mult));
        perm.hp = (perm.hp || 0) + addHp;
        perm.mp = (perm.mp || 0) + addMp;
        perm.attack = (perm.attack || 0) + addAtk;
        perm.speed = (perm.speed || 0) + addSpd;
        State.addLog(
          `🐉 Phục dụng 【${item.name} - ${item.qualityName}】: Tăng VĨNH VIỄN +${addHp} Máu, +${addMp} Linh Lực, +${addAtk} Sức Mạnh, +${addSpd} Tốc Độ!`,
          'success'
        );
      } else if (item.templateId === 'cuu_chuyen_kim_dan') {
        const addHp = Math.round(150 * item.mult);
        const addMp = Math.round(120 * item.mult);
        const addAtk = Math.round(35 * item.mult);
        const addSpd = Math.round(10 * item.mult);
        perm.hp = (perm.hp || 0) + addHp;
        perm.mp = (perm.mp || 0) + addMp;
        perm.attack = (perm.attack || 0) + addAtk;
        perm.speed = (perm.speed || 0) + addSpd;
        fieldsState.buffs.nextBreakthroughBonus = Math.min(
          0.85,
          (fieldsState.buffs.nextBreakthroughBonus || 0) + 0.25
        );
        State.addLog(
          `👑 Phục dụng Thần Đan 【${item.name} - ${item.qualityName}】: Tăng VĨNH VIỄN +${addHp} Máu, +${addMp} Linh Lực, +${addAtk} Công, +${addSpd} Tốc & +25% Đột Phá!`,
          'success'
        );
      }
    } else if (item.category === 'talisman') {
      if (item.templateId === 'ti_loi_phu' || item.templateId === 'cuu_thien_khien_phu') {
        const recipe = window.TuTien.TALISMAN_RECIPES.find(r => r.id === item.templateId);
        const skipChance =
          (recipe && recipe.skipChanceByTier && recipe.skipChanceByTier[item.qualityTier]) || 0.45;
        fieldsState.buffs.antiLightningSkipChance = Math.max(
          fieldsState.buffs.antiLightningSkipChance || 0,
          skipChance
        );
        fieldsState.buffs.antiLightningQualityName = item.qualityName;
        if (item.templateId === 'cuu_thien_khien_phu') {
          fieldsState.buffs.protectNextBreakthrough = true;
        }
        State.addLog(
          `⚡ Đã tế luyện 【${item.name} - ${item.qualityName}】: ${Math.round(skipChance * 100)}% tỉ lệ bỏ qua hoàn toàn Lôi Kiếp ở lần đột phá Đại Cảnh Giới tiếp theo!`,
          'success'
        );
      } else if (item.templateId === 'kim_cang_ho_phu') {
        const durationSec = Math.round(120 * item.mult);
        fieldsState.buffs.hpBuffRemainingMs = (fieldsState.buffs.hpBuffRemainingMs || 0) + durationSec * 1000;
        fieldsState.buffs.hpBuffMultiplier = Math.max(fieldsState.buffs.hpBuffMultiplier || 1.4, Number((1.45 + 0.2 * item.mult).toFixed(2)));
        fieldsState.buffs.protectNextBreakthrough = true;
        State.addLog(
          `🛡️ Kích hoạt 【${item.name} - ${item.qualityName}】: x${fieldsState.buffs.hpBuffMultiplier} Máu tối đa trong ${durationSec}s & hộ mạch!`,
          'success'
        );
      } else if (item.templateId === 'thien_kiem_tram_phu') {
        const durationSec = Math.round(120 * item.mult);
        fieldsState.buffs.combatBuffRemainingMs = (fieldsState.buffs.combatBuffRemainingMs || 0) + durationSec * 1000;
        fieldsState.buffs.combatBuffMultiplier = Math.max(fieldsState.buffs.combatBuffMultiplier || 1.5, Number((1.55 + 0.25 * item.mult).toFixed(2)));
        State.addLog(
          `🗡️ Kích hoạt 【${item.name} - ${item.qualityName}】: x${fieldsState.buffs.combatBuffMultiplier} Sức Mạnh & Tốc Độ chiến đấu trong ${durationSec}s!`,
          'success'
        );
      } else {
        const durationSec = Math.round(45 * item.mult);
        fieldsState.buffs.talismanRemainingMs += durationSec * 1000;
        fieldsState.buffs.talismanMultiplier = Number((1.65 + 0.35 * item.mult).toFixed(2));
        State.addLog(
          `📜 Kích hoạt 【${item.name} - ${item.qualityName}】: x${fieldsState.buffs.talismanMultiplier} tốc độ & tự vận công trong ${durationSec}s!`,
          'success'
        );
      }
    } else {
      return false;
    }

    item.count = (item.count || 1) - 1;
    if (item.count <= 0) {
      bag.items.splice(idx, 1);
    }

    if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(item.qualityTier);
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`Đã dùng ${item.name} [${item.qualityName}]!`, 'success');
      window.TuTien.UI.updateAll();
    }
    return true;
  },

  getEquippedArtifactBonuses() {
    const bag = this.getBagData();
    let passiveAdd = 0;
    let clickAdd = 0;

    bag.items.forEach(it => {
      if (it.category === 'artifact' && it.equipped) {
        passiveAdd += it.passiveBonus || 0;
        clickAdd += it.clickBonus || 0;
      }
    });

    return {
      passiveMult: 1 + passiveAdd,
      clickMult: 1 + clickAdd
    };
  }
};
