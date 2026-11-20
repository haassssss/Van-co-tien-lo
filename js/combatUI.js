/**
 * js/combatUI.js
 * Giao diện Đấu Trường Chiến Đấu V2:
 * - Thanh thông báo chiêu thức nổi ở trên giữa màn hình (xếp hàng cho cả người chơi và quái).
 * - Hiển thị 4 ô chiêu thức (màu theo hệ, tiêu hao, hồi chiêu, nhãn "Không mất lượt" cho Buff, lý do mờ khi không dùng được)
 *   + 2 nút cố định: Phổ Công & Rút Lui (khóa khi bị Xích Khóa).
 * - Biểu tượng hiệu ứng trạng thái kèm số hiệp còn lại trên thanh máu + số sát thương nổi + nhật ký trận đấu thu gọn được.
 */
window.TuTien = window.TuTien || {};

window.TuTien.CombatUI = {
  logExpanded: false,
  overlayEl: null,

  getOverlay() {
    if (!this.overlayEl) this.overlayEl = document.getElementById('combat-v2-overlay');
    return this.overlayEl;
  },

  open() {
    this.logExpanded = false;
    const el = this.getOverlay();
    if (el) el.classList.remove('hidden');
    this.render();
  },

  close() {
    const el = this.getOverlay();
    if (el) {
      el.classList.add('hidden');
      el.innerHTML = '';
    }
  },

  renderStatusVisualOverlay(unit) {
    const ids = new Set((unit && unit.statuses || []).map(st => st.id));
    if (!ids.size) return '';
    let html = '';
    if (ids.has('dong_bang')) {
      html += `
        <div class="vfx-layer vfx-frozen">
          <svg viewBox="0 0 120 120" class="vfx-svg">
            <polygon points="60,4 106,28 112,86 60,116 8,86 14,28" fill="rgba(103,232,249,0.34)" stroke="#a5f3fc" stroke-width="3"/>
            <polyline points="22,36 60,18 98,36 88,92 60,108 32,92" fill="none" stroke="rgba(224,242,254,0.8)" stroke-width="2"/>
            <line x1="60" y1="8" x2="60" y2="112" stroke="rgba(224,242,254,0.55)" stroke-width="1.5"/>
          </svg>
        </div>`;
    }
    if (ids.has('thieu_dot')) {
      html += `
        <div class="vfx-layer vfx-burn">
          <svg viewBox="0 0 120 120" class="vfx-svg">
            <path d="M22,104 Q10,74 28,50 Q24,72 36,68 Q34,42 54,18 Q56,48 68,38 Q84,22 86,58 Q102,52 96,104 Z"
                  fill="rgba(249,115,22,0.36)" stroke="#fde047" stroke-width="2.2"/>
          </svg>
        </div>`;
    }
    if (ids.has('dien_giat') || ids.has('tri_hoan') || ids.has('troi_buoc')) {
      html += `
        <div class="vfx-layer vfx-shock">
          <svg viewBox="0 0 120 120" class="vfx-svg">
            <polyline points="24,14 42,42 28,50 48,88" fill="none" stroke="#38bdf8" stroke-width="3.2" stroke-linecap="round"/>
            <polyline points="96,18 76,48 90,56 72,96" fill="none" stroke="#fde047" stroke-width="3.2" stroke-linecap="round"/>
            <polyline points="56,8 66,30 52,38 64,66" fill="none" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>`;
    }
    if (ids.has('xich_khoa')) {
      html += `
        <div class="vfx-layer vfx-chains">
          <svg viewBox="0 0 120 120" class="vfx-svg">
            <line x1="12" y1="26" x2="108" y2="94" stroke="#f43f5e" stroke-width="6" stroke-dasharray="10 6" stroke-linecap="round"/>
            <line x1="108" y1="26" x2="12" y2="94" stroke="#fda4af" stroke-width="4.5" stroke-dasharray="10 6" stroke-linecap="round"/>
            <circle cx="60" cy="60" r="11" fill="rgba(127,29,29,0.85)" stroke="#facc15" stroke-width="2.5"/>
          </svg>
        </div>`;
    }
    if (ids.has('chay_mau') || ids.has('pha_giap')) {
      html += `
        <div class="vfx-layer vfx-bleed">
          <svg viewBox="0 0 120 120" class="vfx-svg">
            <path d="M28,28 Q34,42 28,48 Q22,42 28,28 Z M92,34 Q98,48 92,54 Q86,48 92,34 Z M42,76 Q48,90 42,96 Q36,90 42,76 Z M80,72 Q86,86 80,92 Q74,86 80,72 Z"
                  fill="#ef4444" stroke="#fecaca" stroke-width="1.2"/>
          </svg>
        </div>`;
    }
    if (ids.has('trung_doc')) {
      html += `
        <div class="vfx-layer vfx-poison">
          <svg viewBox="0 0 120 120" class="vfx-svg">
            <circle cx="26" cy="84" r="7" fill="rgba(163,230,53,0.55)" stroke="#d9f99d" stroke-width="1.5"/>
            <circle cx="94" cy="70" r="9" fill="rgba(168,85,247,0.55)" stroke="#e9d5ff" stroke-width="1.5"/>
            <circle cx="34" cy="36" r="6" fill="rgba(163,230,53,0.55)" stroke="#d9f99d" stroke-width="1.5"/>
            <circle cx="84" cy="28" r="5" fill="rgba(168,85,247,0.55)" stroke="#e9d5ff" stroke-width="1.5"/>
          </svg>
        </div>`;
    }
    if (ids.has('tang_cong') || ids.has('ho_the') || ids.has('tang_toc')) {
      html += `<div class="vfx-layer vfx-buff-aura"></div>`;
    }
    return html;
  },

  renderStatusPills(unit) {
    const Status = window.TuTien.Status;
    const list = (unit && unit.statuses) || [];
    const pills = list.map(s => {
      const def = Status.getDef(s.id);
      if (!def) return '';
      return `<span class="c-status-pill" style="border-color:${def.color};color:${def.color}" title="${def.ten}: ${def.moTa}">${def.icon}${s.stacks > 1 ? `×${s.stacks}` : ''} <b>${s.turns}</b></span>`;
    });
    if ((unit.freezeImmunityTurns || 0) > 0) {
      pills.push(`<span class="c-status-pill" style="border-color:#94a3b8;color:#cbd5e1" title="Miễn nhiễm Đóng Băng">🧊Miễn <b>${unit.freezeImmunityTurns}</b></span>`);
    }
    return pills.join('');
  },

  renderBanner() {
    const slot = document.getElementById('combat-skill-banner-slot');
    if (!slot) return;
    const b = window.TuTien.Combat && window.TuTien.Combat.activeBanner;
    if (!b) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = `<div class="combat-skill-banner" style="border-color:${b.color};color:${b.color}">${b.icon} ${b.text}</div>`;
  },

  render() {
    const el = this.getOverlay();
    const Combat = window.TuTien.Combat;
    if (!el || !Combat || !Combat.state) return;

    const s = Combat.state;
    const p = s.player;
    const e = s.enemy;
    const Utils = window.TuTien.Utils;
    const Status = window.TuTien.Status;
    const plane = window.TuTien.Planes ? window.TuTien.Planes.getCurrentPlane() : null;

    const pHpPct = Math.max(0, Math.min(100, (p.currentHp / p.maxHp) * 100));
    const pMpPct = Math.max(0, Math.min(100, (p.currentMp / p.maxMp) * 100));
    const eHpPct = Math.max(0, Math.min(100, (e.currentHp / e.maxHp) * 100));

    const playerSprite = p.gender === 'female' ? 'assets/sprites_walk/nu/nu_di_xuong_01.png' : 'assets/sprites_walk/nam/nam_di_xuong_01.png';
    const enemyBadge = window.TuTien.Expedition ? window.TuTien.Expedition.getCustomEntityBadgeHTML(e, 'pk-big-token') : '';
    const enemyElMeta = (window.TuTien.COMBAT_ELEMENTS && window.TuTien.COMBAT_ELEMENTS[e.he]) || { name: e.he, icon: '⚔️', color: '#fde047' };

    const planeBgUri = plane && plane.id === 'tan_thu_gioi'
      ? (window.TuTien.COMBAT_BG_DATA_URI || plane.bgImage)
      : (plane && window.TuTien.PLANE_BG_DATA_URIS && window.TuTien.PLANE_BG_DATA_URIS[plane.id]) || (plane && plane.bgImage);
    const bgStyle = planeBgUri
      ? `background: linear-gradient(180deg, rgba(12,16,20,0.42) 0%, rgba(10,12,16,0.76) 100%), url('${planeBgUri}') center/cover no-repeat;`
      : `background: ${(plane && plane.bgGradient) || 'radial-gradient(circle at 50% 30%, #16332f, #0a1413)'};`;

    const pFloats = s.floatingDamages.filter(f => f.targetSide === 'player').map(f => `<div class="c-float-dmg ${f.isHeal ? 'heal-float' : f.isAdvantage ? 'adv-float' : ''}">${f.text}</div>`).join('');
    const eFloats = s.floatingDamages.filter(f => f.targetSide === 'enemy').map(f => `<div class="c-float-dmg ${f.isAdvantage ? 'adv-float' : ''}">${f.text}</div>`).join('');

    const fleeBlocked = Status.hasFlag(p, 'blockFlee');

    const skillButtonsHtml = s.skills.map((sk, idx) => {
      if (!sk) {
        return `<button class="pk-action-btn" disabled><strong>Ô Chiêu #${idx + 1}</strong><small>Chưa trang bị</small></button>`;
      }
      const elMeta = (window.TuTien.COMBAT_ELEMENTS && window.TuTien.COMBAT_ELEMENTS[sk.def.he]) || { name: sk.def.he, icon: '✨', color: '#e3b866' };
      const chk = Combat.canUseSkill(sk);
      const isFreeTurn = sk.def.loaiChieu === 'buff' || sk.def.loaiChieu === 'hoi_phuc';
      return `
        <button class="pk-action-btn c-skill-btn" data-skill-idx="${idx}" style="border-color:${elMeta.color}" ${!chk.ok ? 'disabled' : ''}>
          <div style="display:flex;justify-content:space-between;width:100%;font-size:0.68rem;">
            <span style="color:${elMeta.color}">${elMeta.icon} ${elMeta.name}</span>
            ${isFreeTurn ? '<span style="color:#86efac;">⚡ Không mất lượt</span>' : sk.def.uuTien ? '<span style="color:#fde047;">💨 Ưu tiên</span>' : ''}
          </div>
          <strong style="font-size:0.84rem;">${sk.def.ten}</strong>
          <small style="color:${chk.ok ? (chk.powerMult && chk.powerMult < 1 ? '#fde047' : '#7dd3fc') : '#fda4af'}">
            ${chk.ok ? `💧 ${Utils.formatNumber(sk.def.chiPhiLinhLuc)} MP${sk.def.hoiChieu ? ` • CD ${sk.def.hoiChieu}h` : ''}${chk.powerMult && chk.powerMult < 1 ? ' • ⚠️ 15% uy lực' : ''}` : chk.reason}
          </small>
        </button>
      `;
    }).join('');

    el.innerHTML = `
      <div class="pk-arena-shell" style="${bgStyle}">
        <div class="pk-top-row">
          <div class="pk-turn-badge">HIỆP ${s.turn} • ${plane ? plane.ten : ''}</div>
          ${(() => {
            const sup = Combat.getRealmSuppressionInfo ? Combat.getRealmSuppressionInfo() : { diff: 0, label: '' };
            if (!sup.label) return '';
            const col = sup.diff > 0 ? '#86efac' : '#fda4af';
            const bdr = sup.diff > 0 ? 'rgba(74,222,128,0.55)' : 'rgba(244,63,94,0.6)';
            return `<div class="pk-turn-badge" style="color:${col};border-color:${bdr};font-size:0.74rem;margin-left:8px;">${sup.label}</div>`;
          })()}
          <button id="btn-c2-auto" class="btn-ancient-sm ${Combat.autoBattle ? 'affordable' : ''}" style="position:absolute;right:0;">
            ⚡ Tự Động: ${Combat.autoBattle ? 'Bật' : 'Tắt'}
          </button>
        </div>

        <!-- THANH THÔNG BÁO CHIÊU THỨC Ở TRÊN GIỮA MÀN HÌNH -->
        <div id="combat-skill-banner-slot" class="combat-banner-slot"></div>

        <div class="pk-stage">
          <!-- NGƯỜI CHƠI -->
          <div class="pk-side pk-player-side" style="position:relative;">
            ${pFloats}
            <div class="pk-stat-card pk-player-card">
              <div class="pk-card-head">
                <strong>${p.name}</strong>
                <span style="font-size:0.72rem;color:#86efac;">💨 ${Utils.formatNumber(p.speed)}</span>
              </div>
              <div class="pk-bar-track"><div class="pk-bar-fill hp-fill" style="width:${pHpPct.toFixed(1)}%"></div></div>
              <div class="pk-bar-num">❤️ ${Utils.formatNumber(p.currentHp)} / ${Utils.formatNumber(p.maxHp)}</div>
              <div class="pk-bar-track mp-track"><div class="pk-bar-fill mp-fill" style="width:${pMpPct.toFixed(1)}%"></div></div>
              <div class="pk-bar-num" style="color:#7dd3fc;">💧 ${Utils.formatNumber(p.currentMp)} / ${Utils.formatNumber(p.maxMp)}</div>
              <div class="c-status-row">${this.renderStatusPills(p)}</div>
            </div>
            <div class="pk-platform-wrap">
              <div class="pk-vfx-host ${(p.statuses || []).some(st => st.id === 'dong_bang') ? 'unit-is-frozen' : ''}"><img src="${playerSprite}" class="pk-player-sprite" alt="${p.name}" />${this.renderStatusVisualOverlay(p)}</div>
              <div class="pk-platform"></div>
            </div>
          </div>

          <!-- QUÁI / BOSS -->
          <div class="pk-side pk-enemy-side" style="position:relative;">
            ${eFloats}
            <div class="pk-platform-wrap">
              <div class="pk-enemy-sprite-box pk-vfx-host ${(e.statuses || []).some(st => st.id === 'dong_bang') ? 'unit-is-frozen' : ''}">${enemyBadge}${this.renderStatusVisualOverlay(e)}</div>
              <div class="pk-platform enemy-platform"></div>
            </div>
            <div class="pk-stat-card pk-enemy-card">
              <div class="pk-card-head">
                <strong style="color:${e.isBoss ? '#fde047' : '#f7e8c4'}">${e.name}</strong>
                <span style="color:${enemyElMeta.color};font-size:0.72rem;">${enemyElMeta.icon} ${enemyElMeta.name}</span>
              </div>
              <div style="font-size:0.72rem;color:#fca5a5;margin-bottom:4px;">${e.realmName} • 💨 ${Utils.formatNumber(e.speed)}</div>
              <div class="pk-bar-track"><div class="pk-bar-fill enemy-hp-fill" style="width:${eHpPct.toFixed(1)}%"></div></div>
              <div class="pk-bar-num">❤️ ${Utils.formatNumber(e.currentHp)} / ${Utils.formatNumber(e.maxHp)}</div>
              <div class="c-status-row">${this.renderStatusPills(e)}</div>
            </div>
          </div>
        </div>

        <!-- THANH ĐIỀU KHIỂN: 4 CHIÊU + PHỔ CÔNG + RÚT LUI + NHẬT KÝ THU GỌN -->
        <div class="c2-bottom-panel">
          <div class="c2-log-wrap">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:0.75rem;color:var(--bronze-light);font-weight:700;">📜 Nhật Ký Chiến Đấu</span>
              <button id="btn-c2-toggle-log" class="btn-ancient-sm" style="padding:2px 8px;font-size:0.7rem;">${this.logExpanded ? 'Thu gọn ▾' : 'Mở rộng ▴'}</button>
            </div>
            <div class="c2-log-list ${this.logExpanded ? 'expanded' : ''}">
              ${s.logs.slice(this.logExpanded ? -20 : -3).map(l => `<div class="c2-log-line">${l}</div>`).join('')}
            </div>
          </div>

          <div class="c2-controls-wrap">
            <div class="c2-skills-4grid">${skillButtonsHtml}</div>
            <div class="c2-fixed-2col">
              <button id="btn-c2-basic" class="pk-action-btn" ${s.busy || s.ended ? 'disabled' : ''}>
                <strong>⚔️ Phổ Công</strong>
                <small>Miễn phí • +14% MP</small>
              </button>
              <button id="btn-c2-flee" class="pk-action-btn flee-btn" ${s.busy || s.ended || fleeBlocked ? 'disabled' : ''}>
                <strong>🏳️ Rút Lui</strong>
                <small>${fleeBlocked ? '⛓️ Bị Xích Khóa' : 'Về Bản Đồ'}</small>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderBanner();

    document.getElementById('btn-c2-auto').addEventListener('pointerdown', ev => {
      ev.preventDefault();
      Combat.autoBattle = !Combat.autoBattle;
      this.render();
      if (Combat.autoBattle && !s.busy && !s.ended) Combat.scheduleAutoAction();
    });

    document.getElementById('btn-c2-toggle-log').addEventListener('pointerdown', ev => {
      ev.preventDefault();
      this.logExpanded = !this.logExpanded;
      this.render();
    });

    el.querySelectorAll('.c-skill-btn').forEach(btn => {
      btn.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        const sk = s.skills[Number(btn.getAttribute('data-skill-idx'))];
        if (sk) Combat.playerChooseAction('skill', sk);
      });
    });

    document.getElementById('btn-c2-basic').addEventListener('pointerdown', ev => {
      ev.preventDefault();
      Combat.playerChooseAction('basic');
    });

    document.getElementById('btn-c2-flee').addEventListener('pointerdown', ev => {
      ev.preventDefault();
      Combat.playerChooseAction('flee');
    });
  }
};
