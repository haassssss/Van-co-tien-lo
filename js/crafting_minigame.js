/**
 * js/crafting_minigame.js
 * Hệ thống 3 Minigame Chế Tác tương tác quyết định Phẩm Chất (Hạ -> Tiên Phẩm) khi:
 * 1. Luyện Đan ("Khống Hỏa Ngưng Đan"): Canh kim nhiệt độ dừng trong vùng Tâm Hỏa Vàng Kim (3 nhịp).
 * 2. Rèn Pháp Bảo ("Thiên Chùy Đoán Tạo"): Canh vòng linh quang thu nhỏ trùng khít vành Đê Rèn (3 nhát búa).
 * 3. Vẽ Linh Phù ("Chu Sa Họa Phù"): Chạm nối nhanh 5 Huyền Ấn (1 -> 5) trên lá bùa trước khi hết giờ.
 */
window.TuTien = window.TuTien || {};

window.TuTien.CraftingMinigame = {
  active: false,
  mode: null, // 'alchemy' | 'forging' | 'talisman'
  onCompleteCallback: null,

  // Trạng thái chung
  round: 1,
  maxRounds: 3,
  scores: [],

  // 1. Trạng thái Khống Hỏa (Alchemy)
  cursorPos: 0,
  cursorDir: 1,
  cursorSpeed: 95,
  targetStart: 38,
  targetWidth: 24,

  // 2. Trạng thái Giáng Chùy (Forging)
  ringRadiusPct: 100,
  ringSpeed: 82,
  sweetRadiusPct: 38,

  // 3. Trạng thái Họa Phù (Talisman)
  nodes: [],
  nextNodeIndex: 0,
  talismanTimerMs: 6500,
  talismanTotalMs: 6500,

  overlayEl: null,
  titleEl: null,
  subtitleEl: null,
  bodyEl: null,
  actionBtn: null,

  init() {
    this.overlayEl = document.getElementById('crafting-minigame-overlay');
    this.titleEl = document.getElementById('craft-mg-title');
    this.subtitleEl = document.getElementById('craft-mg-subtitle');
    this.bodyEl = document.getElementById('craft-mg-body');
    this.actionBtn = document.getElementById('craft-mg-action-btn');

    if (this.actionBtn) {
      this.actionBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.handleActionTrigger();
      });
    }
  },

  /**
   * Mở Minigame chế tác
   * @param {string} mode - 'alchemy' | 'forging' | 'talisman'
   * @param {string} itemName - Tên vật phẩm đang chế tác
   * @param {number} masteryRank - Phẩm cấp thông thạo hiện tại (1 -> 9)
   * @param {Function} onComplete - Hàm nhận điểm trung bình (0.0 -> 1.0)
   */
  start(mode, itemName, masteryRank, onComplete) {
    if (!this.overlayEl) this.init();
    if (!this.overlayEl) {
      if (onComplete) onComplete(0.65);
      return;
    }

    this.active = true;
    this.mode = mode;
    this.onCompleteCallback = onComplete;
    this.round = 1;
    this.maxRounds = 3;
    this.scores = [];

    if (mode === 'alchemy') {
      // Cấp Đan Sư càng cao, vùng Tâm Hỏa Vàng Kim càng rộng
      this.targetWidth = Math.min(38, 18 + masteryRank * 2);
      this.targetStart = 50 - this.targetWidth / 2;
      this.cursorPos = 10;
      this.cursorDir = 1;
      this.cursorSpeed = 95;

      this.titleEl.textContent = `⚗️ Khống Hỏa Ngưng Đan: ${itemName}`;
      this.subtitleEl.textContent = `Nhịp 1/${this.maxRounds} — Bấm "🔥 Chưởng Hỏa" đúng lúc thanh sáng nằm trong vùng Tâm Hỏa Vàng!`;
      this.actionBtn.classList.remove('hidden');
      this.actionBtn.textContent = '🔥 Chưởng Hỏa Ngưng Đan!';
      this.renderAlchemyDOM();
    } else if (mode === 'forging') {
      this.ringRadiusPct = 100;
      this.ringSpeed = 78;
      this.sweetRadiusPct = 36;

      this.titleEl.textContent = `🔨 Thiên Chùy Đoán Tạo: ${itemName}`;
      this.subtitleEl.textContent = `Nhát búa 1/${this.maxRounds} — Bấm "🔨 Giáng Chùy" khi vòng linh quang chạm vành tâm Vàng!`;
      this.actionBtn.classList.remove('hidden');
      this.actionBtn.textContent = '🔨 Giáng Chùy!';
      this.renderForgingDOM();
    } else if (mode === 'talisman') {
      this.talismanTotalMs = 5500 + masteryRank * 300;
      this.talismanTimerMs = this.talismanTotalMs;
      this.nextNodeIndex = 0;
      // 5 đỉnh ngôi sao ngũ giác trên lá bùa
      this.nodes = [
        { x: 50, y: 16, done: false },
        { x: 82, y: 40, done: false },
        { x: 70, y: 80, done: false },
        { x: 30, y: 80, done: false },
        { x: 18, y: 40, done: false }
      ];

      this.titleEl.textContent = `📜 Chu Sa Họa Phù: ${itemName}`;
      this.subtitleEl.textContent = 'Chạm lần lượt vào các Huyền Ấn từ 1 → 5 để tụ linh thành phù!';
      this.actionBtn.classList.add('hidden');
      this.renderTalismanDOM();
    }

    this.overlayEl.classList.remove('hidden');
  },

  renderAlchemyDOM() {
    this.bodyEl.innerHTML = `
      <div class="mg-alchemy-wrap">
        <div class="mg-cauldron-icon">🏺</div>
        <div class="mg-heat-track">
          <div class="mg-heat-zone" style="left:${this.targetStart}%;width:${this.targetWidth}%"></div>
          <div id="mg-heat-cursor" class="mg-heat-cursor" style="left:${this.cursorPos}%"></div>
        </div>
        <div id="mg-round-feedback" class="mg-feedback-txt">Canh chuẩn vùng vàng kim để đạt Tiên Phẩm!</div>
      </div>
    `;
  },

  renderForgingDOM() {
    this.bodyEl.innerHTML = `
      <div class="mg-forging-wrap">
        <div class="mg-anvil-arena">
          <div class="mg-sweet-circle"></div>
          <div id="mg-shrink-ring" class="mg-shrink-ring"></div>
          <div class="mg-core-sword">🗡️</div>
        </div>
        <div id="mg-round-feedback" class="mg-feedback-txt">Đợi vòng sáng thu vào đúng vành vàng rồi giáng chùy!</div>
      </div>
    `;
  },

  renderTalismanDOM() {
    const nodesHtml = this.nodes
      .map(
        (n, idx) => `
        <button class="mg-talisman-node ${n.done ? 'done' : idx === this.nextNodeIndex ? 'next' : ''}"
                data-idx="${idx}"
                style="left:${n.x}%;top:${n.y}%">
          ${idx + 1}
        </button>
      `
      )
      .join('');

    this.bodyEl.innerHTML = `
      <div class="mg-talisman-wrap">
        <div class="mg-talisman-paper">
          <svg class="mg-talisman-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="50,16 70,80 18,40 82,40 30,80" fill="none" stroke="rgba(212,175,55,0.35)" stroke-width="1.2" />
          </svg>
          ${nodesHtml}
        </div>
        <div id="mg-talisman-timer" class="mg-feedback-txt">Thời gian tụ bút: ${(this.talismanTimerMs / 1000).toFixed(1)}s</div>
      </div>
    `;

    this.bodyEl.querySelectorAll('.mg-talisman-node').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const idx = Number(btn.getAttribute('data-idx'));
        this.onTapTalismanNode(idx);
      });
    });
  },

  onTapTalismanNode(idx) {
    if (!this.active || this.mode !== 'talisman') return;
    if (idx !== this.nextNodeIndex) return;

    this.nodes[idx].done = true;
    this.nextNodeIndex += 1;

    if (this.nextNodeIndex >= this.nodes.length) {
      // Hoàn thành cả 5 ấn: tính điểm theo phần trăm thời gian còn lại
      const timeRatio = window.TuTien.Utils.clamp(
        this.talismanTimerMs / this.talismanTotalMs,
        0,
        1
      );
      const finalScore = Math.min(1.0, 0.55 + timeRatio * 0.55);
      this.finishMinigame(finalScore);
    } else {
      this.renderTalismanDOM();
    }
  },

  /**
   * Xử lý khi người chơi bấm nút Chưởng Hỏa (Luyện Đan) hoặc Giáng Chùy (Rèn Pháp Bảo)
   */
  handleActionTrigger() {
    if (!this.active) return;

    if (this.mode === 'alchemy') {
      const center = 50;
      const dist = Math.abs(this.cursorPos - center);
      const halfZone = this.targetWidth / 2;
      let score = 0.25;
      let label = 'Lệch tâm hỏa (Hạ Phẩm)';

      if (dist <= halfZone * 0.45) {
        score = 1.0;
        label = '🔥 Hỏa Hầu Hoàn Mỹ! (+Tiên Phẩm)';
      } else if (dist <= halfZone) {
        score = 0.82;
        label = '✨ Trúng Tâm Hỏa! (+Thượng/Cực Phẩm)';
      } else if (dist <= halfZone * 1.6) {
        score = 0.52;
        label = 'Hỏa lực tạm ổn (+Trung Phẩm)';
      }

      this.scores.push(score);
      const fb = document.getElementById('mg-round-feedback');
      if (fb) fb.textContent = label;

      if (this.round < this.maxRounds) {
        this.round += 1;
        this.cursorSpeed += 22;
        this.subtitleEl.textContent = `Nhịp ${this.round}/${this.maxRounds} — Tiếp tục canh vùng Tâm Hỏa!`;
      } else {
        const avg = this.scores.reduce((a, b) => a + b, 0) / this.scores.length;
        this.finishMinigame(avg);
      }
    } else if (this.mode === 'forging') {
      const diff = Math.abs(this.ringRadiusPct - this.sweetRadiusPct);
      let score = 0.25;
      let label = 'Nhát búa hơi non/già';

      if (diff <= 8) {
        score = 1.0;
        label = '🔨 Thiên Chùy Hoàn Mỹ! (+Tiên Phẩm)';
      } else if (diff <= 16) {
        score = 0.80;
        label = '✨ Chuẩn xác! (+Thượng/Cực Phẩm)';
      } else if (diff <= 26) {
        score = 0.50;
        label = 'Tạm ổn (+Trung Phẩm)';
      }

      this.scores.push(score);
      const fb = document.getElementById('mg-round-feedback');
      if (fb) fb.textContent = label;

      if (this.round < this.maxRounds) {
        this.round += 1;
        this.ringRadiusPct = 100;
        this.ringSpeed += 18;
        this.subtitleEl.textContent = `Nhát búa ${this.round}/${this.maxRounds} — Canh vòng sáng chạm vành vàng!`;
      } else {
        const avg = this.scores.reduce((a, b) => a + b, 0) / this.scores.length;
        this.finishMinigame(avg);
      }
    }
  },

  /**
   * Cập nhật chuyển động kim nhiệt độ / vòng rèn / thời gian vẽ phù mỗi khung hình
   */
  update(dtMs) {
    if (!this.active) return;
    const dtSec = dtMs / 1000;

    if (this.mode === 'alchemy') {
      this.cursorPos += this.cursorDir * this.cursorSpeed * dtSec;
      if (this.cursorPos >= 96) {
        this.cursorPos = 96;
        this.cursorDir = -1;
      } else if (this.cursorPos <= 4) {
        this.cursorPos = 4;
        this.cursorDir = 1;
      }
      const cursorEl = document.getElementById('mg-heat-cursor');
      if (cursorEl) {
        cursorEl.style.left = `${this.cursorPos.toFixed(1)}%`;
      }
    } else if (this.mode === 'forging') {
      this.ringRadiusPct -= this.ringSpeed * dtSec;
      if (this.ringRadiusPct <= 12) {
        this.ringRadiusPct = 100;
      }
      const ringEl = document.getElementById('mg-shrink-ring');
      if (ringEl) {
        ringEl.style.width = `${this.ringRadiusPct.toFixed(1)}%`;
        ringEl.style.height = `${this.ringRadiusPct.toFixed(1)}%`;
      }
    } else if (this.mode === 'talisman') {
      this.talismanTimerMs = Math.max(0, this.talismanTimerMs - dtMs);
      const timerEl = document.getElementById('mg-talisman-timer');
      if (timerEl) {
        timerEl.textContent = `Thời gian tụ bút: ${(this.talismanTimerMs / 1000).toFixed(1)}s`;
      }
      if (this.talismanTimerMs <= 0) {
        const progressScore = (this.nextNodeIndex / this.nodes.length) * 0.6;
        this.finishMinigame(progressScore);
      }
    }
  },

  finishMinigame(finalScoreRatio) {
    this.active = false;
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb(window.TuTien.Utils.clamp(finalScoreRatio, 0.1, 1.0));
    }
  }
};
