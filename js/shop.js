/**
 * js/shop.js
 * Hệ thống Thương Thành: 4 tầng (Hạ / Trung / Thượng / Đấu Giá giữ chỗ), mở khóa theo đã tiêu,
 * giá động (vị diện, hảo cảm, sóng thị trường, nhích giá), luân phiên hạt giống, thu mua & khóa đồ,
 * hảo cảm chưởng quầy và Bảng Đơn Hàng.
 * Dùng đúng hệ thống Linh Thạch có sẵn trong js/inventory.js.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Shop = {
  _validated: false,

  getConfig() {
    return (window.TuTien.CONFIG && window.TuTien.CONFIG.shop) || {
      TANG_4_ENABLED: false,
      unlockMode: 'theo_tang',
      unlockThresholdsInLow: { 2: 2000, 3: 500000, 4: 1000000 },
      rotationCycleMs: 4 * 60 * 60 * 1000,
      rotatingSlotsPerShop: 3,
      marketWaveEnabled: true,
      marketWaveAmplitude: 0.10,
      marketWavePeriodMs: 2 * 60 * 60 * 1000,
      surgePerPurchase: 0.03,
      surgeMax: 0.60,
      surgeDecayPerMinute: 0.01,
      buybackRatio: 0.40,
      expensiveConfirmRatio: 0.25,
      highTierSellConfirm: 3,
      orderRewardMult: 1.5,
      orderMinCount: 3,
      orderMaxCount: 5,
      affinityTiers: [
        { level: 0, name: 'Khách Qua Đường', minSpentLow: 0, discount: 0 },
        { level: 1, name: 'Khách Quen', minSpentLow: 1500, discount: 0.05 },
        { level: 2, name: 'Quý Khách', minSpentLow: 25000, discount: 0.10 },
        { level: 3, name: 'Tri Kỷ', minSpentLow: 150000, discount: 0.15 },
        { level: 4, name: 'Chí Tôn Khách', minSpentLow: 600000, discount: 0.20 }
      ]
    };
  },

  init() {
    this.validateItems();
    this.ensureState();
    this.syncCycle();
  },

  // Kiểm tra lúc khởi động: mọi món phải có giá gốc nằm đúng dải giá của tầng
  validateItems() {
    if (this._validated) return;
    this._validated = true;
    const floors = window.TuTien.SHOP_FLOORS || [];
    const items = window.TuTien.SHOP_ITEMS || [];
    items.forEach(it => {
      const fl = floors.find(f => f.id === it.tang);
      if (!fl) {
        console.warn(`[Thương Thành] Món "${it.id}" có tầng không hợp lệ: ${it.tang}`);
        return;
      }
      if (it.gia < fl.minPriceLow || it.gia > fl.maxPriceLow) {
        console.warn(
          `[Thương Thành] Món "${it.id}" (Tầng ${it.tang}) có giá ${it.gia} Hạ nằm ngoài dải [${fl.minPriceLow}, ${fl.maxPriceLow}]!`
        );
      }
    });
  },

  createDefaultShopState() {
    const cycleId = window.TuTien.ShopRotation ? window.TuTien.ShopRotation.getCurrentCycleId() : 0;
    return {
      shopSpent: { 1: 0, 2: 0, 3: 0, 4: 0 },
      unlockedFloors: { 1: true, 2: false, 3: false, 4: false },
      cycleId,
      lastSeenCycleId: cycleId,
      unreadFloorUnlock: false,
      purchasedInCycle: {},
      surgeState: {},
      affinity: {},
      completedOrders: {},
      lockedItemUids: {},
      bagBonusSlots: 0,
      fieldBonusPlots: 0,
      mineBonusSlots: 0
    };
  },

  ensureState() {
    const State = window.TuTien.State;
    if (!State || !State.data) return this.createDefaultShopState();
    if (!State.data.shop || typeof State.data.shop !== 'object') {
      State.data.shop = this.createDefaultShopState();
    }
    const s = State.data.shop;
    const def = this.createDefaultShopState();
    s.shopSpent = { ...def.shopSpent, ...(s.shopSpent || {}) };
    s.unlockedFloors = { ...def.unlockedFloors, ...(s.unlockedFloors || {}), 1: true };
    if (typeof s.cycleId !== 'number') s.cycleId = def.cycleId;
    if (typeof s.lastSeenCycleId !== 'number') s.lastSeenCycleId = s.cycleId;
    if (typeof s.unreadFloorUnlock !== 'boolean') s.unreadFloorUnlock = false;
    s.purchasedInCycle = s.purchasedInCycle || {};
    s.surgeState = s.surgeState || {};
    s.affinity = s.affinity || {};
    s.completedOrders = s.completedOrders || {};
    s.lockedItemUids = s.lockedItemUids || {};
    if (typeof s.bagBonusSlots !== 'number') s.bagBonusSlots = 0;
    if (typeof s.fieldBonusPlots !== 'number') s.fieldBonusPlots = 0;
    if (typeof s.mineBonusSlots !== 'number') s.mineBonusSlots = 0;
    return s;
  },

  syncCycle(nowMs = Date.now()) {
    const s = this.ensureState();
    const curCycle = window.TuTien.ShopRotation ? window.TuTien.ShopRotation.getCurrentCycleId(nowMs) : 0;
    if (s.cycleId !== curCycle) {
      s.cycleId = curCycle;
      s.purchasedInCycle = {};
      s.completedOrders = {};
      s.surgeState = {};
    }
    return s.cycleId;
  },

  markNotificationsSeen() {
    const s = this.ensureState();
    s.lastSeenCycleId = this.syncCycle();
    s.unreadFloorUnlock = false;
  },

  hasUnreadNotification() {
    const s = this.ensureState();
    const curCycle = this.syncCycle();
    return !!(s.unreadFloorUnlock || s.lastSeenCycleId !== curCycle);
  },

  getFloorDef(floorId) {
    return (window.TuTien.SHOP_FLOORS || []).find(f => f.id === floorId) || null;
  },

  getItemDef(itemId) {
    return (window.TuTien.SHOP_ITEMS || []).find(i => i.id === itemId) || null;
  },

  getCurrentPlaneMarket() {
    const markets = window.TuTien.SHOP_PLANE_MARKETS || {};
    const curPlane = window.TuTien.Planes ? window.TuTien.Planes.getCurrentPlane() : null;
    const pid = (curPlane && curPlane.id) || 'tan_thu_gioi';
    return markets[pid] || markets.tan_thu_gioi || Object.values(markets)[0];
  },

  // Kiểm tra điều kiện đã tiêu để mở tầng
  getFloorUnlockProgress(floorId) {
    const cfg = this.getConfig();
    const s = this.ensureState();
    const fl = this.getFloorDef(floorId);
    if (!fl || fl.alwaysUnlocked) {
      return { unlocked: true, conditionMet: true, spent: 0, threshold: 0, pct: 100 };
    }
    const threshold = (cfg.unlockThresholdsInLow && cfg.unlockThresholdsInLow[floorId]) || 0;
    let spent = 0;
    if (cfg.unlockMode === 'tong') {
      spent = (s.shopSpent[1] || 0) + (s.shopSpent[2] || 0) + (s.shopSpent[3] || 0) + (s.shopSpent[4] || 0);
    } else {
      const fromFloor = fl.unlockFromFloor || (floorId - 1);
      spent = s.shopSpent[fromFloor] || 0;
    }
    const conditionMet = spent >= threshold || !!s.unlockedFloors[floorId];
    const unlocked = floorId === 4 ? (conditionMet && !!cfg.TANG_4_ENABLED) : (!!s.unlockedFloors[floorId] || conditionMet);
    const pct = threshold > 0 ? Math.min(100, Math.round((spent / threshold) * 100)) : 100;
    return { unlocked, conditionMet, spent, threshold, pct };
  },

  isFloorUnlocked(floorId) {
    return this.getFloorUnlockProgress(floorId).unlocked;
  },

  checkAndUnlockNextFloors() {
    const cfg = this.getConfig();
    const s = this.ensureState();
    [2, 3, 4].forEach(fid => {
      if (s.unlockedFloors[fid]) return;
      const prog = this.getFloorUnlockProgress(fid);
      if (prog.conditionMet) {
        s.unlockedFloors[fid] = true;
        if (fid === 4 && !cfg.TANG_4_ENABLED) {
          if (window.TuTien.UI) {
            window.TuTien.UI.showToast('🏛️ Bạn đã đủ điều kiện Tầng 4 (Đấu Giá), chờ ngày khai trương!', 'info');
          }
          return;
        }
        s.unreadFloorUnlock = true;
        const fl = this.getFloorDef(fid);
        if (window.TuTien.State) {
          window.TuTien.State.addLog(`🏮 Khai mở Thương Thành 【${fl ? fl.ten : 'Tầng ' + fid}】!`, 'success');
        }
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(`🎉 Đã mở khóa 【${fl ? fl.ten : 'Tầng ' + fid}】! ${fl ? fl.chaoKhach : ''}`, 'success');
        }
      }
    });
  },

  // Hảo cảm chưởng quầy
  getMerchantAffinity(merchantId) {
    const cfg = this.getConfig();
    const s = this.ensureState();
    const spent = s.affinity[merchantId] || 0;
    const tiers = cfg.affinityTiers || [];
    let current = tiers[0] || { level: 0, name: 'Khách Qua Đường', minSpentLow: 0, discount: 0 };
    let next = null;
    for (let i = 0; i < tiers.length; i++) {
      if (spent >= tiers[i].minSpentLow) {
        current = tiers[i];
        next = tiers[i + 1] || null;
      }
    }
    const pct = next
      ? Math.min(100, Math.round(((spent - current.minSpentLow) / Math.max(1, next.minSpentLow - current.minSpentLow)) * 100))
      : 100;
    return { spent, level: current.level, name: current.name, discount: current.discount, next, pct };
  },

  // Dao động sóng thị trường cố định theo Date.now(), lệch pha theo từng món
  getMarketWaveMult(itemId, nowMs = Date.now()) {
    const cfg = this.getConfig();
    if (!cfg.marketWaveEnabled) return 1.0;
    const amp = cfg.marketWaveAmplitude || 0.10;
    const period = cfg.marketWavePeriodMs || (2 * 60 * 60 * 1000);
    const phase = window.TuTien.ShopRotation
      ? (window.TuTien.ShopRotation.hashSeed(itemId) % 360) * (Math.PI / 180)
      : 0;
    return 1 + Math.sin((nowMs / period) * Math.PI * 2 + phase) * amp;
  },

  // Hệ số nhích giá hiện tại (hạ 1% mỗi phút thực)
  getSurgeMult(itemId, nowMs = Date.now()) {
    const cfg = this.getConfig();
    const s = this.ensureState();
    const rec = s.surgeState[itemId];
    if (!rec || !rec.extra) return 1.0;
    const elapsedMin = Math.max(0, (nowMs - (rec.updatedAt || nowMs)) / 60000);
    const decayed = Math.max(0, rec.extra - elapsedMin * (cfg.surgeDecayPerMinute || 0.01));
    return 1 + decayed;
  },

  bumpSurge(itemId, count, nowMs = Date.now()) {
    const cfg = this.getConfig();
    const s = this.ensureState();
    const curExtra = Math.max(0, this.getSurgeMult(itemId, nowMs) - 1);
    const nextExtra = Math.min(cfg.surgeMax || 0.60, curExtra + (cfg.surgePerPurchase || 0.03) * count);
    s.surgeState[itemId] = { extra: nextExtra, updatedAt: nowMs };
  },

  // Giá bán ra cuối cùng (làm tròn theo đơn vị tầng & kẹp trong dải giá tầng)
  getUnitPriceLow(item, nowMs = Date.now()) {
    const fl = this.getFloorDef(item.tang);
    if (!fl) return Math.max(1, Math.round(item.gia));
    const market = this.getCurrentPlaneMarket();
    const planeMult = (market && market.heSoGia) || 1.0;
    const aff = this.getMerchantAffinity(item.hangMuc);
    const wave = this.getMarketWaveMult(item.id, nowMs);
    const surge = this.getSurgeMult(item.id, nowMs);

    const raw = item.gia * planeMult * (1 - (aff.discount || 0)) * wave * surge;
    const unit = fl.donViLow || 1;
    let rounded = Math.round(raw / unit) * unit;
    rounded = Math.max(fl.minPriceLow, rounded);
    if (Number.isFinite(fl.maxPriceLow)) {
      rounded = Math.min(fl.maxPriceLow, rounded);
    }
    return Math.max(unit, rounded);
  },

  // Kiểm tra món hàng có phụ thuộc vào hệ thống tồn tại hay không (ẩn nếu thiếu)
  isItemSystemAvailable(item) {
    if (!item) return false;
    if (item.loai === 'alchemy_mat') {
      return !!(window.TuTien.ALCHEMY_MATERIALS && window.TuTien.ALCHEMY_MATERIALS.some(m => m.id === item.refId));
    }
    if (item.loai === 'forge_mat') {
      return !!(window.TuTien.FORGE_MATERIALS_EXT && window.TuTien.FORGE_MATERIALS_EXT.some(m => m.id === item.refId));
    }
    if (item.loai === 'talisman_mat') {
      return !!(window.TuTien.TALISMAN_MATERIALS && window.TuTien.TALISMAN_MATERIALS.some(m => m.id === item.refId));
    }
    if (item.loai === 'pill') {
      return !!(window.TuTien.ALCHEMY_PILLS && window.TuTien.ALCHEMY_PILLS.some(p => p.id === item.refId));
    }
    if (item.loai === 'talisman') {
      return !!(window.TuTien.TALISMAN_TEMPLATES && window.TuTien.TALISMAN_TEMPLATES.some(t => t.id === item.refId));
    }
    if (item.loai === 'artifact') {
      return !!(window.TuTien.ARTIFACT_BLUEPRINTS && window.TuTien.ARTIFACT_BLUEPRINTS.some(a => a.id === item.refId));
    }
    if (item.loai === 'technique') {
      return !!(window.TuTien.COMBAT_TECHNIQUES && window.TuTien.COMBAT_TECHNIQUES.some(t => t.id === item.refId));
    }
    return item.loai === 'utility';
  },

  // Lấy thông tin hiển thị (tên, biểu tượng, số đang có) từ dữ liệu thật của game
  resolveItemMeta(item) {
    const Inv = window.TuTien.Inventory;
    const State = window.TuTien.State;
    if (item.loai === 'alchemy_mat') {
      const m = (window.TuTien.ALCHEMY_MATERIALS || []).find(x => x.id === item.refId);
      const owned = (window.TuTien.Alchemy && window.TuTien.Alchemy.getHerbQty)
        ? window.TuTien.Alchemy.getHerbQty(item.refId)
        : (Inv ? Inv.getMaterialCountById(item.refId) : 0);
      return { name: m ? m.name : item.refId, icon: (m && m.icon) || '🌿', owned };
    }
    if (item.loai === 'forge_mat') {
      const m = (window.TuTien.FORGE_MATERIALS_EXT || []).find(x => x.id === item.refId);
      const owned = (window.TuTien.Forge && window.TuTien.Forge.getMaterialQty)
        ? window.TuTien.Forge.getMaterialQty(item.refId)
        : (Inv ? Inv.getMaterialCountById(item.refId) : 0);
      return { name: m ? m.name : item.refId, icon: (m && m.icon) || '⛏️', owned };
    }
    if (item.loai === 'talisman_mat') {
      const m = (window.TuTien.TALISMAN_MATERIALS || []).find(x => x.id === item.refId);
      const owned = (window.TuTien.Talisman && window.TuTien.Talisman.getMatQty)
        ? window.TuTien.Talisman.getMatQty(item.refId)
        : (Inv ? Inv.getMaterialCountById(item.refId) : 0);
      return { name: m ? m.name : item.refId, icon: (m && m.icon) || '📜', owned };
    }
    if (item.loai === 'artifact') {
      const bp = (window.TuTien.ARTIFACT_BLUEPRINTS || []).find(x => x.id === item.refId);
      const owned = (State && State.data && State.data.inventory && State.data.inventory.items)
        ? State.data.inventory.items.filter(x => x.category === 'artifact' && x.templateId === item.refId).length
        : 0;
      return { name: bp ? bp.name : item.refId, icon: (bp && bp.icon) || '⚔️', owned };
    }
    if (item.loai === 'pill') {
      const p = (window.TuTien.ALCHEMY_PILLS || []).find(x => x.id === item.refId);
      const owned = (State && State.data && State.data.inventory && State.data.inventory.items)
        ? State.data.inventory.items.filter(x => x.templateId === item.refId).reduce((acc, x) => acc + (x.qty || 1), 0)
        : 0;
      return { name: p ? p.name : item.refId, icon: (p && p.icon) || '💊', owned };
    }
    if (item.loai === 'talisman') {
      const t = (window.TuTien.TALISMAN_TEMPLATES || []).find(x => x.id === item.refId);
      const owned = (State && State.data && State.data.inventory && State.data.inventory.items)
        ? State.data.inventory.items.filter(x => x.templateId === item.refId).reduce((acc, x) => acc + (x.qty || 1), 0)
        : 0;
      return { name: t ? t.name : item.refId, icon: (t && t.icon) || '🧧', owned };
    }
    if (item.loai === 'technique') {
      const t = (window.TuTien.COMBAT_TECHNIQUES || []).find(x => x.id === item.refId);
      const learned = window.TuTien.Techniques ? window.TuTien.Techniques.isLearned(item.refId) : false;
      return { name: t ? t.ten : item.refId, icon: '📖', owned: learned ? 1 : 0, learned };
    }
    // utility
    const utilMap = {
      herb_pack_small: { name: 'Túi Linh Thảo (+50)', icon: '🌱', owned: (State && State.data && State.data.fields && State.data.fields.herbs) || 0 },
      herb_pack_large: { name: 'Rương Linh Thảo (+500)', icon: '🌿', owned: (State && State.data && State.data.fields && State.data.fields.herbs) || 0 },
      expand_bag_5: { name: 'Túi Trữ Vật +5 Ô', icon: '🎒', owned: this.ensureState().bagBonusSlots },
      expand_bag_10: { name: 'Túi Trữ Vật +10 Ô', icon: '🎒', owned: this.ensureState().bagBonusSlots },
      expand_bag_20: { name: 'Tiên Giới Trữ Vật +20 Ô', icon: '👜', owned: this.ensureState().bagBonusSlots },
      field_plot_1: { name: 'Mở Rộng +1 Ô Linh Điền', icon: '🌾', owned: this.ensureState().fieldBonusPlots },
      field_plot_2: { name: 'Khai Khẩn +2 Ô Tiên Điền', icon: '🌾', owned: this.ensureState().fieldBonusPlots },
      mine_slot_1: { name: 'Mở +1 Suất Khai Khoáng', icon: '⛏️', owned: this.ensureState().mineBonusSlots }
    };
    return utilMap[item.refId] || { name: item.refId, icon: '📦', owned: 0 };
  },

  // Lấy danh sách hàng cố định & luân phiên cho 1 tầng + 1 tiệm
  getShopListings(floorId, merchantId, nowMs = Date.now()) {
    const cycleId = this.syncCycle(nowMs);
    const market = this.getCurrentPlaneMarket();
    const cfg = this.getConfig();
    const floorBucket = (market && market.tang && market.tang[floorId]) || { fixed: [], rotatingPool: [] };

    const fixedItems = (floorBucket.fixed || [])
      .map(id => this.getItemDef(id))
      .filter(it => it && it.tang === floorId && it.hangMuc === merchantId && this.isItemSystemAvailable(it));

    const poolForMerchant = (floorBucket.rotatingPool || [])
      .map(id => this.getItemDef(id))
      .filter(it => it && it.tang === floorId && it.hangMuc === merchantId && this.isItemSystemAvailable(it))
      .map(it => it.id);

    const rotSlots = (cfg.rotatingSlotsByFloor && cfg.rotatingSlotsByFloor[floorId]) || cfg.rotatingSlotsPerShop || 4;
    const pickedIds = window.TuTien.ShopRotation
      ? window.TuTien.ShopRotation.pickSeededItems(poolForMerchant, rotSlots, cycleId, floorId, merchantId)
      : poolForMerchant.slice(0, rotSlots);

    const rotatingItems = pickedIds.map(id => this.getItemDef(id)).filter(Boolean);
    return { fixedItems, rotatingItems, cycleId };
  },

  getRemainingStock(item) {
    const s = this.ensureState();
    this.syncCycle();
    if (!item.gioiHanMoiDot || item.gioiHanMoiDot <= 0) return Infinity;
    const bought = s.purchasedInCycle[item.id] || 0;
    return Math.max(0, item.gioiHanMoiDot - bought);
  },

  canBuy(item, qty = 1, nowMs = Date.now()) {
    const Inv = window.TuTien.Inventory;
    const pRealmIdx = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.realmIndex) || 0;
    const unitPrice = this.getUnitPriceLow(item, nowMs);
    const totalCost = unitPrice * qty;

    if (!this.isFloorUnlocked(item.tang)) {
      return { ok: false, reason: 'Tầng chưa mở', unitPrice, totalCost, maxQty: 0 };
    }
    if (item.yeuCauCanhGioi && pRealmIdx < item.yeuCauCanhGioi) {
      const rName = (window.TuTien.REALMS && window.TuTien.REALMS[item.yeuCauCanhGioi] && window.TuTien.REALMS[item.yeuCauCanhGioi].fullName) || 'cảnh giới cao hơn';
      return { ok: false, reason: `Cần ${rName}`, unitPrice, totalCost, maxQty: 0 };
    }
    if (item.yeuCauHaoCam) {
      const aff = this.getMerchantAffinity(item.hangMuc);
      if (aff.level < item.yeuCauHaoCam) {
        return { ok: false, reason: `Cần Hảo Cảm bậc ${item.yeuCauHaoCam}`, unitPrice, totalCost, maxQty: 0 };
      }
    }
    if (item.loai === 'technique' && window.TuTien.Techniques && window.TuTien.Techniques.isLearned(item.refId)) {
      return { ok: false, reason: 'Đã lĩnh ngộ', unitPrice, totalCost, maxQty: 0 };
    }
    const remain = this.getRemainingStock(item);
    if (remain <= 0) {
      return { ok: false, reason: 'Hết hàng đợt này', unitPrice, totalCost, maxQty: 0 };
    }
    if (qty > remain) {
      return { ok: false, reason: `Chỉ còn ${remain}`, unitPrice, totalCost, maxQty: remain };
    }
    const canAfford = Inv ? Inv.canAffordSpiritStonesInLow(totalCost) : false;
    const totalWealth = Inv ? Inv.getTotalSpiritStonesInLow() : 0;
    const affordQty = unitPrice > 0 ? Math.floor(totalWealth / unitPrice) : 0;
    const maxQty = Math.min(item.loai === 'technique' ? 1 : (Number.isFinite(remain) ? remain : 99), affordQty);

    if (!canAfford) {
      return { ok: false, reason: 'Thiếu Linh Thạch', unitPrice, totalCost, maxQty };
    }
    return { ok: true, reason: '', unitPrice, totalCost, maxQty: Math.max(1, maxQty) };
  },

  deliverPurchasedItem(item, qty) {
    const Inv = window.TuTien.Inventory;
    const State = window.TuTien.State;
    const s = this.ensureState();
    const qIdx = Math.max(0, Math.min((window.TuTien.ITEM_QUALITIES || []).length - 1, (item.phamGiai || 1) - 1));
    const qObj = (window.TuTien.ITEM_QUALITIES && window.TuTien.ITEM_QUALITIES[qIdx]) || { tier: 1, name: 'Phàm Phẩm', color: '#cbd5e1', mult: 1 };

    if (item.loai === 'forge_mat') {
      if (window.TuTien.Forge && window.TuTien.Forge.addMaterialQty) {
        window.TuTien.Forge.addMaterialQty(item.refId, qty);
      } else if (Inv) {
        const meta = this.resolveItemMeta(item);
        Inv.addStackableItem('material', item.refId, meta.name, meta.icon, qObj, item.moTa, qty);
      }
      return;
    }
    if (item.loai === 'talisman_mat') {
      if (window.TuTien.Talisman && window.TuTien.Talisman.addMatQty) {
        window.TuTien.Talisman.addMatQty(item.refId, qty);
      } else if (Inv) {
        const meta = this.resolveItemMeta(item);
        Inv.addStackableItem('material', item.refId, meta.name, meta.icon, qObj, item.moTa, qty);
      }
      return;
    }
    if (item.loai === 'alchemy_mat') {
      if (window.TuTien.Alchemy && window.TuTien.Alchemy.addHerbQty) {
        window.TuTien.Alchemy.addHerbQty(item.refId, qty);
      } else if (Inv) {
        const meta = this.resolveItemMeta(item);
        Inv.addStackableItem('material', item.refId, meta.name, meta.icon, qObj, item.moTa, qty);
      }
      return;
    }
    if (item.loai === 'artifact' && Inv && State && State.data && State.data.inventory) {
      const bp = (window.TuTien.ARTIFACT_BLUEPRINTS || []).find(x => x.id === item.refId);
      const bag = State.data.inventory;
      const tier = Math.max(1, Math.min(3, item.phamGiai || 1));
      const baseStat = [18, 85, 320][tier - 1] || 18;
      for (let k = 0; k < qty; k++) {
        bag.items.push({
          uid: (bag.nextUid = (bag.nextUid || 1) + 1),
          category: 'artifact',
          templateId: item.refId,
          name: bp ? bp.name : item.refId,
          icon: (bp && bp.icon) || '⚔️',
          quality: qObj,
          qualityTier: tier,
          qualityName: qObj.name,
          equipped: false,
          qty: 1,
          bonusStats: {
            attack: Math.round(baseStat * 1.1),
            hp: Math.round(baseStat * 4.5),
            mp: Math.round(baseStat * 1.8),
            speed: Math.round(baseStat * 0.4)
          },
          effectDesc: item.moTa
        });
      }
      return;
    }
    if (item.loai === 'pill' && Inv) {
      const p = (window.TuTien.ALCHEMY_PILLS || []).find(x => x.id === item.refId);
      Inv.addStackableItem('pill', item.refId, p ? p.name : item.refId, (p && p.icon) || '💊', qObj, (p && p.desc) || item.moTa, qty, { pillRank: item.phamGiai || 1 });
      return;
    }
    if (item.loai === 'talisman' && Inv) {
      const t = (window.TuTien.TALISMAN_TEMPLATES || []).find(x => x.id === item.refId);
      Inv.addStackableItem('talisman', item.refId, t ? t.name : item.refId, (t && t.icon) || '🧧', qObj, (t && t.desc) || item.moTa, qty, { talismanRank: item.phamGiai || 1 });
      return;
    }
    if (item.loai === 'technique' && window.TuTien.Techniques) {
      window.TuTien.Techniques.grantTechnique(item.refId, 'Mua tại Thương Thành');
      return;
    }
    if (item.loai === 'utility' && State && State.data) {
      if (item.refId === 'herb_pack_small') State.data.fields.herbs = (State.data.fields.herbs || 0) + 50 * qty;
      else if (item.refId === 'herb_pack_large') State.data.fields.herbs = (State.data.fields.herbs || 0) + 500 * qty;
      else if (item.refId === 'expand_bag_5') s.bagBonusSlots += 5 * qty;
      else if (item.refId === 'expand_bag_10') s.bagBonusSlots += 10 * qty;
      else if (item.refId === 'expand_bag_20') s.bagBonusSlots += 20 * qty;
      else if (item.refId === 'field_plot_1') s.fieldBonusPlots += 1 * qty;
      else if (item.refId === 'field_plot_2') s.fieldBonusPlots += 2 * qty;
      else if (item.refId === 'mine_slot_1') s.mineBonusSlots += 1 * qty;
    }
  },

  buyItem(itemId, qty = 1, nowMs = Date.now()) {
    const item = this.getItemDef(itemId);
    if (!item) return { ok: false, reason: 'Không tìm thấy món hàng' };
    const safeQty = Math.max(1, Math.floor(qty));
    const chk = this.canBuy(item, safeQty, nowMs);
    if (!chk.ok) return chk;

    const Inv = window.TuTien.Inventory;
    if (!Inv || !Inv.spendSpiritStonesInLow(chk.totalCost)) {
      return { ok: false, reason: 'Thiếu Linh Thạch' };
    }

    const s = this.ensureState();
    this.syncCycle(nowMs);
    s.shopSpent[item.tang] = (s.shopSpent[item.tang] || 0) + chk.totalCost;
    s.affinity[item.hangMuc] = (s.affinity[item.hangMuc] || 0) + chk.totalCost;
    if (item.gioiHanMoiDot > 0) {
      s.purchasedInCycle[item.id] = (s.purchasedInCycle[item.id] || 0) + safeQty;
    }
    this.bumpSurge(item.id, safeQty, nowMs);
    this.deliverPurchasedItem(item, safeQty);
    this.checkAndUnlockNextFloors();

    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateAll();

    const meta = this.resolveItemMeta(item);
    return { ok: true, spent: chk.totalCost, qty: safeQty, name: meta.name };
  },

  // =========================================================================
  // THU MUA (BÁN ĐỒ) & KHÓA VẬT PHẨM
  // =========================================================================
  isItemLocked(uid) {
    const s = this.ensureState();
    return !!s.lockedItemUids[uid];
  },

  toggleLockItem(uid) {
    const s = this.ensureState();
    if (s.lockedItemUids[uid]) delete s.lockedItemUids[uid];
    else s.lockedItemUids[uid] = true;
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    return !!s.lockedItemUids[uid];
  },

  // Tính giá thu mua cho 1 đơn vị vật phẩm trong Túi Trữ Vật (luôn <= 40% giá gốc để chống mua rẻ bán đắt)
  getBagItemBuybackUnitLow(bagItem) {
    const cfg = this.getConfig();
    const ratio = cfg.buybackRatio || 0.40;
    const matchShop = (window.TuTien.SHOP_ITEMS || []).find(si => si.refId === bagItem.templateId);
    if (matchShop) {
      const minPossibleBuy = Math.max(1, Math.floor(matchShop.gia * 0.70));
      return Math.max(1, Math.min(minPossibleBuy - 1, Math.floor(matchShop.gia * ratio)));
    }
    const qTier = (bagItem.quality && bagItem.quality.tier) || bagItem.pillRank || bagItem.talismanRank || 1;
    const baseByCat = {
      material: [8, 25, 120, 600, 3000],
      pill: [30, 120, 500, 2200, 10000],
      talisman: [35, 140, 600, 2500, 12000],
      artifact: [80, 350, 1500, 7000, 30000]
    };
    const arr = baseByCat[bagItem.category] || baseByCat.material;
    const base = arr[Math.max(0, Math.min(arr.length - 1, qTier - 1))] || 10;
    return Math.max(1, Math.floor(base * ratio));
  },

  sellBagItems(uidList) {
    const State = window.TuTien.State;
    const Inv = window.TuTien.Inventory;
    if (!State || !State.data || !State.data.inventory || !Inv) return { ok: false, totalEarned: 0, count: 0 };
    const uidSet = new Set(uidList.map(Number));
    const items = State.data.inventory.items || [];
    let totalEarned = 0;
    let soldCount = 0;
    const remaining = [];

    items.forEach(it => {
      if (uidSet.has(Number(it.uid)) && !it.equipped && !this.isItemLocked(it.uid)) {
        const qty = it.qty || 1;
        totalEarned += this.getBagItemBuybackUnitLow(it) * qty;
        soldCount += qty;
      } else {
        remaining.push(it);
      }
    });

    if (soldCount <= 0) return { ok: false, totalEarned: 0, count: 0 };
    State.data.inventory.items = remaining;
    Inv.addSpiritStones(totalEarned, 0, 0);
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    return { ok: true, totalEarned, count: soldCount };
  },

  // =========================================================================
  // BẢNG ĐƠN HÀNG (SEEDED THEO CHU KỲ)
  // =========================================================================
  getActiveOrders(nowMs = Date.now()) {
    const cfg = this.getConfig();
    const cycleId = this.syncCycle(nowMs);
    const pRealmIdx = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.realmIndex) || 0;
    const curPlane = window.TuTien.Planes ? window.TuTien.Planes.getCurrentPlane() : null;
    const planeId = (curPlane && curPlane.id) || 'tan_thu_gioi';

    const eligible = (window.TuTien.SHOP_ORDER_TEMPLATES || []).filter(o => (o.minRealmIdx || 0) <= pRealmIdx);
    const picked = window.TuTien.ShopRotation
      ? window.TuTien.ShopRotation.pickSeededOrders(eligible, cfg.orderMinCount || 3, cfg.orderMaxCount || 5, cycleId, planeId)
      : eligible.slice(0, 3);

    const s = this.ensureState();
    return picked.map(o => ({
      ...o,
      rewardLow: Math.max(10, Math.round(o.baseValueLow * (cfg.orderRewardMult || 1.5))),
      completed: !!s.completedOrders[o.id]
    }));
  },

  checkOrderProgress(order) {
    const State = window.TuTien.State;
    const Inv = window.TuTien.Inventory;
    const req = order.req;
    if (!State || !State.data || !Inv) return { ok: false, have: 0, need: req.qty };

    if (req.type === 'material') {
      const have = (window.TuTien.Forge && window.TuTien.Forge.getMaterialQty)
        ? window.TuTien.Forge.getMaterialQty(req.refId)
        : Inv.getMaterialCountById(req.refId);
      return { ok: have >= req.qty, have, need: req.qty };
    }
    if (req.type === 'alchemy_mat') {
      const have = (window.TuTien.Alchemy && window.TuTien.Alchemy.getHerbQty)
        ? window.TuTien.Alchemy.getHerbQty(req.refId)
        : Inv.getMaterialCountById(req.refId);
      return { ok: have >= req.qty, have, need: req.qty };
    }
    if (req.type === 'talisman_mat') {
      const have = (window.TuTien.Talisman && window.TuTien.Talisman.getMatQty)
        ? window.TuTien.Talisman.getMatQty(req.refId)
        : Inv.getMaterialCountById(req.refId);
      return { ok: have >= req.qty, have, need: req.qty };
    }
    if (req.type === 'bag_category') {
      const items = (State.data.inventory.items || []).filter(it => {
        if (it.category !== req.category || it.equipped || this.isItemLocked(it.uid)) return false;
        const qTier = (it.quality && it.quality.tier) || it.pillRank || it.talismanRank || 1;
        return qTier >= (req.minQuality || 1);
      });
      const have = items.reduce((acc, it) => acc + (it.qty || 1), 0);
      return { ok: have >= req.qty, have, need: req.qty };
    }
    return { ok: false, have: 0, need: req.qty };
  },

  fulfillOrder(orderId) {
    const orders = this.getActiveOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || order.completed) return { ok: false, reason: 'Đơn hàng không khả dụng' };
    const prog = this.checkOrderProgress(order);
    if (!prog.ok) return { ok: false, reason: `Chưa đủ vật phẩm (${prog.have}/${prog.need})` };

    const State = window.TuTien.State;
    const Inv = window.TuTien.Inventory;
    const req = order.req;
    let toRemove = req.qty;
    const nextItems = [];

    (State.data.inventory.items || []).forEach(it => {
      if (toRemove <= 0) {
        nextItems.push(it);
        return;
      }
      const matchMat = (req.type === 'material' || req.type === 'alchemy_mat' || req.type === 'talisman_mat') && it.templateId === req.refId;
      const matchCat = req.type === 'bag_category' && it.category === req.category && !it.equipped && !this.isItemLocked(it.uid) &&
        (((it.quality && it.quality.tier) || it.pillRank || it.talismanRank || 1) >= (req.minQuality || 1));

      if (matchMat || matchCat) {
        const q = it.qty || 1;
        if (q <= toRemove) {
          toRemove -= q;
        } else {
          it.qty = q - toRemove;
          toRemove = 0;
          nextItems.push(it);
        }
      } else {
        nextItems.push(it);
      }
    });

    State.data.inventory.items = nextItems;
    Inv.addSpiritStones(order.rewardLow, 0, 0);
    const s = this.ensureState();
    s.completedOrders[order.id] = true;
    s.affinity[order.merchantId] = (s.affinity[order.merchantId] || 0) + (order.affinityGain || 100);

    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    if (window.TuTien.UI) window.TuTien.UI.updateAll();
    return { ok: true, rewardLow: order.rewardLow, affinityGain: order.affinityGain || 100 };
  }
};
