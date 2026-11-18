/**
 * js/data/roots.js
 * Danh sách Linh Căn nhận được khi khởi đầu hoặc Chuyển Sinh.
 * Bao gồm Ngũ Hành Linh Căn (Kim, Mộc, Thủy, Hỏa, Thổ) và Dị Linh Căn hiếm (Lôi, Băng, Hỗn Độn).
 */
window.TuTien = window.TuTien || {};

window.TuTien.ROOTS = [
  {
    id: 'kim',
    name: 'Kim Linh Căn',
    rarity: 'Ngũ Hành',
    weight: 18,
    color: '#fbbf24',
    icon: '⚔️',
    description: 'Sắc bén như kiếm khí, công kích mạnh mẽ khi chủ động vận công.',
    bonuses: {
      passiveMult: 1.10,
      clickMult: 1.35,
      boostDurationBonusMs: 0,
      maxComboBonus: 0.5,
      breakthroughBonus: 0,
      offlineBonus: 1.0
    },
    bonusText: '+35% Sức mạnh Click, +10% Tốc độ nền, +0.5x Combo tối đa'
  },
  {
    id: 'moc',
    name: 'Mộc Linh Căn',
    rarity: 'Ngũ Hành',
    weight: 18,
    color: '#34d399',
    icon: '🌿',
    description: 'Sinh cơ dồi dào, hấp thụ linh khí tự nhiên bền bỉ ngày đêm.',
    bonuses: {
      passiveMult: 1.35,
      clickMult: 1.05,
      boostDurationBonusMs: 300,
      maxComboBonus: 0,
      breakthroughBonus: 0,
      offlineBonus: 1.10
    },
    bonusText: '+35% Tốc độ nền, +0.3s Tăng Tốc, +10% Hiệu suất Bế Quan'
  },
  {
    id: 'thuy',
    name: 'Thủy Linh Căn',
    rarity: 'Ngũ Hành',
    weight: 18,
    color: '#38bdf8',
    icon: '💧',
    description: 'Uyển chuyển như dòng nước chảy, giữ trạng thái Tăng Tốc và Bế Quan lâu dài.',
    bonuses: {
      passiveMult: 1.20,
      clickMult: 1.15,
      boostDurationBonusMs: 600,
      maxComboBonus: 0.5,
      breakthroughBonus: 0.03,
      offlineBonus: 1.15
    },
    bonusText: '+20% Tốc độ nền, +15% Click, +0.6s Tăng Tốc, +15% Bế Quan'
  },
  {
    id: 'hoa',
    name: 'Hỏa Linh Căn',
    rarity: 'Ngũ Hành',
    weight: 18,
    color: '#f87171',
    icon: '🔥',
    description: 'Bùng nổ mãnh liệt như liệt hỏa, cực đại hóa sức mạnh Combo khi liên kích.',
    bonuses: {
      passiveMult: 1.15,
      clickMult: 1.25,
      boostDurationBonusMs: 0,
      maxComboBonus: 1.5,
      breakthroughBonus: 0,
      offlineBonus: 1.0
    },
    bonusText: '+1.5x Giới hạn Combo tối đa, +25% Sức mạnh Click, +15% Tốc độ nền'
  },
  {
    id: 'tho',
    name: 'Thổ Linh Căn',
    rarity: 'Ngũ Hành',
    weight: 18,
    color: '#d97706',
    icon: '⛰️',
    description: 'Vững chãi như thái sơn, đạo cơ kiên cố giúp đột phá cảnh giới dễ dàng.',
    bonuses: {
      passiveMult: 1.25,
      clickMult: 1.10,
      boostDurationBonusMs: 200,
      maxComboBonus: 0,
      breakthroughBonus: 0.08,
      offlineBonus: 1.10
    },
    bonusText: '+25% Tốc độ nền, +8% Tỉ lệ đột phá Cảnh Giới Lớn, +10% Bế Quan'
  },
  {
    id: 'loi',
    name: 'Lôi Dị Linh Căn',
    rarity: 'Thiên Phẩm (Hiếm)',
    weight: 5,
    color: '#c084fc',
    icon: '⚡',
    description: 'Chưởng quản Thiên Lôi chi lực! Tốc độ tu luyện và liên kích vượt xa Ngũ Hành.',
    bonuses: {
      passiveMult: 1.55,
      clickMult: 1.65,
      boostDurationBonusMs: 400,
      maxComboBonus: 2.5,
      breakthroughBonus: 0.05,
      offlineBonus: 1.15
    },
    bonusText: '[HIẾM] +55% Tốc độ nền, +65% Click, +2.5x Combo tối đa, +5% Đột phá'
  },
  {
    id: 'bang',
    name: 'Băng Dị Linh Căn',
    rarity: 'Thiên Phẩm (Hiếm)',
    weight: 4,
    color: '#67e8f9',
    icon: '❄️',
    description: 'Tâm tĩnh như vạn năm hàn băng, ngộ tính siêu phàm và đột phá cực kỳ ổn định.',
    bonuses: {
      passiveMult: 1.65,
      clickMult: 1.40,
      boostDurationBonusMs: 900,
      maxComboBonus: 1.5,
      breakthroughBonus: 0.12,
      offlineBonus: 1.25
    },
    bonusText: '[HIẾM] +65% Tốc độ nền, +40% Click, +0.9s Tăng Tốc, +12% Đột phá, +25% Bế Quan'
  },
  {
    id: 'hon_don',
    name: 'Hỗn Độn Thần Căn',
    rarity: 'Thần Phẩm (Cực Hiếm)',
    weight: 1,
    color: '#fde047',
    icon: '🌌',
    description: 'Linh căn truyền thuyết dung hợp vạn đạo khởi nguyên trong vũ trụ!',
    bonuses: {
      passiveMult: 2.00,
      clickMult: 2.00,
      boostDurationBonusMs: 1000,
      maxComboBonus: 3.5,
      breakthroughBonus: 0.15,
      offlineBonus: 1.40
    },
    bonusText: '[CỰC HIẾM] x2.0 Tốc độ nền & Click, +3.5x Combo, +15% Đột phá, +40% Bế Quan'
  }
];
