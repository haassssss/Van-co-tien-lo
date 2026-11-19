/**
 * js/data/monsters.js
 * 40 Quái & Boss trải đều khắp 4 Vị Diện (8 quái thường + 1 Tinh Anh + 1 Boss Thế Giới mỗi vị diện).
 * Chỉ số được tính đồng bộ theo cảnh giới thực tế (getStatsForRealmIdx) để đảm bảo cân bằng 25-40% HP khi đánh ngang cấp.
 */
window.TuTien = window.TuTien || {};

window.TuTien.MONSTER_SKILLS = {
  can_xe:      { ten: 'Cắn Xé', he: 'kim',  loai: 'tan_cong', heSo: 1.05, hieuUng: [] },
  phong_nhan:  { ten: 'Thanh Phong Nhận', he: 'moc', loai: 'tan_cong', heSo: 1.15, hieuUng: [] },
  doc_nha:     { ten: 'Độc Nha Phun Sương', he: 'moc', loai: 'tan_cong', heSo: 1.00, hieuUng: [{ id: 'trung_doc', tiLeHieuUng: 100, soHiep: 3 }] },
  hoa_cau:     { ten: 'Hỏa Cầu Thiêu Đốt', he: 'hoa', loai: 'tan_cong', heSo: 1.15, hieuUng: [{ id: 'thieu_dot', tiLeHieuUng: 100, soHiep: 2 }] },
  bang_tien:   { ten: 'Hàn Băng Tiễn', he: 'bang', loai: 'tan_cong', heSo: 1.10, hieuUng: [{ id: 'dong_bang', tiLeHieuUng: 60, soHiep: 1 }] },
  thach_ap:    { ten: 'Thạch Ấn Trấn Áp', he: 'tho', loai: 'tan_cong', heSo: 1.20, hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 80, soHiep: 2 }] },
  loi_kich:    { ten: 'Lôi Điện Oanh Kích', he: 'loi', loai: 'tan_cong', heSo: 1.25, hieuUng: [{ id: 'tri_hoan', tiLeHieuUng: 80, soHiep: 2 }] },
  thuy_ba:     { ten: 'Huyền Thủy Ba Động', he: 'thuy', loai: 'tan_cong', heSo: 1.15, hieuUng: [{ id: 'suy_yeu', tiLeHieuUng: 80, soHiep: 2 }] },
  xich_troi:   { ten: 'Huyết Xích Khóa Hồn', he: 'tho', loai: 'tan_cong', heSo: 1.10, hieuUng: [{ id: 'xich_khoa', tiLeHieuUng: 90, soHiep: 2 }] },
  phong_an:    { ten: 'Cấm Chế Trói Buộc', he: 'loi', loai: 'tan_cong', heSo: 1.10, hieuUng: [{ id: 'troi_buoc', tiLeHieuUng: 90, soHiep: 2 }] },
  cuong_no:    { ten: 'Yêu Thú Cuồng Nộ', he: 'hoa', loai: 'buff', heSo: 0, hieuUng: [{ id: 'tang_cong', tiLeHieuUng: 100, soHiep: 2, targetSelf: true }] },
  long_uy:     { ten: 'Thái Cổ Long Uy', he: 'kim', loai: 'tan_cong', heSo: 1.45, hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 100, soHiep: 3 }, { id: 'suy_yeu', tiLeHieuUng: 100, soHiep: 2 }] }
};

window.TuTien.MONSTERS = [
  // ======================== 1. TÂN THỦ GIỚI (0 -> 19, Boss 23) ========================
  { id: 'tt_1', ten: 'Thanh Phong Yêu Lang', he: 'moc',  svgKey: 'wolf',   viDien: 'tan_thu_gioi', canhGioiIdx: 0,  chieu: ['can_xe', 'phong_nhan'], ai: 'cycle', khangHieuUng: 0, phanThuong: ['sat_khoang', 'go_linh_moc', 'huyet_yeu_lang'] },
  { id: 'tt_2', ten: 'Bích Lân Độc Xà',      he: 'thuy', svgKey: 'snake',  viDien: 'tan_thu_gioi', canhGioiIdx: 3,  chieu: ['can_xe', 'doc_nha'], ai: 'cycle', khangHieuUng: 0, phanThuong: ['da_khoang', 'noc_huyet_doc_xa'] },
  { id: 'tt_3', ten: 'Xích Hỏa Hồ Ly',       he: 'hoa',  svgKey: 'fox',   viDien: 'tan_thu_gioi', canhGioiIdx: 6,  chieu: ['hoa_cau', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.05, phanThuong: ['xich_dong_hoa', 'chu_sa_hoa'] },
  { id: 'tt_4', ten: 'Huyền Nham Thạch Tinh',he: 'tho',  svgKey: 'golem',  viDien: 'tan_thu_gioi', canhGioiIdx: 9,  chieu: ['thach_ap', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.1, phanThuong: ['da_khoang', 'yeu_dan_phan'] },
  { id: 'tt_5', ten: 'Lục Thủy Kiếm Khách',  he: 'thuy', svgKey: 'cultivator_male', entityType: 'cultivator', viDien: 'tan_thu_gioi', canhGioiIdx: 12, chieu: ['thuy_ba', 'can_xe'], ai: 'cycle', khangHieuUng: 0.1, phanThuong: ['bich_thuy_ngoc', 'sat_khoang'] },
  { id: 'tt_6', ten: 'Hàn Sương Băng Miêu',  he: 'bang', svgKey: 'ice_beast',   viDien: 'tan_thu_gioi', canhGioiIdx: 14, chieu: ['bang_tien', 'can_xe'], ai: 'cycle', khangHieuUng: 0.1, phanThuong: ['han_bang_ngoc'] },
  { id: 'tt_7', ten: 'Thiết Giáp Hắc Hùng',  he: 'tho',  svgKey: 'bear',   viDien: 'tan_thu_gioi', canhGioiIdx: 17, chieu: ['thach_ap', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.12, phanThuong: ['huyet_hac_hung', 'sat_khoang'] },
  { id: 'tt_8', ten: 'Xích Viêm Yêu Hổ',     he: 'hoa',  svgKey: 'tiger',  viDien: 'tan_thu_gioi', canhGioiIdx: 19, chieu: ['hoa_cau', 'can_xe', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.15, phanThuong: ['huyet_xich_ho', 'vang_tinh_kim'] },
  { id: 'tt_elite', ten: '★ Tinh Anh: Huyết Nguyệt Lang Vương', he: 'kim', svgKey: 'tiger', isElite: true, viDien: 'tan_thu_gioi', canhGioiIdx: 19, chieu: ['can_xe', 'hoa_cau', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.25, phanThuong: ['vang_tinh_kim', 'huyet_yeu_lang'] },
  { id: 'boss_tan_thu_gioi', ten: 'Boss Thế Giới', he: 'kim', svgKey: 'dragon_boss', isBoss: true, entityType: 'boss', viDien: 'tan_thu_gioi', canhGioiIdx: 23, chieu: ['long_uy', 'hoa_cau', 'xich_troi', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.45, dropTechId: 'boss_tu_phu_kiem_y', phanThuong: ['vang_tinh_kim', 'huyet_chan_long'] },

  // ======================== 2. HUYỀN LINH GIỚI (19 -> 39, Boss 43) ========================
  { id: 'hl_1', ten: 'Thanh Lôi Yêu Điểu',   he: 'loi',  svgKey: 'eagle',   viDien: 'huyen_linh_gioi', canhGioiIdx: 19, chieu: ['loi_kich', 'phong_an'], ai: 'cycle', khangHieuUng: 0.12, phanThuong: ['tu_loi_thiet', 'huyet_loi_dieu'] },
  { id: 'hl_2', ten: 'Hàn Đàm Băng Mãng',    he: 'bang', svgKey: 'snake',  viDien: 'huyen_linh_gioi', canhGioiIdx: 22, chieu: ['bang_tien', 'doc_nha'], ai: 'cycle', khangHieuUng: 0.15, phanThuong: ['han_bang_ngoc', 'noc_huyet_doc_xa'] },
  { id: 'hl_3', ten: 'Tử Kim Kiếm Khôi',     he: 'kim',  svgKey: 'golem',  viDien: 'huyen_linh_gioi', canhGioiIdx: 25, chieu: ['can_xe', 'thach_ap'], ai: 'cycle', khangHieuUng: 0.18, phanThuong: ['bach_ngan_tinh', 'vang_tinh_kim'] },
  { id: 'hl_4', ten: 'Bích Nguyệt Tán Tiên', he: 'thuy', svgKey: 'cultivator_female', entityType: 'cultivator', viDien: 'huyen_linh_gioi', canhGioiIdx: 28, chieu: ['thuy_ba', 'bang_tien'], ai: 'cycle', khangHieuUng: 0.18, phanThuong: ['thuong_hai_ngoc'] },
  { id: 'hl_5', ten: 'Viêm Dương Ma Viên',   he: 'hoa',  svgKey: 'ape',   viDien: 'huyen_linh_gioi', canhGioiIdx: 31, chieu: ['hoa_cau', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.2, phanThuong: ['viem_duong_thach', 'huyet_xich_ho'] },
  { id: 'hl_6', ten: 'Huyền Hoàng Thạch Tướng', he: 'tho', svgKey: 'golem', viDien: 'huyen_linh_gioi', canhGioiIdx: 34, chieu: ['thach_ap', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.22, phanThuong: ['huyen_hoang_thach'] },
  { id: 'hl_7', ten: 'Thanh Long Mộc Yêu',   he: 'moc',  svgKey: 'snake',  viDien: 'huyen_linh_gioi', canhGioiIdx: 36, chieu: ['phong_nhan', 'doc_nha'], ai: 'cycle', khangHieuUng: 0.22, phanThuong: ['thanh_long_moc'] },
  { id: 'hl_8', ten: 'Huyết Ảnh Ma Tu',      he: 'hoa',  svgKey: 'cultivator_male', entityType: 'cultivator', viDien: 'huyen_linh_gioi', canhGioiIdx: 39, chieu: ['hoa_cau', 'phong_an', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.25, phanThuong: ['huyet_ngoc_tinh'] },
  { id: 'hl_elite', ten: '★ Tinh Anh: Kim Đan Lôi Hổ', he: 'loi', svgKey: 'tiger', isElite: true, viDien: 'huyen_linh_gioi', canhGioiIdx: 39, chieu: ['loi_kich', 'phong_an', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.30, phanThuong: ['thien_loi_tinh', 'huyet_loi_dieu'] },
  { id: 'boss_huyen_linh_gioi', ten: 'Boss Thế Giới', he: 'loi', svgKey: 'thunder_boss', isBoss: true, entityType: 'boss', viDien: 'huyen_linh_gioi', canhGioiIdx: 43, chieu: ['long_uy', 'loi_kich', 'phong_an', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.50, dropTechId: 'boss_hoa_than_loi_vuc', phanThuong: ['thien_loi_tinh', 'huyet_chan_long'] },

  // ======================== 3. KIẾP VÂN GIỚI (39 -> 64, Boss 68) ========================
  { id: 'kv_1', ten: 'Lôi Vân Ma Ưng',       he: 'loi',  svgKey: 'eagle',   viDien: 'kiep_van_gioi', canhGioiIdx: 39, chieu: ['loi_kich', 'phong_an'], ai: 'cycle', khangHieuUng: 0.2, phanThuong: ['thien_loi_tinh', 'huyet_loi_dieu'] },
  { id: 'kv_2', ten: 'Cửu U Băng Tượng',     he: 'bang', svgKey: 'ice_beast',   viDien: 'kiep_van_gioi', canhGioiIdx: 43, chieu: ['bang_tien', 'thach_ap'], ai: 'cycle', khangHieuUng: 0.22, phanThuong: ['cuu_u_bang_tinh'] },
  { id: 'kv_3', ten: 'Hư Không Ảnh Xà',      he: 'thuy', svgKey: 'snake',  viDien: 'kiep_van_gioi', canhGioiIdx: 47, chieu: ['thuy_ba', 'doc_nha'], ai: 'cycle', khangHieuUng: 0.25, phanThuong: ['thuong_hai_ngoc'] },
  { id: 'kv_4', ten: 'Thiên Cương Chiến Khôi', he: 'kim', svgKey: 'golem', viDien: 'kiep_van_gioi', canhGioiIdx: 51, chieu: ['can_xe', 'thach_ap'], ai: 'cycle', khangHieuUng: 0.28, phanThuong: ['vang_tinh_kim'] },
  { id: 'kv_5', ten: 'Hợp Thể Kiếm Tôn',     he: 'kim',  svgKey: 'cultivator_male', entityType: 'cultivator', viDien: 'kiep_van_gioi', canhGioiIdx: 55, chieu: ['long_uy', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.30, phanThuong: ['thien_canh_kim'] },
  { id: 'kv_6', ten: 'Phần Thiên Hỏa Sư',    he: 'hoa',  svgKey: 'tiger',  viDien: 'kiep_van_gioi', canhGioiIdx: 58, chieu: ['hoa_cau', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.30, phanThuong: ['huyet_xich_ho', 'phu_tang_than_moc'] },
  { id: 'kv_7', ten: 'Địa Mạch Thần Hùng',   he: 'tho',  svgKey: 'bear',   viDien: 'kiep_van_gioi', canhGioiIdx: 61, chieu: ['thach_ap', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.32, phanThuong: ['huyen_hoang_thach', 'huyet_hac_hung'] },
  { id: 'kv_8', ten: 'Độ Kiếp Ma Tôn',       he: 'loi',  svgKey: 'cultivator_female', entityType: 'cultivator', viDien: 'kiep_van_gioi', canhGioiIdx: 64, chieu: ['loi_kich', 'phong_an', 'thuy_ba'], ai: 'cycle', khangHieuUng: 0.35, phanThuong: ['thien_loi_tinh', 'chan_long_huyet'] },
  { id: 'kv_elite', ten: '★ Tinh Anh: Cửu Kiếp Lôi Sư', he: 'bang', svgKey: 'tiger', isElite: true, viDien: 'kiep_van_gioi', canhGioiIdx: 64, chieu: ['bang_tien', 'loi_kich', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.40, phanThuong: ['cuu_u_bang_tinh', 'thien_canh_kim'] },
  { id: 'boss_kiep_van_gioi', ten: 'Boss Thế Giới', he: 'bang', svgKey: 'ice_boss', isBoss: true, entityType: 'boss', viDien: 'kiep_van_gioi', canhGioiIdx: 68, chieu: ['long_uy', 'bang_tien', 'xich_troi', 'phong_an'], ai: 'cycle', khangHieuUng: 0.55, dropTechId: 'boss_ban_thanh_bang_phong', phanThuong: ['cuu_u_bang_tinh', 'huyet_chan_long'] },

  // ======================== 4. HỒNG MÔNG GIỚI (64 -> 99, Boss 103) ========================
  { id: 'hm_1', ten: 'Bán Thánh Thạch Ma',   he: 'tho',  svgKey: 'golem',  viDien: 'hong_mong_gioi', canhGioiIdx: 64, chieu: ['thach_ap', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.30, phanThuong: ['huyen_hoang_thach'] },
  { id: 'hm_2', ten: 'Thánh Hỏa Phượng Tượng', he: 'hoa', svgKey: 'phoenix', viDien: 'hong_mong_gioi', canhGioiIdx: 70, chieu: ['hoa_cau', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.35, phanThuong: ['phu_tang_than_moc'] },
  { id: 'hm_3', ten: 'Tạo Hóa Linh Xà',      he: 'moc',  svgKey: 'snake',  viDien: 'hong_mong_gioi', canhGioiIdx: 76, chieu: ['doc_nha', 'phong_nhan'], ai: 'cycle', khangHieuUng: 0.35, phanThuong: ['thanh_long_moc'] },
  { id: 'hm_4', ten: 'Thánh Vương Kiếm Nô',  he: 'kim',  svgKey: 'cultivator_male', entityType: 'cultivator', viDien: 'hong_mong_gioi', canhGioiIdx: 81, chieu: ['long_uy', 'can_xe'], ai: 'cycle', khangHieuUng: 0.38, phanThuong: ['thien_canh_kim'] },
  { id: 'hm_5', ten: 'Hồng Mông Băng Lang',  he: 'bang', svgKey: 'ice_beast',   viDien: 'hong_mong_gioi', canhGioiIdx: 86, chieu: ['bang_tien', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.40, phanThuong: ['cuu_u_bang_tinh'] },
  { id: 'hm_6', ten: 'Thủy Đạo Thần Tướng',  he: 'thuy', svgKey: 'golem',  viDien: 'hong_mong_gioi', canhGioiIdx: 91, chieu: ['thuy_ba', 'phong_an'], ai: 'cycle', khangHieuUng: 0.40, phanThuong: ['thuong_hai_ngoc'] },
  { id: 'hm_7', ten: 'Lôi Đạo Cổ Thú',       he: 'loi',  svgKey: 'ape',   viDien: 'hong_mong_gioi', canhGioiIdx: 95, chieu: ['loi_kich', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.42, phanThuong: ['thien_loi_tinh'] },
  { id: 'hm_8', ten: 'Tri Đạo Cổ Thánh',     he: 'kim',  svgKey: 'cultivator_female', entityType: 'cultivator', viDien: 'hong_mong_gioi', canhGioiIdx: 99, chieu: ['long_uy', 'phong_an', 'hoa_cau'], ai: 'cycle', khangHieuUng: 0.45, phanThuong: ['chan_long_huyet', 'thien_canh_kim'] },
  { id: 'hm_elite', ten: '★ Tinh Anh: Hỗn Độn Long Hổ', he: 'hoa', svgKey: 'tiger', isElite: true, viDien: 'hong_mong_gioi', canhGioiIdx: 99, chieu: ['long_uy', 'hoa_cau', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.50, phanThuong: ['chan_long_huyet', 'thien_canh_kim'] },
  { id: 'boss_hong_mong_gioi', ten: 'Boss Thế Giới', he: 'hoa', svgKey: 'chaos_boss', isBoss: true, entityType: 'boss', viDien: 'hong_mong_gioi', canhGioiIdx: 103, chieu: ['long_uy', 'hoa_cau', 'xich_troi', 'phong_an'], ai: 'cycle', khangHieuUng: 0.65, dropTechId: 'boss_hong_mong_diet_the', phanThuong: ['chan_long_huyet', 'huyet_chan_long'] }
];

/**
 * Công thức tính chỉ số Quái theo Cảnh Giới thực tế (cân bằng ngang cấp mất ~25-40% HP)
 */
window.TuTien.getMonsterStatsForRealm = function (monsterDef) {
  const idx = Math.max(0, monsterDef.canhGioiIdx || 0);
  const majorIdx = Math.floor(idx / 5);
  const subIdx = idx % 5;
  const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatStats) || {};
  const majorScale = Math.pow(cfg.perMajorRealmStatMult || 1.35, majorIdx);

  const baseHp = ((cfg.baseHp || 100) + idx * (cfg.perSubRealmHp || 45)) * majorScale;
  const baseAtk = ((cfg.baseAttack || 10) + idx * (cfg.perSubRealmAttack || 8)) * majorScale;
  const baseSpd = ((cfg.baseSpeed || 10) + idx * (cfg.perSubRealmSpeed || 3)) * Math.pow(1.12, majorIdx);
  const baseDef = Math.round(12 + idx * 4.5);

  const tierMult = monsterDef.isBoss ? 2.45 : monsterDef.isElite ? 1.55 : 0.88;
  const atkMult = monsterDef.isBoss ? 1.15 : monsterDef.isElite ? 0.95 : 0.72;

  return {
    maxHp: Math.max(55, Math.round(baseHp * tierMult)),
    attack: Math.max(6, Math.round(baseAtk * atkMult)),
    defense: Math.round(baseDef * (monsterDef.isBoss ? 1.4 : 1.0)),
    speed: Math.max(6, Math.round(baseSpd * (monsterDef.isBoss ? 1.08 : 0.92)))
  };
};
