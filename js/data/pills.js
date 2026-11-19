/**
 * js/data/pills.js
 * 10 loại Đan Dược Xác Định (quyết định bởi hệ dược liệu chủ đạo >= 10% kích hoạt, >= 30% tối đa).
 * Mỗi loại có số nhịp Ngưng Đan cố định (3-5 nhịp) và hiệu ứng buff tạm thời có đồng hồ đếm ngược.
 */
window.TuTien = window.TuTien || {};

window.TuTien.ALCHEMY_PILLS = [
  { id: 'tu_khi_dan',       name: 'Tụ Khí Đan',        mainElement: 'moc',   beats: 3, durationSec: 90,  buffType: 'speed',        basePower: 0.45, color: '#4ade80', desc: 'Tăng mạnh tốc độ hấp thụ linh khí nền.' },
  { id: 'pha_canh_dan',     name: 'Phá Cảnh Đan',      mainElement: 'kim',   beats: 4, durationSec: 180, buffType: 'breakthrough', basePower: 0.08, color: '#facc15', desc: 'Tăng tỉ lệ thành công khi Đột Phá Cảnh Giới.' },
  { id: 'ho_mach_dan',      name: 'Hộ Mạch Hồi Nguyên Đan', mainElement: 'huyet', beats: 4, durationSec: 180, buffType: 'guard',  basePower: 0.35, color: '#f43f5e', desc: 'Hồi hoàn lượng lớn linh khí nếu đột phá thất bại.' },
  { id: 'liet_hoa_dan',     name: 'Liệt Hỏa Chiến Đan', mainElement: 'hoa',  beats: 3, durationSec: 90,  buffType: 'click',        basePower: 0.55, color: '#fb923c', desc: 'Tăng mạnh sức mạnh mỗi lần Click và Công Kích.' },
  { id: 'bang_tam_dan',     name: 'Băng Tâm Tĩnh Thần Đan', mainElement: 'bang', beats: 4, durationSec: 120, buffType: 'boost',    basePower: 1.2,  color: '#67e8f9', desc: 'Kéo dài thời gian duy trì trạng thái Tăng Tốc.' },
  { id: 'loi_quang_dan',    name: 'Lôi Quang Cuồng Bạo Đan', mainElement: 'loi', beats: 4, durationSec: 100, buffType: 'click',    basePower: 0.65, color: '#c084fc', desc: 'Bộc phát lôi lực, tăng mạnh Click và Combo.' },
  { id: 'thanh_thuy_dan',   name: 'Thanh Thủy Bách Nghệ Đan', mainElement: 'thuy', beats: 3, durationSec: 150, buffType: 'field',  basePower: 0.50, color: '#38bdf8', desc: 'Tăng mạnh tốc độ nhận EXP các Lĩnh Vực.' },
  { id: 'hau_tho_dan',      name: 'Hậu Thổ Bế Quan Đan', mainElement: 'tho', beats: 3, durationSec: 180, buffType: 'speed',        basePower: 0.50, color: '#d97706', desc: 'Ổn định đạo cơ, tăng tốc độ hấp thụ linh khí bền bỉ.' },
  { id: 'long_huyet_dan',   name: 'Long Huyết Chân Đan', mainElement: 'huyet', beats: 5, durationSec: 140, buffType: 'speed',      basePower: 0.75, color: '#e11d48', minTotalQty: 16, desc: 'Đan dược cao cấp: tăng đột biến tốc độ nền và Máu.' },
  { id: 'cuu_chuyen_dan',   name: 'Cửu Chuyển Tạo Hóa Đan', mainElement: 'kim', beats: 5, durationSec: 240, buffType: 'all',       basePower: 0.85, color: '#fde047', minTotalQty: 20, desc: 'Thần đan toàn diện: tăng tốc độ nền, Click và tỉ lệ Đột Phá.' }
];
