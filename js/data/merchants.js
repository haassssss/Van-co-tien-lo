/**
 * js/data/merchants.js
 * 5 tiệm Thương Thành với Chưởng Quầy RIÊNG BIỆT cho từng Tầng (Tầng 1, Tầng 2, Tầng 3 — tổng 15 chưởng quầy).
 */
window.TuTien = window.TuTien || {};

window.TuTien.SHOP_MERCHANTS = {
  dan_phuong: {
    id: 'dan_phuong',
    tenTiem: 'Đan Phường',
    icon: '🧪',
    theoTang: {
      1: {
        tenChuongQuay: 'Tiểu Dược Đồng',
        danhHieu: 'Chưởng Quầy Tầng 1',
        thoai: {
          moTiem: 'Hương cỏ thuốc thoang thoảng! Đạo hữu cần dược liệu nhập môn hay đan dược cơ bản?',
          mua: 'Dược thảo tươi mới hái sáng nay, chúc đạo hữu luyện đan thuận lợi!',
          muaNhieu: 'Đạo hữu mua nhiều thế này, chắc sắp bế quan khai lò lớn rồi!',
          ban: 'Dược liệu sạch sẽ, Tầng 1 xin thu mua ngay!'
        }
      },
      2: {
        tenChuongQuay: 'Dược Trần Lão Nhân',
        danhHieu: 'Trung Phẩm Đan Sư',
        thoai: {
          moTiem: 'Trung Phẩm Điện chỉ bày linh thảo trăm năm và nhị phẩm linh đan, mời đạo hữu chọn.',
          mua: 'Dược tính thuần hòa, rất hợp để củng cố đan điền!',
          muaNhieu: 'Hào khí bất phàm! Lô linh dược này lão phu gói kỹ bằng ngọc hộp cho đạo hữu.',
          ban: 'Hảo đan dược, giữ trọn đan hương!'
        }
      },
      3: {
        tenChuongQuay: 'Thanh Liên Đan Thánh',
        danhHieu: 'Thượng Phẩm Đan Chủ',
        thoai: {
          moTiem: 'Thượng Phẩm Lâu tụ hội kỳ dược vạn năm. Đạo hữu muốn tìm tiên thảo nào?',
          mua: 'Kỳ dược hiếm có khó tìm, mong đạo hữu sớm ngày chứng đạo!',
          muaNhieu: 'Đạo hữu quả là bậc đại năng, bản lâu rất vinh hạnh được tiếp đãi!',
          ban: 'Tiên dược thượng thừa, bản lâu thu nhận với giá cao nhất!'
        }
      }
    }
  },
  khi_phuong: {
    id: 'khi_phuong',
    tenTiem: 'Khí Phường',
    icon: '⚒️',
    theoTang: {
      1: {
        tenChuongQuay: 'Thiết Ngưu Sư Đệ',
        danhHieu: 'Chưởng Quầy Tầng 1',
        thoai: {
          moTiem: 'Lửa lò rực cháy! Khoáng thạch nhập môn và pháp bảo Phàm Phẩm có sẵn trên kệ!',
          mua: 'Khoáng cứng, pháp bảo bền — dùng tốt lắm đó đạo hữu!',
          muaNhieu: 'Ồ! Đạo hữu gom khoáng định rèn cả kho binh khí sao?',
          ban: 'Khoáng thạch và pháp bảo cũ Khí Phường thu mua hết!'
        }
      },
      2: {
        tenChuongQuay: 'Thiết Chùy Đại Sư',
        danhHieu: 'Trung Phẩm Luyện Khí Sư',
        thoai: {
          moTiem: 'Tinh kim trăm năm và pháp bảo Trung Phẩm rèn sẵn đều nằm tại Tầng 2 này!',
          mua: 'Hảo khí! Mang ra Xuất Quan thử uy lực ngay đi đạo hữu!',
          muaNhieu: 'Sảng khoái! Khách hào phóng thế này lão phu rất thích!',
          ban: 'Tay nghề rèn không tồi, giá này công đạo!'
        }
      },
      3: {
        tenChuongQuay: 'Xích Hỏa Khí Tôn',
        danhHieu: 'Thượng Phẩm Khí Chủ',
        thoai: {
          moTiem: 'Thiên Canh Kim, Chân Long Huyết và Pháp Bảo Thượng Phẩm — tất cả hội tụ tại đây.',
          mua: 'Thần tài gặp minh chủ, chúc pháp bảo giúp đạo hữu tung hoành tứ phương!',
          muaNhieu: 'Khí phách chấn động Thượng Phẩm Lâu!',
          ban: 'Báu vật có linh tính, bản tôn thu nhận!'
        }
      }
    }
  },
  phu_cac: {
    id: 'phu_cac',
    tenTiem: 'Phù Các',
    icon: '📜',
    theoTang: {
      1: {
        tenChuongQuay: 'Mặc Lâm Tiểu Cô',
        danhHieu: 'Chưởng Quầy Tầng 1',
        thoai: {
          moTiem: 'Hoàng Chỉ, Chu Sa và Linh Phù sơ cấp đều mới họa xong, mời đạo hữu xem!',
          mua: 'Chúc đạo hữu hạ bút thành phù, linh vận hanh thông!',
          muaNhieu: 'Nhiều phù giấy thế này, đạo hữu định bế quan luyện phù cả tháng sao?',
          ban: 'Nét phù ngay ngắn, Phù Các xin thu nhận.'
        }
      },
      2: {
        tenChuongQuay: 'Thanh Hư Đạo Cô',
        danhHieu: 'Trung Phẩm Phù Sư',
        thoai: {
          moTiem: 'Một nét chu sa định càn khôn. Tầng 2 có yêu huyết quý và Linh Phù Trung Phẩm.',
          mua: 'Linh văn sắc nét, mang theo phòng thân rất yên tâm.',
          muaNhieu: 'Đạo hữu mua sỉ thế này, Thanh Hư xin tặng thêm lời chúc bình an!',
          ban: 'Yêu huyết và linh phù này phẩm chất rất khá.'
        }
      },
      3: {
        tenChuongQuay: 'Thiên Cơ Phù Tôn',
        danhHieu: 'Thượng Phẩm Phù Chủ',
        thoai: {
          moTiem: 'Tiên Tàm Thần Chỉ, Chân Long Tinh Huyết và Linh Phù Thượng Phẩm chỉ có tại Tầng 3.',
          mua: 'Đạo vận ẩn trong từng nét phù, mong đạo hữu dụng chi hữu ích!',
          muaNhieu: 'Đại thủ bút! Thiên Cơ Các ghi nhớ ân tình của đạo hữu!',
          ban: 'Thượng phẩm linh phù, xứng đáng giá cao!'
        }
      }
    }
  },
  tang_kinh_cac: {
    id: 'tang_kinh_cac',
    tenTiem: 'Tàng Kinh Các',
    icon: '📖',
    theoTang: {
      1: {
        tenChuongQuay: 'Thư Đồng Nhập Môn',
        danhHieu: 'Thủ Các Tầng 1',
        thoai: {
          moTiem: 'Bí tịch cơ bản cho tân tu sĩ.',
          mua: 'Chúc đạo hữu sớm lĩnh ngộ!',
          muaNhieu: 'Đạo hữu hiếu học quá!',
          ban: 'Tàng Kinh Các chỉ trao truyền đạo pháp.'
        }
      },
      2: {
        tenChuongQuay: 'Huyền Cơ Trưởng Lão',
        danhHieu: 'Trung Phẩm Thủ Các',
        thoai: {
          moTiem: 'Tầng 2 lưu giữ bí tịch Hoàng Giai và Huyền Giai. Hãy chọn công pháp hợp cảnh giới.',
          mua: 'Ngọc giản này có duyên với đạo hữu, mong sớm lĩnh ngộ tinh túy!',
          muaNhieu: 'Đạo hữu bác học đa tài, nhớ kiểm tra cảnh giới trước khi vận công.',
          ban: 'Tàng Kinh Các không thu mua phàm vật.'
        }
      },
      3: {
        tenChuongQuay: 'Thái Cổ Đạo Tàng Sứ',
        danhHieu: 'Thượng Phẩm Các Chủ',
        thoai: {
          moTiem: 'Địa Giai, Thiên Giai và Tiên Phẩm tuyệt học đều nằm trong mật thất Tầng 3 này.',
          mua: 'Tuyệt học đã về tay minh chủ, chớ phụ uy danh cổ nhân!',
          muaNhieu: 'Thu trọn tuyệt học thiên hạ, tiền đồ đạo hữu bất khả hạn lượng!',
          ban: 'Bản các chỉ truyền thụ bí tịch.'
        }
      }
    }
  },
  tap_hoa: {
    id: 'tap_hoa',
    tenTiem: 'Tạp Hóa',
    icon: '🏮',
    theoTang: {
      1: {
        tenChuongQuay: 'Tiểu Kim Chưởng Quầy',
        danhHieu: 'Chưởng Quầy Tầng 1',
        thoai: {
          moTiem: 'Khách quý quang lâm! Túi trữ vật, linh thảo, linh điền Tầng 1 giá siêu mềm!',
          mua: 'Giao dịch mau lẹ! Cần gì cứ ghé Tạp Hóa nhé đạo hữu!',
          muaNhieu: 'Đại khách tới rồi! Hảo cảm tăng nhanh lắm đây!',
          ban: 'Đồ thừa cứ mang qua tab Thu Mua nha!'
        }
      },
      2: {
        tenChuongQuay: 'Kim Nguyên Tổng Quản',
        danhHieu: 'Trung Phẩm Thương Chủ',
        thoai: {
          moTiem: 'Tầng 2 có mở rộng túi cỡ lớn, suất khai khoáng và rương linh thảo phong phú!',
          mua: 'Mua bán sòng phẳng, chúc đạo hữu tài nguyên dồi dào!',
          muaNhieu: 'Quả là đại gia của Trung Phẩm Điện!',
          ban: 'Thu Mua định giá chuẩn từng viên linh thạch!'
        }
      },
      3: {
        tenChuongQuay: 'Vạn Bảo Đại Trưởng Lão',
        danhHieu: 'Thượng Phẩm Tổng Quản',
        thoai: {
          moTiem: 'Tiên Giới Trữ Vật và Tiên Điền quý giá đều sẵn sàng phục vụ tôn khách Tầng 3.',
          mua: 'Giao dịch hoàn tất, mong tôn khách sớm mở khóa Tầng 4 Đấu Giá!',
          muaNhieu: 'Vạn Bảo Các vinh dự được phục vụ bậc đại năng như đạo hữu!',
          ban: 'Mọi kỳ bảo dư thừa đều có thể ký gửi tại Thu Mua.'
        }
      }
    }
  }
};

window.TuTien.getShopMerchantForFloor = function (merchantId, floorId) {
  const base = window.TuTien.SHOP_MERCHANTS && window.TuTien.SHOP_MERCHANTS[merchantId];
  if (!base) return null;
  const flData = (base.theoTang && (base.theoTang[floorId] || base.theoTang[1])) || {};
  return {
    id: base.id,
    tenTiem: base.tenTiem,
    icon: base.icon,
    tenChuongQuay: flData.tenChuongQuay || 'Chưởng Quầy',
    danhHieu: flData.danhHieu || `Tầng ${floorId}`,
    thoai: flData.thoai || { moTiem: 'Chào mừng đạo hữu!', mua: 'Cảm ơn!', muaNhieu: 'Đa tạ!', ban: 'Đã thu mua!' }
  };
};
