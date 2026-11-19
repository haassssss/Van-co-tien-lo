/**
 * js/shopUI.js
 * Giao diện Thương Thành phong cách tu tiên (hỗ trợ cả máy tính và điện thoại):
 * - Thanh số dư 3 hạng Linh Thạch (Thượng / Trung / Hạ Phẩm) & đồng hồ đổi hàng luân phiên
 * - 4 tab Tầng + tab Thu Mua (bán đồ & khóa vật phẩm) + tab Bảng Đơn Hàng
 * - Trong mỗi tầng: tab các tiệm có hàng, lời thoại chưởng quầy, thanh hảo cảm, hàng cố định & luân phiên
 */
window.TuTien = window.TuTien || {};

window.TuTien.ShopUI = {
  activeTab: 'floor_1',
  activeMerchantByFloor: { 1: 'dan_phuong', 2: 'dan_phuong', 3: 'dan_phuong' },
  lastDialogue: '',
  selectedSellUids: new Set(),
  countdownTimer: null,

  open() {
    const ov = document.getElementById('shop-modal-overlay');
    if (!ov) return;
    if (window.TuTien.Shop) {
      window.TuTien.Shop.init();
      window.TuTien.Shop.markNotificationsSeen();
    }
    ov.classList.remove('hidden');
    this.lastDialogue = '';
    this.render();
    this.startClock();
    if (window.TuTien.UI && window.TuTien.UI.updateHotbarDots) {
      window.TuTien.UI.updateHotbarDots();
    }

    const closeBtn = document.getElementById('shop-modal-close');
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.close();
      });
    }
  },

  close() {
    const ov = document.getElementById('shop-modal-overlay');
    if (ov) ov.classList.add('hidden');
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  },

  startClock() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      const el = document.getElementById('shop-rotation-clock');
      if (el && window.TuTien.ShopRotation) {
        el.textContent = window.TuTien.ShopRotation.formatCountdown(window.TuTien.ShopRotation.getRemainingMs());
      }
    }, 1000);
  },

  getQualityColor(tier) {
    const colors = ['#cbd5e1', '#fde047', '#38bdf8', '#4ade80', '#c084fc', '#fb923c', '#f43f5e'];
    return colors[Math.max(0, Math.min(colors.length - 1, (tier || 1) - 1))];
  },

  render() {
    const container = document.getElementById('shop-panel-container');
    if (!container || !window.TuTien.Shop) return;
    const Shop = window.TuTien.Shop;
    const Inv = window.TuTien.Inventory;
    const stones = Inv ? Inv.getSpiritStones() : { low: 0, mid: 0, high: 0 };
    const market = Shop.getCurrentPlaneMarket();
    const remainStr = window.TuTien.ShopRotation
      ? window.TuTien.ShopRotation.formatCountdown(window.TuTien.ShopRotation.getRemainingMs())
      : '00:00:00';

    const floors = window.TuTien.SHOP_FLOORS || [];
    const topTabsHtml = floors.map(fl => {
      const prog = Shop.getFloorUnlockProgress(fl.id);
      const isAct = this.activeTab === `floor_${fl.id}`;
      const lockIcon = fl.id === 4 ? '🔒' : (prog.unlocked ? '🏛️' : '🔒');
      return `
        <button class="shop-top-tab ${isAct ? 'active' : ''} ${!prog.unlocked ? 'locked' : ''}" data-tab="floor_${fl.id}">
          ${lockIcon} ${fl.shortName}
        </button>
      `;
    }).join('') + `
      <button class="shop-top-tab ${this.activeTab === 'sell' ? 'active' : ''}" data-tab="sell">⚖️ Thu Mua</button>
      <button class="shop-top-tab ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">📜 Đơn Hàng</button>
    `;

    const modalCard = document.querySelector('.shop-modal-card');
    let bgFloor = 1;
    let bodyHtml = '';
    if (this.activeTab === 'sell') {
      bgFloor = 1;
      bodyHtml = this.renderSellTabHtml();
    } else if (this.activeTab === 'orders') {
      bgFloor = 2;
      bodyHtml = this.renderOrdersTabHtml();
    } else {
      bgFloor = Number(this.activeTab.replace('floor_', '')) || 1;
      bodyHtml = this.renderFloorTabHtml(bgFloor);
    }
    if (modalCard) {
      modalCard.classList.remove('shop-bg-floor-1', 'shop-bg-floor-2', 'shop-bg-floor-3', 'shop-bg-floor-4');
      modalCard.classList.add(`shop-bg-floor-${bgFloor}`);
    }

    container.innerHTML = `
      <div class="shop-top-summary">
        <div class="shop-balance-strip">
          <span class="shop-stone-pill high">💎 Thượng: <strong>${stones.high}</strong></span>
          <span class="shop-stone-pill mid">💠 Trung: <strong>${stones.mid}</strong></span>
          <span class="shop-stone-pill low">🔹 Hạ: <strong>${stones.low}</strong></span>
        </div>
        <div class="shop-meta-strip">
          <span>🌌 ${market ? market.tenCho : 'Chợ Chung'}</span>
          <span>⏳ Đổi hàng sau: <strong id="shop-rotation-clock">${remainStr}</strong></span>
        </div>
      </div>
      <div class="shop-top-tabs">${topTabsHtml}</div>
      <div class="shop-body-scroll">${bodyHtml}</div>
    `;

    this.bindEvents(container);
  },

  renderFloorTabHtml(floorId) {
    const Shop = window.TuTien.Shop;
    const Inv = window.TuTien.Inventory;
    const fl = Shop.getFloorDef(floorId);
    if (!fl) return '';
    const prog = Shop.getFloorUnlockProgress(floorId);
    const cfg = Shop.getConfig();

    // Tầng 4 giữ chỗ hoặc tầng chưa mở
    if (floorId === 4 && !cfg.TANG_4_ENABLED) {
      return `
        <div class="shop-locked-box">
          <div style="font-size:2rem;margin-bottom:6px;">🏛️</div>
          <h3 style="color:#facc15;margin:0 0 6px;">${fl.ten}</h3>
          <p style="color:#fde68a;font-weight:700;margin:0 0 8px;">
            ${prog.conditionMet ? '✨ Đã đủ điều kiện, chờ ngày khai trương!' : '🔒 Sắp ra mắt'}
          </p>
          <p style="font-size:0.8rem;color:var(--ivory-muted);margin:0 0 10px;">
            Điều kiện: Đã tiêu ${Inv.formatSpiritStoneCost(prog.threshold)} ở Tầng 3.
          </p>
          <div class="shop-progress-bar"><div class="shop-progress-fill" style="width:${prog.pct}%"></div></div>
          <div style="font-size:0.78rem;color:#86efac;margin-top:5px;">
            Đã tiêu: ${Inv.formatSpiritStoneCost(prog.spent)} / ${Inv.formatSpiritStoneCost(prog.threshold)} (${prog.pct}%)
          </div>
        </div>
      `;
    }

    if (!prog.unlocked) {
      const fromText = cfg.unlockMode === 'tong' ? 'tại Thương Thành' : `ở Tầng ${fl.unlockFromFloor}`;
      return `
        <div class="shop-locked-box">
          <div style="font-size:2rem;margin-bottom:6px;">🔒</div>
          <h3 style="color:#facc15;margin:0 0 6px;">${fl.ten}</h3>
          <p style="font-size:0.82rem;color:var(--ivory-muted);margin:0 0 10px;">
            Cần tiêu tổng cộng <strong>${Inv.formatSpiritStoneCost(prog.threshold)}</strong> ${fromText} để khai mở.
          </p>
          <div class="shop-progress-bar"><div class="shop-progress-fill" style="width:${prog.pct}%"></div></div>
          <div style="font-size:0.78rem;color:#86efac;margin-top:6px;">
            Đã tiêu: ${Inv.formatSpiritStoneCost(prog.spent)} / ${Inv.formatSpiritStoneCost(prog.threshold)} (${prog.pct}%)
          </div>
        </div>
      `;
    }

    // Chỉ hiện các tiệm có hàng ở tầng này
    const availableMerchants = (fl.tiemIds || []).filter(mId => {
      const lst = Shop.getShopListings(floorId, mId);
      return lst.fixedItems.length > 0 || lst.rotatingItems.length > 0;
    });
    let curMerchant = this.activeMerchantByFloor[floorId];
    if (!availableMerchants.includes(curMerchant)) {
      curMerchant = availableMerchants[0] || 'dan_phuong';
      this.activeMerchantByFloor[floorId] = curMerchant;
    }

    const mTabsHtml = availableMerchants.map(mId => {
      const m = window.TuTien.SHOP_MERCHANTS[mId];
      return `
        <button class="shop-merchant-tab ${mId === curMerchant ? 'active' : ''}" data-floor="${floorId}" data-merchant="${mId}">
          ${m ? `${m.icon} ${m.tenTiem}` : mId}
        </button>
      `;
    }).join('');

    const mInfo = window.TuTien.getShopMerchantForFloor ? window.TuTien.getShopMerchantForFloor(curMerchant, floorId) : window.TuTien.SHOP_MERCHANTS[curMerchant];
    const aff = Shop.getMerchantAffinity(curMerchant);
    const quote = this.lastDialogue || (mInfo && mInfo.thoai.moTiem) || fl.chaoKhach;
    const listings = Shop.getShopListings(floorId, curMerchant);

    const renderCard = (item, isRotating) => {
      const meta = Shop.resolveItemMeta(item);
      const chk1 = Shop.canBuy(item, 1);
      const chk10 = Shop.canBuy(item, 10);
      const remain = Shop.getRemainingStock(item);
      const qColor = this.getQualityColor(item.phamGiai);
      const stockLabel = Number.isFinite(remain) ? `Còn: ${remain}/${item.gioiHanMoiDot}` : 'Không giới hạn';
      const surgePct = Math.round((Shop.getSurgeMult(item.id) - 1) * 100);

      return `
        <div class="shop-item-card ${!chk1.ok ? 'shop-item-disabled' : ''}" style="border-left:3px solid ${qColor};">
          <div class="shop-item-main">
            <div class="shop-item-head">
              <span class="shop-item-icon">${meta.icon}</span>
              <strong style="color:${qColor};font-size:0.86rem;">${meta.name}</strong>
              ${isRotating ? '<span class="jade-badge" style="color:#fde047;">Luân Phiên</span>' : ''}
              ${item.yeuCauHaoCam ? `<span class="jade-badge" style="color:#f472b6;">Hảo Cảm ${item.yeuCauHaoCam}</span>` : ''}
            </div>
            <div class="shop-item-desc">${item.moTa}</div>
            <div class="shop-item-stats">
              <span>Trong túi: <strong>${meta.owned}</strong></span>
              <span>• ${stockLabel}</span>
              ${surgePct > 0 ? `<span style="color:#fb923c;">• Giá nhích +${surgePct}%</span>` : ''}
            </div>
          </div>
          <div class="shop-item-actions">
            <div class="shop-item-price">${Inv.formatSpiritStoneCost(chk1.unitPrice)}</div>
            ${
              !chk1.ok
                ? `<div class="shop-disabled-reason">${chk1.reason}</div>`
                : `
                  <div class="shop-buy-btn-row">
                    <button class="btn-ancient-sm affordable btn-shop-buy" data-id="${item.id}" data-qty="1">Mua x1</button>
                    ${item.loai !== 'technique' ? `<button class="btn-ancient-sm ${chk10.ok ? 'affordable' : ''} btn-shop-buy" data-id="${item.id}" data-qty="10" ${!chk10.ok ? 'disabled' : ''}>x10</button>` : ''}
                    ${item.loai !== 'technique' ? `<button class="btn-ancient-sm affordable btn-shop-buy" data-id="${item.id}" data-qty="${chk1.maxQty}">Tối đa (${chk1.maxQty})</button>` : ''}
                  </div>
                `
            }
          </div>
        </div>
      `;
    };

    return `
      <div class="shop-merchant-tabs">${mTabsHtml}</div>
      <div class="shop-merchant-banner">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div>
            <strong style="color:#fde047;">${mInfo ? `${mInfo.icon} ${mInfo.tenChuongQuay}` : ''}</strong>
            <span style="font-size:0.74rem;color:var(--ivory-muted);"> (${mInfo ? mInfo.danhHieu : ''})</span>
          </div>
          <span class="jade-badge" style="color:#86efac;">❤️ ${aff.name}${aff.next ? ` (${aff.pct}%)` : ' (Tối đa)'} • Giảm ${Math.round(aff.discount * 100)}%</span>
        </div>
        <div class="shop-merchant-quote">"${quote}"</div>
        <div class="shop-progress-bar" style="height:6px;margin-top:6px;"><div class="shop-progress-fill" style="width:${aff.pct}%"></div></div>

      </div>

      ${listings.fixedItems.length ? `
        <h4 class="ancient-section-title" style="margin:8px 0 6px;">📦 Hàng Cố Định (${fl.hangTien})</h4>
        <div class="shop-items-grid">${listings.fixedItems.map(it => renderCard(it, false)).join('')}</div>
      ` : ''}

      ${listings.rotatingItems.length ? `
        <h4 class="ancient-section-title" style="margin:12px 0 6px;">🔄 Hàng Luân Phiên Đợt Này</h4>
        <div class="shop-items-grid">${listings.rotatingItems.map(it => renderCard(it, true)).join('')}</div>
      ` : ''}
    `;
  },

  renderSellTabHtml() {
    const Shop = window.TuTien.Shop;
    const Inv = window.TuTien.Inventory;
    const items = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.inventory && window.TuTien.State.data.inventory.items) || [];

    let selectedTotalLow = 0;
    items.forEach(it => {
      if (this.selectedSellUids.has(Number(it.uid)) && !it.equipped && !Shop.isItemLocked(it.uid)) {
        selectedTotalLow += Shop.getBagItemBuybackUnitLow(it) * (it.qty || 1);
      }
    });

    const listHtml = items.length === 0
      ? '<div class="shop-locked-box">Túi Trữ Vật hiện đang trống.</div>'
      : items.map(it => {
          const locked = Shop.isItemLocked(it.uid);
          const canSell = !it.equipped && !locked;
          const unitLow = Shop.getBagItemBuybackUnitLow(it);
          const totalLow = unitLow * (it.qty || 1);
          const checked = canSell && this.selectedSellUids.has(Number(it.uid));
          const qColor = (it.quality && it.quality.color) || '#cbd5e1';
          const qName = (it.quality && it.quality.name) || 'Phàm Phẩm';
          return `
            <div class="shop-sell-row ${!canSell ? 'shop-item-disabled' : ''}">
              <label style="display:flex;align-items:center;gap:8px;flex:1;cursor:pointer;">
                <input type="checkbox" class="chk-sell-item" data-uid="${it.uid}" ${checked ? 'checked' : ''} ${!canSell ? 'disabled' : ''} />
                <span>${it.icon || '📦'}</span>
                <div>
                  <strong style="color:${qColor};font-size:0.84rem;">${it.name}</strong>
                  <span style="font-size:0.72rem;color:var(--ivory-muted);"> [${qName}] ×${it.qty || 1}</span>
                  ${it.equipped ? '<span class="jade-badge" style="color:#38bdf8;margin-left:4px;">Đang trang bị</span>' : ''}
                </div>
              </label>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:0.78rem;color:#86efac;">${Inv.formatSpiritStoneCost(totalLow)}</span>
                <button class="btn-ancient-sm btn-lock-item" data-uid="${it.uid}" title="Khóa/Mở khóa vật phẩm">${locked ? '🔒' : '🔓'}</button>
              </div>
            </div>
          `;
        }).join('');

    return `
      <div class="shop-sell-toolbar">
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn-ancient-sm btn-sell-bulk" data-filter="material">Bán tất cả Nguyên Liệu</button>
          <button class="btn-ancient-sm btn-sell-bulk" data-filter="tier1">Bán tất cả Phẩm 1</button>
          <button class="btn-ancient-sm btn-sell-bulk" data-filter="pill">Bán tất cả Đan Dược</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:0.8rem;color:#fde047;">Dự kiến nhận: <strong>${Inv.formatSpiritStoneCost(selectedTotalLow)}</strong></span>
          <button id="btn-confirm-sell-selected" class="btn-ancient-sm ${selectedTotalLow > 0 ? 'affordable' : ''}" ${selectedTotalLow <= 0 ? 'disabled' : ''}>⚖️ Bán đã chọn</button>
        </div>
      </div>
      <div class="shop-sell-list">${listHtml}</div>
    `;
  },

  renderOrdersTabHtml() {
    const Shop = window.TuTien.Shop;
    const Inv = window.TuTien.Inventory;
    const orders = Shop.getActiveOrders();
    if (!orders.length) {
      return '<div class="shop-locked-box">Hiện chưa có đơn hàng nào khả thi.</div>';
    }
    return `
      <div class="shop-items-grid">
        ${orders.map(o => {
          const m = window.TuTien.SHOP_MERCHANTS[o.merchantId];
          const prog = Shop.checkOrderProgress(o);
          return `
            <div class="shop-item-card" style="border-left:3px solid ${o.completed ? '#4ade80' : '#facc15'};">
              <div class="shop-item-main">
                <div class="shop-item-head">
                  <span>${m ? m.icon : '📜'}</span>
                  <strong style="color:#fde047;font-size:0.86rem;">${o.ten}</strong>
                  <span class="jade-badge">${m ? m.tenTiem : ''}</span>
                </div>
                <div class="shop-item-desc">${o.moTa}</div>
                <div class="shop-item-stats">
                  <span>Tiến độ: <strong>${prog.have}/${prog.need}</strong></span>
                  <span>• Thưởng: <strong style="color:#86efac;">${Inv.formatSpiritStoneCost(o.rewardLow)}</strong> + ❤️ ${o.affinityGain} Hảo Cảm</span>
                </div>
              </div>
              <div class="shop-item-actions">
                ${
                  o.completed
                    ? '<span class="jade-badge" style="color:#4ade80;">✅ Đã hoàn thành</span>'
                    : `<button class="btn-ancient-sm ${prog.ok ? 'affordable' : ''} btn-fulfill-order" data-order="${o.id}" ${!prog.ok ? 'disabled' : ''}>📦 Nộp Đơn</button>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  bindEvents(container) {
    const Shop = window.TuTien.Shop;
    const Inv = window.TuTien.Inventory;
    const cfg = Shop.getConfig();

    container.querySelectorAll('.shop-top-tab').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.activeTab = btn.getAttribute('data-tab');
        this.lastDialogue = '';
        this.render();
      });
    });

    container.querySelectorAll('.shop-merchant-tab').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const fl = Number(btn.getAttribute('data-floor'));
        const mId = btn.getAttribute('data-merchant');
        this.activeMerchantByFloor[fl] = mId;
        this.lastDialogue = '';
        this.render();
      });
    });

    container.querySelectorAll('.btn-shop-buy').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const qty = Number(btn.getAttribute('data-qty')) || 1;
        const item = Shop.getItemDef(id);
        if (!item) return;
        const chk = Shop.canBuy(item, qty);
        if (!chk.ok) return;

        // Xác nhận nếu món đắt vượt ngưỡng (>25% tổng tài sản)
        const wealth = Inv ? Inv.getTotalSpiritStonesInLow() : 0;
        if (wealth > 0 && chk.totalCost > wealth * (cfg.expensiveConfirmRatio || 0.25)) {
          const ok = window.confirm(
            `Giao dịch này tốn ${Inv.formatSpiritStoneCost(chk.totalCost)} (vượt ${Math.round((cfg.expensiveConfirmRatio || 0.25) * 100)}% tổng Linh Thạch hiện có). Xác nhận mua?`
          );
          if (!ok) return;
        }

        const res = Shop.buyItem(id, qty);
        if (res.ok) {
          const m = window.TuTien.getShopMerchantForFloor ? window.TuTien.getShopMerchantForFloor(item.hangMuc, item.tang) : window.TuTien.SHOP_MERCHANTS[item.hangMuc];
          this.lastDialogue = m ? (qty >= 5 ? m.thoai.muaNhieu : m.thoai.mua) : '';
          if (window.TuTien.UI) {
            window.TuTien.UI.showToast(`🛍️ Đã mua ${res.name} ×${res.qty} (-${Inv.formatSpiritStoneCost(res.spent)})`, 'success');
          }
          this.render();
        }
      });
    });

    container.querySelectorAll('.chk-sell-item').forEach(chk => {
      chk.addEventListener('change', () => {
        const uid = Number(chk.getAttribute('data-uid'));
        if (chk.checked) this.selectedSellUids.add(uid);
        else this.selectedSellUids.delete(uid);
        this.render();
      });
    });

    container.querySelectorAll('.btn-lock-item').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const uid = Number(btn.getAttribute('data-uid'));
        Shop.toggleLockItem(uid);
        this.selectedSellUids.delete(uid);
        this.render();
      });
    });

    const btnSellSel = container.querySelector('#btn-confirm-sell-selected');
    if (btnSellSel) {
      btnSellSel.addEventListener('pointerdown', e => {
        e.preventDefault();
        const uids = Array.from(this.selectedSellUids);
        if (!uids.length) return;
        const items = (window.TuTien.State.data.inventory.items || []).filter(it => uids.includes(Number(it.uid)));
        const hasHighTier = items.some(it => ((it.quality && it.quality.tier) || it.pillRank || it.talismanRank || 1) >= (cfg.highTierSellConfirm || 3));
        if (hasHighTier) {
          if (!window.confirm('Danh sách bán có vật phẩm phẩm chất cao (từ Phẩm 3 trở lên). Bạn chắc chắn muốn bán?')) return;
        }
        const res = Shop.sellBagItems(uids);
        if (res.ok) {
          this.selectedSellUids.clear();
          if (window.TuTien.UI) {
            window.TuTien.UI.showToast(`⚖️ Đã bán ${res.count} vật phẩm, nhận +${Inv.formatSpiritStoneCost(res.totalEarned)}!`, 'success');
          }
          this.render();
        }
      });
    }

    container.querySelectorAll('.btn-sell-bulk').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const flt = btn.getAttribute('data-filter');
        const items = (window.TuTien.State.data.inventory.items || []).filter(it => {
          if (it.equipped || Shop.isItemLocked(it.uid)) return false;
          if (flt === 'material') return it.category === 'material';
          if (flt === 'pill') return it.category === 'pill';
          if (flt === 'tier1') return ((it.quality && it.quality.tier) || 1) === 1;
          return false;
        });
        if (!items.length) {
          if (window.TuTien.UI) window.TuTien.UI.showToast('Không có vật phẩm phù hợp (hoặc đã bị khóa).', 'info');
          return;
        }
        const est = items.reduce((acc, it) => acc + Shop.getBagItemBuybackUnitLow(it) * (it.qty || 1), 0);
        if (!window.confirm(`Bán ${items.length} nhóm vật phẩm để nhận ${Inv.formatSpiritStoneCost(est)}?`)) return;
        const res = Shop.sellBagItems(items.map(it => it.uid));
        if (res.ok) {
          this.selectedSellUids.clear();
          if (window.TuTien.UI) {
            window.TuTien.UI.showToast(`⚖️ Đã bán ${res.count} vật phẩm, nhận +${Inv.formatSpiritStoneCost(res.totalEarned)}!`, 'success');
          }
          this.render();
        }
      });
    });

    container.querySelectorAll('.btn-fulfill-order').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const oId = btn.getAttribute('data-order');
        const res = Shop.fulfillOrder(oId);
        if (res.ok) {
          if (window.TuTien.UI) {
            window.TuTien.UI.showToast(`📜 Hoàn thành đơn hàng! Nhận +${Inv.formatSpiritStoneCost(res.rewardLow)} và +${res.affinityGain} Hảo Cảm!`, 'success');
          }
          this.render();
        }
      });
    });
  }
};
