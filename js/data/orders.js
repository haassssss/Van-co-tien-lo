/**
 * js/data/orders.js
 * Các mẫu Đơn Hàng của khách thương thành. Chỉ tạo đơn cho vật phẩm thực sự tồn tại trong game và khả thi theo cảnh giới người chơi.
 */
window.TuTien = window.TuTien || {};

window.TuTien.SHOP_ORDER_TEMPLATES = [
  {
    id: 'ord_sat_khoang',
    ten: 'Thu mua Huyền Thiết rèn giáp',
    merchantId: 'khi_phuong',
    minRealmIdx: 0,
    req: { type: 'material', refId: 'sat_khoang', qty: 5 },
    baseValueLow: 50,
    affinityGain: 120,
    moTa: 'Nộp 5 khoáng Sắt (Huyền Thiết) cho Thiết Chùy Đại Sư.'
  },
  {
    id: 'ord_da_khoang',
    ten: 'Cần Đá Linh Khoáng xây trận',
    merchantId: 'khi_phuong',
    minRealmIdx: 0,
    req: { type: 'material', refId: 'da_khoang', qty: 5 },
    baseValueLow: 60,
    affinityGain: 140,
    moTa: 'Nộp 5 Đá khoáng cho Khí Phường.'
  },
  {
    id: 'ord_tu_linh_thao',
    ten: 'Thu mua Tụ Linh Thảo tươi',
    merchantId: 'dan_phuong',
    minRealmIdx: 0,
    req: { type: 'alchemy_mat', refId: 'tu_linh_thao', qty: 4 },
    baseValueLow: 48,
    affinityGain: 120,
    moTa: 'Nộp 4 Tụ Linh Thảo cho Dược Trần Lão Nhân.'
  },
  {
    id: 'ord_hoang_chi',
    ten: 'Cần gấp Hoàng Chỉ họa phù',
    merchantId: 'phu_cac',
    minRealmIdx: 0,
    req: { type: 'talisman_mat', refId: 'hoang_chi', qty: 6 },
    baseValueLow: 48,
    affinityGain: 120,
    moTa: 'Nộp 6 Hoàng Chỉ cho Thanh Hư Đạo Cô.'
  },
  {
    id: 'ord_pill_any_1',
    ten: 'Đơn đặt Đan Dược sơ cấp',
    merchantId: 'dan_phuong',
    minRealmIdx: 5,
    req: { type: 'bag_category', category: 'pill', minQuality: 1, qty: 2 },
    baseValueLow: 140,
    affinityGain: 260,
    moTa: 'Nộp 2 viên Đan Dược bất kỳ từ Phẩm 1 trở lên trong Túi.'
  },
  {
    id: 'ord_talisman_any_1',
    ten: 'Khách cần Linh Phù phòng thân',
    merchantId: 'phu_cac',
    minRealmIdx: 5,
    req: { type: 'bag_category', category: 'talisman', minQuality: 1, qty: 2 },
    baseValueLow: 160,
    affinityGain: 280,
    moTa: 'Nộp 2 lá Linh Phù từ Phẩm 1 trở lên trong Túi.'
  },
  {
    id: 'ord_artifact_any_2',
    ten: 'Đặt rèn Pháp Bảo Trung Phẩm trở lên',
    merchantId: 'khi_phuong',
    minRealmIdx: 10,
    req: { type: 'bag_category', category: 'artifact', minQuality: 2, qty: 1 },
    baseValueLow: 450,
    affinityGain: 600,
    moTa: 'Nộp 1 Pháp Bảo chưa trang bị từ Phẩm 2 (Trung Phẩm) trở lên.'
  },
  {
    id: 'ord_vang_tinh_kim',
    ten: 'Thu mua Vàng Tinh Kim chế khí',
    merchantId: 'khi_phuong',
    minRealmIdx: 15,
    req: { type: 'material', refId: 'vang_tinh_kim', qty: 4 },
    baseValueLow: 360,
    affinityGain: 500,
    moTa: 'Nộp 4 Vàng Tinh Kim cho Khí Phường.'
  },
  {
    id: 'ord_pill_tier3',
    ten: 'Đặt mua Linh Đan từ Phẩm 3',
    merchantId: 'dan_phuong',
    minRealmIdx: 20,
    req: { type: 'bag_category', category: 'pill', minQuality: 3, qty: 3 },
    baseValueLow: 2400,
    affinityGain: 1500,
    moTa: 'Nộp 3 viên Đan Dược từ Phẩm 3 trở lên.'
  },
  {
    id: 'ord_artifact_tier3',
    ten: 'Đại khách đặt Pháp Bảo Thượng Phẩm',
    merchantId: 'khi_phuong',
    minRealmIdx: 25,
    req: { type: 'bag_category', category: 'artifact', minQuality: 3, qty: 1 },
    baseValueLow: 3500,
    affinityGain: 2200,
    moTa: 'Nộp 1 Pháp Bảo chưa trang bị từ Phẩm 3 (Thượng Phẩm) trở lên.'
  },
  {
    id: 'ord_huyet_chan_long',
    ten: 'Đơn đặc biệt: Chân Long Tinh Huyết',
    merchantId: 'phu_cac',
    minRealmIdx: 40,
    req: { type: 'talisman_mat', refId: 'huyet_chan_long', qty: 2 },
    baseValueLow: 60000,
    affinityGain: 12000,
    moTa: 'Nộp 2 Chân Long Tinh Huyết cho Phù Các.'
  }
];
