/**
 * js/data/fields.js
 * Danh sách 8 Lĩnh Vực, 10 loại Linh Thảo, 4 loại Nguyên Liệu Luyện Khí (Sắt, Đá, Gỗ, Vàng),
 * 5 Công Thức Pháp Bảo Bản Mệnh, 9 loại Đan Dược và 6 loại Linh Phù.
 */
window.TuTien = window.TuTien || {};

window.TuTien.FIELD_TALENTS = {
  none: { id: 'none', name: 'Không', multiplier: 0.5, color: '#64748b' },
  normal: { id: 'normal', name: 'Thường', multiplier: 1.0, color: '#94a3b8' },
  good: { id: 'good', name: 'Giỏi', multiplier: 1.5, color: '#38bdf8' },
  genius: { id: 'genius', name: 'Thiên Phú', multiplier: 2.5, color: '#fbbf24' }
};

window.TuTien.FIELD_RANKS = [
  'Nhất Phẩm',
  'Nhị Phẩm',
  'Tam Phẩm',
  'Tứ Phẩm',
  'Ngũ Phẩm',
  'Lục Phẩm',
  'Thất Phẩm',
  'Bát Phẩm',
  'Cửu Phẩm'
];

// 4 NGUYÊN LIỆU KHOÁNG SẢN & LINH MỘC ĐỂ CHẾ TẠO PHÁP BẢO (SẮT, ĐÁ, GỖ, VÀNG)
window.TuTien.FORGE_MATERIALS = [
  {
    id: 'sat_khoang',
    name: 'Huyền Thiết (Sắt)',
    shortName: 'Sắt',
    icon: '⛏️',
    desc: 'Quặng sắt huyền thiết cứng rắn thu được từ đánh quái và khai khoáng, dùng rèn kiếm, thuẫn và linh chung.'
  },
  {
    id: 'da_khoang',
    name: 'Thanh Linh Thạch (Đá)',
    shortName: 'Đá',
    icon: '⛰️',
    desc: 'Đá linh thạch ngàn năm trầm tích trên núi cao, dùng đúc Bàn Thạch Thuẫn, Thần Đỉnh và Kim Chùy.'
  },
  {
    id: 'go_linh_moc',
    name: 'Thiết Mộc (Gỗ)',
    shortName: 'Gỗ',
    icon: '🌲',
    desc: 'Gỗ linh mộc cổ thụ dẫn truyền linh lực cực tốt, dùng chế tác Phi Kiếm và Cửu Long Đỉnh.'
  },
  {
    id: 'vang_tinh_kim',
    name: 'Thái Ất Tinh Kim (Vàng)',
    shortName: 'Vàng',
    icon: '🌕',
    desc: 'Tinh kim ánh vàng quý hiếm chứa uy năng sấm sét, dùng đúc Linh Chung, Kim Chùy và Thần Đỉnh.'
  }
];

// 5 CÔNG THỨC CHẾ TẠO PHÁP BẢO BẢN MỆNH (SỬ DỤNG SẮT, ĐÁ, GỖ, VÀNG)
window.TuTien.ARTIFACT_RECIPES = [
  {
    id: 'thanh_van_kiem',
    name: 'Thanh Vân Phi Kiếm',
    icon: '🗡️',
    focus: 'click',
    qiCostBase: 180,
    materials: [
      { id: 'sat_khoang', name: 'Sắt', icon: '⛏️', count: 2 },
      { id: 'go_linh_moc', name: 'Gỗ', icon: '🌲', count: 1 }
    ],
    shortDesc: 'Thiên về Sức Mạnh Công Kích & Linh Khí mỗi chạm',
    description: 'Phi kiếm rèn từ Huyền Thiết và Thiết Mộc, gia tăng mạnh Sức Mạnh công kích và Linh Khí mỗi lần chạm.'
  },
  {
    id: 'ban_thach_thuan',
    name: 'Huyền Vũ Bàn Thạch Thuẫn',
    icon: '🛡️',
    focus: 'defense',
    qiCostBase: 220,
    materials: [
      { id: 'da_khoang', name: 'Đá', icon: '⛰️', count: 2 },
      { id: 'sat_khoang', name: 'Sắt', icon: '⛏️', count: 1 }
    ],
    shortDesc: 'Thiên về Sinh Mệnh (Máu) & Hộ Thể vững chắc',
    description: 'Linh thuẫn đúc từ Thanh Linh Thạch và Huyền Thiết, tăng lượng lớn Máu tối đa và tốc độ hấp thụ nền.'
  },
  {
    id: 'huyen_nguyen_chung',
    name: 'Huyền Nguyên Linh Chung',
    icon: '🔔',
    focus: 'passive',
    qiCostBase: 280,
    materials: [
      { id: 'sat_khoang', name: 'Sắt', icon: '⛏️', count: 2 },
      { id: 'vang_tinh_kim', name: 'Vàng', icon: '🌕', count: 1 }
    ],
    shortDesc: 'Thiên về Tốc Độ Tu Luyện Nền & Linh Lực',
    description: 'Chuông cổ mạ Thái Ất Tinh Kim, ngân vang tụ linh giúp tăng mạnh tốc độ hấp thụ nền và Linh Lực.'
  },
  {
    id: 'tu_dien_chuy',
    name: 'Tử Điện Kim Chùy',
    icon: '🔨',
    focus: 'click',
    qiCostBase: 360,
    materials: [
      { id: 'vang_tinh_kim', name: 'Vàng', icon: '🌕', count: 2 },
      { id: 'da_khoang', name: 'Đá', icon: '⛰️', count: 2 }
    ],
    shortDesc: 'Pháp bảo bá đạo: Tăng vọt Công Kích, Tốc Độ & Click',
    description: 'Lôi chùy đúc từ Tinh Kim và Linh Thạch, mang uy lực sấm sét hủy diệt yêu tà.'
  },
  {
    id: 'cuu_long_dinh',
    name: 'Cửu Long Thần Đỉnh',
    icon: '🏺',
    focus: 'balanced',
    qiCostBase: 500,
    materials: [
      { id: 'sat_khoang', name: 'Sắt', icon: '⛏️', count: 1 },
      { id: 'da_khoang', name: 'Đá', icon: '⛰️', count: 1 },
      { id: 'go_linh_moc', name: 'Gỗ', icon: '🌲', count: 1 },
      { id: 'vang_tinh_kim', name: 'Vàng', icon: '🌕', count: 1 }
    ],
    shortDesc: 'Chí bảo Tứ Tượng: Tăng toàn diện Nền, Chạm & 4 Chỉ Số',
    description: 'Thần đỉnh hội tụ đủ Sắt, Đá, Gỗ, Vàng của đất trời, gia tăng toàn diện tốc độ tu luyện và tứ đại chỉ số chiến đấu.'
  }
];

window.TuTien.HERB_TYPES = [
  {
    id: 'tu_linh_thao',
    name: 'Tụ Linh Thảo',
    icon: '🌿',
    mapOnly: false,
    biome: 'center',
    shortDesc: 'Nguyên liệu luyện Tụ Khí Đan & Chiến Đan',
    desc: 'Linh thảo chứa thanh khí dồi dào, dùng luyện Tụ Khí Đan và Cuồng Bạo Chiến Đan.'
  },
  {
    id: 'pha_chuong_qua',
    name: 'Phá Chướng Quả',
    icon: '🌺',
    mapOnly: false,
    biome: 'center',
    shortDesc: 'Nguyên liệu luyện Phá Cảnh Đan',
    desc: 'Linh quả dị hương giúp khai thông bình cảnh, dùng luyện Phá Cảnh Đan.'
  },
  {
    id: 'huyet_ngoc_sam',
    name: 'Huyết Ngọc Sâm',
    icon: '🍄',
    mapOnly: false,
    biome: 'center',
    shortDesc: 'Nguyên liệu luyện Hồi Nguyên Đan & Long Huyết Đan',
    desc: 'Nhân sâm ngàn năm bổ khí huyết, dùng luyện Hồi Nguyên Đan và Long Huyết Đan.'
  },
  {
    id: 'loi_tam_thao',
    name: 'Lôi Tâm Thảo',
    icon: '⚡',
    mapOnly: false,
    biome: 'center',
    shortDesc: 'Nguyên liệu họa Tị Lôi Phù & Thần Hành Phù',
    desc: 'Thảo dược hấp thu tinh hoa sấm sét, dùng vẽ Tị Lôi Thiên Phù và Thần Hành Linh Phù.'
  },
  {
    id: 'han_bang_tuyet_lien',
    name: 'Hàn Băng Tuyết Liên',
    icon: '❄️',
    mapOnly: true,
    biome: 'ice',
    shortDesc: '[Bí Cảnh] Luyện Hàn Ngọc Tĩnh Tâm Đan',
    desc: '[Linh Thảo Bí Cảnh] Mọc trên núi tuyết, dùng luyện Hàn Ngọc Tĩnh Tâm Đan.'
  },
  {
    id: 'xich_viem_chu_qua',
    name: 'Xích Viêm Chu Quả',
    icon: '🔥',
    mapOnly: true,
    biome: 'lava',
    shortDesc: '[Bí Cảnh] Luyện Xích Viêm Đan & Thiên Kiếm Phù',
    desc: '[Linh Thảo Bí Cảnh] Hấp thu địa hỏa, dùng luyện Xích Viêm Bá Thể Đan & Thiên Kiếm Phù.'
  },
  {
    id: 'u_minh_bi_ngan',
    name: 'U Minh Bỉ Ngạn Hoa',
    icon: '🟣',
    mapOnly: true,
    biome: 'abyss',
    shortDesc: '[Bí Cảnh] Luyện U Minh Thần Tốc Đan',
    desc: '[Linh Thảo Bí Cảnh] Kỳ hoa u cốc, dùng luyện U Minh Thần Tốc Đan.'
  },
  {
    id: 'tinh_than_long_thao',
    name: 'Tinh Thần Long Thảo',
    icon: '✨',
    mapOnly: true,
    biome: 'island',
    shortDesc: '[Bí Cảnh] Họa Phong Lôi Phù & Cửu Thiên Phù',
    desc: '[Linh Thảo Bí Cảnh] Tinh hoa tinh tú, dùng vẽ Phong Lôi Thần Phù & Cửu Thiên Khiên Phù.'
  },
  {
    id: 'thai_at_duong_hon_moc',
    name: 'Thái Ất Dưỡng Hồn Mộc',
    icon: '🌳',
    mapOnly: true,
    biome: 'center',
    shortDesc: '[Bí Cảnh] Họa Kim Cang Bất Hoại Phù',
    desc: '[Linh Thảo Bí Cảnh] Linh mộc ngàn năm trong di tích cổ, dùng vẽ Kim Cang Bất Hoại Phù.'
  },
  {
    id: 'cuu_chuyen_tien_chi',
    name: 'Cửu Chuyển Tiên Chi',
    icon: '👑',
    mapOnly: true,
    biome: 'boss',
    shortDesc: '[Thần Dược] Luyện Cửu Chuyển Tạo Hóa Kim Đan',
    desc: '[Thần Dược Chí Tôn] Rớt từ Yêu Vương hoặc Bí Cảnh, dùng luyện Cửu Chuyển Tạo Hóa Kim Đan!'
  }
];

window.TuTien.FIELDS = [
  {
    id: 'luyen_dan',
    name: 'Luyện Đan',
    titleSuffix: 'Đan Sư',
    icon: '⚗️',
    implemented: 'full',
    qiDrainFactor: 0.12,
    shortDesc: 'Tăng hiệu quả Đan Dược & mở trần phẩm chất Đan',
    description: 'Khống hỏa luyện chế 9 loại Linh Đan. Cấp Đan Sư càng cao mới mở khóa được Thượng Phẩm, Cực Phẩm và Tiên Phẩm.',
    effectSummary(rank) {
      return `+${rank * 8}% hiệu quả Đan • Mở trần Phẩm Chất`;
    }
  },
  {
    id: 'luyen_khi',
    name: 'Luyện Khí',
    titleSuffix: 'Luyện Khí Sư',
    icon: '🗡️',
    implemented: 'full',
    qiDrainFactor: 0.15,
    shortDesc: 'Dùng Sắt, Đá, Gỗ, Vàng rèn 5 loại Pháp Bảo Bản Mệnh',
    description: 'Thiên chùy đoán tạo 5 loại Pháp Bảo Bản Mệnh từ Sắt, Đá, Gỗ, Vàng giúp tăng tốc độ tu luyện và Sức Mạnh / Máu.',
    effectSummary(rank) {
      return `+${rank * 6}% uy lực Pháp Bảo • Mở trần Phẩm Chất`;
    }
  },
  {
    id: 'linh_dien',
    name: 'Linh Điền',
    titleSuffix: 'Linh Nông',
    icon: '🌿',
    implemented: 'full',
    qiDrainFactor: 0.05,
    shortDesc: 'Tự động trồng Linh Thảo & thu thập Gỗ/Đá cơ bản',
    description: 'Trồng 4 loại Linh Thảo cơ bản trong động phủ và hỗ trợ thu hoạch thêm Gỗ, Đá khi tưới Linh Tuyền.',
    effectSummary(rank) {
      return `Tự thu hoạch 1 Linh Thảo mỗi ${(Math.max(4, 14 - rank)).toFixed(0)}s`;
    }
  },
  {
    id: 'phu_luc',
    name: 'Phù Lục',
    titleSuffix: 'Phù Sư',
    icon: '📜',
    implemented: 'full',
    qiDrainFactor: 0.10,
    shortDesc: 'Họa 6 loại Linh Phù hộ mệnh & tăng giới hạn Combo',
    description: 'Họa phù điểm ấn 6 loại Linh Phù (2 cơ bản + 4 Phù Phương Bí Truyền thu thập tại Xuất Quan).',
    effectSummary(rank) {
      return `+${(rank * 0.2).toFixed(1)}x giới hạn Combo • Tăng phẩm chất Phù`;
    }
  },
  {
    id: 'tran_phap',
    name: 'Trận Pháp',
    titleSuffix: 'Trận Pháp Sư',
    icon: '۞',
    implemented: 'basic',
    qiDrainFactor: 0.10,
    shortDesc: 'Tăng tốc độ hấp thụ nền & giờ Bế Quan Offline',
    description: 'Bố trí tụ linh đại trận: tăng tốc độ hấp thụ nền khi AFK và kéo dài giới hạn Bế Quan Offline.',
    effectSummary(rank) {
      return `+${rank * 5}% tốc độ nền • +${(rank * 0.5).toFixed(1)}h Bế Quan Offline`;
    }
  },
  {
    id: 'y_thuat',
    name: 'Y Thuật',
    titleSuffix: 'Y Sư',
    icon: '🩺',
    implemented: 'basic',
    qiDrainFactor: 0.08,
    shortDesc: 'Tăng Máu tối đa & giảm tổn thất khi đột phá thất bại',
    description: 'Thông hiểu kinh mạch và dược lý, tăng Máu tối đa và giảm tổn thất linh khí khi đột phá thất bại.',
    effectSummary(rank) {
      return `+${rank * 10}% Máu tối đa • -${Math.min(60, rank * 5)}% tổn thất đột phá`;
    }
  },
  {
    id: 'linh_thuc',
    name: 'Linh Thực',
    titleSuffix: 'Linh Trù',
    icon: '🍲',
    implemented: 'basic',
    qiDrainFactor: 0.06,
    shortDesc: 'Tăng tốc độ nền & kéo dài thời gian Tăng Tốc',
    description: 'Chế biến mỹ thực chứa linh khí tinh thuần, giúp kéo dài thời gian Tăng Tốc và tăng Linh Lực.',
    effectSummary(rank) {
      return `+${rank * 3}% tốc độ nền • +${(rank * 0.15).toFixed(2)}s Tăng Tốc`;
    }
  },
  {
    id: 'ngu_thu',
    name: 'Ngự Thú',
    titleSuffix: 'Ngự Thú Sư',
    icon: '🦊',
    implemented: 'basic',
    qiDrainFactor: 0.08,
    shortDesc: 'Tăng Sức Mạnh, Tốc Độ chiến đấu & linh khí Cơ Duyên',
    description: 'Thuần hóa Tiên Thú đồng hành giúp tăng Sức Mạnh, Tốc Độ chiến đấu và thu hoạch Cơ Duyên.',
    effectSummary(rank) {
      return `+${rank * 5}% Công/Tốc • +${rank * 5}% linh khí Cơ Duyên`;
    }
  }
];

window.TuTien.PILL_RECIPES = [
  {
    id: 'tu_khi_dan',
    name: 'Tụ Khí Đan',
    icon: '🟢',
    requiresRecipeUnlock: false,
    requiredHerbId: 'tu_linh_thao',
    requiredHerbName: 'Tụ Linh Thảo',
    herbCost: 3,
    minRank: 1,
    shortDesc: 'Tăng tốc độ hấp thụ nền tạm thời',
    description: 'Tăng vọt tốc độ hấp thụ linh khí nền tạm thời.',
    getEffectText(alchemyRank) {
      const mult = (1.5 + (alchemyRank - 1) * 0.15).toFixed(2);
      return `x${mult} tốc độ nền (60s)`;
    }
  },
  {
    id: 'cuong_bao_dan',
    name: 'Cuồng Bạo Chiến Đan',
    icon: '🔴',
    requiresRecipeUnlock: false,
    requiredHerbId: 'tu_linh_thao',
    requiredHerbName: 'Tụ Linh Thảo',
    herbCost: 3,
    minRank: 1,
    shortDesc: 'Tăng Sức Mạnh & Tốc Độ chiến đấu 90s',
    description: 'Đan dược trợ chiến: tăng mạnh Sức Mạnh và Tốc Độ tạm thời trong 90 giây.',
    getEffectText(alchemyRank) {
      const pct = 35 + (alchemyRank - 1) * 6;
      return `+${pct}% Công & Tốc (90s)`;
    }
  },
  {
    id: 'pha_canh_dan',
    name: 'Phá Cảnh Đan',
    icon: '🟡',
    requiresRecipeUnlock: false,
    requiredHerbId: 'pha_chuong_qua',
    requiredHerbName: 'Phá Chướng Quả',
    herbCost: 3,
    minRank: 2,
    shortDesc: 'Tăng tỉ lệ thành công Đột Phá kế tiếp',
    description: 'Cộng thêm tỉ lệ thành công cho lần Đột Phá tiếp theo.',
    getEffectText(alchemyRank) {
      const bonusPct = 10 + (alchemyRank - 1) * 3;
      return `+${bonusPct}% tỉ lệ Đột Phá`;
    }
  },
  {
    id: 'hoi_nguyen_dan',
    name: 'Hồi Nguyên Hộ Mạch Đan',
    icon: '🔵',
    requiresRecipeUnlock: false,
    requiredHerbId: 'huyet_ngoc_sam',
    requiredHerbName: 'Huyết Ngọc Sâm',
    herbCost: 3,
    minRank: 2,
    shortDesc: 'Hộ mạch độ kiếp & +40% Máu (90s)',
    description: 'Bảo vệ kinh mạch khi độ kiếp và tăng tạm thời +40% Máu tối đa trong 90 giây.',
    getEffectText() {
      return '-65% tổn thất đột phá • +40% Máu (90s)';
    }
  },
  {
    id: 'han_ngoc_dan',
    name: 'Hàn Ngọc Tĩnh Tâm Đan',
    icon: '❄️',
    requiresRecipeUnlock: true,
    requiredHerbId: 'han_bang_tuyet_lien',
    requiredHerbName: 'Hàn Băng Tuyết Liên',
    herbCost: 2,
    minRank: 2,
    isPermanentStat: true,
    shortDesc: 'x2.2 Tốc độ (90s) & Vĩnh viễn +45 Linh Lực, +30 Máu',
    description: '[Đan Phương Bí Cảnh] Luyện từ Hàn Băng Tuyết Liên: tăng x2.2 tốc độ nền 90s & tăng VĨNH VIỄN Linh Lực + Máu!',
    getEffectText() {
      return 'Vĩnh viễn +45 Linh Lực, +30 Máu • x2.2 Nền (90s)';
    }
  },
  {
    id: 'xich_viem_ba_dan',
    name: 'Xích Viêm Bá Thể Đan',
    icon: '🔥',
    requiresRecipeUnlock: true,
    requiredHerbId: 'xich_viem_chu_qua',
    requiredHerbName: 'Xích Viêm Chu Quả',
    herbCost: 2,
    minRank: 2,
    isPermanentStat: true,
    shortDesc: 'Vĩnh viễn +15 Công, +50 Máu & Cuồng hóa 120s',
    description: '[Đan Phương Bí Cảnh] Luyện từ Xích Viêm Chu Quả: cuồng hóa chiến lực 120s & tăng VĨNH VIỄN Sức Mạnh + Máu!',
    getEffectText() {
      return 'Vĩnh viễn +15 Công, +50 Máu • +65% Chiến lực (120s)';
    }
  },
  {
    id: 'u_minh_than_dan',
    name: 'U Minh Thần Tốc Đan',
    icon: '🟣',
    requiresRecipeUnlock: true,
    requiredHerbId: 'u_minh_bi_ngan',
    requiredHerbName: 'U Minh Bỉ Ngạn Hoa',
    herbCost: 2,
    minRank: 3,
    isPermanentStat: true,
    shortDesc: 'Vĩnh viễn +6 Tốc, +10 Công & Thần tốc 120s',
    description: '[Đan Phương Bí Cảnh] Luyện từ U Minh Bỉ Ngạn Hoa: bứt phá thân pháp & tăng VĨNH VIỄN Tốc Độ + Sức Mạnh!',
    getEffectText() {
      return 'Vĩnh viễn +6 Tốc, +10 Công • +60% Tốc Độ (120s)';
    }
  },
  {
    id: 'long_huyet_dan',
    name: 'Long Huyết Tẩy Tủy Đan',
    icon: '🐉',
    requiresRecipeUnlock: true,
    requiredHerbId: 'huyet_ngoc_sam',
    requiredHerbName: 'Huyết Ngọc Sâm',
    herbCost: 4,
    minRank: 3,
    isPermanentStat: true,
    shortDesc: 'Tăng vĩnh viễn cả 4 chỉ số Máu, Linh Lực, Tốc, Công',
    description: '[Đan Phương Bí Cảnh] Bảo đan tẩy tủy phạt cốt, tăng VĨNH VIỄN cả 4 chỉ số Máu, Linh Lực, Tốc Độ và Sức Mạnh!',
    getEffectText() {
      return 'Vĩnh viễn +45 Máu, +35 Linh Lực, +3 Tốc, +10 Công';
    }
  },
  {
    id: 'cuu_chuyen_kim_dan',
    name: 'Cửu Chuyển Tạo Hóa Kim Đan',
    icon: '👑',
    requiresRecipeUnlock: true,
    requiredHerbId: 'cuu_chuyen_tien_chi',
    requiredHerbName: 'Cửu Chuyển Tiên Chi',
    herbCost: 1,
    minRank: 4,
    isPermanentStat: true,
    shortDesc: 'Thần đan tăng vĩnh viễn 4 chỉ số lớn & +25% Đột Phá',
    description: '[Thần Đan Chí Tôn] Luyện từ Cửu Chuyển Tiên Chi: tăng VĨNH VIỄN lượng lớn tứ đại chỉ số & +25% tỉ lệ đột phá!',
    getEffectText() {
      return 'Vĩnh viễn +150 Máu, +120 Linh Lực, +10 Tốc, +35 Công • +25% Đột Phá';
    }
  }
];

window.TuTien.TALISMAN_RECIPES = [
  {
    id: 'ti_loi_phu',
    name: 'Tị Lôi Thiên Phù',
    icon: '⚡',
    requiresRecipeUnlock: false,
    requiredHerbId: 'loi_tam_thao',
    requiredHerbName: 'Lôi Tâm Thảo',
    herbCost: 3,
    minRank: 1,
    skipChanceByTier: {
      1: 0.25,
      2: 0.45,
      3: 0.65,
      4: 0.85,
      5: 1.00
    },
    shortDesc: '25%–100% tỉ lệ bỏ qua Lôi Kiếp Đại Cảnh Giới',
    description: 'Linh phù hộ mệnh chống Cửu Thiên Lôi Kiếp! Phẩm chất càng cao tỉ lệ bỏ qua hoàn toàn Lôi Kiếp càng lớn (25% -> 100%).'
  },
  {
    id: 'than_hanh_phu',
    name: 'Thần Hành Linh Phù',
    icon: '📜',
    requiresRecipeUnlock: false,
    requiredHerbId: 'loi_tam_thao',
    requiredHerbName: 'Lôi Tâm Thảo',
    herbCost: 2,
    minRank: 1,
    shortDesc: 'Tăng tốc độ nền & tự động vận công',
    description: 'Tăng mạnh tốc độ hấp thụ linh khí nền và tự động vận công theo phẩm chất bùa.'
  },
  {
    id: 'kim_cang_ho_phu',
    name: 'Kim Cang Bất Hoại Phù',
    icon: '🛡️',
    requiresRecipeUnlock: true,
    requiredHerbId: 'thai_at_duong_hon_moc',
    requiredHerbName: 'Thái Ất Dưỡng Hồn Mộc',
    herbCost: 2,
    minRank: 2,
    shortDesc: '+60% Máu (120s) & Hộ mạch độ kiếp',
    description: '[Phù Phương Bí Cảnh] Tăng +60% Máu tối đa trong 120s & bảo vệ kinh mạch khi độ kiếp.'
  },
  {
    id: 'thien_kiem_tram_phu',
    name: 'Thiên Kiếm Trảm Yêu Phù',
    icon: '🗡️',
    requiresRecipeUnlock: true,
    requiredHerbId: 'xich_viem_chu_qua',
    requiredHerbName: 'Xích Viêm Chu Quả',
    herbCost: 2,
    minRank: 2,
    shortDesc: '+80% Sức Mạnh & Tốc Độ chiến đấu (120s)',
    description: '[Phù Phương Bí Cảnh] Triệu hồi kiếm khí thượng cổ: tăng +80% Sức Mạnh & Tốc Độ chiến đấu trong 120s.'
  },
  {
    id: 'phong_loi_than_phu',
    name: 'Phong Lôi Thần Hành Phù',
    icon: '🌪️',
    requiresRecipeUnlock: true,
    requiredHerbId: 'tinh_than_long_thao',
    requiredHerbName: 'Tinh Thần Long Thảo',
    herbCost: 2,
    minRank: 3,
    shortDesc: 'x2.6 Tốc độ nền, tự vận công & +15% Đột Phá',
    description: '[Phù Phương Bí Cảnh] Tăng x2.6 tốc độ hấp thụ linh khí, tự động vận công & +15% tỉ lệ đột phá.'
  },
  {
    id: 'cuu_thien_khien_phu',
    name: 'Cửu Thiên Huyền Nữ Khiên Phù',
    icon: '👑',
    requiresRecipeUnlock: true,
    requiredHerbId: 'tinh_than_long_thao',
    requiredHerbName: 'Tinh Thần Long Thảo',
    herbCost: 3,
    minRank: 4,
    skipChanceByTier: {
      1: 0.60,
      2: 0.75,
      3: 0.90,
      4: 1.00,
      5: 1.00
    },
    shortDesc: '60%–100% bỏ qua Lôi Kiếp & bảo toàn cảnh giới',
    description: '[Thần Phù Chí Tôn] Bùa hộ mệnh tối thượng: tỉ lệ bỏ qua Lôi Kiếp từ 60% -> 100% ngay từ Hạ Phẩm và bảo toàn cảnh giới!'
  }
];
