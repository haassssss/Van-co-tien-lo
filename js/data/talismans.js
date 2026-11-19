/**
 * js/data/talismans.js
 * 8 loại Phù Văn Xác Định với bộ nét vẽ (strokes) riêng lưu dưới dạng tọa độ chuẩn hóa (0..1, 0..1).
 */
window.TuTien = window.TuTien || {};

window.TuTien.TALISMAN_TEMPLATES = [
  {
    id: 'than_hanh_phu', name: 'Thần Hành Tốc Tu Phù', element: 'thuy', color: '#38bdf8',
    buffType: 'speed', basePower: 0.50, baseDurationSec: 120,
    desc: 'Tăng mạnh tốc độ hấp thụ linh khí nền.',
    strokes: [
      [[0.25, 0.22], [0.75, 0.22]],
      [[0.50, 0.16], [0.50, 0.84]],
      [[0.25, 0.58], [0.50, 0.42], [0.75, 0.58]]
    ]
  },
  {
    id: 'tu_dong_van_cong_phu', name: 'Lôi Đình Tự Vận Phù', element: 'loi', color: '#c084fc',
    buffType: 'autoclick', basePower: 4, baseDurationSec: 100,
    desc: 'Tự động vận công (Auto-Click) liên tục mỗi giây!',
    strokes: [
      [[0.62, 0.14], [0.34, 0.48], [0.64, 0.48], [0.36, 0.86]],
      [[0.22, 0.30], [0.78, 0.30]]
    ]
  },
  {
    id: 'liet_hoa_kich_phu', name: 'Liệt Hỏa Bộc Phát Phù', element: 'hoa', color: '#fb923c',
    buffType: 'click', basePower: 0.65, baseDurationSec: 100,
    desc: 'Tăng mạnh sức mạnh mỗi lần Click và Công Kích.',
    strokes: [
      [[0.50, 0.14], [0.24, 0.78], [0.76, 0.78], [0.50, 0.14]],
      [[0.50, 0.34], [0.50, 0.72]]
    ]
  },
  {
    id: 'ho_dao_kim_phu', name: 'Canh Kim Hộ Đạo Phù', element: 'kim', color: '#facc15',
    buffType: 'guard', basePower: 0.50, baseDurationSec: 240,
    desc: 'Giảm mạnh tổn thất linh khí khi Đột Phá thất bại.',
    strokes: [
      [[0.26, 0.24], [0.74, 0.24], [0.74, 0.62], [0.50, 0.86], [0.26, 0.62], [0.26, 0.24]],
      [[0.36, 0.48], [0.64, 0.48]]
    ]
  },
  {
    id: 'thien_nien_be_quan_phu', name: 'Hậu Thổ Bế Quan Phù', element: 'tho', color: '#d97706',
    buffType: 'offline', basePower: 4.0, baseDurationSec: 300,
    desc: 'Tạm thời tăng giới hạn giờ Bế Quan Offline & tốc độ nền.',
    strokes: [
      [[0.24, 0.36], [0.76, 0.36]],
      [[0.50, 0.18], [0.50, 0.82]],
      [[0.20, 0.82], [0.80, 0.82]]
    ]
  },
  {
    id: 'pha_canh_linh_phu', name: 'Kim Quang Phá Cảnh Phù', element: 'kim', color: '#fde047',
    buffType: 'breakthrough', basePower: 0.10, baseDurationSec: 240, minPaperTier: 2,
    desc: 'Tăng trực tiếp tỉ lệ thành công khi Đột Phá Cảnh Giới.',
    strokes: [
      [[0.50, 0.15], [0.78, 0.50], [0.50, 0.85], [0.22, 0.50], [0.50, 0.15]],
      [[0.35, 0.50], [0.65, 0.50]]
    ]
  },
  {
    id: 'cuong_loi_combo_phu', name: 'Cửu Thiên Lôi Liên Phù', element: 'loi', color: '#e879f9',
    buffType: 'speed', basePower: 0.72, baseDurationSec: 110, minPaperTier: 2,
    desc: 'Khuếch đại mạnh tốc độ hấp thụ linh khí và tăng tốc.',
    strokes: [
      [[0.24, 0.22], [0.76, 0.22], [0.28, 0.54], [0.76, 0.54], [0.34, 0.86]]
    ]
  },
  {
    id: 'chu_tuoc_tien_phu', name: 'Chu Tước Phần Thiên Phù', element: 'hoa', color: '#f43f5e',
    buffType: 'click', basePower: 0.90, baseDurationSec: 120, minPaperTier: 3,
    desc: 'Phù văn thượng cổ: bộc phát uy lực Click & tốc độ cực đại.',
    strokes: [
      [[0.20, 0.30], [0.50, 0.16], [0.80, 0.30]],
      [[0.50, 0.16], [0.50, 0.86]],
      [[0.24, 0.64], [0.50, 0.46], [0.76, 0.64]]
    ]
  }
];
