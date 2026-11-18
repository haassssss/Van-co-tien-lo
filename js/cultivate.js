/**
 * js/cultivate.js
 * Xử lý tốc độ hấp thụ linh khí nền và vận công:
 * - Áp dụng hệ số Chính Đạo (x1.0) vs Ma Đạo (x1.65)
 * - Nhân hiệu quả của từng Công Pháp với hệ số Phẩm Chất của Công Pháp đó!
 */
window.TuTien = window.TuTien || {};

window.TuTien.Cultivate = {
  getBasePassiveRate() {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const realm = state.getCurrentRealm();
    const root = state.getCurrentRoot();

    // 1. Tốc độ cơ bản + cộng thẳng từ Tụ Linh Trận (nhân theo Phẩm Chất công pháp)
    const tuLinhMult = Upgrades ? Upgrades.getUpgradeQualityObj('tu_linh_tran').mult : 1;
    const flatBonus = state.getUpgradeLevel('tu_linh_tran') * 1.2 * tuLinhMult;
    let rate = (cfg.basePassiveRate + flatBonus) * realm.passiveMultiplier;

    // 2. Nhân phần trăm từ Chu Thiên Đại Pháp (nhân theo Phẩm Chất công pháp)
    const chuThienMult = Upgrades ? Upgrades.getUpgradeQualityObj('chu_thien_kinh').mult : 1;
    const pctLevel = state.getUpgradeLevel('chu_thien_kinh');
    rate *= 1 + pctLevel * 0.16 * chuThienMult;

    // 3. Nhân từ Linh Căn
    rate *= root.bonuses.passiveMult;

    // 4. Nhân từ Hệ số Tư Chất
    if (window.TuTien.Character) {
      rate *= window.TuTien.Character.getCurrentAptitude().multiplier;
      // Nhân hệ số tốc độ tu luyện của Chính Đạo / Ma Đạo
      rate *= window.TuTien.Character.getFactionConfig().cultivateSpeedMult || 1.0;
    }

    // 5. Nhân từ các Lĩnh Vực & Pháp Bảo đang trang bị
    if (window.TuTien.Fields) {
      rate *= window.TuTien.Fields.getPassiveMultiplierFromFields();
    }

    // 6. Nhân từ nâng cấp Đạo Vận
    const prestigePassiveLvl = state.getPrestigeUpgradeLevel('dao_van_linh_mach');
    rate *= 1 + prestigePassiveLvl * 0.35;

    // 7. Nhân từ tổng thưởng Thành Tựu
    const achMultiplier = window.TuTien.Events
      ? window.TuTien.Events.getAchievementMultiplier()
      : 1;
    rate *= achMultiplier;

    return rate;
  },

  getMaxBoostDurationMs() {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const root = state.getCurrentRoot();
    const qMult = Upgrades ? Upgrades.getUpgradeQualityObj('ngung_than_thuat').mult : 1;
    const upgradeBonusMs = state.getUpgradeLevel('ngung_than_thuat') * 180 * qMult;
    const fieldBonusMs = window.TuTien.Fields
      ? window.TuTien.Fields.getBoostDurationBonusMs()
      : 0;
    return cfg.boostDurationMs + upgradeBonusMs + root.bonuses.boostDurationBonusMs + fieldBonusMs;
  },

  getMaxTotalMultiplier() {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const root = state.getCurrentRoot();
    const qMult = Upgrades ? Upgrades.getUpgradeQualityObj('cuu_chuyen_combo').mult : 1;
    const upgradeBonus = state.getUpgradeLevel('cuu_chuyen_combo') * 0.35 * qMult;
    const fieldBonus = window.TuTien.Fields ? window.TuTien.Fields.getMaxComboBonus() : 0;
    return cfg.baseMaxComboMultiplier + upgradeBonus + root.bonuses.maxComboBonus + fieldBonus;
  },

  getCurrentActiveMultiplier() {
    const cfg = window.TuTien.CONFIG;
    const runtime = window.TuTien.State.runtime;

    if (runtime.boostRemainingMs > 0) {
      const total = cfg.baseBoostMultiplier + runtime.currentComboBonus;
      return Math.min(this.getMaxTotalMultiplier(), total);
    }

    if (runtime.currentComboBonus > 0) {
      return 1 + runtime.currentComboBonus;
    }

    return 1.0;
  },

  getEffectiveRatePerSec() {
    return this.getBasePassiveRate() * this.getCurrentActiveMultiplier();
  },

  getClickPower() {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const realm = state.getCurrentRealm();
    const root = state.getCurrentRoot();

    const danKhiMult = Upgrades ? Upgrades.getUpgradeQualityObj('dan_khi_quyet').mult : 1;
    const flatClickBonus = state.getUpgradeLevel('dan_khi_quyet') * 2.0 * danKhiMult;
    const realmClickScale = Math.pow(realm.passiveMultiplier, 0.72);
    let power = (cfg.baseClickPower + flatClickBonus) * realmClickScale;

    const fountainLvl = state.getUpgradeLevel('long_mach_linh_tuyen');
    if (fountainLvl > 0) {
      const fMult = Upgrades ? Upgrades.getUpgradeQualityObj('long_mach_linh_tuyen').mult : 1;
      power += this.getBasePassiveRate() * (fountainLvl * 0.06 * fMult);
    }

    power *= root.bonuses.clickMult;

    if (window.TuTien.Fields) {
      power *= window.TuTien.Fields.getClickMultiplierFromFields();
    }

    const prestigeClickLvl = state.getPrestigeUpgradeLevel('dao_van_than_thuc');
    power *= 1 + prestigeClickLvl * 0.40;

    const activeMult = this.getCurrentActiveMultiplier();
    power *= 1 + (activeMult - 1) * 0.35;

    return power;
  },

  update(dtMs) {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const runtime = state.runtime;
    const dtSec = dtMs / 1000;

    if (runtime.boostRemainingMs > 0) {
      runtime.boostRemainingMs = Math.max(0, runtime.boostRemainingMs - dtMs);
      runtime.idleTimeSec = 0;
    } else {
      runtime.idleTimeSec = (runtime.idleTimeSec || 0) + dtSec;
      if (runtime.currentComboBonus > 0) {
        runtime.currentComboBonus = Math.max(
          0,
          runtime.currentComboBonus - cfg.comboDecayRatePerSec * dtSec
        );
        if (runtime.currentComboBonus === 0) {
          runtime.clickStreak = 0;
        }
      }
    }

    // Giảm thời gian các buff đan dược chiến đấu tạm thời
    const buffs = state.data.fields && state.data.fields.buffs;
    if (buffs) {
      if (buffs.combatBuffRemainingMs > 0) {
        buffs.combatBuffRemainingMs = Math.max(0, buffs.combatBuffRemainingMs - dtMs);
      }
      if (buffs.hpBuffRemainingMs > 0) {
        buffs.hpBuffRemainingMs = Math.max(0, buffs.hpBuffRemainingMs - dtMs);
      }
    }

    const gainedQi = this.getEffectiveRatePerSec() * dtSec;
    this.addQi(gainedQi);

    if (window.TuTien.Fields) {
      window.TuTien.Fields.update(dtMs);
    }

    state.data.stats.totalPlayTimeSec += dtSec;
  },

  handleCultivateClick(clientX, clientY) {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const runtime = state.runtime;

    state.data.stats.totalClicks += 1;
    runtime.clickStreak += 1;
    runtime.idleTimeSec = 0;
    runtime.boostRemainingMs = this.getMaxBoostDurationMs();

    const maxComboAdd = Math.max(0, this.getMaxTotalMultiplier() - cfg.baseBoostMultiplier);
    const prestigeClickLvl = state.getPrestigeUpgradeLevel('dao_van_than_thuc');
    const step = cfg.comboStepPerClick * (1 + prestigeClickLvl * 0.05);
    runtime.currentComboBonus = Math.min(maxComboAdd, runtime.currentComboBonus + step);

    const gained = this.getClickPower();
    this.addQi(gained);

    if (window.TuTien.Fields) {
      window.TuTien.Fields.onCultivateClick();
    }

    if (window.TuTien.UI) {
      window.TuTien.UI.spawnFloatingText(
        clientX,
        clientY,
        `+${window.TuTien.Utils.formatNumber(gained)}`,
        runtime.boostRemainingMs > 0 && runtime.clickStreak >= 8 ? 'crit' : 'normal'
      );
      window.TuTien.UI.spawnClickParticles(clientX, clientY);
      window.TuTien.UI.triggerCultivatorPulse();

      if (runtime.clickStreak === 10) {
        window.TuTien.UI.setCompanionMood('happy', 'Linh khí cuồn cuộn, vận công sảng khoái thật!');
      }
    }

    if (window.TuTien.Events) {
      window.TuTien.Events.checkAchievements();
    }
  },

  addQi(amount) {
    if (amount <= 0 || isNaN(amount)) return;
    const data = window.TuTien.State.data;
    data.qi += amount;
    data.totalQiThisRun += amount;
    data.stats.totalQiAllTime = (data.stats.totalQiAllTime || 0) + amount;
  }
};
