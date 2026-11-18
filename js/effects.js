/**
 * js/effects.js
 * Hệ thống Canvas Particles nâng cấp:
 * - Vẽ các dải lụa linh khí mềm mại (Multi-point Ribbon Trails) có đầu phát sáng kim quang,
 *   sử dụng chế độ hòa trộn ánh sáng ('lighter') tạo cảm giác huyền ảo chân thực thay vì các vạch thẳng đơn điệu.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Effects = {
  bgCanvas: null,
  fgCanvas: null,
  bgCtx: null,
  fgCtx: null,
  width: 0,
  height: 0,
  dpr: 1,

  particlesPool: [],
  ripplesPool: [],
  lightningsPool: [],
  spawnAccumulator: 0,
  lightningTimer: 0,

  init() {
    this.bgCanvas = document.getElementById('canvas-bg-fx');
    this.fgCanvas = document.getElementById('canvas-fg-fx');
    if (!this.bgCanvas || !this.fgCanvas) return;

    this.bgCtx = this.bgCanvas.getContext('2d');
    this.fgCtx = this.fgCanvas.getContext('2d');

    // Khởi tạo Object Pool 150 dải linh khí, mỗi hạt lưu lịch sử 6 điểm tọa độ (trail) để vẽ dải lụa mượt mà
    for (let i = 0; i < 150; i++) {
      this.particlesPool.push({
        active: false,
        layer: 'fg',
        angle: 0,
        radius: 0,
        x: 0,
        y: 0,
        trail: [],
        radialSpeed: 100,
        angularSpeed: 1.5,
        size: 2.5,
        alpha: 1,
        color: '#fef08a'
      });
    }

    for (let i = 0; i < 12; i++) {
      this.ripplesPool.push({
        active: false,
        x: 0,
        y: 0,
        radius: 5,
        maxRadius: 95,
        alpha: 0.85,
        color: '#fef08a'
      });
    }

    for (let i = 0; i < 6; i++) {
      this.lightningsPool.push({
        active: false,
        segments: [],
        alpha: 1,
        color: '#e879f9'
      });
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.bgCanvas || !this.fgCanvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    [this.bgCanvas, this.fgCanvas].forEach(canvas => {
      canvas.width = Math.floor(this.width * this.dpr);
      canvas.height = Math.floor(this.height * this.dpr);
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
    });

    this.bgCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.fgCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  getQuality() {
    const State = window.TuTien.State;
    if (State && State.data && State.data.settings && State.data.settings.fxQuality) {
      return State.data.settings.fxQuality;
    }
    return window.TuTien.CONFIG.defaultFxQuality || 'high';
  },

  getDantianCenter() {
    const stageEl = document.getElementById('cultivator-target');
    if (stageEl) {
      const rect = stageEl.getBoundingClientRect();
      const ratioY = window.TuTien.CONFIG.particles.dantianOffsetYRatio || 0.56;
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * ratioY
      };
    }
    return {
      x: this.width * 0.5,
      y: this.height * 0.48
    };
  },

  pickParticleColor() {
    const cfg = window.TuTien.CONFIG;
    const State = window.TuTien.State;
    if (!State || !State.data) return '#fef08a';

    const rootId = State.data.prestige.rootId || 'kim';
    const realmIdx = State.data.realmIndex || 0;

    if (rootId === 'hon_don' || (realmIdx >= cfg.fiveColorRealmThreshold && Math.random() < 0.45)) {
      const five = cfg.fiveElementColors;
      return five[Math.floor(Math.random() * five.length)];
    }

    const palette = cfg.rootParticleColors[rootId] || cfg.rootParticleColors.kim;
    return palette[Math.floor(Math.random() * palette.length)];
  },

  spawnOneParticle(fromClick = false, startX = null, startY = null) {
    const cfg = window.TuTien.CONFIG;
    const quality = this.getQuality();
    if (quality === 'off') return;

    const maxAllowed = cfg.particles.poolSizeByQuality[quality] || 75;
    let activeCount = 0;
    let freeParticle = null;

    for (let i = 0; i < this.particlesPool.length; i++) {
      if (this.particlesPool[i].active) {
        activeCount++;
      } else if (!freeParticle) {
        freeParticle = this.particlesPool[i];
      }
    }

    if (activeCount >= maxAllowed || !freeParticle) return;

    const center = this.getDantianCenter();
    const mult = window.TuTien.Cultivate
      ? window.TuTien.Cultivate.getCurrentActiveMultiplier()
      : 1;
    const speedScale = 1 + Math.min(2.6, (mult - 1) * 0.35);

    if (fromClick && startX !== null && startY !== null) {
      const dx = startX - center.x + window.TuTien.Utils.randomRange(-45, 45);
      const dy = startY - center.y + window.TuTien.Utils.randomRange(-45, 45);
      freeParticle.radius = Math.max(28, Math.hypot(dx, dy));
      freeParticle.angle = Math.atan2(dy, dx);
    } else {
      const maxR = Math.max(this.width, this.height) * 0.56;
      freeParticle.radius = window.TuTien.Utils.randomRange(130, maxR);
      freeParticle.angle = Math.random() * Math.PI * 2;
    }

    freeParticle.active = true;
    freeParticle.layer = Math.random() < 0.45 ? 'bg' : 'fg';
    freeParticle.x = center.x + Math.cos(freeParticle.angle) * freeParticle.radius;
    freeParticle.y = center.y + Math.sin(freeParticle.angle) * freeParticle.radius * 0.88;
    freeParticle.trail = [
      { x: freeParticle.x, y: freeParticle.y },
      { x: freeParticle.x, y: freeParticle.y }
    ];
    freeParticle.radialSpeed =
      cfg.particles.baseInwardSpeed *
      window.TuTien.Utils.randomRange(0.75, 1.3) *
      (fromClick ? 1.6 : speedScale);
    freeParticle.angularSpeed =
      cfg.particles.swirlAngularSpeed *
      window.TuTien.Utils.randomRange(0.75, 1.35) *
      (fromClick ? 1.35 : 1 + (speedScale - 1) * 0.45);
    freeParticle.size = window.TuTien.Utils.randomRange(1.8, 3.6);
    freeParticle.alpha = window.TuTien.Utils.randomRange(0.65, 0.95);
    freeParticle.color = this.pickParticleColor();
  },

  spawnClickEffect(clientX, clientY) {
    const quality = this.getQuality();
    if (quality === 'off') return;

    const freeRipple = this.ripplesPool.find(r => !r.active);
    if (freeRipple) {
      freeRipple.active = true;
      freeRipple.x = clientX;
      freeRipple.y = clientY;
      freeRipple.radius = 8;
      freeRipple.maxRadius = 110;
      freeRipple.alpha = 0.8;
      freeRipple.color = this.pickParticleColor();
    }

    const cfg = window.TuTien.CONFIG;
    const baseBurst = cfg.particles.clickBurstCount || 12;
    const burstCount =
      quality === 'high' ? baseBurst : quality === 'medium' ? Math.ceil(baseBurst * 0.6) : 4;

    for (let i = 0; i < burstCount; i++) {
      this.spawnOneParticle(true, clientX, clientY);
    }

    const rootId = window.TuTien.State.data.prestige.rootId;
    if (rootId === 'loi' && Math.random() < 0.65) {
      this.spawnLightningArc(clientX, clientY);
    }
  },

  spawnLightningArc(fromX, fromY) {
    const bolt = this.lightningsPool.find(l => !l.active);
    if (!bolt) return;

    const center = this.getDantianCenter();
    const startX =
      fromX !== undefined
        ? fromX
        : center.x + window.TuTien.Utils.randomRange(-160, 160);
    const startY =
      fromY !== undefined
        ? fromY
        : center.y + window.TuTien.Utils.randomRange(-160, 160);

    const steps = 6;
    const segments = [{ x: startX, y: startY }];
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const mx = startX + (center.x - startX) * t + window.TuTien.Utils.randomRange(-18, 18);
      const my = startY + (center.y - startY) * t + window.TuTien.Utils.randomRange(-18, 18);
      segments.push({ x: mx, y: my });
    }
    segments.push({ x: center.x, y: center.y });

    bolt.active = true;
    bolt.segments = segments;
    bolt.alpha = 0.95;
    bolt.color = '#e879f9';
  },

  updateAndRender(dtMs) {
    if (document.hidden || !this.bgCtx || !this.fgCtx) return;

    const quality = this.getQuality();
    this.bgCtx.clearRect(0, 0, this.width, this.height);
    this.fgCtx.clearRect(0, 0, this.width, this.height);

    if (quality === 'off') return;

    const cfg = window.TuTien.CONFIG;
    const dtSec = Math.min(0.1, dtMs / 1000);
    const center = this.getDantianCenter();

    const activeMult = window.TuTien.Cultivate
      ? window.TuTien.Cultivate.getCurrentActiveMultiplier()
      : 1;
    const isBoosting = window.TuTien.State.runtime.boostRemainingMs > 0;
    const qualityFactor = quality === 'high' ? 1.0 : quality === 'medium' ? 0.6 : 0.3;

    let spawnRate = cfg.particles.baseSpawnPerSec * qualityFactor;
    if (isBoosting) {
      spawnRate *= cfg.particles.boostSpawnMultiplier * (1 + (activeMult - 1) * 0.18);
    }

    this.spawnAccumulator += spawnRate * dtSec;
    while (this.spawnAccumulator >= 1) {
      this.spawnAccumulator -= 1;
      this.spawnOneParticle(false);
    }

    if (window.TuTien.State.data.prestige.rootId === 'loi') {
      this.lightningTimer += dtSec;
      if (this.lightningTimer >= (isBoosting ? 0.45 : 1.6)) {
        this.lightningTimer = 0;
        if (Math.random() < 0.7) {
          this.spawnLightningArc();
        }
      }
    }

    // Vẽ các dải lụa linh khí cong mượt mà với hòa trộn phát sáng ('lighter')
    for (let i = 0; i < this.particlesPool.length; i++) {
      const p = this.particlesPool[i];
      if (!p.active) continue;

      const closenessBoost = 1 + Math.max(0, (220 - p.radius) / 140);
      p.angle += p.angularSpeed * closenessBoost * dtSec;
      p.radius -= p.radialSpeed * closenessBoost * dtSec;

      if (p.radius <= 8) {
        p.active = false;
        continue;
      }

      p.x = center.x + Math.cos(p.angle) * p.radius;
      p.y = center.y + Math.sin(p.angle) * p.radius * 0.88;

      p.trail.unshift({ x: p.x, y: p.y });
      if (p.trail.length > 7) {
        p.trail.pop();
      }

      const ctx = p.layer === 'bg' ? this.bgCtx : this.fgCtx;
      const fadeNearCenter = Math.min(1, p.radius / 42);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Vẽ đuôi lụa mềm giảm dần độ đậm
      for (let t = 0; t < p.trail.length - 1; t++) {
        const pt1 = p.trail[t];
        const pt2 = p.trail[t + 1];
        const segRatio = 1 - t / p.trail.length;

        ctx.globalAlpha = p.alpha * fadeNearCenter * segRatio * 0.78;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * segRatio * 1.15;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Vẽ hạt ngọc sáng ở đầu tia linh khí
      ctx.globalAlpha = p.alpha * fadeNearCenter;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }

    // Sóng ánh sáng khi chạm
    for (let i = 0; i < this.ripplesPool.length; i++) {
      const r = this.ripplesPool[i];
      if (!r.active) continue;

      r.radius += 210 * dtSec;
      r.alpha -= 1.45 * dtSec;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        r.active = false;
        continue;
      }

      this.fgCtx.save();
      this.fgCtx.globalCompositeOperation = 'lighter';
      this.fgCtx.globalAlpha = Math.max(0, r.alpha);
      this.fgCtx.beginPath();
      this.fgCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.fgCtx.strokeStyle = r.color;
      this.fgCtx.lineWidth = 2.2;
      this.fgCtx.stroke();
      this.fgCtx.restore();
    }

    // Tia sét Lôi Linh Căn
    for (let i = 0; i < this.lightningsPool.length; i++) {
      const bolt = this.lightningsPool[i];
      if (!bolt.active) continue;

      bolt.alpha -= 3.2 * dtSec;
      if (bolt.alpha <= 0) {
        bolt.active = false;
        continue;
      }

      this.fgCtx.save();
      this.fgCtx.globalCompositeOperation = 'lighter';
      this.fgCtx.globalAlpha = Math.max(0, bolt.alpha);
      this.fgCtx.beginPath();
      bolt.segments.forEach((pt, idx) => {
        if (idx === 0) this.fgCtx.moveTo(pt.x, pt.y);
        else this.fgCtx.lineTo(pt.x, pt.y);
      });
      this.fgCtx.strokeStyle = bolt.color;
      this.fgCtx.lineWidth = 2.2;
      this.fgCtx.shadowColor = bolt.color;
      this.fgCtx.shadowBlur = 12;
      this.fgCtx.stroke();
      this.fgCtx.restore();
    }
  }
};
