/**
 * js/breakthrough.js
 * Xử lý Đột Phá Cảnh Giới:
 * - Áp dụng độ chênh tỉ lệ đột phá của Chính Đạo (+0%) vs Ma Đạo (-15% tỉ lệ đột phá thành công!)
 * - Nhân hiệu quả của Phá Cảnh Tâm Kinh theo Phẩm Chất công pháp.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Breakthrough = {
  isMaxRealm() {
    return window.TuTien.State.data.realmIndex >= window.TuTien.REALMS.length - 1;
  },

  requiresLightningTribulation() {
    const realm = window.TuTien.State.getCurrentRealm();
    return realm.majorIndex >= 1 && realm.isMajorBottleneck === true;
  },

  canAttemptBreakthrough() {
    if (this.isMaxRealm()) return false;
    if (window.TuTien.Tribulation && window.TuTien.Tribulation.active) return false;
    const state = window.TuTien.State;
    const realm = state.getCurrentRealm();
    return state.data.qi >= realm.qiRequired;
  },

  getSuccessChance() {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const realm = state.getCurrentRealm();

    const root = state.getCurrentRoot();
    const qMult = Upgrades ? Upgrades.getUpgradeQualityObj('pha_canh_dan_lo').mult : 1;
    const furnaceBonus = state.getUpgradeLevel('pha_canh_dan_lo') * 0.015 * qMult;
    const prestigeBonus = state.getPrestigeUpgradeLevel('dao_van_thien_menh') * 0.03;
    const pityBonus = (state.data.pityFailCount || 0) * cfg.pityBonusPerFail;
    const pillBonus =
      (state.data.fields &&
        state.data.fields.buffs &&
        state.data.fields.buffs.nextBreakthroughBonus) ||
      0;

    // Hiệu ứng Chính Đạo / Ma Đạo (Ma Đạo bị giảm 15% tỉ lệ đột phá thành công!)
    const factionMod = window.TuTien.Character
      ? window.TuTien.Character.getFactionConfig().breakthroughChanceMod || 0
      : 0;

    if (!realm.isMajorBottleneck) {
      const baseMinor = 1.0 + factionMod; // Chính Đạo 100%, Ma Đạo 85% (+ bonus)
      return window.TuTien.Utils.clamp(
        baseMinor + root.bonuses.breakthroughBonus + furnaceBonus + prestigeBonus + pityBonus + pillBonus,
        0.35,
        1.0
      );
    }

    const totalChance =
      realm.breakthroughChance +
      factionMod +
      root.bonuses.breakthroughBonus +
      furnaceBonus +
      prestigeBonus +
      pityBonus +
      pillBonus;

    return window.TuTien.Utils.clamp(totalChance, cfg.minBreakthroughChance, 1.0);
  },

  getFailPenaltyRatio() {
    const state = window.TuTien.State;
    const realm = state.getCurrentRealm();
    const baseFail = realm.isMajorBottleneck ? realm.failPenalty : 0.15;

    const prestigeGuardLvl = state.getPrestigeUpgradeLevel('dao_van_thien_menh');
    const prestigeReduction = Math.min(0.75, prestigeGuardLvl * 0.05);
    const fieldReduction = window.TuTien.Fields
      ? window.TuTien.Fields.getBreakthroughPenaltyReduction()
      : 0;

    const basePenalty = baseFail * (1 - prestigeReduction) * (1 - fieldReduction);
    return Math.max(0.03, basePenalty);
  },

  attemptBreakthrough() {
    if (!this.canAttemptBreakthrough()) return false;

    const state = window.TuTien.State;
    const data = state.data;
    const nextRealm = state.getNextRealm();
    if (!nextRealm) return false;

    const chance = this.getSuccessChance();
    const roll = Math.random();

    if (roll > chance) {
      this.applyFailurePenalty(false);
      return false;
    }

    if (!this.requiresLightningTribulation()) {
      this.resolveTribulationOutcome(true);
      return true;
    }

    let skipChance = (data.fields.buffs && data.fields.buffs.antiLightningSkipChance) || 0;
    let usedTalismanQuality = data.fields.buffs && data.fields.buffs.antiLightningQualityName;

    if (skipChance <= 0 && window.TuTien.Inventory) {
      const bag = window.TuTien.Inventory.getBagData();
      const bestAntiTalisman = bag.items
        .filter(it => it.category === 'talisman' && it.templateId === 'ti_loi_phu' && it.count > 0)
        .sort((a, b) => b.qualityTier - a.qualityTier)[0];

      if (bestAntiTalisman) {
        const recipe = window.TuTien.TALISMAN_RECIPES.find(r => r.id === 'ti_loi_phu');
        skipChance = (recipe && recipe.skipChanceByTier[bestAntiTalisman.qualityTier]) || 0.25;
        usedTalismanQuality = bestAntiTalisman.qualityName;
        bestAntiTalisman.count -= 1;
        if (bestAntiTalisman.count <= 0) {
          bag.items = bag.items.filter(x => x.uid !== bestAntiTalisman.uid);
        }
      }
    }

    if (data.fields && data.fields.buffs) {
      data.fields.buffs.antiLightningSkipChance = 0;
      data.fields.buffs.antiLightningQualityName = null;
    }

    if (skipChance > 0) {
      if (Math.random() <= skipChance) {
        state.addLog(
          `⚡ 【Tị Lôi Thiên Phù — ${usedTalismanQuality || 'Linh Phù'}】 phát sáng vạn trượng, đánh tan mây Cửu Thiên Lôi Kiếp! Đột phá thẳng lên 【${nextRealm.fullName}】!`,
          'success'
        );
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(
            `Tị Lôi Thiên Phù [${usedTalismanQuality}] đã hóa giải hoàn toàn Lôi Kiếp!`,
            'success',
            'happy'
          );
        }
        this.resolveTribulationOutcome(true);
        return true;
      } else {
        state.addLog(
          `⚡ 【Tị Lôi Thiên Phù — ${usedTalismanQuality}】 cản được một phần uy áp (${Math.round(skipChance * 100)}%), vẫn phải thân chinh Độ Lôi Kiếp (được cộng +1 Khiên Hộ Thể)!`,
          'info'
        );
        if (window.TuTien.Tribulation) {
          window.TuTien.Tribulation.startTribulation(nextRealm, 1);
          return true;
        }
      }
    }

    if (window.TuTien.Tribulation) {
      window.TuTien.Tribulation.startTribulation(nextRealm, 0);
      return true;
    } else {
      this.resolveTribulationOutcome(true);
      return true;
    }
  },

  resolveTribulationOutcome(survivedLightning) {
    const state = window.TuTien.State;
    const data = state.data;
    const currentRealm = state.getCurrentRealm();
    const nextRealm = state.getNextRealm();
    if (!nextRealm) return;

    if (survivedLightning) {
      data.qi = Math.max(0, data.qi - currentRealm.qiRequired);
      const wasMajorBottleneck = currentRealm.isMajorBottleneck;

      data.realmIndex += 1;
      data.pityFailCount = 0;
      data.stats.totalBreakthroughs += 1;
      if (data.realmIndex > data.stats.highestRealmIndex) {
        data.stats.highestRealmIndex = data.realmIndex;
      }

      if (data.fields && data.fields.buffs) {
        data.fields.buffs.nextBreakthroughBonus = 0;
        data.fields.buffs.protectNextBreakthrough = false;
      }

      if (window.TuTien.Audio) {
        window.TuTien.Audio.playBreakthroughSuccess(wasMajorBottleneck);
      }

      if (wasMajorBottleneck) {
        state.addLog(
          `🌟 ĐỘT PHÁ ĐẠI CẢNH GIỚI! Bước vào 【${nextRealm.fullName}】 (${nextRealm.macroRealm})! Chỉ số Máu, Linh Lực, Tốc Độ, Sức Mạnh và trần cấp Công Pháp tăng vọt!`,
          'success'
        );
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(
            `Đột phá Đại Cảnh Giới: ${nextRealm.fullName}!`,
            'success',
            'happy'
          );
          window.TuTien.UI.setCompanionMood('happy', `Bước vào ${nextRealm.majorName} rồi, chỉ số chiến đấu tăng mạnh!`);
          window.TuTien.UI.triggerBreakthroughFlash(nextRealm.auraColor);
        }
      } else {
        state.addLog(
          `✦ Đột phá thành công lên 【${nextRealm.fullName}】 (${nextRealm.tierLabel}).`,
          'success'
        );
      }

      if (window.TuTien.Events) window.TuTien.Events.checkAchievements();
      if (window.TuTien.UI) window.TuTien.UI.updateAll();
      if (window.TuTien.Profile) window.TuTien.Profile.render();
    } else {
      this.applyFailurePenalty(true);
    }
  },

  applyFailurePenalty(failedInTribulation = false) {
    const state = window.TuTien.State;
    const data = state.data;
    const penaltyRatio = this.getFailPenaltyRatio();
    const lostQi = Math.floor(data.qi * penaltyRatio);
    data.qi = Math.max(0, data.qi - lostQi);
    data.pityFailCount = (data.pityFailCount || 0) + 1;
    data.stats.failedBreakthroughs += 1;

    if (data.fields && data.fields.buffs) {
      data.fields.buffs.nextBreakthroughBonus = 0;
      data.fields.buffs.protectNextBreakthrough = false;
    }

    if (window.TuTien.Audio) {
      window.TuTien.Audio.playBreakthroughFail();
    }

    const formattedLost = window.TuTien.Utils.formatNumber(lostQi);
    let dropMsg = '';

    if (failedInTribulation && data.realmIndex > 0) {
      const dropSteps = window.TuTien.CONFIG.tribulation.realmDropOnFail || 1;
      data.realmIndex = Math.max(0, data.realmIndex - dropSteps);
      const droppedRealm = state.getCurrentRealm();
      dropMsg = ` Bị Thiên Lôi đánh tụt cảnh giới về 【${droppedRealm.fullName}】!`;
    }

    const nextChancePct = Math.round(this.getSuccessChance() * 100);
    state.addLog(
      `⚡ Đột phá thất bại! Tổn thất ${formattedLost} linh khí.${dropMsg} (Tỉ lệ lần sau: ${nextChancePct}%)`,
      'warn'
    );

    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(
        `Đột phá thất bại! -${formattedLost} Linh Khí.${dropMsg}`,
        'warn',
        'angry'
      );
      window.TuTien.UI.setCompanionMood('angry', 'Khụ khụ... Bình cảnh thật hiểm ác, phải chuẩn bị kỹ hơn!');
      window.TuTien.UI.updateAll();
    }
    if (window.TuTien.Profile) {
      window.TuTien.Profile.render();
    }
  }
};
