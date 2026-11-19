/**
 * js/inputGuard.js
 * Bảo vệ thao tác chơi game, không chặn phím tắt trình duyệt:
 * - Dùng event.code (KeyF, KeyG, KeyH, Digit1..Digit8, Space, Arrow...)
 * - Bỏ qua hoàn toàn khi giữ Ctrl / Alt / Meta hoặc đang nhập chữ trong input / textarea / contenteditable.
 * - Không bao giờ chặn F5, F11, F12, Ctrl+R, Ctrl+F, Ctrl+T, Ctrl+W.
 * - Theo dõi trạng thái phím giữ bằng keydown/keyup (bỏ qua event.repeat) và nhả hết khi blur/hidden.
 * - Chặn chuột phải (contextmenu), kéo thả ảnh (dragstart), zoom ngoài ý muốn (wheel+Ctrl, iOS gesture).
 * - Cảnh báo beforeunload CHỈ khi đang rèn pháp bảo dở.
 */
window.TuTien = window.TuTien || {};

window.TuTien.InputGuard = {
  heldCodes: new Set(),
  pointerActions: { addFire: false, fanWind: false, focusCalm: false, herb1: false, herb2: false, herb3: false, herb4: false },
  initialized: false,

  isEditableTarget(target) {
    if (!target) return false;
    const tag = (target.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
  },

  isGuardEnabled() {
    const st = window.TuTien.State;
    if (st && st.data && st.data.settings && st.data.settings.blockContextAndSelect !== undefined) {
      return !!st.data.settings.blockContextAndSelect;
    }
    return true;
  },

  getForgeKeyConfig() {
    const def = (window.TuTien.CONFIG && window.TuTien.CONFIG.forge && window.TuTien.CONFIG.forge.defaultKeys) || {
      addFire: 'KeyF',
      fanWind: 'KeyG',
      focusCalm: 'KeyH'
    };
    const st = window.TuTien.State;
    const custom = st && st.data && st.data.settings && st.data.settings.forgeKeys;
    return {
      addFire: (custom && custom.addFire) || def.addFire,
      fanWind: (custom && custom.fanWind) || def.fanWind,
      focusCalm: (custom && custom.focusCalm) || def.focusCalm
    };
  },

  formatCodeLabel(code) {
    if (!code) return '?';
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    return code;
  },

  isHotbarCollision(code) {
    return /^Digit[1-8]$/.test(code);
  },

  getAlchemyKeyConfig() {
    const def = (window.TuTien.CONFIG && window.TuTien.CONFIG.alchemy && window.TuTien.CONFIG.alchemy.defaultKeys) || {
      herb1: 'KeyF', herb2: 'KeyG', herb3: 'KeyH', herb4: 'KeyJ', condense: 'Space'
    };
    const st = window.TuTien.State;
    const custom = st && st.data && st.data.settings && st.data.settings.alchemyKeys;
    return {
      herb1: (custom && custom.herb1) || def.herb1,
      herb2: (custom && custom.herb2) || def.herb2,
      herb3: (custom && custom.herb3) || def.herb3,
      herb4: (custom && custom.herb4) || def.herb4,
      condense: (custom && custom.condense) || def.condense
    };
  },

  isAlchemyActionHeld(actionName) {
    const ak = this.getAlchemyKeyConfig();
    const code = ak[actionName];
    return !!(this.pointerActions[actionName] || (code && this.heldCodes.has(code)));
  },

  getProtectedGameCodes() {
    const fk = this.getForgeKeyConfig();
    return new Set([
      fk.addFire,
      fk.fanWind,
      fk.focusCalm, 'KeyJ',
      'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8',
      'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ]);
  },

  isActionHeld(actionName) {
    const fk = this.getForgeKeyConfig();
    const code = fk[actionName];
    return !!(this.pointerActions[actionName] || (code && this.heldCodes.has(code)));
  },

  setPointerAction(actionName, active) {
    this.pointerActions[actionName] = !!active;
  },

  releaseAllInputs() {
    this.heldCodes.clear();
    this.pointerActions.addFire = false;
    this.pointerActions.fanWind = false;
    this.pointerActions.focusCalm = false;
    this.pointerActions.herb1 = false;
    this.pointerActions.herb2 = false;
    this.pointerActions.herb3 = false;
    this.pointerActions.herb4 = false;
  },

  applyBodySelectionPolicy() {
    document.body.classList.toggle('guard-no-select', this.isGuardEnabled());
  },

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.applyBodySelectionPolicy();

    // 1. Theo dõi phím bằng event.code (bỏ qua repeat, bỏ qua Ctrl/Alt/Meta & ô nhập chữ)
    window.addEventListener('keydown', e => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (this.isEditableTarget(e.target)) return;
      if (e.code === 'F5' || e.code === 'F11' || e.code === 'F12') return;

      const gameCodes = this.getProtectedGameCodes();
      if (gameCodes.has(e.code)) {
        e.preventDefault();
      }
      if (e.repeat) return;
      this.heldCodes.add(e.code);
    });

    window.addEventListener('keyup', e => {
      this.heldCodes.delete(e.code);
    });

    // Nhả hết phím khi mất tiêu điểm cửa sổ hoặc ẩn tab
    window.addEventListener('blur', () => this.releaseAllInputs());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.releaseAllInputs();
    });

    // 2. Chặn chuột phải (contextmenu) và kéo thả (dragstart) trong khung game
    document.addEventListener('contextmenu', e => {
      if (!this.isGuardEnabled()) return;
      if (this.isEditableTarget(e.target)) return;
      e.preventDefault();
    });

    document.addEventListener('dragstart', e => {
      if (!this.isGuardEnabled()) return;
      if (this.isEditableTarget(e.target)) return;
      e.preventDefault();
    });

    // 3. Chặn zoom ngoài ý muốn (Ctrl+Wheel & iOS Safari gesture)
    window.addEventListener(
      'wheel',
      e => {
        if (e.ctrlKey) e.preventDefault();
      },
      { passive: false }
    );

    ['gesturestart', 'gesturechange', 'gestureend'].forEach(evtName => {
      document.addEventListener(evtName, e => e.preventDefault(), { passive: false });
    });

    // 4. Cảnh báo beforeunload CHỈ khi đang rèn pháp bảo dở
    window.addEventListener('beforeunload', e => {
      if ((window.TuTien.Forge && window.TuTien.Forge.isForging()) || (window.TuTien.Alchemy && window.TuTien.Alchemy.isBrewing()) || (window.TuTien.Talisman && window.TuTien.Talisman.isDrawing())) {
        e.preventDefault();
        e.returnValue = 'Lửa lò đang cháy, rời đi lúc này sẽ làm hỏng một nửa linh tài đã bỏ vào!';
        return e.returnValue;
      }
    });
  }
};
