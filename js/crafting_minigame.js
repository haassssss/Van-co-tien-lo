/**
 * js/crafting_minigame.js
 * Hệ thống 3 Minigame Chế Tác tương tác quyết định điểm kỹ thuật khi:
 * 1. Luyện Đan ("Khống Hỏa Ngưng Đan"): Canh kim nhiệt độ dừng trong vùng Tâm Hỏa Vàng Kim (3 nhịp).
 * 2. Rèn Pháp Bảo ("Thiên Chùy Đoán Tạo"): Canh vòng linh quang thu nhỏ trùng khít vành Đê Rèn (3 nhát búa).
 * 3. Vẽ Linh Phù ("Chu Sa Họa Phù"): Chạm nối nhanh 5 Huyền Ấn (1 -> 5) trên lá bùa trước khi hết giờ.
 * Lưu ý: Phẩm chất cuối cùng phụ thuộc chặt chẽ vào Cấp Lĩnh Vực (Nhất -> Cửu Phẩm) và Năng Khiếu!
 */
window.TuTien = window.TuTien || {};

window.TuTien.CraftingMinigame = {
  active: false,
  mode: null,
  masteryRank: 1,
  onCompleteCallback: null,

  round: 1,
  maxRounds: 3,
  scores: [],

  cursorPos: 0,
  cursorDir: 1,
  cursorSpeed: 108,
  targetStart: 42,
  targetWidth: 16,

  ringRadiusPct: 100,
  ringSpeed: 88,
  sweetRadiusPct: 36,

  nodes: [],
  nextNodeIndex: 0,
  talismanTimerMs: 6000,
  talismanTotalMs: 6000,

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

  start(mode, itemName, masteryRank, onComplete) {
    if (!this.overlayEl) this.init();
    if (!this.overlayEl) {
      if (onComplete) onComplete(0.5);
      return;
    }

    this.active = true;
    this.mode = mode;
    this.masteryRank = masteryRank || 1;
    this.onCompleteCallback = onComplete;
    this.round = 1;
    this.maxRounds = 3;
    this.scores = [];

    if (mode === 'alchemy') {
      // Cấp Đan Sư thấp thì vùng Tâm Hỏa hẹp hơn, đòi hỏi luyện tập và nâng cấp Đan Sư
      this.targetWidth = Math.min(30, 11 + this.masteryRank * 2);
      this.targetStart = 50 - this.targetWidth / 2;
      this.cursorPos = 8;
      this.cursorDir = 1;
      this.cursorSpeed = 108;

      this.titleEl.textContent = `⚗️ Khống Hỏa Ngưng Đan: ${itemName}`;
      this.subtitleEl.textContent = `Nhịp 1/${this.maxRounds} (Đan Sư Phẩm ${this.masteryRank}) — Canh thanh sáng vào đúng vùng Tâm Hỏa!`;
      this.actionBtn.classList.remove('hidden');
      this.actionBtn.textContent = '🔥 Chưởng Hỏa Ngưng Đan!';
      this.renderAlchemyDOM();
    } else if (mode === 'forging') {
      this.ringRadiusPct = 100;
      this.ringSpeed = 84;
      this.sweetRadiusPct = 36;

      this.titleEl.textContent = `🔨 Thiên Chùy Đoán Tạo: ${itemName}`;
      this.subtitleEl.textContent = `Nhát búa 1/${this.maxRounds} (Luyện Khí Phẩm ${this.masteryRank}) — Canh vòng sáng chạm vành tâm Vàng!`;
      this.actionBtn.classList.remove('hidden');
      this.actionBtn.textContent = '🔨 Giáng Chùy!';
      this.renderForgingDOM();
    } else if (mode === 'talisman') {
      this.talismanTotalMs = 5000 + this.masteryRank * 300;
      this.talismanTimerMs = this.talismanTotalMs;
      this.nextNodeIndex = 0;
      this.nodes = [
        { x: 50, y: 16, done: false },
        { x: 82, y: 40, done: false },
        { x: 70, y: 80, done: false },
        { x: 30, y: 80, done: false },
        { x: 18, y: 40, done: false }
      ];

      this.titleEl.textContent = `📜 Chu Sa Họa Phù: ${itemName}`;
      this.subtitleEl.textContent = `Phù Sư Phẩm ${this.masteryRank} — Chạm nối các Huyền Ấn từ 1 → 5!`;
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
        <div id="mg-round-feedback" class="mg-feedback-txt">Phẩm chất phụ thuộc vào Cấp Đan Sư, Năng Khiếu & độ chuẩn Tâm Hỏa!</div>
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
      const timeRatio = window.TuTien.Utils.clamp(
        this.talismanTimerMs / this.talismanTotalMs,
        0,
        1
      );
      const finalScore = Math.min(1.0, 0.35 + timeRatio * 0.65);
      this.finishMinigame(finalScore);
    } else {
      this.renderTalismanDOM();
    }
  },

  handleActionTrigger() {
    if (!this.active) return;

    if (this.mode === 'alchemy') {
      const center = 50;
      const dist = Math.abs(this.cursorPos - center);
      const halfZone = this.targetWidth / 2;
      let score = 0.20;
      let label = 'Lệch tâm hỏa (Tỉ lệ cao ra Hạ Phẩm)';

      if (dist <= halfZone * 0.40) {
        score = 1.0;
        label = '🔥 Chuẩn Tâm Hỏa! (Tối ưu theo cấp Đan Sư hiện tại)';
      } else if (dist <= halfZone) {
        score = 0.72;
        label = '✨ Trúng vùng Tâm Hỏa!';
      } else if (dist <= halfZone * 1.45) {
        score = 0.45;
        label = 'Hỏa lực hơi lệch';
      }

      this.scores.push(score);
      const fb = document.getElementById('mg-round-feedback');
      if (fb) fb.textContent = label;

      if (this.round < this.maxRounds) {
        this.round += 1;
        this.cursorSpeed += 26;
        this.subtitleEl.textContent = `Nhịp ${this.round}/${this.maxRounds} — Tiếp tục canh vùng Tâm Hỏa!`;
      } else {
        const avg = this.scores.reduce((a, b) => a + b, 0) / this.scores.length;
        this.finishMinigame(avg);
      }
    } else if (this.mode === 'forging') {
      const diff = Math.abs(this.ringRadiusPct - this.sweetRadiusPct);
      let score = 0.20;
      let label = 'Nhát búa lệch nhịp (Tỉ lệ cao ra Hạ Phẩm)';

      if (diff <= 6) {
        score = 1.0;
        label = '🔨 Thiên Chùy Chuẩn Xác! (Tối ưu theo cấp Luyện Khí)';
      } else if (diff <= 14) {
        score = 0.72;
        label = '✨ Khá chuẩn xác!';
      } else if (diff <= 22) {
        score = 0.45;
        label = 'Hơi non/già tay';
      }

      this.scores.push(score);
      const fb = document.getElementById('mg-round-feedback');
      if (fb) fb.textContent = label;

      if (this.round < this.maxRounds) {
        this.round += 1;
        this.ringRadiusPct = 100;
        this.ringSpeed += 22;
        this.subtitleEl.textContent = `Nhát búa ${this.round}/${this.maxRounds} — Canh vòng sáng chạm vành vàng!`;
      } else {
        const avg = this.scores.reduce((a, b) => a + b, 0) / this.scores.length;
        this.finishMinigame(avg);
      }
    }
  },

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
        const progressScore = (this.nextNodeIndex / this.nodes.length) * 0.45;
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
