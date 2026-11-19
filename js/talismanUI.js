/**
 * js/talismanUI.js
 * Giao diện Phù Án riêng (3 cột):
 * - Trái: 3 ô nguyên liệu (Phù Chỉ, Chu Sa/Mực, Phụ Liệu tùy chọn).
 * - Giữa: Canvas Họa Phù (hiện nét phù văn phát sáng mờ, người chơi kéo chuột hoặc ngón tay vẽ từng nét không gắt thời gian).
 * - Phải: Bảng xem trước (loại phù, số lá, thời gian hiệu lực, phẩm tối đa).
 */
window.TuTien = window.TuTien || {};

window.TuTien.TalismanUI = {
  isOpen: false,
  paperSlot: { matId: 'hoang_chi', qty: 3 },
  inkSlot: { matId: 'chu_sa_hoa', qty: 2 },
  addonSlot: null,
  selectedTplId: null,
  activePickerGroup: null, // 'paper' | 'ink' | 'addon'
  pendingLeaveCb: null,

  isPointerDrawing: false,
  currentUserPath: [],

  overlayEl: null,
  bodyEl: null,
  confirmEl: null,

  init() {
    this.overlayEl = document.getElementById('talisman-modal-overlay');
    this.bodyEl = document.getElementById('talisman-ui-body');
    this.confirmEl = document.getElementById('talisman-abandon-confirm');

    const closeBtn = document.getElementById('talisman-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.requestClose(() => this.forceClose());
      });
    }
  },

  open() {
    if (window.TuTien.Talisman) window.TuTien.Talisman.ensureTalismanState();
    this.isOpen = true;
    this.activePickerGroup = null;
    if (!this.overlayEl) this.init();
    if (this.overlayEl) this.overlayEl.classList.remove('hidden');
    this.renderAll();
  },

  forceClose() {
    this.isOpen = false;
    this.activePickerGroup = null;
    this.isPointerDrawing = false;
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    if (this.confirmEl) this.confirmEl.classList.add('hidden');
  },

  requestClose(onApproved) {
    if (window.TuTien.Talisman && window.TuTien.Talisman.isDrawing()) {
      this.pendingLeaveCb = onApproved;
      this.showAbandonConfirm();
      return false;
    }
    if (typeof onApproved === 'function') onApproved();
    return true;
  },

  showAbandonConfirm() {
    if (!this.confirmEl) return;
    this.confirmEl.innerHTML = `
      <div class="newbie-modal-box" style="max-width:460px;border-color:#f43f5e;">
        <div class="newbie-modal-header"><h3 style="color:#fda4af;">📜 Cảnh Báo Rời Phù Án</h3></div>
        <p style="font-size:0.88rem;line-height:1.5;color:#f7f1e3;margin-bottom:16px;">
          Phù văn đang vẽ dở, rời đi lúc này sẽ làm hỏng một nửa nguyên liệu đã chuẩn bị. Bạn có chắc muốn bỏ dở?
        </p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="btn-tal-keep" class="btn-ancient-sm affordable">🖌️ Tiếp tục vẽ</button>
          <button id="btn-tal-abandon" class="btn-ancient-sm" style="border-color:#f43f5e;color:#fda4af;">💨 Bỏ dở (Mất 50%)</button>
        </div>
      </div>
    `;
    this.confirmEl.classList.remove('hidden');
    document.getElementById('btn-tal-keep').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.confirmEl.classList.add('hidden');
      this.pendingLeaveCb = null;
    });
    document.getElementById('btn-tal-abandon').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.confirmEl.classList.add('hidden');
      window.TuTien.Talisman.abandonDrawing();
      const cb = this.pendingLeaveCb;
      this.pendingLeaveCb = null;
      if (typeof cb === 'function') cb();
      else this.renderAll();
    });
  },

  renderAll() {
    if (!this.bodyEl) return;
    const Tal = window.TuTien.Talisman;
    const s = Tal.session;

    if (s && s.status === 'completed' && s.resultTalisman) {
      const r = s.resultTalisman;
      this.bodyEl.innerHTML = `
        <div class="forge-complete-card" style="border-color:${r.color}">
          <div style="font-size:0.86rem;color:#fde047;font-weight:700;">
            ✨ HỌA PHÙ HOÀN TẤT — Độ chuẩn xác: ${r.scorePct}% ${r.isPerfect ? '• 🌟 PHÙ VĂN HOÀN MỸ (+1 Phẩm!)' : ''}
          </div>
          <div style="font-size:3.2rem;margin:6px 0;">📜</div>
          <h3 style="color:${r.color};font-size:1.35rem;">${r.name} ×${r.count} lá</h3>
          <div class="jade-badge" style="color:${r.color};border-color:${r.color}">${r.gradeName}</div>
          <div class="forge-complete-stats">${r.desc}</div>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
            <button id="btn-tal-collect" class="btn-ancient-wide ready" style="width:auto;padding:10px 24px;">🎒 Thu Vào Túi</button>
          </div>
        </div>
      `;
      document.getElementById('btn-tal-collect').addEventListener('pointerdown', e => {
        e.preventDefault();
        Tal.collectCompletedTalismans();
        this.renderAll();
      });
      return;
    }

    const isDrawing = Tal.isDrawing();
    const analysis = isDrawing ? s.analysis : Tal.analyzeInputs(this.paperSlot, this.inkSlot, this.addonSlot);
    const matched = analysis.matchedTemplates || [];
    let activeTpl = matched.find(t => t.id === this.selectedTplId) || matched[0] || null;
    if (isDrawing) activeTpl = s.tpl;
    else if (activeTpl) this.selectedTplId = activeTpl.id;

    const renderSlotBox = (group, label, slotObj) => {
      if (!slotObj || !slotObj.matId) {
        return `
          <div class="forge-slot-card empty-slot">
            <div class="fsc-empty-txt">+ ${label}</div>
            <button class="btn-ancient-sm affordable btn-tal-pick" data-group="${group}" ${isDrawing ? 'disabled' : ''}>Chọn</button>
          </div>
        `;
      }
      const def = Tal.getMatDef(slotObj.matId);
      const have = Tal.getMatQty(slotObj.matId);
      return `
        <div class="forge-slot-card filled-slot">
          <div class="fsc-top"><strong>${def.icon} ${def.name}</strong><span class="jade-badge">${label}</span></div>
          <div class="fsc-controls">
            <button class="btn-qty-step btn-tal-step" data-group="${group}" data-delta="-1" ${isDrawing ? 'disabled' : ''}>−</button>
            <input type="number" class="fsc-qty-input tal-qty-inp" data-group="${group}" value="${slotObj.qty}" min="1" max="${Math.min(30, have)}" ${isDrawing ? 'disabled' : ''} />
            <button class="btn-qty-step btn-tal-step" data-group="${group}" data-delta="1" ${isDrawing ? 'disabled' : ''}>+</button>
            <button class="btn-ancient-sm btn-tal-pick" data-group="${group}" ${isDrawing ? 'disabled' : ''}>Đổi</button>
          </div>
        </div>
      `;
    };

    const grades = window.TuTien.FORGE_GRADES || [];
    const maxGrObj = grades.find(g => g.tier === analysis.maxGrade) || { name: 'Phàm Phẩm', color: '#cbd5e1' };

    let rightHtml = '';
    if (!activeTpl) {
      rightHtml = `<div class="forge-preview-empty"><h4 style="color:#fda4af;">⚠️ Chưa Đủ Nguyên Liệu</h4><p style="font-size:0.84rem;margin-top:6px;">${analysis.missingReason}</p></div>`;
    } else {
      const multiHtml = matched.length > 1 && !isDrawing
        ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;">${matched.map(t => `<button class="btn-ancient-sm btn-tal-select-tpl ${t.id === activeTpl.id ? 'affordable' : ''}" data-tpl="${t.id}">${t.name}</button>`).join('')}</div>`
        : '';
      const durSec = Math.round(activeTpl.baseDurationSec * (analysis.durationMult || 1));

      rightHtml = `
        ${multiHtml}
        <div class="fp-title">📜 ${activeTpl.name}</div>
        <div class="fp-meta-grid">
          <div><span>Số lá phù:</span> <strong>${analysis.leafCount} lá</strong></div>
          <div><span>Phẩm tối đa:</span> <strong style="color:${maxGrObj.color}">${maxGrObj.name}</strong></div>
          <div><span>Hiệu lực:</span> <strong>${durSec} giây</strong></div>
          <div><span>Số nét vẽ:</span> <strong>${activeTpl.strokes.length} nét</strong></div>
        </div>
        <p style="font-size:0.8rem;color:#86efac;margin-bottom:10px;">${activeTpl.desc}</p>
        ${
          !isDrawing
            ? `
              <div style="display:flex;flex-direction:column;gap:8px;">
                <button id="btn-tal-start-manual" class="btn-ancient-wide ready">🖌️ Bắt Đầu Họa Phù (Kéo Chuột / Cảm Ứng)</button>
                <button id="btn-tal-start-auto" class="btn-ancient-sm affordable" style="padding:8px;">🤖 Tự Động Họa (Trần ${Tal.computeAutoCapPct()}% • Không Hoàn Mỹ)</button>
              </div>
            `
            : `<div style="font-size:0.82rem;color:#fde047;margin-top:8px;">🖌️ Hãy kéo chuột hoặc ngón tay vẽ theo <strong>Nét #${s.activeStrokeIdx + 1}/${s.tpl.strokes.length}</strong> trên lá phù (vẽ từ tốn, không giới hạn thời gian)!</div>`
        }
      `;
    }

    let pickerHtml = '';
    if (this.activePickerGroup && !isDrawing) {
      const list = (window.TuTien.TALISMAN_MATERIALS || []).filter(m => m.group === this.activePickerGroup && Tal.getMatQty(m.id) > 0);
      pickerHtml = `
        <div class="forge-picker-backdrop">
          <div class="newbie-modal-box" style="max-width:520px;">
            <div class="newbie-modal-header">
              <h3>Chọn Nguyên Liệu Họa Phù</h3>
              <button id="btn-tal-close-picker" class="jade-drawer-close">✕</button>
            </div>
            <div class="newbie-bag-list" style="max-height:320px;">
              ${list.map(m => `
                <div class="newbie-bag-item" style="justify-content:space-between;">
                  <div>
                    <strong>${m.icon} ${m.name}</strong>
                    <div style="font-size:0.74rem;color:var(--ivory-muted);">Có: <strong>${Tal.getMatQty(m.id)}</strong> • ${m.desc}</div>
                  </div>
                  <button class="btn-ancient-sm affordable btn-tal-choose" data-mat="${m.id}">Chọn</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    this.bodyEl.innerHTML = `
      <div class="forge-top-actions">
        <span class="nsb-chip">📜 Phù Lục: <strong>Cấp ${Tal.getTalismanRank()}</strong></span>
        <span style="font-size:0.78rem;color:var(--ivory-muted);">Chỉ cần vẽ 1 lá mẫu — cả mẻ phù sao theo độ chuẩn xác (≥95% đạt Hoàn Mỹ +1 Phẩm)!</span>
      </div>
      <div class="forge-3col-grid">
        <div class="forge-col-left">
          <div class="fp-section-label">1. Chuẩn Bị Phù Án (3 ô)</div>
          <div class="forge-slots-stack">
            ${renderSlotBox('paper', 'Ô 1: Phù Chỉ', this.paperSlot)}
            ${renderSlotBox('ink', 'Ô 2: Chu Sa / Mực', this.inkSlot)}
            ${renderSlotBox('addon', 'Ô 3: Phụ Liệu (Tùy chọn)', this.addonSlot)}
          </div>
        </div>
        <div class="forge-col-center" style="align-items:center;">
          <div class="fp-section-label">Bàn Họa Phù (Kéo chuột hoặc ngón tay)</div>
          <canvas id="talisman-draw-canvas" width="260" height="340" class="talisman-canvas"></canvas>
        </div>
        <div class="forge-col-right">
          <div class="fp-section-label">2. Xem Trước Phù Văn (Xác Định 100%)</div>
          ${rightHtml}
        </div>
      </div>
      ${pickerHtml}
    `;

    this.redrawCanvas();
    this.bindEvents();
  },

  redrawCanvas() {
    const canvas = document.getElementById('talisman-draw-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const Art = window.TuTien.TalismanArt;
    const Tal = window.TuTien.Talisman;
    const s = Tal.session;

    Art.drawPaperBase(ctx, canvas.width, canvas.height);

    const analysis = Tal.isDrawing() ? s.analysis : Tal.analyzeInputs(this.paperSlot, this.inkSlot, this.addonSlot);
    const tpl = Tal.isDrawing()
      ? s.tpl
      : (analysis.matchedTemplates || []).find(t => t.id === this.selectedTplId) || (analysis.matchedTemplates || [])[0];

    if (tpl) {
      const activeIdx = Tal.isDrawing() ? s.activeStrokeIdx : -1;
      const doneCnt = Tal.isDrawing() ? s.activeStrokeIdx : 0;
      Art.drawTemplateStrokes(ctx, canvas.width, canvas.height, tpl.strokes, activeIdx, doneCnt, tpl.color || '#dc2626');
    }
    if (this.currentUserPath.length > 1) {
      Art.drawUserPath(ctx, this.currentUserPath, '#b91c1c');
    }
  },

  bindEvents() {
    const Tal = window.TuTien.Talisman;
    const getSlotRef = g => (g === 'paper' ? 'paperSlot' : g === 'ink' ? 'inkSlot' : 'addonSlot');

    this.bodyEl.querySelectorAll('.btn-tal-pick').forEach(btn => {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); this.activePickerGroup = btn.getAttribute('data-group'); this.renderAll(); });
    });
    const cp = document.getElementById('btn-tal-close-picker');
    if (cp) cp.addEventListener('pointerdown', e => { e.preventDefault(); this.activePickerGroup = null; this.renderAll(); });

    this.bodyEl.querySelectorAll('.btn-tal-choose').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const matId = btn.getAttribute('data-mat');
        const key = getSlotRef(this.activePickerGroup);
        this[key] = { matId, qty: Math.min(Tal.getMatQty(matId), this.activePickerGroup === 'paper' ? 3 : 2) };
        this.activePickerGroup = null;
        this.renderAll();
      });
    });

    this.bodyEl.querySelectorAll('.btn-tal-step').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const key = getSlotRef(btn.getAttribute('data-group'));
        const delta = Number(btn.getAttribute('data-delta'));
        if (!this[key]) return;
        const have = Tal.getMatQty(this[key].matId);
        const next = this[key].qty + delta;
        if (next <= 0) this[key] = null;
        else this[key].qty = Math.min(have, Math.min(30, next));
        this.renderAll();
      });
    });

    this.bodyEl.querySelectorAll('.tal-qty-inp').forEach(inp => {
      inp.addEventListener('change', () => {
        const key = getSlotRef(inp.getAttribute('data-group'));
        if (!this[key]) return;
        const have = Tal.getMatQty(this[key].matId);
        const val = Math.floor(Number(inp.value) || 0);
        if (val <= 0) this[key] = null;
        else this[key].qty = Math.min(have, Math.min(30, val));
        this.renderAll();
      });
    });

    this.bodyEl.querySelectorAll('.btn-tal-select-tpl').forEach(btn => {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); this.selectedTplId = btn.getAttribute('data-tpl'); this.renderAll(); });
    });

    const sm = document.getElementById('btn-tal-start-manual');
    if (sm) sm.addEventListener('pointerdown', e => { e.preventDefault(); if (Tal.startDrawing(this.paperSlot, this.inkSlot, this.addonSlot, this.selectedTplId, false)) this.renderAll(); });
    const sa = document.getElementById('btn-tal-start-auto');
    if (sa) sa.addEventListener('pointerdown', e => { e.preventDefault(); if (Tal.startDrawing(this.paperSlot, this.inkSlot, this.addonSlot, this.selectedTplId, true)) this.renderAll(); });

    // Sự kiện vẽ nét trên Canvas bằng chuột hoặc cảm ứng
    const canvas = document.getElementById('talisman-draw-canvas');
    if (canvas) {
      const getPt = e => {
        const r = canvas.getBoundingClientRect();
        return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
      };
      canvas.addEventListener('pointerdown', e => {
        if (!Tal.isDrawing() || Tal.session.autoMode) return;
        e.preventDefault();
        if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} }
        this.isPointerDrawing = true;
        this.currentUserPath = [getPt(e)];
        this.redrawCanvas();
      });
      canvas.addEventListener('pointermove', e => {
        if (!this.isPointerDrawing) return;
        e.preventDefault();
        this.currentUserPath.push(getPt(e));
        this.redrawCanvas();
      });
      const finishStroke = () => {
        if (!this.isPointerDrawing) return;
        this.isPointerDrawing = false;
        const pts = this.currentUserPath.slice();
        this.currentUserPath = [];
        Tal.evaluateStroke(pts, canvas.width, canvas.height);
        this.redrawCanvas();
      };
      canvas.addEventListener('pointerup', finishStroke);
      canvas.addEventListener('pointercancel', finishStroke);
    }
  }
};
