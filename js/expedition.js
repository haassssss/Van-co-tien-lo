/**
 * js/expedition.js
 * TÍNH NĂNG "XUẤT QUAN — BẢN ĐỒ CỔ QUYỂN"
 * - Bản đồ cổ quyển phóng to (1120×1490), hỗ trợ trượt cảm ứng 1 ngón & kéo chuột mượt mà.
 * - Quái & Tu Sĩ spawn tọa độ (X, Y) ngẫu nhiên, hồi sinh 5 giây sang tọa độ ngẫu nhiên mới.
 * - BOSS THẾ GIỚI CỐ ĐỊNH: 🐉 Thái Cổ Thanh Long Vương tại góc trên bên phải (chỗ hình rồng, x:935, y:125),
 *   luôn mạnh hơn người chơi 3 cảnh giới (tối đa cảnh giới 100), đánh xong hồi sinh sau 3 phút (180 giây).
 * - GIAO DIỆN GIAO CHIẾN THEO LƯỢT (1v1): Phát nhạc `one-vs-one.mp3` khi đánh thường, phát `clouds-over-the-river.mp3`
 *   khi đánh vượt cấp hoặc đánh Boss Rồng, thắng/thua tự động thoát về bản đồ & chuyển về nhạc tập luyện.
 * - BÍ CẢNH 5 CẤP ĐỘ THÁM HIỂM 3 TẦNG TƯƠNG TÁC: Mỗi tầng có 3 lựa chọn kỳ ngộ (giải trận, hái dược, mở thạch quan, đánh Hộ Pháp).
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

  // Trượt cảm ứng / kéo chuột
  isDraggingMap: false,
  dragMoved: false,
  dragStartX: 0,
  dragStartY: 0,
  dragStartScrollLeft: 0,
  dragStartScrollTop: 0,

  // Máu & Linh lực trong phiên Xuất Quan
  playerCurrentHp: null,
  playerCurrentMp: null,

  // Danh sách quái ngẫu nhiên
  mobSpots: [],

  // Boss Thế Giới Rồng cố định tại góc trên bên phải (x: 935, y: 125)
  dragonBoss: {
    id: 'boss_thanh_long',
    entityType: 'boss',
    svgKey: 'dragon_boss',
    name: 'Boss Thế Giới',
    x: 935,
    y: 125,
    respawnSec: 180, // 3 phút hồi sinh
    isDead: false,
    respawnRemainingMs: 0
  },

  // Trạng thái Giao Chiến Theo Lượt (Combat Arena)
  combat: null,
  autoBattle: false,
  autoBattleTimer: null,

  // Trạng thái Bí Cảnh 5 Cấp Độ & Thám Hiểm 3 Tầng
  secretRealm: null,
  secretRun: null,
  nextSecretSpawnMs: 7000,
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
  combatOverlayEl: null,
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
      realmOffset: -1,
      realm: 'Luyện Khí Tầng 1',
      realmLevel: 1,
      maxHp: 65,
      maxMp: 30,
      attack: 6,
      speed: 8,
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
      realmOffset: 0,
      realm: 'Luyện Khí Tầng 2',
      realmLevel: 2,
      maxHp: 115,
      maxMp: 55,
      attack: 11,
      speed: 11,
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
      realmOffset: 0,
      realm: 'Luyện Khí Tầng 3',
      realmLevel: 3,
      maxHp: 175,
      maxMp: 75,
      attack: 16,
      speed: 13,
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
      realmOffset: 0,
      realm: 'Luyện Khí Tầng 4',
      realmLevel: 4,
      maxHp: 255,
      maxMp: 95,
      attack: 23,
      speed: 15,
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
      realmOffset: 1,
      realm: 'Luyện Khí Tầng 5',
      realmLevel: 5,
      maxHp: 350,
      maxMp: 120,
      attack: 30,
      speed: 12,
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
      realmOffset: 1,
      realm: 'Luyện Khí Tầng 6',
      realmLevel: 6,
      maxHp: 520,
      maxMp: 165,
      attack: 44,
      speed: 20,
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
      realmOffset: 1,
      realm: 'Luyện Khí Tầng 7',
      realmLevel: 7,
      maxHp: 740,
      maxMp: 210,
      attack: 62,
      speed: 16,
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
      realmOffset: 2,
      realm: 'Luyện Khí Tầng 8',
      realmLevel: 8,
      maxHp: 980,
      maxMp: 260,
      attack: 78,
      speed: 24,
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
      realmOffset: 2,
      realm: 'Luyện Khí Tầng 9',
      realmLevel: 9,
      maxHp: 1280,
      maxMp: 320,
      attack: 96,
      speed: 28,
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
      guardianSvg: 'golem',
      stoneReward: [25, 50],
      qiMult: 1.5,
      matQty: [1, 2],
      goldChance: 0.3,
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
      guardianSvg: 'cultivator_male',
      stoneReward: [55, 110],
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
      guardianSvg: 'golem',
      stoneReward: [110, 210],
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
      guardianSvg: 'tiger',
      stoneReward: [200, 360],
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
      guardianSvg: 'bear',
      stoneReward: [380, 650],
      qiMult: 10.0,
      matQty: [4, 7],
      goldChance: 1.0,
      maxItemTier: 5
    }
  ],

  /**
   * Tính toán chỉ số động cho Boss Rồng cố định: LUÔN mạnh hơn người chơi 3 cảnh giới (tối đa cảnh giới 100)
   */
  getDragonBossLiveStats() {
    const State = window.TuTien.State;
    const realms = window.TuTien.REALMS || [];
    const playerRealmIdx = State && State.data ? State.data.realmIndex || 0 : 0;
    const maxIdx = Math.max(0, realms.length - 1); // 99 = Cảnh giới 100
    const bossRealmIdx = Math.min(maxIdx, playerRealmIdx + 3);
    const bossRealmObj = realms[bossRealmIdx] || { fullName: `Cảnh Giới ${bossRealmIdx + 1}` };

    const pStats = this.getPlayerStats();
    const gap = Math.max(1, bossRealmIdx - playerRealmIdx);
    const powerScale = 1 + gap * 0.25;

    return {
      ...this.dragonBoss,
      realmIndex: bossRealmIdx,
      realmDisplayNumber: bossRealmIdx + 1,
      realm: bossRealmObj.fullName,
      maxHp: Math.max(450, Math.round(pStats.maxHp * 2.15 * (1 + gap * 0.12))),
      maxMp: Math.max(200, Math.round(pStats.maxMp * 1.6)),
      attack: Math.max(35, Math.round(pStats.attack * 0.92 * powerScale)),
      speed: Math.max(18, Math.round(pStats.speed * 1.15)),
      isOverlevel: true
    };
  },

  generateRandomCoord(existingSpots, realmLevel = 5) {
    const minY = realmLevel <= 3 ? 740 : realmLevel <= 6 ? 380 : 230;
    const maxY = realmLevel <= 3 ? 1360 : realmLevel <= 6 ? 1080 : 720;
    let bestX = 320;
    let bestY = 850;

    for (let attempt = 0; attempt < 30; attempt++) {
      const candidateX = Math.floor(140 + Math.random() * (this.MAP_WIDTH - 280));
      const candidateY = Math.floor(minY + Math.random() * (maxY - minY));
      // Tránh vùng góc trên phải nơi Boss Rồng ngự trị (x > 760, y < 260)
      if (candidateX > 760 && candidateY < 260) continue;

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

  getCustomEntityBadgeHTML(mob, scaleClass = '') {
    if (mob.svgKey === 'dragon_boss' || mob.entityType === 'boss') {
      return `
        <div class="xianxia-token dragon-boss-token ${scaleClass}" style="--token-accent:#facc15">
          <svg class="token-frame-svg" viewBox="0 0 64 64">
            <polygon points="32,1 55,10 63,32 55,54 32,63 9,54 1,32 9,10"
                     fill="rgba(42, 8, 12, 0.96)" stroke="#facc15" stroke-width="2.5"/>
            <circle cx="32" cy="32" r="24" fill="none" stroke="#f43f5e" stroke-width="1.4" stroke-dasharray="4 2"/>
            <!-- Biểu tượng Long Vương Cổ Phong -->
            <path d="M18,16 L24,25 L20,30 M46,16 L40,25 L44,30" stroke="#fde047" stroke-width="2.2" fill="none" stroke-linecap="round"/>
            <polygon points="32,12 45,24 41,44 32,53 23,44 19,24" fill="#7f1d1d" stroke="#fde047" stroke-width="1.6"/>
            <polygon points="24,29 30,31 26,35" fill="#fef08a"/>
            <polygon points="40,29 34,31 38,35" fill="#fef08a"/>
            <path d="M25,42 L29,48 M39,42 L35,48" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
            <circle cx="32" cy="21" r="3" fill="#38bdf8"/>
          </svg>
          <span class="token-type-pill" style="background:#7f1d1d;border-color:#fde047;color:#fef08a;">🐉 BOSS</span>
        </div>
      `;
    }

    if (mob.entityType === 'cultivator' || mob.svgKey === 'cultivator_male' || mob.svgKey === 'cultivator_female') {
      const spritePath =
        mob.gender === 'female' || mob.svgKey === 'cultivator_female'
          ? 'assets/sprites_walk/nu/nu_di_xuong_01.png'
          : 'assets/sprites_walk/nam/nam_di_xuong_01.png';
      const ringColor = mob.gender === 'female' || mob.svgKey === 'cultivator_female' ? '#f472b6' : '#38bdf8';

      return `
        <div class="xianxia-token cultivator-token ${scaleClass}" style="--token-accent:${ringColor}">
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
      <div class="xianxia-token monster-token ${scaleClass}" style="--token-accent:${cfg.accent}">
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
  // PHẦN 2: KHỞI TẠO BẢN ĐỒ, THANH CÔNG CỤ 1 DÒNG & RENDER CÁC ĐIỂM
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
    this.combat = null;
    this.clearAutoBattle();

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
        this.mapScrollEl.scrollTop = Math.max(0, this.MAP_HEIGHT - this.mapScrollEl.clientHeight - 120);
        this.mapScrollEl.scrollLeft = Math.max(0, (this.MAP_WIDTH - this.mapScrollEl.clientWidth) / 2);
      }
    }, 30);
  },

  closeModal() {
    this.isOpen = false;
    this.combat = null;
    this.secretRun = null;
    this.clearAutoBattle();
    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToTrainingBgm();
    }
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
  },

  clearAutoBattle() {
    if (this.autoBattleTimer) {
      clearTimeout(this.autoBattleTimer);
      this.autoBattleTimer = null;
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
      realmIndex: window.TuTien.State && window.TuTien.State.data ? window.TuTien.State.data.realmIndex || 0 : 0,
      realmName: realm.fullName,
      maxHp: cStats.maxHp,
      maxMp: cStats.maxMp,
      attack: cStats.attack,
      speed: cStats.speed
    };
  },

  getBestPlayerSkillName() {
    const State = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const list = window.TuTien.UPGRADES || [];
    for (let i = list.length - 1; i >= 0; i--) {
      if (State && State.getUpgradeLevel(list[i].id) > 0) {
        return Upgrades ? Upgrades.getDisplayName(list[i]) : list[i].name;
      }
    }
    return 'Thái Thanh Kiếm Quyết';
  },

  formatMinSec(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  getSecretTimerStatusHtml() {
    if (this.secretRealm) {
      const remainSec = Math.max(1, Math.ceil(this.secretRealm.remainingMs / 1000));
      return `🌀 <strong style="color:${this.secretRealm.color}">${this.secretRealm.rankLabel}</strong> (${remainSec}s)`;
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
      <!-- 1. THANH CÔNG CỤ TÓM GỌN 1 DÒNG -->
      <div class="newbie-compact-toolbar">
        <div class="nct-left">
          <button id="btn-toggle-exp-stats" class="btn-ancient-sm affordable nct-stats-btn">
            📊 Chỉ Số ▾
          </button>
          <span class="nsb-chip hp-chip">❤️ <strong id="nsb-hp">${Utils.formatNumber(this.playerCurrentHp)}/${Utils.formatNumber(pStats.maxHp)}</strong></span>
          <div class="ncb-mat-group">${matCompactHtml}</div>
          <button id="nsb-secret-timer" class="nsb-chip secret-timer-chip ${this.secretRealm ? 'secret-active-chip' : ''}" title="Khi Bí Cảnh xuất hiện, bấm vào đây để tới ngay">
            ${this.getSecretTimerStatusHtml()}
          </button>
        </div>

        <div class="nct-right">
          <span id="newbie-coord-readout" class="newbie-coord-badge">🧭 (${this.cursorX}, ${this.cursorY})</span>
          <button id="btn-goto-dragon-boss" class="btn-ancient-sm affordable" style="border-color:#facc15;color:#fef08a;" title="Cuộn nhanh lên góc trên bên phải gặp Boss Rồng">
            🐉 Boss Thế Giới
          </button>
          <button id="btn-newbie-reroll-mobs" class="btn-ancient-sm affordable">🔄 Đổi Quái</button>
          <button id="btn-newbie-heal" class="btn-ancient-sm affordable">🧘 Hồi Phục</button>
          <button id="btn-newbie-forge" class="btn-ancient-sm affordable">🔨 Rèn Pháp Bảo</button>
          <button id="btn-newbie-bag" class="btn-ancient-sm affordable">🎒 Túi Đồ (<span id="nsb-bag-count">${bagCount}</span>)</button>
        </div>

        <div id="exp-stats-popover" class="exp-stats-popover hidden">
          <div class="esp-row"><span>☯️ Cảnh giới:</span> <strong id="nsb-realm">${pStats.realmName}</strong></div>
          <div class="esp-row"><span>💧 Linh lực (MP):</span> <strong id="nsb-mp">${Utils.formatNumber(this.playerCurrentMp)} / ${Utils.formatNumber(pStats.maxMp)}</strong></div>
          <div class="esp-row"><span>⚔️ Sức mạnh công kích:</span> <strong id="nsb-atk">${Utils.formatNumber(pStats.attack)}</strong></div>
          <div class="esp-row"><span>💨 Tốc độ thân pháp:</span> <strong>${Utils.formatNumber(pStats.speed)}</strong></div>
        </div>
      </div>

      <!-- 2. KHUNG BẢN ĐỒ CỔ QUYỂN PHÓNG TO -->
      <div id="newbie-map-scroll" class="newbie-map-scroll-wrap">
        <div id="newbie-anomaly-banner" class="newbie-floating-banner ${this.secretRealm ? 'anomaly-active' : ''}">
          ${this.lastLootBannerHtml || 'Vuốt cảm ứng / kéo chuột để khám phá bản đồ.'}
        </div>

        <div id="newbie-map-canvas" class="newbie-map-surface" style="width:${this.MAP_WIDTH}px;height:${this.MAP_HEIGHT}px;">
          <img src="${window.TuTien.NEWBIE_MAP_DATA_URI || 'assets/newbie_map.jpg?v=coquyen5'}" class="newbie-map-bg-img" alt="Bản Đồ Tu Tiên Cổ Quyển" draggable="false" />
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

      <!-- 3. GIAO DIỆN GIAO CHIẾN THEO LƯỢT (1v1 ARENA CÓ NHẠC CHIẾN ĐẤU) -->
      <div id="expedition-combat-overlay" class="exp-combat-overlay hidden"></div>

      <!-- 4. POPUP THÔNG TIN QUÁI / BOSS & THÁM HIỂM BÍ CẢNH 3 TẦNG -->
      <div id="newbie-popup-overlay" class="newbie-inner-modal hidden"></div>

      <!-- 5. POPUP TÚI ĐỒ NHANH -->
      <div id="newbie-bag-modal" class="newbie-inner-modal hidden"></div>

      <!-- 6. POPUP CHẾ TẠO PHÁP BẢO -->
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
    this.combatOverlayEl = document.getElementById('expedition-combat-overlay');
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

    const gotoBossBtn = document.getElementById('btn-goto-dragon-boss');
    if (gotoBossBtn) {
      gotoBossBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (this.mapScrollEl) {
          this.mapScrollEl.scrollTo({
            left: Math.max(0, this.dragonBoss.x - this.mapScrollEl.clientWidth / 2),
            top: 0,
            behavior: 'smooth'
          });
        }
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
          this.openSecretRealmAdventure();
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

    const regularHtml = this.mobSpots
      .map(mob => {
        const respawnSecLeft = Math.max(1, Math.ceil(mob.respawnRemainingMs / 1000));
        return `
          <div class="newbie-mob-spot ${mob.isDead ? 'mob-respawning' : ''}"
               data-mob-id="${mob.id}"
               style="left:${mob.x}px;top:${mob.y}px;">
            <div class="mob-spot-tag">
              <div class="mob-spot-name">${mob.name}</div>
              <div class="mob-spot-realm">${mob.realm}</div>
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

    // Render Boss Rồng cố định ở góc trên bên phải (chỗ hình con rồng)
    const bossLive = this.getDragonBossLiveStats();
    const bossCdText = this.formatMinSec(this.dragonBoss.respawnRemainingMs);
    const bossHtml = `
      <div class="newbie-mob-spot dragon-boss-spot ${this.dragonBoss.isDead ? 'mob-respawning' : ''}"
           data-mob-id="${this.dragonBoss.id}"
           style="left:${this.dragonBoss.x}px;top:${this.dragonBoss.y}px;">
        <div class="mob-spot-tag" style="background:linear-gradient(135deg,#450a0a,#7f1d1d);border-color:#facc15;">
          <div class="mob-spot-name" style="color:#fde047;">🐉 Boss Thế Giới</div>
          <div class="mob-spot-realm" style="color:#fecaca;">
            ${this.dragonBoss.isDead ? `⏳ ${bossCdText}` : bossLive.realm}
          </div>
        </div>
        ${
          this.dragonBoss.isDead
            ? `<div class="mob-spot-circle" style="border-color:#facc15;"><span class="mob-respawn-timer">⏳ ${bossCdText}</span></div>`
            : this.getCustomEntityBadgeHTML(bossLive)
        }
      </div>
    `;

    this.mobsLayerEl.innerHTML = regularHtml + bossHtml;

    this.mobsLayerEl.querySelectorAll('.newbie-mob-spot').forEach(el => {
      el.addEventListener('pointerup', e => {
        if (this.dragMoved) return;
        e.stopPropagation();
        const mobId = el.getAttribute('data-mob-id');
        if (mobId === this.dragonBoss.id) {
          this.openDragonBossPopup();
        } else {
          this.openMobPopup(mobId);
        }
      });
    });
  },

  // ===========================================================================
  // PHẦN 3: POPUP THÔNG TIN QUÁI / BOSS RỒNG & CHUYỂN VÀO GIAO DIỆN GIAO CHIẾN 1v1
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

    const Utils = window.TuTien.Utils;
    const typeTitle = mob.entityType === 'cultivator' ? 'Tán Tu Giao Đấu' : 'Yêu Thú Hoang Dã';

    this.popupOverlayEl.innerHTML = `
      <div class="newbie-modal-box">
        <div class="newbie-modal-header">
          <div style="display:flex;align-items:center;gap:12px;">
            ${this.getCustomEntityBadgeHTML(mob)}
            <div>
              <span style="font-size:0.72rem;color:var(--ivory-muted);">${typeTitle}</span>
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
            <strong style="color:#f87171">${Utils.formatNumber(mob.currentHp)} / ${Utils.formatNumber(mob.maxHp)}</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">💧 Linh lực</span>
            <strong style="color:#60a5fa">${Utils.formatNumber(mob.currentMp)} / ${Utils.formatNumber(mob.maxMp)}</strong>
          </div>
        </div>

        <div class="newbie-combat-log" style="margin-bottom:12px;">
          <div class="ncl-hint">Nhấn "⚔️ Tấn Công" để giao chiến.</div>
        </div>

        <div class="newbie-modal-actions">
          <button id="btn-enter-mob-combat" class="btn-ancient-wide ready">
            ⚔️ Tấn Công (Vào Giao Chiến)
          </button>
        </div>
      </div>
    `;

    this.popupOverlayEl.classList.remove('hidden');

    document.getElementById('btn-close-mob-popup').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.popupOverlayEl.classList.add('hidden');
    });

    document.getElementById('btn-enter-mob-combat').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.popupOverlayEl.classList.add('hidden');
      this.startTurnBasedCombat({
        sourceType: 'mob',
        sourceRef: mob,
        name: mob.name,
        realm: mob.realm,
        svgKey: mob.svgKey,
        entityType: mob.entityType,
        gender: mob.gender,
        maxHp: mob.maxHp,
        currentHp: mob.currentHp,
        attack: mob.attack,
        speed: mob.speed || 10,
        isOverlevel: mob.realmLevel - 1 > this.getPlayerStats().realmIndex
      });
    });
  },

  openDragonBossPopup() {
    if (!this.popupOverlayEl) return;
    if (this.dragonBoss.isDead) {
      const cd = this.formatMinSec(this.dragonBoss.respawnRemainingMs);
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(`🐉 Thái Cổ Thanh Long Vương đang tái tạo Long Hồn, hồi sinh sau ${cd}!`, 'info');
      }
      return;
    }

    const boss = this.getDragonBossLiveStats();
    const Utils = window.TuTien.Utils;

    this.popupOverlayEl.innerHTML = `
      <div class="newbie-modal-box" style="border-color:#facc15;max-width:540px;">
        <div class="newbie-modal-header" style="background:linear-gradient(135deg,#450a0a,#7f1d1d);margin:-16px -16px 14px -16px;padding:14px 18px;border-radius:14px 14px 0 0;border-bottom:1.5px solid #facc15;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${this.getCustomEntityBadgeHTML(boss)}
            <div>
              <h3 style="color:#fde047;">🐉 Boss Thế Giới</h3>
            </div>
          </div>
          <button id="btn-close-boss-popup" class="jade-drawer-close">✕</button>
        </div>

        <div class="newbie-mob-stats-grid">
          <div class="nms-item">
            <span class="nms-label">📍 Vị trí</span>
            <strong>(${boss.x}, ${boss.y})</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">☯️ Cảnh giới</span>
            <strong style="color:#fde047">${boss.realm}</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">❤️ Máu (HP)</span>
            <strong style="color:#f87171">${Utils.formatNumber(boss.maxHp)}</strong>
          </div>
          <div class="nms-item">
            <span class="nms-label">⚔️ Công Kích • 💨 Tốc Độ</span>
            <strong style="color:#fca5a5">${Utils.formatNumber(boss.attack)} • ${Utils.formatNumber(boss.speed)}</strong>
          </div>
        </div>

        <div class="newbie-combat-log" style="margin-bottom:12px;">
          <div style="color:#fef08a;">🐉 Kẻ trấn giữ Long Đỉnh. Đánh bại sẽ nhận nhiều kho báu và cơ hội lĩnh ngộ bí tịch ẩn.</div>
        </div>

        <button id="btn-enter-boss-combat" class="btn-ancient-wide ready ma-btn">
          ⚔️ Tấn Công
        </button>
      </div>
    `;

    this.popupOverlayEl.classList.remove('hidden');

    document.getElementById('btn-close-boss-popup').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.popupOverlayEl.classList.add('hidden');
    });

    document.getElementById('btn-enter-boss-combat').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.popupOverlayEl.classList.add('hidden');
      this.startTurnBasedCombat({
        sourceType: 'dragon_boss',
        sourceRef: boss,
        name: boss.name,
        realm: boss.realm,
        svgKey: 'dragon_boss',
        entityType: 'boss',
        maxHp: boss.maxHp,
        currentHp: boss.maxHp,
        attack: boss.attack,
        speed: boss.speed,
        isOverlevel: true
      });
    });
  },

  // ===========================================================================
  // PHẦN 4: GIAO DIỆN GIAO CHIẾN THEO LƯỢT (1v1 ARENA + NHẠC ONE-VS-ONE & CLOUDS OVER THE RIVER)
  // ===========================================================================

  startTurnBasedCombat(enemyCfg, onSecretVictory = null) {
    this.clearAutoBattle();
    const pStats = this.getPlayerStats();
    if (this.playerCurrentHp <= 0) this.playerCurrentHp = pStats.maxHp;

    this.combat = {
      turn: 1,
      busy: false,
      ended: false,
      playerGuard: false,
      playerPose: 'idle',
      enemyShake: false,
      playerShake: false,
      onSecretVictory,
      enemy: {
        ...enemyCfg,
        currentHp: enemyCfg.currentHp || enemyCfg.maxHp
      },
      player: {
        name: (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.character && window.TuTien.State.data.character.name) || 'Đạo Hữu',
        faction: window.TuTien.Character ? window.TuTien.Character.getFactionConfig() : { icon: '☯️', name: 'Chính Đạo', color: '#38bdf8' },
        gender: window.TuTien.Character ? window.TuTien.Character.getGender() : 'male',
        maxHp: pStats.maxHp,
        maxMp: pStats.maxMp,
        attack: pStats.attack,
        speed: pStats.speed,
        skillName: this.getBestPlayerSkillName()
      },
      message: `Chạm trán 【${enemyCfg.name}】 (${enemyCfg.realm})! Hãy chọn chiêu thức xuất kích.`
    };

    // Chuyển nhạc giao chiến tương ứng (one-vs-one hoặc clouds-over-the-river khi đánh vượt cấp/Boss)
    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToCombatBgm(!!enemyCfg.isOverlevel);
    }

    this.renderCombatArena();
    if (this.combatOverlayEl) {
      this.combatOverlayEl.classList.remove('hidden');
    }

    if (this.autoBattle) {
      this.scheduleAutoTurn();
    }
  },

  renderCombatArena() {
    if (!this.combatOverlayEl || !this.combat) return;
    const c = this.combat;
    const Utils = window.TuTien.Utils;

    const pHpPct = Math.max(0, Math.min(100, (this.playerCurrentHp / c.player.maxHp) * 100));
    const pMpPct = Math.max(0, Math.min(100, (this.playerCurrentMp / c.player.maxMp) * 100));
    const eHpPct = Math.max(0, Math.min(100, (c.enemy.currentHp / c.enemy.maxHp) * 100));

    const skillMpCost = Math.max(15, Math.round(c.player.maxMp * 0.2));
    const guardMpCost = Math.max(10, Math.round(c.player.maxMp * 0.12));
    const canSkill = !c.busy && !c.ended && this.playerCurrentMp >= skillMpCost;
    const canGuard = !c.busy && !c.ended && this.playerCurrentMp >= guardMpCost;

    const playerSprite =
      c.player.gender === 'female'
        ? 'assets/sprites_walk/nu/nu_di_xuong_01.png'
        : 'assets/sprites_walk/nam/nam_di_xuong_01.png';

    this.combatOverlayEl.innerHTML = `
      <div class="pk-arena-shell" style="background:linear-gradient(180deg, rgba(12,18,16,0.42) 0%, rgba(10,14,12,0.72) 100%), url('${window.TuTien.COMBAT_BG_DATA_URI || "assets/combat_secret_bg.jpg"}') center/cover no-repeat;">
        <div class="pk-top-row">
          <div class="pk-turn-badge">HIỆP ${c.turn}</div>
          <button id="btn-pk-auto" class="btn-ancient-sm ${this.autoBattle ? 'affordable' : ''}">
            ⚡ Tự Động: ${this.autoBattle ? 'Bật' : 'Tắt'}
          </button>
        </div>

        <div class="pk-stage">
          <!-- NHÂN VẬT BÊN TRÁI (Thanh Máu & Linh Lực ở TRÊN ĐẦU nhân vật) -->
          <div class="pk-side pk-player-side ${c.playerPose === 'attack' ? 'pk-dash-right' : ''} ${c.playerShake ? 'pk-shake' : ''}">
            <div class="pk-stat-card pk-player-card">
              <div class="pk-card-head">
                <strong>${c.player.name}</strong>
                <span style="color:${c.player.faction.color};font-size:0.74rem;">${c.player.faction.icon} ${c.player.faction.name}</span>
              </div>
              <div class="pk-bar-track"><div class="pk-bar-fill hp-fill" style="width:${pHpPct.toFixed(1)}%"></div></div>
              <div class="pk-bar-num">❤️ ${Utils.formatNumber(this.playerCurrentHp)} / ${Utils.formatNumber(c.player.maxHp)}</div>
              <div class="pk-bar-track mp-track"><div class="pk-bar-fill mp-fill" style="width:${pMpPct.toFixed(1)}%"></div></div>
              <div class="pk-bar-num" style="color:#7dd3fc;">💧 ${Utils.formatNumber(this.playerCurrentMp)} / ${Utils.formatNumber(c.player.maxMp)}</div>
            </div>
            <div class="pk-platform-wrap">
              <img src="${playerSprite}" class="pk-player-sprite" alt="${c.player.name}" />
              <div class="pk-platform"></div>
            </div>
          </div>

          <!-- ĐỐI THỦ BÊN PHẢI (Thanh Máu địch ở DƯỚI CHÂN địch) -->
          <div class="pk-side pk-enemy-side ${c.enemyShake ? 'pk-shake' : ''}">
            <div class="pk-platform-wrap">
              <div class="pk-enemy-sprite-box">${this.getCustomEntityBadgeHTML(c.enemy, 'pk-big-token')}</div>
              <div class="pk-platform enemy-platform"></div>
            </div>
            <div class="pk-stat-card pk-enemy-card">
              <div class="pk-card-head">
                <strong style="color:${c.enemy.entityType === 'boss' ? '#fde047' : '#f7e8c4'}">${c.enemy.name}</strong>
                <span style="color:#fca5a5;font-size:0.72rem;">${c.enemy.realm}</span>
              </div>
              <div class="pk-bar-track"><div class="pk-bar-fill enemy-hp-fill" style="width:${eHpPct.toFixed(1)}%"></div></div>
              <div class="pk-bar-num">❤️ ${Utils.formatNumber(c.enemy.currentHp)} / ${Utils.formatNumber(c.enemy.maxHp)}</div>
            </div>
          </div>
        </div>

        <div class="pk-bottom-bar">
          <div class="pk-dialogue-box">${c.message}</div>
          <div class="pk-actions-grid">
            <button id="btn-pk-basic" class="pk-action-btn" ${c.busy || c.ended ? 'disabled' : ''}>
              <strong>⚔️ Phổ Công</strong>
              <small>+15% Linh Lực</small>
            </button>
            <button id="btn-pk-skill" class="pk-action-btn skill-btn" ${!canSkill ? 'disabled' : ''}>
              <strong>✨ ${c.player.skillName}</strong>
              <small>${Utils.formatNumber(skillMpCost)} Linh Lực</small>
            </button>
            <button id="btn-pk-guard" class="pk-action-btn guard-btn" ${!canGuard ? 'disabled' : ''}>
              <strong>🛡️ Hộ Thể</strong>
              <small>${Utils.formatNumber(guardMpCost)} Linh Lực</small>
            </button>
            <button id="btn-pk-flee" class="pk-action-btn flee-btn" ${c.busy || c.ended ? 'disabled' : ''}>
              <strong>🏳️ Rút Lui</strong>
              <small>Về Bản Đồ</small>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-pk-auto').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.autoBattle = !this.autoBattle;
      this.renderCombatArena();
      if (this.autoBattle && !this.combat.busy && !this.combat.ended) {
        this.scheduleAutoTurn();
      } else {
        this.clearAutoBattle();
      }
    });

    document.getElementById('btn-pk-basic').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.executeCombatTurn('basic');
    });
    document.getElementById('btn-pk-skill').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.executeCombatTurn('skill');
    });
    document.getElementById('btn-pk-guard').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.executeCombatTurn('guard');
    });
    document.getElementById('btn-pk-flee').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.exitCombat(false, true);
    });
  },

  scheduleAutoTurn() {
    this.clearAutoBattle();
    this.autoBattleTimer = setTimeout(() => {
      if (!this.combat || this.combat.ended || this.combat.busy || !this.autoBattle) return;
      const skillMpCost = Math.max(15, Math.round(this.combat.player.maxMp * 0.2));
      if (this.playerCurrentHp < this.combat.player.maxHp * 0.35 && this.playerCurrentMp >= Math.round(this.combat.player.maxMp * 0.12)) {
        this.executeCombatTurn('guard');
      } else if (this.playerCurrentMp >= skillMpCost) {
        this.executeCombatTurn('skill');
      } else {
        this.executeCombatTurn('basic');
      }
    }, 480);
  },

  executeCombatTurn(actionType) {
    if (!this.combat || this.combat.busy || this.combat.ended) return;
    const c = this.combat;
    const Utils = window.TuTien.Utils;
    c.busy = true;
    c.playerGuard = false;
    c.playerShake = false;
    c.enemyShake = false;

    const skillMpCost = Math.max(15, Math.round(c.player.maxMp * 0.2));
    const guardMpCost = Math.max(10, Math.round(c.player.maxMp * 0.12));

    const playerAction = () => {
      c.playerPose = 'attack';
      if (actionType === 'skill' && this.playerCurrentMp >= skillMpCost) {
        this.playerCurrentMp -= skillMpCost;
        const dmg = Math.max(2, Math.round(c.player.attack * 1.85 * (0.94 + Math.random() * 0.18)));
        c.enemy.currentHp = Math.max(0, c.enemy.currentHp - dmg);
        c.enemyShake = true;
        c.message = `✨ Bạn thi triển 【${c.player.skillName}】 gây ${Utils.formatNumber(dmg)} sát thương!`;
      } else if (actionType === 'guard' && this.playerCurrentMp >= guardMpCost) {
        this.playerCurrentMp -= guardMpCost;
        c.playerGuard = true;
        const heal = Math.round(c.player.maxHp * 0.15);
        this.playerCurrentHp = Math.min(c.player.maxHp, this.playerCurrentHp + heal);
        c.message = `🛡️ Bạn vận chuyển Hộ Thể Kim Quang, hồi +${Utils.formatNumber(heal)} HP và giảm 55% sát thương nhận!`;
      } else {
        const gainMp = Math.max(10, Math.round(c.player.maxMp * 0.15));
        this.playerCurrentMp = Math.min(c.player.maxMp, this.playerCurrentMp + gainMp);
        const dmg = Math.max(1, Math.round(c.player.attack * (0.92 + Math.random() * 0.2)));
        c.enemy.currentHp = Math.max(0, c.enemy.currentHp - dmg);
        c.enemyShake = true;
        c.message = `⚔️ Bạn xuất Phổ Công gây ${Utils.formatNumber(dmg)} sát thương (+${Utils.formatNumber(gainMp)} Linh Lực)!`;
      }
      this.renderCombatArena();
    };

    const enemyAction = () => {
      c.playerPose = 'idle';
      c.enemyShake = false;
      const rawDmg = Math.max(1, Math.round(c.enemy.attack * (0.88 + Math.random() * 0.24)));
      const finalDmg = c.playerGuard ? Math.max(1, Math.round(rawDmg * 0.45)) : rawDmg;
      this.playerCurrentHp = Math.max(0, this.playerCurrentHp - finalDmg);
      c.playerShake = true;
      c.message = `💥 ${c.enemy.name} phản kích gây ${Utils.formatNumber(finalDmg)} sát thương!`;
      this.renderCombatArena();
    };

    const playerFirst = c.player.speed >= (c.enemy.speed || 10);

    const finishRound = () => {
      c.playerPose = 'idle';
      c.playerShake = false;
      c.enemyShake = false;
      if (c.enemy.currentHp <= 0) {
        c.ended = true;
        c.message = `🏆 Chiến thắng! Đã hạ gục 【${c.enemy.name}】! Đang thu chiến lợi phẩm...`;
        this.renderCombatArena();
        setTimeout(() => this.exitCombat(true, false), 750);
      } else if (this.playerCurrentHp <= 0) {
        c.ended = true;
        this.playerCurrentHp = 1;
        c.message = `⚠️ Bạn đã trọng thương trước 【${c.enemy.name}】! Đang tự động rút về bản đồ...`;
        this.renderCombatArena();
        setTimeout(() => this.exitCombat(false, false), 850);
      } else {
        c.turn += 1;
        c.busy = false;
        this.renderCombatArena();
        if (this.autoBattle) this.scheduleAutoTurn();
      }
    };

    if (playerFirst) {
      playerAction();
      setTimeout(() => {
        if (!this.combat) return;
        if (c.enemy.currentHp <= 0) {
          finishRound();
        } else {
          enemyAction();
          setTimeout(finishRound, 380);
        }
      }, 380);
    } else {
      enemyAction();
      setTimeout(() => {
        if (!this.combat) return;
        if (this.playerCurrentHp <= 0) {
          finishRound();
        } else {
          playerAction();
          setTimeout(finishRound, 380);
        }
      }, 380);
    }
  },

  exitCombat(isVictory, retreated) {
    this.clearAutoBattle();
    const c = this.combat;
    this.combat = null;

    if (this.combatOverlayEl) {
      this.combatOverlayEl.classList.add('hidden');
    }
    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToTrainingBgm();
    }

    if (!c) return;

    if (retreated) {
      this.lastLootBannerHtml = `🏳️ Đã rút lui an toàn khỏi trận chiến với ${c.enemy.name}.`;
    } else if (isVictory) {
      if (c.enemy.sourceType === 'mob') {
        const mob = c.enemy.sourceRef;
        const droppedItems = this.rollHiddenDropsAndAddToBag(mob);
        const dropPlain = droppedItems.map(d => `${d.icon} ${d.name} [${d.tierName}] ×${d.qty}`).join(', ');
        const dropHtml = droppedItems
          .map(d => `<strong style="color:${d.color}">${d.icon} ${d.name} [${d.tierName}] ×${d.qty}</strong>`)
          .join(', ');

        const stoneGain = mob.realmLevel * 6;
        if (window.TuTien.Inventory) window.TuTien.Inventory.addSpiritStones(stoneGain);

        mob.currentHp = 0;
        mob.isDead = true;
        mob.respawnRemainingMs = mob.respawnSec * 1000;

        this.lastLootBannerHtml = `🏆 <strong>Hạ gục ${mob.name}!</strong> Nhận: <strong style="color:#38bdf8">+${stoneGain} Linh Thạch</strong>, ${dropHtml}`;
        if (window.TuTien.UI) {
          window.TuTien.UI.showToast(`🏆 Hạ ${mob.name}: +${stoneGain} Linh Thạch, ${dropPlain}!`, 'success');
        }
      } else if (c.enemy.sourceType === 'dragon_boss') {
        this.handleDragonBossVictory(c.enemy.sourceRef);
      } else if (c.enemy.sourceType === 'secret_guardian' && typeof c.onSecretVictory === 'function') {
        c.onSecretVictory();
      }
    } else {
      this.lastLootBannerHtml = `⚠️ Bạn đã thất bại trước ${c.enemy.name}! Hãy bấm 🧘 Hồi Phục hoặc 🔨 Rèn Pháp Bảo tăng sức mạnh!`;
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(`⚠️ Thất bại trước ${c.enemy.name}, đã tự rút về bản đồ!`, 'warn');
      }
    }

    if (this.anomalyBannerEl && !this.secretRealm) {
      this.anomalyBannerEl.innerHTML = this.lastLootBannerHtml;
    }
    this.renderMobSpots();
    this.updateStatusBar();
  },

  handleDragonBossVictory(boss) {
    const Inv = window.TuTien.Inventory;
    const State = window.TuTien.State;
    const Utils = window.TuTien.Utils;

    this.dragonBoss.isDead = true;
    this.dragonBoss.respawnRemainingMs = this.dragonBoss.respawnSec * 1000; // 3 phút = 180s

    const stones = 180 + boss.realmDisplayNumber * 12;
    if (Inv) Inv.addSpiritStones(stones);

    const realmObj = State ? State.getCurrentRealm() : { req: 200 };
    const bonusQi = Math.max(250, Math.floor((realmObj.req || 200) * 0.45));
    if (State && State.data) {
      State.data.qi += bonusQi;
      State.data.totalQiEarned += bonusQi;
    }

    const qObj = (window.TuTien.ITEM_QUALITIES || []).find(q => q.tier === 4) || { tier: 4, name: 'Cực Phẩm', color: '#facc15', mult: 3.2 };
    if (Inv && typeof Inv.addStackableItem === 'function') {
      Inv.addStackableItem('material', 'vang_tinh_kim', 'Thái Ất Tinh Kim (Vàng)', '🌕', qObj, 'Chiến lợi phẩm từ Thái Cổ Thanh Long Vương.', 3);
      Inv.addStackableItem('material', 'sat_khoang', 'Huyền Thiết (Sắt)', '⛏️', qObj, 'Chiến lợi phẩm từ Thái Cổ Thanh Long Vương.', 4);
      Inv.addStackableItem('material', 'da_khoang', 'Thanh Linh Thạch (Đá)', '⛰️', qObj, 'Chiến lợi phẩm từ Thái Cổ Thanh Long Vương.', 4);
    }

    const unlockedMsg = this.tryUnlockHiddenSecretItem();
    const msg = `🐉 <strong>TRẢM LONG THÀNH CÔNG!</strong> Nhận +${stones} Linh Thạch, +${Utils.formatNumber(bonusQi)} Tu Vi, 🌕×3 Vàng, ⛏️×4 Sắt, ⛰️×4 Đá${unlockedMsg ? ` • ${unlockedMsg}` : ''}! (Hồi sinh sau 3 phút)`;
    this.lastLootBannerHtml = msg;

    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`🐉 Hạ gục Thái Cổ Thanh Long Vương! ${unlockedMsg || 'Nhận kho báu Long Vương!'}`, 'success');
    }
  },

  /**
   * Cơ hội mở khóa 1 Bí Tịch Công Pháp, Đan Phương hoặc Phù Phương đang ẩn (???)
   */
  tryUnlockHiddenSecretItem() {
    const Upgrades = window.TuTien.Upgrades;
    const Fields = window.TuTien.Fields;

    const lockedTechs = (window.TuTien.UPGRADES || []).filter(u => u.requiresUnlock && Upgrades && !Upgrades.isUnlocked(u));
    const lockedPills = (window.TuTien.PILL_RECIPES || []).filter(p => p.requiresRecipeUnlock && Fields && !Fields.isPillRecipeUnlocked(p));
    const lockedTals = (window.TuTien.TALISMAN_RECIPES || []).filter(t => t.requiresRecipeUnlock && Fields && !Fields.isTalismanRecipeUnlocked(t));

    const pool = [];
    lockedTechs.forEach(x => pool.push({ kind: 'tech', obj: x }));
    lockedPills.forEach(x => pool.push({ kind: 'pill', obj: x }));
    lockedTals.forEach(x => pool.push({ kind: 'tal', obj: x }));

    if (pool.length === 0) return '';
    const pick = pool[Math.floor(Math.random() * pool.length)];

    if (pick.kind === 'tech' && Upgrades) {
      Upgrades.unlockTechnique(pick.obj.id);
      return `📖 Lĩnh ngộ Bí Tịch ẩn: 【${Upgrades.getDisplayName(pick.obj)}】`;
    }
    if (pick.kind === 'pill' && Fields && typeof Fields.unlockPillRecipe === 'function') {
      Fields.unlockPillRecipe(pick.obj.id);
      return `📜 Mở khóa Đan Phương ẩn: 【${pick.obj.name}】`;
    }
    if (pick.kind === 'tal' && Fields && typeof Fields.unlockTalismanRecipe === 'function') {
      Fields.unlockTalismanRecipe(pick.obj.id);
      return `📜 Mở khóa Phù Phương ẩn: 【${pick.obj.name}】`;
    }
    return '';
  },

  rollHiddenDropsAndAddToBag(mob) {
    const results = [];
    const Inv = window.TuTien.Inventory;
    const qualities = window.TuTien.ITEM_QUALITIES || [];

    const pickDropQuality = maxTier => {
      const cap = Math.max(1, Math.min(5, maxTier || 2));
      const allowed = qualities.filter(q => q.tier <= cap);
      if (!allowed.length) return { tier: 1, name: 'Hạ Phẩm', color: '#94a3b8', mult: 1 };
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
      if (Inv && typeof Inv.addStackableItem === 'function') {
        Inv.addStackableItem(
          drop.category,
          drop.id,
          drop.name,
          drop.icon,
          qObj,
          `${drop.typeLabel} thu thập khi đánh bại ${mob.name}.`,
          qty
        );
      }
    };

    (mob.hiddenDrops || []).forEach(drop => {
      if (Math.random() <= drop.chance) {
        const qty = drop.minQty + Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1));
        const qObj = pickDropQuality(drop.maxTier);
        addDropToInventory(drop, qObj, qty);
        results.push({ name: drop.name, icon: drop.icon, qty, tierName: qObj.name, color: qObj.color });
      }
    });

    if (results.length === 0 && mob.hiddenDrops && mob.hiddenDrops.length > 0) {
      const firstDrop = mob.hiddenDrops[0];
      const qObj = pickDropQuality(1);
      addDropToInventory(firstDrop, qObj, 1);
      results.push({ name: firstDrop.name, icon: firstDrop.icon, qty: 1, tierName: qObj.name, color: qObj.color });
    }

    return results;
  },

  // ===========================================================================
  // PHẦN 5: BÍ CẢNH 5 CẤP ĐỘ — THÁM HIỂM 3 TẦNG TƯƠNG TÁC THÚ VỊ
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

    const bannerMsg = `⚡ Dị tượng xuất hiện: 【${chosenName} — ${tierCfg.rankLabel}】 vừa mở trên bản đồ (30s)!`;
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
        this.openSecretRealmAdventure();
      });
    }
  },

  openSecretRealmAdventure() {
    if (!this.secretRealm || !this.popupOverlayEl) return;
    // Khởi tạo phiên thám hiểm 3 tầng cho Bí Cảnh này
    this.secretRun = {
      realm: { ...this.secretRealm },
      stage: 1, // 1 -> 2 -> 3
      logs: [`Bước chân vào 【${this.secretRealm.name} — ${this.secretRealm.rankLabel}】! Hãy chọn hướng khám phá ở Tầng 1.`],
      lootStones: 0,
      lootQi: 0,
      lootItems: [],
      unlockedNotice: ''
    };
    // Đóng cổng bản đồ để tránh hết 30s giữa chừng khi đang thám hiểm bên trong
    this.secretRealm = null;
    this.scheduleNextSecretRealm();
    this.renderSecretRealmSpot();
    this.updateStatusBar();

    this.renderSecretAdventureModal();
  },

  renderSecretAdventureModal() {
    if (!this.secretRun || !this.popupOverlayEl) return;
    const run = this.secretRun;
    const sr = run.realm;
    const Utils = window.TuTien.Utils;

    const stageTitles = {
      1: 'Tầng 1 / 3 — Ngoại Vi Linh Trận',
      2: 'Tầng 2 / 3 — Cổ Điện Kỳ Ngộ',
      3: 'Tầng 3 / 3 — Bảo Khố Lõi Bí Cảnh'
    };

    const stageChoices = {
      1: [
        { key: 'ore', icon: '⛏️', title: 'Khai Phá Mạch Linh Khoáng', desc: 'Đào sâu vào vách đá phát sáng thu thập Sắt, Đá, Gỗ và có tỉ lệ tìm thấy Vàng.', tag: 'An Toàn' },
        { key: 'array', icon: '🔮', title: 'Phá Giải Cổ Trận Bằng Linh Lực', desc: 'Dùng thần thức phá cấm chế cổ để nhận nhiều Linh Thạch & lĩnh ngộ Tu Vi.', tag: 'Kỳ Ngộ' },
        { key: 'herb', icon: '🌿', title: 'Hái Linh Dược Trong Sương Mù', desc: 'Lần theo mùi hương lạ để hái Linh Thảo hiếm (cẩn thận yêu thú phục kích!).', tag: 'Mạo Hiểm' }
      ],
      2: [
        { key: 'coffin', icon: '⚱️', title: 'Mở Thạch Quan Tiên Nhân', desc: 'Có cơ hội tìm thấy Bí Tịch / Đan Phương ẩn (???) hoặc kho Linh Thạch lớn!', tag: 'Bí Ẩn' },
        { key: 'spring', icon: '♨️', title: 'Đả Tọa Bên Linh Tuyền Cổ', desc: 'Hồi đầy 100% Máu & Linh Lực đồng thời tăng trực tiếp lượng lớn Tu Vi.', tag: 'Hồi Phục' },
        { key: 'ambush', icon: '⚔️', title: 'Khiêu Chiến Tinh Anh Tuần Tra', desc: 'Vào giao chiến 1v1 đánh bại thủ vệ tầng 2 để đoạt rương Vàng & Sắt.', tag: 'Giao Chiến' }
      ],
      3: [
        { key: 'vault_safe', icon: '🗝️', title: 'Mở Rương Ngoại Khố (An Toàn)', desc: 'Lấy toàn bộ phần thưởng bảo khố cơ bản và hoàn tất chuyến thám hiểm.', tag: '100% Thành Công' },
        { key: 'vault_boss', icon: '👹', title: `Trảm ${sr.guardianName} Đoạt Lõi Bảo Khố`, desc: 'Giao chiến 1v1 với Hộ Pháp Bí Cảnh! Thắng nhận GẤP ĐÔI thưởng lõi + tỉ lệ cao mở Bí Tịch ẩn (???)!', tag: 'Thưởng x2' }
      ]
    };

    const choices = stageChoices[run.stage] || [];
    const lootChips = [
      run.lootStones > 0 ? `💎 +${run.lootStones} Linh Thạch` : '',
      run.lootQi > 0 ? `✨ +${Utils.formatNumber(run.lootQi)} Tu Vi` : '',
      ...run.lootItems.map(it => `${it.icon} ${it.name} ×${it.qty}`)
    ].filter(Boolean);

    this.popupOverlayEl.innerHTML = `
      <div class="newbie-modal-box secret-modal-xl" style="border-color:${sr.color};background:linear-gradient(180deg, rgba(16,20,16,0.78) 0%, rgba(12,14,12,0.88) 100%), url('${window.TuTien.COMBAT_BG_DATA_URI || "assets/combat_secret_bg.jpg"}') center/cover no-repeat;">
        <div class="newbie-modal-header" style="background:${sr.bgGradient};margin:-20px -20px 14px -20px;padding:14px 20px;border-radius:16px 16px 0 0;border-bottom:1.5px solid ${sr.color};">
          <div>
            <div style="font-size:0.8rem;color:#fef08a;font-weight:700;">★ ${sr.rankLabel.toUpperCase()} • ${stageTitles[run.stage]}</div>
            <h3 style="font-size:1.38rem;color:#ffffff;margin-top:2px;">🌀 ${sr.name}</h3>
          </div>
          <button id="btn-secret-retreat" class="btn-ancient-sm affordable" title="Mang toàn bộ chiến lợi phẩm đã thu rời khỏi Bí Cảnh">
            🚪 Rời Bí Cảnh
          </button>
        </div>

        <!-- Thanh tiến trình 3 tầng -->
        <div class="secret-stage-stepper">
          <span class="step-pill ${run.stage >= 1 ? 'done' : ''}">1. Ngoại Vi</span>
          <span class="step-arrow">➜</span>
          <span class="step-pill ${run.stage >= 2 ? 'done' : ''}">2. Cổ Điện</span>
          <span class="step-arrow">➜</span>
          <span class="step-pill ${run.stage >= 3 ? 'done' : ''}">3. Bảo Khố Lõi</span>
        </div>

        <!-- Nhật ký thám hiểm -->
        <div class="newbie-combat-log" style="max-height:110px;margin-bottom:12px;">
          ${run.logs.map(l => `<div class="ncl-line">${l}</div>`).join('')}
        </div>

        <!-- Lựa chọn tương tác của Tầng hiện tại -->
        <div class="secret-choice-grid" style="grid-template-columns:repeat(${choices.length}, 1fr);">
          ${choices
            .map(
              ch => `
              <div class="secret-choice-card ${ch.key === 'vault_boss' || ch.key === 'ambush' ? 'boss-card' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-size:1.45rem;">${ch.icon}</span>
                  <span class="jade-badge" style="color:${sr.color};border-color:${sr.color}">${ch.tag}</span>
                </div>
                <div class="scc-title" style="color:#f7e8c4;">${ch.title}</div>
                <p class="scc-desc">${ch.desc}</p>
                <button class="btn-ancient-wide ready btn-secret-step-choice" data-choice="${ch.key}" style="margin-top:auto;">
                  Chọn Lối Này
                </button>
              </div>
            `
            )
            .join('')}
        </div>

        <!-- Túi chiến lợi phẩm đã gom được trong Bí Cảnh -->
        <div class="secret-loot-pouch">
          <strong>🎒 Chiến lợi phẩm đã thu:</strong>
          <span>${lootChips.length ? lootChips.join(' • ') : 'Chưa có (Hãy chọn 1 lối khám phá ở trên)'}</span>
        </div>
      </div>
    `;

    this.popupOverlayEl.classList.remove('hidden');

    document.getElementById('btn-secret-retreat').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.finishSecretAdventure('🚪 Đã mang toàn bộ bảo vật rời khỏi Bí Cảnh an toàn!');
    });

    this.popupOverlayEl.querySelectorAll('.btn-secret-step-choice').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.handleSecretStageChoice(btn.getAttribute('data-choice'));
      });
    });
  },

  grantSecretLoot(stones, qi, matId, matName, matIcon, matQty, tier, category = 'material') {
    const Inv = window.TuTien.Inventory;
    const State = window.TuTien.State;
    const run = this.secretRun;

    if (stones > 0) {
      if (Inv) Inv.addSpiritStones(stones);
      if (run) run.lootStones += stones;
    }
    if (qi > 0 && State && State.data) {
      State.data.qi += qi;
      State.data.totalQiEarned += qi;
      if (run) run.lootQi += qi;
    }
    if (matId && matQty > 0 && Inv && typeof Inv.addStackableItem === 'function') {
      const qObj = (window.TuTien.ITEM_QUALITIES || []).find(q => q.tier === tier) || { tier: 2, name: 'Trung Phẩm', color: '#4ade80', mult: 1.5 };
      Inv.addStackableItem(category, matId, matName, matIcon, qObj, `Thu thập từ Bí Cảnh ${run ? run.realm.name : ''}.`, matQty);
      if (run) run.lootItems.push({ name: matName, icon: matIcon, qty: matQty });
    }
  },

  handleSecretStageChoice(choiceKey) {
    if (!this.secretRun) return;
    const run = this.secretRun;
    const sr = run.realm;
    const State = window.TuTien.State;
    const Utils = window.TuTien.Utils;
    const realmReq = (State ? State.getCurrentRealm().req : 120) || 120;

    if (choiceKey === 'ore') {
      const mats = [
        { id: 'sat_khoang', name: 'Sắt', icon: '⛏️' },
        { id: 'da_khoang', name: 'Đá', icon: '⛰️' },
        { id: 'go_linh_moc', name: 'Gỗ', icon: '🌲' }
      ];
      const pick = mats[Math.floor(Math.random() * mats.length)];
      const qty = sr.matQty[0] + Math.floor(Math.random() * 2);
      this.grantSecretLoot(15 * sr.tier, 0, pick.id, pick.name, pick.icon, qty, sr.maxItemTier);
      if (Math.random() <= sr.goldChance) {
        this.grantSecretLoot(0, 0, 'vang_tinh_kim', 'Vàng', '🌕', 1, sr.maxItemTier);
        run.logs.push(`⛏️ Khai phá mạch khoáng thu được ${pick.icon} ${pick.name} ×${qty} và trúng mạch 🌕 Vàng ×1!`);
      } else {
        run.logs.push(`⛏️ Khai phá mạch khoáng thu được ${pick.icon} ${pick.name} ×${qty} và +${15 * sr.tier} Linh Thạch!`);
      }
      run.stage = 2;
      this.renderSecretAdventureModal();
    } else if (choiceKey === 'array') {
      const st = sr.stoneReward[0];
      const qi = Math.max(60, Math.floor(realmReq * 0.12 * sr.qiMult));
      this.grantSecretLoot(st, qi, null, null, null, 0, sr.maxItemTier);
      run.logs.push(`🔮 Phá giải cổ trận thành công! Nhận +${st} Linh Thạch và +${Utils.formatNumber(qi)} Tu Vi!`);
      run.stage = 2;
      this.renderSecretAdventureModal();
    } else if (choiceKey === 'herb') {
      const herbs = window.TuTien.HERB_TYPES || [];
      const pickH = herbs[Math.floor(Math.random() * herbs.length)] || { id: 'tu_linh_thao', name: 'Tụ Linh Thảo', icon: '🌿' };
      this.grantSecretLoot(0, 0, pickH.id, pickH.name, pickH.icon, 2, sr.maxItemTier, 'herb');
      run.logs.push(`🌿 Hái được ${pickH.icon} ${pickH.name} ×2 trong sương mù!`);
      run.stage = 2;
      this.renderSecretAdventureModal();
    } else if (choiceKey === 'coffin') {
      const st = Math.round(sr.stoneReward[1] * 0.7);
      this.grantSecretLoot(st, 0, 'vang_tinh_kim', 'Vàng', '🌕', 1, sr.maxItemTier);
      const unlocked = Math.random() < 0.45 ? this.tryUnlockHiddenSecretItem() : '';
      run.logs.push(`⚱️ Mở Thạch Quan nhận +${st} Linh Thạch, 🌕 Vàng ×1${unlocked ? ` và ${unlocked}` : ''}!`);
      run.stage = 3;
      this.renderSecretAdventureModal();
    } else if (choiceKey === 'spring') {
      const pStats = this.getPlayerStats();
      this.playerCurrentHp = pStats.maxHp;
      this.playerCurrentMp = pStats.maxMp;
      const qi = Math.max(90, Math.floor(realmReq * 0.2 * sr.qiMult));
      this.grantSecretLoot(0, qi, null, null, null, 0, sr.maxItemTier);
      run.logs.push(`♨️ Đả tọa bên Linh Tuyền hồi đầy 100% HP/MP và ngộ đạo +${Utils.formatNumber(qi)} Tu Vi!`);
      run.stage = 3;
      this.renderSecretAdventureModal();
    } else if (choiceKey === 'ambush') {
      const pStats = this.getPlayerStats();
      this.popupOverlayEl.classList.add('hidden');
      this.startTurnBasedCombat(
        {
          sourceType: 'secret_guardian',
          name: `Thủ Vệ ${sr.name}`,
          realm: sr.recommendRealm,
          svgKey: sr.guardianSvg || 'golem',
          entityType: 'monster',
          maxHp: Math.max(120, Math.round(pStats.maxHp * 0.9)),
          attack: Math.max(15, Math.round(pStats.attack * 0.72)),
          speed: Math.round(pStats.speed * 0.9),
          isOverlevel: false
        },
        () => {
          this.grantSecretLoot(sr.stoneReward[0], 0, 'vang_tinh_kim', 'Vàng', '🌕', 2, sr.maxItemTier);
          run.logs.push(`⚔️ Hạ gục Thủ Vệ tầng 2! Đoạt +${sr.stoneReward[0]} Linh Thạch và 🌕 Vàng ×2!`);
          run.stage = 3;
          this.renderSecretAdventureModal();
        }
      );
    } else if (choiceKey === 'vault_safe') {
      const st = sr.stoneReward[1];
      const qi = Math.max(100, Math.floor(realmReq * 0.18 * sr.qiMult));
      this.grantSecretLoot(st, qi, 'sat_khoang', 'Sắt', '⛏️', sr.matQty[1], sr.maxItemTier);
      this.finishSecretAdventure(`✨ Hoàn tất 【${sr.name} — ${sr.rankLabel}】! Đã thu toàn bộ bảo vật về Túi Đồ!`);
    } else if (choiceKey === 'vault_boss') {
      const pStats = this.getPlayerStats();
      this.popupOverlayEl.classList.add('hidden');
      this.startTurnBasedCombat(
        {
          sourceType: 'secret_guardian',
          name: sr.guardianName,
          realm: `${sr.rankLabel}`,
          svgKey: sr.guardianSvg || 'tiger',
          entityType: 'monster',
          maxHp: Math.max(220, Math.round(pStats.maxHp * (1.1 + sr.tier * 0.14))),
          attack: Math.max(22, Math.round(pStats.attack * (0.82 + sr.tier * 0.06))),
          speed: Math.round(pStats.speed * 1.05),
          isOverlevel: sr.tier >= 3
        },
        () => {
          const st = sr.stoneReward[1] * 2;
          const qi = Math.max(160, Math.floor(realmReq * 0.35 * sr.qiMult));
          this.grantSecretLoot(st, qi, 'vang_tinh_kim', 'Vàng', '🌕', sr.tier + 1, sr.maxItemTier);
          const unlocked = this.tryUnlockHiddenSecretItem();
          this.finishSecretAdventure(
            `🏆 Đánh bại 【${sr.guardianName}】 đoạt Lõi Bảo Khố x2!${unlocked ? ` ${unlocked}!` : ''}`
          );
        }
      );
    }
  },

  finishSecretAdventure(summaryText) {
    this.secretRun = null;
    if (this.popupOverlayEl) this.popupOverlayEl.classList.add('hidden');
    this.lastLootBannerHtml = summaryText;
    if (this.anomalyBannerEl && !this.secretRealm) {
      this.anomalyBannerEl.innerHTML = summaryText;
      this.anomalyBannerEl.classList.remove('anomaly-active');
    }
    this.updateStatusBar();
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(summaryText, 'success');
    }
  },

  // ===========================================================================
  // PHẦN 6: TÚI ĐỒ NHANH & LÒ CHẾ TẠO PHÁP BẢO
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
        <div class="newbie-bag-list">${listHtml}</div>
      </div>
    `;

    this.bagModalEl.classList.remove('hidden');
    document.getElementById('btn-close-quick-bag').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.bagModalEl.classList.add('hidden');
    });
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
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${matSummary}</div>
        <div class="newbie-bag-list" style="max-height:360px;">${recipesHtml}</div>
      </div>
    `;

    this.forgeModalEl.classList.remove('hidden');

    document.getElementById('btn-close-quick-forge').addEventListener('pointerdown', e => {
      e.preventDefault();
      this.forgeModalEl.classList.add('hidden');
    });

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
  // PHẦN 7: VÒNG LẶP THỜI GIAN THỰC (update & tick)
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

    // Đếm ngược hồi sinh 3 phút của Boss Rồng cố định
    if (this.dragonBoss.isDead) {
      const prevSec = Math.ceil(this.dragonBoss.respawnRemainingMs / 1000);
      this.dragonBoss.respawnRemainingMs -= dtMs;
      const nextSec = Math.ceil(this.dragonBoss.respawnRemainingMs / 1000);
      if (this.dragonBoss.respawnRemainingMs <= 0) {
        this.dragonBoss.isDead = false;
        this.dragonBoss.respawnRemainingMs = 0;
        needRenderMobs = true;
        if (this.isOpen && window.TuTien.UI) {
          window.TuTien.UI.showToast('🐉 Thái Cổ Thanh Long Vương đã hồi sinh tại Long Đỉnh (góc trên bên phải)!', 'warn');
        }
      } else if (prevSec !== nextSec) {
        needRenderMobs = true;
      }
    }

    if (needRenderMobs && this.isOpen) {
      this.renderMobSpots();
    }

    // Nếu đang thám hiểm bên trong Bí Cảnh thì tạm dừng bộ đếm sinh Bí Cảnh ngoài bản đồ
    if (this.secretRun) return;

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
