/**
 * js/data/shopFloors.js
 * Định nghĩa 4 tầng Thương Thành, hạng Linh Thạch chính, dải giá, điều kiện mở khóa và danh sách tiệm.
 */
window.TuTien = window.TuTien || {};

window.TuTien.SHOP_FLOORS = [
  {
    id: 1,
    key: 'tang_1',
    ten: 'Tầng 1 • Hạ Phẩm Các',
    shortName: 'Tầng 1',
    hangTien: 'Hạ Phẩm',
    donViLow: 1,
    minPriceLow: 1,
    maxPriceLow: 99,
    alwaysUnlocked: true,
    unlockFromFloor: null,
    moTa: 'Khu giao dịch phổ thông dùng Linh Thạch Hạ Phẩm (1–99 Hạ).',
    tiemIds: ['dan_phuong', 'khi_phuong', 'phu_cac', 'tap_hoa'],
    chaoKhach: 'Chào mừng đạo hữu bước vào Hạ Phẩm Các! Dược liệu, khoáng thạch và phù chỉ đều đủ cả.'
  },
  {
    id: 2,
    key: 'tang_2',
    ten: 'Tầng 2 • Trung Phẩm Điện',
    shortName: 'Tầng 2',
    hangTien: 'Trung Phẩm',
    donViLow: 100,
    minPriceLow: 100,
    maxPriceLow: 9900,
    alwaysUnlocked: false,
    unlockFromFloor: 1,
    moTa: 'Khu trân bảo trung cấp dùng Linh Thạch Trung Phẩm (1–99 Trung).',
    tiemIds: ['dan_phuong', 'khi_phuong', 'phu_cac', 'tang_kinh_cac', 'tap_hoa'],
    chaoKhach: 'Chúc mừng đạo hữu khai mở Trung Phẩm Điện! Công pháp, linh liệu thượng hạng đã sẵn sàng.'
  },
  {
    id: 3,
    key: 'tang_3',
    ten: 'Tầng 3 • Thượng Phẩm Lâu',
    shortName: 'Tầng 3',
    hangTien: 'Thượng Phẩm',
    donViLow: 10000,
    minPriceLow: 10000,
    maxPriceLow: Infinity,
    alwaysUnlocked: false,
    unlockFromFloor: 2,
    moTa: 'Khu kỳ trân dị bảo dùng Linh Thạch Thượng Phẩm (từ 1 Thượng trở lên).',
    tiemIds: ['dan_phuong', 'khi_phuong', 'phu_cac', 'tang_kinh_cac', 'tap_hoa'],
    chaoKhach: 'Kính chào tôn khách đặt chân lên Thượng Phẩm Lâu! Kỳ trân thiên địa nơi đây chỉ dành cho cường giả.'
  },
  {
    id: 4,
    key: 'tang_4',
    ten: 'Tầng 4 • Đấu Giá Hội',
    shortName: 'Tầng 4',
    hangTien: 'Thượng Phẩm',
    donViLow: 10000,
    minPriceLow: 10000,
    maxPriceLow: Infinity,
    alwaysUnlocked: false,
    unlockFromFloor: 3,
    isPlaceholder: true,
    moTa: 'Sảnh Đấu Giá đỉnh cấp dành cho các bậc đại năng — Sắp ra mắt.',
    tiemIds: [],
    chaoKhach: 'Tầng Đấu Giá đang chuẩn bị ngày khai trương!'
  }
];
