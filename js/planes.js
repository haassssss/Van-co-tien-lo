/**
 * js/planes.js
 * Quản lý 4 Vị Diện, điều kiện mở khóa theo cảnh giới, và mốc hồi sinh 30 phút của Boss Thế Giới từng vị diện.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Planes = {
  ensureState() {
    const State = window.TuTien.State;
    if (!State || !State.data) return null;
    const d = State.data;
    if (!d.currentPlaneId) d.currentPlaneId = 'tan_thu_gioi';
    if (!d.bossRespawns || typeof d.bossRespawns !== 'object') d.bossRespawns = {};
    return d;
  },

  getCurrentPlane() {
    const d = this.ensureState();
    const id = (d && d.currentPlaneId) || 'tan_thu_gioi';
    return (window.TuTien.PLANES || []).find(p => p.id === id) || window.TuTien.PLANES[0];
  },

  isPlaneUnlocked(plane) {
    if (!plane) return false;
    const realmIdx = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.realmIndex) || 0;
    return realmIdx >= (plane.unlockRealmIdx || 0);
  },

  switchPlane(planeId) {
    const plane = (window.TuTien.PLANES || []).find(p => p.id === planeId);
    if (!plane) return false;
    if (!this.isPlaneUnlocked(plane)) {
      const reqRealm = (window.TuTien.REALMS && window.TuTien.REALMS[plane.unlockRealmIdx]) || { fullName: 'Cảnh giới cao hơn' };
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(`🔒 Cần đạt 【${reqRealm.fullName}】 để mở khóa ${plane.ten}!`, 'warn');
      }
      return false;
    }
    const d = this.ensureState();
    d.currentPlaneId = plane.id;
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    return true;
  },

  getMonstersForPlane(planeId) {
    return (window.TuTien.MONSTERS || []).filter(m => m.viDien === planeId && !m.isBoss);
  },

  getBossForPlane(planeId) {
    return (window.TuTien.MONSTERS || []).find(m => m.viDien === planeId && m.isBoss) || null;
  },

  getBossRespawnRemainingMs(bossId) {
    const d = this.ensureState();
    const until = (d && d.bossRespawns && d.bossRespawns[bossId]) || 0;
    return Math.max(0, until - Date.now());
  },

  markBossDefeated(bossId) {
    const d = this.ensureState();
    if (!d) return;
    const sec = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2 && window.TuTien.CONFIG.combatV2.bossRespawnSec) || 1800;
    d.bossRespawns[bossId] = Date.now() + sec * 1000;
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
  },

  /**
   * Màu cảnh báo chênh lệch cảnh giới: Xanh (<=0), Vàng (+1..+4), Đỏ (>=+5)
   */
  getThreatColor(monsterRealmIdx) {
    const pIdx = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.realmIndex) || 0;
    const diff = monsterRealmIdx - pIdx;
    if (diff >= 5) return { color: '#f87171', label: 'Nguy Hiểm' };
    if (diff >= 1) return { color: '#facc15', label: 'Cẩn Thận' };
    return { color: '#4ade80', label: 'An Toàn' };
  }
};
