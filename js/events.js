/**
 * js/events.js
 * Quản lý Cơ Duyên ngẫu nhiên (bảo vật/linh thảo xuất hiện trên màn hình) và Thành Tựu.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Events = {
  /**
   * Tính tổng hệ số nhân tốc độ tu luyện từ các Thành Tựu đã mở khóa
   */
  getAchievementMultiplier() {
    const unlocked = window.TuTien.State.data.achievements || {};
    let bonusSum = 0;
    window.TuTien.ACHIEVEMENTS.forEach(ach => {
      if (unlocked[ach.id]) {
        bonusSum += ach.bonusMult;
      }
    });
    return 1 + bonusSum;
  },

  /**
   * Kiểm tra và mở khóa các Thành Tựu mới
   */
  checkAchievements() {
    const state = window.TuTien.State;
    const unlocked = state.data.achievements;
    let newlyUnlocked = false;

    window.TuTien.ACHIEVEMENTS.forEach(ach => {
      if (!unlocked[ach.id] && ach.check(state.data)) {
        unlocked[ach.id] = true;
        newlyUnlocked = true;
        state.addLog(
          `🏆 Đạt thành tựu 【${ach.name}】: ${ach.rewardText}!`,
          'success'
        );
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(`Thành tựu mới: ${ach.name} (${ach.rewardText})`, 'success');
        }
      }
    });

    if (newlyUnlocked && window.TuTien.UI) {
      window.TuTien.UI.renderAchievements();
    }
  },

  /**
   * Cập nhật bộ đếm thời gian xuất hiện Cơ Duyên ngẫu nhiên
   * @param {number} dtMs - Khoảng thời gian trôi qua (ms)
   */
  update(dtMs) {
    const cfg = window.TuTien.CONFIG;
    const runtime = window.TuTien.State.runtime;
    const dtSec = dtMs / 1000;

    if (runtime.activeFortune) {
      runtime.activeFortune.remainingMs -= dtMs;
      if (runtime.activeFortune.remainingMs <= 0) {
        runtime.activeFortune = null;
        if (window.TuTien.UI) {
          window.TuTien.UI.renderFortuneOrb();
        }
      } else if (window.TuTien.UI) {
        window.TuTien.UI.updateFortuneOrbTimer();
      }
      return;
    }

    runtime.nextFortuneTimerSec -= dtSec;
    if (runtime.nextFortuneTimerSec <= 0) {
      this.spawnRandomFortune();
      runtime.nextFortuneTimerSec = window.TuTien.Utils.randomRange(
        cfg.fortuneMinIntervalSec,
        cfg.fortuneMaxIntervalSec
      );
    }
  },

  /**
   * Tạo một Cơ Duyên ngẫu nhiên tại vị trí bất kỳ quanh khu vực tu luyện
   */
  spawnRandomFortune() {
    const cfg = window.TuTien.CONFIG;
    const types = window.TuTien.FORTUNE_TYPES;
    const chosen = types[window.TuTien.Utils.randomInt(0, types.length - 1)];

    window.TuTien.State.runtime.activeFortune = {
      type: chosen,
      remainingMs: cfg.fortuneLifetimeMs,
      totalMs: cfg.fortuneLifetimeMs,
      // Vị trí phần trăm trong khung tu luyện (tránh sát mép)
      xPct: window.TuTien.Utils.randomInt(14, 82),
      yPct: window.TuTien.Utils.randomInt(16, 76)
    };

    window.TuTien.State.addLog(`✨ Thiên địa dị tượng! 【${chosen.name}】 vừa xuất hiện, mau thu thập!`);
    if (window.TuTien.UI) {
      window.TuTien.UI.renderFortuneOrb();
    }
  },

  /**
   * Người chơi click vào Cơ Duyên để nhận thưởng linh khí lớn
   */
  claimFortune(clientX, clientY) {
    const cfg = window.TuTien.CONFIG;
    const state = window.TuTien.State;
    const fortune = state.runtime.activeFortune;
    if (!fortune) return;

    // Tính thưởng dựa trên tốc độ nền hiện tại + yêu cầu cảnh giới
    const baseRate = window.TuTien.Cultivate.getBasePassiveRate();
    const realmReq = state.getCurrentRealm().qiRequired;
    const prodReward = baseRate * cfg.fortuneRewardSecondsOfProd * fortune.type.multiplier;
    const minReward = realmReq * 0.12 * fortune.type.multiplier;
    const rewardQi = Math.max(20, Math.round(Math.max(prodReward, minReward)));

    window.TuTien.Cultivate.addQi(rewardQi);
    state.data.stats.fortunesClaimed += 1;
    state.runtime.activeFortune = null;

    const formattedReward = window.TuTien.Utils.formatNumber(rewardQi);
    state.addLog(
      `🎁 Thu nhận cơ duyên 【${fortune.type.name}】, hấp thụ +${formattedReward} linh khí!`,
      'success'
    );

    if (window.TuTien.UI) {
      window.TuTien.UI.renderFortuneOrb();
      window.TuTien.UI.spawnFloatingText(clientX, clientY, `+${formattedReward} Linh Khí!`, 'fortune');
      window.TuTien.UI.showToast(
        `Thu hoạch ${fortune.type.name}: +${formattedReward} Linh Khí!`,
        'success'
      );
      window.TuTien.UI.updateAll();
    }

    this.checkAchievements();
  }
};
