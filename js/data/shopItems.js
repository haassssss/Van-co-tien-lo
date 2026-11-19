/**
 * js/data/shopItems.js
 * Danh mục hàng hóa Thương Thành mở rộng cho Tầng 1, Tầng 2 (10+ cố định & 10+ luân phiên), Tầng 3 (15+ cố định & 15+ luân phiên).
 * Khí Phường & Phù Các bán cả Pháp Bảo & Linh Phù rèn/họa sẵn theo tầng (Tầng 1: Phẩm 1, Tầng 2: Phẩm 2, Tầng 3: Phẩm 3; 2 phẩm cao nhất 4-5 chỉ bán ở Tầng 4 sau này).
 */
window.TuTien = window.TuTien || {};

window.TuTien.SHOP_ITEMS = [
  // =========================================================================
  // TẦNG 1 — HẠ PHẨM CÁC (Giá: 1 .. 99 Hạ Phẩm • Pháp Bảo/Linh Phù Phẩm 1)
  // =========================================================================
  // Đan Phường (T1)
  { id: 't1_tu_linh_thao', loai: 'alchemy_mat', refId: 'tu_linh_thao', phamGiai: 1, tang: 1, gia: 12, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Dược liệu cơ bản luyện Tụ Khí Đan.' },
  { id: 't1_pha_chuong_qua', loai: 'alchemy_mat', refId: 'pha_chuong_qua', phamGiai: 1, tang: 1, gia: 18, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Dược quả tăng tỉ lệ đột phá.' },
  { id: 't1_huyet_ngoc_sam', loai: 'alchemy_mat', refId: 'huyet_ngoc_sam', phamGiai: 1, tang: 1, gia: 24, hangMuc: 'dan_phuong', gioiHanMoiDot: 20, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Nhân sâm dưỡng huyết, hồi sinh lực.' },
  { id: 't1_thanh_thuy_lien', loai: 'alchemy_mat', refId: 'thanh_thuy_lien', phamGiai: 1, tang: 1, gia: 28, hangMuc: 'dan_phuong', gioiHanMoiDot: 18, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Sen thủy linh thanh lọc kinh mạch.' },
  { id: 't1_hau_tho_linh_chi', loai: 'alchemy_mat', refId: 'hau_tho_linh_chi', phamGiai: 1, tang: 1, gia: 32, hangMuc: 'dan_phuong', gioiHanMoiDot: 15, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Linh chi hệ Thổ củng cố hộ thể.' },
  { id: 't1_pill_tu_khi', loai: 'pill', refId: 'tu_khi_dan', phamGiai: 1, tang: 1, gia: 55, hangMuc: 'dan_phuong', gioiHanMoiDot: 8, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Tụ Khí Đan Phẩm 1 dùng ngay.' },
  { id: 't1_pill_ho_mach_vip', loai: 'pill', refId: 'ho_mach_dan', phamGiai: 1, tang: 1, gia: 75, hangMuc: 'dan_phuong', gioiHanMoiDot: 5, yeuCauCanhGioi: 5, yeuCauHaoCam: 1, moTa: '[Khách Quen] Hộ Mạch Đan Phẩm 1.' },

  // Khí Phường (T1 — Khoáng + Pháp Bảo Phẩm 1)
  { id: 't1_sat_khoang', loai: 'forge_mat', refId: 'sat_khoang', phamGiai: 1, tang: 1, gia: 10, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Huyền Thiết cơ bản rèn pháp bảo.' },
  { id: 't1_da_khoang', loai: 'forge_mat', refId: 'da_khoang', phamGiai: 1, tang: 1, gia: 12, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Linh Thạch khoáng tăng phòng ngự.' },
  { id: 't1_go_linh_moc', loai: 'forge_mat', refId: 'go_linh_moc', phamGiai: 1, tang: 1, gia: 14, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Linh Mộc tinh luyện pháp khí.' },
  { id: 't1_xich_dong_hoa', loai: 'forge_mat', refId: 'xich_dong_hoa', phamGiai: 1, tang: 1, gia: 26, hangMuc: 'khi_phuong', gioiHanMoiDot: 16, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Xích Đồng hệ Hỏa tăng công kích.' },
  { id: 't1_bich_thuy_ngoc', loai: 'forge_mat', refId: 'bich_thuy_ngoc', phamGiai: 1, tang: 1, gia: 30, hangMuc: 'khi_phuong', gioiHanMoiDot: 16, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Bích Thủy Ngọc bổ trợ Linh Lực.' },
  { id: 't1_art_thanh_phong', loai: 'artifact', refId: 'thanh_phong_cham', phamGiai: 1, tang: 1, gia: 72, hangMuc: 'khi_phuong', gioiHanMoiDot: 3, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Pháp Bảo Phẩm 1 rèn sẵn: Thanh Phong Châm.' },
  { id: 't1_art_huyet_anh', loai: 'artifact', refId: 'huyet_anh_dao', phamGiai: 1, tang: 1, gia: 88, hangMuc: 'khi_phuong', gioiHanMoiDot: 2, yeuCauCanhGioi: 5, yeuCauHaoCam: 1, moTa: '[Khách Quen] Pháp Bảo Phẩm 1: Huyết Ảnh Đao.' },

  // Phù Các (T1 — Phù Liệu + Linh Phù Phẩm 1)
  { id: 't1_hoang_chi', loai: 'talisman_mat', refId: 'hoang_chi', phamGiai: 1, tang: 1, gia: 8, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Hoàng Chỉ cơ bản dùng họa phù.' },
  { id: 't1_chu_sa_hoa', loai: 'talisman_mat', refId: 'chu_sa_hoa', phamGiai: 1, tang: 1, gia: 14, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Chu Sa Hỏa mực vẽ phù.' },
  { id: 't1_huyet_yeu_lang', loai: 'talisman_mat', refId: 'huyet_yeu_lang', phamGiai: 1, tang: 1, gia: 22, hangMuc: 'phu_cac', gioiHanMoiDot: 18, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Tinh huyết Yêu Lang tăng uy lực phù.' },
  { id: 't1_tung_huong_phan', loai: 'talisman_mat', refId: 'tung_huong_phan', phamGiai: 1, tang: 1, gia: 18, hangMuc: 'phu_cac', gioiHanMoiDot: 20, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Phấn tùng hương ổn định linh văn.' },
  { id: 't1_phu_than_hanh', loai: 'talisman', refId: 'than_hanh_phu', phamGiai: 1, tang: 1, gia: 60, hangMuc: 'phu_cac', gioiHanMoiDot: 6, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Linh Phù Phẩm 1: Thần Hành Phù.' },
  { id: 't1_phu_tu_dong', loai: 'talisman', refId: 'tu_dong_van_cong_phu', phamGiai: 1, tang: 1, gia: 78, hangMuc: 'phu_cac', gioiHanMoiDot: 4, yeuCauCanhGioi: 5, yeuCauHaoCam: 1, moTa: '[Khách Quen] Linh Phù Phẩm 1: Tự Động Vận Công Phù.' },

  // Tạp Hóa (T1)
  { id: 't1_linh_thao_tui', loai: 'utility', refId: 'herb_pack_small', phamGiai: 1, tang: 1, gia: 35, hangMuc: 'tap_hoa', gioiHanMoiDot: 15, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Gói +50 Linh Thảo cho Lĩnh Vực.' },
  { id: 't1_mo_rong_tui_1', loai: 'utility', refId: 'expand_bag_5', phamGiai: 1, tang: 1, gia: 90, hangMuc: 'tap_hoa', gioiHanMoiDot: 3, yeuCauCanhGioi: 0, yeuCauHaoCam: 0, moTa: 'Mở rộng thêm +5 ô Túi Trữ Vật.' },
  { id: 't1_linh_dien_bon_phan', loai: 'utility', refId: 'field_plot_1', phamGiai: 1, tang: 1, gia: 95, hangMuc: 'tap_hoa', gioiHanMoiDot: 2, yeuCauCanhGioi: 5, yeuCauHaoCam: 1, moTa: '[Khách Quen] Mở rộng +1 ô Linh Điền.' },

  // =========================================================================
  // TẦNG 2 — TRUNG PHẨM ĐIỆN (Giá: 100 .. 9,900 Hạ • 15 Cố Định + 18 Luân Phiên • Pháp Bảo/Phù Phẩm 2)
  // =========================================================================
  // Đan Phường (T2)
  { id: 't2_loi_tam_thao', loai: 'alchemy_mat', refId: 'loi_tam_thao', phamGiai: 2, tang: 2, gia: 200, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Lôi Tâm Thảo chứa linh khí lôi đình.' },
  { id: 't2_han_bang_tuyet_lien', loai: 'alchemy_mat', refId: 'han_bang_tuyet_lien', phamGiai: 2, tang: 2, gia: 300, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Tuyết Liên vùng cực hàn.' },
  { id: 't2_bang_phach_thao', loai: 'alchemy_mat', refId: 'bang_phach_thao', phamGiai: 2, tang: 2, gia: 400, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 12, yeuCauHaoCam: 0, moTa: 'Băng Phách Thảo định thần dưỡng khí.' },
  { id: 't2_xich_viem_chu_qua', loai: 'alchemy_mat', refId: 'xich_viem_chu_qua', phamGiai: 2, tang: 2, gia: 500, hangMuc: 'dan_phuong', gioiHanMoiDot: 15, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Xích Viêm Chu Quả tăng hỏa lực đan lô.' },
  { id: 't2_thien_loi_qua', loai: 'alchemy_mat', refId: 'thien_loi_qua', phamGiai: 2, tang: 2, gia: 700, hangMuc: 'dan_phuong', gioiHanMoiDot: 12, yeuCauCanhGioi: 18, yeuCauHaoCam: 0, moTa: 'Thiên Lôi Quả hộ thân vượt lôi kiếp.' },
  { id: 't2_pill_tu_khi_2', loai: 'pill', refId: 'tu_khi_dan', phamGiai: 2, tang: 2, gia: 600, hangMuc: 'dan_phuong', gioiHanMoiDot: 10, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Tụ Khí Đan Phẩm 2 tăng mạnh tốc độ tu luyện.' },
  { id: 't2_pill_pha_canh', loai: 'pill', refId: 'pha_canh_dan', phamGiai: 2, tang: 2, gia: 1200, hangMuc: 'dan_phuong', gioiHanMoiDot: 6, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Phá Cảnh Đan Phẩm 2 trợ đột phá.' },
  { id: 't2_pill_liet_hoa', loai: 'pill', refId: 'liet_hoa_dan', phamGiai: 2, tang: 2, gia: 1500, hangMuc: 'dan_phuong', gioiHanMoiDot: 5, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Liệt Hỏa Đan Phẩm 2 tăng công kích.' },
  { id: 't2_u_minh_bi_ngan_vip', loai: 'alchemy_mat', refId: 'u_minh_bi_ngan', phamGiai: 2, tang: 2, gia: 1800, hangMuc: 'dan_phuong', gioiHanMoiDot: 8, yeuCauCanhGioi: 20, yeuCauHaoCam: 2, moTa: '[Quý Khách] U Minh Bỉ Ngạn quý hiếm.' },

  // Khí Phường (T2 — Khoáng + Pháp Bảo Phẩm 2)
  { id: 't2_bach_ngan_tinh', loai: 'forge_mat', refId: 'bach_ngan_tinh', phamGiai: 2, tang: 2, gia: 200, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Bạch Ngân Tinh dẫn linh cực tốt.' },
  { id: 't2_vang_tinh_kim', loai: 'forge_mat', refId: 'vang_tinh_kim', phamGiai: 2, tang: 2, gia: 300, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Vàng Tinh Kim rèn binh khí sắc bén.' },
  { id: 't2_tu_loi_thiet', loai: 'forge_mat', refId: 'tu_loi_thiet', phamGiai: 2, tang: 2, gia: 400, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 12, yeuCauHaoCam: 0, moTa: 'Tử Lôi Thiết rèn binh khí hệ Lôi.' },
  { id: 't2_han_bang_ngoc', loai: 'forge_mat', refId: 'han_bang_ngoc', phamGiai: 2, tang: 2, gia: 600, hangMuc: 'khi_phuong', gioiHanMoiDot: 12, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Hàn Băng Ngọc rèn pháp bảo hệ Băng.' },
  { id: 't2_viem_duong_thach', loai: 'forge_mat', refId: 'viem_duong_thach', phamGiai: 2, tang: 2, gia: 900, hangMuc: 'khi_phuong', gioiHanMoiDot: 10, yeuCauCanhGioi: 18, yeuCauHaoCam: 0, moTa: 'Viêm Dương Thạch rực cháy hỏa tinh.' },
  { id: 't2_huyen_hoang_thach', loai: 'forge_mat', refId: 'huyen_hoang_thach', phamGiai: 2, tang: 2, gia: 1400, hangMuc: 'khi_phuong', gioiHanMoiDot: 8, yeuCauCanhGioi: 20, yeuCauHaoCam: 2, moTa: '[Quý Khách] Huyền Hoàng Thạch phòng ngự đỉnh cao.' },
  { id: 't2_art_thanh_tam', loai: 'artifact', refId: 'thanh_tam_boi', phamGiai: 2, tang: 2, gia: 1600, hangMuc: 'khi_phuong', gioiHanMoiDot: 3, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Pháp Bảo Phẩm 2 rèn sẵn: Thanh Tâm Bội.' },
  { id: 't2_art_tu_linh', loai: 'artifact', refId: 'tu_linh_phu_boi', phamGiai: 2, tang: 2, gia: 2200, hangMuc: 'khi_phuong', gioiHanMoiDot: 2, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Pháp Bảo Phẩm 2 rèn sẵn: Tụ Linh Phù Bội.' },
  { id: 't2_art_phi_kiem', loai: 'artifact', refId: 'thanh_van_phi_kiem', phamGiai: 2, tang: 2, gia: 3200, hangMuc: 'khi_phuong', gioiHanMoiDot: 2, yeuCauCanhGioi: 18, yeuCauHaoCam: 1, moTa: '[Khách Quen] Pháp Bảo Phẩm 2: Thanh Vân Phi Kiếm.' },

  // Phù Các (T2 — Phù Liệu + Linh Phù Phẩm 2)
  { id: 't2_thanh_linh_chi', loai: 'talisman_mat', refId: 'thanh_linh_chi', phamGiai: 2, tang: 2, gia: 200, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Thanh Linh Chỉ vẽ phù trung cấp.' },
  { id: 't2_noc_huyet_doc_xa', loai: 'talisman_mat', refId: 'noc_huyet_doc_xa', phamGiai: 2, tang: 2, gia: 300, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Nọc huyết Độc Xà tăng độc tính phù.' },
  { id: 't2_canh_kim_mac', loai: 'talisman_mat', refId: 'canh_kim_mac', phamGiai: 2, tang: 2, gia: 400, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 12, yeuCauHaoCam: 0, moTa: 'Canh Kim Mặc vẽ phù hệ Kim.' },
  { id: 't2_thanh_loi_mac', loai: 'talisman_mat', refId: 'thanh_loi_mac', phamGiai: 2, tang: 2, gia: 500, hangMuc: 'phu_cac', gioiHanMoiDot: 14, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Thanh Lôi Mặc dẫn lôi linh văn.' },
  { id: 't2_huyet_loi_dieu', loai: 'talisman_mat', refId: 'huyet_loi_dieu', phamGiai: 2, tang: 2, gia: 600, hangMuc: 'phu_cac', gioiHanMoiDot: 12, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Tinh huyết Lôi Điểu.' },
  { id: 't2_kim_van_chi', loai: 'talisman_mat', refId: 'kim_van_chi', phamGiai: 2, tang: 2, gia: 800, hangMuc: 'phu_cac', gioiHanMoiDot: 10, yeuCauCanhGioi: 18, yeuCauHaoCam: 0, moTa: 'Kim Văn Chỉ chịu linh lực cao.' },
  { id: 't2_phu_liet_hoa', loai: 'talisman', refId: 'liet_hoa_kich_phu', phamGiai: 2, tang: 2, gia: 1100, hangMuc: 'phu_cac', gioiHanMoiDot: 5, yeuCauCanhGioi: 12, yeuCauHaoCam: 0, moTa: 'Linh Phù Phẩm 2: Liệt Hỏa Kích Phù.' },
  { id: 't2_phu_ho_dao', loai: 'talisman', refId: 'ho_dao_kim_phu', phamGiai: 2, tang: 2, gia: 1500, hangMuc: 'phu_cac', gioiHanMoiDot: 4, yeuCauCanhGioi: 18, yeuCauHaoCam: 1, moTa: '[Khách Quen] Linh Phù Phẩm 2: Hộ Đạo Kim Phù.' },

  // Tàng Kinh Các (T2 — Hoàng Giai & Huyền Giai)
  { id: 't2_tech_ho_the', loai: 'technique', refId: 'ho_the_kim_quang', phamGiai: 2, tang: 2, gia: 1500, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Bí tịch Hoàng Giai: Hộ Thể Kim Quang.' },
  { id: 't2_tech_hoi_xuan', loai: 'technique', refId: 'hoi_xuan_quyet', phamGiai: 2, tang: 2, gia: 1800, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Bí tịch Hoàng Giai: Hồi Xuân Dưỡng Sinh Quyết.' },
  { id: 't2_tech_liet_hoa', loai: 'technique', refId: 'liet_hoa_chuong', phamGiai: 2, tang: 2, gia: 2200, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Bí tịch Hoàng Giai: Liệt Hỏa Phần Thiên Chưởng.' },
  { id: 't2_tech_doc_long', loai: 'technique', refId: 'doc_long_trao', phamGiai: 2, tang: 2, gia: 2400, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Bí tịch Hoàng Giai: Độc Long Trảo.' },
  { id: 't2_tech_han_bang', loai: 'technique', refId: 'han_bang_chi', phamGiai: 3, tang: 2, gia: 4500, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 20, yeuCauHaoCam: 0, moTa: 'Bí tịch Huyền Giai: Hàn Băng Ngưng Hồn Chỉ.' },
  { id: 't2_tech_pha_giap', loai: 'technique', refId: 'pha_giap_thuong', phamGiai: 3, tang: 2, gia: 5500, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 20, yeuCauHaoCam: 1, moTa: '[Khách Quen] Bí tịch Huyền Giai: Phá Giáp Long Thương.' },

  // Tạp Hóa (T2)
  { id: 't2_linh_thao_dai', loai: 'utility', refId: 'herb_pack_large', phamGiai: 2, tang: 2, gia: 500, hangMuc: 'tap_hoa', gioiHanMoiDot: 0, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Rương +500 Linh Thảo cho Lĩnh Vực.' },
  { id: 't2_mo_rong_tui_2', loai: 'utility', refId: 'expand_bag_10', phamGiai: 2, tang: 2, gia: 1200, hangMuc: 'tap_hoa', gioiHanMoiDot: 3, yeuCauCanhGioi: 10, yeuCauHaoCam: 0, moTa: 'Mở rộng thêm +10 ô Túi Trữ Vật.' },
  { id: 't2_mo_khai_khoang', loai: 'utility', refId: 'mine_slot_1', phamGiai: 2, tang: 2, gia: 2500, hangMuc: 'tap_hoa', gioiHanMoiDot: 2, yeuCauCanhGioi: 15, yeuCauHaoCam: 0, moTa: 'Mở thêm +1 suất Khai Khoáng tự động.' },

  // =========================================================================
  // TẦNG 3 — THƯỢNG PHẨM LÂU (Giá >= 10,000 Hạ • 18 Cố Định + 18 Luân Phiên • Pháp Bảo/Phù Phẩm 3)
  // (Ghi chú: Pháp Bảo & Linh Phù Phẩm 4-5 để dành riêng cho Tầng 4 Đấu Giá sau này!)
  // =========================================================================
  // Đan Phường (T3)
  { id: 't3_tinh_than_long_thao', loai: 'alchemy_mat', refId: 'tinh_than_long_thao', phamGiai: 3, tang: 3, gia: 20000, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Tinh Thần Long Thảo quý hiếm.' },
  { id: 't3_thai_at_duong_hon', loai: 'alchemy_mat', refId: 'thai_at_duong_hon_moc', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Thái Ất Dưỡng Hồn Mộc tư dưỡng nguyên thần.' },
  { id: 't3_u_minh_bi_ngan', loai: 'alchemy_mat', refId: 'u_minh_bi_ngan', phamGiai: 3, tang: 3, gia: 20000, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'U Minh Bỉ Ngạn vạn năm.' },
  { id: 't3_thien_loi_qua', loai: 'alchemy_mat', refId: 'thien_loi_qua', phamGiai: 3, tang: 3, gia: 20000, hangMuc: 'dan_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Thiên Lôi Quả thuần khiết.' },
  { id: 't3_cuu_chuyen_tien_chi', loai: 'alchemy_mat', refId: 'cuu_chuyen_tien_chi', phamGiai: 3, tang: 3, gia: 60000, hangMuc: 'dan_phuong', gioiHanMoiDot: 6, yeuCauCanhGioi: 40, yeuCauHaoCam: 2, moTa: '[Quý Khách] Cửu Chuyển Tiên Chi.' },
  { id: 't3_pill_pha_canh_3', loai: 'pill', refId: 'pha_canh_dan', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'dan_phuong', gioiHanMoiDot: 6, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Phá Cảnh Đan Phẩm 3.' },
  { id: 't3_pill_bang_tam_3', loai: 'pill', refId: 'bang_tam_dan', phamGiai: 3, tang: 3, gia: 40000, hangMuc: 'dan_phuong', gioiHanMoiDot: 5, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Băng Tâm Đan Phẩm 3 thanh tâm định thần.' },
  { id: 't3_pill_ho_mach_3', loai: 'pill', refId: 'ho_mach_dan', phamGiai: 3, tang: 3, gia: 40000, hangMuc: 'dan_phuong', gioiHanMoiDot: 5, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Hộ Mạch Đan Phẩm 3 bảo vệ kinh mạch.' },

  // Khí Phường (T3 — Khoáng hiếm + Pháp Bảo Phẩm 3)
  { id: 't3_thien_canh_kim', loai: 'forge_mat', refId: 'thien_canh_kim', phamGiai: 3, tang: 3, gia: 20000, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Thiên Canh Kim rèn thần binh.' },
  { id: 't3_cuu_u_bang_tinh', loai: 'forge_mat', refId: 'cuu_u_bang_tinh', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Cửu U Băng Tinh ngàn năm bất tan.' },
  { id: 't3_thanh_long_moc', loai: 'forge_mat', refId: 'thanh_long_moc', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Thanh Long Mộc ẩn chứa mộc linh.' },
  { id: 't3_thuong_hai_ngoc', loai: 'forge_mat', refId: 'thuong_hai_ngoc', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'khi_phuong', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Thương Hải Ngọc dồi dào thủy nguyên.' },
  { id: 't3_thien_loi_tinh', loai: 'forge_mat', refId: 'thien_loi_tinh', phamGiai: 3, tang: 3, gia: 40000, hangMuc: 'khi_phuong', gioiHanMoiDot: 8, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Thiên Lôi Tinh tích tụ thiên lôi.' },
  { id: 't3_phu_tang_moc', loai: 'forge_mat', refId: 'phu_tang_than_moc', phamGiai: 3, tang: 3, gia: 50000, hangMuc: 'khi_phuong', gioiHanMoiDot: 6, yeuCauCanhGioi: 40, yeuCauHaoCam: 0, moTa: 'Phù Tang Thần Mộc bất diệt.' },
  { id: 't3_chan_long_huyet', loai: 'forge_mat', refId: 'chan_long_huyet', phamGiai: 3, tang: 3, gia: 70000, hangMuc: 'khi_phuong', gioiHanMoiDot: 4, yeuCauCanhGioi: 45, yeuCauHaoCam: 3, moTa: '[Tri Kỷ] Chân Long Huyết luyện tuyệt thế pháp bảo.' },
  { id: 't3_art_moc_linh', loai: 'artifact', refId: 'moc_linh_phien', phamGiai: 3, tang: 3, gia: 40000, hangMuc: 'khi_phuong', gioiHanMoiDot: 2, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Pháp Bảo Phẩm 3 rèn sẵn: Mộc Linh Phiến.' },
  { id: 't3_art_phi_kiem_3', loai: 'artifact', refId: 'thanh_van_phi_kiem', phamGiai: 3, tang: 3, gia: 50000, hangMuc: 'khi_phuong', gioiHanMoiDot: 2, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Pháp Bảo Phẩm 3 rèn sẵn: Thanh Vân Phi Kiếm.' },
  { id: 't3_art_huyet_anh_3', loai: 'artifact', refId: 'huyet_anh_dao', phamGiai: 3, tang: 3, gia: 60000, hangMuc: 'khi_phuong', gioiHanMoiDot: 2, yeuCauCanhGioi: 40, yeuCauHaoCam: 1, moTa: '[Khách Quen] Pháp Bảo Phẩm 3: Huyết Ảnh Đao.' },

  // Phù Các (T3 — Phù Liệu hiếm + Linh Phù Phẩm 3)
  { id: 't3_tien_tam_chi', loai: 'talisman_mat', refId: 'tien_tam_chi', phamGiai: 3, tang: 3, gia: 20000, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Tiên Tàm Thần Chỉ chứa đại đạo phù văn.' },
  { id: 't3_huyet_hac_hung', loai: 'talisman_mat', refId: 'huyet_hac_hung', phamGiai: 3, tang: 3, gia: 20000, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Huyết Hắc Hùng tăng độ bền linh phù.' },
  { id: 't3_long_dien_huong', loai: 'talisman_mat', refId: 'long_dien_huong', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'phu_cac', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Long Diên Hương khuếch đại linh văn.' },
  { id: 't3_thai_at_linh_dich', loai: 'talisman_mat', refId: 'thai_at_linh_dich', phamGiai: 3, tang: 3, gia: 40000, hangMuc: 'phu_cac', gioiHanMoiDot: 8, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Thái Ất Linh Dịch tinh khiết.' },
  { id: 't3_huyet_xich_ho', loai: 'talisman_mat', refId: 'huyet_xich_ho', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'phu_cac', gioiHanMoiDot: 8, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Tinh huyết Xích Hổ uy chấn tứ phương.' },
  { id: 't3_huyet_chan_long', loai: 'talisman_mat', refId: 'huyet_chan_long', phamGiai: 3, tang: 3, gia: 60000, hangMuc: 'phu_cac', gioiHanMoiDot: 4, yeuCauCanhGioi: 45, yeuCauHaoCam: 3, moTa: '[Tri Kỷ] Chân Long Tinh Huyết.' },
  { id: 't3_phu_be_quan_3', loai: 'talisman', refId: 'thien_nien_be_quan_phu', phamGiai: 3, tang: 3, gia: 40000, hangMuc: 'phu_cac', gioiHanMoiDot: 4, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Linh Phù Phẩm 3: Thiên Niên Bế Quan Phù.' },
  { id: 't3_phu_ho_dao_3', loai: 'talisman', refId: 'ho_dao_kim_phu', phamGiai: 3, tang: 3, gia: 50000, hangMuc: 'phu_cac', gioiHanMoiDot: 4, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Linh Phù Phẩm 3: Hộ Đạo Kim Phù.' },
  { id: 't3_phu_liet_hoa_3', loai: 'talisman', refId: 'liet_hoa_kich_phu', phamGiai: 3, tang: 3, gia: 50000, hangMuc: 'phu_cac', gioiHanMoiDot: 4, yeuCauCanhGioi: 35, yeuCauHaoCam: 0, moTa: 'Linh Phù Phẩm 3: Liệt Hỏa Kích Phù.' },

  // Tàng Kinh Các (T3 — Địa Giai, Thiên Giai & Tiên Phẩm)
  { id: 't3_tech_tram_hon', loai: 'technique', refId: 'tram_hon_ket_lieu', phamGiai: 4, tang: 3, gia: 30000, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Bí tịch Địa Giai: Trảm Hồn Đoạt Mệnh Kiếm.' },
  { id: 't3_tech_cuu_tieu_loi', loai: 'technique', refId: 'cuu_tieu_than_loi', phamGiai: 4, tang: 3, gia: 30000, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Bí tịch Địa Giai: Cửu Tiêu Thần Lôi Chỉ.' },
  { id: 't3_tech_bang_ha', loai: 'technique', refId: 'bang_ha_toai_cot', phamGiai: 5, tang: 3, gia: 50000, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Bí tịch Thiên Giai: Băng Hà Toái Cốt Quyết.' },
  { id: 't3_tech_van_moc', loai: 'technique', refId: 'van_moc_phuc_sinh', phamGiai: 5, tang: 3, gia: 50000, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Bí tịch Thiên Giai: Vạn Mộc Phục Sinh Thuật.' },
  { id: 't3_tech_chu_tuoc', loai: 'technique', refId: 'chu_tuoc_hoa_vu', phamGiai: 6, tang: 3, gia: 120000, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 40, yeuCauHaoCam: 2, moTa: '[Quý Khách] Bí tịch Tiên Phẩm: Chu Tước Hỏa Vũ.' },
  { id: 't3_tech_thien_cuong', loai: 'technique', refId: 'thien_cuong_ho_tam', phamGiai: 6, tang: 3, gia: 150000, hangMuc: 'tang_kinh_cac', gioiHanMoiDot: 1, yeuCauCanhGioi: 40, yeuCauHaoCam: 3, moTa: '[Tri Kỷ] Bí tịch Tiên Phẩm: Thiên Cương Hộ Tâm Quyết.' },

  // Tạp Hóa (T3)
  { id: 't3_linh_thao_tien', loai: 'utility', refId: 'herb_pack_large', phamGiai: 3, tang: 3, gia: 10000, hangMuc: 'tap_hoa', gioiHanMoiDot: 0, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Rương +500 Linh Thảo thượng hạng.' },
  { id: 't3_mo_rong_tui_3', loai: 'utility', refId: 'expand_bag_20', phamGiai: 3, tang: 3, gia: 30000, hangMuc: 'tap_hoa', gioiHanMoiDot: 2, yeuCauCanhGioi: 30, yeuCauHaoCam: 0, moTa: 'Mở rộng thêm +20 ô Túi Trữ Vật.' },
  { id: 't3_linh_dien_tien', loai: 'utility', refId: 'field_plot_2', phamGiai: 3, tang: 3, gia: 50000, hangMuc: 'tap_hoa', gioiHanMoiDot: 2, yeuCauCanhGioi: 35, yeuCauHaoCam: 1, moTa: '[Khách Quen] Khai khẩn +2 ô Tiên Điền.' }
];
