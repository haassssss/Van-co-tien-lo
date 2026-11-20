/**
 * js/data/shops.js
 * Chợ theo từng Vị Diện với danh mục hàng cố định & luân phiên phong phú cho Tầng 1, Tầng 2 (12+ món), Tầng 3 (18+ món).
 */
window.TuTien = window.TuTien || {};

(function () {
  const f1Fixed = [
    't1_tu_linh_thao', 't1_pha_chuong_qua', 't1_sat_khoang', 't1_da_khoang',
    't1_go_linh_moc', 't1_hoang_chi', 't1_chu_sa_hoa', 't1_linh_thao_tui', 't1_mo_rong_tui_1'
  ];
  const f1Rot = [
    't1_huyet_ngoc_sam', 't1_thanh_thuy_lien', 't1_hau_tho_linh_chi', 't1_pill_tu_khi',
    't1_pill_ho_mach_vip', 't1_xich_dong_hoa', 't1_bich_thuy_ngoc', 't1_art_thanh_phong',
    't1_art_huyet_anh', 't1_huyet_yeu_lang', 't1_tung_huong_phan', 't1_phu_than_hanh',
    't1_phu_tu_dong', 't1_linh_dien_bon_phan'
  ];

  // Tầng 2: 14 món cố định + 20 món luân phiên (>10 món mỗi loại)
  const f2Fixed = [
    't2_loi_tam_thao', 't2_han_bang_tuyet_lien', 't2_bang_phach_thao',
    't2_bach_ngan_tinh', 't2_vang_tinh_kim', 't2_tu_loi_thiet',
    't2_thanh_linh_chi', 't2_noc_huyet_doc_xa', 't2_canh_kim_mac',
    't2_tech_ho_the', 't2_tech_hoi_xuan',
    't2_linh_thao_dai', 't2_mo_rong_tui_2', 't2_art_thanh_tam'
  ];
  const f2Rot = [
    't2_xich_viem_chu_qua', 't2_thien_loi_qua', 't2_pill_tu_khi_2', 't2_pill_pha_canh',
    't2_pill_liet_hoa', 't2_u_minh_bi_ngan_vip', 't2_han_bang_ngoc', 't2_viem_duong_thach',
    't2_huyen_hoang_thach', 't2_art_tu_linh', 't2_art_phi_kiem', 't2_thanh_loi_mac',
    't2_huyet_loi_dieu', 't2_kim_van_chi', 't2_phu_liet_hoa', 't2_phu_ho_dao',
    't2_tech_liet_hoa', 't2_tech_doc_long', 't2_tech_han_bang', 't2_tech_pha_giap',
    't2_mo_khai_khoang'
  ];

  // Tầng 3: 18 món cố định + 18 món luân phiên (>15 món mỗi loại)
  const f3Fixed = [
    't3_tinh_than_long_thao', 't3_thai_at_duong_hon', 't3_u_minh_bi_ngan', 't3_thien_loi_qua',
    't3_thien_canh_kim', 't3_cuu_u_bang_tinh', 't3_thanh_long_moc', 't3_thuong_hai_ngoc',
    't3_tien_tam_chi', 't3_huyet_hac_hung', 't3_long_dien_huong',
    't3_art_moc_linh', 't3_phu_be_quan_3', 't3_pill_pha_canh_3',
    't3_tech_tram_hon', 't3_tech_cuu_tieu_loi',
    't3_linh_thao_tien', 't3_mo_rong_tui_3'
  ];
  const f3Rot = [
    't3_cuu_chuyen_tien_chi', 't3_pill_bang_tam_3', 't3_pill_ho_mach_3',
    't3_thien_loi_tinh', 't3_phu_tang_moc', 't3_chan_long_huyet',
    't3_art_phi_kiem_3', 't3_art_huyet_anh_3',
    't3_thai_at_linh_dich', 't3_huyet_xich_ho', 't3_huyet_chan_long',
    't3_phu_ho_dao_3', 't3_phu_liet_hoa_3',
    't3_tech_bang_ha', 't3_tech_van_moc', 't3_tech_chu_tuoc', 't3_tech_thien_cuong',
    't3_linh_dien_tien'
  ];

  window.TuTien.SHOP_PLANE_MARKETS = {
    tan_thu_gioi: {
      id: 'tan_thu_gioi',
      tenCho: 'Chợ Tân Thủ Giới',
      heSoGia: 1.00,
      moTa: 'Thương hội biên cảnh, giá cả ổn định, hàng phổ thông dồi dào.',
      tang: {
        1: { fixed: f1Fixed, rotatingPool: f1Rot },
        2: { fixed: f2Fixed, rotatingPool: f2Rot },
        3: { fixed: f3Fixed, rotatingPool: f3Rot }
      }
    },
    huyen_linh_gioi: {
      id: 'huyen_linh_gioi',
      tenCho: 'Chợ Huyền Linh Giới',
      heSoGia: 1.05,
      moTa: 'Linh khí sung mãn, bày bán dồi dào linh liệu và pháp bảo Trung Phẩm.',
      tang: {
        1: { fixed: f1Fixed, rotatingPool: f1Rot },
        2: { fixed: f2Fixed, rotatingPool: f2Rot },
        3: { fixed: f3Fixed, rotatingPool: f3Rot }
      }
    },
    kiep_van_gioi: {
      id: 'kiep_van_gioi',
      tenCho: 'Chợ Kiếp Vân Giới',
      heSoGia: 1.10,
      moTa: 'Nơi tụ hội đại năng độ kiếp, bảo vật hệ Lôi và Băng phong phú.',
      tang: {
        1: { fixed: f1Fixed, rotatingPool: f1Rot },
        2: { fixed: f2Fixed, rotatingPool: f2Rot },
        3: { fixed: f3Fixed, rotatingPool: f3Rot }
      }
    },
    de_lo_chien_truong: {
      id: 'de_lo_chien_truong',
      tenCho: 'Chợ Đế Lộ Chiến Trường',
      heSoGia: 1.20,
      moTa: 'Thương hội biên ải Đế Lộ, quy tụ trân bảo tối thượng cho các bậc Chuẩn Đế.',
      tang: {
        1: { fixed: f1Fixed, rotatingPool: f1Rot },
        2: { fixed: f2Fixed, rotatingPool: f2Rot },
        3: { fixed: f3Fixed, rotatingPool: f3Rot }
      }
    },
    hong_mong_gioi: {
      id: 'hong_mong_gioi',
      tenCho: 'Chợ Hồng Mông Giới',
      heSoGia: 1.15,
      moTa: 'Thương hội tối thượng cõi Hồng Mông, cung ứng kỳ trân Thượng Phẩm.',
      tang: {
        1: { fixed: f1Fixed, rotatingPool: f1Rot },
        2: { fixed: f2Fixed, rotatingPool: f2Rot },
        3: { fixed: f3Fixed, rotatingPool: f3Rot }
      }
    }
  };
})();
