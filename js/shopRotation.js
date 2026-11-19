/**
 * js/shopRotation.js
 * Bộ sinh số giả ngẫu nhiên có hạt giống cố định (mulberry32) và quản lý chu kỳ thời gian thực cho Thương Thành.
 * TUYỆT ĐỐI KHÔNG dùng Math.random: cùng (chuKyId, floorId, shopId) luôn trả về cùng danh sách hàng/đơn hàng.
 */
window.TuTien = window.TuTien || {};

window.TuTien.ShopRotation = {
  hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  },

  mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  getCycleMs() {
    return (window.TuTien.CONFIG && window.TuTien.CONFIG.shop && window.TuTien.CONFIG.shop.rotationCycleMs)
      || (4 * 60 * 60 * 1000);
  },

  getCurrentCycleId(nowMs = Date.now()) {
    return Math.floor(nowMs / this.getCycleMs());
  },

  getRemainingMs(nowMs = Date.now()) {
    const cycleMs = this.getCycleMs();
    const nextAt = (Math.floor(nowMs / cycleMs) + 1) * cycleMs;
    return Math.max(0, nextAt - nowMs);
  },

  formatCountdown(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  },

  pickSeededItems(poolIds, count, cycleId, floorId, shopId) {
    if (!Array.isArray(poolIds) || poolIds.length === 0 || count <= 0) return [];
    const arr = poolIds.slice();
    const seed = this.hashSeed(`rot_${cycleId}_f${floorId}_${shopId}`);
    const rng = this.mulberry32(seed);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr.slice(0, Math.min(count, arr.length));
  },

  pickSeededOrders(templates, minCount, maxCount, cycleId, planeId) {
    if (!Array.isArray(templates) || templates.length === 0) return [];
    const seed = this.hashSeed(`orders_${cycleId}_${planeId || 'global'}`);
    const rng = this.mulberry32(seed);
    const span = Math.max(0, maxCount - minCount);
    const count = Math.min(templates.length, minCount + Math.floor(rng() * (span + 1)));
    const arr = templates.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr.slice(0, count);
  }
};
