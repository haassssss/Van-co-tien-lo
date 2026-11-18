/**
 * js/hotbar.js
 * Quản lý Menu Chính thu gọn / bung ra ở dưới màn hình với 7 mục chuẩn:
 * (1. Công Pháp, 2. Lĩnh Vực, 3. Túi Đồ, 4. Luân Hồi, 5. Cảnh Giới, 6. Hồ Sơ, 7. Hệ Thống).
 * Nút "🗡️ Xuất Quan" được đặt riêng duy nhất ở góc trên bên phải màn hình theo đúng yêu cầu.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Hotbar = {
  activePanelId: null,
  menuExpanded: false,
  mainMenuBtn: null,
  mainMenuDot: null,
  subMenuWrap: null,
  buttons: [],
  drawerBackdrop: null,
  drawerContainer: null,
  drawerTitleEl: null,
  drawerCloseBtn: null,
  panels: [],

  PANEL_TITLES: {
    upgrades: 'Tàng Kinh Các — Lĩnh Ngộ & Thăng Phẩm Công Pháp',
    fields: 'Bách Nghệ Tiên Đạo — Đan • Khí • Phù • Điền',
    inventory: 'Túi Trữ Vật — Pháp Bảo • Đan Dược • Phù Văn • Linh Thảo',
    prestige: 'Đài Luân Hồi — Chuyển Sinh & Nghịch Thiên Đổi Mệnh',
    roadmap: 'Thiên Địa Đạo Lộ — 100 Cảnh Giới Tu Chân',
    profile: 'Ngọc Giản Mệnh Cách — Hồ Sơ Nhân Vật & Chỉ Số Chiến Đấu',
    system: 'Động Phủ Bảo Điển — Thành Tựu & Cài Đặt'
  },

  init() {
    this.mainMenuBtn = document.getElementById('btn-main-menu-toggle');
    this.mainMenuDot = document.getElementById('dot-main-menu');
    this.subMenuWrap = document.getElementById('hotbar-submenu-wrap');
    this.buttons = Array.from(document.querySelectorAll('.hotbar-slot'));
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
    this.drawerContainer = document.getElementById('jade-drawer');
    this.drawerTitleEl = document.getElementById('jade-drawer-title');
    this.drawerCloseBtn = document.getElementById('jade-drawer-close');
    this.panels = Array.from(document.querySelectorAll('.drawer-panel-content'));

    this.bindEvents();
    this.updateNotificationDots();
  },

  bindEvents() {
    if (this.mainMenuBtn) {
      this.mainMenuBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.toggleMainMenu();
      });
    }

    this.buttons.forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-panel');
        this.togglePanel(targetId);
      });
    });

    if (this.drawerCloseBtn) {
      this.drawerCloseBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.closeAll();
      });
    }

    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('pointerdown', e => {
        if (e.target === this.drawerBackdrop) {
          e.preventDefault();
          this.closeAll();
        }
      });
    }

    window.addEventListener('keydown', e => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (window.TuTien.Tribulation && window.TuTien.Tribulation.active) return;
      if (window.TuTien.CraftingMinigame && window.TuTien.CraftingMinigame.active) return;

      if (e.key === 'Escape') {
        if (window.TuTien.Expedition && window.TuTien.Expedition.isOpen) {
          window.TuTien.Expedition.closeModal();
          return;
        }
        if (this.activePanelId) {
          this.closeAll();
        } else if (this.menuExpanded) {
          this.toggleMainMenu(false);
        }
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        this.toggleMainMenu();
        return;
      }

      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= this.buttons.length) {
        const btn = this.buttons[keyNum - 1];
        if (btn) {
          if (!this.menuExpanded) this.toggleMainMenu(true);
          const panelId = btn.getAttribute('data-panel');
          this.togglePanel(panelId);
        }
      }
    });
  },

  toggleMainMenu(forceState = null) {
    this.menuExpanded = forceState !== null ? forceState : !this.menuExpanded;
    if (this.subMenuWrap) {
      this.subMenuWrap.classList.toggle('collapsed', !this.menuExpanded);
    }
    if (this.mainMenuBtn) {
      this.mainMenuBtn.classList.toggle('expanded', this.menuExpanded);
      const labelEl = this.mainMenuBtn.querySelector('.menu-toggle-label');
      if (labelEl) {
        labelEl.textContent = this.menuExpanded ? '✕ Thu Gọn Menu' : '☰ Menu Đạo Lộ';
      }
    }
    if (!this.menuExpanded && this.activePanelId) {
      this.closeAll();
    }
  },

  togglePanel(panelId) {
    if (this.activePanelId === panelId) {
      this.closeAll();
    } else {
      this.openPanel(panelId);
    }
  },

  openPanel(panelId) {
    if (!this.menuExpanded) {
      this.toggleMainMenu(true);
    }

    this.activePanelId = panelId;

    this.buttons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-panel') === panelId);
    });

    this.panels.forEach(p => {
      p.classList.toggle('active', p.id === `panel-${panelId}`);
    });

    if (this.drawerTitleEl) {
      this.drawerTitleEl.textContent = this.PANEL_TITLES[panelId] || 'Ngọc Giản Tu Tiên';
    }

    if (this.drawerBackdrop) {
      this.drawerBackdrop.classList.remove('hidden');
    }
    if (this.drawerContainer) {
      this.drawerContainer.classList.add('open');
    }

    if (window.TuTien.Panels) {
      window.TuTien.Panels.onPanelOpened(panelId);
    }
  },

  closeAll() {
    this.activePanelId = null;
    this.buttons.forEach(btn => btn.classList.remove('active'));
    if (this.drawerContainer) {
      this.drawerContainer.classList.remove('open');
    }
    if (this.drawerBackdrop) {
      this.drawerBackdrop.classList.add('hidden');
    }
  },

  updateNotificationDots() {
    const State = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const Prestige = window.TuTien.Prestige;
    const Inv = window.TuTien.Inventory;
    if (!State || !State.data) return;

    const canBuyUpgrade = window.TuTien.UPGRADES.some(
      u => Upgrades.canAfford(u) || Upgrades.canRefineQuality(u.id)
    );
    this.setDot('upgrades', canBuyUpgrade);

    const fieldsData = State.data.fields;
    const pillCdReady = Inv ? Inv.getRemainingCooldownSec('pill') <= 0 : true;
    const hasTuLinhThao = Inv ? Inv.getHerbCountById('tu_linh_thao') >= 3 : false;
    const canCraftBasicPill = hasTuLinhThao && pillCdReady;
    const noActiveField = !fieldsData.activeFieldId;
    this.setDot('fields', noActiveField || canCraftBasicPill);

    const bagItems = Inv ? Inv.getBagData().items : [];
    const hasUsableConsumable = bagItems.some(
      it => (it.category === 'pill' || it.category === 'talisman') && it.count > 0
    );
    this.setDot('inventory', hasUsableConsumable);

    const canPrestigeNow = Prestige.canPrestige();
    const canBuyPrestigeUp = window.TuTien.PRESTIGE_UPGRADES.some(pu =>
      Upgrades.canAffordPrestige(pu)
    );
    this.setDot('prestige', canPrestigeNow || canBuyPrestigeUp);

    const anyNotif =
      canBuyUpgrade ||
      noActiveField ||
      canCraftBasicPill ||
      hasUsableConsumable ||
      canPrestigeNow ||
      canBuyPrestigeUp;
    if (this.mainMenuDot) {
      this.mainMenuDot.classList.toggle('visible', anyNotif);
    }
  },

  setDot(panelId, visible) {
    const dot = document.getElementById(`dot-${panelId}`);
    if (dot) {
      dot.classList.toggle('visible', !!visible);
    }
  }
};
