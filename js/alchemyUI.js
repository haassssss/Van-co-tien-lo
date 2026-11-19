/**
 * js/alchemyUI.js
 * Giao diện Đan Lô riêng (3 cột):
 * - Trái: 4 ô dược liệu chọn từ Túi Trữ Vật (tăng/giảm +/-, nhập số, Tối đa).
 * - Giữa: Đan Lô vẽ bằng SVG + Giai đoạn 1 "Hòa Dược" (tối đa 4 thanh dược lực điều khiển bằng F/G/H/J hoặc nút cảm ứng đa chạm)
 *         + Giai đoạn 2 "Ngưng Đan" (vòng đan thu nhỏ, bấm Space hoặc chạm nút đúng vạch tạo 0-3 Đan Vân).
 * - Phải: Bảng xem trước tức thì (loại đan, số viên, phẩm tối đa, số đan vân tối đa, thời gian).
 */
window.TuTien = window.TuTien || {};

window.TuTien.AlchemyUI = {
  isOpen: false,
  slots: [null, null, null, null],
  selectedPillId: null,
  activePickerIdx: null,
  pendingLeaveCb: null,

  overlayEl: null,
  bodyEl: null,
  confirmEl: null,

  init() {
    this.overlayEl = document.getElementById('alchemy-modal-overlay');
    this.bodyEl = document.getElementById('alchemy-ui-body');
    this.confirmEl = document.getElementById('alchemy-abandon-confirm');

    const closeBtn = document.getElementById('alchemy-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.requestClose(() => this.forceClose());
      });
    }

    // Lắng nghe phím Space cho Giai đoạn 2 Ngưng Đan
    window.addEventListener('keydown', e => {
      if (!this.isOpen || e.repeat) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const Guard = window.TuTien.InputGuard;
      if (Guard && Guard.isEditableTarget(e.target)) return;
      const ak = Guard ? Guard.getAlchemyKeyConfig() : { condense: 'Space' };
      if (e.code === (ak.condense || 'Space') && window.TuTien.Alchemy && window.TuTien.Alchemy.session && window.TuTien.Alchemy.session.phase === 'ngung_dan') {
        e.preventDefault();
        window.TuTien.Alchemy.triggerCondenseBeat();
      }
    });
  },

  open() {
    if (window.TuTien.Alchemy) window.TuTien.Alchemy.ensureAlchemyState();
    this.isOpen = true;
    this.activePickerIdx = null;
    if (!this.overlayEl) this.init();
    if (this.overlayEl) this.overlayEl.classList.remove('hidden');
    this.renderAll();
  },

  forceClose() {
    this.isOpen = false;
    this.activePickerIdx = null;
    if (window.TuTien.InputGuard) window.TuTien.InputGuard.releaseAllInputs();
    if (this.overlayEl) this.overlayEl.classList.add('hidden');
    if (this.confirmEl) this.confirmEl.classList.add('hidden');
  },

  requestClose(onApproved) {
    if (window.TuTien.Alchemy && window.TuTien.Alchemy.isBrewing()) {
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
        <div class="newbie-modal-header"><h3 style="color:#fda4af;">⚗️ Cảnh Báo Rời Đan Lô</h3></div>
        <p style="font-size:0.88rem;line-height:1.5;color:#f7f1e3;margin-bottom:16px;">
          Đan hỏa đang cháy, rời đi lúc này sẽ làm hỏng một nửa dược liệu đã bỏ vào. Bạn có chắc muốn bỏ dở?
        </p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="btn-alc-keep" class="btn-ancient-sm affordable">🔥 Tiếp tục luyện</button>
          <button id="btn-alc-abandon" class="btn-ancient-sm" style="border-color:#f43f5e;color:#fda4af;">💨 Bỏ dở (Mất 50%)</button>
        </div>
      </div>
    `;
    this.confirmEl.classList.remove('hidden');
    document.getElementById('btn-alc-keep').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.confirmEl.classList.add('hidden');
      this.pendingLeaveCb = null;
    });
    document.getElementById('btn-alc-abandon').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.confirmEl.classList.add('hidden');
      window.TuTien.Alchemy.abandonBrewing();
      const cb = this.pendingLeaveCb;
      this.pendingLeaveCb = null;
      if (typeof cb === 'function') cb();
      else this.renderAll();
    });
  },

  setSlotHerb(idx, herbId, qty = 4) {
    const Alc = window.TuTien.Alchemy;
    const have = Alc.getHerbQty(herbId);
    if (have <= 0) return;
    const dup = this.slots.findIndex((s, i) => i !== idx && s && s.herbId === herbId);
    if (dup !== -1) {
      this.slots[dup].qty = Math.min(have, this.slots[dup].qty + Math.max(1, qty));
      this.slots[idx] = null;
    } else {
      this.slots[idx] = { herbId, qty: Math.min(have, Math.max(1, qty)) };
    }
    this.activePickerIdx = null;
    this.renderAll();
  },

  adjustQty(idx, val) {
    const s = this.slots[idx];
    if (!s) return;
    const have = window.TuTien.Alchemy.getHerbQty(s.herbId);
    const n = Math.floor(Number(val) || 0);
    if (n <= 0) this.slots[idx] = null;
    else s.qty = Math.min(have, Math.min(60, n));
    this.renderAll();
  },

  renderAll() {
    if (!this.bodyEl) return;
    const Alc = window.TuTien.Alchemy;
    const Art = window.TuTien.PillArt;
    const Guard = window.TuTien.InputGuard;
    const s = Alc.session;

    if (s && s.phase === 'completed' && s.resultPill) {
      const p = s.resultPill;
      const canRebrew = s.analysis.entries.every(e => Alc.getHerbQty(e.herbId) >= e.qty);
      this.bodyEl.innerHTML = `
        <div class="forge-complete-card" style="border-color:${p.color}">
          <div style="font-size:0.86rem;color:#fde047;font-weight:700;">
            ✨ THÀNH ĐAN — Hòa Dược: ${p.hoaDuocScorePct}% • Đan Vân: ${p.danVan}/3
          </div>
          ${Art.renderPillSVG(p.pillColor, p.danVan, p.grade, 120)}
          <h3 style="color:${p.color};font-size:1.35rem;">${p.name} ×${p.count} viên</h3>
          <div class="jade-badge" style="color:${p.color};border-color:${p.color}">${p.gradeName}</div>
          <div class="forge-complete-stats">${p.desc}</div>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
            <button id="btn-alc-collect" class="btn-ancient-wide ready" style="width:auto;padding:10px 24px;">🎒 Thu Vào Túi</button>
            <button id="btn-alc-rebrew" class="btn-ancient-sm affordable" style="padding:10px 18px;" ${!canRebrew ? 'disabled' : ''}>⚗️ Luyện Tiếp Bằng Cùng Dược Liệu</button>
          </div>
        </div>
      `;
      document.getElementById('btn-alc-collect').addEventListener('pointerdown', e => {
        e.preventDefault();
        Alc.collectCompletedPills();
        this.renderAll();
      });
      document.getElementById('btn-alc-rebrew').addEventListener('pointerdown', e => {
        e.preventDefault();
        const res = Alc.collectCompletedPills();
        if (res && res.snapshot) {
          this.slots = res.snapshot.map(x => (x ? { ...x } : null));
          Alc.startBrewing(this.slots, res.pillId, s.autoMode);
          this.renderAll();
        }
      });
      return;
    }

    const isBrewing = Alc.isBrewing();
    const analysis = isBrewing ? s.analysis : Alc.analyzeSlots(this.slots);
    const matched = analysis.matchedPills || [];
    let activePill = matched.find(p => p.id === this.selectedPillId) || matched[0] || null;
    if (isBrewing) activePill = s.pillDef;
    else if (activePill) this.selectedPillId = activePill.id;

    const ak = Guard ? Guard.getAlchemyKeyConfig() : { herb1: 'KeyF', herb2: 'KeyG', herb3: 'KeyH', herb4: 'KeyJ', condense: 'Space' };
    const keyLabels = [ak.herb1, ak.herb2, ak.herb3, ak.herb4].map(c => (Guard ? Guard.formatCodeLabel(c) : c));

    const slotsHtml = this.slots
      .map((sl, idx) => {
        if (!sl) {
          return `
            <div class="forge-slot-card empty-slot">
              <div class="fsc-empty-txt">+ Ô Dược Liệu #${idx + 1}</div>
              <button class="btn-ancient-sm affordable btn-alc-pick" data-slot="${idx}" ${isBrewing ? 'disabled' : ''}>Chọn</button>
            </div>
          `;
        }
        const def = Alc.getHerbDef(sl.herbId);
        const have = Alc.getHerbQty(sl.herbId);
        return `
          <div class="forge-slot-card filled-slot" style="border-left:3px solid ${Alc.getGradeColor(def.grade)}">
            <div class="fsc-top">
              <strong>${def.icon} ${def.name}</strong>
              <span class="jade-badge">${Alc.getGradeName(def.grade)}</span>
            </div>
            <div class="fsc-controls">
              <button class="btn-qty-step btn-alc-step" data-slot="${idx}" data-delta="-1" ${isBrewing ? 'disabled' : ''}>−</button>
              <input type="number" class="fsc-qty-input alc-qty-inp" data-slot="${idx}" value="${sl.qty}" min="1" max="${Math.min(60, have)}" ${isBrewing ? 'disabled' : ''} />
              <button class="btn-qty-step btn-alc-step" data-slot="${idx}" data-delta="1" ${isBrewing ? 'disabled' : ''}>+</button>
              <button class="btn-ancient-sm btn-alc-max" data-slot="${idx}" ${isBrewing ? 'disabled' : ''}>Tối đa (${have})</button>
              <button class="btn-ancient-sm btn-alc-pick" data-slot="${idx}" ${isBrewing ? 'disabled' : ''}>Đổi</button>
            </div>
          </div>
        `;
      })
      .join('');

    // Cột giữa: Đan Lô + Giai đoạn 1 Hòa Dược (tối đa 4 thanh) hoặc Giai đoạn 2 Ngưng Đan
    let centerInteractiveHtml = `<div style="text-align:center;font-size:0.78rem;color:var(--ivory-muted);margin-top:6px;">Giai đoạn 1 Hòa Dược: giữ <strong>[${keyLabels.join(' / ')}]</strong> đẩy thanh dược lực vào vùng xanh • Giai đoạn 2 Ngưng Đan: bấm <strong>[Space]</strong> đúng nhịp!</div>`;
    if (isBrewing && s.phase === 'hoa_duoc') {
      const barsHtml = s.bars
        .map(
          (b, i) => `
          <div class="alc-bar-row">
            <div class="alc-bar-label">${b.icon} ${b.name} (${b.targetCenter}%)</div>
            <div class="kh-heat-bar" style="height:22px;background:#1a1510;">
              <div class="kh-target-zone" style="left:${b.targetMin}%;width:${b.targetMax - b.targetMin}%;"></div>
              <div id="alc-needle-${i}" class="kh-heat-needle" style="left:${b.value}%;"></div>
            </div>
            ${
              !s.autoMode
                ? `<button class="kh-hold-btn btn-alc-hold" data-action="herb${i + 1}" style="padding:5px 10px;min-width:86px;">Đẩy [${keyLabels[i]}]</button>`
                : ''
            }
          </div>
        `
        )
        .join('');

      centerInteractiveHtml = `
        <div class="khong-hoa-panel">
          <div class="kh-meta-row">
            <span>🔥 Giai đoạn 1: <strong>HÒA DƯỢC</strong> (<span id="alc-time-txt">${s.elapsedSec.toFixed(1)}s / ${s.hoaDuocDuration}s</span>)</span>
            <span>🎯 Điểm: <strong id="alc-score-txt" style="color:#4ade80">${s.hoaDuocScorePct}%</strong></span>
          </div>
          <div class="kh-progress-track"><div id="alc-prog-fill" class="kh-progress-fill" style="width:${((s.elapsedSec / s.hoaDuocDuration) * 100).toFixed(1)}%"></div></div>
          <div style="display:flex;flex-direction:column;gap:7px;">${barsHtml}</div>
        </div>
      `;
    } else if (isBrewing && s.phase === 'ngung_dan') {
      centerInteractiveHtml = `
        <div class="khong-hoa-panel" style="align-items:center;">
          <div class="kh-meta-row" style="width:100%;">
            <span>✨ Giai đoạn 2: <strong>NGƯNG ĐAN</strong> (Nhịp <strong id="alc-beat-txt">${Math.min(s.totalBeats, s.currentBeat + 1)}/${s.totalBeats}</strong>)</span>
            <span>☁️ Chuẩn: <strong id="alc-hits-txt" style="color:#fde047">${s.perfectHits}</strong></span>
          </div>
          <div class="condense-ring-stage">
            <div class="condense-target-ring"></div>
            <div id="condense-moving-ring" class="condense-moving-ring"></div>
            <div class="condense-core-dot"></div>
          </div>
          <div id="alc-beat-fb" style="font-size:0.82rem;color:#fde047;min-height:18px;">${s.lastBeatFeedback || 'Bấm [Space] hoặc nút dưới khi vòng sáng chạm vòng vàng!'}</div>
          ${
            !s.autoMode
              ? `<button id="btn-alc-condense" class="btn-ancient-wide ready" style="max-width:280px;">⚡ Ngưng Đan [Space]</button>`
              : `<div style="color:#fde047;font-size:0.8rem;">🤖 Tự Động Ngưng Đan...</div>`
          }
        </div>
      `;
    }

    let rightHtml = '';
    if (!activePill) {
      rightHtml = `<div class="forge-preview-empty"><h4 style="color:#fda4af;">⚠️ Chưa Đủ Dược Liệu</h4><p style="font-size:0.84rem;margin-top:6px;">${analysis.missingReason}</p></div>`;
    } else {
      const multiHtml = matched.length > 1 && !isBrewing
        ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;">${matched.map(p => `<button class="btn-ancient-sm btn-alc-select-pill ${p.id === activePill.id ? 'affordable' : ''}" data-pill="${p.id}">${p.name}</button>`).join('')}</div>`
        : '';

      rightHtml = `
        ${multiHtml}
        <div class="fp-title">💊 ${activePill.name}</div>
        <div class="fp-meta-grid">
          <div><span>Số viên đan:</span> <strong>${analysis.pillCount} viên</strong></div>
          <div><span>Phẩm tối đa:</span> <strong style="color:${Alc.getGradeColor(analysis.maxGrade)}">${Alc.getGradeName(analysis.maxGrade)}</strong></div>
          <div><span>Đan Vân tối đa:</span> <strong style="color:#fde047">3 Đan Vân (${activePill.beats} nhịp)</strong></div>
          <div><span>Thời gian:</span> <strong>${analysis.hoaDuocSec}s + ${analysis.ngungDanSec}s</strong></div>
        </div>
        <p style="font-size:0.8rem;color:#86efac;margin-bottom:10px;">${activePill.desc}</p>
        ${
          !isBrewing
            ? `
              <div style="display:flex;flex-direction:column;gap:8px;">
                <button id="btn-alc-start-manual" class="btn-ancient-wide ready">⚗️ Bắt Đầu Luyện Đan (Thủ Công)</button>
                <button id="btn-alc-start-auto" class="btn-ancient-sm affordable" style="padding:8px;">🤖 Tự Động Luyện (Trần ${Alc.computeAutoCapPct()}% • Tối đa 1 Đan Vân)</button>
              </div>
            `
            : ''
        }
      `;
    }

    let pickerHtml = '';
    if (this.activePickerIdx !== null && !isBrewing) {
      const list = (window.TuTien.ALCHEMY_MATERIALS || []).filter(m => Alc.getHerbQty(m.id) > 0);
      pickerHtml = `
        <div class="forge-picker-backdrop">
          <div class="newbie-modal-box" style="max-width:540px;">
            <div class="newbie-modal-header">
              <h3>Chọn Dược Liệu cho Ô #${this.activePickerIdx + 1}</h3>
              <button id="btn-alc-close-picker" class="jade-drawer-close">✕</button>
            </div>
            <div class="newbie-bag-list" style="max-height:330px;">
              ${list.map(m => `
                <div class="newbie-bag-item" style="justify-content:space-between;">
                  <div>
                    <strong style="color:${Alc.getGradeColor(m.grade)}">${m.icon} ${m.name} [${Alc.getGradeName(m.grade)}]</strong>
                    <div style="font-size:0.74rem;color:var(--ivory-muted);">Hiện có: <strong>${Alc.getHerbQty(m.id)}</strong> • ${m.desc}</div>
                  </div>
                  <button class="btn-ancient-sm affordable btn-alc-choose-herb" data-herb="${m.id}">Chọn</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    this.bodyEl.innerHTML = `
      <div class="forge-top-actions">
        <span class="nsb-chip">⚗️ Luyện Đan: <strong>${Alc.getGradeName(Alc.getAlchemyRank())}</strong></span>
        <button id="btn-alc-clear" class="btn-ancient-sm" ${isBrewing ? 'disabled' : ''}>🧹 Xóa Ô</button>
      </div>
      <div class="forge-3col-grid">
        <div class="forge-col-left">
          <div class="fp-section-label">1. Dược Liệu Bỏ Vào Đan Lô (4 ô)</div>
          <div class="forge-slots-stack">${slotsHtml}</div>
        </div>
        <div class="forge-col-center">
          <div class="forge-furnace-wrap">${Art.renderCauldronSVG(activePill ? activePill.color : '#4ade80', isBrewing)}</div>
          ${centerInteractiveHtml}
        </div>
        <div class="forge-col-right">
          <div class="fp-section-label">2. Xem Trước Đan Dược (Xác Định 100%)</div>
          ${rightHtml}
        </div>
      </div>
      ${pickerHtml}
    `;

    this.bindEvents();
  },

  bindEvents() {
    const Alc = window.TuTien.Alchemy;
    const Guard = window.TuTien.InputGuard;

    const clearBtn = document.getElementById('btn-alc-clear');
    if (clearBtn) clearBtn.addEventListener('pointerdown', e => { e.preventDefault(); this.slots = [null, null, null, null]; this.renderAll(); });

    this.bodyEl.querySelectorAll('.btn-alc-pick').forEach(btn => {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); this.activePickerIdx = Number(btn.getAttribute('data-slot')); this.renderAll(); });
    });
    const cp = document.getElementById('btn-alc-close-picker');
    if (cp) cp.addEventListener('pointerdown', e => { e.preventDefault(); this.activePickerIdx = null; this.renderAll(); });

    this.bodyEl.querySelectorAll('.btn-alc-choose-herb').forEach(btn => {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); this.setSlotHerb(this.activePickerIdx, btn.getAttribute('data-herb'), 4); });
    });
    this.bodyEl.querySelectorAll('.btn-alc-step').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const idx = Number(btn.getAttribute('data-slot'));
        const d = Number(btn.getAttribute('data-delta'));
        if (this.slots[idx]) this.adjustQty(idx, this.slots[idx].qty + d);
      });
    });
    this.bodyEl.querySelectorAll('.alc-qty-inp').forEach(inp => {
      inp.addEventListener('change', () => this.adjustQty(Number(inp.getAttribute('data-slot')), inp.value));
    });
    this.bodyEl.querySelectorAll('.btn-alc-max').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const idx = Number(btn.getAttribute('data-slot'));
        if (this.slots[idx]) this.adjustQty(idx, Alc.getHerbQty(this.slots[idx].herbId));
      });
    });
    this.bodyEl.querySelectorAll('.btn-alc-select-pill').forEach(btn => {
      btn.addEventListener('pointerdown', e => { e.preventDefault(); this.selectedPillId = btn.getAttribute('data-pill'); this.renderAll(); });
    });

    const sm = document.getElementById('btn-alc-start-manual');
    if (sm) sm.addEventListener('pointerdown', e => { e.preventDefault(); if (Alc.startBrewing(this.slots, this.selectedPillId, false)) this.renderAll(); });
    const sa = document.getElementById('btn-alc-start-auto');
    if (sa) sa.addEventListener('pointerdown', e => { e.preventDefault(); if (Alc.startBrewing(this.slots, this.selectedPillId, true)) this.renderAll(); });

    // Multi-touch buttons for Hòa Dược F/G/H/J
    this.bodyEl.querySelectorAll('.btn-alc-hold').forEach(btn => {
      const act = btn.getAttribute('data-action');
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (btn.setPointerCapture) { try { btn.setPointerCapture(e.pointerId); } catch (_) {} }
        btn.classList.add('is-held');
        if (Guard) Guard.setPointerAction(act, true);
      });
      const rel = () => { btn.classList.remove('is-held'); if (Guard) Guard.setPointerAction(act, false); };
      btn.addEventListener('pointerup', rel);
      btn.addEventListener('pointercancel', rel);
      btn.addEventListener('lostpointercapture', rel);
    });

    const cBtn = document.getElementById('btn-alc-condense');
    if (cBtn) cBtn.addEventListener('pointerdown', e => { e.preventDefault(); Alc.triggerCondenseBeat(); });
  },

  updateLiveHUD() {
    const s = window.TuTien.Alchemy && window.TuTien.Alchemy.session;
    if (!s) return;
    if (s.phase === 'hoa_duoc') {
      const tEl = document.getElementById('alc-time-txt');
      const scEl = document.getElementById('alc-score-txt');
      const prEl = document.getElementById('alc-prog-fill');
      if (tEl) tEl.textContent = `${s.elapsedSec.toFixed(1)}s / ${s.hoaDuocDuration}s`;
      if (scEl) scEl.textContent = `${s.hoaDuocScorePct}%`;
      if (prEl) prEl.style.width = `${Math.min(100, (s.elapsedSec / s.hoaDuocDuration) * 100).toFixed(1)}%`;
      s.bars.forEach((b, i) => {
        const n = document.getElementById(`alc-needle-${i}`);
        if (n) n.style.left = `${b.value.toFixed(1)}%`;
      });
    } else if (s.phase === 'ngung_dan') {
      const ring = document.getElementById('condense-moving-ring');
      const bt = document.getElementById('alc-beat-txt');
      const ht = document.getElementById('alc-hits-txt');
      const fb = document.getElementById('alc-beat-fb');
      if (ring) {
        const scale = Math.max(0.15, 1.35 - s.beatProgress * 1.15);
        ring.style.transform = `scale(${scale.toFixed(3)})`;
      }
      if (bt) bt.textContent = `${Math.min(s.totalBeats, s.currentBeat + 1)}/${s.totalBeats}`;
      if (ht) ht.textContent = String(s.perfectHits);
      if (fb && s.lastBeatFeedback) fb.textContent = s.lastBeatFeedback;
    }
  }
};
