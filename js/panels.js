/**
 * js/panels.js
 * Chuyên trách kết xuất nội dung bên trong các bảng trượt Ngọc Giản:
 * - Tóm tắt gọn toàn bộ mô tả trong Công Pháp, Lĩnh Vực, Túi Đồ, Luân Hồi để giao diện thoáng đẹp chuẩn Tu Tiên.
 * - Thêm mục "📜 Giải Thích Chi Tiết (Cẩm Nang Tu Tiên)" trong bảng Hệ Thống (Cài Đặt) để tra cứu đầy đủ mọi cơ chế.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Panels = {
  activeGuideTab: 'fields',
  activeUpgradeSubTab: 'cultivate',

  isDetailedMode() {
    const st = window.TuTien.State;
    return !!(st && st.data && st.data.settings && st.data.settings.showDetailedDesc);
  },

  onPanelOpened(panelId) {
    if (panelId === 'upgrades') this.renderUpgradesPanel();
    else if (panelId === 'fields') this.renderFieldsPanel();
    else if (panelId === 'inventory') this.renderInventoryPanel();
    else if (panelId === 'prestige') this.renderPrestigePanel();
    else if (panelId === 'roadmap') this.renderRoadmapPanel();
    else if (panelId === 'profile' && window.TuTien.Profile) window.TuTien.Profile.render();
    else if (panelId === 'system') this.renderSystemPanel();
  },

  refreshActivePanel() {
    const activeId = window.TuTien.Hotbar ? window.TuTien.Hotbar.activePanelId : null;
    if (activeId) {
      this.onPanelOpened(activeId);
    }
  },

  /**
   * 1. Bảng Công Pháp (Tóm tắt gọn gàng, đậm chất Ngọc Giản Tàng Kinh Các)
   */
  renderUpgradesPanel() {
    const listEl = document.getElementById('upgrades-list');
    if (!listEl) return;

    const subTabBar = `
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <button id="subtab-upg-cultivate" class="btn-ancient-sm ${this.activeUpgradeSubTab === 'cultivate' ? 'affordable' : ''}">📖 Công Pháp Tu Luyện</button>
        <button id="subtab-upg-combat" class="btn-ancient-sm ${this.activeUpgradeSubTab === 'combat' ? 'affordable' : ''}">⚔️ Chiến Kỹ & Công Pháp Chiến Đấu (4 Ô)</button>
      </div>
    `;

    if (this.activeUpgradeSubTab === 'combat') {
      listEl.innerHTML = subTabBar + '<div id="combat-tech-subcontainer"></div>';
      document.getElementById('subtab-upg-cultivate').addEventListener('pointerdown', e => { e.preventDefault(); this.activeUpgradeSubTab = 'cultivate'; this.renderUpgradesPanel(); });
      document.getElementById('subtab-upg-combat').addEventListener('pointerdown', e => { e.preventDefault(); this.activeUpgradeSubTab = 'combat'; this.renderUpgradesPanel(); });
      if (window.TuTien.LoadoutUI) window.TuTien.LoadoutUI.renderInto(document.getElementById('combat-tech-subcontainer'));
      return;
    }

    const Utils = window.TuTien.Utils;
    const State = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const Character = window.TuTien.Character;
    const factionCfg = Character.getFactionConfig();
    const realm = State.getCurrentRealm();
    const realmMaxCap = Upgrades.getMaxLevelForCurrentRealm(window.TuTien.UPGRADES[0]);
    const showDetail = this.isDetailedMode();

    listEl.innerHTML = subTabBar + `
      <div class="scroll-box compact-banner-row">
        <span style="color:${factionCfg.color};font-weight:700;">
          ${factionCfg.icon} ${factionCfg.name} (${factionCfg.title})
        </span>
        <span class="gold-highlight" style="font-size:0.8rem;">
          Trần 【${realm.fullName}】: <strong>Tầng ${realmMaxCap}</strong>
        </span>
      </div>
    `;

    const tbC = document.getElementById('subtab-upg-cultivate');
    const tbK = document.getElementById('subtab-upg-combat');
    if (tbC) tbC.addEventListener('pointerdown', e => { e.preventDefault(); this.activeUpgradeSubTab = 'cultivate'; this.renderUpgradesPanel(); });
    if (tbK) tbK.addEventListener('pointerdown', e => { e.preventDefault(); this.activeUpgradeSubTab = 'combat'; this.renderUpgradesPanel(); });
    window.TuTien.UPGRADES.forEach(u => {
      const unlocked = Upgrades.isUnlocked(u);
      const level = State.getUpgradeLevel(u.id);
      const maxForRealm = Upgrades.getMaxLevelForCurrentRealm(u);
      const isRealmCapped = Upgrades.isCappedByCurrentRealm(u);
      const isGlobalMax = u.maxLevel !== null && u.maxLevel !== undefined && level >= u.maxLevel;
      const cost = Upgrades.getUpgradeCost(u);
      const canBuy = Upgrades.canAfford(u);

      const qObj = Upgrades.getUpgradeQualityObj(u.id);
      const isMaxQuality = qObj.tier >= 5;
      const refineCost = Upgrades.getRefineQualityCost(u.id);
      const canRefine = Upgrades.canRefineQuality(u.id);
      const displayName = Upgrades.getDisplayName(u);

      const card = document.createElement('div');
      card.className = `jade-card ${!unlocked ? 'locked-card' : ''}`;
      card.style.borderLeft = `3px solid ${unlocked ? qObj.color : '#64748b'}`;

      card.innerHTML = `
        <div class="jade-card-icon">${unlocked ? u.icon : '🔒'}</div>
        <div class="jade-card-body" style="overflow:hidden;">
          <div class="item-top-meta-row">
            <span class="equip-quality-top-tag" style="color:${unlocked ? qObj.color : '#94a3b8'};border-color:${unlocked ? qObj.color : '#64748b'}">
              ${unlocked ? `✦ ${qObj.name} (x${qObj.mult})` : '🔒 ???'}
            </span>
            <span class="jade-badge">
              ${unlocked ? `Tầng ${level}/${maxForRealm}${isRealmCapped && !isGlobalMax ? ' • 🔒 Trần' : ''}` : 'Chưa Mở'}
            </span>
          </div>
          <div class="mc-marquee-viewport">
            <span class="mc-marquee-text" style="color:${unlocked ? qObj.color : '#cbd5e1'};font-weight:700;font-size:0.92rem;">
              ${unlocked ? displayName : '???'}
            </span>
          </div>
          ${showDetail && unlocked ? `<p class="jade-card-desc">${u.description}</p>` : ''}
          <div class="mc-marquee-viewport">
            <span class="mc-marquee-text" style="color:${unlocked ? 'var(--jade-bright)' : '#fda4af'};font-size:0.78rem;">
              ${unlocked ? u.formatEffect(level, qObj.mult) : '🔒 ??? — Khám phá Bí Cảnh hoặc hạ Boss Rồng để lĩnh ngộ'}
            </span>
          </div>
        </div>
        <div class="upgrade-actions-col">
          ${
            unlocked
              ? `
                <button id="btn-buy-${u.id}" class="btn-ancient ${canBuy ? 'affordable' : ''}" ${!canBuy ? 'disabled' : ''}>
                  <span class="btn-main-txt">${isGlobalMax ? 'VIÊN MÃN' : isRealmCapped ? 'ĐỘT PHÁ' : 'Lĩnh Ngộ'}</span>
                  <span class="btn-sub-txt">${isGlobalMax ? 'Tối Đa' : isRealmCapped ? 'Đạt trần' : Utils.formatNumber(cost) + ' LK'}</span>
                </button>
                <button id="btn-refine-${u.id}" class="btn-ancient-sm ${canRefine ? 'affordable' : ''}" ${!canRefine || isMaxQuality ? 'disabled' : ''}>
                  ${isMaxQuality ? '✨ Tiên Phẩm' : `✨ Thăng Phẩm (${Utils.formatNumber(refineCost)})`}
                </button>
              `
              : `
                <button class="btn-ancient-sm affordable btn-goto-expedition-from-upgrade">
                  🗡️ Xuất Quan
                </button>
              `
          }
        </div>
      `;

      const buyBtn = card.querySelector(`#btn-buy-${u.id}`);
      if (buyBtn) {
        let holdTimer = null;
        let holdSteps = 0;
        const stopHold = () => {
          if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
          }
          holdSteps = 0;
        };

        const runHoldUpgrade = () => {
          // Mua nhanh hơn khi giữ lâu (sau 12 nhịp mua nhiều tầng mỗi nhịp)
          const batch = holdSteps >= 18 ? 3 : holdSteps >= 10 ? 2 : 1;
          let boughtAny = false;
          for (let b = 0; b < batch; b++) {
            if (Upgrades.buyUpgradeSilent ? Upgrades.buyUpgradeSilent(u.id) : Upgrades.buyUpgrade(u.id)) {
              boughtAny = true;
            } else {
              break;
            }
          }
          if (!boughtAny) {
            stopHold();
            this.renderUpgradesPanel();
            return;
          }

          // Cập nhật nhanh giao diện thẻ đang giữ mà không phá hủy nút bấm
          const newLvl = State.getUpgradeLevel(u.id);
          const newMax = Upgrades.getMaxLevelForCurrentRealm(u);
          const newCost = Upgrades.getUpgradeCost(u);
          const newCanBuy = Upgrades.canAfford(u);
          const newCapped = Upgrades.isCappedByCurrentRealm(u);
          const newGlobalMax = u.maxLevel !== null && u.maxLevel !== undefined && newLvl >= u.maxLevel;

          const badgeEl = card.querySelector('.jade-badge');
          if (badgeEl) badgeEl.textContent = `Tầng ${newLvl}/${newMax}${newCapped && !newGlobalMax ? ' • 🔒 Trần' : ''}`;
          const effEl = card.querySelectorAll('.mc-marquee-text')[1];
          if (effEl) effEl.textContent = u.formatEffect(newLvl, qObj.mult);
          const mainTxt = buyBtn.querySelector('.btn-main-txt');
          const subTxt = buyBtn.querySelector('.btn-sub-txt');
          if (mainTxt) mainTxt.textContent = newGlobalMax ? 'VIÊN MÃN' : newCapped ? 'ĐỘT PHÁ' : 'Lĩnh Ngộ';
          if (subTxt) subTxt.textContent = newGlobalMax ? 'Tối Đa' : newCapped ? 'Đạt trần' : Utils.formatNumber(newCost) + ' LK';
          buyBtn.classList.toggle('affordable', newCanBuy);
          buyBtn.disabled = !newCanBuy;
          if (window.TuTien.UI) window.TuTien.UI.updateHeaderAndStats();

          holdSteps += 1;
          // Đè càng lâu tốc độ nâng càng nhanh: 240ms -> 150ms -> 90ms -> 50ms -> 28ms
          const nextDelay = Math.max(28, Math.round(240 * Math.pow(0.82, holdSteps)));
          holdTimer = setTimeout(runHoldUpgrade, nextDelay);
        };

        buyBtn.addEventListener('pointerdown', e => {
          e.preventDefault();
          stopHold();
          runHoldUpgrade();
        });
        buyBtn.addEventListener('pointerup', () => { stopHold(); this.renderUpgradesPanel(); });
        buyBtn.addEventListener('pointercancel', stopHold);
        buyBtn.addEventListener('pointerleave', stopHold);
      }

      const refBtn = card.querySelector(`#btn-refine-${u.id}`);
      if (refBtn) {
        refBtn.addEventListener('pointerdown', e => {
          e.preventDefault();
          Upgrades.refineUpgradeQuality(u.id);
        });
      }

      const gotoExpBtn = card.querySelector('.btn-goto-expedition-from-upgrade');
      if (gotoExpBtn) {
        gotoExpBtn.addEventListener('pointerdown', e => {
          e.preventDefault();
          if (window.TuTien.Hotbar) window.TuTien.Hotbar.closeAll();
          if (window.TuTien.Expedition) window.TuTien.Expedition.openModal();
        });
      }

      listEl.appendChild(card);
    });
  },

  /**
   * 2. Bảng Lĩnh Vực (Tóm tắt siêu gọn: Kho Dược Liệu, Đan Phòng, Phù Đường, 8 Lĩnh Vực)
   */
  renderFieldsPanel() {
    const container = document.getElementById("fields-panel-container");
    if (!container) return;

    const Utils = window.TuTien.Utils;
    const State = window.TuTien.State;
    const Fields = window.TuTien.Fields;
    const Inv = window.TuTien.Inventory;
    const Forge = window.TuTien.Forge;
    if (Forge) Forge.ensureForgeState();
    if (window.TuTien.Alchemy) window.TuTien.Alchemy.ensureAlchemyState();
    if (window.TuTien.Talisman) window.TuTien.Talisman.ensureTalismanState();

    const fieldsState = State.data.fields;
    const tendCost = Math.max(30, Math.round(window.TuTien.Cultivate.getBasePassiveRate() * 7));
    const showDetail = this.isDetailedMode();
    const miningState = (State.data && State.data.mining) || { enabled: true, totalMined: 0 };

    // 8 Lĩnh Vực hiển thị gọn gàng dạng lưới 2 cột hiện đại
    const fieldCardsHtml = window.TuTien.FIELDS.map(fDef => {
      const fState = Fields.getFieldState(fDef.id);
      const talentObj = Fields.getFieldTalentObj(fDef.id);
      const isActive = fieldsState.activeFieldId === fDef.id;
      const reqExp = Fields.getExpRequiredForNextRank(fState.rank);
      const expPct = fState.rank >= 9 ? 100 : Utils.clamp((fState.exp / reqExp) * 100, 0, 100);
      const expRate = Fields.getFieldExpRatePerSec(fDef.id);
      const rankTitle = Fields.getFieldRankTitle(fDef, fState.rank);

      return `
        <div class="jade-card compact-field-card ${isActive ? "jade-card-active" : ""}">
          <div class="jade-card-icon">${fDef.icon}</div>
          <div class="jade-card-body">
            <div class="jade-card-head">
              <span class="jade-card-title">${fDef.name} <small style="color:var(--bronze-light)">${rankTitle}</small></span>
              <span class="jade-badge" style="color:${talentObj.color}">${talentObj.name}</span>
            </div>
            ${showDetail ? `<p class="jade-card-desc">${fDef.description}</p>` : ""}
            <p class="jade-card-effect" style="font-size:0.75rem;">${fDef.effectSummary(fState.rank)}</p>
            <div class="ancient-exp-row">
              <div class="ancient-bar-track">
                <div id="field-exp-fill-${fDef.id}" class="ancient-bar-fill" style="width:${expPct.toFixed(1)}%"></div>
              </div>
              <span id="field-exp-text-${fDef.id}" class="ancient-exp-txt">
                ${fState.rank >= 9 ? "Viên Mãn" : `${Utils.formatNumber(fState.exp)}/${Utils.formatNumber(reqExp)}`}
              </span>
            </div>
          </div>
          <button class="btn-ancient btn-toggle-field ${isActive ? "affordable" : ""}" data-field="${fDef.id}" style="min-width:86px;padding:6px 8px;">
            <span class="btn-main-txt">${isActive ? "Đang Luyện" : "Luyện"}</span>
            <span class="btn-sub-txt">+${expRate.toFixed(1)}/s</span>
          </button>
        </div>
      `;
    }).join("");

    container.innerHTML = `
      <!-- 1. XƯỞNG BÁCH NGHỆ (3 CƠ CHẾ CHẾ TÁC XÁC ĐỊNH) -->
      <div class="craft-hub-grid">
        <button id="btn-open-new-forge" class="craft-hub-card forge-hub">
          <div class="chc-icon">🔥</div>
          <div class="chc-info">
            <strong>Lò Rèn Pháp Bảo</strong>
            <span>Khống Hỏa F/G/H • 16 Mẫu • Đồ Phổ</span>
          </div>
        </button>

        <button id="btn-open-new-alchemy" class="craft-hub-card alchemy-hub">
          <div class="chc-icon">⚗️</div>
          <div class="chc-info">
            <strong>Đan Lô Luyện Đan</strong>
            <span>Hòa Dược & Ngưng Đan • 0–3 Đan Vân</span>
          </div>
        </button>

        <button id="btn-open-new-talisman" class="craft-hub-card talisman-hub">
          <div class="chc-icon">📜</div>
          <div class="chc-info">
            <strong>Phù Án Luyện Phù</strong>
            <span>Họa Phù Canvas • Máu Yêu Thú</span>
          </div>
        </button>
      </div>

      <!-- 2. THANH THU THẬP NHANH GỌN -->
      <div class="fields-quick-strip">
        <button id="btn-toggle-afk-mining" class="btn-ancient-sm ${miningState.enabled ? "affordable" : ""}">
          ⛏️ Khai Khoáng AFK: ${miningState.enabled ? "Đang Chạy" : "Tắt"} (${miningState.totalMined || 0})
        </button>
        <button id="btn-tend-herb-garden" class="btn-ancient-sm ${State.data.qi >= tendCost ? "affordable" : ""}">
          🌿 Tưới Linh Tuyền (${Utils.formatNumber(tendCost)} LK)
        </button>
        <button id="btn-open-bag-from-fields" class="btn-ancient-sm affordable">
          🎒 Túi Trữ Vật (${Inv.getBagData().items.length})
        </button>
      </div>

      <!-- 3. 8 LĨNH VỰC BÁCH NGHỆ (LƯỚI 2 CỘT GỌN ĐẸP) -->
      <div class="fields-2col-grid">
        ${fieldCardsHtml}
      </div>
    `;

    document.getElementById("btn-open-new-forge").addEventListener("pointerdown", e => {
      e.preventDefault();
      if (window.TuTien.Hotbar) window.TuTien.Hotbar.closeAll();
      if (window.TuTien.CraftUI) window.TuTien.CraftUI.open();
    });
    document.getElementById("btn-open-new-alchemy").addEventListener("pointerdown", e => {
      e.preventDefault();
      if (window.TuTien.Hotbar) window.TuTien.Hotbar.closeAll();
      if (window.TuTien.AlchemyUI) window.TuTien.AlchemyUI.open();
    });
    document.getElementById("btn-open-new-talisman").addEventListener("pointerdown", e => {
      e.preventDefault();
      if (window.TuTien.Hotbar) window.TuTien.Hotbar.closeAll();
      if (window.TuTien.TalismanUI) window.TuTien.TalismanUI.open();
    });

    document.getElementById("btn-toggle-afk-mining").addEventListener("pointerdown", e => {
      e.preventDefault();
      if (State.data && State.data.mining) {
        State.data.mining.enabled = !State.data.mining.enabled;
        if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
        this.renderFieldsPanel();
      }
    });

    document.getElementById("btn-open-bag-from-fields").addEventListener("pointerdown", e => {
      e.preventDefault();
      if (window.TuTien.Hotbar) window.TuTien.Hotbar.openPanel("inventory");
    });

    document.getElementById("btn-tend-herb-garden").addEventListener("pointerdown", e => {
      e.preventDefault();
      Fields.tendHerbGarden();
    });

    container.querySelectorAll(".btn-toggle-field").forEach(btn => {
      btn.addEventListener("pointerdown", e => {
        e.preventDefault();
        Fields.toggleActiveField(btn.getAttribute("data-field"));
      });
    });
  },

  /**
   * 3. Bảng Túi Trữ Vật (Tóm tắt gọn gàng, đậm chất Ngọc Giản Càn Khôn Đại)
   */
  renderInventoryPanel() {
    const container = document.getElementById('inventory-panel-container');
    if (!container) return;

    const Inv = window.TuTien.Inventory;
    const bag = Inv.getBagData();
    const st = Inv.getSpiritStones();
    const filter = Inv.activeFilter || 'all';
    const maxEquip = window.TuTien.CONFIG.crafting.maxEquippedArtifacts || 3;

    const equippedArtifacts = bag.items.filter(it => it.category === 'artifact' && it.equipped);
    const equipBonuses = Inv.getEquippedArtifactBonuses();

    const equippedSlotsHtml = [0, 1, 2]
      .map(slotIdx => {
        const eq = equippedArtifacts[slotIdx];
        if (!eq) {
          return `
            <div class="equip-slot empty-slot">
              <div class="equip-quality-top-tag" style="color:var(--ivory-muted);border-color:rgba(212,175,55,0.2);">Ô Pháp Bảo #${slotIdx + 1}</div>
              <div class="mc-marquee-viewport">
                <span class="mc-marquee-text">Trống</span>
              </div>
            </div>
          `;
        }
        return `
          <div class="equip-slot filled-slot" style="border-color:${eq.qualityColor}">
            <div class="equip-quality-top-tag" style="color:${eq.qualityColor};border-color:${eq.qualityColor}">
              ✦ ${eq.qualityName} ✦
            </div>
            <div class="mc-marquee-viewport title-marquee">
              <span class="mc-marquee-text" style="color:${eq.qualityColor};font-weight:700;">
                ${eq.icon} ${eq.name}
              </span>
            </div>
            <div class="mc-marquee-viewport stat-marquee">
              <span class="mc-marquee-text should-scroll" style="color:var(--jade-bright);">
                ${eq.effectDesc}
              </span>
            </div>
            <button class="btn-ancient-sm btn-unequip-art" data-uid="${eq.uid}" style="margin-top:4px;width:100%;">Tháo</button>
          </div>
        `;
      })
      .join('');

    const filteredItems = bag.items.filter(it => filter === 'all' || it.category === filter);

    const itemsHtml =
      filteredItems.length === 0
        ? `<div class="scroll-box" style="text-align:center;color:var(--ivory-muted);">
            Túi Trữ Vật trống. Hãy mở <strong>Lĩnh Vực (phím 2)</strong> hoặc <strong>🗡️ Xuất Quan</strong> để thu thập bảo vật!
          </div>`
        : filteredItems
            .map(it => {
              const isArt = it.category === 'artifact';
              const isHerb = it.category === 'herb' || it.category === 'material';
              const catLabel =
                it.category === 'artifact'
                  ? 'Pháp Bảo'
                  : it.category === 'pill'
                  ? 'Linh Đan'
                  : it.category === 'talisman'
                  ? 'Phù Văn'
                  : 'Linh Thảo';

              return `
                <div class="jade-card" style="border-left:3px solid ${it.qualityColor}">
                  <div class="jade-card-icon">${it.icon}</div>
                  <div class="jade-card-body" style="overflow:hidden;">
                    <div class="item-top-meta-row">
                      <span class="equip-quality-top-tag" style="color:${it.qualityColor};border-color:${it.qualityColor}">
                        ${it.qualityName}
                      </span>
                      <span class="jade-badge">
                        ${isArt ? (it.equipped ? '⚡ Đang Đeo' : catLabel) : `${catLabel} ×${it.count || 1}`}
                      </span>
                    </div>
                    <div class="mc-marquee-viewport">
                      <span class="mc-marquee-text" style="color:${it.qualityColor};font-weight:700;font-size:0.9rem;">
                        ${it.name}
                      </span>
                    </div>
                    <div class="mc-marquee-viewport">
                      <span class="mc-marquee-text" style="color:var(--jade-bright);font-size:0.76rem;">
                        ${it.effectDesc}
                      </span>
                    </div>
                  </div>
                  <div class="subrow-actions">
                    ${
                      isArt
                        ? `
                          <button class="btn-ancient-sm affordable btn-equip-item" data-uid="${it.uid}">
                            ${it.equipped ? 'Tháo' : 'Trang Bị'}
                          </button>
                          <button class="btn-ancient-sm btn-salvage-item" data-uid="${it.uid}" style="border-color:#e11d48;color:#fda4af;">
                            Hủy
                          </button>
                        `
                        : isHerb
                        ? `<span class="muted-label">Dược liệu</span>`
                        : `
                          <button class="btn-ancient-sm affordable btn-use-consumable" data-uid="${it.uid}">
                            ${it.category === 'pill' ? 'Dùng' : 'Kích Hoạt'}
                          </button>
                        `
                    }
                  </div>
                </div>
              `;
            })
            .join('');

    container.innerHTML = `
      <div class="scroll-box">
        <div class="workshop-header-row" style="margin-bottom:6px;">
          <div class="exp-stones-bar" title="100 Hạ = 1 Trung • 100 Trung = 1 Thượng">
            <span class="stone-chip low-stone">💎 Hạ: <strong>${st.low || 0}</strong></span>
            <span class="stone-chip mid-stone">💠 Trung: <strong>${st.mid || 0}</strong></span>
            <span class="stone-chip high-stone">🌟 Thượng: <strong>${st.high || 0}</strong></span>
          </div>
          <div class="jade-highlight" style="font-size:0.8rem;">
            🗡️ Pháp Bảo (${equippedArtifacts.length}/${maxEquip}): <strong>x${equipBonuses.passiveMult.toFixed(2)} Nền • x${equipBonuses.clickMult.toFixed(2)} Chạm</strong>
          </div>
        </div>
        <div class="equip-slots-grid">
          ${equippedSlotsHtml}
        </div>
      </div>

      <div class="bag-filter-bar">
        <button class="btn-ancient-sm bag-filter-btn ${filter === 'all' ? 'affordable' : ''}" data-filter="all">Tất Cả (${bag.items.length})</button>
        <button class="btn-ancient-sm bag-filter-btn ${filter === 'artifact' ? 'affordable' : ''}" data-filter="artifact">🗡️ Pháp Bảo</button>
        <button class="btn-ancient-sm bag-filter-btn ${filter === 'pill' ? 'affordable' : ''}" data-filter="pill">⚗️ Đan Dược</button>
        <button class="btn-ancient-sm bag-filter-btn ${filter === 'talisman' ? 'affordable' : ''}" data-filter="talisman">📜 Phù Văn</button>
        <button class="btn-ancient-sm bag-filter-btn ${filter === 'herb' ? 'affordable' : ''}" data-filter="herb">🌿 Linh Thảo</button>
        <button class="btn-ancient-sm bag-filter-btn ${filter === 'material' ? 'affordable' : ''}" data-filter="material">⛏️ Sắt/Đá/Gỗ/Vàng</button>
      </div>

      <div class="jade-cards-stack">
        ${itemsHtml}
      </div>
    `;

    container.querySelectorAll('.bag-filter-btn').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        Inv.activeFilter = btn.getAttribute('data-filter');
        this.renderInventoryPanel();
      });
    });

    container.querySelectorAll('.btn-equip-item, .btn-unequip-art').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        Inv.toggleEquipArtifact(Number(btn.getAttribute('data-uid')));
        this.renderInventoryPanel();
      });
    });

    container.querySelectorAll('.btn-salvage-item').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        Inv.salvageArtifact(Number(btn.getAttribute('data-uid')));
        this.renderInventoryPanel();
      });
    });

    container.querySelectorAll('.btn-use-consumable').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        Inv.useConsumableItem(Number(btn.getAttribute('data-uid')));
        this.renderInventoryPanel();
      });
    });
  },

  /**
   * 4. Bảng Luân Hồi Chuyển Sinh (Tóm tắt gọn)
   */
  renderPrestigePanel() {
    const summaryEl = document.getElementById('prestige-summary');
    const listEl = document.getElementById('prestige-upgrades-list');
    if (!summaryEl || !listEl) return;

    const Utils = window.TuTien.Utils;
    const State = window.TuTien.State;
    const Prestige = window.TuTien.Prestige;
    const Upgrades = window.TuTien.Upgrades;
    const Character = window.TuTien.Character;
    const showDetail = this.isDetailedMode();

    const root = State.getCurrentRoot();
    const apt = Character.getCurrentAptitude();
    const factionCfg = Character.getFactionConfig();
    const rerollCost = Character.getRerollAptitudeCost();
    const canReroll = State.data.prestige.daoVan >= rerollCost;
    const currentGender = Character.getGender();
    const nextGenderPref = State.data.character.nextPrestigeGender || 'toggle';

    const canPrestige = Prestige.canPrestige();
    const pendingDaoVan = Prestige.calculatePendingDaoVan();
    const minRealm = window.TuTien.REALMS[window.TuTien.CONFIG.minRealmIndexForPrestige];
    const retainPct = Math.round((window.TuTien.CONFIG.fieldPrestigeRetainRatio || 0.2) * 100);

    summaryEl.innerHTML = `
      <div class="scroll-box">
        <div class="workshop-header-row">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="assets/stickers/11_doi_tua_nhau.png" alt="Đạo lữ" style="width:52px;height:52px;object-fit:contain;" />
            <div>
              <div class="muted-label">${currentGender === 'female' ? 'Nữ Tiên Tử' : 'Nam Đạo Sĩ'} • <span style="color:${factionCfg.color}">${factionCfg.icon} ${factionCfg.name}</span></div>
              <div class="jade-card-title ${apt.cssClass}" style="color:${apt.color}">
                ✦ Tư chất: ${apt.name} (x${apt.multiplier})
              </div>
              <div class="jade-card-title" style="color:${root.color};font-size:0.86rem;">
                ${root.icon} ${root.name} • <span style="color:var(--jade-bright)">${root.bonusText}</span>
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="gold-highlight" style="font-size:1.2rem;">☯️ ${Utils.formatNumber(State.data.prestige.daoVan)} Đạo Vận</div>
            <div class="muted-label">Đã chuyển sinh: ${State.data.prestige.count} kiếp</div>
            <button id="btn-prestige-reroll-apt" class="btn-ancient-sm ${canReroll ? 'affordable' : ''}" style="margin-top:4px;" ${!canReroll ? 'disabled' : ''}>
              🔮 Đổi Mệnh (${rerollCost} Đạo Vận)
            </button>
          </div>
        </div>

        <div class="gender-reincarnation-bar">
          <span class="muted-label">Kiếp tới:</span>
          <div class="gender-options-group">
            <button class="btn-ancient-sm gender-pref-btn ${nextGenderPref === 'toggle' ? 'affordable' : ''}" data-pref="toggle">
              🔄 Đổi Giới Tính
            </button>
            <button class="btn-ancient-sm gender-pref-btn ${nextGenderPref === 'male' ? 'affordable' : ''}" data-pref="male">
              ♂ Nam
            </button>
            <button class="btn-ancient-sm gender-pref-btn ${nextGenderPref === 'female' ? 'affordable' : ''}" data-pref="female">
              ♀ Nữ
            </button>
            <button class="btn-ancient-sm gender-pref-btn ${nextGenderPref === 'random' ? 'affordable' : ''}" data-pref="random">
              🎲 Ngẫu Nhiên
            </button>
          </div>
        </div>

        <p class="jade-card-desc" style="margin:6px 0;">
          ${canPrestige
            ? `Nhận <strong>+${Utils.formatNumber(pendingDaoVan)} Đạo Vận</strong> • Chọn lại Chính/Ma Đạo • Giữ ${retainPct}% EXP Bách Nghệ, chỉ số Đan vĩnh viễn & Bí Tịch.`
            : `Đạt <strong>${minRealm.fullName}</strong> (Tầng ${minRealm.orderNumber}/${window.TuTien.REALMS.length}) để mở Luân Hồi.`}
        </p>

        <button id="btn-do-prestige" class="btn-ancient-wide ${canPrestige ? 'ready' : ''}" ${!canPrestige ? 'disabled' : ''}>
          ☯️ Bước Vào Luân Hồi (+${Utils.formatNumber(pendingDaoVan)} Đạo Vận)
        </button>
      </div>
    `;

    summaryEl.querySelectorAll('.gender-pref-btn').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        State.data.character.nextPrestigeGender = btn.getAttribute('data-pref');
        this.renderPrestigePanel();
      });
    });

    const btnReroll = document.getElementById('btn-prestige-reroll-apt');
    if (btnReroll) {
      btnReroll.addEventListener('pointerdown', e => {
        e.preventDefault();
        Character.rerollAptitude();
      });
    }

    const btnPrestige = document.getElementById('btn-do-prestige');
    if (btnPrestige) {
      btnPrestige.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (!Prestige.canPrestige()) return;
        window.TuTien.UI.showConfirmPrestigeModal(pendingDaoVan);
      });
    }

    listEl.innerHTML = '';
    window.TuTien.PRESTIGE_UPGRADES.forEach(pu => {
      const level = State.getPrestigeUpgradeLevel(pu.id);
      const isMax = Upgrades.isPrestigeMaxed(pu);
      const cost = Upgrades.getPrestigeUpgradeCost(pu);
      const canBuy = Upgrades.canAffordPrestige(pu);

      const card = document.createElement('div');
      card.className = 'jade-card';
      card.innerHTML = `
        <div class="jade-card-icon">${pu.icon}</div>
        <div class="jade-card-body">
          <div class="jade-card-head">
            <span class="jade-card-title">${pu.name}</span>
            <span class="jade-badge">Tầng ${level}${pu.maxLevel ? '/' + pu.maxLevel : ''}</span>
          </div>
          ${showDetail ? `<p class="jade-card-desc">${pu.description}</p>` : ''}
          <p class="jade-card-effect">${pu.formatEffect(level)}</p>
        </div>
        <button class="btn-ancient ${canBuy && !isMax ? 'affordable' : ''}" ${!canBuy || isMax ? 'disabled' : ''}>
          <span class="btn-main-txt">${isMax ? 'VIÊN MÃN' : 'Khắc Ấn'}</span>
          <span class="btn-sub-txt">${isMax ? 'Tối Đa' : cost + ' Đạo Vận'}</span>
        </button>
      `;

      card.querySelector('button').addEventListener('pointerdown', e => {
        e.preventDefault();
        Upgrades.buyPrestigeUpgrade(pu.id);
      });

      listEl.appendChild(card);
    });
  },

  /**
   * 5. Bảng Đạo Lộ 100 Cảnh Giới
   */
  renderRoadmapPanel() {
    const listEl = document.getElementById('realms-roadmap-list');
    if (!listEl) return;

    const currentIdx = window.TuTien.State.data.realmIndex;
    const currentMajorIdx = Math.floor(currentIdx / 5);
    listEl.innerHTML = '';

    window.TuTien.MAJOR_REALMS.forEach((major, mIdx) => {
      const startOrder = mIdx * 5 + 1;
      const endOrder = startOrder + 4;
      const statusClass =
        mIdx < currentMajorIdx ? 'completed' : mIdx === currentMajorIdx ? 'current' : 'locked';

      const card = document.createElement('div');
      card.className = `scroll-box roadmap-item ${statusClass}`;
      card.style.borderLeft = `3px solid ${major.auraColor}`;

      const stagesHtml = major.stages
        .map((st, sIdx) => {
          const globalIdx = mIdx * 5 + sIdx;
          const isReached = globalIdx <= currentIdx;
          const isCurrent = globalIdx === currentIdx;
          return `<span class="ancient-stage-tag ${isCurrent ? 'active' : isReached ? 'done' : ''}">${globalIdx + 1}. ${st.name}</span>`;
        })
        .join('');

      card.innerHTML = `
        <div class="workshop-header-row" style="margin-bottom:5px;">
          <div>
            <div class="muted-label">${major.macroRealm}</div>
            <div class="jade-card-title" style="color:${major.auraColor}">${major.name} — ${major.subtitle}</div>
          </div>
          <span class="jade-badge">Tầng ${startOrder}-${endOrder}${mIdx >= 1 ? ' • ⚡ Lôi Kiếp tầng cuối' : ''}</span>
        </div>
        <div class="stages-tag-wrap">${stagesHtml}</div>
      `;

      listEl.appendChild(card);
    });
  },

  /**
   * 6. Bảng Hệ Thống + Mục "📜 Giải Thích Chi Tiết (Cẩm Nang Tu Tiên)"
   */
  renderSystemPanel() {
    const State = window.TuTien.State;
    const settings = State.data.settings;
    const Audio = window.TuTien.Audio;

    const btnMusic = document.getElementById('btn-setting-music');
    if (btnMusic && Audio) {
      btnMusic.textContent = Audio.musicEnabled ? '🎵 Nhạc Nền (BGM): Bật' : '🔇 Nhạc Nền (BGM): Tắt';
      btnMusic.classList.toggle('affordable', Audio.musicEnabled);
    }

    const btnSfx = document.getElementById('btn-setting-sfx');
    if (btnSfx && Audio) {
      btnSfx.textContent = Audio.sfxEnabled ? '🔊 Âm Thanh Hiệu Ứng: Bật' : '🔈 Âm Thanh Hiệu Ứng: Tắt';
      btnSfx.classList.toggle('affordable', Audio.sfxEnabled);
    }

    const btnNotif = document.getElementById('btn-setting-notif');
    if (btnNotif) {
      const notifOn = settings.notificationsEnabled !== false;
      btnNotif.textContent = notifOn ? '🔔 Thông Báo Nổi: Bật' : '🔕 Thông Báo Nổi: Tắt';
      btnNotif.classList.toggle('affordable', notifOn);
    }

    const btnDetailDesc = document.getElementById('btn-toggle-detail-desc');
    if (btnDetailDesc) {
      const isDetail = !!settings.showDetailedDesc;
      btnDetailDesc.textContent = isDetail
        ? '📖 Mô Tả Trong Bảng: Chi Tiết'
        : '📖 Mô Tả Trong Bảng: Tóm Tắt';
      btnDetailDesc.classList.toggle('affordable', isDetail);
    }

    const btnFormat = document.getElementById('btn-toggle-format');
    if (btnFormat) {
      btnFormat.textContent =
        settings.numberFormat === 'hanviet'
          ? '🔢 Đơn Vị Số: Tiếng Việt (Vạn, Ức)'
          : '🔢 Đơn Vị Số: Quốc Tế (K, M, B)';
    }

    const fxLabels = {
      high: '✨ Hiệu Ứng Hạt: Cao',
      medium: '✨ Hiệu Ứng Hạt: Vừa',
      low: '✨ Hiệu Ứng Hạt: Thấp',
      off: '✨ Hiệu Ứng Hạt: Tắt'
    };
    const btnFx = document.getElementById('btn-toggle-fx');
    if (btnFx) {
      const q = settings.fxQuality || 'high';
      btnFx.textContent = fxLabels[q] || fxLabels.high;
    }

    // Kết xuất mục "📜 Giải Thích Chi Tiết (Cẩm Nang Tu Tiên)"
    this.renderDetailedGuideSection();

    const achListEl = document.getElementById('achievements-list');
    if (achListEl) {
      const unlocked = State.data.achievements || {};
      const totalMultPct = Math.round((window.TuTien.Events.getAchievementMultiplier() - 1) * 100);
      achListEl.innerHTML = `
        <div class="scroll-box compact-banner-row" style="margin-bottom:6px;">
          <span>Tổng phúc duyên Thành Tựu:</span>
          <strong class="jade-highlight">+${totalMultPct}% Tốc độ tu luyện</strong>
        </div>
      `;

      window.TuTien.ACHIEVEMENTS.forEach(ach => {
        const isDone = !!unlocked[ach.id];
        const row = document.createElement('div');
        row.className = `jade-card ${isDone ? 'jade-card-active' : 'locked-card'}`;
        row.innerHTML = `
          <div class="jade-card-icon">${isDone ? '🏆' : '🔒'}</div>
          <div class="jade-card-body">
            <div class="jade-card-title">${ach.name}</div>
            <div class="jade-card-desc">${ach.desc}</div>
          </div>
          <div class="jade-badge" style="color:#34d399;">${ach.rewardText}</div>
        `;
        achListEl.appendChild(row);
      });
    }

    if (window.TuTien.UI) {
      window.TuTien.UI.renderLogs();
    }
  },

  /**
   * Mục "📜 Giải Thích Chi Tiết (Cẩm Nang Tu Tiên)" trong Cài Đặt
   */
  renderDetailedGuideSection() {
    const guideEl = document.getElementById('detailed-guide-container');
    if (!guideEl) return;

    const tab = this.activeGuideTab || 'fields';

    let contentHtml = '';
    if (tab === 'fields') {
      const fieldsRows = window.TuTien.FIELDS.map(
        f => `<li><strong>${f.icon} ${f.name} (${f.titleSuffix}):</strong> ${f.description} <em>(${f.effectSummary(1)})</em></li>`
      ).join('');
      const pillsRows = window.TuTien.PILL_RECIPES.map(
        p => `<li><strong>${p.icon} ${p.name}</strong> (Cần ${p.herbCost} ${p.requiredHerbName}, Đan Sư Phẩm ${p.minRank}): ${p.description}</li>`
      ).join('');
      const talsRows = window.TuTien.TALISMAN_RECIPES.map(
        t => `<li><strong>${t.icon} ${t.name}</strong> (Cần ${t.herbCost} ${t.requiredHerbName}, Phù Sư Phẩm ${t.minRank}): ${t.description}</li>`
      ).join('');

      contentHtml = `
        <div class="guide-detail-block">
          <div class="guide-sub-heading">🛠️ 8 Lĩnh Vực Bách Nghệ (Chọn 1 lĩnh vực để tự động lên EXP mỗi giây & giảm Cooldown chế tác)</div>
          <ul class="guide-detail-list">${fieldsRows}</ul>
          <div class="guide-sub-heading">⚗️ Chi Tiết 9 Đơn Thuốc Luyện Đan (5 Đan Phương Bí Truyền tìm tại Bí Cảnh Hồng Hoang)</div>
          <ul class="guide-detail-list">${pillsRows}</ul>
          <div class="guide-sub-heading">📜 Chi Tiết 6 Loại Linh Phù (4 Phù Phương Bí Truyền tìm tại Bí Cảnh Hồng Hoang)</div>
          <ul class="guide-detail-list">${talsRows}</ul>
        </div>
      `;
    } else if (tab === 'inventory') {
      const herbsRows = window.TuTien.HERB_TYPES.map(
        h => `<li><strong>${h.icon} ${h.name}:</strong> ${h.desc}</li>`
      ).join('');
      contentHtml = `
        <div class="guide-detail-block">
          <div class="guide-sub-heading">🎒 Túi Trữ Vật & 5 Bậc Phẩm Chất Vật Phẩm / Công Pháp</div>
          <ul class="guide-detail-list">
            <li><strong>5 Bậc Phẩm Chất:</strong> Hạ Phẩm (x1.0) → Trung Phẩm (x1.4) → Thượng Phẩm (x2.0) → Cực Phẩm (x3.0) → Tiên Phẩm (x4.5). Điểm minigame chế tác càng cao và cấp thông thạo Lĩnh Vực càng lớn thì tỉ lệ ra Cực Phẩm / Tiên Phẩm càng cao.</li>
            <li><strong>🗡️ Pháp Bảo Bản Mệnh:</strong> Trang bị tối đa <strong>3 Pháp Bảo</strong> cùng lúc trong Túi Đồ để cộng dồn tốc độ hấp thụ nền, sức mạnh Click và 4 chỉ số chiến đấu (Máu, Linh Lực, Tốc Độ, Sức Mạnh). Pháp Bảo dư có thể Phân Giải lấy Linh Khí.</li>
            <li><strong>💎 Quy Đổi Linh Thạch 3 Bậc:</strong> Tự động gộp <strong>100 Hạ Phẩm = 1 Trung Phẩm</strong>, <strong>100 Trung Phẩm = 1 Thượng Phẩm</strong>. Dùng để giao dịch với Vân Du Tiên Thương trong Bí Cảnh Hồng Hoang.</li>
          </ul>
          <div class="guide-sub-heading">🌿 Chi Tiết 10 Loại Linh Thảo (4 loại trồng ở Linh Điền + 6 loại hiếm trên Bản Đồ Bí Cảnh)</div>
          <ul class="guide-detail-list">${herbsRows}</ul>
        </div>
      `;
    } else if (tab === 'expedition') {
      contentHtml = `
        <div class="guide-detail-block">
          <div class="guide-sub-heading">🗡️ Bản Đồ Bí Cảnh Hồng Hoang (2000×2000) & Giao Chiến</div>
          <ul class="guide-detail-list">
            <li><strong>Sương Mù & 5 Quần Xã Địa Hình:</strong> Bản đồ rộng 2000×2000 gồm Thái Thanh Linh Cốc (Trung tâm), U Minh Ma Vực (Tây Bắc), Hàn Băng Tuyết Đỉnh (Đông Bắc), Xích Viêm Hỏa Sơn (Tây Nam) và Bích Hải Linh Đảo (Đông Nam). Nhân vật đi tới đâu mở Sương Mù tới đó; bản đồ tự làm mới mỗi <strong>5 phút</strong>.</li>
            <li><strong>Khai Thác & Kỳ Trân Các:</strong> Chạm vào thảo dược hoặc mỏ quặng trên bản đồ để nhân vật đi tới thu hoạch. Gặp <strong>🏮 Vân Du Tiên Thương</strong> để mua Bí Tịch Công Pháp, Đan Phương, Phù Phương và Linh Thảo hiếm.</li>
            <li><strong>Cơ Chế Chiến Đấu 1v1:</strong> Ai có <strong>💨 Tốc Độ</strong> cao hơn sẽ được ra đòn trước. Trong trận đấu: <strong>Thanh Máu & Linh Lực của bạn nằm ngay trên đầu nhân vật bên trái</strong>, còn <strong>Thanh Máu của địch nằm ngay dưới chân địch bên phải</strong>. Kết thúc trận (thắng hoặc thua) tự động trở về bản đồ Bí Cảnh và thông báo chiến lợi phẩm.</li>
          </ul>
        </div>
      `;
    } else {
      const techRows = window.TuTien.UPGRADES.map(
        u => `<li><strong>${u.icon} ${u.chinhName} / ${u.maName}:</strong> ${u.description}</li>`
      ).join('');
      contentHtml = `
        <div class="guide-detail-block">
          <div class="guide-sub-heading">☯️ Chính Đạo vs 🩸 Ma Đạo & Cửu Thiên Lôi Kiếp</div>
          <ul class="guide-detail-list">
            <li><strong>☯️ Chính Đạo:</strong> Tốc độ tu luyện chuẩn (x1.00), tỉ lệ đột phá chuẩn (+0%), chịu được <strong>3 luồng Thiên Lôi (🛡️🛡️🛡️)</strong>, bản mệnh <strong>+20% Máu tối đa</strong>.</li>
            <li><strong>🩸 Ma Đạo:</strong> Tốc độ tu luyện cực nhanh (x1.65), tỉ lệ đột phá <strong>-15%</strong>, chỉ đỡ được <strong>2 lần Thiên Kiếp (🛡️🛡️)</strong> với sấm sét nhanh hơn 30%, bản mệnh <strong>+35% Sức Mạnh</strong>. Chỉ khi Luân Hồi Chuyển Sinh mới được chọn lại Đạo Lộ.</li>
            <li><strong>⚡ Cửu Thiên Lôi Kiếp:</strong> Từ Luyện Khí trở lên, mỗi khi đột phá lên <strong>Đại Cảnh Giới mới</strong> (từ tầng 5 cảnh giới cũ lên tầng 1 cảnh giới mới), bạn phải vượt qua minigame né Thiên Lôi (hoặc tế luyện <em>Tị Lôi Thiên Phù / Cửu Thiên Khiên Phù</em> trong Túi Đồ để bỏ qua Lôi Kiếp theo tỉ lệ phẩm chất).</li>
          </ul>
          <div class="guide-sub-heading">📘 Chi Tiết 13 Bộ Công Pháp (Giới hạn cấp tăng dần theo Cảnh Giới)</div>
          <ul class="guide-detail-list">${techRows}</ul>
        </div>
      `;
    }

    guideEl.innerHTML = `
      <div class="scroll-box">
        <div class="guide-tabs-bar">
          <button class="btn-ancient-sm guide-tab-btn ${tab === 'fields' ? 'affordable' : ''}" data-gtab="fields">⚗️ Lĩnh Vực & Đan/Phù</button>
          <button class="btn-ancient-sm guide-tab-btn ${tab === 'inventory' ? 'affordable' : ''}" data-gtab="inventory">🎒 Túi Đồ & Linh Thảo</button>
          <button class="btn-ancient-sm guide-tab-btn ${tab === 'expedition' ? 'affordable' : ''}" data-gtab="expedition">🗡️ Bí Cảnh & Chiến Đấu</button>
          <button class="btn-ancient-sm guide-tab-btn ${tab === 'dao' ? 'affordable' : ''}" data-gtab="dao">☯️ Đạo Lộ & Công Pháp</button>
        </div>
        ${contentHtml}
      </div>
    `;

    guideEl.querySelectorAll('.guide-tab-btn').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.activeGuideTab = btn.getAttribute('data-gtab');
        this.renderDetailedGuideSection();
      });
    });
  }
};
