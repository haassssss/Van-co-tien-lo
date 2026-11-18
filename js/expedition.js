/**
 * js/expedition.js
 * TÍNH NĂNG "XUẤT QUAN — BẢN ĐỒ TÂN THỦ" (CHẾ ĐỘ CHƠI ĐƠN OFFLINE)
 * - Giao diện phóng to toàn màn hình (96vw × 94vh), thanh công cụ tóm gọn 1 dòng duy nhất kèm nút thu gọn "📊 Chỉ Số ▾".
 * - Quái (Yêu Thú) & Tu Sĩ (Tán Tu) spawn tọa độ (X, Y) ngẫu nhiên; khi đánh thắng/thua sẽ TỰ ĐỘNG THOÁT POPUP ra bản đồ và thông báo chiến lợi phẩm.
 * - Bí Cảnh Ngẫu Nhiên chia 5 Cấp Độ (Hạ Phẩm -> Tiên Phẩm Thái Cổ), đếm ngược thời gian thực mỗi khung hình qua hàm update(dtMs).
 */
window.TuTien = window.TuTien || {};

window.TuTien.Expedition = {
  MAP_WIDTH: 1120,
  MAP_HEIGHT: 1490,
  ACTIVE_MOB_COUNT: 8,

  isOpen: false,
  statsDropdownOpen: false,
  cursorX: 560,
  cursorY: 745,

  // Trạng thái trượt cảm ứng / kéo bản đồ
  isDraggingMap: false,
  dragMoved: false,
  dragStartX: 0,
  dragStartY: 0,
  dragStartScrollLeft: 0,
  dragStartScrollTop: 0,

  // Máu và Linh lực hiện tại của nhân vật trong phiên Xuất Quan
  playerCurrentHp: null,
  playerCurrentMp: null,

  // Danh sách các bãi Quái & Tu Sĩ đang sinh ra ngẫu nhiên trên bản đồ
  mobSpots: [],
  selectedMobId: null,
  combatRunning: false,

  // Trạng thái Bí Cảnh Ngẫu Nhiên 5 Cấp Độ
  secretRealm: null,
  nextSecretSpawnMs: 7000, // Lần đầu xuất hiện sau 7 giây
  lastLootBannerHtml: '',

  overlayEl: null,
  mapScrollEl: null,
  mapCanvasEl: null,
  coordDisplayEl: null,
  anomalyBannerEl: null,
  secretTimerChipEl: null,
  statsPopoverEl: null,
  mobsLayerEl: null,
  secretLayerEl: null,
  popupOverlayEl: null,
  bagModalEl: null,
  forgeModalEl: null,

  // ===========================================================================
  // PHẦN 1: DỮ LIỆU MẪU QUÁI & TU SĨ (SPAWN NGẪU NHIÊN) + 5 CẤP ĐỘ BÍ CẢNH
  // ===========================================================================

  MOB_POOL_DEFS: [
    {
      poolId: 'mob_yeu_lang',
      entityType: 'monster',
      svgKey: 'wolf',
      name: 'Thanh Phong Yêu Lang',
      realm: 'Luyện Khí Tầng 1',
      realmLevel: 1,
      maxHp: 65,
      maxMp: 30,
      attack: 6,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'go_linh_moc', name: 'Thiết Mộc (Gỗ)', icon: '🌲', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.78, minQty: 1, maxQty: 2, maxTier: 2 },
        { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.65, minQty: 1, maxQty: 2, maxTier: 2 },
        { id: 'tu_linh_thao', name: 'Tụ Linh Thảo', icon: '🌿', category: 'herb', typeLabel: 'Nguyên liệu Luyện Đan', chance: 0.72, minQty: 1, maxQty: 2, maxTier: 2 }
      ]
    },
    {
      poolId: 'mob_tan_tu_nam',
      entityType: 'cultivator',
      gender: 'male',
      svgKey: 'cultivator_male',
      name: 'Lục Thủy Kiếm Khách',
      realm: 'Luyện Khí Tầng 2',
      realmLevel: 2,
      maxHp: 115,
      maxMp: 55,
      attack: 11,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.80, minQty: 1, maxQty: 2, maxTier: 2 },
        { id: 'go_linh_moc', name: 'Thiết Mộc (Gỗ)', icon: '🌲', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.65, minQty: 1, maxQty: 2, maxTier: 2 },
        { id: 'pha_chuong_qua', name: 'Phá Chướng Quả', icon: '🌺', category: 'herb', typeLabel: 'Nguyên liệu Luyện Đan', chance: 0.55, minQty: 1, maxQty: 2, maxTier: 2 }
      ]
    },
    {
      poolId: 'mob_doc_xa',
      entityType: 'monster',
      svgKey: 'snake',
      name: 'Bích Lân Độc Xà',
      realm: 'Luyện Khí Tầng 3',
      realmLevel: 3,
      maxHp: 175,
      maxMp: 75,
      attack: 16,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'da_khoang', name: 'Thanh Linh Thạch (Đá)', icon: '⛰️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.75, minQty: 1, maxQty: 2, maxTier: 3 },
        { id: 'go_linh_moc', name: 'Thiết Mộc (Gỗ)', icon: '🌲', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.60, minQty: 1, maxQty: 2, maxTier: 3 },
        { id: 'huyet_ngoc_sam', name: 'Huyết Ngọc Sâm', icon: '🍄', category: 'herb', typeLabel: 'Nguyên liệu Luyện Đan', chance: 0.58, minQty: 1, maxQty: 2, maxTier: 3 }
      ]
    },
    {
      poolId: 'mob_huyet_lang',
      entityType: 'monster',
      svgKey: 'wolf',
      name: 'Huyết Nguyệt Ma Lang',
      realm: 'Luyện Khí Tầng 4',
      realmLevel: 4,
      maxHp: 255,
      maxMp: 95,
      attack: 23,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.80, minQty: 1, maxQty: 3, maxTier: 3 },
        { id: 'da_khoang', name: 'Thanh Linh Thạch (Đá)', icon: '⛰️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.70, minQty: 1, maxQty: 2, maxTier: 3 },
        { id: 'huyet_ngoc_sam', name: 'Huyết Ngọc Sâm', icon: '🍄', category: 'herb', typeLabel: 'Nguyên liệu Luyện Đan', chance: 0.65, minQty: 1, maxQty: 2, maxTier: 3 }
      ]
    },
    {
      poolId: 'mob_thach_tinh',
      entityType: 'monster',
      svgKey: 'golem',
      name: 'Huyền Nham Thạch Tinh',
      realm: 'Luyện Khí Tầng 5',
      realmLevel: 5,
      maxHp: 350,
      maxMp: 120,
      attack: 30,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'da_khoang', name: 'Thanh Linh Thạch (Đá)', icon: '⛰️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.85, minQty: 2, maxQty: 3, maxTier: 3 },
        { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.72, minQty: 1, maxQty: 3, maxTier: 3 },
        { id: 'vang_tinh_kim', name: 'Thái Ất Tinh Kim (Vàng)', icon: '🌕', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo Quý', chance: 0.42, minQty: 1, maxQty: 1, maxTier: 3 },
        { id: 'loi_tam_thao', name: 'Lôi Tâm Thảo', icon: '⚡', category: 'herb', typeLabel: 'Nguyên liệu Luyện Đan', chance: 0.50, minQty: 1, maxQty: 2, maxTier: 3 }
      ]
    },
    {
      poolId: 'mob_tan_tu_nu',
      entityType: 'cultivator',
      gender: 'female',
      svgKey: 'cultivator_female',
      name: 'Bích Nguyệt Tiên Tử',
      realm: 'Luyện Khí Tầng 6',
      realmLevel: 6,
      maxHp: 520,
      maxMp: 165,
      attack: 44,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'vang_tinh_kim', name: 'Thái Ất Tinh Kim (Vàng)', icon: '🌕', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo Quý', chance: 0.62, minQty: 1, maxQty: 2, maxTier: 4 },
        { id: 'go_linh_moc', name: 'Thiết Mộc (Gỗ)', icon: '🌲', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.75, minQty: 2, maxQty: 3, maxTier: 4 },
        { id: 'han_bang_tuyet_lien', name: 'Hàn Băng Tuyết Liên', icon: '❄️', category: 'herb', typeLabel: 'Linh Thảo Hiếm', chance: 0.48, minQty: 1, maxQty: 2, maxTier: 4 }
      ]
    },
    {
      poolId: 'mob_hac_hung',
      entityType: 'monster',
      svgKey: 'bear',
      name: 'Thiết Giáp Hắc Hùng',
      realm: 'Luyện Khí Tầng 7',
      realmLevel: 7,
      maxHp: 740,
      maxMp: 210,
      attack: 62,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.85, minQty: 2, maxQty: 3, maxTier: 4 },
        { id: 'da_khoang', name: 'Thanh Linh Thạch (Đá)', icon: '⛰️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.80, minQty: 2, maxQty: 3, maxTier: 4 },
        { id: 'vang_tinh_kim', name: 'Thái Ất Tinh Kim (Vàng)', icon: '🌕', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo Quý', chance: 0.65, minQty: 1, maxQty: 2, maxTier: 4 },
        { id: 'xich_viem_chu_qua', name: 'Xích Viêm Chu Quả', icon: '🔥', category: 'herb', typeLabel: 'Linh Thảo Hiếm', chance: 0.50, minQty: 1, maxQty: 2, maxTier: 4 }
      ]
    },
    {
      poolId: 'mob_ma_tu',
      entityType: 'cultivator',
      gender: 'male',
      svgKey: 'cultivator_male',
      name: 'Huyết Ảnh Tán Nhân',
      realm: 'Luyện Khí Tầng 8',
      realmLevel: 8,
      maxHp: 980,
      maxMp: 260,
      attack: 78,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'vang_tinh_kim', name: 'Thái Ất Tinh Kim (Vàng)', icon: '🌕', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo Quý', chance: 0.78, minQty: 1, maxQty: 3, maxTier: 4 },
        { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.85, minQty: 2, maxQty: 3, maxTier: 4 },
        { id: 'xich_viem_chu_qua', name: 'Xích Viêm Chu Quả', icon: '🔥', category: 'herb', typeLabel: 'Linh Thảo Hiếm', chance: 0.55, minQty: 1, maxQty: 2, maxTier: 4 }
      ]
    },
    {
      poolId: 'mob_huyet_ho',
      entityType: 'monster',
      svgKey: 'tiger',
      name: 'Xích Viêm Yêu Hổ',
      realm: 'Luyện Khí Tầng 9',
      realmLevel: 9,
      maxHp: 1280,
      maxMp: 320,
      attack: 96,
      respawnSec: 5,
      hiddenDrops: [
        { id: 'vang_tinh_kim', name: 'Thái Ất Tinh Kim (Vàng)', icon: '🌕', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo Quý', chance: 0.90, minQty: 2, maxQty: 4, maxTier: 5 },
        { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.85, minQty: 2, maxQty: 4, maxTier: 5 },
        { id: 'da_khoang', name: 'Thanh Linh Thạch (Đá)', icon: '⛰️', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.85, minQty: 2, maxQty: 4, maxTier: 5 },
        { id: 'go_linh_moc', name: 'Thiết Mộc (Gỗ)', icon: '🌲', category: 'material', typeLabel: 'Nguyên liệu Pháp Bảo', chance: 0.85, minQty: 2, maxQty: 4, maxTier: 5 },
        { id: 'cuu_chuyen_tien_chi', name: 'Cửu Chuyển Tiên Chi', icon: '👑', category: 'herb', typeLabel: 'Thần Dược Luyện Đan', chance: 0.42, minQty: 1, maxQty: 1, maxTier: 5 }
      ]
    }
  ],

  /**
   * 5 CẤP ĐỘ BÍ CẢNH NGẪU NHIÊN
   */
  SECRET_REALM_TIERS: [
    {
      tier: 1,
      rankLabel: 'Cấp 1 • Hạ Phẩm',
      names: ['Thanh Lâm Cổ Động', 'Linh Tuyền Tiểu Cảnh', 'Bích Thảo Động Phủ'],
      color: '#4ade80',
      bgGradient: 'linear-gradient(135deg, #064e3b, #14532d)',
      recommendRealm: 'Luyện Khí Tầng 1–3',
      weight: 35,
      guardianName: 'Mộc Linh Hộ Vệ',
      guardianHp: 110,
      guardianAtk: 10,
      stoneReward: [20, 45],
      qiMult: 1.5,
      matQty: [1, 2],
      goldChance: 0.25,
      maxItemTier: 2
    },
    {
      tier: 2,
      rankLabel: 'Cấp 2 • Trung Phẩm',
      names: ['Hàn Đàm Kiếm Trủng', 'Bích Thủy Linh Cốc', 'Uẩn Linh Thạch Động'],
      color: '#38bdf8',
      bgGradient: 'linear-gradient(135deg, #0c4a6e, #1e3a8a)',
      recommendRealm: 'Luyện Khí Tầng 3–5',
      weight: 28,
      guardianName: 'Hàn Băng Kiếm Linh',
      guardianHp: 260,
      guardianAtk: 24,
      stoneReward: [45, 90],
      qiMult: 2.6,
      matQty: [2, 3],
      goldChance: 0.55,
      maxItemTier: 3
    },
    {
      tier: 3,
      rankLabel: 'Cấp 3 • Thượng Phẩm',
      names: ['Tử Tiêu Lôi Phủ', 'Vạn Kiếm Cổ Mộ', 'Đan Hà Bí Cảnh'],
      color: '#c084fc',
      bgGradient: 'linear-gradient(135deg, #4c1d95, #701a75)',
      recommendRealm: 'Luyện Khí Tầng 5–7',
      weight: 20,
      guardianName: 'Tử Lôi Khôi Lỗi',
      guardianHp: 560,
      guardianAtk: 48,
      stoneReward: [95, 180],
      qiMult: 4.2,
      matQty: [2, 4],
      goldChance: 0.85,
      maxItemTier: 4
    },
    {
      tier: 4,
      rankLabel: 'Cấp 4 • Cực Phẩm',
      names: ['Thái Hư Tiên Điện', 'Cửu Diệu Tinh Cung', 'Long Mạch Cổ Quật'],
      color: '#facc15',
      bgGradient: 'linear-gradient(135deg, #713f12, #9a3412)',
      recommendRealm: 'Luyện Khí Tầng 7–9',
      weight: 12,
      guardianName: 'Kim Giáp Thần Tướng',
      guardianHp: 960,
      guardianAtk: 78,
      stoneReward: [180, 320],
      qiMult: 6.5,
      matQty: [3, 5],
      goldChance: 1.0,
      maxItemTier: 4
    },
    {
      tier: 5,
      rankLabel: 'Cấp 5 • Tiên Phẩm Thái Cổ',
      names: ['Hồng Hoang Thần Điện', 'Vạn Cổ Đế Mộ', 'Cửu Thiên Hỗn Độn Cung'],
      color: '#f43f5e',
      bgGradient: 'linear-gradient(135deg, #7f1d1d, #4c0519)',
      recommendRealm: 'Luyện Khí Viên Mãn / Trúc Cơ+',
      weight: 5,
      guardianName: 'Thái Cổ Huyết Ma Tượng',
      guardianHp: 1550,
      guardianAtk: 115,
      stoneReward: [350, 600],
      qiMult: 10.0,
      matQty: [4, 7],
      goldChance: 1.0,
      maxItemTier: 5
    }
  ],

  generateRandomCoord(existingSpots, realmLevel = 5) {
    const minY = realmLevel <= 3 ? 720 : realmLevel <= 6 ? 360 : 160;
    const maxY = realmLevel <= 3 ? 1350 : realmLevel <= 6 ? 1080 : 680;
    let bestX = 300;
    let bestY = 850;

    for (let attempt = 0; attempt < 30; attempt++) {
      const candidateX = Math.floor(140 + Math.random() * (this.MAP_WIDTH - 280));
      const candidateY = Math.floor(minY + Math.random() * (maxY - minY));
      bestX = candidateX;
      bestY = candidateY;

      const tooClose = (existingSpots || []).some(sp => {
        if (!sp || sp.x === undefined) return false;
        return Math.hypot(sp.x - candidateX, sp.y - candidateY) < 135;
      });
      if (!tooClose) break;
    }

    return { x: bestX, y: bestY };
  },

  spawnAllRandomMobs() {
    const spots = [];
    const shuffledPool = [...this.MOB_POOL_DEFS].sort(() => Math.random() - 0.5);
    const chosenDefs = shuffledPool.slice(0, this.ACTIVE_MOB_COUNT).sort((a, b) => a.realmLevel - b.realmLevel);

    chosenDefs.forEach((def, idx) => {
      const coord = this.generateRandomCoord(spots, def.realmLevel);
      spots.push({
        ...def,
        id: `rand_mob_${idx}_${Date.now()}`,
        x: coord.x,
        y: coord.y,
        currentHp: def.maxHp,
        currentMp: def.maxMp,
        isDead: false,
        respawnRemainingMs: 0
      });
    });

    this.mobSpots = spots;
  },

  respawnSingleMobAtRandomSpot(mob, index) {
    const candidates = this.MOB_POOL_DEFS.filter(d => Math.abs(d.realmLevel - mob.realmLevel) <= 1);
    const newDef = candidates[Math.floor(Math.random() * candidates.length)] || mob;
    const otherSpots = this.mobSpots.filter((_, i) => i !== index);
    const newCoord = this.generateRandomCoord(otherSpots, newDef.realmLevel);

    Object.assign(mob, {
      ...newDef,
      id: mob.id,
      x: newCoord.x,
      y: newCoord.y,
      currentHp: newDef.maxHp,
      currentMp: newDef.maxMp,
      isDead: false,
      respawnRemainingMs: 0
    });
  },

  rollSecretRealmTier() {
    const totalWeight = this.SECRET_REALM_TIERS.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * totalWeight;
    for (const t of this.SECRET_REALM_TIERS) {
      r -= t.weight;
      if (r <= 0) return t;
    }
    return this.SECRET_REALM_TIERS[0];
  },

  getCustomEntityBadgeHTML(mob) {
    if (mob.entityType === 'cultivator') {
      const spritePath =
        mob.gender === 'female'
          ? 'assets/sprites_walk/nu/nu_di_xuong_01.png'
          : 'assets/sprites_walk/nam/nam_di_xuong_01.png';
      const ringColor = mob.gender === 'female' ? '#f472b6' : '#38bdf8';

      return `
        <div class="xianxia-token cultivator-token" style="--token-accent:${ringColor}">
          <svg class="token-frame-svg" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" fill="rgba(18, 28, 36, 0.92)" stroke="${ringColor}" stroke-width="2" />
            <circle cx="32" cy="32" r="25" fill="none" stroke="#e3b866" stroke-width="1" stroke-dasharray="4 3" />
            <path d="M32 2 L36 9 L28 9 Z M32 62 L36 55 L28 55 Z M2 32 L9 36 L9 28 Z M62 32 L55 36 L55 28 Z" fill="#e3b866" />
          </svg>
          <img src="${spritePath}" class="token-cultivator-img" alt="${mob.name}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
          <svg class="token-fallback-svg" style="display:none" viewBox="0 0 64 64">
            <path d="M32 12 L42 28 L37 50 L27 50 L22 28 Z" fill="${ringColor}" opacity="0.85" />
            <circle cx="32" cy="20" r="7" fill="#f7e8c4" />
          </svg>
          <span class="token-type-pill">⚔️ Tu Sĩ</span>
        </div>
      `;
    }

    const svgMap = {
      wolf: {
        accent: '#4ade80',
        art: `
          <polygon points="32,11 47,22 44,44 32,53 20,44 17,22" fill="#132a22" stroke="#4ade80" stroke-width="1.6"/>
          <path d="M18,14 L26,25 L20,30 Z M46,14 L38,25 L44,30 Z" fill="#86efac"/>
          <path d="M22,24 L32,19 L42,24 L39,42 L32,49 L25,42 Z" fill="#1e3a2f" stroke="#bbf7d0" stroke-width="1.2"/>
          <polygon points="25,30 30,32 26,35" fill="#fde047"/>
          <polygon points="39,30 34,32 38,35" fill="#fde047"/>
          <polygon points="30,42 34,42 32,46" fill="#f87171"/>
        `
      },
      snake: {
        accent: '#a855f7',
        art: `
          <circle cx="32" cy="32" r="21" fill="#231433" stroke="#c084fc" stroke-width="1.5"/>
          <path d="M22,44 C16,34 24,24 32,26 C40,28 44,18 32,14 C25,14 23,20 28,22" fill="none" stroke="#c084fc" stroke-width="4.2" stroke-linecap="round"/>
          <polygon points="32,11 39,17 32,23 25,17" fill="#a855f7" stroke="#f3e8ff" stroke-width="1"/>
          <circle cx="29" cy="16" r="1.6" fill="#fde047"/>
          <circle cx="35" cy="16" r="1.6" fill="#fde047"/>
          <path d="M32,23 L30,28 M32,23 L34,28" stroke="#f43f5e" stroke-width="1.3"/>
        `
      },
      golem: {
        accent: '#f59e0b',
        art: `
          <polygon points="32,10 49,20 46,45 32,53 18,45 15,20" fill="#3b2a1a" stroke="#fbbf24" stroke-width="1.8"/>
          <polygon points="23,20 41,20 45,35 32,47 19,35" fill="#574128" stroke="#fde68a" stroke-width="1.2"/>
          <rect x="23" y="26" width="6" height="4" fill="#38bdf8"/>
          <rect x="35" y="26" width="6" height="4" fill="#38bdf8"/>
          <polygon points="32,33 36,38 32,43 28,38" fill="#fde047"/>
        `
      },
      bear: {
        accent: '#fb7185',
        art: `
          <circle cx="21" cy="18" r="6" fill="#2b161b" stroke="#fb7185" stroke-width="1.5"/>
          <circle cx="43" cy="18" r="6" fill="#2b161b" stroke="#fb7185" stroke-width="1.5"/>
          <circle cx="32" cy="33" r="17" fill="#261317" stroke="#fda4af" stroke-width="1.8"/>
          <polygon points="24,28 29,30 25,33" fill="#f43f5e"/>
          <polygon points="40,28 35,30 39,33" fill="#f43f5e"/>
          <ellipse cx="32" cy="39" rx="7" ry="5" fill="#4c1d24" stroke="#fecdd3" stroke-width="1"/>
          <path d="M28,42 L30,45 M36,42 L34,45" stroke="#fff" stroke-width="1.6"/>
        `
      },
      tiger: {
        accent: '#ef4444',
        art: `
          <polygon points="32,9 51,20 48,44 32,55 16,44 13,20" fill="#3b1111" stroke="#fde047" stroke-width="2"/>
          <path d="M27,16 L37,16 M32,13 L32,22 M28,20 L36,20" stroke="#fde047" stroke-width="2"/>
          <polygon points="23,28 29,30 25,34" fill="#fef08a"/>
          <polygon points="41,28 35,30 39,34" fill="#fef08a"/>
          <path d="M25,40 L28,46 M39,40 L36,46" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
        `
      }
    };

    const cfg = svgMap[mob.svgKey] || svgMap.wolf;
    return `
      <div class="xianxia-token monster-token" style="--token-accent:${cfg.accent}">
        <svg class="token-frame-svg" viewBox="0 0 64 64">
          <polygon points="32,2 53,11 62,32 53,53 32,62 11,53 2,32 11,11"
                   fill="rgba(22, 16, 12, 0.94)" stroke="#e3b866" stroke-width="2.2"/>
          <circle cx="32" cy="32" r="24" fill="none" stroke="${cfg.accent}" stroke-width="1.2" stroke-dasharray="3 2"/>
          ${cfg.art}
        </svg>
        <span class="token-type-pill">🐾 Yêu Thú</span>
      </div>
    `;
  },

  // ===========================================================================
  // PHẦN 2: KHỞI TẠO BẢN ĐỒ, THANH CÔNG CỤ TÓM GỌN 1 DÒNG & PHÓNG TO KHUNG BẢN ĐỒ
  // ===========================================================================

  init() {
    this.overlayEl = document.getElementById('expedition-modal-overlay');
    const closeBtn = document.getElementById('expedition-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.closeModal();
      });
    }
    if (this.overlayEl) {
      this.overlayEl.addEventListener('pointerdown', e => {
        if (e.target === this.overlayEl) {
          e.preventDefault();
          this.closeModal();
        }
      });
    }

    this.spawnAllRandomMobs();
    this.nextSecretSpawnMs = 7000;
  },

  openModal() {
    this.isOpen = true;
    this.statsDropdownOpen = false;
    if (!this.overlayEl) {
      this.overlayEl = document.getElementById('expedition-modal-overlay');
    }
    if (this.overlayEl) {
      this.overlayEl.classList.remove('hidden');
    }

    const pStats = this.getPlayerStats();
    if (this.playerCurrentHp === null || this.playerCurrentHp <= 0) {
      this.playerCurrentHp = pStats.maxHp;
      this.playerCurrentMp = pStats.maxMp;
    } else {
      this.playerCurrentHp = Math.min(pStats.maxHp, this.playerCurrentHp);
      this.playerCurrentMp = Math.min(pStats.maxMp, this.playerCurrentMp);
    }

    this.renderPanel();

    setTimeout(() => {
      if (this.mapScrollEl) {
        this.mapScrollEl.scrollTop = Math.max(0, this.MAP_HEIGHT - this.mapScrollEl.clientHeight - 100);
        this.mapScrollEl.scrollLeft = Math.max(0, (this.MAP_WIDTH - this.mapScrollEl.clientWidth) / 2);
      }
    }, 30);
  },

  closeModal() {
    this.isOpen = false;
    this.selectedMobId = null;
    this.combatRunning = false;
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
  },

  getPlayerStats() {
    const cStats = window.TuTien.Character
      ? window.TuTien.Character.getCombatStats()
      : { maxHp: 100, maxMp: 100, speed: 10, attack: 10 };
    const realm = window.TuTien.State
      ? window.TuTien.State.getCurrentRealm()
      : { fullName: 'Luyện Khí Tầng 1' };
    return {
      realmName: realm.fullName,
      maxHp: cStats.maxHp,
      maxMp: cStats.maxMp,
      attack: cStats.attack,
      speed: cStats.speed
    };
  },

  getSecretTimerStatusHtml() {
    if (this.secretRealm) {
      const remainSec = Math.max(1, Math.ceil(this.secretRealm.remainingMs / 1000));
      return `🌀 <strong style="color:${this.secretRealm.color}">${this.secretRealm.rankLabel}</strong> (${remainSec}s) — Bấm để tới`;
    }
    const nextSec = Math.max(1, Math.ceil(this.nextSecretSpawnMs / 1000));
    return `🌀 Bí Cảnh: <strong>${nextSec}s</strong>`;
  },

  renderPanel() {
    const container = document.getElementById('expedition-panel-container');
    if (!container) return;

    const Utils = window.TuTien.Utils;
    const pStats = this.getPlayerStats();
    const Inv = window.TuTien.Inventory;
    const bagCount = Inv ? Inv.getBagData().items.reduce((s, it) => s + (it.count || 1), 0) : 0;

    const matCompactHtml = (window.TuTien.FORGE_MATERIALS || [])
      .map(m => `<span class="ncb-mat-item" title="${m.name}">${m.icon}<strong id="nsb-mat-${m.id}">${Inv ? Inv.getMaterialCountById(m.id) : 0}</strong></span>`)
      .join('');

    container.innerHTML = `
      <!-- 1. THANH CÔNG CỤ TÓM GỌN 1 DÒNG DUY NHẤT (SIÊU GỌN, CÓ NÚT XỔ CHỈ SỐ CHI TIẾT) -->
      <div class="newbie-compact-toolbar">
        <div class="nct-left">
          <button id="btn-toggle-exp-stats" class="btn-ancient-sm affordable nct-stats-btn" title="Xem chi tiết Cảnh giới, Máu, Linh lực, Sức mạnh">
            📊 Chỉ Số ▾
          </button>
          <span class="nsb-chip hp-chip">❤️ <strong id="nsb-hp">${Utils.formatNumber(this.playerCurrentHp)}/${Utils.formatNumber(pStats.maxHp)}</strong></span>
          <div class="ncb-mat-group">
            ${matCompactHtml}
          </div>
          <button id="nsb-secret-timer" class="nsb-chip secret-timer-chip ${this.secretRealm ? 'secret-active-chip' : ''}" title="Khi Bí Cảnh xuất hiện, bấm vào đây để cuộn nhanh tới Bí Cảnh">
            ${this.getSecretTimerStatusHtml()}
          </button>
        </div>

        <div class="nct-right">
          <span id="newbie-coord-readout" class="newbie-coord-badge">
            🧭 (${this.cursorX}, ${this.cursorY})
          </span>
          <button id="btn-newbie-reroll-mobs" class="btn-ancient-sm affordable" title="Đổi ngẫu nhiên vị trí Quái & Tu Sĩ">
            🔄 Đổi Quái
          </button>
          <button id="btn-newbie-heal" class="btn-ancient-sm affordable" title="Vận công hồi đầy HP và Linh lực">
            🧘 Hồi Phục
          </button>
          <button id="btn-newbie-forge" class="btn-ancient-sm affordable" title="Chế tạo Pháp Bảo từ Sắt, Đá, Gỗ, Vàng">
            🔨 Rèn Pháp Bảo
          </button>
          <button id="btn-newbie-bag" class="btn-ancient-sm affordable">
            🎒 Túi Đồ (<span id="nsb-bag-count">${bagCount}</span>)
          </button>
        </div>

        <!-- Hộp xổ xuống (Popover) hiển thị chi tiết Cảnh Giới, MP, Sức Mạnh, Linh Thạch khi bấm "📊 Chỉ Số ▾" -->
        <div id="exp-stats-popover" class="exp-stats-popover hidden">
          <div class="esp-row"><span>☯️ Cảnh giới:</span> <strong id="nsb-realm">${pStats.realmName}</strong></div>
          <div class="esp-row"><span>💧 Linh lực (MP):</span> <strong id="nsb-mp">${Utils.formatNumber(this.playerCurrentMp)} / ${Utils.formatNumber(pStats.maxMp)}</strong></div>
          <div class="esp-row"><span>⚔️ Sức mạnh công kích:</span> <strong id="nsb-atk">${Utils.formatNumber(pStats.attack)}</strong></div>
          <div class="esp-row"><span>💨 Tốc độ thân pháp:</span> <strong>${Utils.formatNumber(pStats.speed)}</strong></div>
        </div>
      </div>

      <!-- 2. KHUNG BẢN ĐỒ CỔ QUYỂN PHÓNG TO TOÀN KHUNG NHÌN -->
      <div id="newbie-map-scroll" class="newbie-map-scroll-wrap">
        <!-- Dải thông báo nổi gọn gàng ngay mép trên bản đồ (không chiếm diện tích bên ngoài) -->
        <div id="newbie-anomaly-banner" class="newbie-floating-banner ${this.secretRealm ? 'anomaly-active' : ''}">
          ${this.lastLootBannerHtml || 'Vuốt cảm ứng / kéo chuột để di chuyển. Đánh bại Yêu Thú / Tu Sĩ sẽ tự động thu chiến lợi phẩm và thoát ra bản đồ!'}
        </div>

        <div id="newbie-map-canvas" class="newbie-map-surface" style="width:${this.MAP_WIDTH}px;height:${this.MAP_HEIGHT}px;">
          <img src="${window.TuTien.NEWBIE_MAP_DATA_URI || 'assets/newbie_map.jpg?v=coquyen4'}" class="newbie-map-bg-img" alt="Bản Đồ Tu Tiên Cổ Quyển" draggable="false" />
          <div class="newbie-coord-grid-overlay"></div>

          <div class="map-axis-x">
            <span>X: 150</span><span>X: 350</span><span>X: 560</span><span>X: 750</span><span>X: 950</span>
          </div>
          <div class="map-axis-y">
            <span>Y: 200</span><span>Y: 500</span><span>Y: 800</span><span>Y: 1100</span><span>Y: 1380</span>
          </div>

          <div id="newbie-mobs-layer" class="newbie-entities-layer"></div>
          <div id="newbie-secret-layer" class="newbie-entities-layer"></div>
        </div>
      </div>

      <!-- 3. POPUP THÔNG TIN QUÁI / TU SĨ & BÍ CẢNH PHÓNG TO -->
      <div id="newbie-popup-overlay" class="newbie-inner-modal hidden"></div>

      <!-- 4. POPUP TÚI ĐỒ NHANH -->
      <div id="newbie-bag-modal" class="newbie-inner-modal hidden"></div>

      <!-- 5. POPUP CHẾ TẠO PHÁP BẢO -->
      <div id="newbie-forge-modal" class="newbie-inner-modal hidden"></div>
    `;

    this.mapScrollEl = document.getElementById('newbie-map-scroll');
    this.mapCanvasEl = document.getElementById('newbie-map-canvas');
    this.coordDisplayEl = document.getElementById('newbie-coord-readout');
    this.anomalyBannerEl = document.getElementById('newbie-anomaly-banner');
    this.secretTimerChipEl = document.getElementById('nsb-secret-timer');
    this.statsPopoverEl = document.getElementById('exp-stats-popover');
    this.mobsLayerEl = document.getElementById('newbie-mobs-layer');
    this.secretLayerEl = document.getElementById('newbie-secret-layer');
    this.popupOverlayEl = document.getElementById('newbie-popup-overlay');
    this.bagModalEl = document.getElementById('newbie-bag-modal');
    this.forgeModalEl = document.getElementById('newbie-forge-modal');

    this.bindMapTouchAndMousePan();

    const statsToggleBtn = document.getElementById('btn-toggle-exp-stats');
    if (statsToggleBtn && this.statsPopoverEl) {
      statsToggleBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        this.statsDropdownOpen = !this.statsDropdownOpen;
        this.statsPopoverEl.classList.toggle('hidden', !this.statsDropdownOpen);
        statsToggleBtn.textContent = this.statsDropdownOpen ? '📊 Chỉ Số ▴' : '📊 Chỉ Số ▾';
      });
    }

    if (this.secretTimerChipEl) {
      this.secretTimerChipEl.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (this.secretRealm && this.mapScrollEl) {
          this.mapScrollEl.scrollTo({
            left: Math.max(0, this.secretRealm.x - this.mapScrollEl.clientWidth / 2),
            top: Math.max(0, this.secretRealm.y - this.mapScrollEl.clientHeight / 2),
            behavior: 'smooth'
          });
          this.openSecretRealmPopup();
        } else if (window.TuTien.UI) {
          const waitSec = Math.max(1, Math.ceil(this.nextSecretSpawnMs / 1000));
          window.TuTien.UI.showToast(`⏳ Dị tượng Bí Cảnh tiếp theo sẽ xuất hiện sau ${waitSec} giây!`, 'info');
        }
      });
    }

    const rerollBtn = document.getElementById('btn-newbie-reroll-mobs');
    if (rerollBtn) {
      rerollBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.spawnAllRandomMobs();
        this.renderMobSpots();
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast('🔄 Đã đổi ngẫu nhiên toàn bộ vị trí Yêu Thú & Tu Sĩ!', 'info');
        }
      });
    }

    const healBtn = document.getElementById('btn-newbie-heal');
    if (healBtn) {
      healBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const st = this.getPlayerStats();
        this.playerCurrentHp = st.maxHp;
        this.playerCurrentMp = st.maxMp;
        this.updateStatusBar();
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast('🧘 Đã vận công điều tức, hồi đầy HP và Linh lực!', 'success');
        }
      });
    }

    const bagBtn = document.getElementById('btn-newbie-bag');
    if (bagBtn) {
      bagBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.openQuickBagModal();
      });
    }

    const forgeBtn = document.getElementById('btn-newbie-forge');
    if (forgeBtn) {
      forgeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.openQuickForgeModal();
      });
    }

    this.renderMobSpots();
    this.renderSecretRealmSpot();
  },

  bindMapTouchAndMousePan() {
    if (!this.mapScrollEl || !this.mapCanvasEl) return;

    const updateCoordFromClient = (clientX, clientY) => {
      const rect = this.mapCanvasEl.getBoundingClientRect();
      const x = Math.max(0, Math.min(this.MAP_WIDTH, Math.round(clientX - rect.left)));
      const y = Math.max(0, Math.min(this.MAP_HEIGHT, Math.round(clientY - rect.top)));
      this.cursorX = x;
      this.cursorY = y;
      if (this.coordDisplayEl) {
        this.coordDisplayEl.textContent = `🧭 (${x}, ${y})`;
      }
    };

    this.mapScrollEl.addEventListener('pointerdown', e => {
      if (this.statsDropdownOpen && this.statsPopoverEl) {
        this.statsDropdownOpen = false;
        this.statsPopoverEl.classList.add('hidden');
        const btn = document.getElementById('btn-toggle-exp-stats');
        if (btn) btn.textContent = '📊 Chỉ Số ▾';
      }
      this.isDraggingMap = true;
      this.dragMoved = false;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.dragStartScrollLeft = this.mapScrollEl.scrollLeft;
      this.dragStartScrollTop = this.mapScrollEl.scrollTop;
      this.mapScrollEl.classList.add('is-panning');
      updateCoordFromClient(e.clientX, e.clientY);
    });

    this.mapScrollEl.addEventListener('pointermove', e => {
      updateCoordFromClient(e.clientX, e.clientY);
      if (!this.isDraggingMap) return;

      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      if (Math.hypot(dx, dy) > 6) {
        this.dragMoved = true;
      }
      if (this.dragMoved) {
        this.mapScrollEl.scrollLeft = this.dragStartScrollLeft - dx;
        this.mapScrollEl.scrollTop = this.dragStartScrollTop - dy;
      }
    });

    const stopDragging = () => {
      this.isDraggingMap = false;
      if (this.mapScrollEl) {
        this.mapScrollEl.classList.remove('is-panning');
      }
    };

    this.mapScrollEl.addEventListener('pointerup', stopDragging);
    this.mapScrollEl.addEventListener('pointercancel', stopDragging);
    this.mapScrollEl.addEventListener('pointerleave', stopDragging);
  },

  updateStatusBar() {
    if (!this.isOpen) return;
    const Utils = window.TuTien.Utils;
    const pStats = this.getPlayerStats();
    const Inv = window.TuTien.Inventory;
    const bagCount = Inv ? Inv.getBagData().items.reduce((s, it) => s + (it.count || 1), 0) : 0;

    const rEl = document.getElementById('nsb-realm');
    const hpEl = document.getElementById('nsb-hp');
    const mpEl = document.getElementById('nsb-mp');
    const atkEl = document.getElementById('nsb-atk');
    const bagEl = document.getElementById('nsb-bag-count');

    if (rEl) rEl.textContent = pStats.realmName;
    if (hpEl) hpEl.textContent = `${Utils.formatNumber(this.playerCurrentHp)}/${Utils.formatNumber(pStats.maxHp)}`;
    if (mpEl) mpEl.textContent = `${Utils.formatNumber(this.playerCurrentMp)} / ${Utils.formatNumber(pStats.maxMp)}`;
    if (atkEl) atkEl.textContent = Utils.formatNumber(pStats.attack);
    if (bagEl) bagEl.textContent = bagCount;
    if (this.secretTimerChipEl) {
      this.secretTimerChipEl.innerHTML = this.getSecretTimerStatusHtml();
      this.secretTimerChipEl.classList.toggle('secret-active-chip', !!this.secretRealm);
    }

    (window.TuTien.FORGE_MATERIALS || []).forEach(m => {
      const mEl = document.getElementById(`nsb-mat-${m.id}`);
      if (mEl && Inv) {
        mEl.textContent = Inv.getMaterialCountById(m.id);
      }
    });
  },

  renderMobSpots() {
    if (!this.mobsLayerEl) return;

    this.mobsLayerEl.innerHTML = this.mobSpots
      .map(mob => {
        const respawnSecLeft = Math.max(1, Math.ceil(mob.respawnRemainingMs / 1000));
        return `
          <div class="newbie-mob-spot ${mob.isDead ? 'mob-respawning' : ''}"
               data-mob-id="${mob.id}"
               style="left:${mob.x}px;top:${mob.y}px;">
            <div class="mob-spot-tag">
              <div class="mob-spot-realm">${mob.realm}</div>
              <div class="mob-spot-name">${mob.name}</div>
              <div class="mob-spot-coord">📍 (${mob.x}, ${mob.y})</div>
            </div>
            ${
              mob.isDead
                ? `<div class="mob-spot-circle"><span class="mob-respawn-timer">⏳ ${respawnSecLeft}s</span></div>`
                : this.getCustomEntityBadgeHTML(mob)
            }
          </div>
        `;
      })
      .join('');

    this.mobsLayerEl.querySelectorAll('.newbie-mob-spot').forEach(el => {
      el.addEventListener('pointerup', e => {
        if (this.dragMoved) return;
        e.stopPropagation();
        const mobId = el.getAttribute('data-mob-id');
        this.openMobPopup(mobId);
      });
    });
  },

  // ===========================================================================
  // PHẦN 3: POPUP THÔNG TIN QUÁI & TỰ ĐỘNG THOÁT KHI THẮNG / THUA (KHÔNG BỊ KẸT)
  // ===========================================================================

  openMobPopup(mobId) {
    const mob = this.mobSpots.find(m => m.id === mobId);
    if (!mob || !this.popupOverlayEl) return;

    if (mob.isDead) {
      const sec = Math.max(1, Math.ceil(mob.respawnRemainingMs / 1000));
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(`⏳ Đối thủ sẽ hồi sinh ở tọa độ ngẫu nhiên mới sau ${sec} giây!`, 'info');
      }
      return;
    }

    this.selectedMobId = mob.id;
    this.combatRunning = false;

    const Utils = window.TuTien.Utils;
    const typeTitle = mob.entityType === 'cultivator' ? 'Tán Tu Giao Đấu' : 'Yêu Thú Hoang Dã';

    // TUYỆT ĐỐI KHÔNG HIỂN THỊ DANH SÁCH VẬT PHẨM RƠI RA TRÊN BẢNG THÔNG TIN NÀY
    this.popupOverlayEl.innerHTML = `
      <div class="newbie-modal-box">
        <div class="newbie-modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            ${this.getCustomEntityBadgeHTML(mob)}
            <div>
              <span style="font-size:0.72rem;color:var(--ivory-muted);">${typeTitle} • Tọa độ ngẫu nhiên</span>
              <h3>${mob.name}</h3>
            </div>
          </div>
          <button id="btn-close-mob-popup" class="jade-drawer-close">✕</button>
        </div>

        <div class="newbie-mob-stats-grid">
          <div class="nms-item">
            <span class="nms-label">📍 Tọa độ hiện tại</span>
            <strong>(${mob.x}, ${mob.y})</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">☯️ Tu vi (Cảnh giới)</span>
            <strong style="color:var(--bronze-light)">${mob.realm}</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">❤️ HP (Máu)</span>
            <strong id="popup-mob-hp" style="color:#f87171">${Utils.formatNumber(mob.currentHp)} / ${Utils.formatNumber(mob.maxHp)}</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">💧 Linh lực</span>
            <strong style="color:#60a5fa">${Utils.formatNumber(mob.currentMp)} / ${Utils.formatNumber(mob.maxMp)}</strong>
          </div>
        </div>

        <div id="newbie-combat-log" class="newbie-combat-log">
          <div class="ncl-hint">Nhấn "⚔️ Tấn Công" để xuất chiêu. Sau khi phân thắng bại sẽ tự động thoát ra bản đồ và báo chiến lợi phẩm!</div>
        </div>

        <div class="newbie-modal-actions">
          <button id="btn-attack-mob" class="btn-ancient-wide ready">
            ⚔️ Tấn Công
          </button>
        </div>
      </div>
    `;

    this.popupOverlayEl.classList.remove('hidden');

    const closeBtn = document.getElementById('btn-close-mob-popup');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.popupOverlayEl.classList.add('hidden');
      });
    }

    const atkBtn = document.getElementById('btn-attack-mob');
    if (atkBtn) {
      atkBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.runCombatSimulation(mob);
      });
    }
  },

  runCombatSimulation(mob) {
    if (this.combatRunning || mob.isDead) return;
    this.combatRunning = true;

    try {
      const Utils = window.TuTien.Utils;
      const pStats = this.getPlayerStats();

      if (this.playerCurrentHp <= 0) {
        this.playerCurrentHp = pStats.maxHp;
      }

      let round = 1;
      let mobHp = mob.currentHp;
      let playerHp = this.playerCurrentHp;

      const scaleBonus = 1 + (mob.realmLevel - 1) * 0.15;
      const effectivePlayerAtk = Math.max(8, pStats.attack);

      while (mobHp > 0 && playerHp > 0 && round <= 15) {
        const pDmg = Math.max(1, Math.round(effectivePlayerAtk * (0.9 + Math.random() * 0.25)));
        mobHp = Math.max(0, mobHp - pDmg);
        if (mobHp <= 0) break;

        const mDmg = Math.max(1, Math.round(mob.attack * scaleBonus * (0.85 + Math.random() * 0.25)));
        playerHp = Math.max(0, playerHp - mDmg);
        round += 1;
      }

      this.playerCurrentHp = Math.max(1, playerHp);
      this.playerCurrentMp = Math.max(0, this.playerCurrentMp - Math.min(this.playerCurrentMp, 10));

      if (mobHp <= 0) {
        mob.currentHp = 0;
        const droppedItems = this.rollHiddenDropsAndAddToBag(mob);
        const dropPlain = droppedItems.map(d => `${d.icon} ${d.name} [${d.tierName}] ×${d.qty}`).join(', ');
        const dropHtml = droppedItems
          .map(d => `<strong style="color:${d.color}">${d.icon} ${d.name} [${d.tierName}] ×${d.qty}</strong>`)
          .join(', ');

        const stoneGain = mob.realmLevel * 5;
        if (window.TuTien.Inventory && typeof window.TuTien.Inventory.addSpiritStones === 'function') {
          window.TuTien.Inventory.addSpiritStones(stoneGain);
        }

        mob.isDead = true;
        mob.respawnRemainingMs = mob.respawnSec * 1000;

        // Tự động thoát Popup ngay khi đánh bại quái và thông báo rõ nhận được những gì
        if (this.popupOverlayEl) {
          this.popupOverlayEl.classList.add('hidden');
        }

        this.lastLootBannerHtml = `🏆 <strong>Hạ gục ${mob.name}!</strong> Nhận: <strong style="color:#38bdf8">+${stoneGain} Linh Thạch</strong>, ${dropHtml} <em>(Hồi sinh vị trí mới sau 5s)</em>`;
        if (this.anomalyBannerEl && !this.secretRealm) {
          this.anomalyBannerEl.innerHTML = this.lastLootBannerHtml;
        }

        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(`🏆 Hạ ${mob.name}: +${stoneGain} Linh Thạch, ${dropPlain}!`, 'success');
        }
      } else {
        mob.currentHp = mobHp;
        // Khi thua/chưa hạ được cũng tự động thoát ra bản đồ và thông báo
        if (this.popupOverlayEl) {
          this.popupOverlayEl.classList.add('hidden');
        }
        const failMsg = `⚠️ Giao chiến bất phân thắng bại với ${mob.name} (còn ${Utils.formatNumber(mobHp)} HP)! Đã tự rút lui về bản đồ.`;
        this.lastLootBannerHtml = failMsg;
        if (this.anomalyBannerEl && !this.secretRealm) {
          this.anomalyBannerEl.innerHTML = failMsg;
        }
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(failMsg, 'warn');
        }
      }

      this.renderMobSpots();
      this.updateStatusBar();
    } catch (err) {
      console.error('Lỗi mô phỏng chiến đấu Xuất Quan:', err);
      if (this.popupOverlayEl) {
        this.popupOverlayEl.classList.add('hidden');
      }
    } finally {
      this.combatRunning = false;
    }
  },

  rollHiddenDropsAndAddToBag(mob) {
    const results = [];
    const Inv = window.TuTien.Inventory;
    const qualities = window.TuTien.ITEM_QUALITIES || [];

    const pickDropQuality = maxTier => {
      const cap = Math.max(1, Math.min(5, maxTier || 2));
      const allowed = qualities.filter(q => q.tier <= cap);
      if (!allowed.length) {
        return { tier: 1, name: 'Hạ Phẩm', color: '#94a3b8', mult: 1 };
      }
      const weights = allowed.map(q => Math.pow(0.45, q.tier - 1));
      const total = weights.reduce((s, w) => s + w, 0);
      let r = Math.random() * total;
      for (let i = 0; i < allowed.length; i++) {
        r -= weights[i];
        if (r <= 0) return allowed[i];
      }
      return allowed[0];
    };

    const addDropToInventory = (drop, qObj, qty) => {
      if (!Inv) return;
      if (typeof Inv.addStackableItem === 'function') {
        Inv.addStackableItem(
          drop.category,
          drop.id,
          drop.name,
          drop.icon,
          qObj,
          `${drop.typeLabel} thu thập khi đánh bại ${mob.name}. Dùng để Luyện Đan hoặc Rèn Pháp Bảo.`,
          qty
        );
      }
    };

    (mob.hiddenDrops || []).forEach(drop => {
      if (Math.random() <= drop.chance) {
        const qty = drop.minQty + Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1));
        const qObj = pickDropQuality(drop.maxTier);
        addDropToInventory(drop, qObj, qty);

        results.push({
          name: drop.name,
          icon: drop.icon,
          qty,
          tierName: qObj.name,
          color: qObj.color
        });
      }
    });

    if (results.length === 0 && mob.hiddenDrops && mob.hiddenDrops.length > 0) {
      const firstDrop = mob.hiddenDrops[0];
      const qObj = pickDropQuality(1);
      addDropToInventory(firstDrop, qObj, 1);
      results.push({
        name: firstDrop.name,
        icon: firstDrop.icon,
        qty: 1,
        tierName: qObj.name,
        color: qObj.color
      });
    }

    return results;
  },

  // ===========================================================================
  // PHẦN 4: HỆ THỐNG BÍ CẢNH NGẪU NHIÊN CHIA 5 CẤP ĐỘ & POPUP BÍ CẢNH PHÓNG TO
  // ===========================================================================

  scheduleNextSecretRealm() {
    this.nextSecretSpawnMs = (15 + Math.floor(Math.random() * 6)) * 1000;
  },

  spawnRandomSecretRealm() {
    const tierCfg = this.rollSecretRealmTier();
    const chosenName = tierCfg.names[Math.floor(Math.random() * tierCfg.names.length)];
    const coord = this.generateRandomCoord(this.mobSpots, tierCfg.tier * 2);

    this.secretRealm = {
      ...tierCfg,
      name: chosenName,
      x: coord.x,
      y: coord.y,
      remainingMs: 30000
    };

    const bannerMsg = `⚡ Dị tượng xuất hiện: 【${chosenName} — ${tierCfg.rankLabel}】 vừa mở trên bản đồ (30s)! Bấm nút Bí Cảnh trên thanh công cụ hoặc tìm trên bản đồ!`;

    if (this.anomalyBannerEl) {
      this.anomalyBannerEl.innerHTML = bannerMsg;
      this.anomalyBannerEl.classList.add('anomaly-active');
    }
    if (this.isOpen && window.TuTien.UI) {
      window.TuTien.UI.showToast(`⚡ Có dị tượng 【${tierCfg.rankLabel}】 xuất hiện trên bản đồ!`, 'warn');
    }

    this.renderSecretRealmSpot();
    this.updateStatusBar();
  },

  renderSecretRealmSpot() {
    if (!this.secretLayerEl) return;

    if (!this.secretRealm) {
      this.secretLayerEl.innerHTML = '';
      return;
    }

    const sr = this.secretRealm;
    const secLeft = Math.max(1, Math.ceil(sr.remainingMs / 1000));
    this.secretLayerEl.innerHTML = `
      <div class="newbie-secret-spot" style="left:${sr.x}px;top:${sr.y}px;">
        <div class="secret-spot-tag" style="background:${sr.bgGradient};border-color:${sr.color};">
          <div class="secret-spot-title" style="color:${sr.color};">🌀 ${sr.name}</div>
          <div class="secret-spot-meta" style="color:#fef08a;">★ ${sr.rankLabel} • 📍 (${sr.x}, ${sr.y}) • ⏳ ${secLeft}s</div>
        </div>
        <div class="xianxia-token secret-token">
          <svg class="token-frame-svg" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" fill="rgba(24, 14, 8, 0.94)" stroke="${sr.color}" stroke-width="2.4" />
            <circle cx="32" cy="32" r="22" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="5 3" />
            <path d="M32 11 C44 16, 48 32, 32 53 C16 32, 20 16, 32 11 Z" fill="${sr.color}" opacity="0.32" />
            <polygon points="32,16 44,32 32,48 20,32" fill="${sr.color}" stroke="#ffffff" stroke-width="1.3" />
          </svg>
          <span class="token-type-pill" style="border-color:${sr.color};color:#fef08a;">Bí Cảnh Cấp ${sr.tier}</span>
        </div>
      </div>
    `;

    const spotEl = this.secretLayerEl.querySelector('.newbie-secret-spot');
    if (spotEl) {
      spotEl.addEventListener('pointerup', e => {
        if (this.dragMoved) return;
        e.stopPropagation();
        this.openSecretRealmPopup();
      });
    }
  },

  /**
   * Giao diện mở Bí Cảnh được PHÓNG TO RỘNG RÃI (secret-modal-xl), hiển thị trực quan Cấp độ, Kỳ Ngộ và 2 phương thức Khám Phá
   */
  openSecretRealmPopup() {
    if (!this.secretRealm || !this.popupOverlayEl) return;
    const sr = this.secretRealm;
    const secLeft = Math.max(1, Math.ceil(sr.remainingMs / 1000));
    const Utils = window.TuTien.Utils;

    this.popupOverlayEl.innerHTML = `
      <div class="newbie-modal-box secret-modal-xl" style="border-color:${sr.color};">
        <div class="newbie-modal-header" style="background:${sr.bgGradient};margin:-20px -20px 16px -20px;padding:16px 22px;border-radius:16px 16px 0 0;border-bottom:1.5px solid ${sr.color};">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="xianxia-token" style="transform:scale(1.12);">
              <svg class="token-frame-svg" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="29" fill="rgba(24, 14, 8, 0.94)" stroke="${sr.color}" stroke-width="2.4" />
                <circle cx="32" cy="32" r="22" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="5 3" />
                <polygon points="32,14 46,32 32,50 18,32" fill="${sr.color}" stroke="#ffffff" stroke-width="1.5" />
              </svg>
            </div>
            <div>
              <div style="font-size:0.86rem;color:#fef08a;font-weight:700;letter-spacing:0.4px;">★ BÍ CẢNH PHÂN CẤP: ${sr.rankLabel.toUpperCase()}</div>
              <h3 style="font-size:1.45rem;color:#ffffff;margin-top:2px;">🌀 ${sr.name}</h3>
            </div>
          </div>
          <button id="btn-close-secret-popup" class="jade-drawer-close">✕</button>
        </div>

        <div class="newbie-mob-stats-grid" style="grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:16px;">
          <div class="nms-item">
            <span class="nms-label">📍 Tọa độ Bí Cảnh</span>
            <strong style="font-size:1rem;">(${sr.x}, ${sr.y})</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">⏳ Thời gian còn lại</span>
            <strong id="modal-secret-countdown" style="color:#fde047;font-size:1rem;">${secLeft} giây</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">☯️ Cảnh giới khuyến nghị</span>
            <strong style="color:${sr.color};font-size:0.95rem;">${sr.recommendRealm}</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">🛡️ Hộ Pháp Trấn Giữ</span>
            <strong style="color:#f87171;font-size:0.95rem;">${sr.guardianName} (${Utils.formatNumber(sr.guardianHp)} HP)</strong>
          </div>
        </div>

        <div class="secret-choice-grid">
          <div class="secret-choice-card safe-card">
            <div class="scc-title">✨ Phương Thức 1: Thám Hiểm Ngoại Vi (An Toàn)</div>
            <p class="scc-desc">Thu thập linh khoáng và kỳ trân dị bảo ở vòng ngoài Bí Cảnh mà không kinh động đến Hộ Pháp. Tỉ lệ thành công <strong>100%</strong>.</p>
            <div class="scc-rewards">
              <span>💎 +${sr.stoneReward[0]}–${sr.stoneReward[1]} Linh Thạch</span>
              <span>⛏️ +${sr.matQty[0]}–${sr.matQty[1]} Sắt/Đá/Gỗ</span>
              <span>🌕 Cơ hội rơi Vàng (${Math.round(sr.goldChance * 100)}%)</span>
            </div>
            <button id="btn-explore-secret-safe" class="btn-ancient-wide ready" style="margin-top:auto;">
              ✨ Thám Hiểm An Toàn (Nhận Thưởng Ngay)
            </button>
          </div>

          <div class="secret-choice-card boss-card">
            <div class="scc-title" style="color:#fca5a5;">⚔️ Phương Thức 2: Phá Trận Đoạt Bảo (Thưởng x2)</div>
            <p class="scc-desc">Trực tiếp đánh bại <strong>${sr.guardianName}</strong> trấn giữ lõi Bí Cảnh để đoạt toàn bộ bảo khố với phần thưởng <strong>GẤP ĐÔI (x2)</strong>!</p>
            <div class="scc-rewards">
              <span style="color:#fde047;">💎 x2 Linh Thạch (${sr.stoneReward[0] * 2}–${sr.stoneReward[1] * 2})</span>
              <span style="color:#86efac;">⛏️ x2 Khoáng Sản & Vàng</span>
              <span style="color:#38bdf8;">✨ x2 Tu Vi Trực Tiếp</span>
            </div>
            <button id="btn-explore-secret-boss" class="btn-ancient-wide ready ma-btn" style="margin-top:auto;">
              ⚔️ Khiêu Chiến Hộ Pháp (Đoạt Thưởng x2)
            </button>
          </div>
        </div>
      </div>
    `;

    this.popupOverlayEl.classList.remove('hidden');

    const closeBtn = document.getElementById('btn-close-secret-popup');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.popupOverlayEl.classList.add('hidden');
      });
    }

    const safeBtn = document.getElementById('btn-explore-secret-safe');
    if (safeBtn) {
      safeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.claimSecretRealmReward(false);
      });
    }

    const bossBtn = document.getElementById('btn-explore-secret-boss');
    if (bossBtn) {
      bossBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.claimSecretRealmReward(true);
      });
    }
  },

  claimSecretRealmReward(challengeGuardian) {
    if (!this.secretRealm) return;
    const sr = this.secretRealm;
    const Inv = window.TuTien.Inventory;
    const State = window.TuTien.State;
    const Utils = window.TuTien.Utils;

    let mult = 1;
    if (challengeGuardian) {
      const pStats = this.getPlayerStats();
      const playerPower = pStats.attack * 6 + this.playerCurrentHp;
      const guardianPower = sr.guardianAtk * 5 + sr.guardianHp;

      if (playerPower < guardianPower * 0.65) {
        this.playerCurrentHp = Math.max(1, Math.floor(this.playerCurrentHp * 0.35));
        this.updateStatusBar();
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(`💥 ${sr.guardianName} quá mạnh! Hãy bấm "✨ Thám Hiểm An Toàn" hoặc Rèn Pháp Bảo trước!`, 'warn');
        }
        return;
      }
      mult = 2;
    }

    const stones = (sr.stoneReward[0] + Math.floor(Math.random() * (sr.stoneReward[1] - sr.stoneReward[0] + 1))) * mult;
    if (Inv && typeof Inv.addSpiritStones === 'function') {
      Inv.addSpiritStones(stones);
    }

    const realmObj = State ? State.getCurrentRealm() : { req: 100 };
    const bonusQi = Math.max(80, Math.floor((realmObj.req || 100) * 0.18 * sr.qiMult * mult));
    if (State && State.data) {
      State.data.qi += bonusQi;
      State.data.totalQiEarned += bonusQi;
    }

    const baseMats = [
      { id: 'sat_khoang', name: 'Huyền Thiết (Sắt)', icon: '⛏️' },
      { id: 'da_khoang', name: 'Thanh Linh Thạch (Đá)', icon: '⛰️' },
      { id: 'go_linh_moc', name: 'Thiết Mộc (Gỗ)', icon: '🌲' }
    ];
    const pickedMat = baseMats[Math.floor(Math.random() * baseMats.length)];
    const matQty = (sr.matQty[0] + Math.floor(Math.random() * (sr.matQty[1] - sr.matQty[0] + 1))) * mult;

    const qualities = window.TuTien.ITEM_QUALITIES || [];
    const qObj = qualities.find(q => q.tier === sr.maxItemTier) || { tier: 2, name: 'Trung Phẩm', color: '#4ade80', mult: 1.5 };

    if (Inv && typeof Inv.addStackableItem === 'function') {
      Inv.addStackableItem(
        'material',
        pickedMat.id,
        pickedMat.name,
        pickedMat.icon,
        qObj,
        `Nguyên liệu Pháp Bảo thu được từ ${sr.name} (${sr.rankLabel}).`,
        matQty
      );
    }

    const rewardSummary = [
      `💎 +${stones} Linh Thạch`,
      `✨ +${Utils.formatNumber(bonusQi)} Tu vi`,
      `${pickedMat.icon} ${pickedMat.name} [${qObj.name}] ×${matQty}`
    ];

    if (Math.random() <= sr.goldChance && Inv && typeof Inv.addStackableItem === 'function') {
      const goldQty = Math.max(1, Math.floor((sr.tier >= 4 ? 2 : 1) * mult));
      Inv.addStackableItem(
        'material',
        'vang_tinh_kim',
        'Thái Ất Tinh Kim (Vàng)',
        '🌕',
        qObj,
        `Tinh kim quý hiếm từ ${sr.name} (${sr.rankLabel}).`,
        goldQty
      );
      rewardSummary.push(`🌕 Thái Ất Tinh Kim (Vàng) [${qObj.name}] ×${goldQty}`);
    }

    const msg = `🎉 Khám phá 【${sr.name} — ${sr.rankLabel}】${mult === 2 ? ' (Phá Trận x2)' : ''}: Nhận ${rewardSummary.join(', ')}!`;

    this.secretRealm = null;
    this.scheduleNextSecretRealm();
    this.lastLootBannerHtml = msg;

    if (this.anomalyBannerEl) {
      this.anomalyBannerEl.innerHTML = msg;
      this.anomalyBannerEl.classList.remove('anomaly-active');
    }
    if (this.popupOverlayEl) {
      this.popupOverlayEl.classList.add('hidden');
    }

    this.renderSecretRealmSpot();
    this.updateStatusBar();

    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(msg, 'success');
    }
  },

  // ===========================================================================
  // PHẦN 5: TÚI ĐỒ NHANH & LÒ CHẾ TẠO PHÁP BẢO (SẮT, ĐÁ, GỖ, VÀNG)
  // ===========================================================================

  openQuickBagModal() {
    if (!this.bagModalEl) return;
    const Inv = window.TuTien.Inventory;
    const items = Inv ? Inv.getBagData().items : [];

    const listHtml =
      items.length === 0
        ? `<div class="jade-empty">Túi đồ hiện đang trống. Hãy đánh bại Yêu Thú / Tu Sĩ hoặc khám phá Bí Cảnh trên bản đồ!</div>`
        : items
            .map(
              it => `
              <div class="newbie-bag-item" style="border-left:3px solid ${it.qualityColor || it.color || '#94a3b8'}">
                <div class="nbi-icon">${it.icon || '📦'}</div>
                <div class="nbi-info">
                  <div class="nbi-title" style="color:${it.qualityColor || it.color || '#f7e8c4'}">
                    ${it.name} <span class="nbi-tier">[${it.qualityName || it.tierName || 'Hạ Phẩm'}]</span>
                  </div>
                  <div class="nbi-desc">${it.effectDesc || it.desc || ''}</div>
                </div>
                <div class="nbi-qty">×${it.count || 1}</div>
              </div>
            `
            )
            .join('');

    this.bagModalEl.innerHTML = `
      <div class="newbie-modal-box" style="max-width:560px;">
        <div class="newbie-modal-header">
          <h3>🎒 Túi Đồ Hành Trang</h3>
          <button id="btn-close-quick-bag" class="jade-drawer-close">✕</button>
        </div>
        <div class="newbie-bag-list">
          ${listHtml}
        </div>
      </div>
    `;

    this.bagModalEl.classList.remove('hidden');

    const closeBtn = document.getElementById('btn-close-quick-bag');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.bagModalEl.classList.add('hidden');
      });
    }
  },

  openQuickForgeModal() {
    if (!this.forgeModalEl) return;
    const Inv = window.TuTien.Inventory;
    const Fields = window.TuTien.Fields;
    const recipes = window.TuTien.ARTIFACT_RECIPES || [];

    const matSummary = (window.TuTien.FORGE_MATERIALS || [])
      .map(m => `<span class="nsb-chip">${m.icon} ${m.name}: <strong>${Inv ? Inv.getMaterialCountById(m.id) : 0}</strong></span>`)
      .join('');

    const recipesHtml = recipes
      .map(rc => {
        const canMat = Inv ? Inv.canAffordMaterials(rc.materials) : false;
        const reqBadges = (rc.materials || [])
          .map(req => {
            const needCount = req.count || req.qty || 1;
            const mDef = (window.TuTien.FORGE_MATERIALS || []).find(x => x.id === req.id) || { name: req.name || req.id, icon: req.icon || '📦' };
            const have = Inv ? Inv.getMaterialCountById(req.id) : 0;
            const ok = have >= needCount;
            return `<span style="color:${ok ? '#86efac' : '#fca5a5'};font-size:0.76rem;margin-right:10px;">${mDef.icon} ${mDef.shortName || mDef.name}: <strong>${have}/${needCount}</strong></span>`;
          })
          .join('');

        return `
          <div class="newbie-bag-item" style="justify-content:space-between;border:1px solid rgba(227,184,102,0.3);">
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="nbi-icon">${rc.icon}</div>
              <div class="nbi-info">
                <div class="nbi-title" style="color:var(--bronze-light)">${rc.name}</div>
                <div class="nbi-desc">${rc.shortDesc || rc.description || ''}</div>
                <div style="margin-top:4px;">${reqBadges}</div>
              </div>
            </div>
            <button class="btn-ancient-sm ${canMat ? 'affordable' : ''} btn-do-forge-recipe"
                    data-recipe-id="${rc.id}" ${!canMat ? 'disabled' : ''}>
              🔨 Chế Tạo
            </button>
          </div>
        `;
      })
      .join('');

    this.forgeModalEl.innerHTML = `
      <div class="newbie-modal-box" style="max-width:600px;">
        <div class="newbie-modal-header">
          <h3>🔨 Lò Chế Tạo Pháp Bảo (Sắt • Đá • Gỗ • Vàng)</h3>
          <button id="btn-close-quick-forge" class="jade-drawer-close">✕</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
          ${matSummary}
        </div>
        <div class="newbie-bag-list" style="max-height:360px;">
          ${recipesHtml}
        </div>
      </div>
    `;

    this.forgeModalEl.classList.remove('hidden');

    const closeBtn = document.getElementById('btn-close-quick-forge');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.forgeModalEl.classList.add('hidden');
      });
    }

    this.forgeModalEl.querySelectorAll('.btn-do-forge-recipe').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        const rId = btn.getAttribute('data-recipe-id');
        if (Fields && Fields.forgeArtifact(rId)) {
          this.updateStatusBar();
          this.openQuickForgeModal();
        }
      });
    });
  },

  // ===========================================================================
  // PHẦN 6: VÒNG LẶP THỜI GIAN THỰC (update & tick)
  // ===========================================================================

  update(dtMs) {
    this.tick(dtMs);
  },

  tick(dtMs) {
    let needRenderMobs = false;

    this.mobSpots.forEach((mob, idx) => {
      if (mob.isDead) {
        const prevSec = Math.ceil(mob.respawnRemainingMs / 1000);
        mob.respawnRemainingMs -= dtMs;
        const nextSec = Math.ceil(mob.respawnRemainingMs / 1000);

        if (mob.respawnRemainingMs <= 0) {
          this.respawnSingleMobAtRandomSpot(mob, idx);
          needRenderMobs = true;
        } else if (prevSec !== nextSec) {
          needRenderMobs = true;
        }
      }
    });

    if (needRenderMobs && this.isOpen) {
      this.renderMobSpots();
    }

    let timerSecChanged = false;
    if (this.secretRealm) {
      const prevSec = Math.ceil(this.secretRealm.remainingMs / 1000);
      this.secretRealm.remainingMs -= dtMs;
      const nextSec = Math.ceil(this.secretRealm.remainingMs / 1000);
      if (prevSec !== nextSec) timerSecChanged = true;

      if (this.secretRealm.remainingMs <= 0) {
        this.secretRealm = null;
        this.scheduleNextSecretRealm();
        if (this.anomalyBannerEl) {
          this.anomalyBannerEl.innerHTML = '💨 Bí cảnh đã khép lại sau 30 giây. Chờ dị tượng tiếp theo (15–20s)!';
          this.anomalyBannerEl.classList.remove('anomaly-active');
        }
        if (this.isOpen) {
          this.renderSecretRealmSpot();
        }
        timerSecChanged = true;
      } else if (prevSec !== nextSec && this.isOpen) {
        this.renderSecretRealmSpot();
        const cdEl = document.getElementById('modal-secret-countdown');
        if (cdEl) cdEl.textContent = `${Math.max(1, nextSec)} giây`;
      }
    } else {
      const prevWait = Math.ceil(this.nextSecretSpawnMs / 1000);
      this.nextSecretSpawnMs -= dtMs;
      const nextWait = Math.ceil(this.nextSecretSpawnMs / 1000);
      if (prevWait !== nextWait) timerSecChanged = true;

      if (this.nextSecretSpawnMs <= 0) {
        this.spawnRandomSecretRealm();
        timerSecChanged = true;
      }
    }

    if (timerSecChanged && this.isOpen && this.secretTimerChipEl) {
      this.secretTimerChipEl.innerHTML = this.getSecretTimerStatusHtml();
      this.secretTimerChipEl.classList.toggle('secret-active-chip', !!this.secretRealm);
    }
  }
};
