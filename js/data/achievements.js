/**
 * js/data/achievements.js
 * Danh sách Thành Tựu và Cơ Duyên ngẫu nhiên.
 * Mỗi thành tựu mở khóa sẽ cộng thêm phần trăm thưởng vĩnh viễn cho tốc độ tu luyện.
 */
window.TuTien = window.TuTien || {};

window.TuTien.ACHIEVEMENTS = [
  {
    id: 'first_click',
    name: 'Khởi Đầu Đạo Lộ',
    desc: 'Vận công (click) lần đầu tiên để hấp thụ linh khí.',
    rewardText: '+3% Tốc độ tu luyện',
    bonusMult: 0.03,
    check(state) { return state.stats.totalClicks >= 1; }
  },
  {
    id: 'clicks_100',
    name: 'Chuyên Tâm Khổ Luyện',
    desc: 'Đạt 100 lần vận công hấp thụ linh khí.',
    rewardText: '+5% Tốc độ tu luyện',
    bonusMult: 0.05,
    check(state) { return state.stats.totalClicks >= 100; }
  },
  {
    id: 'clicks_1000',
    name: 'Bách Chiết Bất Nao',
    desc: 'Đạt 1.000 lần vận công hấp thụ linh khí.',
    rewardText: '+10% Tốc độ tu luyện',
    bonusMult: 0.10,
    check(state) { return state.stats.totalClicks >= 1000; }
  },
  {
    id: 'realm_luyen_khi',
    name: 'Khai Mở Kinh Mạch',
    desc: 'Bước vào cảnh giới Luyện Khí (Cảm Khí - Tầng 6/100).',
    rewardText: '+5% Tốc độ tu luyện',
    bonusMult: 0.05,
    check(state) { return state.stats.highestRealmIndex >= 5; }
  },
  {
    id: 'realm_truc_co',
    name: 'Đạo Cơ Sơ Thành',
    desc: 'Đột phá thành công lên cảnh giới Trúc Cơ (Tầng 11/100).',
    rewardText: '+8% Tốc độ tu luyện',
    bonusMult: 0.08,
    check(state) { return state.stats.highestRealmIndex >= 10; }
  },
  {
    id: 'realm_kim_dan',
    name: 'Một Hạt Kim Đan Nuốt Vào Bụng',
    desc: 'Ngưng tụ thành công Kết Đan / Kim Đan (Tầng 16/100).',
    rewardText: '+12% Tốc độ tu luyện',
    bonusMult: 0.12,
    check(state) { return state.stats.highestRealmIndex >= 15; }
  },
  {
    id: 'realm_nguyen_anh',
    name: 'Phá Đan Thành Anh',
    desc: 'Bước vào Linh Cảnh Lộ — Cảnh giới Nguyên Anh (Tầng 21/100).',
    rewardText: '+15% Tốc độ tu luyện',
    bonusMult: 0.15,
    check(state) { return state.stats.highestRealmIndex >= 20; }
  },
  {
    id: 'realm_hoa_than',
    name: 'Thần Du Thái Hư',
    desc: 'Đạt tới cảnh giới Hóa Thần (Tầng 26/100).',
    rewardText: '+18% Tốc độ tu luyện',
    bonusMult: 0.18,
    check(state) { return state.stats.highestRealmIndex >= 25; }
  },
  {
    id: 'realm_hop_the',
    name: 'Thiên Nhân Hợp Nhất',
    desc: 'Đạt tới cảnh giới Hợp Thể (Tầng 36/100).',
    rewardText: '+22% Tốc độ tu luyện',
    bonusMult: 0.22,
    check(state) { return state.stats.highestRealmIndex >= 35; }
  },
  {
    id: 'realm_chan_tien',
    name: 'Phi Thăng Tiên Giới',
    desc: 'Vượt qua Độ Kiếp, bước vào Tiên Cảnh Lộ — Chân Tiên (Tầng 51/100).',
    rewardText: '+30% Tốc độ tu luyện',
    bonusMult: 0.30,
    check(state) { return state.stats.highestRealmIndex >= 50; }
  },
  {
    id: 'first_fortune',
    name: 'Phúc Duyên Thâm Hậu',
    desc: 'Thu thập thành công 1 Cơ Duyên thiên địa ngẫu nhiên.',
    rewardText: '+5% Tốc độ tu luyện',
    bonusMult: 0.05,
    check(state) { return state.stats.fortunesClaimed >= 1; }
  },
  {
    id: 'fortunes_10',
    name: 'Khí Vận Chi Tử',
    desc: 'Thu thập thành công 10 Cơ Duyên thiên địa.',
    rewardText: '+10% Tốc độ tu luyện',
    bonusMult: 0.10,
    check(state) { return state.stats.fortunesClaimed >= 10; }
  },
  {
    id: 'first_prestige',
    name: 'Luân Hồi Chuyển Thế',
    desc: 'Thực hiện Chuyển Sinh lần đầu tiên để lĩnh ngộ Đạo Vận.',
    rewardText: '+15% Tốc độ tu luyện',
    bonusMult: 0.15,
    check(state) { return state.prestige.count >= 1; }
  },
  {
    id: 'rare_root',
    name: 'Thiên Tư Tuyệt Thế',
    desc: 'Sở hữu Dị Linh Căn (Lôi, Băng hoặc Hỗn Độn).',
    rewardText: '+15% Tốc độ tu luyện',
    bonusMult: 0.15,
    check(state) {
      return ['loi', 'bang', 'hon_don'].includes(state.prestige.rootId);
    }
  }
];

// Danh sách các bảo vật / linh thảo xuất hiện trong Cơ Duyên ngẫu nhiên
window.TuTien.FORTUNE_TYPES = [
  {
    id: 'huyen_thien_linh_thao',
    name: 'Huyền Thiên Linh Thảo',
    icon: '🌱',
    multiplier: 1.0,
    desc: 'Linh thảo ngàn năm hấp thu tinh hoa nhật nguyệt!'
  },
  {
    id: 'cuu_chuyen_kim_dan',
    name: 'Cửu Chuyển Linh Đan',
    icon: '💊',
    multiplier: 1.35,
    desc: 'Tiên đan lưu lạc từ động phủ cổ tu sĩ!'
  },
  {
    id: 'thai_at_tinh_thach',
    name: 'Thái Ất Tinh Thạch',
    icon: '💎',
    multiplier: 1.6,
    desc: 'Mảnh vỡ tinh cầu chứa đựng linh khí tinh thuần!'
  },
  {
    id: 'hong_mong_tu_khi',
    name: 'Tia Hồng Mông Tử Khí',
    icon: '✨',
    multiplier: 2.2,
    desc: 'Khí tức khởi nguyên vô cùng quý giá vừa lướt qua!'
  }
];
