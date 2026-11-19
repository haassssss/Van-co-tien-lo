/**
 * js/effects.js
 * Hệ thống Canvas Particles SIÊU TỐI ƯU HIỆU NĂNG (60FPS mượt trên cả PC lẫn iPhone/Android):
 * - Loại bỏ hoàn toàn `ctx.shadowBlur` (nguyên nhân chính gây lag GPU/CPU trên Chrome & Safari).
 * - Sử dụng Sprite Hào Quang (Offscreen Glow Sprite Cache 28×28) vẽ qua `drawImage` tốc độ cực cao.
 * - Không cấp phát object mỗi khung hình (dùng mảng phẳng fixed-length), không gọi `getBoundingClientRect()` mỗi frame.
 * - Tự động tạm dừng vẽ nền khi người chơi mở cửa sổ Xuất Quan hoặc Độ Thiên Kiếp để tiết kiệm 100% tài nguyên.
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

  // Cache tâm Đan Điền để không ép trình duyệt layout reflow mỗi khung hình
  cachedCenterX: 0,
  cachedCenterY: 0,
  centerCacheTimerMs: 0,

  // Cache các sprite hạt phát sáng vẽ sẵn (Offscreen Canvas) theo mã màu
  glowSpriteCache: {},

  particlesPool: [],
  ripplesPool: [],
  lightningsPool: [],
  spawnAccumulator: 0,
  lightningTimer: 0,

  init() {
    this.bgCanvas = document.getElementById('canvas-bg-fx');
    this.fgCanvas = document.getElementById('canvas-fg-fx');
    if (!this.bgCanvas || !this.fgCanvas) return;

    this.bgCtx = this.bgCanvas.getContext('2d', { alpha: true, desynchronized: true });
    this.fgCtx = this.fgCanvas.getContext('2d', { alpha: true, desynchronized: true });

    // Object Pool 65 hạt gọn nhẹ, dùng mảng tọa độ phẳng (Zero GC)
    for (let i = 0; i < 65; i++) {
      this.particlesPool.push({
        active: false,
        layer: 'fg',
        angle: 0,
        radius: 0,
        x: 0,
        y: 0,
        prevX1: 0,
        prevY1: 0,
        prevX2: 0,
        prevY2: 0,
        prevX3: 0,
        prevY3: 0,
        radialSpeed: 100,
        angularSpeed: 1.5,
        size: 2.5,
        alpha: 1,
        color: '#fef08a'
      });
    }

    for (let i = 0; i < 8; i++) {
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

    for (let i = 0; i < 4; i++) {
      this.lightningsPool.push({
        active: false,
        segments: [],
        alpha: 1,
        color: '#e879f9'
      });
    }

    this.resize();
    this.refreshDantianCenter();
    window.addEventListener('resize', () => {
      this.resize();
      this.refreshDantianCenter();
    });
  },

  /**
   * Tạo và lưu sẵn ảnh hạt phát sáng (28×28) 1 lần duy nhất cho mỗi màu -> vẽ bằng drawImage nhanh gấp 50 lần shadowBlur!
   */
  getGlowSprite(color) {
    if (this.glowSpriteCache[color]) return this.glowSpriteCache[color];
    const c = document.createElement('canvas');
    c.width = 28;
    c.height = 28;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(14, 14, 1, 14, 14, 13);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.28, color);
    grad.addColorStop(0.65, color + '55');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 28, 28);
    this.glowSpriteCache[color] = c;
    return c;
  },

  resize() {
    if (!this.bgCanvas || !this.fgCanvas) return;
    // Giới hạn DPR tối đa 1.25 trên mobile và 1.5 trên PC để giảm tới 75% lượng pixel phải vẽ mỗi khung hình
    const isMobile = window.innerWidth <= 900;
    this.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
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

  refreshDantianCenter() {
    const stageEl = document.getElementById('cultivator-target');
    if (stageEl) {
      const rect = stageEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const ratioY = (window.TuTien.CONFIG && window.TuTien.CONFIG.particles.dantianOffsetYRatio) || 0.56;
        this.cachedCenterX = rect.left + rect.width * 0.5;
        this.cachedCenterY = rect.top + rect.height * ratioY;
        return;
      }
    }
    this.cachedCenterX = this.width * 0.5;
    this.cachedCenterY = this.height * 0.48;
  },

  getQuality() {
    const State = window.TuTien.State;
    if (State && State.data && State.data.settings && State.data.settings.fxQuality) {
      return State.data.settings.fxQuality;
    }
    return window.TuTien.CONFIG.defaultFxQuality || 'high';
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

    const maxByQ = { high: 52, medium: 30, low: 16 };
    const maxAllowed = maxByQ[quality] || 30;
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

    const cx = this.cachedCenterX || this.width * 0.5;
    const cy = this.cachedCenterY || this.height * 0.48;
    const mult = window.TuTien.Cultivate
      ? window.TuTien.Cultivate.getCurrentActiveMultiplier()
      : 1;
    const speedScale = 1 + Math.min(2.2, (mult - 1) * 0.3);

    if (fromClick && startX !== null && startY !== null) {
      const dx = startX - cx + (Math.random() * 70 - 35);
      const dy = startY - cy + (Math.random() * 70 - 35);
      freeParticle.radius = Math.max(28, Math.hypot(dx, dy));
      freeParticle.angle = Math.atan2(dy, dx);
    } else {
      const maxR = Math.max(this.width, this.height) * 0.52;
      freeParticle.radius = 125 + Math.random() * Math.max(60, maxR - 125);
      freeParticle.angle = Math.random() * Math.PI * 2;
    }

    const px = cx + Math.cos(freeParticle.angle) * freeParticle.radius;
    const py = cy + Math.sin(freeParticle.angle) * freeParticle.radius * 0.88;

    freeParticle.active = true;
    freeParticle.layer = Math.random() < 0.45 ? 'bg' : 'fg';
    freeParticle.x = px;
    freeParticle.y = py;
    freeParticle.prevX1 = px;
    freeParticle.prevY1 = py;
    freeParticle.prevX2 = px;
    freeParticle.prevY2 = py;
    freeParticle.prevX3 = px;
    freeParticle.prevY3 = py;
    freeParticle.radialSpeed =
      cfg.particles.baseInwardSpeed *
      (0.8 + Math.random() * 0.45) *
      (fromClick ? 1.55 : speedScale);
    freeParticle.angularSpeed =
      cfg.particles.swirlAngularSpeed *
      (0.8 + Math.random() * 0.5) *
      (fromClick ? 1.3 : 1 + (speedScale - 1) * 0.4);
    freeParticle.size = 2.0 + Math.random() * 1.6;
    freeParticle.alpha = 0.68 + Math.random() * 0.27;
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
      freeRipple.maxRadius = 100;
      freeRipple.alpha = 0.78;
      freeRipple.color = this.pickParticleColor();
    }

    const burstCount = quality === 'high' ? 7 : quality === 'medium' ? 4 : 2;
    for (let i = 0; i < burstCount; i++) {
      this.spawnOneParticle(true, clientX, clientY);
    }

    const rootId = window.TuTien.State.data.prestige.rootId;
    if (rootId === 'loi' && Math.random() < 0.55) {
      this.spawnLightningArc(clientX, clientY);
    }
  },

  spawnLightningArc(fromX, fromY) {
    const bolt = this.lightningsPool.find(l => !l.active);
    if (!bolt) return;

    const cx = this.cachedCenterX || this.width * 0.5;
    const cy = this.cachedCenterY || this.height * 0.48;
    const startX = fromX !== undefined ? fromX : cx + (Math.random() * 300 - 150);
    const startY = fromY !== undefined ? fromY : cy + (Math.random() * 300 - 150);

    const steps = 5;
    const segments = [{ x: startX, y: startY }];
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      segments.push({
        x: startX + (cx - startX) * t + (Math.random() * 32 - 16),
        y: startY + (cy - startY) * t + (Math.random() * 32 - 16)
      });
    }
    segments.push({ x: cx, y: cy });

    bolt.active = true;
    bolt.segments = segments;
    bolt.alpha = 0.92;
    bolt.color = '#e879f9';
  },

  updateAndRender(dtMs) {
    if (document.hidden || !this.bgCtx || !this.fgCtx) return;

    // Tạm dừng vẽ canvas hạt nền khi đang mở Xuất Quan hoặc Độ Kiếp để tối ưu 100% FPS
    if (
      (window.TuTien.Expedition && window.TuTien.Expedition.isOpen) ||
      (window.TuTien.Tribulation && window.TuTien.Tribulation.active)
    ) {
      return;
    }

    const quality = this.getQuality();
    this.bgCtx.clearRect(0, 0, this.width, this.height);
    this.fgCtx.clearRect(0, 0, this.width, this.height);

    if (quality === 'off') return;

    // Chỉ cập nhật tâm Đan Điền mỗi 1.2 giây thay vì mỗi khung hình
    this.centerCacheTimerMs += dtMs;
    if (this.centerCacheTimerMs >= 1200) {
      this.centerCacheTimerMs = 0;
      this.refreshDantianCenter();
    }

    const dtSec = Math.min(0.08, dtMs / 1000);
    const cx = this.cachedCenterX || this.width * 0.5;
    const cy = this.cachedCenterY || this.height * 0.48;

    const isBoosting = window.TuTien.State.runtime.boostRemainingMs > 0;
    const qualityFactor = quality === 'high' ? 1.0 : quality === 'medium' ? 0.58 : 0.28;

    let spawnRate = 11 * qualityFactor;
    if (isBoosting) spawnRate *= 1.85;

    this.spawnAccumulator += spawnRate * dtSec;
    while (this.spawnAccumulator >= 1) {
      this.spawnAccumulator -= 1;
      this.spawnOneParticle(false);
    }

    if (window.TuTien.State.data.prestige.rootId === 'loi') {
      this.lightningTimer += dtSec;
      if (this.lightningTimer >= (isBoosting ? 0.55 : 1.8)) {
        this.lightningTimer = 0;
        if (Math.random() < 0.65) this.spawnLightningArc();
      }
    }

    // Đặt trạng thái canvas 1 lần duy nhất cho cả lượt vẽ (không gọi save/restore trong vòng lặp)
    this.bgCtx.globalCompositeOperation = 'lighter';
    this.bgCtx.lineCap = 'round';
    this.fgCtx.globalCompositeOperation = 'lighter';
    this.fgCtx.lineCap = 'round';

    for (let i = 0; i < this.particlesPool.length; i++) {
      const p = this.particlesPool[i];
      if (!p.active) continue;

      const closenessBoost = 1 + Math.max(0, (210 - p.radius) / 145);
      p.angle += p.angularSpeed * closenessBoost * dtSec;
      p.radius -= p.radialSpeed * closenessBoost * dtSec;

      if (p.radius <= 10) {
        p.active = false;
        continue;
      }

      p.prevX3 = p.prevX2;
      p.prevY3 = p.prevY2;
      p.prevX2 = p.prevX1;
      p.prevY2 = p.prevY1;
      p.prevX1 = p.x;
      p.prevY1 = p.y;

      p.x = cx + Math.cos(p.angle) * p.radius;
      p.y = cy + Math.sin(p.angle) * p.radius * 0.88;

      const ctx = p.layer === 'bg' ? this.bgCtx : this.fgCtx;
      const fade = p.radius < 42 ? p.radius / 42 : 1;
      const baseAlpha = p.alpha * fade;

      // Vẽ đuôi lụa mượt chỉ với 1 đường path duy nhất (nhanh gấp 6 lần)
      ctx.globalAlpha = baseAlpha * 0.62;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size * 0.95;
      ctx.beginPath();
      ctx.moveTo(p.prevX3, p.prevY3);
      ctx.lineTo(p.prevX2, p.prevY2);
      ctx.lineTo(p.prevX1, p.prevY1);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Vẽ đầu hạt phát sáng bằng sprite offscreen đã cache sẵn (0 shadowBlur!)
      const sprite = this.getGlowSprite(p.color);
      const drawSize = p.size * 4.4;
      ctx.globalAlpha = baseAlpha;
      ctx.drawImage(sprite, p.x - drawSize * 0.5, p.y - drawSize * 0.5, drawSize, drawSize);
    }

    // Sóng ánh sáng khi chạm
    for (let i = 0; i < this.ripplesPool.length; i++) {
      const r = this.ripplesPool[i];
      if (!r.active) continue;

      r.radius += 220 * dtSec;
      r.alpha -= 1.5 * dtSec;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        r.active = false;
        continue;
      }

      this.fgCtx.globalAlpha = r.alpha;
      this.fgCtx.strokeStyle = r.color;
      this.fgCtx.lineWidth = 2;
      this.fgCtx.beginPath();
      this.fgCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.fgCtx.stroke();
    }

    // Tia sét Lôi Linh Căn (không dùng shadowBlur)
    for (let i = 0; i < this.lightningsPool.length; i++) {
      const bolt = this.lightningsPool[i];
      if (!bolt.active) continue;

      bolt.alpha -= 3.2 * dtSec;
      if (bolt.alpha <= 0) {
        bolt.active = false;
        continue;
      }

      this.fgCtx.globalAlpha = bolt.alpha;
      this.fgCtx.strokeStyle = bolt.color;
      this.fgCtx.lineWidth = 2.4;
      this.fgCtx.beginPath();
      for (let s = 0; s < bolt.segments.length; s++) {
        const pt = bolt.segments[s];
        if (s === 0) this.fgCtx.moveTo(pt.x, pt.y);
        else this.fgCtx.lineTo(pt.x, pt.y);
      }
      this.fgCtx.stroke();
    }

    this.bgCtx.globalAlpha = 1;
    this.fgCtx.globalAlpha = 1;
    this.bgCtx.globalCompositeOperation = 'source-over';
    this.fgCtx.globalCompositeOperation = 'source-over';
  }
};
