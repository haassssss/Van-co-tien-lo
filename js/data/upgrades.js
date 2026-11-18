/**
 * js/data/upgrades.js
 * Danh sách 13 Công Pháp (7 Nhập Môn + 6 Bí Tịch Xuất Quan) & 5 Pháp Bảo Đạo Vận:
 * - Bổ sung `shortDesc` ngắn gọn súc tích cho giao diện mặc định, giữ `description` đầy đủ cho mục Giải Thích Chi Tiết.
 */
window.TuTien = window.TuTien || {};

window.TuTien.UPGRADES = [
  {
    id: 'tu_linh_tran',
    faction: 'both',
    requiresUnlock: false,
    name: 'Tụ Linh Trận',
    chinhName: 'Thái Thanh Tụ Linh Trận',
    maName: 'Huyết Hải Thôn Linh Trận',
    icon: '۞',
    category: 'passive',
    shortDesc: 'Tăng tốc độ hấp thụ nền & Linh Lực',
    description: 'Thu gom linh khí thiên địa, tăng tốc độ hấp thụ nền và tăng Linh Lực tối đa.',
    baseCost: 20,
    costMultiplier: 1.20,
    effectType: 'add_passive_base',
    effectPerLevel: 1.2,
    combatStatsPerLevel: { hp: 10, mp: 22, speed: 0, attack: 2 },
    formatEffect(level, qualityMult = 1.0) {
      const rate = (level * this.effectPerLevel * qualityMult).toFixed(1).replace(/\.0$/, '');
      const mp = Math.round(level * 22 * qualityMult);
      return `+${rate} LK/s cơ bản • +${mp} Linh Lực`;
    }
  },
  {
    id: 'dan_khi_quyet',
    faction: 'both',
    requiresUnlock: false,
    name: 'Dẫn Khí Quyết',
    chinhName: 'Hạo Nhiên Ngự Kiếm Quyết',
    maName: 'Vạn Hồn Phệ Huyết Trảo',
    icon: '⚔️',
    category: 'click',
    shortDesc: 'Tăng linh khí mỗi chạm & Sức Mạnh',
    description: 'Công pháp sát phạt chủ động: tăng mạnh linh khí mỗi lần chạm và tăng Sức Mạnh công kích.',
    baseCost: 30,
    costMultiplier: 1.22,
    effectType: 'add_click_base',
    effectPerLevel: 2.0,
    combatStatsPerLevel: { hp: 5, mp: 5, speed: 1, attack: 7 },
    formatEffect(level, qualityMult = 1.0) {
      const click = (level * this.effectPerLevel * qualityMult).toFixed(1).replace(/\.0$/, '');
      const atk = Math.round(level * 7 * qualityMult);
      return `+${click} LK/chạm • +${atk} Sức Mạnh`;
    }
  },
  {
    id: 'chu_thien_kinh',
    faction: 'both',
    requiresUnlock: false,
    name: 'Chu Thiên Đại Pháp',
    chinhName: 'Cửu Chuyển Thuần Dương Kinh',
    maName: 'Thiên Ma Giải Thể Đại Pháp',
    icon: '☸',
    category: 'passive_mult',
    shortDesc: 'Tăng % tốc độ nền, EXP Lĩnh Vực & Máu',
    description: 'Tâm pháp cốt lõi tăng phần trăm tốc độ hấp thụ nền, EXP Lĩnh Vực và tăng mạnh Máu + Sức Mạnh.',
    baseCost: 140,
    costMultiplier: 1.24,
    effectType: 'mult_passive_pct',
    effectPerLevel: 0.16,
    combatStatsPerLevel: { hp: 35, mp: 18, speed: 1, attack: 5 },
    formatEffect(level, qualityMult = 1.0) {
      const pct = Math.round(level * this.effectPerLevel * qualityMult * 100);
      const hp = Math.round(level * 35 * qualityMult);
      return `+${pct}% tốc độ nền • +${hp} Máu`;
    }
  },
  {
    id: 'ngung_than_thuat',
    faction: 'both',
    requiresUnlock: false,
    name: 'Ngưng Thần Thân Pháp',
    chinhName: 'Lăng Ba Tiên Vân Bộ',
    maName: 'U Minh Quỷ Ảnh Bộ',
    icon: '💨',
    category: 'boost_duration',
    shortDesc: 'Kéo dài Tăng Tốc & tăng Tốc Độ ra đòn',
    description: 'Thân pháp tuyệt thế kéo dài thời gian Tăng Tốc và tăng mạnh Tốc Độ ra đòn khi giao chiến.',
    baseCost: 110,
    costMultiplier: 1.22,
    effectType: 'add_boost_duration_ms',
    effectPerLevel: 180,
    combatStatsPerLevel: { hp: 12, mp: 10, speed: 4, attack: 2 },
    formatEffect(level, qualityMult = 1.0) {
      const sec = ((level * this.effectPerLevel * qualityMult) / 1000).toFixed(2);
      const spd = Math.round(level * 4 * qualityMult);
      return `+${sec}s Tăng Tốc • +${spd} Tốc Độ`;
    }
  },
  {
    id: 'cuu_chuyen_combo',
    faction: 'both',
    requiresUnlock: false,
    name: 'Cửu Chuyển Liên Hoàn',
    chinhName: 'Kim Cang Hộ Thể Công',
    maName: 'Cửu U Huyết Giáp Công',
    icon: '🛡️',
    category: 'combo_max',
    shortDesc: 'Nâng trần Combo & tăng lượng lớn Máu',
    description: 'Rèn luyện nhục thân bất hoại, nâng giới hạn Combo tối đa và tăng lượng lớn Máu hộ thể.',
    baseCost: 220,
    costMultiplier: 1.24,
    effectType: 'add_max_combo',
    effectPerLevel: 0.35,
    combatStatsPerLevel: { hp: 60, mp: 15, speed: 0, attack: 4 },
    formatEffect(level, qualityMult = 1.0) {
      const combo = (level * this.effectPerLevel * qualityMult).toFixed(2);
      const hp = Math.round(level * 60 * qualityMult);
      return `+${combo}x giới hạn Combo • +${hp} Máu`;
    }
  },
  {
    id: 'long_mach_linh_tuyen',
    faction: 'both',
    requiresUnlock: false,
    name: 'Long Mạch Linh Tuyền',
    chinhName: 'Thiên Cang Kiếm Trận Đồ',
    maName: 'Tu La Huyết Sát Trận',
    icon: '🐉',
    category: 'click_from_passive',
    shortDesc: 'Chuyển % tốc độ nền vào Click & +4 chỉ số',
    description: 'Chuyển hóa tốc độ tu luyện nền vào mỗi cú chạm và gia tăng cả 4 chỉ số chiến đấu.',
    baseCost: 520,
    costMultiplier: 1.25,
    effectType: 'click_percent_of_passive',
    effectPerLevel: 0.06,
    combatStatsPerLevel: { hp: 40, mp: 30, speed: 3, attack: 10 },
    formatEffect(level, qualityMult = 1.0) {
      const pct = Math.round(level * this.effectPerLevel * qualityMult * 100);
      const atk = Math.round(level * 10 * qualityMult);
      return `+${pct}% tốc độ nền vào Click • +${atk} Công`;
    }
  },
  {
    id: 'pha_canh_dan_lo',
    faction: 'both',
    requiresUnlock: false,
    name: 'Phá Cảnh Tâm Kinh',
    chinhName: 'Thiên Đạo Thanh Tâm Chú',
    maName: 'Nghịch Thiên Trảm Đạo Quyết',
    icon: '🏺',
    category: 'breakthrough',
    shortDesc: 'Tăng tỉ lệ Đột Phá & Linh Lực tối đa',
    description: 'Ổn định đạo tâm, tăng tỉ lệ thành công khi đột phá Đại Cảnh Giới và tăng Linh Lực.',
    baseCost: 850,
    costMultiplier: 1.26,
    effectType: 'add_breakthrough_chance',
    effectPerLevel: 0.015,
    combatStatsPerLevel: { hp: 30, mp: 45, speed: 2, attack: 6 },
    formatEffect(level, qualityMult = 1.0) {
      const pct = (level * this.effectPerLevel * qualityMult * 100).toFixed(1);
      const mp = Math.round(level * 45 * qualityMult);
      return `+${pct}% tỉ lệ đột phá • +${mp} Linh Lực`;
    }
  },
  {
    id: 'van_kiem_quy_tong',
    faction: 'both',
    requiresUnlock: true,
    unlockSourceHint: 'Săn Quái hoặc mua ở Thương Nhân Bí Cảnh',
    name: 'Vạn Kiếm Quy Tông',
    chinhName: 'Vạn Kiếm Quy Tông Quyết',
    maName: 'Vạn Quỷ Phệ Hồn Quyết',
    icon: '🗡️',
    category: 'click',
    shortDesc: '[Bí Tịch] Tăng vọt LK/chạm & Sức Mạnh',
    description: '[Bí Tịch Xuất Quan] Tuyệt học công kích thượng cổ: tăng vọt linh khí mỗi chạm và cộng lượng lớn Sức Mạnh.',
    baseCost: 1200,
    costMultiplier: 1.24,
    effectType: 'add_click_base',
    effectPerLevel: 12.0,
    combatStatsPerLevel: { hp: 30, mp: 20, speed: 4, attack: 28 },
    formatEffect(level, qualityMult = 1.0) {
      const click = (level * this.effectPerLevel * qualityMult).toFixed(1).replace(/\.0$/, '');
      const atk = Math.round(level * 28 * qualityMult);
      return `+${click} LK/chạm • +${atk} Sức Mạnh`;
    }
  },
  {
    id: 'bat_diet_kim_than',
    faction: 'both',
    requiresUnlock: true,
    unlockSourceHint: 'Săn Quái hoặc mua ở Thương Nhân Bí Cảnh',
    name: 'Thái Cổ Bất Diệt Thân',
    chinhName: 'Thái Cổ Bất Diệt Kim Thân',
    maName: 'Huyết Ma Bất Tử Chiến Thân',
    icon: '🔰',
    category: 'passive_mult',
    shortDesc: '[Bí Tịch] Tăng % tốc độ nền & Máu khổng lồ',
    description: '[Bí Tịch Xuất Quan] Luyện thể thần công: tăng mạnh tốc độ hấp thụ nền và cộng lượng máu khổng lồ.',
    baseCost: 1800,
    costMultiplier: 1.25,
    effectType: 'mult_passive_pct',
    effectPerLevel: 0.28,
    combatStatsPerLevel: { hp: 140, mp: 35, speed: 2, attack: 12 },
    formatEffect(level, qualityMult = 1.0) {
      const pct = Math.round(level * this.effectPerLevel * qualityMult * 100);
      const hp = Math.round(level * 140 * qualityMult);
      return `+${pct}% tốc độ nền • +${hp} Máu`;
    }
  },
  {
    id: 'cuu_thien_than_hanh',
    faction: 'both',
    requiresUnlock: true,
    unlockSourceHint: 'Săn Quái hoặc mua ở Thương Nhân Bí Cảnh',
    name: 'Cửu Thiên Bằng Đằng Bộ',
    chinhName: 'Cửu Thiên Bằng Đằng Bộ',
    maName: 'Quỷ Ảnh Mê Tung Thần Bộ',
    icon: '🦅',
    category: 'boost_duration',
    shortDesc: '[Bí Tịch] Tăng mạnh Tốc Độ & Tăng Tốc',
    description: '[Bí Tịch Xuất Quan] Thân pháp thần tốc: giúp đoạt Tiên Thủ đánh trước và kéo dài Tăng Tốc.',
    baseCost: 2400,
    costMultiplier: 1.25,
    effectType: 'add_boost_duration_ms',
    effectPerLevel: 320,
    combatStatsPerLevel: { hp: 35, mp: 30, speed: 12, attack: 10 },
    formatEffect(level, qualityMult = 1.0) {
      const sec = ((level * this.effectPerLevel * qualityMult) / 1000).toFixed(2);
      const spd = Math.round(level * 12 * qualityMult);
      return `+${sec}s Tăng Tốc • +${spd} Tốc Độ`;
    }
  },
  {
    id: 'thai_thanh_chan_kinh',
    faction: 'both',
    requiresUnlock: true,
    unlockSourceHint: 'Săn Quái hoặc mua ở Thương Nhân Bí Cảnh',
    name: 'Thái Thanh Tiên Thiên Kinh',
    chinhName: 'Thái Thanh Tiên Thiên Kinh',
    maName: 'Thôn Thiên Phệ Địa Ma Công',
    icon: '🌊',
    category: 'passive',
    shortDesc: '[Bí Tịch] Tăng mạnh LK/s cơ bản & Linh Lực',
    description: '[Bí Tịch Xuất Quan] Biển linh lực mênh mông: tăng mạnh linh khí nền mỗi giây và tăng vọt Linh Lực tối đa.',
    baseCost: 3600,
    costMultiplier: 1.26,
    effectType: 'add_passive_base',
    effectPerLevel: 10.0,
    combatStatsPerLevel: { hp: 50, mp: 95, speed: 3, attack: 14 },
    formatEffect(level, qualityMult = 1.0) {
      const rate = (level * this.effectPerLevel * qualityMult).toFixed(1).replace(/\.0$/, '');
      const mp = Math.round(level * 95 * qualityMult);
      return `+${rate} LK/s cơ bản • +${mp} Linh Lực`;
    }
  },
  {
    id: 'can_khon_van_tuong',
    faction: 'both',
    requiresUnlock: true,
    unlockSourceHint: 'Săn Quái hoặc mua ở Thương Nhân Bí Cảnh',
    name: 'Càn Khôn Vạn Tượng Kinh',
    chinhName: 'Càn Khôn Vạn Tượng Kinh',
    maName: 'Hỗn Thế Ma Đạo Chân Kinh',
    icon: '🌌',
    category: 'breakthrough',
    shortDesc: '[Bí Tịch] Tăng tỉ lệ Đột Phá & 4 chỉ số',
    description: '[Bí Tịch Xuất Quan] Thấu hiểu quy tắc thiên địa: tăng mạnh tỉ lệ đột phá và toàn bộ 4 chỉ số chiến đấu.',
    baseCost: 5500,
    costMultiplier: 1.27,
    effectType: 'add_breakthrough_chance',
    effectPerLevel: 0.025,
    combatStatsPerLevel: { hp: 90, mp: 75, speed: 6, attack: 24 },
    formatEffect(level, qualityMult = 1.0) {
      const pct = (level * this.effectPerLevel * qualityMult * 100).toFixed(1);
      const atk = Math.round(level * 24 * qualityMult);
      return `+${pct}% Đột Phá • +${atk} Công & +${Math.round(level * 90 * qualityMult)} Máu`;
    }
  },
  {
    id: 'van_co_bat_hu',
    faction: 'both',
    requiresUnlock: true,
    unlockSourceHint: 'Săn Yêu Vương hoặc mua ở Thương Nhân Bí Cảnh',
    name: 'Vạn Cổ Bất Hủ Kinh',
    chinhName: 'Vạn Cổ Bất Hủ Tiên Kinh',
    maName: 'Vạn Cổ Độc Tôn Ma Kinh',
    icon: '👑',
    category: 'passive_mult',
    shortDesc: '[Chí Tôn] Tăng đột biến % tốc độ nền & 4 chỉ số',
    description: '[Tuyệt Học Chí Tôn] Bí tịch tối thượng trong Bí Cảnh: tăng đột biến tốc độ tu luyện và tứ đại chỉ số!',
    baseCost: 9800,
    costMultiplier: 1.28,
    effectType: 'mult_passive_pct',
    effectPerLevel: 0.45,
    combatStatsPerLevel: { hp: 180, mp: 120, speed: 10, attack: 42 },
    formatEffect(level, qualityMult = 1.0) {
      const pct = Math.round(level * this.effectPerLevel * qualityMult * 100);
      const atk = Math.round(level * 42 * qualityMult);
      return `+${pct}% tốc độ nền • +${atk} Công & +${Math.round(level * 180 * qualityMult)} Máu`;
    }
  }
];

window.TuTien.PRESTIGE_UPGRADES = [
  {
    id: 'dao_van_linh_mach',
    name: 'Hồng Mông Linh Mạch',
    icon: '🌌',
    shortDesc: 'Vĩnh viễn +35% tốc độ nền & +15% Máu/Linh Lực mỗi cấp',
    description: 'Cường hóa vĩnh viễn tốc độ hấp thụ linh khí nền và +15% Máu/Linh Lực mỗi cấp.',
    baseCost: 1,
    costMultiplier: 1.5,
    effectType: 'prestige_passive_mult',
    effectPerLevel: 0.35,
    formatEffect(level) {
      return `+${Math.round(level * this.effectPerLevel * 100)}% tốc độ nền • +${level * 15}% Máu/Linh Lực`;
    }
  },
  {
    id: 'dao_van_than_thuc',
    name: 'Bất Diệt Thần Thức',
    icon: '👁️',
    shortDesc: 'Vĩnh viễn +40% Click, EXP Lĩnh Vực & +15% Công/Tốc mỗi cấp',
    description: 'Cường hóa vĩnh viễn sức mạnh Click, EXP Lĩnh Vực và +15% Sức Mạnh/Tốc Độ chiến đấu mỗi cấp.',
    baseCost: 1,
    costMultiplier: 1.5,
    effectType: 'prestige_click_mult',
    effectPerLevel: 0.40,
    formatEffect(level) {
      return `+${Math.round(level * this.effectPerLevel * 100)}% Click • +${level * 15}% Công/Tốc`;
    }
  },
  {
    id: 'dao_van_be_quan',
    name: 'Thiên Niên Bế Quan Phù',
    icon: '⏳',
    shortDesc: 'Tăng giờ & hiệu suất Bế Quan Offline',
    description: 'Tăng giới hạn thời gian bế quan Offline tối đa và tăng hiệu suất tu luyện khi rời mạng.',
    baseCost: 2,
    costMultiplier: 1.6,
    maxLevel: 20,
    effectType: 'prestige_offline_hours',
    effectPerLevel: 2,
    formatEffect(level) {
      return `+${level * 2}h Offline • +${level * 5}% hiệu suất`;
    }
  },
  {
    id: 'dao_van_thien_menh',
    name: 'Thiên Mệnh Hộ Đạo',
    icon: '🛡️',
    shortDesc: 'Tăng tỉ lệ Đột Phá & giảm tổn thất thất bại',
    description: 'Tăng vĩnh viễn tỉ lệ đột phá Cảnh Giới Lớn và giảm tổn thất linh khí nếu thất bại.',
    baseCost: 3,
    costMultiplier: 1.7,
    maxLevel: 15,
    effectType: 'prestige_breakthrough_guard',
    effectPerLevel: 0.03,
    formatEffect(level) {
      return `+${Math.round(level * 3)}% Đột Phá • -${Math.min(75, level * 5)}% tổn thất`;
    }
  },
  {
    id: 'dao_van_khi_van',
    name: 'Thiên Cơ Khí Vận',
    icon: '🍀',
    shortDesc: 'Tăng May Mắn roll Tư Chất & Phẩm Chất',
    description: 'Tăng May Mắn tiên thiên, tăng xác suất ra Tư Chất bậc cao và vật phẩm/công pháp Tiên Phẩm.',
    baseCost: 2,
    costMultiplier: 1.65,
    maxLevel: 15,
    effectType: 'prestige_luck_boost',
    effectPerLevel: 0.25,
    formatEffect(level) {
      return `+${Math.round(level * 25)}% May Mắn Tư Chất & Tiên Phẩm`;
    }
  }
];
