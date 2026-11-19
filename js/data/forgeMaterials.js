/**
 * js/data/forgeMaterials.js
 * Danh sách 20 loại Linh Tài Rèn Pháp Bảo (đủ 8 hệ: Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Băng, Huyết)
 * và 5 Phẩm Giai (Phàm Phẩm -> Linh Phẩm -> Bảo Phẩm -> Huyền Khí -> Tiên Khí).
 * Tương thích hoàn toàn với 4 khoáng sản cũ (sat_khoang, da_khoang, go_linh_moc, vang_tinh_kim).
 */
window.TuTien = window.TuTien || {};

window.TuTien.FORGE_GRADES = [
  { tier: 1, name: 'Phàm Phẩm', color: '#cbd5e1', glow: 'rgba(203,213,225,0.45)', mult: 1.0 },
  { tier: 2, name: 'Linh Phẩm', color: '#4ade80', glow: 'rgba(74,222,128,0.55)', mult: 1.85 },
  { tier: 3, name: 'Bảo Phẩm', color: '#38bdf8', glow: 'rgba(56,189,248,0.65)', mult: 3.4 },
  { tier: 4, name: 'Huyền Khí', color: '#c084fc', glow: 'rgba(192,132,252,0.75)', mult: 6.2 },
  { tier: 5, name: 'Tiên Khí', color: '#facc15', glow: 'rgba(250,204,21,0.88)', mult: 11.5 }
];

window.TuTien.ELEMENT_META = {
  kim:   { id: 'kim',   name: 'Kim',   color: '#facc15', flame: '#fde047', bg: 'rgba(250,204,21,0.16)' },
  moc:   { id: 'moc',   name: 'Mộc',   color: '#4ade80', flame: '#22c55e', bg: 'rgba(74,222,128,0.16)' },
  thuy:  { id: 'thuy',  name: 'Thủy',  color: '#38bdf8', flame: '#0ea5e9', bg: 'rgba(56,189,248,0.16)' },
  hoa:   { id: 'hoa',   name: 'Hỏa',   color: '#fb923c', flame: '#f97316', bg: 'rgba(251,146,60,0.18)' },
  tho:   { id: 'tho',   name: 'Thổ',   color: '#d97706', flame: '#f59e0b', bg: 'rgba(217,119,6,0.18)' },
  loi:   { id: 'loi',   name: 'Lôi',   color: '#c084fc', flame: '#a855f7', bg: 'rgba(192,132,252,0.18)' },
  bang:  { id: 'bang',  name: 'Băng',  color: '#67e8f9', flame: '#06b6d4', bg: 'rgba(103,232,249,0.18)' },
  huyet: { id: 'huyet', name: 'Huyết', color: '#f43f5e', flame: '#e11d48', bg: 'rgba(244,63,94,0.18)' }
};

window.TuTien.FORGE_ROLES = {
  kim_loai:   'Kim Loại',
  ngoc:       'Linh Ngọc',
  moc:        'Linh Mộc',
  linh_thach: 'Linh Thạch',
  tinh_huyet: 'Tinh Huyết'
};

window.TuTien.FORGE_MATERIALS_EXT = [
  // --- KIM LOẠI (6 loại) ---
  { id: 'sat_khoang',      name: 'Huyền Thiết',       tier: 1, element: 'kim',   role: 'kim_loai',   icon: '⛏️', minRank: 1, desc: 'Quặng sắt huyền thiết cơ bản, dễ rèn mọi binh khí.', source: 'Khai Khoáng / Xuất Quan' },
  { id: 'bach_ngan_tinh',  name: 'Bạch Ngân Tinh',    tier: 2, element: 'kim',   role: 'kim_loai',   icon: '⚪', minRank: 1, desc: 'Tinh bạc dẫn truyền kiếm khí sắc bén.', source: 'Khai Khoáng' },
  { id: 'xich_dong_hoa',   name: 'Xích Đồng Hỏa',     tier: 2, element: 'hoa',   role: 'kim_loai',   icon: '🔶', minRank: 1, desc: 'Đồng đỏ hấp thu địa hỏa, tăng uy lực công kích.', source: 'Khai Khoáng' },
  { id: 'tu_loi_thiet',    name: 'Tử Lôi Thiết',      tier: 3, element: 'loi',   role: 'kim_loai',   icon: '⚡', minRank: 2, desc: 'Thiết tinh bị thiên lôi đánh trúng ngàn năm.', source: 'Khai Khoáng / Bí Cảnh' },
  { id: 'vang_tinh_kim',   name: 'Thái Ất Tinh Kim',  tier: 4, element: 'kim',   role: 'kim_loai',   icon: '🌕', minRank: 3, desc: 'Tinh kim ánh vàng quý hiếm dùng đúc bảo khí thượng phẩm.', source: 'Khai Khoáng / Boss Thế Giới' },
  { id: 'thien_canh_kim',  name: 'Thiên Canh Thần Kim', tier: 5, element: 'kim', role: 'kim_loai',   icon: '✨', minRank: 5, desc: 'Thần kim rơi từ tinh không, phẩm chất cực hạn.', source: 'Khai Khoáng Cấp Cao / Cơ Duyên' },

  // --- LINH THẠCH / ĐÁ (4 loại) ---
  { id: 'da_khoang',       name: 'Thanh Linh Thạch',  tier: 1, element: 'tho',   role: 'linh_thach', icon: '⛰️', minRank: 1, desc: 'Đá linh thạch trầm tích giúp ổn định trận văn.', source: 'Khai Khoáng / Xuất Quan' },
  { id: 'huyen_hoang_thach', name: 'Huyền Hoàng Thạch', tier: 3, element: 'tho', role: 'linh_thach', icon: '🪨', minRank: 2, desc: 'Đá nặng mang địa mạch chi lực, đúc Đỉnh & Ấn cực tốt.', source: 'Khai Khoáng' },
  { id: 'viem_duong_thach', name: 'Viêm Dương Tinh Thạch', tier: 3, element: 'hoa', role: 'linh_thach', icon: '🔥', minRank: 2, desc: 'Tinh thạch nóng rực tỏa hỏa linh khí mạnh mẽ.', source: 'Khai Khoáng' },
  { id: 'thien_loi_tinh',  name: 'Thiên Lôi Tinh Hạch', tier: 4, element: 'loi', role: 'linh_thach', icon: '🟣', minRank: 4, desc: 'Kết tinh sấm sét thuần khiết, khuếch đại combo.', source: 'Khai Khoáng / Bí Cảnh' },

  // --- LINH MỘC (3 loại) ---
  { id: 'go_linh_moc',     name: 'Thiết Mộc',         tier: 1, element: 'moc',   role: 'moc',        icon: '🌲', minRank: 1, desc: 'Gỗ linh mộc cổ thụ dẫn khí dẻo dai, hợp rèn Phiến & Kiếm.', source: 'Khai Khoáng / Xuất Quan' },
  { id: 'thanh_long_moc',  name: 'Thanh Long Mộc Tâm', tier: 3, element: 'moc',  role: 'moc',        icon: '🌿', minRank: 2, desc: 'Lõi gỗ chứa sinh cơ dồi dào, nuôi dưỡng Linh Điền.', source: 'Khai Khoáng' },
  { id: 'phu_tang_than_moc', name: 'Phù Tang Thần Mộc', tier: 5, element: 'hoa', role: 'moc',        icon: '🌺', minRank: 5, desc: 'Thần mộc thái cổ dung hợp Mộc - Hỏa chí dương.', source: 'Khai Khoáng Cấp Cao' },

  // --- LINH NGỌC (4 loại) ---
  { id: 'bich_thuy_ngoc',  name: 'Bích Thủy Ngọc',    tier: 1, element: 'thuy',  role: 'ngoc',       icon: '💧', minRank: 1, desc: 'Ngọc xanh mát lành chứa thủy linh khí ôn hòa.', source: 'Khai Khoáng' },
  { id: 'han_bang_ngoc',   name: 'Hàn Băng Ngọc Tủy', tier: 2, element: 'bang',  role: 'ngoc',       icon: '❄️', minRank: 1, desc: 'Ngọc băng ngàn năm, kéo dài trạng thái Tăng Tốc.', source: 'Khai Khoáng' },
  { id: 'thuong_hai_ngoc', name: 'Thương Hải Linh Châu', tier: 3, element: 'thuy', role: 'ngoc',     icon: '🔵', minRank: 3, desc: 'Linh châu đáy biển sâu, tăng mạnh Linh Lực & Máu.', source: 'Khai Khoáng' },
  { id: 'cuu_u_bang_tinh', name: 'Cửu U Băng Tinh',   tier: 4, element: 'bang',  role: 'ngoc',       icon: '💠', minRank: 4, desc: 'Tinh thể băng cực hàn, đóng băng thời gian tăng tốc.', source: 'Khai Khoáng / Bí Cảnh' },

  // --- TINH HUYẾT (3 loại) ---
  { id: 'yeu_thu_huyet',   name: 'Yêu Thú Tinh Huyết', tier: 1, element: 'huyet', role: 'tinh_huyet', icon: '🩸', minRank: 1, desc: 'Tinh huyết cô đặc từ yêu thú, kích phát tốc độ nền.', source: 'Khai Khoáng / Xuất Quan' },
  { id: 'huyet_ngoc_tinh', name: 'Huyết Ngọc Ma Tinh', tier: 3, element: 'huyet', role: 'tinh_huyet', icon: '🔴', minRank: 2, desc: 'Tinh huyết kết ngọc chứa linh khí cuồng bạo.', source: 'Khai Khoáng / Bí Cảnh' },
  { id: 'chan_long_huyet', name: 'Chân Long Bảo Huyết', tier: 5, element: 'huyet', role: 'tinh_huyet', icon: '🐉', minRank: 5, desc: 'Một giọt bảo huyết Chân Long, phẩm chất Tiên Khí.', source: 'Boss Thế Giới / Khai Khoáng' }
];
