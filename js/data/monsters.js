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
  long_uy:     { ten: 'Thái Cổ Long Uy', he: 'kim', loai: 'tan_cong', heSo: 1.45, hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 100, soHiep: 3 }, { id: 'suy_yeu', tiLeHieuUng: 100, soHiep: 2 }] },
  chay_mau_trao: { ten: 'Huyết Trảo Xé Rách', he: 'kim', loai: 'tan_cong', heSo: 1.18, hieuUng: [{ id: 'chay_mau', tiLeHieuUng: 90, soHiep: 3 }] },
  dien_giat_loi: { ten: 'Cửu Tiêu Lôi Giật', he: 'loi', loai: 'tan_cong', heSo: 1.22, hieuUng: [{ id: 'dien_giat', tiLeHieuUng: 85, soHiep: 2 }] },
  ho_the_yeu_giap: { ten: 'Yêu Giáp Hộ Thể', he: 'tho', loai: 'buff', heSo: 0, hieuUng: [{ id: 'ho_the', tiLeHieuUng: 100, soHiep: 2, targetSelf: true }] },
  yeu_than_toc:    { ten: 'Yêu Ảnh Tật Phong', he: 'moc', loai: 'buff', heSo: 0, hieuUng: [{ id: 'tang_toc', tiLeHieuUng: 100, soHiep: 2, targetSelf: true }] },
  huyet_sat_hoi_phuc: { ten: 'Huyết Sát Tự Hồi', he: 'moc', loai: 'hoi_phuc', heSo: 0, healPct: 0.12, hieuUng: [{ id: 'tang_cong', tiLeHieuUng: 100, soHiep: 2, targetSelf: true }] },
  am_sat_suy_yeu:  { ten: 'U Minh Chú Ấn', he: 'thuy', loai: 'tan_cong', heSo: 1.05, hieuUng: [{ id: 'suy_yeu', tiLeHieuUng: 85, soHiep: 2 }, { id: 'pha_giap', tiLeHieuUng: 75, soHiep: 2 }] }
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
  { id: 'boss_tan_thu_gioi', ten: 'Boss Thế Giới', bossSubtitle: 'Hóa Long Cổ Xà', bossImage: 'assets/boss_tan_thu.jpg', bossSprite: 'assets/boss_tan_thu_sprite.png', bossAccent: '#4ade80', mapPos: { x: 920, y: 240 }, he: 'kim', svgKey: 'dragon_boss', isBoss: true, entityType: 'boss', viDien: 'tan_thu_gioi', canhGioiIdx: 23, chieu: ['long_uy', 'hoa_cau', 'xich_troi', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.45, dropTechId: 'boss_tu_phu_kiem_y', phanThuong: ['vang_tinh_kim', 'huyet_chan_long'] },

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
  { id: 'boss_huyen_linh_gioi', ten: 'Boss Thế Giới', bossSubtitle: 'Huyền Linh Chân Long', bossImage: 'assets/boss_huyen_linh.jpg', bossSprite: 'assets/boss_huyen_linh_sprite.png', bossAccent: '#38bdf8', mapPos: { x: 920, y: 240 }, he: 'loi', svgKey: 'thunder_boss', isBoss: true, entityType: 'boss', viDien: 'huyen_linh_gioi', canhGioiIdx: 43, chieu: ['long_uy', 'loi_kich', 'phong_an', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.50, dropTechId: 'boss_hoa_than_loi_vuc', phanThuong: ['thien_loi_tinh', 'huyet_chan_long'] },

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
  { id: 'boss_kiep_van_gioi', ten: 'Boss Thế Giới', bossSubtitle: 'Cửu Thiên Thần Long', bossImage: 'assets/boss_kiep_van.jpg', bossSprite: 'assets/boss_kiep_van_sprite.png', bossAccent: '#c084fc', mapPos: { x: 920, y: 240 }, he: 'bang', svgKey: 'ice_boss', isBoss: true, entityType: 'boss', viDien: 'kiep_van_gioi', canhGioiIdx: 68, chieu: ['long_uy', 'bang_tien', 'xich_troi', 'phong_an'], ai: 'cycle', khangHieuUng: 0.55, dropTechId: 'boss_ban_thanh_bang_phong', phanThuong: ['cuu_u_bang_tinh', 'huyet_chan_long'] },

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
  { id: 'boss_hong_mong_gioi', ten: 'Boss Thế Giới', bossSubtitle: 'Hồng Mông Long Đế', bossImage: 'assets/boss_hong_mong.jpg', bossSprite: 'assets/boss_hong_mong_sprite.png', bossAccent: '#facc15', mapPos: { x: 920, y: 240 }, he: 'hoa', svgKey: 'chaos_boss', isBoss: true, entityType: 'boss', viDien: 'hong_mong_gioi', canhGioiIdx: 103, chieu: ['long_uy', 'hoa_cau', 'xich_troi', 'phong_an'], ai: 'cycle', khangHieuUng: 0.65, dropTechId: 'boss_hong_mong_diet_the', phanThuong: ['chan_long_huyet', 'huyet_chan_long'] },

  // --- VỊ DIỆN 5: ĐẾ LỘ CHIẾN TRƯỜNG (Tri Đạo Cảnh Viên Mãn 99 -> Chuẩn Đế Viên Mãn 129) ---
  { id: 'dl_1', ten: 'Chứng Đạo Cổ Kỳ Lân',   he: 'kim',  svgKey: 'qilin',        viDien: 'de_lo_chien_truong', canhGioiIdx: 100, chieu: ['long_uy', 'can_xe'], ai: 'cycle', khangHieuUng: 0.42, phanThuong: ['thien_canh_kim'] },
  { id: 'dl_2', ten: 'U Minh Đế Hạt',         he: 'moc',  svgKey: 'scorpion',     viDien: 'de_lo_chien_truong', canhGioiIdx: 104, chieu: ['doc_nha', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.44, phanThuong: ['thanh_long_moc'] },
  { id: 'dl_3', ten: 'Chưởng Đạo Huyền Vũ',   he: 'tho',  svgKey: 'turtle',       viDien: 'de_lo_chien_truong', canhGioiIdx: 108, chieu: ['thach_ap', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.46, phanThuong: ['huyen_hoang_thach'] },
  { id: 'dl_4', ten: 'Thiên Đạo Chiến Khôi',  he: 'kim',  svgKey: 'demon_knight', viDien: 'de_lo_chien_truong', canhGioiIdx: 112, chieu: ['long_uy', 'phong_an'], ai: 'cycle', khangHieuUng: 0.48, phanThuong: ['thien_canh_kim', 'huyet_chan_long'] },
  { id: 'dl_5', ten: 'Thần Cảnh Tinh Thú',    he: 'bang', svgKey: 'star_beast',   viDien: 'de_lo_chien_truong', canhGioiIdx: 116, chieu: ['bang_tien', 'xich_troi'], ai: 'cycle', khangHieuUng: 0.50, phanThuong: ['cuu_u_bang_tinh'] },
  { id: 'dl_6', ten: 'Thái Cổ Phượng Hoàng',  he: 'hoa',  svgKey: 'phoenix',      viDien: 'de_lo_chien_truong', canhGioiIdx: 120, chieu: ['hoa_cau', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.52, phanThuong: ['phu_tang_than_moc'] },
  { id: 'dl_7', ten: 'Chí Cảnh Lôi Tôn',      he: 'loi',  svgKey: 'cultivator_male', entityType: 'cultivator', viDien: 'de_lo_chien_truong', canhGioiIdx: 124, chieu: ['loi_kich', 'phong_an', 'long_uy'], ai: 'cycle', khangHieuUng: 0.55, phanThuong: ['thien_loi_tinh'] },
  { id: 'dl_8', ten: 'Chuẩn Đế Kiếm Thần',    he: 'kim',  svgKey: 'cultivator_female', entityType: 'cultivator', viDien: 'de_lo_chien_truong', canhGioiIdx: 128, chieu: ['long_uy', 'xich_troi', 'hoa_cau'], ai: 'cycle', khangHieuUng: 0.58, phanThuong: ['chan_long_huyet', 'thien_canh_kim'] },
  { id: 'dl_elite', ten: '★ Tinh Anh: Đế Lộ Hỗn Độn Kỳ Lân', he: 'hoa', svgKey: 'qilin', isElite: true, viDien: 'de_lo_chien_truong', canhGioiIdx: 129, chieu: ['long_uy', 'hoa_cau', 'phong_an'], ai: 'cycle', khangHieuUng: 0.62, phanThuong: ['chan_long_huyet', 'huyet_chan_long'] },

  // 3 CON BOSS THẾ GIỚI KHÁC NHAU TRÊN ĐẾ LỘ CHIẾN TRƯỜNG (icon & hình dạng trong trận khác nhau)
  { id: 'boss_de_lo_1', ten: 'Boss Thế Giới', bossSubtitle: 'Thái Cổ Đế Long Tôn', he: 'kim', svgKey: 'chaos_boss', bossImage: 'assets/boss_de_lo_1.jpg', bossSprite: 'assets/boss_de_lo_1_sprite.png', bossAccent: '#facc15', mapPos: { x: 920, y: 240 }, isBoss: true, entityType: 'boss', viDien: 'de_lo_chien_truong', canhGioiIdx: 130, chieu: ['long_uy', 'hoa_cau', 'xich_troi', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.68, dropTechId: 'boss_hong_mong_diet_the', phanThuong: ['chan_long_huyet', 'huyet_chan_long'] },
  { id: 'boss_de_lo_2', ten: 'Boss Thế Giới', bossSubtitle: 'Phần Thiên Ma Đế',   he: 'hoa', svgKey: 'dragon_boss', bossImage: 'assets/boss_de_lo_2.jpg', bossSprite: 'assets/boss_de_lo_2_sprite.png', bossAccent: '#fb7185', mapPos: { x: 210, y: 690 }, isBoss: true, entityType: 'boss', viDien: 'de_lo_chien_truong', canhGioiIdx: 132, chieu: ['hoa_cau', 'long_uy', 'phong_an', 'cuong_no'], ai: 'cycle', khangHieuUng: 0.70, dropTechId: 'boss_hoa_than_loi_vuc', phanThuong: ['phu_tang_than_moc', 'chan_long_huyet'] },
  { id: 'boss_de_lo_3', ten: 'Boss Thế Giới', bossSubtitle: 'Cửu U Tinh Không Thú', he: 'bang', svgKey: 'ice_boss', bossImage: 'assets/boss_de_lo_3.jpg', bossSprite: 'assets/boss_de_lo_3_sprite.png', bossAccent: '#38bdf8', mapPos: { x: 890, y: 1180 }, isBoss: true, entityType: 'boss', viDien: 'de_lo_chien_truong', canhGioiIdx: 134, chieu: ['bang_tien', 'long_uy', 'xich_troi', 'phong_an'], ai: 'cycle', khangHieuUng: 0.72, dropTechId: 'boss_ban_thanh_bang_phong', phanThuong: ['cuu_u_bang_tinh', 'huyet_chan_long'] }
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
