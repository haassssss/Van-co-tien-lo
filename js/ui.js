/**
 * js/ui.js
 * Quản lý lớp hiển thị trung tâm:
 * - Bảng chọn Đạo Lộ (☯️ Chính Đạo vs 🩸 Ma Đạo)
 * - Nút "🗡️ Xuất Quan" ở góc trên bên phải mở Bí Cảnh Hồng Hoang
 * - Nút bật/tắt Mô Tả Chi Tiết (`#btn-toggle-detail-desc`) trong Cài Đặt
 */
window.TuTien = window.TuTien || {};

window.TuTien.UI = {
  els: {},
  floatingCount: 0,
  lastArtworkKey: '',
  companionMoodLockUntil: 0,

  STICKER_MAP: {
    male: {
      calm: 'assets/stickers/01_nam_im_lang.png',
      happy: 'assets/stickers/02_nam_vui.png',
      question: 'assets/stickers/03_nam_nghi_van.png',
      angry: 'assets/stickers/04_nam_gian.png',
      sleepy: 'assets/stickers/05_nam_ngu.png'
    },
    female: {
      calm: 'assets/stickers/06_nu_im_lang.png',
      happy: 'assets/stickers/07_nu_vui_thich.png',
      love: 'assets/stickers/15_nu_hanh_phuc.png',
      question: 'assets/stickers/10_nu_nghi_van.png',
      shy: 'assets/stickers/09_nu_boi_roi.png',
      angry: 'assets/stickers/08_nu_gian_doi.png',
      sleepy: 'assets/stickers/06_nu_im_lang.png'
    },
    couple: [
      { src: 'assets/stickers/11_doi_tua_nhau.png', line: 'Đạo lộ vạn năm, có tri kỷ đồng hành thật tốt!' },
      { src: 'assets/stickers/12_doi_cai_nhau.png', line: 'Hừ, viên Tiên Phẩm Đan này là của ta mới đúng!' },
      { src: 'assets/stickers/13_doi_vui_ve.png', line: 'Song tu đắc đạo, linh khí tăng vọt!' },
      { src: 'assets/stickers/14_doi_thanh_thoi.png', line: 'Nghe một khúc Cổ Cầm, lòng nhẹ tựa mây ngàn~' }
    ]
  },

  init() {
    this.els = {
      macroRealmBadge: document.getElementById('macro-realm-badge'),
      realmName: document.getElementById('realm-name'),
      realmTier: document.getElementById('realm-tier'),
      aptitudeBadge: document.getElementById('current-aptitude-badge'),
      rootBadge: document.getElementById('current-root-badge'),
      factionBadge: document.getElementById('current-faction-badge'),
      daoVanBadge: document.getElementById('current-daovan-badge'),
      btnQuickExpedition: document.getElementById('btn-quick-expedition'),
      btnToggleSound: document.getElementById('btn-toggle-sound'),

      hudCombatStatsBar: document.getElementById('hud-combat-stats-bar'),

      qiAmount: document.getElementById('qi-amount'),
      qiRate: document.getElementById('qi-rate'),
      activeMultiplierBadge: document.getElementById('active-multiplier-badge'),
      boostStatusText: document.getElementById('boost-status-text'),

      cultivationStage: document.getElementById('cultivation-stage'),
      cultivatorTarget: document.getElementById('cultivator-target'),
      characterImg: document.getElementById('character-sprite-img'),
      characterFallbackSvg: document.getElementById('character-fallback-svg'),
      fxLayer: document.getElementById('fx-layer'),
      fortuneContainer: document.getElementById('fortune-container'),

      companionBox: document.getElementById('companion-sticker-box'),
      companionImg: document.getElementById('companion-sticker-img'),
      companionSpeech: document.getElementById('companion-speech'),

      progressFill: document.getElementById('qi-progress-fill'),
      progressText: document.getElementById('qi-progress-text'),
      progressPct: document.getElementById('qi-progress-pct'),
      btnBreakthrough: document.getElementById('btn-breakthrough'),
      breakthroughChanceText: document.getElementById('breakthrough-chance-text'),

      btnSettingMusic: document.getElementById('btn-setting-music'),
      btnSettingSfx: document.getElementById('btn-setting-sfx'),
      btnSettingNotif: document.getElementById('btn-setting-notif'),
      btnToggleDetailDesc: document.getElementById('btn-toggle-detail-desc'),
      btnToggleFormat: document.getElementById('btn-toggle-format'),
      btnToggleFx: document.getElementById('btn-toggle-fx'),
      btnSaveNow: document.getElementById('btn-save-now'),
      btnExportSave: document.getElementById('btn-export-save'),
      btnImportSave: document.getElementById('btn-import-save'),
      btnHardReset: document.getElementById('btn-hard-reset'),
      saveTextarea: document.getElementById('save-base64-textarea'),
      logList: document.getElementById('cultivation-log-list'),

      factionOverlay: document.getElementById('faction-select-overlay'),
      btnChooseChinhDao: document.getElementById('btn-choose-chinh-dao'),
      btnChooseMaDao: document.getElementById('btn-choose-ma-dao'),

      modalOverlay: document.getElementById('modal-overlay'),
      modalTitle: document.getElementById('modal-title'),
      modalBody: document.getElementById('modal-body'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      toastContainer: document.getElementById('toast-container')
    };

    this.bindEvents();
    this.updateAll();
    this.checkFactionSelectionModal();
  },

  bindEvents() {
    this.els.cultivatorTarget.addEventListener('pointerdown', e => {
      e.preventDefault();
      const rect = this.els.cultivatorTarget.getBoundingClientRect();
      const x = e.clientX || (rect.left + rect.width / 2);
      const y = e.clientY || (rect.top + rect.height / 2);
      window.TuTien.Cultivate.handleCultivateClick(x, y);
      this.updateRealtimeHUD();
    });

    this.els.btnBreakthrough.addEventListener('pointerdown', e => {
      e.preventDefault();
      window.TuTien.Breakthrough.attemptBreakthrough();
    });

    if (this.els.btnChooseChinhDao) {
      this.els.btnChooseChinhDao.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (this.els.factionOverlay) this.els.factionOverlay.classList.add('hidden');
        window.TuTien.Character.selectFaction('chinh_dao');
      });
    }

    if (this.els.btnChooseMaDao) {
      this.els.btnChooseMaDao.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (this.els.factionOverlay) this.els.factionOverlay.classList.add('hidden');
        window.TuTien.Character.selectFaction('ma_dao');
      });
    }

    if (this.els.factionBadge) {
      this.els.factionBadge.addEventListener('pointerdown', e => {
        e.preventDefault();
        const ch = window.TuTien.State.data.character;
        if (!ch.hasChosenFaction) {
          this.showFactionSelectionModal();
        } else {
          if (window.TuTien.Hotbar) {
            window.TuTien.Hotbar.openPanel('profile');
          }
          this.showToast(
            'Đạo lộ kiếp này đã định! Chỉ khi Luân Hồi Chuyển Sinh mới có thể chọn lại Chính Đạo hoặc Ma Đạo.',
            'info'
          );
        }
      });
    }

    const xqFlyout = document.getElementById('xuat-quan-flyout');
    const btnXqWorld = document.getElementById('btn-xq-world');
    const btnXqMarket = document.getElementById('btn-xq-market');
    if (this.els.btnQuickExpedition) {
      this.els.btnQuickExpedition.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        if (xqFlyout) {
          xqFlyout.classList.toggle('hidden');
        } else if (window.TuTien.Expedition) {
          window.TuTien.Expedition.openModal();
        }
      });
    }
    if (btnXqWorld) {
      btnXqWorld.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        if (xqFlyout) xqFlyout.classList.add('hidden');
        if (window.TuTien.Expedition) window.TuTien.Expedition.openModal();
      });
    }
    const btnXqSect = document.getElementById('btn-xq-sect');
    const btnHotbarShop = document.getElementById('btn-hotbar-shop');
    if (btnXqMarket) {
      btnXqMarket.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        if (xqFlyout) xqFlyout.classList.add('hidden');
        if (window.TuTien.ShopUI) window.TuTien.ShopUI.open();
      });
    }
    if (btnXqSect) {
      btnXqSect.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        if (xqFlyout) xqFlyout.classList.add('hidden');
        this.showToast('🏯 Tông Môn đang bế quan kiến thiết, sẽ sớm khai sơn thu nhận đệ tử!', 'info');
      });
    }
    if (btnHotbarShop) {
      btnHotbarShop.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (window.TuTien.ShopUI) window.TuTien.ShopUI.open();
      });
    }
    document.addEventListener('keydown', e => {
      if (e.key === '8' && !e.target.closest('input, textarea')) {
        if (window.TuTien.ShopUI) window.TuTien.ShopUI.open();
      }
    });
    document.addEventListener('pointerdown', e => {
      if (xqFlyout && !xqFlyout.classList.contains('hidden')) {
        if (!e.target.closest('.xuat-quan-wrap')) {
          xqFlyout.classList.add('hidden');
        }
      }
    });

    if (this.els.btnToggleSound) {
      this.els.btnToggleSound.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (window.TuTien.Audio) window.TuTien.Audio.toggleMusic();
      });
    }

    if (this.els.btnSettingMusic) {
      this.els.btnSettingMusic.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (window.TuTien.Audio) window.TuTien.Audio.toggleMusic();
      });
    }

    if (this.els.btnSettingSfx) {
      this.els.btnSettingSfx.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (window.TuTien.Audio) window.TuTien.Audio.toggleSfx();
      });
    }

    if (this.els.btnSettingNotif) {
      this.els.btnSettingNotif.addEventListener('pointerdown', e => {
        e.preventDefault();
        const settings = window.TuTien.State.data.settings;
        settings.notificationsEnabled = settings.notificationsEnabled === false ? true : false;
        if (window.TuTien.Panels) window.TuTien.Panels.renderSystemPanel();
        window.TuTien.Save.saveToLocal();
      });
    }

    if (this.els.btnToggleDetailDesc) {
      this.els.btnToggleDetailDesc.addEventListener('pointerdown', e => {
        e.preventDefault();
        const settings = window.TuTien.State.data.settings;
        settings.showDetailedDesc = !settings.showDetailedDesc;
        if (window.TuTien.Panels) window.TuTien.Panels.renderSystemPanel();
        this.showToast(
          settings.showDetailedDesc
            ? 'Đã bật hiển thị Mô Tả Chi Tiết trong các bảng!'
            : 'Đã chuyển về chế độ Mô Tả Tóm Tắt gọn gàng!',
          'info'
        );
        window.TuTien.Save.saveToLocal();
      });
    }

    if (this.els.companionBox) {
      this.els.companionBox.addEventListener('pointerdown', e => {
        e.preventDefault();
        const couples = this.STICKER_MAP.couple;
        const pick = couples[Math.floor(Math.random() * couples.length)];
        if (this.els.companionImg) this.els.companionImg.src = pick.src;
        if (this.els.companionSpeech) this.els.companionSpeech.textContent = pick.line;
        this.companionMoodLockUntil = Date.now() + 6000;
      });
    }

    [this.els.aptitudeBadge, this.els.rootBadge, this.els.hudCombatStatsBar].forEach(el => {
      if (!el) return;
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (window.TuTien.Hotbar) {
          window.TuTien.Hotbar.openPanel('profile');
        }
      });
    });

    if (this.els.daoVanBadge) {
      this.els.daoVanBadge.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (window.TuTien.Hotbar) {
          window.TuTien.Hotbar.openPanel('prestige');
        }
      });
    }

    if (this.els.btnToggleFormat) {
      this.els.btnToggleFormat.addEventListener('pointerdown', e => {
        e.preventDefault();
        const settings = window.TuTien.State.data.settings;
        settings.numberFormat = settings.numberFormat === 'hanviet' ? 'short' : 'hanviet';
        this.updateAll();
        window.TuTien.Save.saveToLocal();
      });
    }

    if (this.els.btnToggleFx) {
      this.els.btnToggleFx.addEventListener('pointerdown', e => {
        e.preventDefault();
        const order = ['high', 'medium', 'low', 'off'];
        const settings = window.TuTien.State.data.settings;
        const idx = order.indexOf(settings.fxQuality || 'high');
        settings.fxQuality = order[(idx + 1) % order.length];
        if (window.TuTien.Panels) window.TuTien.Panels.renderSystemPanel();
        window.TuTien.Save.saveToLocal();
      });
    }

    if (this.els.btnSaveNow) {
      this.els.btnSaveNow.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (window.TuTien.Save.saveToLocal()) {
          this.showToast('Đã lưu tiến trình vào bộ nhớ trình duyệt!', 'info');
        }
      });
    }

    if (this.els.btnExportSave) {
      this.els.btnExportSave.addEventListener('pointerdown', e => {
        e.preventDefault();
        const code = window.TuTien.Save.exportBase64();
        this.els.saveTextarea.value = code;
        this.els.saveTextarea.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).catch(() => {});
        }
        this.showToast('Đã xuất mã lưu Base64 (đã sao chép)!', 'success');
      });
    }

    if (this.els.btnImportSave) {
      this.els.btnImportSave.addEventListener('pointerdown', e => {
        e.preventDefault();
        const raw = this.els.saveTextarea.value.trim();
        if (!raw) {
          this.showToast('Vui lòng dán mã Base64 vào ô văn bản trước khi Nhập!', 'warn');
          return;
        }
        if (window.TuTien.Save.importBase64(raw)) {
          this.showToast('Nhập dữ liệu lưu thành công!', 'success');
        } else {
          this.showToast('Mã Base64 không hợp lệ hoặc bị hỏng!', 'warn');
        }
      });
    }

    if (this.els.btnHardReset) {
      this.els.btnHardReset.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.showConfirmResetModal();
      });
    }

    if (this.els.modalCloseBtn) {
      this.els.modalCloseBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.hideModal();
      });
    }
  },

  checkFactionSelectionModal() {
    const ch = window.TuTien.State.data.character;
    if (ch && ch.hasChosenFaction === false) {
      this.showFactionSelectionModal();
    }
  },

  showFactionSelectionModal() {
    if (this.els.factionOverlay) {
      this.els.factionOverlay.classList.remove('hidden');
    }
  },

  setCompanionMood(mood = 'calm', customLine = null) {
    if (!this.els.companionImg || !this.els.companionSpeech) return;
    const gender = window.TuTien.Character ? window.TuTien.Character.getGender() : 'male';
    const set = this.STICKER_MAP[gender] || this.STICKER_MAP.male;

    let src = set[mood] || set.calm;
    if (gender === 'female' && mood === 'happy' && Math.random() < 0.45) {
      src = set.love;
    }

    this.els.companionImg.src = src;
    if (customLine) {
      this.els.companionSpeech.textContent = customLine;
      this.companionMoodLockUntil = Date.now() + 4500;
    }
  },

  updateAutoCompanionMood() {
    if (Date.now() < this.companionMoodLockUntil) return;
    const runtime = window.TuTien.State.runtime;
    const canBreak = window.TuTien.Breakthrough.canAttemptBreakthrough();

    if (canBreak) {
      this.setCompanionMood('happy');
      if (this.els.companionSpeech) {
        this.els.companionSpeech.textContent = 'Linh mạch đã viên mãn, mau đột phá cảnh giới!';
      }
    } else if (runtime.idleTimeSec > 14) {
      const gender = window.TuTien.Character ? window.TuTien.Character.getGender() : 'male';
      if (gender === 'male') {
        this.setCompanionMood('sleepy');
        if (this.els.companionSpeech) {
          this.els.companionSpeech.textContent = 'Zzz... Bế quan tĩnh tọa hấp thu nhật nguyệt...';
        }
      } else {
        if (this.els.companionImg) {
          this.els.companionImg.src = 'assets/stickers/14_doi_thanh_thoi.png';
        }
        if (this.els.companionSpeech) {
          this.els.companionSpeech.textContent = 'Thưởng thức tiếng đàn Cổ Cầm, tâm tĩnh tự nhiên lương~';
        }
      }
    } else {
      this.setCompanionMood('calm');
      if (this.els.companionSpeech) {
        this.els.companionSpeech.textContent = 'Chạm vào ta để đổi biểu cảm, hoặc bấm Xuất Quan góc phải trên!';
      }
    }
  },

  updateCharacterArtwork() {
    if (!this.els.characterImg || !window.TuTien.Character) return;
    const candidates = window.TuTien.Character.getCandidateCharacterImagePaths();
    const key = candidates.join('|');
    if (this.lastArtworkKey === key) return;
    this.lastArtworkKey = key;

    const imgEl = this.els.characterImg;
    const svgEl = this.els.characterFallbackSvg;
    let tryIdx = 0;

    const tryNext = () => {
      if (tryIdx >= candidates.length) {
        imgEl.classList.add('hidden');
        if (svgEl) svgEl.classList.remove('hidden');
        return;
      }
      const path = candidates[tryIdx++];
      imgEl.onload = () => {
        imgEl.classList.remove('hidden');
        if (svgEl) svgEl.classList.add('hidden');
      };
      imgEl.onerror = () => {
        tryNext();
      };
      imgEl.src = path;
    };

    tryNext();
    this.updateAutoCompanionMood();
  },

  updateShopDot() {
    const dot = document.getElementById('dot-shop');
    if (dot && window.TuTien.Shop) {
      dot.classList.toggle('visible', window.TuTien.Shop.hasUnreadNotification());
    }
  },

  updateAll() {
    this.updateShopDot();
    this.updateThemeAndRealmInfo();
    this.updateCharacterArtwork();
    this.updateRealtimeHUD();
    this.renderFortuneOrb();
    if (window.TuTien.Panels) {
      window.TuTien.Panels.refreshActivePanel();
    }
    if (window.TuTien.Hotbar) {
      window.TuTien.Hotbar.updateNotificationDots();
    }
  },

  updateThemeAndRealmInfo() {
    const state = window.TuTien.State;
    const realm = state.getCurrentRealm();
    const root = state.getCurrentRoot();
    const apt = window.TuTien.Character.getCurrentAptitude();
    const factionCfg = window.TuTien.Character.getFactionConfig();
    const fIcon = factionCfg.icon || (factionCfg.id === 'ma_dao' ? '🩸' : '☯️');
    const fColor = factionCfg.color || (factionCfg.id === 'ma_dao' ? '#f43f5e' : '#38bdf8');
    const daoName = (state.data.character && state.data.character.daoName) || 'Vô Danh Đạo Nhân';
    const genderIcon = window.TuTien.Character.getGender() === 'female' ? '♀' : '♂';

    document.documentElement.style.setProperty('--aura-primary', realm.auraColor);
    document.documentElement.style.setProperty('--aura-secondary', realm.auraSecondary);

    const charHeightVh = window.TuTien.CONFIG.characterHeightVh || 58;
    const figWrap = document.querySelector('.character-figure-wrap');
    if (figWrap) {
      figWrap.style.height = `${charHeightVh}vh`;
    }

    this.els.macroRealmBadge.textContent = `${genderIcon} ${daoName} • ${fIcon} ${factionCfg.name} • ${realm.macroRealm}`;
    this.els.realmName.textContent = realm.fullName;
    const fullTierText = `${realm.tierLabel} • ${realm.titlePrefix}`;
    if (this.els.realmTier) {
      let track = this.els.realmTier.querySelector('.plaque-tier-track');
      if (!track) {
        this.els.realmTier.innerHTML = '<span class="plaque-tier-track"></span>';
        track = this.els.realmTier.querySelector('.plaque-tier-track');
      }
      if (track.textContent !== fullTierText) {
        track.textContent = fullTierText;
        track.classList.remove('is-marquee');
        track.style.removeProperty('--marquee-shift');
        requestAnimationFrame(() => {
          const overflow = track.scrollWidth - this.els.realmTier.clientWidth;
          if (overflow > 4) {
            track.style.setProperty('--marquee-shift', `-${overflow + 8}px`);
            track.classList.add('is-marquee');
          }
        });
      }
    }

    if (this.els.aptitudeBadge) {
      this.els.aptitudeBadge.className = `jade-tag ${apt.cssClass}`;
      this.els.aptitudeBadge.style.borderColor = apt.color;
      this.els.aptitudeBadge.innerHTML = `✦ Tư chất: <strong style="color:${apt.color}">${apt.name}</strong> <small>(x${apt.multiplier})</small>`;
    }

    if (this.els.factionBadge) {
      this.els.factionBadge.style.borderColor = fColor;
      this.els.factionBadge.innerHTML = `${fIcon} <strong style="color:${fColor}">${factionCfg.name}</strong> <small>(x${factionCfg.cultivateSpeedMult})</small>`;
    }

    if (this.els.rootBadge) {
      this.els.rootBadge.innerHTML = `${root.icon} <strong>${root.name}</strong>`;
      this.els.rootBadge.style.borderColor = root.color;
    }
    this.els.daoVanBadge.innerHTML = `☯️ Đạo Vận: <strong>${window.TuTien.Utils.formatNumber(state.data.prestige.daoVan)}</strong>`;
  },

  updateRealtimeHUD() {
    const buffHud = document.getElementById('active-timed-buffs-hud');
    if (buffHud && window.TuTien.Alchemy) {
      const list = window.TuTien.Alchemy.getActiveBuffSummary().list;
      if (list.length === 0) {
        buffHud.innerHTML = '';
      } else {
        buffHud.innerHTML = list.map(b => `<span class="timed-buff-chip" style="border-color:${b.color}">${b.icon} ${b.name} <strong>${Math.ceil(b.remainingMs / 1000)}s</strong></span>`).join('');
      }
    }
    const Utils = window.TuTien.Utils;
    const State = window.TuTien.State;
    const Cultivate = window.TuTien.Cultivate;
    const Breakthrough = window.TuTien.Breakthrough;
    const Fields = window.TuTien.Fields;

    const realm = State.getCurrentRealm();
    const nextRealm = State.getNextRealm();
    const qi = State.data.qi;
    const req = realm.qiRequired;
    const rate = Cultivate.getEffectiveRatePerSec();
    const clickPwr = Cultivate.getClickPower();
    const cStats = window.TuTien.Character.getCombatStats();

    this.els.qiAmount.textContent = Utils.formatNumber(qi);
    this.els.qiRate.textContent = `+${Utils.formatNumber(rate)} / giây`;

    if (this.els.hudCombatStatsBar) {
      this.els.hudCombatStatsBar.innerHTML = `
        <span class="cs-inline hp">❤️ Máu: <strong>${Utils.formatNumber(cStats.maxHp)}</strong></span>
        <span class="cs-sep">❖</span>
        <span class="cs-inline mp">💧 Linh Lực: <strong>${Utils.formatNumber(cStats.maxMp)}</strong></span>
        <span class="cs-sep">❖</span>
        <span class="cs-inline spd">💨 Tốc Độ: <strong>${Utils.formatNumber(cStats.speed)}</strong></span>
        <span class="cs-sep">❖</span>
        <span class="cs-inline atk">⚔️ Sức Mạnh: <strong>${Utils.formatNumber(cStats.attack)}</strong></span>
      `;
    }

    const activeMult = Cultivate.getCurrentActiveMultiplier();
    if (State.runtime.boostRemainingMs > 0) {
      this.els.activeMultiplierBadge.textContent = `⚡ Vận Công x${activeMult.toFixed(2)} (+${Utils.formatNumber(clickPwr)}/chạm)`;
      this.els.activeMultiplierBadge.classList.add('active');
      this.els.cultivationStage.classList.add('boosting');
    } else {
      this.els.activeMultiplierBadge.textContent = `+${Utils.formatNumber(clickPwr)} / chạm`;
      this.els.activeMultiplierBadge.classList.remove('active');
      this.els.cultivationStage.classList.remove('boosting');
    }

    const buffNotes = [];
    const buffs = State.data.fields.buffs;
    if (buffs.pillBoostRemainingMs > 0) {
      buffNotes.push(`🟢 Đan x${buffs.pillBoostMultiplier || 1.5} (${(buffs.pillBoostRemainingMs / 1000).toFixed(0)}s)`);
    }
    if (buffs.combatBuffRemainingMs > 0) {
      buffNotes.push(`🔴 Chiến Lực x${buffs.combatBuffMultiplier || 1.45} (${(buffs.combatBuffRemainingMs / 1000).toFixed(0)}s)`);
    }
    if (buffs.hpBuffRemainingMs > 0) {
      buffNotes.push(`🔵 Cường Huyết x${buffs.hpBuffMultiplier || 1.4} (${(buffs.hpBuffRemainingMs / 1000).toFixed(0)}s)`);
    }
    if (buffs.talismanRemainingMs > 0) {
      buffNotes.push(`📜 Phù x${buffs.talismanMultiplier || 1.8} (${(buffs.talismanRemainingMs / 1000).toFixed(0)}s)`);
    }
    if (buffs.antiLightningSkipChance > 0) {
      buffNotes.push(`⚡ Tị Lôi Phù (${Math.round(buffs.antiLightningSkipChance * 100)}%)`);
    }
    if (State.data.fields.activeFieldId) {
      const fDef = window.TuTien.FIELDS.find(f => f.id === State.data.fields.activeFieldId);
      if (fDef) buffNotes.push(`🛠️ ${fDef.name}`);
    }
    this.els.boostStatusText.textContent = buffNotes.join(' • ');

    const ratio = Utils.clamp(qi / req, 0, 1);
    const pct = (ratio * 100).toFixed(1);
    this.els.progressFill.style.width = `${pct}%`;
    this.els.progressText.textContent = `Linh Mạch: ${Utils.formatNumber(qi)} / ${Utils.formatNumber(req)}`;
    this.els.progressPct.textContent = `${pct}%`;

    const canBreak = Breakthrough.canAttemptBreakthrough();
    this.els.btnBreakthrough.disabled = !canBreak;
    this.els.btnBreakthrough.classList.toggle('ready', !!canBreak);

    if (!nextRealm) {
      this.els.breakthroughChanceText.textContent = 'Đã đạt Đỉnh Phong Vạn Cổ Chí Tôn (100/${window.TuTien.REALMS.length})';
      this.els.btnBreakthrough.textContent = '✨ Viên Mãn';
    } else {
      const chancePct = Math.round(Breakthrough.getSuccessChance() * 100);
      const willTriggerThunder = Breakthrough.requiresLightningTribulation(State.data.realmIndex);
      const factionName = window.TuTien.Character.getFactionConfig().name;

      this.els.breakthroughChanceText.textContent = willTriggerThunder
        ? `⚡ Đại Cảnh Giới lên 【${nextRealm.fullName}】 • Thành công: ${chancePct}% (Có Cửu Thiên Lôi Kiếp!)`
        : `Tiểu cảnh giới lên 【${nextRealm.fullName}】 • Thành công: ${chancePct}% (${factionName})`;

      this.els.btnBreakthrough.textContent = willTriggerThunder
        ? '⚡ Độ Kiếp Đại Cảnh Giới'
        : '✦ Đột Phá Cảnh Giới';
    }

    const activeId = State.data.fields.activeFieldId;
    if (activeId) {
      const fState = Fields.getFieldState(activeId);
      const reqExp = Fields.getExpRequiredForNextRank(fState.rank);
      const expPct = fState.rank >= 9 ? 100 : Utils.clamp((fState.exp / reqExp) * 100, 0, 100);
      const fillEl = document.getElementById(`field-exp-fill-${activeId}`);
      const txtEl = document.getElementById(`field-exp-text-${activeId}`);
      if (fillEl) fillEl.style.width = `${expPct.toFixed(1)}%`;
      if (txtEl) {
        txtEl.textContent =
          fState.rank >= 9
            ? 'Viên Mãn'
            : `${Utils.formatNumber(fState.exp)}/${Utils.formatNumber(reqExp)}`;
      }
    }

    this.updateAutoCompanionMood();
  },

  renderUpgradesPanel() {
    if (window.TuTien.Panels) window.TuTien.Panels.renderUpgradesPanel();
  },

  renderFieldsPanel() {
    if (window.TuTien.Panels) window.TuTien.Panels.renderFieldsPanel();
  },

  renderPrestigePanel() {
    if (window.TuTien.Panels) window.TuTien.Panels.renderPrestigePanel();
  },

  renderRoadmapPanel() {
    if (window.TuTien.Panels) window.TuTien.Panels.renderRoadmapPanel();
  },

  renderAchievementsAndSettings() {
    if (window.TuTien.Panels) window.TuTien.Panels.renderSystemPanel();
  },

  renderFortuneOrb() {
    const fortune = window.TuTien.State.runtime.activeFortune;
    this.els.fortuneContainer.innerHTML = '';
    if (!fortune) return;

    const btn = document.createElement('button');
    btn.className = 'fortune-orb';
    btn.style.left = `${fortune.xPct}%`;
    btn.style.top = `${fortune.yPct}%`;
    const t = fortune.type || {};
    btn.innerHTML =
      `<span class="fortune-icon">${t.icon || '✨'}</span>` +
      `<span class="fortune-name">${t.name || 'Cơ Duyên'}</span>` +
      `<span class="fortune-timer">${Math.ceil(fortune.remainingMs / 1000)}s</span>`;

    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      const rect = btn.getBoundingClientRect();
      window.TuTien.Events.claimFortune(rect.left + rect.width / 2, rect.top);
    });

    this.els.fortuneContainer.appendChild(btn);
  },

  updateFortuneOrbTimer() {
    const fortune = window.TuTien.State.runtime.activeFortune;
    const el = this.els.fortuneContainer && this.els.fortuneContainer.querySelector('.fortune-timer');
    if (fortune && el) el.textContent = `${Math.ceil(fortune.remainingMs / 1000)}s`;
  },

  // ---- Các hàm tương thích mà module khác đang gọi ----
  spawnClickParticles(x, y) {
    if (window.TuTien.Effects) window.TuTien.Effects.spawnClickEffect(x, y);
  },

  triggerCultivatorPulse() {
    this.triggerClickPulse();
  },

  triggerBreakthroughFlash() {
    this.triggerStageEffect('breakthrough-flash');
  },

  renderAchievements() {
    this.renderAchievementsAndSettings();
  },

  renderUpgrades() {
    this.renderUpgradesPanel();
  },

  updateHeaderAndStats() {
    this.updateThemeAndRealmInfo();
    this.updateRealtimeHUD();
    if (window.TuTien.Hotbar) window.TuTien.Hotbar.updateNotificationDots();
  },

  showOfflinePopup(effectiveSec, wasCapped, gainedQi, fieldsInfo) {
    this.showOfflineModal(effectiveSec, effectiveSec, gainedQi, fieldsInfo);
  },

  renderLogs() {
    if (!this.els.logList) return;
    const logs = window.TuTien.State.runtime.logs;
    this.els.logList.innerHTML = logs
      .slice(0, 18)
      .map(
        l =>
          `<div class="log-entry ${l.type}"><span class="log-time">[${l.time}]</span> ${l.message}</div>`
      )
      .join('');
  },

  triggerClickPulse() {
    this.els.cultivationStage.classList.remove('pulse-hit');
    void this.els.cultivationStage.offsetWidth;
    this.els.cultivationStage.classList.add('pulse-hit');
  },

  triggerStageEffect(className) {
    this.els.cultivationStage.classList.remove('breakthrough-flash', 'breakthrough-fail');
    void this.els.cultivationStage.offsetWidth;
    this.els.cultivationStage.classList.add(className);
    setTimeout(() => {
      this.els.cultivationStage.classList.remove(className);
    }, 900);
  },

  spawnFloatingText(x, y, text, extraClass = '') {
    const quality = window.TuTien.State.data.settings.fxQuality || 'high';
    if (quality === 'off') return;
    if (this.floatingCount >= window.TuTien.CONFIG.maxFloatingTexts) return;

    this.floatingCount += 1;
    const el = document.createElement('div');
    el.className = `floating-qi-text ${extraClass}`;
    const jitterX = window.TuTien.Utils.randomInt(-24, 24);
    const jitterY = window.TuTien.Utils.randomInt(-12, 12);
    el.style.left = `${x + jitterX}px`;
    el.style.top = `${y + jitterY}px`;
    el.textContent = text;

    this.els.fxLayer.appendChild(el);
    setTimeout(() => {
      el.remove();
      this.floatingCount = Math.max(0, this.floatingCount - 1);
    }, 950);
  },

  showToast(message, type = 'info', mood = null) {
    if (mood === 'happy' || type === 'success') {
      this.setCompanionMood('happy', message);
    } else if (mood === 'angry' || type === 'warn') {
      this.setCompanionMood('angry', message);
    }

    const settings = window.TuTien.State.data && window.TuTien.State.data.settings;
    if (settings && settings.notificationsEnabled === false) {
      return;
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const gender = window.TuTien.Character ? window.TuTien.Character.getGender() : 'male';
    const set = this.STICKER_MAP[gender] || this.STICKER_MAP.male;
    const iconSrc =
      type === 'success' ? set.happy : type === 'warn' ? set.angry : set.question;

    toast.innerHTML = `
      <img src="${iconSrc}" alt="" class="toast-sticker" />
      <span>${message}</span>
    `;

    this.els.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('fade-out'), 2900);
    setTimeout(() => toast.remove(), 3200);
  },

  showOfflineModal(awaySec, effectiveSec, gainedQi, fieldsOfflineResult = null) {
    const Utils = window.TuTien.Utils;
    this.els.modalTitle.textContent = '🌙 Thu Hoạch Bế Quan Tĩnh Tọa';

    let extraHtml = '';
    if (fieldsOfflineResult) {
      if (fieldsOfflineResult.herbsGained > 0) {
        extraHtml += `<br/>🌿 Linh Điền kết trái: <strong style="color:#4ade80">+${Utils.formatNumber(fieldsOfflineResult.herbsGained)} Linh Thảo</strong>`;
      }
      if (fieldsOfflineResult.expGained > 0 && fieldsOfflineResult.activeFieldName) {
        extraHtml += `<br/>🛠️ Lĩnh vực 【${fieldsOfflineResult.activeFieldName}】: <strong style="color:#38bdf8">+${Utils.formatNumber(fieldsOfflineResult.expGained)} EXP</strong>`;
      }
    }

    this.els.modalBody.innerHTML = `
      Thời gian rời động phủ: <strong>${Utils.formatDuration(awaySec)}</strong><br/>
      Thời gian hấp thụ hiệu quả: <strong>${Utils.formatDuration(effectiveSec)}</strong><br/><br/>
      Linh khí thu hoạch: <strong class="gold-highlight" style="font-size:1.15rem;">+${Utils.formatNumber(gainedQi)} Linh Khí</strong>
      ${extraHtml}
    `;
    this.els.modalOverlay.classList.remove('hidden');
  },

  showConfirmPrestigeModal(pendingDaoVan) {
    const Utils = window.TuTien.Utils;
    const nextPref = window.TuTien.State.data.character.nextPrestigeGender || 'toggle';
    const curGender = window.TuTien.Character.getGender();
    const targetGenderText =
      nextPref === 'male'
        ? 'Nam Đạo Sĩ'
        : nextPref === 'female'
        ? 'Nữ Tiên Tử'
        : nextPref === 'random'
        ? 'Ngẫu nhiên Nam / Nữ'
        : curGender === 'male'
        ? 'Nữ Tiên Tử'
        : 'Nam Đạo Sĩ';

    this.els.modalTitle.textContent = '☯️ Xác Nhận Bước Vào Luân Hồi';
    this.els.modalBody.innerHTML = `
      Chuyển sinh kiếp này sẽ:<br/>
      • Nhận ngay <strong class="gold-highlight">+${Utils.formatNumber(pendingDaoVan)} Đạo Vận</strong><br/>
      • Cho phép chọn lại <strong>☯️ Chính Đạo</strong> hoặc <strong>🩸 Ma Đạo</strong> ở kiếp mới<br/>
      • Tái tạo thân xác mới (<strong>${targetGenderText}</strong>), ngẫu nhiên <strong>Tư Chất, Linh Căn & Năng Khiếu mới</strong><br/>
      • Giữ lại <strong>20% tổng EXP Bách Nghệ</strong>, chỉ số Đan Dược vĩnh viễn và toàn bộ Bí Tịch/Đan Phương đã mở khóa.<br/><br/>
      <button id="btn-confirm-prestige-yes" class="btn-ancient-wide ready">Xác Nhận Luân Hồi Chuyển Sinh</button>
    `;
    this.els.modalOverlay.classList.remove('hidden');

    const confirmBtn = document.getElementById('btn-confirm-prestige-yes');
    if (confirmBtn) {
      confirmBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.hideModal();
        window.TuTien.Prestige.performPrestige();
      });
    }
  },

  showConfirmResetModal() {
    this.els.modalTitle.textContent = '⚠️ Xóa Toàn Bộ Tiến Trình';
    this.els.modalBody.innerHTML = `
      Bạn có chắc chắn muốn xóa toàn bộ dữ liệu tu luyện và bắt đầu lại từ Phàm Nhân không?<br/><br/>
      <button id="btn-confirm-reset-yes" class="btn-ancient-sm" style="border-color:#e11d48;color:#fda4af;padding:8px 18px;">Xác Nhận Xóa Vĩnh Viễn</button>
    `;
    this.els.modalOverlay.classList.remove('hidden');

    const yesBtn = document.getElementById('btn-confirm-reset-yes');
    if (yesBtn) {
      yesBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.hideModal();
        window.TuTien.Save.hardReset();
      });
    }
  },

  hideModal() {
    this.els.modalOverlay.classList.add('hidden');
  }
};
