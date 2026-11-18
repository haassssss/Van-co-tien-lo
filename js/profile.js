/**
 * js/profile.js
 * Hiển thị bảng "Hồ Sơ Nhân Vật" tinh gọn chuẩn phong cách Ngọc Giản Tu Tiên:
 * - Đạo hiệu, Giới tính, Đạo Lộ (☯️ Chính Đạo / 🩸 Ma Đạo)
 * - 4 Chỉ Số Chiến Đấu (❤️ Máu, 💧 Linh Lực, 💨 Tốc Độ, ⚔️ Sức Mạnh)
 * - Tư chất, Linh Căn, 8 Lĩnh Vực Bách Nghệ, Thống kê và Thành tựu
 */
window.TuTien = window.TuTien || {};

window.TuTien.Profile = {
  containerEl: null,

  init() {
    this.containerEl = document.getElementById('profile-content');
    this.render();
  },

  render() {
    if (!this.containerEl) {
      this.containerEl = document.getElementById('profile-content');
    }
    if (!this.containerEl) return;

    const Utils = window.TuTien.Utils;
    const State = window.TuTien.State;
    const Character = window.TuTien.Character;
    const Fields = window.TuTien.Fields;
    const showDetail = !!(State.data.settings && State.data.settings.showDetailedDesc);

    const realm = State.getCurrentRealm();
    const highestRealm =
      window.TuTien.REALMS[
        Utils.clamp(State.data.stats.highestRealmIndex || 0, 0, window.TuTien.REALMS.length - 1)
      ];
    const summary = Character.getAggregatedStats();
    const apt = summary.aptitude;
    const root = summary.root;
    const faction = summary.faction;
    const fIcon = faction.icon || (faction.id === 'ma_dao' ? '🩸' : '☯️');
    const fColor = faction.color || (faction.id === 'ma_dao' ? '#f43f5e' : '#38bdf8');
    const fTitle = faction.title || faction.subtitle || '';
    const cStats = summary.combatStats || summary.combat;
    const rerollCost = Character.getRerollAptitudeCost();
    const canReroll = State.data.prestige.daoVan >= rerollCost;

    const qiRatio = Utils.clamp(State.data.qi / realm.qiRequired, 0, 1);
    const qiPct = (qiRatio * 100).toFixed(1);
    const currentImgSrc =
      (document.getElementById('character-sprite-img') &&
        document.getElementById('character-sprite-img').getAttribute('src')) ||
      (summary.gender === 'female' ? 'assets/char_female.png' : 'assets/char_male.png');

    const fieldsHtml = window.TuTien.FIELDS.map(fDef => {
      const fState = Fields.getFieldState(fDef.id);
      const talentObj = Fields.getFieldTalentObj(fDef.id);
      const reqExp = Fields.getExpRequiredForNextRank(fState.rank);
      const expPct =
        fState.rank >= 9 ? 100 : Utils.clamp((fState.exp / reqExp) * 100, 0, 100);
      const rankTitle = Fields.getFieldRankTitle(fDef, fState.rank);

      return `
        <div class="profile-field-row">
          <div class="pf-left">
            <span class="pf-icon">${fDef.icon}</span>
            <div>
              <div class="pf-name">${fDef.name} <span class="pf-rank-badge">${rankTitle}</span></div>
              <div class="pf-talent" style="color:${talentObj.color}">
                Năng khiếu: <strong>${talentObj.name} (x${talentObj.multiplier})</strong>
              </div>
            </div>
          </div>
          <div class="pf-right">
            <div class="pf-exp-label">
              ${fState.rank >= 9 ? 'Viên Mãn' : `${Utils.formatNumber(fState.exp)}/${Utils.formatNumber(reqExp)}`}
            </div>
            <div class="pf-exp-track">
              <div class="pf-exp-fill" style="width:${expPct.toFixed(1)}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const unlockedAch = window.TuTien.ACHIEVEMENTS.filter(
      a => State.data.achievements && State.data.achievements[a.id]
    );
    const unlockedHtml =
      unlockedAch.length > 0
        ? unlockedAch
            .map(
              a =>
                `<span class="profile-ach-chip" title="${a.desc}">🏆 ${a.name} (${a.rewardText})</span>`
            )
            .join('')
        : '<span class="muted-label">Chưa mở khóa thành tựu nào.</span>';

    this.containerEl.innerHTML = `
      <div class="profile-hero-card">
        <div class="profile-avatar-circle" style="border-color:${realm.auraColor}">
          <img src="${currentImgSrc}" alt="Chân dung tu sĩ" onerror="this.style.display='none';this.parentElement.textContent='${summary.avatar}';" />
        </div>
        <div style="flex:1;">
          <div class="workshop-header-row" style="margin-bottom:4px;">
            <div>
              <span class="jade-card-title" style="font-size:1.1rem;">${summary.daoName}</span>
              <span class="jade-badge" style="margin-left:6px;">
                ${summary.gender === 'female' ? '♀ Nữ Tiên Tử' : '♂ Nam Đạo Sĩ'}
              </span>
              <span class="jade-badge" style="margin-left:4px;color:${fColor};border-color:${fColor};">
                ${fIcon} ${faction.name}
              </span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              <button id="btn-edit-daoname" class="btn-ancient-sm">✏️ Đổi Hiệu</button>
              <button id="btn-toggle-gender" class="btn-ancient-sm">🔄 Nam / Nữ</button>
            </div>
          </div>
          <div style="color:${realm.auraColor};font-size:0.84rem;margin-bottom:4px;">
            <strong>${realm.fullName}</strong> • ${realm.tierLabel} • <span style="color:${fColor}">${fTitle}</span>
          </div>
          <div class="jade-progress-track" style="height:7px;margin-bottom:3px;">
            <div class="jade-progress-fill" style="width:${qiPct}%"></div>
          </div>
          <div class="muted-label">Linh mạch: ${Utils.formatNumber(State.data.qi)} / ${Utils.formatNumber(realm.qiRequired)} (${qiPct}%)</div>
        </div>
      </div>

      <h4 class="ancient-section-title">⚔️ Tứ Đại Chỉ Số Chiến Đấu</h4>
      <div class="combat-stats-four-grid">
        <div class="combat-stat-box hp-box">
          <span class="cs-label">❤️ MÁU</span>
          <strong class="cs-val">${Utils.formatNumber(cStats.maxHp)}</strong>
        </div>
        <div class="combat-stat-box mp-box">
          <span class="cs-label">💧 LINH LỰC</span>
          <strong class="cs-val">${Utils.formatNumber(cStats.maxMp)}</strong>
        </div>
        <div class="combat-stat-box spd-box">
          <span class="cs-label">💨 TỐC ĐỘ</span>
          <strong class="cs-val">${Utils.formatNumber(cStats.speed)}</strong>
        </div>
        <div class="combat-stat-box atk-box">
          <span class="cs-label">⚔️ SỨC MẠNH</span>
          <strong class="cs-val">${Utils.formatNumber(cStats.attack)}</strong>
        </div>
      </div>

      <div class="profile-two-col">
        <div class="profile-subcard">
          <div class="muted-label">TƯ CHẤT THIÊN PHÚ</div>
          <div class="jade-card-title ${apt.cssClass}" style="color:${apt.color};margin:3px 0;">
            ✦ ${apt.name} (Bậc ${apt.tier}/6 • x${apt.multiplier})
          </div>
          ${showDetail ? `<p class="jade-card-desc">${apt.description}</p>` : `<div class="jade-card-effect">Nhân x${apt.multiplier} tốc độ hấp thụ & EXP Bách Nghệ</div>`}
          <button id="btn-profile-reroll-apt" class="btn-ancient-sm ${canReroll ? 'affordable' : ''}" style="width:100%;margin-top:6px;" ${!canReroll ? 'disabled' : ''}>
            🔮 Đổi Mệnh (${rerollCost} Đạo Vận)
          </button>
        </div>

        <div class="profile-subcard">
          <div class="muted-label">TIÊN THIÊN LINH CĂN</div>
          <div class="jade-card-title" style="color:${root.color};margin:3px 0;">
            ${root.icon} ${root.name} <small>(${root.rarity})</small>
          </div>
          ${showDetail ? `<p class="jade-card-desc">${root.description}</p>` : ''}
          <div class="jade-card-effect">${root.bonusText}</div>
        </div>
      </div>

      <h4 class="ancient-section-title">📊 Chỉ Số Tu Luyện & Lĩnh Vực</h4>
      <div class="profile-stats-grid" style="margin-bottom:8px;">
        <div class="stat-tile">
          <span class="muted-label">Hấp thụ nền</span>
          <strong>${Utils.formatNumber(summary.passiveRate)} / giây</strong>
        </div>
        <div class="stat-tile">
          <span class="muted-label">Mỗi lần chạm</span>
          <strong>+${Utils.formatNumber(summary.clickPower)}</strong>
        </div>
        <div class="stat-tile">
          <span class="muted-label">Trảm Yêu / Tán Tu</span>
          <strong>${State.data.stats.monstersDefeated || 0} Yêu • ${State.data.stats.roguesDefeated || 0} Tán Tu</strong>
        </div>
        <div class="stat-tile">
          <span class="muted-label">Cảnh giới cao nhất</span>
          <strong>${highestRealm.fullName} (${highestRealm.orderNumber}/100)</strong>
        </div>
      </div>

      <div class="profile-fields-list">
        ${fieldsHtml}
      </div>

      <h4 class="ancient-section-title">🏆 Thành Tựu (${unlockedAch.length}/${window.TuTien.ACHIEVEMENTS.length})</h4>
      <div class="profile-ach-wrap">
        ${unlockedHtml}
      </div>
    `;

    this.bindProfileActions();
  },

  bindProfileActions() {
    const btnEditName = document.getElementById('btn-edit-daoname');
    if (btnEditName) {
      btnEditName.addEventListener('pointerdown', e => {
        e.preventDefault();
        const current = window.TuTien.State.data.character.daoName || 'Vô Danh Đạo Nhân';
        const input = window.prompt('Nhập Đạo Hiệu mới của bạn (tối đa 24 ký tự):', current);
        if (input !== null) {
          window.TuTien.Character.setDaoName(input);
        }
      });
    }

    const btnToggleGender = document.getElementById('btn-toggle-gender');
    if (btnToggleGender) {
      btnToggleGender.addEventListener('pointerdown', e => {
        e.preventDefault();
        const nextG = window.TuTien.Character.getGender() === 'male' ? 'female' : 'male';
        window.TuTien.Character.setGender(nextG);
      });
    }

    const btnReroll = document.getElementById('btn-profile-reroll-apt');
    if (btnReroll) {
      btnReroll.addEventListener('pointerdown', e => {
        e.preventDefault();
        window.TuTien.Character.rerollAptitude();
      });
    }
  }
};
