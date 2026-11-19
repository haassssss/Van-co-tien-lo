/**
 * js/tribulation.js
 * Minigame Cửu Thiên Lôi Kiếp phiên bản mới vẽ bằng HTML5 Canvas:
 * - Chính Đạo: Chịu được 3 luồng Thiên Lôi (🛡️🛡️🛡️), tốc độ sấm sét chuẩn.
 * - Ma Đạo: Nghịch thiên cướp đoạt tạo hóa nên Thiên Đạo giáng Ma Kiếp khốc liệt hơn 30% và chỉ chịu được 2 luồng Thiên Lôi (🛡️🛡️)!
 * - Phát nhạc độ kiếp "Clouds over the River" (assets/audio/clouds-over-the-river.mp3) trong lúc vượt kiếp.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Tribulation = {
  active: false,
  playerXPct: 50,
  hitsTaken: 0,
  maxHits: 3,
  remainingMs: 0,
  totalMs: 9000,
  spawnTimerMs: 0,
  strikeIntervalMs: 680,
  warningTimeMs: 560,
  orbSpawnTimerMs: 2200,
  isMaDaoTribulation: false,

  // Kỹ năng Khiên Kim Quang chủ động
  shieldActiveMs: 0,
  shieldCooldownMs: 0,

  strikes: [],
  goldenOrbs: [],
  sparks: [],
  keysPressed: { left: false, right: false },

  overlayEl: null,
  arenaEl: null,
  canvasEl: null,
  ctx: null,
  playerEl: null,
  heartsEl: null,
  timerEl: null,
  statusTextEl: null,
  footerHintEl: null,
  shieldBtnEl: null,

  init() {
    this.overlayEl = document.getElementById('tribulation-overlay');
    this.arenaEl = document.getElementById('tribulation-arena');
    this.canvasEl = document.getElementById('tribulation-canvas');
    this.playerEl = document.getElementById('tribulation-player');
    this.heartsEl = document.getElementById('tribulation-hearts');
    this.timerEl = document.getElementById('tribulation-timer');
    this.statusTextEl = document.getElementById('tribulation-status-text');
    this.footerHintEl = document.getElementById('tribulation-footer-hint');
    this.shieldBtnEl = document.getElementById('btn-trib-shield');

    if (!this.arenaEl) return;
    if (this.canvasEl) {
      this.ctx = this.canvasEl.getContext('2d');
    }

    const moveFromPointer = e => {
      if (!this.active) return;
      const rect = this.arenaEl.getBoundingClientRect();
      const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
      if (clientX === undefined) return;
      const relPct = ((clientX - rect.left) / rect.width) * 100;
      this.playerXPct = window.TuTien.Utils.clamp(relPct, 8, 92);
      this.updatePlayerPositionDOM();
    };

    this.arenaEl.addEventListener('pointerdown', e => {
      e.preventDefault();
      moveFromPointer(e);
    });
    this.arenaEl.addEventListener('pointermove', e => {
      if (!this.active) return;
      moveFromPointer(e);
    });

    if (this.shieldBtnEl) {
      this.shieldBtnEl.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.activateGoldenShield();
      });
    }

    window.addEventListener('keydown', e => {
      if (!this.active) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keysPressed.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keysPressed.right = true;
      } else if (e.key === ' ') {
        e.preventDefault();
        this.activateGoldenShield();
      }
    });

    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keysPressed.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keysPressed.right = false;
      }
    });
  },

  startTribulation(targetRealm, bonusShield = 0) {
    if (this.active) return;
    const cfg = window.TuTien.CONFIG.tribulation;
    const majorIdx = targetRealm.majorIndex || 1;
    const factionCfg = window.TuTien.Character
      ? window.TuTien.Character.getFactionConfig()
      : window.TuTien.CONFIG.factions.chinh_dao;

    this.isMaDaoTribulation = factionCfg.id === 'ma_dao';
    const speedMult = factionCfg.tribulationSpeedMult || 1.0;

    this.active = true;
    this.playerXPct = 50;
    this.hitsTaken = 0;
    // Chính Đạo chịu được 3 lần, Ma Đạo chỉ chịu được 2 lần!
    const prestigeShield = window.TuTien.State ? window.TuTien.State.getPrestigeUpgradeLevel('dao_van_ho_kiep_thuan') : 0;
    this.maxHits = (factionCfg.tribulationMaxHits || cfg.maxHitsAllowed || 3) + bonusShield + prestigeShield;
    this.totalMs = Math.round(
      (cfg.baseDurationSec + majorIdx * cfg.extraSecPerMajorRealm) *
        (this.isMaDaoTribulation ? 1.12 : 1.0) *
        1000
    );
    this.remainingMs = this.totalMs;

    // Ma Đạo có tần suất sấm sét nhanh hơn và thời gian cảnh báo ngắn hơn
    this.strikeIntervalMs = Math.max(
      250,
      Math.round((cfg.baseStrikeIntervalMs - majorIdx * 18) / speedMult)
    );
    this.warningTimeMs = Math.max(
      340,
      Math.round((cfg.warningTimeMs || 560) / (this.isMaDaoTribulation ? 1.22 : 1.0))
    );

    this.spawnTimerMs = 260;
    this.orbSpawnTimerMs = 2000;
    this.shieldActiveMs = 0;
    this.shieldCooldownMs = 0;
    this.strikes = [];
    this.goldenOrbs = [];
    this.sparks = [];
    this.keysPressed = { left: false, right: false };

    const gender = window.TuTien.Character ? window.TuTien.Character.getGender() : 'male';
    const playerImg = document.getElementById('tribulation-player-img');
    if (playerImg) {
      playerImg.src =
        gender === 'female'
          ? 'assets/stickers/09_nu_boi_roi.png'
          : 'assets/stickers/01_nam_im_lang.png';
    }

    if (this.statusTextEl) {
      const pathTag = this.isMaDaoTribulation
        ? '🩸 Huyết Ma Thiên Kiếp (Khó +30% • Chỉ chịu được 2 phát!)'
        : '☯️ Cửu Thiên Lôi Kiếp (Chính Đạo • Chịu được 3 phát)';
      this.statusTextEl.textContent = `${pathTag} — Độ kiếp lên 【${targetRealm.majorName}】!`;
    }

    if (this.footerHintEl) {
      this.footerHintEl.textContent = `Dính đủ ${this.maxHits} luồng Thiên Lôi sẽ bị đánh tụt 1 tầng cảnh giới!`;
    }

    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToCombatBgm(true);
    }

    this.updatePlayerPositionDOM();
    this.renderHearts();
    if (this.overlayEl) this.overlayEl.classList.remove('hidden');

    setTimeout(() => this.resizeCanvas(), 20);
  },

  resizeCanvas() {
    if (!this.canvasEl || !this.arenaEl) return;
    const rect = this.arenaEl.getBoundingClientRect();
    this.canvasEl.width = Math.max(320, Math.floor(rect.width));
    this.canvasEl.height = Math.max(220, Math.floor(rect.height));
  },

  activateGoldenShield() {
    if (!this.active || this.shieldCooldownMs > 0) return;
    this.shieldActiveMs = 950;
    this.shieldCooldownMs = 3600;
    if (this.playerEl) {
      this.playerEl.classList.add('golden-shield-on');
    }
  },

  updatePlayerPositionDOM() {
    if (this.playerEl) {
      this.playerEl.style.left = `${this.playerXPct.toFixed(1)}%`;
    }
  },

  renderHearts() {
    if (!this.heartsEl) return;
    const remain = Math.max(0, this.maxHits - this.hitsTaken);
    let html = '';
    for (let i = 0; i < this.maxHits; i++) {
      html += `<span class="trib-heart ${i < remain ? 'alive' : 'lost'}">🛡️</span>`;
    }
    this.heartsEl.innerHTML = html;
  },

  generateBoltPath(xStart, yStart, xEnd, yEnd, segments = 10) {
    const pts = [{ x: xStart, y: yStart }];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const jitter = (Math.random() - 0.5) * 34;
      pts.push({
        x: xStart + (xEnd - xStart) * t + jitter,
        y: yStart + (yEnd - yStart) * t
      });
    }
    pts.push({ x: xEnd, y: yEnd });

    const branches = [];
    for (let b = 0; b < 2; b++) {
      const midIdx = Math.floor(segments * (0.3 + b * 0.35));
      const rootPt = pts[midIdx];
      if (rootPt) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        branches.push([
          rootPt,
          { x: rootPt.x + dir * 22, y: rootPt.y + 32 },
          { x: rootPt.x + dir * 38, y: rootPt.y + 64 }
        ]);
      }
    }

    return { main: pts, branches };
  },

  spawnStrike() {
    const targetPlayer = Math.random() < (this.isMaDaoTribulation ? 0.68 : 0.58);
    const xPct = targetPlayer
      ? window.TuTien.Utils.clamp(
          this.playerXPct + window.TuTien.Utils.randomRange(-12, 12),
          10,
          90
        )
      : window.TuTien.Utils.randomRange(10, 90);

    this.strikes.push({
      xPct,
      state: 'warn',
      timerMs: this.warningTimeMs,
      maxWarnMs: this.warningTimeMs,
      boltGeometry: null
    });
  },

  spawnGoldenOrb() {
    this.goldenOrbs.push({
      xPct: window.TuTien.Utils.randomRange(14, 86),
      yPct: 8,
      speedPctPerSec: 38
    });
  },

  spawnGroundSparks(xPx, yPx, color) {
    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI * Math.random();
      const speed = 60 + Math.random() * 140;
      this.sparks.push({
        x: xPx,
        y: yPx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        alpha: 1,
        color
      });
    }
  },

  update(dtMs) {
    if (!this.active) return;
    if (!this.canvasEl || this.canvasEl.width === 0) this.resizeCanvas();

    const cfg = window.TuTien.CONFIG.tribulation;
    const dtSec = dtMs / 1000;
    const w = this.canvasEl ? this.canvasEl.width : 560;
    const h = this.canvasEl ? this.canvasEl.height : 270;

    if (this.keysPressed.left) {
      this.playerXPct = Math.max(8, this.playerXPct - 64 * dtSec);
      this.updatePlayerPositionDOM();
    }
    if (this.keysPressed.right) {
      this.playerXPct = Math.min(92, this.playerXPct + 64 * dtSec);
      this.updatePlayerPositionDOM();
    }

    if (this.shieldActiveMs > 0) {
      this.shieldActiveMs = Math.max(0, this.shieldActiveMs - dtMs);
      if (this.shieldActiveMs === 0 && this.playerEl) {
        this.playerEl.classList.remove('golden-shield-on');
      }
    }
    if (this.shieldCooldownMs > 0) {
      this.shieldCooldownMs = Math.max(0, this.shieldCooldownMs - dtMs);
    }
    if (this.shieldBtnEl) {
      if (this.shieldActiveMs > 0) {
        this.shieldBtnEl.textContent = '🛡️ Đang Hộ Thể!';
        this.shieldBtnEl.disabled = true;
      } else if (this.shieldCooldownMs > 0) {
        this.shieldBtnEl.textContent = `🛡️ Hồi khiên (${(this.shieldCooldownMs / 1000).toFixed(1)}s)`;
        this.shieldBtnEl.disabled = true;
      } else {
        this.shieldBtnEl.textContent = '🛡️ Hộ Thể Kim Quang (Phím Space)';
        this.shieldBtnEl.disabled = false;
      }
    }

    this.remainingMs = Math.max(0, this.remainingMs - dtMs);
    if (this.timerEl) {
      this.timerEl.textContent = `${(this.remainingMs / 1000).toFixed(1)}s`;
    }

    this.spawnTimerMs -= dtMs;
    if (this.spawnTimerMs <= 0) {
      this.spawnTimerMs = this.strikeIntervalMs;
      this.spawnStrike();
    }

    this.orbSpawnTimerMs -= dtMs;
    if (this.orbSpawnTimerMs <= 0) {
      this.orbSpawnTimerMs = 2400;
      this.spawnGoldenOrb();
    }

    for (let i = this.strikes.length - 1; i >= 0; i--) {
      const st = this.strikes[i];
      st.timerMs -= dtMs;

      if (st.state === 'warn' && st.timerMs <= 0) {
        st.state = 'strike';
        st.timerMs = 260;
        const xPx = (st.xPct / 100) * w;
        st.boltGeometry = this.generateBoltPath(
          xPx + (Math.random() - 0.5) * 20,
          14,
          xPx,
          h - 18,
          11
        );
        this.spawnGroundSparks(
          xPx,
          h - 18,
          this.isMaDaoTribulation ? '#fb7185' : '#e879f9'
        );

        if (window.TuTien.Audio) {
          window.TuTien.Audio.playThunderStrike();
        }

        const hitRadius = (cfg.strikeRadiusPct || 10) * (this.isMaDaoTribulation ? 1.12 : 1.0);
        if (Math.abs(st.xPct - this.playerXPct) <= hitRadius) {
          if (this.shieldActiveMs > 0) {
            this.spawnGroundSparks(xPx, h - 42, '#fde047');
          } else {
            this.onPlayerHitByLightning();
            if (!this.active) return;
          }
        }
      } else if (st.state === 'strike' && st.timerMs <= 0) {
        this.strikes.splice(i, 1);
      }
    }

    for (let i = this.goldenOrbs.length - 1; i >= 0; i--) {
      const orb = this.goldenOrbs[i];
      orb.yPct += orb.speedPctPerSec * dtSec;

      if (orb.yPct >= 74 && orb.yPct <= 95 && Math.abs(orb.xPct - this.playerXPct) <= 11) {
        this.remainingMs = Math.max(0, this.remainingMs - 1400);
        this.spawnGroundSparks((orb.xPct / 100) * w, h - 35, '#fde047');
        this.goldenOrbs.splice(i, 1);
        continue;
      }

      if (orb.yPct > 100) {
        this.goldenOrbs.splice(i, 1);
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx * dtSec;
      sp.y += sp.vy * dtSec;
      sp.vy += 260 * dtSec;
      sp.alpha -= 2.4 * dtSec;
      if (sp.alpha <= 0) this.sparks.splice(i, 1);
    }

    this.renderCanvas(w, h);

    if (this.remainingMs <= 0 && this.active) {
      this.finishTribulation(true);
    }
  },

  renderCanvas(w, h) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    const outerBoltColor = this.isMaDaoTribulation ? '#f43f5e' : '#c084fc';
    const glowBoltColor = this.isMaDaoTribulation ? '#fb7185' : '#e879f9';

    this.strikes.forEach(st => {
      const xPx = (st.xPct / 100) * w;

      if (st.state === 'warn') {
        const progress = 1 - Math.max(0, st.timerMs / st.maxWarnMs);
        ctx.save();
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.25 + progress * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(xPx, 18);
        ctx.lineTo(xPx, h - 16);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(xPx, h - 16, 26 * (1.2 - progress * 0.4), 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 63, 94, ${0.18 + progress * 0.35})`;
        ctx.fill();
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      } else if (st.state === 'strike' && st.boltGeometry) {
        const alpha = Math.min(1, st.timerMs / 180);
        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.strokeStyle = outerBoltColor;
        ctx.shadowColor = glowBoltColor;
        ctx.shadowBlur = 22;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        this.strokePolyline(ctx, st.boltGeometry.main);

        ctx.lineWidth = 3;
        st.boltGeometry.branches.forEach(br => this.strokePolyline(ctx, br));

        ctx.strokeStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.6;
        this.strokePolyline(ctx, st.boltGeometry.main);

        ctx.beginPath();
        ctx.ellipse(xPx, h - 16, 32, 11, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
        ctx.restore();
      }
    });

    this.goldenOrbs.forEach(orb => {
      const x = (orb.xPct / 100) * w;
      const y = (orb.yPct / 100) * h;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    });

    this.sparks.forEach(sp => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sp.alpha);
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  },

  strokePolyline(ctx, pts) {
    if (!pts || !pts.length) return;
    ctx.beginPath();
    pts.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  },

  onPlayerHitByLightning() {
    this.hitsTaken += 1;
    this.renderHearts();

    const gender = window.TuTien.Character ? window.TuTien.Character.getGender() : 'male';
    const playerImg = document.getElementById('tribulation-player-img');
    if (playerImg) {
      playerImg.src =
        gender === 'female'
          ? 'assets/stickers/08_nu_gian_doi.png'
          : 'assets/stickers/04_nam_gian.png';
    }

    if (this.arenaEl) {
      this.arenaEl.classList.remove('shake-hit');
      void this.arenaEl.offsetWidth;
      this.arenaEl.classList.add('shake-hit');
    }

    if (this.hitsTaken >= this.maxHits) {
      this.finishTribulation(false);
    }
  },

  finishTribulation(success) {
    this.active = false;
    this.strikes = [];
    this.goldenOrbs = [];
    this.sparks = [];
    if (this.playerEl) this.playerEl.classList.remove('golden-shield-on');
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }

    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToTrainingBgm();
    }

    if (window.TuTien.Breakthrough) {
      window.TuTien.Breakthrough.resolveTribulationOutcome(success);
    }
  }
};
