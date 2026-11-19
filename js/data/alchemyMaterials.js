/**
 * js/data/alchemyMaterials.js
 * 14 loại Dược Liệu Luyện Đan (Nhất Phẩm -> Cửu Phẩm), đồng bộ với Linh Điền & Xuất Quan.
 */
window.TuTien = window.TuTien || {};

window.TuTien.PILL_RANK_NAMES = [
  'Nhất Phẩm', 'Nhị Phẩm', 'Tam Phẩm', 'Tứ Phẩm', 'Ngũ Phẩm',
  'Lục Phẩm', 'Thất Phẩm', 'Bát Phẩm', 'Cửu Phẩm'
];

window.TuTien.PILL_RANK_COLORS = [
  '#cbd5e1', '#86efac', '#4ade80', '#38bdf8', '#60a5fa',
  '#c084fc', '#e879f9', '#fb923c', '#facc15'
];

window.TuTien.ALCHEMY_MATERIALS = [
  { id: 'tu_linh_thao',          name: 'Tụ Linh Thảo',         grade: 1, element: 'moc',   icon: '🌿', effectKey: 'speed',        desc: 'Tụ tập linh khí thiên địa, tăng tốc độ tu luyện.' },
  { id: 'pha_chuong_qua',        name: 'Phá Chướng Quả',       grade: 2, element: 'kim',   icon: '🌺', effectKey: 'breakthrough', desc: 'Khai thông kinh mạch, tăng tỉ lệ đột phá cảnh giới.' },
  { id: 'huyet_ngoc_sam',        name: 'Huyết Ngọc Sâm',       grade: 2, element: 'huyet', icon: '🍄', effectKey: 'guard',        desc: 'Bồi bổ khí huyết, hồi hoàn linh khí khi đột phá thất bại.' },
  { id: 'loi_tam_thao',          name: 'Lôi Tâm Thảo',         grade: 3, element: 'loi',   icon: '⚡', effectKey: 'click',        desc: 'Kích phát lôi điện, tăng mạnh sức mạnh mỗi lần chạm.' },
  { id: 'han_bang_tuyet_lien',   name: 'Hàn Băng Tuyết Liên',  grade: 4, element: 'bang',  icon: '❄️', effectKey: 'boost',        desc: 'Thanh tâm tĩnh khí, kéo dài thời gian Tăng Tốc.' },
  { id: 'xich_viem_chu_qua',     name: 'Xích Viêm Chu Quả',    grade: 4, element: 'hoa',   icon: '🔥', effectKey: 'click',        desc: 'Hỏa độc chí dương, bộc phát uy lực Click và Sức Mạnh.' },
  { id: 'u_minh_bi_ngan',        name: 'U Minh Bỉ Ngạn Hoa',   grade: 5, element: 'huyet', icon: '🟣', effectKey: 'speed',        desc: 'Hoa u minh hút linh khí cực mạnh trong thời gian ngắn.' },
  { id: 'thai_at_duong_hon_moc', name: 'Thái Ất Dưỡng Hồn Mộc',grade: 6, element: 'moc',   icon: '🌳', effectKey: 'guard',        desc: 'Bảo vệ nguyên thần, giảm mạnh tổn thất đột phá.' },
  { id: 'tinh_than_long_thao',   name: 'Tinh Thần Long Thảo',  grade: 7, element: 'kim',   icon: '✨', effectKey: 'breakthrough', desc: 'Thảo dược hấp thu tinh quang, tăng cao tỉ lệ Đột Phá.' },
  { id: 'thanh_thuy_lien',       name: 'Thanh Thủy Ngọc Liên', grade: 3, element: 'thuy',  icon: '💧', effectKey: 'field',        desc: 'Nuôi dưỡng linh điền và tốc độ tăng cấp Bách Nghệ.' },
  { id: 'hau_tho_linh_chi',      name: 'Hậu Thổ Hoàng Chi',    grade: 4, element: 'tho',   icon: '🍄', effectKey: 'offline',      desc: 'Tụ địa mạch giúp nâng cao hiệu suất bế quan.' },
  { id: 'thien_loi_qua',         name: 'Thiên Lôi Tử Quả',     grade: 6, element: 'loi',   icon: '🟣', effectKey: 'click',        desc: 'Ngưng tụ cửu thiên lôi lực, tăng vọt công kích.' },
  { id: 'bang_phach_thao',       name: 'Băng Phách Hàn Thảo',  grade: 7, element: 'bang',  icon: '💠', effectKey: 'boost',        desc: 'Đóng băng thời gian, kéo dài mạnh trạng thái Tăng Tốc.' },
  { id: 'cuu_chuyen_tien_chi',   name: 'Cửu Chuyển Tiên Chi',  grade: 9, element: 'kim',   icon: '👑', effectKey: 'all',          desc: 'Tiên dược chí tôn tụ hội vạn linh khí, cường hóa toàn diện.' }
];
