/**
 * js/data/artifacts.js
 * 16 mẫu Pháp Bảo từ cỡ Nhỏ (3-10 linh tài) đến cỡ Lớn (30-50 linh tài), chia theo 8 Ô Trang Bị riêng.
 * Mỗi mẫu có quy luật chuyển động vùng xanh Khống Hỏa cố định (targetPattern) — 0% ngẫu nhiên!
 */
window.TuTien = window.TuTien || {};

window.TuTien.ARTIFACT_SLOTS = [
  { id: 'kiem',    name: 'Kiếm / Binh Khí', icon: '⚔️' },
  { id: 'cham',    name: 'Ám Khí / Phi Châm', icon: '📍' },
  { id: 'dinh',    name: 'Đỉnh Lô',         icon: '🏺' },
  { id: 'an',      name: 'Pháp Ấn',         icon: '💠' },
  { id: 'chuong',  name: 'Linh Chung',      icon: '🔔' },
  { id: 'giap',    name: 'Pháp Giáp / Y',   icon: '🛡️' },
  { id: 'phu_boi', name: 'Ngọc Bội / Phù',  icon: '📿' },
  { id: 'phien',   name: 'Pháp Phiến',      icon: '🪭' }
];

window.TuTien.ARTIFACT_BLUEPRINTS = [
  // === NHÓM NHỎ (3 - 10 linh tài) ===
  {
    id: 'thanh_phong_cham', name: 'Thanh Phong Phi Châm', slot: 'cham', shape: 'cham', sizeLabel: 'Nhỏ',
    minQty: 3, maxQty: 10, primaryRole: 'kim_loai', maxTier: 3, forgeTimeSec: 10, heatReq: 'Văn Hỏa (40–60%)',
    primaryStat: 'click', statLabel: 'Sức mạnh Click & Tốc Độ',
    targetPattern: { baseCenter: 50, amp1: 12, freq1: 0.75, amp2: 4, freq2: 1.4, width: 24 }
  },
  {
    id: 'huyet_anh_dao', name: 'Huyết Ảnh Phi Đao', slot: 'cham', shape: 'dao', sizeLabel: 'Nhỏ',
    minQty: 4, maxQty: 10, primaryRole: 'tinh_huyet', maxTier: 3, forgeTimeSec: 11, heatReq: 'Võ Hỏa Nhẹ (45–68%)',
    primaryStat: 'click', statLabel: 'Sức mạnh Click & Công Kích',
    targetPattern: { baseCenter: 56, amp1: 14, freq1: 0.9, amp2: 5, freq2: 1.7, width: 22 }
  },
  {
    id: 'thanh_tam_boi', name: 'Thanh Tâm Ngọc Bội', slot: 'phu_boi', shape: 'phu_boi', sizeLabel: 'Nhỏ',
    minQty: 3, maxQty: 10, primaryRole: 'ngoc', maxTier: 4, forgeTimeSec: 10, heatReq: 'Ôn Hỏa (35–55%)',
    primaryStat: 'passive', statLabel: 'Tốc độ nền & Linh Lực',
    targetPattern: { baseCenter: 44, amp1: 10, freq1: 0.65, amp2: 3, freq2: 1.2, width: 24 }
  },
  {
    id: 'tu_linh_phu_boi', name: 'Tụ Linh Thạch Bội', slot: 'phu_boi', shape: 'phu_boi', sizeLabel: 'Nhỏ',
    minQty: 5, maxQty: 12, primaryRole: 'linh_thach', maxTier: 3, forgeTimeSec: 12, heatReq: 'Văn Hỏa (42–62%)',
    primaryStat: 'passive', statLabel: 'Tốc độ nền & Bế Quan',
    targetPattern: { baseCenter: 52, amp1: 11, freq1: 0.7, amp2: 4, freq2: 1.3, width: 23 }
  },

  // === NHÓM TRUNG (11 - 28 linh tài) ===
  {
    id: 'thanh_van_phi_kiem', name: 'Thanh Vân Phi Kiếm', slot: 'kiem', shape: 'kiem', sizeLabel: 'Trung',
    minQty: 11, maxQty: 26, primaryRole: 'kim_loai', maxTier: 4, forgeTimeSec: 14, heatReq: 'Trung Hỏa (48–72%)',
    primaryStat: 'click', statLabel: 'Click & Sức Mạnh Công Kích',
    targetPattern: { baseCenter: 58, amp1: 16, freq1: 0.85, amp2: 5, freq2: 1.6, width: 21 }
  },
  {
    id: 'moc_linh_phien', name: 'Thanh Mộc Linh Phiến', slot: 'phien', shape: 'phien', sizeLabel: 'Trung',
    minQty: 10, maxQty: 24, primaryRole: 'moc', maxTier: 4, forgeTimeSec: 13, heatReq: 'Ôn Hỏa (38–60%)',
    primaryStat: 'passive', statLabel: 'Tốc độ nền & Bách Nghệ',
    targetPattern: { baseCenter: 48, amp1: 13, freq1: 0.72, amp2: 5, freq2: 1.5, width: 22 }
  },
  {
    id: 'han_ngoc_phien', name: 'Băng Tâm Ngọc Phiến', slot: 'phien', shape: 'phien', sizeLabel: 'Trung',
    minQty: 12, maxQty: 26, primaryRole: 'ngoc', maxTier: 5, forgeTimeSec: 15, heatReq: 'Hàn Hỏa (35–58%)',
    primaryStat: 'balanced', statLabel: 'Cân bằng Nền, Click & Tăng Tốc',
    targetPattern: { baseCenter: 45, amp1: 15, freq1: 0.8, amp2: 6, freq2: 1.7, width: 20 }
  },
  {
    id: 'son_ha_phap_an', name: 'Sơn Hà Pháp Ấn', slot: 'an', shape: 'an', sizeLabel: 'Trung',
    minQty: 14, maxQty: 28, primaryRole: 'linh_thach', maxTier: 4, forgeTimeSec: 15, heatReq: 'Võ Hỏa (52–76%)',
    primaryStat: 'balanced', statLabel: 'Cân bằng Nền, Đột Phá & Máu',
    targetPattern: { baseCenter: 62, amp1: 15, freq1: 0.9, amp2: 5, freq2: 1.8, width: 20 }
  },
  {
    id: 'huyen_nguyen_linh_chung', name: 'Huyền Nguyên Linh Chung', slot: 'chuong', shape: 'chuong', sizeLabel: 'Trung',
    minQty: 14, maxQty: 28, primaryRole: 'kim_loai', maxTier: 4, forgeTimeSec: 16, heatReq: 'Võ Hỏa (50–74%)',
    primaryStat: 'passive', statLabel: 'Tốc độ nền & Hộ Thể',
    targetPattern: { baseCenter: 60, amp1: 14, freq1: 0.85, amp2: 6, freq2: 1.5, width: 20 }
  },
  {
    id: 'bach_ngoc_phap_y', name: 'Bạch Ngọc Lưu Ly Y', slot: 'giap', shape: 'giap', sizeLabel: 'Trung',
    minQty: 12, maxQty: 28, primaryRole: 'ngoc', maxTier: 4, forgeTimeSec: 15, heatReq: 'Ôn Hỏa (40–62%)',
    primaryStat: 'defense', statLabel: 'Máu tối đa, Linh Lực & Nền',
    targetPattern: { baseCenter: 50, amp1: 13, freq1: 0.78, amp2: 5, freq2: 1.4, width: 21 }
  },
  {
    id: 'huyet_van_chien_giap', name: 'Huyết Văn Chiến Giáp', slot: 'giap', shape: 'giap', sizeLabel: 'Trung',
    minQty: 14, maxQty: 28, primaryRole: 'tinh_huyet', maxTier: 5, forgeTimeSec: 16, heatReq: 'Cực Hỏa (55–78%)',
    primaryStat: 'defense', statLabel: 'Máu tối đa & Sức Mạnh',
    targetPattern: { baseCenter: 64, amp1: 16, freq1: 0.95, amp2: 6, freq2: 1.9, width: 19 }
  },

  // === NHÓM LỚN (29 - 50 linh tài) ===
  {
    id: 'thai_at_cu_kiem', name: 'Thái Ất Tru Tiên Cự Kiếm', slot: 'kiem', shape: 'cu_kiem', sizeLabel: 'Lớn',
    minQty: 29, maxQty: 50, primaryRole: 'kim_loai', maxTier: 5, forgeTimeSec: 20, heatReq: 'Chân Hỏa (56–82%)',
    primaryStat: 'click', statLabel: 'Siêu cường Click & Công Kích',
    targetPattern: { baseCenter: 66, amp1: 18, freq1: 1.0, amp2: 6, freq2: 2.0, width: 18 }
  },
  {
    id: 'tran_yeu_than_dinh', name: 'Trấn Yêu Thần Đỉnh', slot: 'dinh', shape: 'dinh', sizeLabel: 'Lớn',
    minQty: 29, maxQty: 50, primaryRole: 'linh_thach', maxTier: 5, forgeTimeSec: 21, heatReq: 'Địa Hỏa (54–80%)',
    primaryStat: 'balanced', statLabel: 'Toàn diện Nền, Click & 4 Chỉ Số',
    targetPattern: { baseCenter: 64, amp1: 17, freq1: 0.92, amp2: 7, freq2: 1.85, width: 18 }
  },
  {
    id: 'cuu_long_dan_dinh', name: 'Cửu Long Tạo Hóa Đỉnh', slot: 'dinh', shape: 'dinh', sizeLabel: 'Lớn',
    minQty: 30, maxQty: 50, primaryRole: 'moc', maxTier: 5, forgeTimeSec: 22, heatReq: 'Đan Hỏa (50–76%)',
    primaryStat: 'passive', statLabel: 'Siêu cường Tốc Độ Nền & Bách Nghệ',
    targetPattern: { baseCenter: 60, amp1: 18, freq1: 0.96, amp2: 6, freq2: 1.9, width: 18 }
  },
  {
    id: 'hon_don_than_chung', name: 'Hỗn Độn Đông Hoàng Chung', slot: 'chuong', shape: 'chuong', sizeLabel: 'Lớn',
    minQty: 30, maxQty: 50, primaryRole: 'kim_loai', maxTier: 5, forgeTimeSec: 22, heatReq: 'Thiên Hỏa (58–84%)',
    primaryStat: 'balanced', statLabel: 'Toàn diện Nền, Máu & Đột Phá',
    targetPattern: { baseCenter: 68, amp1: 17, freq1: 1.05, amp2: 6, freq2: 2.1, width: 17 }
  },
  {
    id: 'phien_thien_than_an', name: 'Phiên Thiên Thần Ấn', slot: 'an', shape: 'an', sizeLabel: 'Lớn',
    minQty: 29, maxQty: 50, primaryRole: 'tinh_huyet', maxTier: 5, forgeTimeSec: 20, heatReq: 'Huyết Hỏa (55–80%)',
    primaryStat: 'click', statLabel: 'Siêu cường Click, Combo & Công',
    targetPattern: { baseCenter: 65, amp1: 18, freq1: 1.02, amp2: 6, freq2: 1.95, width: 18 }
  }
];
