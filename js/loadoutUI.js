/**
 * js/loadoutUI.js
 * Giao diện Chiến Kỹ (4 ô trang bị) & Danh sách 24 Công Pháp Chiến Đấu (mua học, thăng phẩm 'linh_khi', xem 'co_dinh').
 * Nhúng được cả vào sub-tab Công Pháp lẫn mở riêng dưới dạng popup từ Xuất Quan.
 */
window.TuTien = window.TuTien || {};

window.TuTien.LoadoutUI = {
  activeSlotIdx: 0,
  sortMode: 'grade_desc', // 'grade_desc' | 'grade_asc' | 'name_asc'

  openModal() {
    const ov = document.getElementById('loadout-modal-overlay');
    const body = document.getElementById('loadout-modal-body');
    if (!ov || !body) return;
    ov.classList.remove('hidden');
    this.renderInto(body);
    const closeBtn = document.getElementById('loadout-modal-close');
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('pointerdown', e => { e.preventDefault(); ov.classList.add('hidden'); });
    }
  },

  getShortSkillSummary(t, gr) {
    const mult = (gr && gr.mult) || 1;
    const statusMap = window.TuTien.STATUS_EFFECTS || {};
    const effParts = (t.hieuUng || []).map(e => {
      const sDef = statusMap[e.id];
      const sName = sDef ? sDef.ten : e.id;
      return `${sName} ${e.soHiep}h`;
    });

    const parts = [];
    if (t.loaiChieu === 'tan_cong') {
      const dmgMult = ((t.heSoSatThuong || 1) * mult).toFixed(2).replace(/\.00$/, '');
      parts.push(`⚔️ Đánh x${dmgMult}`);
    } else if (t.loaiChieu === 'hoi_phuc') {
      const hpPct = Math.round((t.healPct || 0.15) * 100 * Math.min(1.5, 1 + (mult - 1) * 0.5));
      parts.push(`💚 Hồi ${hpPct}% HP`);
      if (t.giaiTru) parts.push('Giải debuff');
    } else if (t.loaiChieu === 'buff') {
      parts.push('🛡️ Buff bản thân');
    } else {
      if (t.heSoSatThuong > 0) {
        const dmgMult = (t.heSoSatThuong * mult).toFixed(2).replace(/\.00$/, '');
        parts.push(`🌀 Đánh x${dmgMult}`);
      } else {
        parts.push('🌀 Khống chế');
      }
    }
    if (t.lifestealPct) parts.push(`🩸 Hút ${Math.round(t.lifestealPct * 100)}% máu`);
    if (t.shieldPct) parts.push(`🛡️ Khiên ${Math.round(t.shieldPct * 100)}%`);
    if (effParts.length) parts.push(effParts.join(', '));
    if (t.uuTien) parts.push('Đánh trước');
    if (t.hoiChieu > 0) parts.push(`CD ${t.hoiChieu}h`);
    return parts.join(' • ');
  },

  renderInto(container) {
    if (!container) return;
    const Tech = window.TuTien.Techniques;
    const Loadout = window.TuTien.Loadout;
    const Utils = window.TuTien.Utils;
    const slots = Loadout.ensureState();
    const locked = Loadout.isLocked();
    const passives = Loadout.getActivePassiveBonuses();
    const pRealmIdx = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.realmIndex) || 0;

    const slotsHtml = slots.map((id, idx) => {
      const def = id ? Tech.getDef(id) : null;
      const tier = id ? Tech.getGradeTier(id) : 1;
      const gr = Tech.getGradeObj(tier);
      const elMeta = def && window.TuTien.COMBAT_ELEMENTS[def.he] ? window.TuTien.COMBAT_ELEMENTS[def.he] : { icon: '✨', color: '#94a3b8', name: '' };
      return `
        <div class="loadout-slot-box ${this.activeSlotIdx === idx ? 'selected-slot' : ''}" data-slot="${idx}" style="border-color:${def ? gr.color : 'rgba(227,184,102,0.3)'}">
          <div style="font-size:0.68rem;color:var(--ivory-muted);">Ô Chiến Kỹ #${idx + 1}</div>
          <strong style="color:${def ? gr.color : '#94a3b8'};font-size:0.84rem;">${def ? `${elMeta.icon} ${def.ten}` : 'Trống'}</strong>
          <div style="font-size:0.7rem;color:#86efac;">${def ? `${gr.name} • ${def.buffDiKem.label}` : 'Chọn bên dưới'}</div>
        </div>
      `;
    }).join('');

    const showDetail = window.TuTien.Panels && window.TuTien.Panels.isDetailedMode();
    const sortedTechs = (window.TuTien.COMBAT_TECHNIQUES || []).slice().sort((a, b) => {
      const la = Tech.isLearned(a.id) ? 1 : 0;
      const lb = Tech.isLearned(b.id) ? 1 : 0;
      if (la !== lb) return lb - la; // Đã học xếp trên, chưa học (???) xếp dưới
      if (this.sortMode === 'name_asc') {
        return (a.ten || '').localeCompare(b.ten || '', 'vi');
      }
      const ta = Tech.getGradeTier(a.id) || a.phamGiaiKhoiDau || 1;
      const tb = Tech.getGradeTier(b.id) || b.phamGiaiKhoiDau || 1;
      if (this.sortMode === 'grade_asc') {
        return ta !== tb ? ta - tb : (a.ten || '').localeCompare(b.ten || '', 'vi');
      }
      return ta !== tb ? tb - ta : (a.ten || '').localeCompare(b.ten || '', 'vi');
    });

    const listHtml = sortedTechs.map(t => {
      const learned = Tech.isLearned(t.id);
      if (!learned) {
        return `
          <div class="jade-card locked-card" style="border-left:3px solid #64748b;padding:7px 10px;">
            <div class="jade-card-body">
              <strong style="color:#94a3b8;font-size:0.86rem;">🔒 ???</strong>
              ${showDetail ? `<div style="font-size:0.72rem;color:var(--ivory-muted);">Nguồn: ${t.nguon} (Tự kiếm, không thể mua bằng Linh Khí)</div>` : ''}
            </div>
            <span class="jade-badge">Chưa có</span>
          </div>
        `;
      }

      const tier = Tech.getGradeTier(t.id) || t.phamGiaiKhoiDau;
      const gr = Tech.getGradeObj(tier);
      const elMeta = (window.TuTien.COMBAT_ELEMENTS && window.TuTien.COMBAT_ELEMENTS[t.he]) || { icon: '⚔️', name: t.he, color: '#fde047' };
      const equippedIdx = slots.indexOf(t.id);
      const isFreeTurn = t.loaiChieu === 'buff' || t.loaiChieu === 'hoi_phuc';
      const useInfo = Tech.getUsability(t.id, pRealmIdx);
      const isRealmLocked = !useInfo.canUse;
      const isWeakened = useInfo.status === 'weakened';

      const statusBadgeHtml = isRealmLocked
        ? `<span class="jade-badge" style="color:#fda4af;border-color:rgba(244,63,94,0.5);">🔒 ${useInfo.label}</span>`
        : isWeakened
          ? `<span class="jade-badge" style="color:#fde047;border-color:rgba(250,204,21,0.5);">⚠️ 15% uy lực</span>`
          : `<span class="jade-badge" style="color:${gr.color};">${gr.name}</span>`;

      const actionsHtml = `
        <button class="btn-ancient-sm ${equippedIdx !== -1 ? '' : (!isRealmLocked ? 'affordable' : '')} btn-equip-ctech" data-id="${t.id}" ${(locked || isRealmLocked) ? 'disabled' : ''}>
          ${isRealmLocked ? '🔒 Cảnh giới thấp' : (equippedIdx !== -1 ? `⚡ Ô #${equippedIdx + 1}` : `Gắn Ô #${this.activeSlotIdx + 1}`)}
        </button>
        ${statusBadgeHtml}
      `;

      return `
        <div class="jade-card" style="border-left:3px solid ${elMeta.color};padding:7px 10px;">
          <div class="jade-card-body">
            <div class="jade-card-head">
              <strong style="color:${gr.color};font-size:0.86rem;">${elMeta.icon} ${t.ten} <small>[${gr.name}]</small></strong>
              <span class="jade-badge" style="color:${elMeta.color}">${elMeta.name} • ${Utils.formatNumber(t.chiPhiLinhLuc)} MP</span>
            </div>
            <div style="font-size:0.73rem;color:${showDetail ? 'var(--ivory-muted)' : '#fde68a'};margin:2px 0;">${showDetail ? t.moTa : this.getShortSkillSummary(t, gr)}</div>
            <div style="font-size:0.73rem;color:#86efac;">✦ ${t.buffDiKem.label}${isFreeTurn ? ' • ⚡ Không mất lượt' : ''}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;min-width:120px;align-items:flex-end;">
            ${actionsHtml}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      ${locked ? `<div class="scroll-box" style="border-color:#f43f5e;color:#fda4af;margin-bottom:8px;">🔒 Đang trong trận chiến — Không thể đổi 4 ô Chiến Kỹ lúc này!</div>` : ''}
      <div class="scroll-box" style="margin-bottom:10px;">
        <div style="font-size:0.8rem;font-weight:700;color:var(--bronze-light);margin-bottom:6px;">⚔️ 4 Ô Trang Bị Chiến Kỹ (Bấm chọn 1 ô rồi chọn Công Pháp bên dưới)</div>
        <div class="loadout-4slots-grid">${slotsHtml}</div>
        <div style="font-size:0.74rem;color:#86efac;margin-top:8px;">
          <strong>Tổng Buff đi kèm đang kích hoạt:</strong> ${passives.labels.length ? passives.labels.join(' • ') : 'Chưa có'}
        </div>
      </div>
      <div class="loadout-sort-bar">
        <span style="font-size:0.74rem;color:var(--ivory-muted);">Sắp xếp:</span>
        <button class="btn-ancient-sm btn-sort-ctech ${this.sortMode === 'grade_desc' ? 'affordable' : ''}" data-sort="grade_desc">🌟 Phẩm cao → thấp</button>
        <button class="btn-ancient-sm btn-sort-ctech ${this.sortMode === 'grade_asc' ? 'affordable' : ''}" data-sort="grade_asc">🔽 Phẩm thấp → cao</button>
        <button class="btn-ancient-sm btn-sort-ctech ${this.sortMode === 'name_asc' ? 'affordable' : ''}" data-sort="name_asc">🔤 Tên A → Z</button>
      </div>
      <div class="jade-cards-stack">${listHtml}</div>
    `;

    container.querySelectorAll('.loadout-slot-box').forEach(el => {
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.activeSlotIdx = Number(el.getAttribute('data-slot'));
        this.renderInto(container);
      });
    });
    container.querySelectorAll('.btn-learn-ctech').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (Tech.buyLearn(btn.getAttribute('data-id'))) this.renderInto(container);
      });
    });
    container.querySelectorAll('.btn-sort-ctech').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.sortMode = btn.getAttribute('data-sort') || 'grade_desc';
        this.renderInto(container);
      });
    });
    container.querySelectorAll('.btn-equip-ctech').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (Loadout.equipToSlot(this.activeSlotIdx, btn.getAttribute('data-id'))) this.renderInto(container);
      });
    });
    container.querySelectorAll('.btn-up-ctech').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (Tech.upgradeGrade(btn.getAttribute('data-id'))) this.renderInto(container);
      });
    });
  }
};
