/**
 * js/data/techniques.js
 * 24 Công Pháp Chiến Đấu (mỗi công pháp có 1 Chiêu Chủ Động + 1 Buff Đi Kèm khi trang bị trong 4 ô Chiến Kỹ).
 * - nangCap: 'linh_khi' (thăng phẩm bằng Linh Khí) hoặc 'co_dinh' (phẩm giai cao sẵn, rơi từ Boss, không thăng bằng LK).
 * - loaiChieu: 'tan_cong' | 'buff' | 'hoi_phuc' | 'hieu_ung' (buff & hoi_phuc KHÔNG MẤT LƯỢT).
 */
window.TuTien = window.TuTien || {};

window.TuTien.COMBAT_TECHNIQUES = [
  // --- 2 CÔNG PHÁP KHỞI ĐẦU CẤP THẤP NHẤT (ĐẤM THƯỜNG & HỒI PHỤC SƠ CẤP) ---
  {
    id: 'thuong_quyen', ten: 'Thường Quyền', he: 'kim', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 15, hoiChieu: 0, heSoSatThuong: 1.15, uuTien: false,
    hieuUng: [],
    buffDiKem: { stat: 'atkPct', value: 0.04, label: '+4% Công Kích', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Khởi đầu', yeuCauCanhGioi: 0, costQi: 0,
    moTa: 'Quyền cước sơ cấp nhất của tu sĩ mới nhập môn.'
  },
  {
    id: 'hoi_xuan_so_cap', ten: 'Hồi Xuân Sơ Cấp', he: 'moc', loaiChieu: 'hoi_phuc',
    chiPhiLinhLuc: 22, hoiChieu: 2, heSoSatThuong: 0, healPct: 0.16, giaiTru: false,
    hieuUng: [],
    buffDiKem: { stat: 'hpPct', value: 0.05, label: '+5% Máu tối đa', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Khởi đầu', yeuCauCanhGioi: 0, costQi: 0,
    moTa: 'Hồi 16% Máu tối đa trong trận (không mất lượt).'
  },
  // --- 2 CÔNG PHÁP KHỞI ĐẦU (CHUYỂN TỪ CHIÊU HIỆN CÓ) ---
  {
    id: 'cuu_thien_bang_dang_bo', ten: 'Cửu Thiên Bằng Đằng Bộ', he: 'kim', loaiChieu: 'buff',
    chiPhiLinhLuc: 26, hoiChieu: 3, heSoSatThuong: 0, uuTien: true,
    hieuUng: [{ id: 'tang_toc', tiLeHieuUng: 100, soHiep: 3, targetSelf: true }],
    buffDiKem: { stat: 'spdPct', value: 0.12, label: '+12% Tốc Độ chiến đấu', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 0, costQi: 0,
    moTa: 'Thân pháp khởi đầu: tăng 40% Tốc Độ trong 3 hiệp (không mất lượt).'
  },
  {
    id: 'ho_the_kim_quang', ten: 'Hộ Thể Kim Quang', he: 'tho', loaiChieu: 'buff',
    chiPhiLinhLuc: 110, hoiChieu: 3, heSoSatThuong: 0, uuTien: true,
    hieuUng: [{ id: 'ho_the', tiLeHieuUng: 100, soHiep: 2, targetSelf: true }],
    buffDiKem: { stat: 'defPct', value: 0.15, label: '+15% Phòng Thủ chiến đấu', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 2, nangCap: 'co_dinh', phamGiaiToiDa: 2, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 10, costQi: 0,
    moTa: 'Ngưng tụ kim quang hộ thể, tăng 45% Phòng Thủ trong 2 hiệp (không mất lượt).'
  },
  {
    id: 'thanh_van_kiem_quyet', ten: 'Thanh Vân Kiếm Quyết', he: 'kim', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 24, hoiChieu: 0, heSoSatThuong: 1.45, uuTien: false,
    hieuUng: [],
    buffDiKem: { stat: 'atkPct', value: 0.10, label: '+10% Công Kích', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 0, costQi: 0,
    moTa: 'Kiếm quyết cơ bản hệ Kim, tiêu hao thấp và ổn định.'
  },
  {
    id: 'hoi_xuan_quyet', ten: 'Hồi Xuân Dưỡng Sinh Quyết', he: 'moc', loaiChieu: 'hoi_phuc',
    chiPhiLinhLuc: 145, hoiChieu: 2, heSoSatThuong: 0, healPct: 0.28, giaiTru: true,
    hieuUng: [],
    buffDiKem: { stat: 'hpPct', value: 0.12, label: '+12% Máu tối đa', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 2, nangCap: 'co_dinh', phamGiaiToiDa: 2, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 10, costQi: 0,
    moTa: 'Hồi 28% Máu tối đa và giải trừ hiệu ứng bất lợi (không mất lượt).'
  },

  // --- CÁC CÔNG PHÁP MUA BẰNG LINH KHÍ / RƠI TỪ QUÁI (20 CÔNG PHÁP ĐỦ 7 HỆ) ---
  {
    id: 'liet_hoa_chuong', ten: 'Liệt Hỏa Phần Thiên Chưởng', he: 'hoa', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 130, hoiChieu: 1, heSoSatThuong: 1.55,
    hieuUng: [{ id: 'thieu_dot', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'elemDmg_hoa', value: 0.18, label: '+18% Sát thương hệ Hỏa', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 2, nangCap: 'co_dinh', phamGiaiToiDa: 2, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 10, costQi: 450,
    moTa: 'Chưởng kình rực lửa gây Thiêu Đốt 3 hiệp.'
  },
  {
    id: 'doc_long_trao', ten: 'Độc Long Trảo', he: 'moc', loaiChieu: 'hieu_ung',
    chiPhiLinhLuc: 120, hoiChieu: 1, heSoSatThuong: 1.35,
    hieuUng: [{ id: 'trung_doc', tiLeHieuUng: 100, soHiep: 4 }],
    buffDiKem: { stat: 'elemDmg_moc', value: 0.18, label: '+18% Sát thương hệ Mộc', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 2, nangCap: 'co_dinh', phamGiaiToiDa: 2, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 10, costQi: 500,
    moTa: 'Gây Trúng Độc cộng dồn tối đa 3 lớp.'
  },
  {
    id: 'han_bang_chi', ten: 'Hàn Băng Ngưng Hồn Chỉ', he: 'bang', loaiChieu: 'hieu_ung',
    chiPhiLinhLuc: 360, hoiChieu: 3, heSoSatThuong: 1.30,
    hieuUng: [{ id: 'dong_bang', tiLeHieuUng: 100, soHiep: 1 }],
    buffDiKem: { stat: 'elemDmg_bang', value: 0.18, label: '+18% Sát thương hệ Băng', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 3, nangCap: 'co_dinh', phamGiaiToiDa: 3, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 20, costQi: 1500,
    moTa: 'Đóng Băng mục tiêu 1 hiệp (khiến địch mất lượt).'
  },
  {
    id: 'huyen_thiet_xich_khoa', ten: 'Huyền Thiết Xích Khóa Trận', he: 'tho', loaiChieu: 'hieu_ung',
    chiPhiLinhLuc: 340, hoiChieu: 3, heSoSatThuong: 1.25,
    hieuUng: [{ id: 'xich_khoa', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'statusResist', value: 0.15, label: '+15% Kháng hiệu ứng', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 3, nangCap: 'co_dinh', phamGiaiToiDa: 3, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 20, costQi: 1800,
    moTa: 'Triệu hồi xích sắt khóa chặt Thân Pháp địch (-40% tốc độ).'
  },
  {
    id: 'phong_ma_troi_buoc', ten: 'Phong Ma Trói Buộc Ấn', he: 'loi', loaiChieu: 'hieu_ung',
    chiPhiLinhLuc: 360, hoiChieu: 3, heSoSatThuong: 1.35,
    hieuUng: [{ id: 'troi_buoc', tiLeHieuUng: 100, soHiep: 2 }],
    buffDiKem: { stat: 'mpRegenPct', value: 0.04, label: '+4% Hồi Linh Lực mỗi hiệp', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 3, nangCap: 'co_dinh', phamGiaiToiDa: 3, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 20, costQi: 4200,
    moTa: 'Gây Trói Buộc 2 hiệp, cấm đối thủ dùng chiêu Buff.'
  },
  {
    id: 'pha_giap_thuong', ten: 'Phá Giáp Long Thương', he: 'kim', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 390, hoiChieu: 2, heSoSatThuong: 1.65,
    hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'atkPct', value: 0.14, label: '+14% Công Kích', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 3, nangCap: 'co_dinh', phamGiaiToiDa: 3, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 20, costQi: 5000,
    moTa: 'Đâm xuyên hộ giáp, gây Phá Giáp (-35% Phòng Thủ địch) trong 3 hiệp.'
  },
  {
    id: 'thuong_hai_suy_yeu', ten: 'Thương Hải Trấn Hồn Khúc', he: 'thuy', loaiChieu: 'hieu_ung',
    chiPhiLinhLuc: 880, hoiChieu: 2, heSoSatThuong: 1.35,
    hieuUng: [{ id: 'suy_yeu', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'elemDmg_thuy', value: 0.18, label: '+18% Sát thương hệ Thủy', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 4, nangCap: 'co_dinh', phamGiaiToiDa: 4, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 30, costQi: 7500,
    moTa: 'Âm ba hệ Thủy làm địch Suy Yếu (-28% Công Kích) trong 3 hiệp.'
  },
  {
    id: 'chien_y_cuong_hoa', ten: 'Bá Thể Chiến Ý Quyết', he: 'hoa', loaiChieu: 'buff',
    chiPhiLinhLuc: 920, hoiChieu: 3, heSoSatThuong: 0, uuTien: true,
    hieuUng: [{ id: 'tang_cong', tiLeHieuUng: 100, soHiep: 3, targetSelf: true }],
    buffDiKem: { stat: 'atkPct', value: 0.16, label: '+16% Công Kích', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 4, nangCap: 'co_dinh', phamGiaiToiDa: 4, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 30, costQi: 12000,
    moTa: 'Tăng 30% Sức Mạnh Công Kích trong 3 hiệp (không mất lượt).'
  },
  {
    id: 'tram_hon_ket_lieu', ten: 'Trảm Hồn Đoạt Mệnh Kiếm', he: 'kim', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 1080, hoiChieu: 2, heSoSatThuong: 1.65, ketLieu: true,
    hieuUng: [],
    buffDiKem: { stat: 'elemDmg_kim', value: 0.20, label: '+20% Sát thương hệ Kim', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 4, nangCap: 'co_dinh', phamGiaiToiDa: 4, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 30, costQi: 25000,
    moTa: 'Chiêu kết liễu: sát thương tăng thêm đến +80% khi mục tiêu dưới 40% Máu!'
  },
  {
    id: 'cuu_tieu_than_loi', ten: 'Cửu Tiêu Thần Lôi Chỉ', he: 'loi', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 1000, hoiChieu: 1, heSoSatThuong: 1.80, uuTien: true,
    hieuUng: [{ id: 'tri_hoan', tiLeHieuUng: 100, soHiep: 2 }],
    buffDiKem: { stat: 'elemDmg_loi', value: 0.20, label: '+20% Sát thương hệ Lôi', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 4, nangCap: 'co_dinh', phamGiaiToiDa: 4, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 30, costQi: 48000,
    moTa: 'Chiêu Ưu Tiên đánh trước, giáng thiên lôi và gây Trì Hoãn.'
  },
  {
    id: 'bang_ha_toai_cot', ten: 'Băng Hà Toái Cốt Quyết', he: 'bang', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 1900, hoiChieu: 2, heSoSatThuong: 1.90,
    hieuUng: [{ id: 'tri_hoan', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'spdPct', value: 0.16, label: '+16% Tốc Độ', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 5, nangCap: 'co_dinh', phamGiaiToiDa: 5, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 30, costQi: 110000,
    moTa: 'Bão tuyết nghiền nát địch, gây Trì Hoãn 3 hiệp.'
  },
  {
    id: 'dai_dia_hoang_an', ten: 'Đại Địa Hoàng Ấn', he: 'tho', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 1780, hoiChieu: 2, heSoSatThuong: 1.85,
    hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'elemDmg_tho', value: 0.22, label: '+22% Sát thương hệ Thổ', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 5, nangCap: 'co_dinh', phamGiaiToiDa: 5, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 30, costQi: 220000,
    moTa: 'Trấn áp sơn hà, gây sát thương lớn hệ Thổ kèm Phá Giáp.'
  },
  {
    id: 'van_moc_phuc_sinh', ten: 'Vạn Mộc Phục Sinh Thuật', he: 'moc', loaiChieu: 'hoi_phuc',
    chiPhiLinhLuc: 2150, hoiChieu: 2, heSoSatThuong: 0, healPct: 0.45, giaiTru: true,
    hieuUng: [{ id: 'ho_the', tiLeHieuUng: 100, soHiep: 2, targetSelf: true }],
    buffDiKem: { stat: 'hpPct', value: 0.22, label: '+22% Máu tối đa', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 5, nangCap: 'co_dinh', phamGiaiToiDa: 5, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 30, costQi: 450000,
    moTa: 'Hồi 45% Máu tối đa, giải toàn bộ hiệu ứng bất lợi và tạo Hộ Thể (không mất lượt).'
  },
  {
    id: 'tinh_hai_luu_ly_chưởng', ten: 'Tinh Hải Lưu Ly Chưởng', he: 'thuy', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 3650, hoiChieu: 2, heSoSatThuong: 2.05,
    hieuUng: [{ id: 'suy_yeu', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'mpRegenPct', value: 0.06, label: '+6% Hồi Linh Lực mỗi hiệp', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 6, nangCap: 'co_dinh', phamGiaiToiDa: 6, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 40, costQi: 900000,
    moTa: 'Sóng thần lưu ly quét sạch kẻ địch, gây Suy Yếu.'
  },
  {
    id: 'chu_tuoc_hoa_vu', ten: 'Chu Tước Hỏa Vũ', he: 'hoa', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 3950, hoiChieu: 2, heSoSatThuong: 2.15, ketLieu: true,
    hieuUng: [{ id: 'thieu_dot', tiLeHieuUng: 100, soHiep: 4 }],
    buffDiKem: { stat: 'atkPct', value: 0.22, label: '+22% Công Kích', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 6, nangCap: 'co_dinh', phamGiaiToiDa: 6, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 40, costQi: 1800000,
    moTa: 'Lửa Chu Tước kết liễu cực mạnh khi địch thấp máu kèm Thiêu Đốt.'
  },
  {
    id: 'thien_cuong_ho_tam', ten: 'Thiên Cương Hộ Tâm Quyết', he: 'tho', loaiChieu: 'buff',
    chiPhiLinhLuc: 3400, hoiChieu: 4, heSoSatThuong: 0, giaiTru: true,
    hieuUng: [
      { id: 'ho_the', tiLeHieuUng: 100, soHiep: 3, targetSelf: true },
      { id: 'tang_cong', tiLeHieuUng: 100, soHiep: 3, targetSelf: true }
    ],
    buffDiKem: { stat: 'statusResist', value: 0.25, label: '+25% Kháng hiệu ứng', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 6, nangCap: 'co_dinh', phamGiaiToiDa: 6, nguon: 'Rơi từ Quái / Bí Cảnh', yeuCauCanhGioi: 40, costQi: 5000000,
    moTa: 'Giải hiệu ứng bất lợi, đồng thời kích hoạt Hộ Thể + Chiến Ý 3 hiệp (không mất lượt).'
  },

  // --- 4 TUYỆT HỌC BOSS THẾ GIỚI (LOẠI 'co_dinh' — PHẨM CAO SẴN, KHÔNG THĂNG BẰNG LINH KHÍ) ---
  {
    id: 'boss_tu_phu_kiem_y', ten: 'Tử Phủ Tru Tiên Kiếm Ý', he: 'kim', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 2250, hoiChieu: 2, heSoSatThuong: 2.35, uuTien: true,
    hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'atkPct', value: 0.28, label: '+28% Công Kích (Cả Tu Luyện)', phamViBuff: 'ca_hai' },
    phamGiaiKhoiDau: 5, nangCap: 'co_dinh', phamGiaiToiDa: 5, nguon: 'Boss Thế Giới — Tân Thủ Giới', yeuCauCanhGioi: 30, costQi: 0,
    moTa: '[Tuyệt Học Cố Định — Địa Giai] Kiếm ý thượng cổ đánh trước kèm Phá Giáp.'
  },
  {
    id: 'boss_hoa_than_loi_vuc', ten: 'Hóa Thần Thiên Lôi Vực', he: 'loi', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 4500, hoiChieu: 2, heSoSatThuong: 2.60,
    hieuUng: [{ id: 'troi_buoc', tiLeHieuUng: 100, soHiep: 2 }, { id: 'tri_hoan', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'spdPct', value: 0.30, label: '+30% Tốc Độ & +6% Hồi MP', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 6, nangCap: 'co_dinh', phamGiaiToiDa: 6, nguon: 'Boss Thế Giới — Huyền Linh Giới', yeuCauCanhGioi: 40, costQi: 0,
    moTa: '[Tuyệt Học Cố Định — Thiên Giai] Sấm sét Hóa Thần gây Trói Buộc & Trì Hoãn.'
  },
  {
    id: 'boss_ban_thanh_bang_phong', ten: 'Bán Thánh Vạn Lý Băng Phong', he: 'bang', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 8800, hoiChieu: 3, heSoSatThuong: 2.85,
    hieuUng: [{ id: 'dong_bang', tiLeHieuUng: 100, soHiep: 1 }, { id: 'suy_yeu', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'statusResist', value: 0.35, label: '+35% Kháng hiệu ứng & +25% HP', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 7, nangCap: 'co_dinh', phamGiaiToiDa: 7, nguon: 'Boss Thế Giới — Kiếp Vân Giới', yeuCauCanhGioi: 50, costQi: 0,
    moTa: '[Tuyệt Học Cố Định — Thiên Giai] Đóng băng vạn dặm kèm Suy Yếu.'
  },
  {
    id: 'boss_hong_mong_diet_the', ten: 'Hồng Mông Diệt Thế Long Hoàng Ấn', he: 'hoa', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 11200, hoiChieu: 2, heSoSatThuong: 3.30, ketLieu: true, uuTien: true,
    hieuUng: [{ id: 'thieu_dot', tiLeHieuUng: 100, soHiep: 4 }, { id: 'xich_khoa', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'atkPct', value: 0.42, label: '+42% Công Kích & +20% Tốc độ nền', phamViBuff: 'ca_hai' },
    phamGiaiKhoiDau: 7, nangCap: 'co_dinh', phamGiaiToiDa: 7, nguon: 'Boss Thế Giới — Hồng Mông Giới', yeuCauCanhGioi: 50, costQi: 0,
    moTa: '[Tuyệt Học Chí Tôn Cố Định — Thánh Giai] Tuyệt kỹ tối thượng đánh trước, kết liễu cực đại!'
  },
  // --- THÊM CÔNG PHÁP CẤP THẤP (PHÀM PHẨM & HOÀNG GIAI) ---
  {
    id: 'cuong_phong_chuong', ten: 'Cuồng Phong Chưởng', he: 'moc', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 18, hoiChieu: 1, heSoSatThuong: 1.25, uuTien: true,
    hieuUng: [],
    buffDiKem: { stat: 'spdPct', value: 0.06, label: '+6% Tốc Độ chiến đấu', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái', yeuCauCanhGioi: 0, costQi: 0,
    moTa: 'Chưởng pháp hệ Mộc ra đòn ưu tiên, thích hợp tân tu sĩ.'
  },
  {
    id: 'thuy_tien_thuat', ten: 'Thủy Tiễn Thuật', he: 'thuy', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 20, hoiChieu: 1, heSoSatThuong: 1.30, uuTien: false,
    hieuUng: [{ id: 'tri_hoan', tiLeHieuUng: 70, soHiep: 2 }],
    buffDiKem: { stat: 'mpRegenPct', value: 0.04, label: '+4% Hồi Linh Lực mỗi hiệp', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái', yeuCauCanhGioi: 0, costQi: 0,
    moTa: 'Bắn thủy tiễn gây sát thương và có tỉ lệ Trì Hoãn địch.'
  },
  {
    id: 'tho_thach_quyen', ten: 'Thổ Thạch Phá Quyền', he: 'tho', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 22, hoiChieu: 1, heSoSatThuong: 1.35, uuTien: false,
    hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 65, soHiep: 2 }],
    buffDiKem: { stat: 'defPct', value: 0.07, label: '+7% Phòng Thủ chiến đấu', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái', yeuCauCanhGioi: 0, costQi: 0,
    moTa: 'Quyền kình hệ Thổ nặng nề, có thể Phá Giáp địch.'
  },
  {
    id: 'hoa_linh_chi', ten: 'Hỏa Linh Chỉ', he: 'hoa', loaiChieu: 'tan_cong',
    chiPhiLinhLuc: 95, hoiChieu: 1, heSoSatThuong: 1.45, uuTien: false,
    hieuUng: [{ id: 'thieu_dot', tiLeHieuUng: 80, soHiep: 2 }],
    buffDiKem: { stat: 'atkPct', value: 0.08, label: '+8% Công Kích', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 2, nangCap: 'co_dinh', phamGiaiToiDa: 2, nguon: 'Rơi từ Quái / Thương Thành', yeuCauCanhGioi: 10, costQi: 0,
    moTa: 'Chỉ pháp hệ Hỏa thiêu đốt mục tiêu trong 2 hiệp.'
  },

  // --- CÔNG PHÁP RIÊNG MA ĐẠO: HỆ HUYẾT (HÚT 25% SÁT THƯƠNG THÀNH MÁU, CD 3 LƯỢT) ---
  {
    id: 'huyet_sat_trao', ten: 'Huyết Sát Trảo', he: 'huyet', loaiChieu: 'tan_cong', yeuCauDaoLo: 'ma_dao',
    chiPhiLinhLuc: 24, hoiChieu: 3, heSoSatThuong: 1.35, lifestealPct: 0.25, uuTien: false,
    hieuUng: [{ id: 'chay_mau', tiLeHieuUng: 75, soHiep: 2 }],
    buffDiKem: { stat: 'atkPct', value: 0.08, label: '+8% Công Kích (Ma Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái (Ma Đạo)', yeuCauCanhGioi: 0, costQi: 0,
    moTa: '[Ma Đạo • Huyết] Đánh gây Chảy Máu và hút 25% sát thương thành Máu (CD 3 hiệp).'
  },
  {
    id: 'huyet_hai_ma_quyet', ten: 'Huyết Hải Ma Quyết', he: 'huyet', loaiChieu: 'tan_cong', yeuCauDaoLo: 'ma_dao',
    chiPhiLinhLuc: 350, hoiChieu: 3, heSoSatThuong: 1.65, lifestealPct: 0.25, uuTien: false,
    hieuUng: [{ id: 'chay_mau', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'hpPct', value: 0.14, label: '+14% Máu tối đa (Ma Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 3, nangCap: 'co_dinh', phamGiaiToiDa: 3, nguon: 'Rơi từ Quái / Boss (Ma Đạo)', yeuCauCanhGioi: 20, costQi: 0,
    moTa: '[Ma Đạo • Huyết] Huyết hải ngập trời, hút 25% sát thương thành Máu và gây Chảy Máu 3 hiệp.'
  },
  {
    id: 'huyet_hon_tru_tien', ten: 'Huyết Hồn Tru Tiên Trận', he: 'huyet', loaiChieu: 'tan_cong', yeuCauDaoLo: 'ma_dao',
    chiPhiLinhLuc: 2100, hoiChieu: 3, heSoSatThuong: 2.05, lifestealPct: 0.25, uuTien: true,
    hieuUng: [{ id: 'chay_mau', tiLeHieuUng: 100, soHiep: 3 }, { id: 'suy_yeu', tiLeHieuUng: 90, soHiep: 2 }],
    buffDiKem: { stat: 'atkPct', value: 0.22, label: '+22% Công Kích (Ma Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 5, nangCap: 'co_dinh', phamGiaiToiDa: 5, nguon: 'Bí Cảnh (Ma Đạo)', yeuCauCanhGioi: 30, costQi: 0,
    moTa: '[Ma Đạo • Huyết] Tuyệt học Thiên Giai: đánh ưu tiên, hút 25% sát thương thành Máu và Suy Yếu địch.'
  },

  // --- CÔNG PHÁP RIÊNG MA ĐẠO: HỆ ÁM ---
  {
    id: 'am_anh_kich', ten: 'Ám Ảnh Kích', he: 'am', loaiChieu: 'tan_cong', yeuCauDaoLo: 'ma_dao',
    chiPhiLinhLuc: 22, hoiChieu: 1, heSoSatThuong: 1.32, uuTien: true,
    hieuUng: [{ id: 'pha_giap', tiLeHieuUng: 80, soHiep: 2 }],
    buffDiKem: { stat: 'spdPct', value: 0.08, label: '+8% Tốc Độ (Ma Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái (Ma Đạo)', yeuCauCanhGioi: 0, costQi: 0,
    moTa: '[Ma Đạo • Ám] Tập kích trong bóng tối, ra đòn ưu tiên và Phá Giáp 2 hiệp.'
  },
  {
    id: 'u_minh_am_tran', ten: 'U Minh Ám Trận', he: 'am', loaiChieu: 'hieu_ung', yeuCauDaoLo: 'ma_dao',
    chiPhiLinhLuc: 135, hoiChieu: 2, heSoSatThuong: 1.48, uuTien: false,
    hieuUng: [{ id: 'troi_buoc', tiLeHieuUng: 95, soHiep: 2 }, { id: 'suy_yeu', tiLeHieuUng: 85, soHiep: 2 }],
    buffDiKem: { stat: 'atkPct', value: 0.12, label: '+12% Công Kích (Ma Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 2, nangCap: 'co_dinh', phamGiaiToiDa: 2, nguon: 'Rơi từ Quái (Ma Đạo)', yeuCauCanhGioi: 10, costQi: 0,
    moTa: '[Ma Đạo • Ám] Bóng tối khóa chặt mục tiêu, gây Trói Buộc và Suy Yếu.'
  },
  {
    id: 'vinh_hang_hac_am', ten: 'Vĩnh Hằng Hắc Ám Quyết', he: 'am', loaiChieu: 'tan_cong', yeuCauDaoLo: 'ma_dao',
    chiPhiLinhLuc: 980, hoiChieu: 2, heSoSatThuong: 1.88, uuTien: false,
    hieuUng: [{ id: 'xich_khoa', tiLeHieuUng: 100, soHiep: 2 }, { id: 'trung_doc', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'spdPct', value: 0.18, label: '+18% Tốc Độ (Ma Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 4, nangCap: 'co_dinh', phamGiaiToiDa: 4, nguon: 'Rơi từ Quái / Boss (Ma Đạo)', yeuCauCanhGioi: 30, costQi: 0,
    moTa: '[Ma Đạo • Ám] Địa Giai ma công: Xích Khóa và Trúng Độc nặng nề.'
  },

  // --- CÔNG PHÁP RIÊNG CHÍNH ĐẠO: HỆ QUANG (TRIỆU HỒI GIÁP ẢO 15% SÁT THƯƠNG, CD 3 LƯỢT) ---
  {
    id: 'quang_minh_kiem', ten: 'Quang Minh Kiếm Khí', he: 'quang', loaiChieu: 'tan_cong', yeuCauDaoLo: 'chinh_dao',
    chiPhiLinhLuc: 24, hoiChieu: 3, heSoSatThuong: 1.35, shieldPct: 0.15, uuTien: false,
    hieuUng: [],
    buffDiKem: { stat: 'defPct', value: 0.08, label: '+8% Phòng Thủ (Chính Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 1, nangCap: 'co_dinh', phamGiaiToiDa: 1, nguon: 'Rơi từ Quái (Chính Đạo)', yeuCauCanhGioi: 0, costQi: 0,
    moTa: '[Chính Đạo • Quang] Kiếm khí ánh sáng vừa gây sát thương vừa tạo Khiên Ảo bằng 15% sát thương (CD 3 hiệp).'
  },
  {
    id: 'thanh_quang_ho_the', ten: 'Thánh Quang Trấn Ma Ấn', he: 'quang', loaiChieu: 'tan_cong', yeuCauDaoLo: 'chinh_dao',
    chiPhiLinhLuc: 130, hoiChieu: 3, heSoSatThuong: 1.55, shieldPct: 0.15, uuTien: true,
    hieuUng: [{ id: 'suy_yeu', tiLeHieuUng: 80, soHiep: 2 }],
    buffDiKem: { stat: 'hpPct', value: 0.12, label: '+12% Máu tối đa (Chính Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 2, nangCap: 'co_dinh', phamGiaiToiDa: 2, nguon: 'Rơi từ Quái (Chính Đạo)', yeuCauCanhGioi: 10, costQi: 0,
    moTa: '[Chính Đạo • Quang] Đánh ưu tiên, tạo Khiên Ảo 15% sát thương và làm Suy Yếu kẻ địch.'
  },
  {
    id: 'thai_duong_than_quang', ten: 'Thái Dương Thần Quang Trảm', he: 'quang', loaiChieu: 'tan_cong', yeuCauDaoLo: 'chinh_dao',
    chiPhiLinhLuc: 2050, hoiChieu: 3, heSoSatThuong: 2.02, shieldPct: 0.15, uuTien: true,
    hieuUng: [{ id: 'thieu_dot', tiLeHieuUng: 100, soHiep: 3 }],
    buffDiKem: { stat: 'defPct', value: 0.22, label: '+22% Phòng Thủ (Chính Đạo)', phamViBuff: 'chien_dau' },
    phamGiaiKhoiDau: 5, nangCap: 'co_dinh', phamGiaiToiDa: 5, nguon: 'Bí Cảnh (Chính Đạo)', yeuCauCanhGioi: 30, costQi: 0,
    moTa: '[Chính Đạo • Quang] Tuyệt học Thiên Giai: tạo Khiên Ảo 15% sát thương và Thiêu Đốt 3 hiệp.'
  }
];
