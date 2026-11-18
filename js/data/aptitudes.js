/**
 * js/data/aptitudes.js
 * Danh sách 6 bậc Tư Chất (Thiên phú tu luyện) từ Phàm Tư đến Thiên Đạo Sủng Nhi.
 * Tư chất nhân trực tiếp vào tốc độ hấp thụ linh khí nền và tốc độ tăng kinh nghiệm Lĩnh Vực.
 */
window.TuTien = window.TuTien || {};

window.TuTien.APTITUDES = [
  {
    id: 'pham_tu',
    tier: 1,
    name: 'Phàm Tư',
    multiplier: 0.8,
    color: '#94a3b8', // Xám
    cssClass: 'apt-gray',
    weightKey: 'pham_tu',
    description: 'Kinh mạch bình thường, con đường tu tiên cần nhiều khổ luyện hơn người.'
  },
  {
    id: 'trung_pham',
    tier: 2,
    name: 'Trung Phẩm',
    multiplier: 1.0,
    color: '#38bdf8', // Xanh lam
    cssClass: 'apt-blue',
    weightKey: 'trung_pham',
    description: 'Tư chất căn cơ ổn định, đủ sức bước đi vững chắc trên đạo lộ.'
  },
  {
    id: 'thuong_pham',
    tier: 3,
    name: 'Thượng Phẩm',
    multiplier: 1.3,
    color: '#a78bfa', // Tím
    cssClass: 'apt-purple',
    weightKey: 'thuong_pham',
    description: 'Kinh mạch thông suốt, ngộ tính hơn người, các tông môn đều muốn chiêu mộ.'
  },
  {
    id: 'thien_tai',
    tier: 4,
    name: 'Thiên Tài',
    multiplier: 1.8,
    color: '#fbbf24', // Vàng kim
    cssClass: 'apt-gold',
    weightKey: 'thien_tai',
    description: 'Kỳ tài trăm năm có một, tốc độ thổ nạp linh khí và lĩnh ngộ bách nghệ vượt trội.'
  },
  {
    id: 'yeu_nghiet',
    tier: 5,
    name: 'Yêu Nghiệt',
    multiplier: 2.5,
    color: '#f43f5e', // Đỏ rực
    cssClass: 'apt-red',
    weightKey: 'yeu_nghiet',
    description: 'Trí tuệ gần như yêu dị, thiên phú kinh thế hãi tục khiến vạn tông chấn động!'
  },
  {
    id: 'thien_dao_sung_nhi',
    tier: 6,
    name: 'Thiên Đạo Sủng Nhi',
    multiplier: 4.0,
    color: '#fde047', // Cầu vồng (xử lý thêm qua class apt-rainbow trong CSS)
    cssClass: 'apt-rainbow',
    weightKey: 'thien_dao_sung_nhi',
    description: 'Con cưng của Thiên Đạo! Vạn pháp tự thông, linh khí chư thiên tự động quy phục!'
  }
];
