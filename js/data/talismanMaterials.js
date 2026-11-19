/**
 * js/data/talismanMaterials.js
 * 18 nguyên liệu Luyện Phù chia 3 nhóm:
 * - Phù Chỉ (4 loại): quyết định số lá phù và trần phẩm giai.
 * - Chu Sa / Mực & Máu Yêu Thú (10 loại): quyết định hệ và loại phù (mực thường + máu các loại quái vật, yêu thú, Boss Rồng).
 * - Phụ Liệu tùy chọn (4 loại): kéo dài thời gian hiệu lực phù văn.
 */
window.TuTien = window.TuTien || {};

window.TuTien.TALISMAN_MATERIALS = [
  // --- 1. PHÙ CHỈ (4 loại) ---
  { id: 'hoang_chi',         group: 'paper', name: 'Hoàng Phù Chỉ',          tier: 1, maxGrade: 2, icon: '📄', desc: 'Giấy phù vàng phổ thông, trần Linh Phẩm.' },
  { id: 'thanh_linh_chi',    group: 'paper', name: 'Thanh Linh Phù Chỉ',     tier: 2, maxGrade: 3, icon: '📃', desc: 'Giấy tẩm linh khí thanh mộc, trần Bảo Phẩm.' },
  { id: 'kim_van_chi',       group: 'paper', name: 'Kim Văn Bảo Chỉ',        tier: 3, maxGrade: 4, icon: '📜', desc: 'Giấy dệt sợi kim tuyến, trần Huyền Khí.' },
  { id: 'tien_tam_chi',      group: 'paper', name: 'Tiên Tàm Thần Chỉ',      tier: 4, maxGrade: 5, icon: '✨', desc: 'Lụa tằm tiên cổ đại, chịu đựng được Tiên Phù tối thượng.' },

  // --- 2. CHU SA / MỰC & MÁU YÊU THÚ (10 loại) ---
  { id: 'chu_sa_hoa',        group: 'ink',   name: 'Chu Sa Liệt Hỏa',        tier: 1, element: 'hoa',  icon: '🔴', desc: 'Mực chu sa cơ bản hệ Hỏa, chuyên vẽ Phù tăng Click.' },
  { id: 'huyet_yeu_lang',    group: 'ink',   name: 'Máu Thanh Phong Yêu Lang', tier: 1, element: 'thuy', icon: '🐺', desc: 'Máu Yêu Lang chứa linh phong, chuyên vẽ Thần Hành Tốc Tu Phù.' },
  { id: 'noc_huyet_doc_xa',  group: 'ink',   name: 'Máu Bích Lân Độc Xà',    tier: 2, element: 'thuy', icon: '🐍', desc: 'Máu Độc Xà lạnh buốt, tăng mạnh tốc độ nền hệ Thủy.' },
  { id: 'thanh_loi_mac',     group: 'ink',   name: 'Thanh Lôi Linh Mặc',     tier: 2, element: 'loi',  icon: '🟣', desc: 'Mực dẫn lôi điện, vẽ Lôi Phù Tự Động Vận Công.' },
  { id: 'huyet_loi_dieu',    group: 'ink',   name: 'Máu Lôi Điểu Thượng Cổ', tier: 3, element: 'loi',  icon: '🦅', desc: 'Tinh huyết Lôi Điểu mang sấm sét thuần khiết, cực mạnh cho Lôi Phù.' },
  { id: 'canh_kim_mac',      group: 'ink',   name: 'Canh Kim Thần Mặc',      tier: 2, element: 'kim',  icon: '🟡', desc: 'Mực tinh kim, vẽ Hộ Đạo & Phá Cảnh Phù.' },
  { id: 'huyet_hac_hung',    group: 'ink',   name: 'Máu Thiết Giáp Hắc Hùng',tier: 3, element: 'tho',  icon: '🐻', desc: 'Máu Hắc Hùng nặng như núi, chuyên vẽ Hậu Thổ Bế Quan Phù.' },
  { id: 'hau_tho_mac',       group: 'ink',   name: 'Hậu Thổ Hoàng Mặc',      tier: 2, element: 'tho',  icon: '🟤', desc: 'Mực địa mạch ổn định, tăng giới hạn Bế Quan Offline.' },
  { id: 'huyet_xich_ho',     group: 'ink',   name: 'Máu Xích Viêm Yêu Hổ',   tier: 4, element: 'hoa',  icon: '🐯', desc: 'Tinh huyết Hổ Lửa chí dương, vẽ Chu Tước Phần Thiên Phù cực phẩm.' },
  { id: 'huyet_chan_long',   group: 'ink',   name: 'Máu Chân Long (Boss)',   tier: 5, element: 'kim',  icon: '🐉', desc: 'Bảo huyết từ Boss Thế Giới, vẽ Kim Quang Phá Cảnh Phù tối thượng.' },

  // --- 3. PHỤ LIỆU TÙY CHỌN KÉO DÀI THỜI GIAN (4 loại) ---
  { id: 'tung_huong_phan',   group: 'addon', name: 'Tùng Hương Phấn',        tier: 1, durationBonusPct: 0.25, icon: '🌿', desc: 'Kéo dài thêm +25% thời gian hiệu lực phù văn.' },
  { id: 'yeu_dan_phan',      group: 'addon', name: 'Bột Yêu Đan Nghiền',     tier: 2, durationBonusPct: 0.40, icon: '🔮', desc: 'Bột yêu đan hòa vào mực giúp kéo dài +40% thời gian hiệu lực.' },
  { id: 'long_dien_huong',   group: 'addon', name: 'Long Diên Hương',        tier: 3, durationBonusPct: 0.65, icon: '🕯️', desc: 'Hương trầm quý hiếm kéo dài thêm +65% thời gian hiệu lực.' },
  { id: 'thai_at_linh_dich', group: 'addon', name: 'Thái Ất Linh Dịch',      tier: 4, durationBonusPct: 1.00, icon: '🧪', desc: 'Linh dịch tiên gia nhân đôi (+100%) thời gian hiệu lực phù văn.' }
];
