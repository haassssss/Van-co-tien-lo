/**
 * js/data/planes.js
 * 4 Vị Diện cân bằng theo đúng bảng 28 Đại Cảnh Giới (140 tầng) trong js/data/realms.js:
 * 1. Tân Thủ Giới: Thối Thể - Sơ Kỳ (0) -> Trúc Cơ - Viên Mãn (19), Boss: Tử Phủ - Đỉnh Phong (23)
 * 2. Huyền Linh Giới: Trúc Cơ - Viên Mãn (19) -> Nguyên Anh - Viên Mãn (39), Boss: Hóa Thần - Đỉnh Phong (43)
 * 3. Kiếp Vân Giới: Nguyên Anh - Viên Mãn (39) -> Độ Kiếp - Viên Mãn (64), Boss: Bán Thánh - Đỉnh Phong (68)
 * 4. Hồng Mông Giới: Độ Kiếp - Viên Mãn (64) -> Tri Đạo Cảnh - Viên Mãn (99), Boss: Chứng Đạo Cảnh - Đỉnh Phong (103)
 */
window.TuTien = window.TuTien || {};

window.TuTien.PLANES = [
  {
    id: 'tan_thu_gioi',
    ten: 'Tân Thủ Giới',
    moTa: 'Sơn thủy thanh u, linh khí ôn hòa, thích hợp cho tu sĩ từ Thối Thể đến Trúc Cơ rèn luyện.',
    bgImage: 'assets/combat_secret_bg.jpg',
    bgGradient: 'linear-gradient(180deg, #1b3b2b 0%, #0e1e17 100%)',
    accentColor: '#4ade80',
    minRealmIdx: 0,      // Thối Thể - Sơ Kỳ
    maxRealmIdx: 19,     // Trúc Cơ - Viên Mãn
    unlockRealmIdx: 0,   // Mở sẵn
    bossRealmIdx: 23,    // Tử Phủ - Đỉnh Phong (1 đại cảnh giới kế tiếp)
    bossId: 'boss_tan_thu_gioi'
  },
  {
    id: 'huyen_linh_gioi',
    ten: 'Huyền Linh Giới',
    moTa: 'Linh mạch dồi dào, yêu thú Kim Đan và Nguyên Anh tung hoành khắp núi non mây phủ.',
    bgImage: 'assets/bg_huyen_linh_gioi.jpg',
    bgGradient: 'linear-gradient(180deg, #102a43 0%, #0a1929 100%)',
    accentColor: '#38bdf8',
    minRealmIdx: 19,     // Trúc Cơ - Viên Mãn
    maxRealmIdx: 39,     // Nguyên Anh - Viên Mãn
    unlockRealmIdx: 19,  // Đạt Trúc Cơ - Viên Mãn
    bossRealmIdx: 43,    // Hóa Thần - Đỉnh Phong
    bossId: 'boss_huyen_linh_gioi'
  },
  {
    id: 'kiep_van_gioi',
    ten: 'Kiếp Vân Giới',
    moTa: 'Tầng mây sấm sét bao phủ quanh năm, nơi các đại năng Hóa Thần đến Độ Kiếp tranh đoạt tạo hóa.',
    bgImage: 'assets/bg_kiep_van_gioi.jpg',
    bgGradient: 'linear-gradient(180deg, #2e1065 0%, #15072b 100%)',
    accentColor: '#c084fc',
    minRealmIdx: 39,     // Nguyên Anh - Viên Mãn
    maxRealmIdx: 64,     // Độ Kiếp - Viên Mãn
    unlockRealmIdx: 39,  // Đạt Nguyên Anh - Viên Mãn
    bossRealmIdx: 68,    // Bán Thánh - Đỉnh Phong
    bossId: 'boss_kiep_van_gioi'
  },
  {
    id: 'hong_mong_gioi',
    ten: 'Hồng Mông Giới',
    moTa: 'Cổ giới hỗn độn sơ khai, ẩn chứa Thánh Vương và cường giả Tri Đạo Cảnh trấn giữ thần bảo.',
    bgImage: 'assets/bg_hong_mong_gioi.jpg',
    bgGradient: 'linear-gradient(180deg, #450a0a 0%, #1a0608 100%)',
    accentColor: '#facc15',
    minRealmIdx: 64,     // Độ Kiếp - Viên Mãn
    maxRealmIdx: 99,     // Tri Đạo Cảnh - Viên Mãn
    unlockRealmIdx: 64,  // Đạt Độ Kiếp - Viên Mãn
    bossRealmIdx: 103,   // Chứng Đạo Cảnh - Đỉnh Phong
    bossId: 'boss_hong_mong_gioi'
  }
];
