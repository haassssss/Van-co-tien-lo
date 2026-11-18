/**
 * js/utils.js
 * Các hàm tiện ích dùng chung: định dạng số lớn (Tiếng Việt chuẩn & K/M/B),
 * định dạng thời gian, kẹp giá trị và sinh số ngẫu nhiên.
 * Đã loại bỏ hoàn toàn mọi ký tự chữ Hán, chỉ dùng đơn vị tiếng Việt thuần nhất quán.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Utils = {
  // Đơn vị số lớn tiếng Việt thuần theo bậc 10^4 (Vạn = 10^4, Ức = 10^8, Triệu = 10^12...)
  HAN_VIET_UNITS: [
    '',
    ' Vạn',
    ' Ức',
    ' Triệu',
    ' Kinh',
    ' Cai',
    ' Tỷ',
    ' Nhương',
    ' Câu',
    ' Giản',
    ' Chính',
    ' Tái',
    ' Cực',
    ' Hằng Hà Sa',
    ' A Tăng Kỳ',
    ' Na Do Tha',
    ' Bất Khả Tư Nghị',
    ' Vô Lượng',
    ' Đại Số'
  ],

  // Đơn vị quốc tế rút gọn theo bậc 10^3
  SHORT_UNITS: [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
    'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'
  ],

  /**
   * Định dạng số lượng lớn theo kiểu Tiếng Việt (Vạn, Ức...) hoặc Rút gọn (K, M, B)
   * @param {number} num - Số cần hiển thị
   * @param {string} mode - 'hanviet' hoặc 'short'
   * @param {number} decimals - Số chữ số thập phân
   */
  formatNumber(num, mode, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (!isFinite(num)) return 'Vô Cực';

    const formatMode = mode || (window.TuTien.State && window.TuTien.State.data
      ? window.TuTien.State.data.settings.numberFormat
      : window.TuTien.CONFIG.defaultNumberFormat);

    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);

    if (abs < 1000) {
      if (abs < 10 && abs !== Math.floor(abs)) {
        return sign + abs.toFixed(1).replace(/\.0$/, '');
      }
      return sign + Math.floor(abs).toLocaleString('vi-VN');
    }

    if (formatMode === 'hanviet') {
      if (abs < 10000) {
        return sign + Math.floor(abs).toLocaleString('vi-VN');
      }
      const tier = Math.floor(Math.log10(abs) / 4);
      if (tier >= this.HAN_VIET_UNITS.length) {
        return sign + abs.toExponential(2);
      }
      const scale = Math.pow(10, tier * 4);
      const scaled = abs / scale;
      return sign + scaled.toFixed(decimals).replace(/\.?0+$/, '') + this.HAN_VIET_UNITS[tier];
    } else {
      const tier = Math.floor(Math.log10(abs) / 3);
      if (tier >= this.SHORT_UNITS.length) {
        return sign + abs.toExponential(2);
      }
      const scale = Math.pow(10, tier * 3);
      const scaled = abs / scale;
      return sign + scaled.toFixed(decimals).replace(/\.?0+$/, '') + this.SHORT_UNITS[tier];
    }
  },

  /**
   * Định dạng phần trăm gọn gàng
   */
  formatPercent(ratio, decimals = 0) {
    return (ratio * 100).toFixed(decimals).replace(/\.0+$/, '') + '%';
  },

  /**
   * Định dạng thời gian từ giây sang chuỗi tiếng Việt (ví dụ: "2 giờ 15 phút 30 giây")
   */
  formatDuration(totalSeconds) {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours} giờ`);
    if (minutes > 0) parts.push(`${minutes} phút`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} giây`);
    return parts.join(' ');
  },

  /**
   * Giới hạn một số trong khoảng [min, max]
   */
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  /**
   * Số thực ngẫu nhiên trong khoảng [min, max]
   */
  randomRange(min, max) {
    return min + Math.random() * (max - min);
  },

  /**
   * Số nguyên ngẫu nhiên trong khoảng [min, max]
   */
  randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
};
