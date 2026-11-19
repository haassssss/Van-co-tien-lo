/**
 * js/main.js
 * Điểm khởi động của game Tu Tiên Idle.
 * Khởi tạo Save, State, Audio, Tribulation, CraftingMinigame, Expedition, Effects, Hotbar, Panels, Profile, UI
 * và chạy vòng lặp requestAnimationFrame + delta time (Date.now()).
 */
window.TuTien = window.TuTien || {};

window.TuTien.Main = {
  lastFrameTime: Date.now(),
  autoSaveAccumulatorMs: 0,
  uiRefreshAccumulatorMs: 0,
  profileRefreshAccumulatorMs: 0,

  start() {
    const State = window.TuTien.State;
    const Save = window.TuTien.Save;
    const UI = window.TuTien.UI;
    const Effects = window.TuTien.Effects;
    const Hotbar = window.TuTien.Hotbar;
    const Profile = window.TuTien.Profile;
    const Audio = window.TuTien.Audio;
    const Tribulation = window.TuTien.Tribulation;
    const CraftingMinigame = window.TuTien.CraftingMinigame;
    const Expedition = window.TuTien.Expedition;

    const loaded = Save.loadFromLocal();
    if (!loaded) {
      State.initNewGame();
      Save.saveToLocal();
    } else {
      State.addLog('Chào mừng đạo hữu quay trở lại động phủ tu luyện!');
    }

    if (Effects) Effects.init();
    if (Tribulation) Tribulation.init();
    if (CraftingMinigame) CraftingMinigame.init();
    if (Expedition) Expedition.init();
    if (Hotbar) Hotbar.init();
    UI.init();
    if (Audio) Audio.init();
    if (Profile) Profile.init();
    if (window.TuTien.InputGuard) window.TuTien.InputGuard.init();
    if (window.TuTien.Forge) window.TuTien.Forge.checkPendingAbandonedSessionOnLoad();
    if (window.TuTien.CraftUI) window.TuTien.CraftUI.init();
    if (window.TuTien.Alchemy) window.TuTien.Alchemy.checkPendingAbandonedSessionOnLoad();
    if (window.TuTien.AlchemyUI) window.TuTien.AlchemyUI.init();
    if (window.TuTien.Talisman) window.TuTien.Talisman.checkPendingAbandonedSessionOnLoad();
    if (window.TuTien.TalismanUI) window.TuTien.TalismanUI.init();
    window.TuTien.Events.checkAchievements();

    window.addEventListener('beforeunload', () => {
      Save.saveToLocal();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        Save.saveToLocal();
      }
    });

    this.lastFrameTime = Date.now();
    requestAnimationFrame(() => this.loop());
  },

  _safe(label, fn) {
    try { fn(); } catch (err) {
      this._errCount = (this._errCount || {});
      this._errCount[label] = (this._errCount[label] || 0) + 1;
      if (this._errCount[label] <= 3) console.error('[TuTien loop] ' + label + ':', err);
    }
  },

  loop() {
    const now = Date.now();
    let dtMs = now - this.lastFrameTime;
    this.lastFrameTime = now;

    dtMs = window.TuTien.Utils.clamp(dtMs, 0, 3600 * 1000);

    const T = window.TuTien;
    this._safe('Cultivate', () => T.Cultivate.update(dtMs));
    this._safe('Events', () => T.Events.update(dtMs));
    this._safe('Tribulation', () => { if (T.Tribulation && T.Tribulation.active) T.Tribulation.update(dtMs); });
    this._safe('Crafting', () => { if (T.CraftingMinigame && T.CraftingMinigame.active) T.CraftingMinigame.update(dtMs); });
    this._safe('Expedition', () => { if (T.Expedition) T.Expedition.update(dtMs); });
    this._safe('Forge', () => { if (T.Forge) T.Forge.update(dtMs); });
    this._safe('Alchemy', () => { if (T.Alchemy) T.Alchemy.update(dtMs); });
    this._safe('Talisman', () => { if (T.Talisman) T.Talisman.update(dtMs); });
    this._safe('Effects', () => { if (T.Effects) T.Effects.updateAndRender(dtMs); });

    this.uiRefreshAccumulatorMs += dtMs;
    if (this.uiRefreshAccumulatorMs >= 65) {
      this.uiRefreshAccumulatorMs = 0;
      this._safe('HUD', () => T.UI.updateRealtimeHUD());
    }

    this.profileRefreshAccumulatorMs += dtMs;
    if (this.profileRefreshAccumulatorMs >= 1000) {
      this.profileRefreshAccumulatorMs = 0;
      this._safe('Profile', () => {
        if (T.Hotbar && T.Hotbar.activePanelId === 'profile' && T.Profile) T.Profile.render();
      });
    }

    this.autoSaveAccumulatorMs += dtMs;
    if (this.autoSaveAccumulatorMs >= T.CONFIG.autoSaveIntervalMs) {
      this.autoSaveAccumulatorMs = 0;
      this._safe('Save', () => T.Save.saveToLocal());
    }

    requestAnimationFrame(() => this.loop());
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.TuTien.Main.start();
});
