/**
 * js/craftUI.js
 * Giao diện Lò Rèn Pháp Bảo toàn màn hình (3 cột: 4 Ô Linh Tài | Lò Đá + Khống Hỏa | Bảng Xem Trước Tức Thì):
 * - Chọn nguyên liệu, tăng/giảm (+/-), nhập số, nút Tối đa.
 * - Đồ Phổ sưu tập 16 mẫu Pháp Bảo (mẫu chưa rèn hiện "???").
 * - Màn Khống Hỏa điều khiển bằng phím F/G/H (có thể đổi trong Hệ Thống) hoặc 3 nút cảm ứng đa chạm (multi-touch).
 * - Hộp thoại xác nhận rời lò khi đang rèn dở (phạt 50% nguyên liệu).
 */
window.TuTien = window.TuTien || {};

window.TuTien.CraftUI = {
  isOpen: false,
  slots: [null, null, null, null], // Mỗi phần tử: { matId, qty } hoặc null
  selectedBlueprintId: null,
  activeSlotPickerIdx: null,
  showCodex: false,
  pendingLeaveCallback: null,

  overlayEl: null,
  bodyEl: null,
  confirmEl: null,

  init() {
    this.overlayEl = document.getElementById('forge-modal-overlay');
    this.bodyEl = document.getElementById('forge-ui-body');
    this.confirmEl = document.getElementById('forge-abandon-confirm');

    const closeBtn = document.getElementById('forge-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.requestClose(() => this.forceClose());
      });
    }
  },

  open() {
    if (window.TuTien.Forge) window.TuTien.Forge.ensureForgeState();
    this.isOpen = true;
    this.showCodex = false;
    this.activeSlotPickerIdx = null;
    if (!this.overlayEl) this.init();
    if (this.overlayEl) this.overlayEl.classList.remove('hidden');
    this.renderAll();
  },

  forceClose() {
    this.isOpen = false;
    this.activeSlotPickerIdx = null;
    if (window.TuTien.InputGuard) window.TuTien.InputGuard.releaseAllInputs();
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    if (this.confirmEl) this.confirmEl.classList.add('hidden');
  },

  /**
   * Kiểm tra rời lò khi đang rèn dở — dùng chung cho cả nút đóng Lò Rèn lẫn chuyển panel trên Hotbar
   */
  requestClose(onApprovedLeave) {
    const Forge = window.TuTien.Forge;
    if (Forge && Forge.isForging()) {
      this.pendingLeaveCallback = onApprovedLeave;
      this.showAbandonConfirmModal();
      return false;
    }
    if (typeof onApprovedLeave === 'function') onApprovedLeave();
    return true;
  },

  showAbandonConfirmModal() {
    if (!this.confirmEl) return;
    this.confirmEl.innerHTML = `
      <div class="newbie-modal-box" style="max-width:460px;border-color:#f43f5e;">
        <div class="newbie-modal-header">
          <h3 style="color:#fda4af;">🔥 Cảnh Báo Rời Lò Rèn</h3>
        </div>
        <p style="font-size:0.88rem;line-height:1.5;color:#f7f1e3;margin-bottom:16px;">
          Lửa lò đang cháy, rời đi lúc này sẽ làm hỏng một nửa linh tài đã bỏ vào. Bạn có chắc muốn bỏ dở?
        </p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="btn-forge-keep-going" class="btn-ancient-sm affordable">🔥 Tiếp tục rèn</button>
          <button id="btn-forge-confirm-abandon" class="btn-ancient-sm" style="border-color:#f43f5e;color:#fda4af;">💨 Bỏ dở (Mất 50%)</button>
        </div>
      </div>
    `;
    this.confirmEl.classList.remove('hidden');

    document.getElementById('btn-forge-keep-going').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.confirmEl.classList.add('hidden');
      this.pendingLeaveCallback = null;
    });

    document.getElementById('btn-forge-confirm-abandon').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.confirmEl.classList.add('hidden');
      if (window.TuTien.Forge) window.TuTien.Forge.abandonForging();
      const cb = this.pendingLeaveCallback;
      this.pendingLeaveCallback = null;
      if (typeof cb === 'function') cb();
      else this.renderAll();
    });
  },

  setSlotMaterial(slotIdx, matId, qty = 3) {
    const Forge = window.TuTien.Forge;
    const have = Forge.getMaterialQty(matId);
    if (have <= 0) return;

    // Nếu nguyên liệu đã nằm ở ô khác thì gộp vào ô đó
    const existingIdx = this.slots.findIndex((s, i) => i !== slotIdx && s && s.matId === matId);
    if (existingIdx !== -1) {
      this.slots[existingIdx].qty = Math.min(have, this.slots[existingIdx].qty + Math.max(1, qty));
      this.slots[slotIdx] = null;
    } else {
      this.slots[slotIdx] = { matId, qty: Math.min(have, Math.max(1, qty)) };
    }
    this.activeSlotPickerIdx = null;
    this.renderAll();
  },

  adjustSlotQty(slotIdx, newQty) {
    const s = this.slots[slotIdx];
    if (!s) return;
    const have = window.TuTien.Forge.getMaterialQty(s.matId);
    const val = Math.floor(Number(newQty) || 0);
    if (val <= 0) {
      this.slots[slotIdx] = null;
    } else {
      s.qty = Math.min(have, Math.min(50, val));
    }
    this.renderAll();
  },

  renderAll() {
    if (!this.bodyEl) return;
    const Forge = window.TuTien.Forge;
    const Art = window.TuTien.ArtifactArt;
    const Guard = window.TuTien.InputGuard;
    const session = Forge.session;

    // Nếu đang ở màn Đồ Phổ
    if (this.showCodex && !Forge.isForging()) {
      this.renderCodexView();
      return;
    }

    // Nếu vừa rèn xong -> hiện màn hình thành phẩm
    if (session && session.status === 'completed' && session.resultArtifact) {
      this.renderCompletedView(session);
      return;
    }

    const isForging = Forge.isForging();
    const analysis = isForging ? session.analysis : Forge.analyzeSlots(this.slots);
    const matched = analysis.matchedBlueprints || [];
    let activeBp = matched.find(bp => bp.id === this.selectedBlueprintId) || matched[0] || null;
    if (isForging) activeBp = session.blueprint;
    else if (activeBp) this.selectedBlueprintId = activeBp.id;

    const fk = Guard ? Guard.getForgeKeyConfig() : { addFire: 'KeyF', fanWind: 'KeyG', focusCalm: 'KeyH' };
    const kF = Guard ? Guard.formatCodeLabel(fk.addFire) : 'F';
    const kG = Guard ? Guard.formatCodeLabel(fk.fanWind) : 'G';
    const kH = Guard ? Guard.formatCodeLabel(fk.focusCalm) : 'H';

    // --- CỘT TRÁI: 4 Ô NGUYÊN LIỆU ---
    const slotsHtml = this.slots
      .map((s, idx) => {
        if (!s) {
          return `
            <div class="forge-slot-card empty-slot" data-slot="${idx}">
              <div class="fsc-empty-txt">+ Ô Linh Tài #${idx + 1}</div>
              <button class="btn-ancient-sm affordable btn-pick-slot" data-slot="${idx}" ${isForging ? 'disabled' : ''}>Chọn</button>
            </div>
          `;
        }
        const def = Forge.getMaterialDef(s.matId);
        const have = Forge.getMaterialQty(s.matId);
        const grade = Forge.getGradeObj(def.tier);
        const elMeta = window.TuTien.ELEMENT_META[def.element] || { name: def.element, color: '#cbd5e1' };
        return `
          <div class="forge-slot-card filled-slot" style="border-left:3px solid ${elMeta.color}">
            <div class="fsc-top">
              <strong>${def.icon} ${def.name}</strong>
              <span class="jade-badge" style="color:${grade.color};border-color:${grade.color}">${elMeta.name} • Bậc ${def.tier}</span>
            </div>
            <div class="fsc-controls">
              <button class="btn-qty-step" data-slot="${idx}" data-delta="-1" ${isForging ? 'disabled' : ''}>−</button>
              <input type="number" class="fsc-qty-input" data-slot="${idx}" value="${s.qty}" min="1" max="${Math.min(50, have)}" ${isForging ? 'disabled' : ''} />
              <button class="btn-qty-step" data-slot="${idx}" data-delta="1" ${isForging ? 'disabled' : ''}>+</button>
              <button class="btn-ancient-sm btn-qty-max" data-slot="${idx}" ${isForging ? 'disabled' : ''}>Tối đa (${have})</button>
              <button class="btn-ancient-sm btn-pick-slot" data-slot="${idx}" ${isForging ? 'disabled' : ''}>Đổi</button>
            </div>
          </div>
        `;
      })
      .join('');

    // --- CỘT GIỮA: LÒ RÈN SVG + BÓNG PHÁP BẢO + THANH KHỐNG HỎA ---
    const heatPct = isForging ? session.heat : 50;
    const domEl = analysis.dominantElement || 'hoa';
    const previewSilhouette = activeBp
      ? Art.renderArtifactSVG(activeBp.shape, domEl, isForging ? Forge.computeFinalTier(analysis.baseTier, activeBp, session.fireScorePct, session.hasDonNgo) : analysis.baseTier, 92, !isForging)
      : `<div style="height:92px;display:flex;align-items:center;justify-content:center;color:var(--ivory-muted);font-size:0.8rem;">Chưa định hình Pháp Bảo</div>`;

    const khongHoaControlsHtml = isForging
      ? `
        <div class="khong-hoa-panel">
          <div class="kh-meta-row">
            <span>⏱️ Tiến độ: <strong id="kh-time-txt">${session.elapsedSec.toFixed(1)}s / ${session.durationSec}s</strong></span>
            <span>🎯 Điểm Khống Hỏa: <strong id="kh-score-txt" style="color:#4ade80">${session.fireScorePct}%</strong></span>
            <span id="kh-donngo-badge" class="jade-badge" style="color:${session.hasDonNgo ? '#fde047' : '#94a3b8'};border-color:${session.hasDonNgo ? '#fde047' : '#64748b'}">
              ${session.hasDonNgo ? '✨ ĐỐN NGỘ (+1 Phẩm!)' : 'Đốn Ngộ: Chưa'}
            </span>
          </div>

          <div class="kh-progress-track"><div id="kh-progress-fill" class="kh-progress-fill" style="width:${((session.elapsedSec / session.durationSec) * 100).toFixed(1)}%"></div></div>

          <!-- Thanh Nhiệt Độ + Vùng Xanh Mục Tiêu + Kim Nhiệt -->
          <div class="kh-heat-wrap">
            <div class="kh-heat-bar">
              <div id="kh-target-zone" class="kh-target-zone" style="left:${session.targetMin}%;width:${session.targetMax - session.targetMin}%;"></div>
              <div id="kh-heat-needle" class="kh-heat-needle" style="left:${session.heat}%;"></div>
            </div>
            <div class="kh-focus-wrap" title="Linh Lực Ngưng Thần (tự hồi khi nhả phím ${kH})">
              <div id="kh-focus-fill" class="kh-focus-fill" style="height:${session.focusEnergy}%;"></div>
            </div>
          </div>

          ${
            session.autoMode
              ? `<div style="text-align:center;color:#fde047;font-size:0.82rem;padding:8px;">🤖 Đang Tự Động Rèn (Trần điểm ${Forge.computeAutoForgeCapPct()}%, không Đốn Ngộ)...</div>`
              : `
                <div class="kh-touch-btns">
                  <button id="btn-kh-fire" class="kh-hold-btn fire-btn">🔥 Thêm lửa [${kF}]</button>
                  <button id="btn-kh-wind" class="kh-hold-btn wind-btn">💨 Quạt gió [${kG}]</button>
                  <button id="btn-kh-calm" class="kh-hold-btn calm-btn">🧘 Ngưng thần [${kH}]</button>
                </div>
              `
          }
        </div>
      `
      : `<div style="text-align:center;font-size:0.78rem;color:var(--ivory-muted);margin-top:6px;">Phím Khống Hỏa: <strong>[${kF}]</strong> Thêm lửa • <strong>[${kG}]</strong> Quạt gió • <strong>[${kH}]</strong> Ngưng thần (hỗ trợ giữ nhiều nút cùng lúc)</div>`;

    // --- CỘT PHẢI: BẢNG XEM TRƯỚC TỨC THÌ ---
    let rightPreviewHtml = '';
    if (!activeBp) {
      rightPreviewHtml = `
        <div class="forge-preview-empty">
          <h4 style="color:#fda4af;margin-bottom:8px;">⚠️ Chưa Đủ Điều Kiện Định Hình</h4>
          <p style="font-size:0.84rem;line-height:1.5;color:#e2e8f0;">${analysis.missingReason}</p>
        </div>
      `;
    } else {
      const slotInfo = window.TuTien.ARTIFACT_SLOTS.find(x => x.id === activeBp.slot) || { name: activeBp.slot, icon: '⚔️' };
      const maxTier = Forge.computeMaxPossibleTier(analysis, activeBp);
      const maxGrade = Forge.getGradeObj(maxTier);
      const baseGrade = Forge.getGradeObj(analysis.baseTier);

      const multiSelectHtml = matched.length > 1 && !isForging
        ? `
          <div style="margin-bottom:8px;">
            <div style="font-size:0.74rem;color:var(--ivory-muted);margin-bottom:4px;">Nhiều mẫu khớp — Chọn mẫu muốn rèn:</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;">
              ${matched.map(bp => `<button class="btn-ancient-sm btn-select-bp ${bp.id === activeBp.id ? 'affordable' : ''}" data-bp="${bp.id}">${bp.name}</button>`).join('')}
            </div>
          </div>
        `
        : '';

      const affixesHtml = analysis.affixes.length
        ? analysis.affixes.map(a => {
            const elC = (window.TuTien.ELEMENT_META[a.element] || { color: '#86efac' }).color;
            return `<div class="fp-affix-line" style="color:${elC}">✦ <strong>${a.name} (${a.levelLabel} • ${a.ratioPct}%)</strong>: ${a.def.format(a.baseValue)}</div>`;
          }).join('')
        : `<div style="font-size:0.78rem;color:var(--ivory-muted);">Chưa đạt mốc 10% hệ nào để kích hoạt Đạo Vận.</div>`;

      const autoCap = Forge.computeAutoForgeCapPct();
      rightPreviewHtml = `
        ${multiSelectHtml}
        <div class="fp-title">${slotInfo.icon} ${activeBp.name}</div>
        <div class="fp-meta-grid">
          <div><span>Loại & Cỡ:</span> <strong>${slotInfo.name} (${activeBp.sizeLabel})</strong></div>
          <div><span>Số lượng:</span> <strong>${analysis.totalQty} viên (${activeBp.minQty}–${activeBp.maxQty})</strong></div>
          <div><span>Phẩm cơ sở:</span> <strong style="color:${baseGrade.color}">${baseGrade.name}</strong></div>
          <div><span>Phẩm tối đa:</span> <strong style="color:${maxGrade.color}">${maxGrade.name}</strong></div>
          <div><span>Thời gian rèn:</span> <strong>${activeBp.forgeTimeSec} giây</strong></div>
          <div><span>Hỏa hầu:</span> <strong>${activeBp.heatReq}</strong></div>
        </div>
        <div class="fp-section-label">✨ Đạo Vận Kích Hoạt (≥10% Mức 1 • ≥30% Tối Đa):</div>
        <div class="fp-affix-box">${affixesHtml}</div>
        ${
          !isForging
            ? `
              <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                <button id="btn-start-forge-manual" class="btn-ancient-wide ready">🔥 Bắt Đầu Rèn (Khống Hỏa Thủ Công)</button>
                <button id="btn-start-forge-auto" class="btn-ancient-sm affordable" style="padding:8px;">🤖 Tự Động Rèn (Trần ${autoCap}% • Không Đốn Ngộ)</button>
              </div>
            `
            : ''
        }
      `;
    }

    // Bộ chọn linh tài (Picker Modal bên trong Lò Rèn)
    let pickerHtml = '';
    if (this.activeSlotPickerIdx !== null && !isForging) {
      const mats = (window.TuTien.FORGE_MATERIALS_EXT || []).filter(m => Forge.getMaterialQty(m.id) > 0);
      pickerHtml = `
        <div class="forge-picker-backdrop">
          <div class="newbie-modal-box" style="max-width:560px;">
            <div class="newbie-modal-header">
              <h3>Chọn Linh Tài cho Ô #${this.activeSlotPickerIdx + 1}</h3>
              <button id="btn-close-slot-picker" class="jade-drawer-close">✕</button>
            </div>
            <div class="newbie-bag-list" style="max-height:340px;">
              ${
                mats.length === 0
                  ? `<div class="jade-empty">Kho linh tài đang trống. Hãy bật Khai Khoáng AFK hoặc đi Xuất Quan!</div>`
                  : mats.map(m => {
                      const qty = Forge.getMaterialQty(m.id);
                      const el = window.TuTien.ELEMENT_META[m.element] || { name: m.element, color: '#cbd5e1' };
                      const rl = window.TuTien.FORGE_ROLES[m.role] || m.role;
                      const gr = Forge.getGradeObj(m.tier);
                      return `
                        <div class="newbie-bag-item" style="justify-content:space-between;border-left:3px solid ${el.color}">
                          <div>
                            <strong style="color:${gr.color}">${m.icon} ${m.name} [${gr.name}]</strong>
                            <div style="font-size:0.74rem;color:var(--ivory-muted);">Hệ ${el.name} • Nhóm ${rl} • Hiện có: <strong>${qty}</strong></div>
                          </div>
                          <button class="btn-ancient-sm affordable btn-choose-mat-item" data-mat="${m.id}">Chọn</button>
                        </div>
                      `;
                    }).join('')
              }
            </div>
          </div>
        </div>
      `;
    }

    this.bodyEl.innerHTML = `
      <div class="forge-top-actions">
        <span class="nsb-chip">🔨 Luyện Khí: <strong>Cấp ${Forge.getSmithRank()}</strong></span>
        <span class="nsb-chip">📖 Đồ Phổ: <strong>${Object.keys((window.TuTien.State.data && window.TuTien.State.data.forgeCodex) || {}).length} / ${(window.TuTien.ARTIFACT_BLUEPRINTS || []).length}</strong></span>
        <button id="btn-open-forge-codex" class="btn-ancient-sm affordable" ${isForging ? 'disabled' : ''}>📖 Mở Đồ Phổ</button>
        <button id="btn-clear-forge-slots" class="btn-ancient-sm" ${isForging ? 'disabled' : ''}>🧹 Xóa Ô</button>
      </div>

      <div class="forge-3col-grid">
        <div class="forge-col-left">
          <div class="fp-section-label">1. Nguyên Liệu Bỏ Vào (Tối đa 4 ô)</div>
          <div class="forge-slots-stack">${slotsHtml}</div>
        </div>

        <div class="forge-col-center">
          <div class="forge-silhouette-stage">${previewSilhouette}</div>
          <div id="forge-furnace-wrap" class="forge-furnace-wrap">
            ${Art.renderFurnaceSVG(domEl, heatPct, isForging)}
          </div>
          ${khongHoaControlsHtml}
        </div>

        <div class="forge-col-right">
          <div class="fp-section-label">2. Xem Trước Thành Phẩm (Xác Định 100%)</div>
          ${rightPreviewHtml}
        </div>
      </div>
      ${pickerHtml}
    `;

    this.bindForgeUIEvents();
  },

  renderCodexView() {
    const codex = (window.TuTien.State.data && window.TuTien.State.data.forgeCodex) || {};
    const blueprints = window.TuTien.ARTIFACT_BLUEPRINTS || [];
    const Art = window.TuTien.ArtifactArt;
    const Forge = window.TuTien.Forge;

    const cardsHtml = blueprints
      .map(bp => {
        const entry = codex[bp.id];
        if (!entry) {
          return `
            <div class="codex-card locked-card">
              <div style="font-size:1.8rem;">🔒</div>
              <strong>???</strong>
              <span style="font-size:0.72rem;color:var(--ivory-muted);">Cỡ ${bp.sizeLabel} • Chưa rèn</span>
            </div>
          `;
        }
        const gr = Forge.getGradeObj(entry.bestTier);
        return `
          <div class="codex-card" style="border-color:${gr.color}">
            ${Art.renderArtifactSVG(bp.shape, 'kim', entry.bestTier, 58, false)}
            <strong style="color:${gr.color};font-size:0.82rem;">${bp.name}</strong>
            <span style="font-size:0.7rem;color:var(--ivory-muted);">Cao nhất: ${gr.name} • Đã rèn: ${entry.count}</span>
          </div>
        `;
      })
      .join('');

    this.bodyEl.innerHTML = `
      <div class="forge-top-actions">
        <strong style="color:var(--bronze-light);">📖 Đồ Phổ Pháp Bảo (${Object.keys(codex).length}/${blueprints.length})</strong>
        <button id="btn-back-to-forge" class="btn-ancient-sm affordable">← Quay Lại Lò Rèn</button>
      </div>
      <div class="codex-grid">${cardsHtml}</div>
    `;

    document.getElementById('btn-back-to-forge').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.showCodex = false;
      this.renderAll();
    });
  },

  renderCompletedView(session) {
    const art = session.resultArtifact;
    const Art = window.TuTien.ArtifactArt;
    const Forge = window.TuTien.Forge;

    // Kiểm tra còn đủ nguyên liệu để "Rèn tiếp bằng cùng nguyên liệu" không
    const canReforge = session.analysis.entries.every(ent => Forge.getMaterialQty(ent.matId) >= ent.qty);

    this.bodyEl.innerHTML = `
      <div class="forge-complete-card" style="border-color:${art.qualityColor}">
        <div style="font-size:0.86rem;color:#fde047;font-weight:700;">
          ✨ ĐOÁN TẠO HOÀN TẤT — Điểm Khống Hỏa: ${art.fireScorePct}% ${art.hasDonNgo ? '• 🌟 ĐỐN NGỘ (+1 Phẩm!)' : ''}
        </div>
        <div class="forge-complete-art">
          ${Art.renderArtifactSVG(art.shape, art.dominantElement, art.qualityTier, 128, false)}
        </div>
        <h3 style="color:${art.qualityColor};font-size:1.35rem;">${art.name}</h3>
        <div class="jade-badge" style="color:${art.qualityColor};border-color:${art.qualityColor};font-size:0.85rem;">
          ✦ ${art.qualityName} ✦
        </div>
        <div class="forge-complete-stats">${art.effectDesc}</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:14px;">
          <button id="btn-collect-artifact" class="btn-ancient-wide ready" style="width:auto;padding:10px 24px;">
            🎒 Thu Vào Túi Trữ Vật
          </button>
          <button id="btn-reforge-same" class="btn-ancient-sm affordable" style="padding:10px 18px;" ${!canReforge ? 'disabled' : ''}>
            🔥 Rèn Tiếp Bằng Cùng Nguyên Liệu
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-collect-artifact').addEventListener('pointerdown', e => {
      e.preventDefault();
      Forge.collectCompletedArtifact();
      this.renderAll();
    });

    document.getElementById('btn-reforge-same').addEventListener('pointerdown', e => {
      e.preventDefault();
      const collected = Forge.collectCompletedArtifact();
      if (collected && collected.snapshot) {
        this.slots = collected.snapshot.map(s => (s ? { ...s } : null));
        Forge.startForging(this.slots, collected.bpId, session.autoMode);
        this.renderAll();
      }
    });
  },

  bindForgeUIEvents() {
    const Forge = window.TuTien.Forge;
    const Guard = window.TuTien.InputGuard;

    const codexBtn = document.getElementById('btn-open-forge-codex');
    if (codexBtn) {
      codexBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.showCodex = true;
        this.renderAll();
      });
    }

    const clearBtn = document.getElementById('btn-clear-forge-slots');
    if (clearBtn) {
      clearBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.slots = [null, null, null, null];
        this.renderAll();
      });
    }

    this.bodyEl.querySelectorAll('.btn-pick-slot').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.activeSlotPickerIdx = Number(btn.getAttribute('data-slot'));
        this.renderAll();
      });
    });

    const closePicker = document.getElementById('btn-close-slot-picker');
    if (closePicker) {
      closePicker.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.activeSlotPickerIdx = null;
        this.renderAll();
      });
    }

    this.bodyEl.querySelectorAll('.btn-choose-mat-item').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const matId = btn.getAttribute('data-mat');
        this.setSlotMaterial(this.activeSlotPickerIdx, matId, 4);
      });
    });

    this.bodyEl.querySelectorAll('.btn-qty-step').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const idx = Number(btn.getAttribute('data-slot'));
        const delta = Number(btn.getAttribute('data-delta'));
        if (this.slots[idx]) this.adjustSlotQty(idx, this.slots[idx].qty + delta);
      });
    });

    this.bodyEl.querySelectorAll('.fsc-qty-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = Number(inp.getAttribute('data-slot'));
        this.adjustSlotQty(idx, inp.value);
      });
    });

    this.bodyEl.querySelectorAll('.btn-qty-max').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const idx = Number(btn.getAttribute('data-slot'));
        if (this.slots[idx]) {
          const have = Forge.getMaterialQty(this.slots[idx].matId);
          this.adjustSlotQty(idx, have);
        }
      });
    });

    this.bodyEl.querySelectorAll('.btn-select-bp').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.selectedBlueprintId = btn.getAttribute('data-bp');
        this.renderAll();
      });
    });

    const startManual = document.getElementById('btn-start-forge-manual');
    if (startManual) {
      startManual.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (Forge.startForging(this.slots, this.selectedBlueprintId, false)) {
          this.renderAll();
        }
      });
    }

    const startAuto = document.getElementById('btn-start-forge-auto');
    if (startAuto) {
      startAuto.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (Forge.startForging(this.slots, this.selectedBlueprintId, true)) {
          this.renderAll();
        }
      });
    }

    // 3 nút cảm ứng đa chạm (multi-touch pointerdown/pointerup/pointercancel) cho Khống Hỏa
    const bindHoldBtn = (id, actionKey) => {
      const el = document.getElementById(id);
      if (!el || !Guard) return;
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (el.setPointerCapture) {
          try { el.setPointerCapture(e.pointerId); } catch (_) {}
        }
        el.classList.add('is-held');
        Guard.setPointerAction(actionKey, true);
      });
      const release = () => {
        el.classList.remove('is-held');
        Guard.setPointerAction(actionKey, false);
      };
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('lostpointercapture', release);
    };

    bindHoldBtn('btn-kh-fire', 'addFire');
    bindHoldBtn('btn-kh-wind', 'fanWind');
    bindHoldBtn('btn-kh-calm', 'focusCalm');
  },

  /**
   * Cập nhật thanh Khống Hỏa siêu nhẹ mỗi frame (chỉ đổi style.left/width/height, không render lại DOM)
   */
  updateLiveForgeHUD() {
    const s = window.TuTien.Forge && window.TuTien.Forge.session;
    if (!s || s.status !== 'forging') return;

    const timeEl = document.getElementById('kh-time-txt');
    const scoreEl = document.getElementById('kh-score-txt');
    const progEl = document.getElementById('kh-progress-fill');
    const zoneEl = document.getElementById('kh-target-zone');
    const needleEl = document.getElementById('kh-heat-needle');
    const focusEl = document.getElementById('kh-focus-fill');
    const donNgoEl = document.getElementById('kh-donngo-badge');

    if (timeEl) timeEl.textContent = `${s.elapsedSec.toFixed(1)}s / ${s.durationSec}s`;
    if (scoreEl) scoreEl.textContent = `${s.fireScorePct}%`;
    if (progEl) progEl.style.width = `${Math.min(100, (s.elapsedSec / s.durationSec) * 100).toFixed(1)}%`;
    if (zoneEl) {
      zoneEl.style.left = `${s.targetMin.toFixed(1)}%`;
      zoneEl.style.width = `${(s.targetMax - s.targetMin).toFixed(1)}%`;
    }
    if (needleEl) needleEl.style.left = `${s.heat.toFixed(1)}%`;
    if (focusEl) focusEl.style.height = `${s.focusEnergy.toFixed(1)}%`;
    if (donNgoEl && s.hasDonNgo && !donNgoEl.dataset.lit) {
      donNgoEl.dataset.lit = '1';
      donNgoEl.textContent = '✨ ĐỐN NGỘ (+1 Phẩm!)';
      donNgoEl.style.color = '#fde047';
      donNgoEl.style.borderColor = '#fde047';
    }
  }
};
