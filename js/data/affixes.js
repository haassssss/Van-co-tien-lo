/**
 * js/data/affixes.js
 * Hệ thống 8 Đạo Vận (Thuộc tính ẩn của Pháp Bảo) quyết định hoàn toàn bằng tỷ lệ nguyên liệu:
 * - Chiếm >= 10% tổng số lượng: kích hoạt Mức 1 (Sơ Khởi)
 * - Chiếm >= 30% tổng số lượng: kích hoạt Mức Tối Đa (Viên Mãn)
 */
window.TuTien = window.TuTien || {};

window.TuTien.FORGE_AFFIXES = {
  hoa: {
    element: 'hoa',
    name: 'Liệt Hỏa Đạo Vận',
    statKey: 'clickPct',
    level1Value: 0.12,
    maxValue: 0.30,
    format(val) { return `+${Math.round(val * 100)}% sức mạnh mỗi Click`; }
  },
  bang: {
    element: 'bang',
    name: 'Hàn Băng Đạo Vận',
    statKey: 'boostDurationSec',
    level1Value: 0.45,
    maxValue: 1.20,
    format(val) { return `+${val.toFixed(2)}s thời gian Tăng Tốc`; }
  },
  huyet: {
    element: 'huyet',
    name: 'Huyết Sát Đạo Vận',
    statKey: 'passivePct',
    level1Value: 0.14,
    maxValue: 0.34,
    format(val) { return `+${Math.round(val * 100)}% tốc độ tu luyện nền`; }
  },
  moc: {
    element: 'moc',
    name: 'Trường Xuân Đạo Vận',
    statKey: 'fieldExpPct',
    level1Value: 0.18,
    maxValue: 0.45,
    format(val) { return `+${Math.round(val * 100)}% hiệu suất Linh Điền & Bách Nghệ`; }
  },
  tho: {
    element: 'tho',
    name: 'Hậu Thổ Đạo Vận',
    statKey: 'offlineHours',
    level1Value: 1.5,
    maxValue: 4.0,
    format(val) { return `+${val.toFixed(1)}h giới hạn Bế Quan Offline`; }
  },
  loi: {
    element: 'loi',
    name: 'Thiên Lôi Đạo Vận',
    statKey: 'maxComboAdd',
    level1Value: 0.35,
    maxValue: 0.90,
    format(val) { return `+${val.toFixed(2)}x hệ số Combo tối đa`; }
  },
  kim: {
    element: 'kim',
    name: 'Canh Kim Đạo Vận',
    statKey: 'breakthroughPct',
    level1Value: 0.02,
    maxValue: 0.05,
    format(val) { return `+${Math.round(val * 100)}% tỉ lệ Đột Phá Cảnh Giới`; }
  },
  thuy: {
    element: 'thuy',
    name: 'Thương Hải Đạo Vận',
    statKey: 'combatPct',
    level1Value: 0.12,
    maxValue: 0.28,
    format(val) { return `+${Math.round(val * 100)}% Máu & Linh Lực chiến đấu`; }
  }
};
