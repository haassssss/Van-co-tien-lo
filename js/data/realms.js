/**
 * js/data/realms.js
 * Danh sách hệ thống 100 Cảnh Giới Tu Tiên chia làm 5 Đại Cảnh Giới Lộ (20 Cảnh Giới Lớn x 5 Tầng).
 * Kết hợp đầy đủ hệ thống cảnh giới chi tiết từ Phàm Cảnh Lộ đến Đại Đạo Cảnh Lộ.
 */
window.TuTien = window.TuTien || {};

// 20 Cảnh Giới Lớn (mỗi Cảnh Giới Lớn gồm 5 tiểu cảnh giới = tổng 100 tầng cảnh giới)
window.TuTien.MAJOR_REALMS = [
  // === I. PHÀM CẢNH LỘ (Quy mô: Trái Đất / Nội Hành Tinh) ===
  {
    id: 'thoi_the',
    macroRealm: 'I. Phàm Cảnh Lộ',
    name: 'Thối Thể',
    subtitle: 'Rèn luyện nhục thể',
    auraColor: '#60a5fa',
    auraSecondary: '#1d4ed8',
    titlePrefix: 'Phàm Nhân Võ Giả',
    stages: [
      { name: 'Luyện Bì', desc: 'Rèn luyện da thịt cứng rắn như gỗ đá, bước đầu cảm ứng đạo lộ.' },
      { name: 'Luyện Nhục', desc: 'Cơ bắp cuồn cuộn sức mạnh ngàn cân, khí huyết dồi dào.' },
      { name: 'Đoán Cốt', desc: 'Tôi luyện xương cốt cứng chắc như sắt thép tinh luyện.' },
      { name: 'Dịch Cân', desc: 'Gân mạch dẻo dai, sức bật và tốc độ vượt xa phàm tục.' },
      { name: 'Phạt Tủy', desc: 'Thay tủy tạo máu mới, tẩy sạch tạp chất hậu thiên trong cơ thể.' }
    ]
  },
  {
    id: 'luyen_khi',
    macroRealm: 'I. Phàm Cảnh Lộ',
    name: 'Luyện Khí',
    subtitle: 'Khai mở kinh mạch',
    auraColor: '#38bdf8',
    auraSecondary: '#0284c7',
    titlePrefix: 'Luyện Khí Sĩ',
    stages: [
      { name: 'Cảm Khí', desc: 'Bắt đầu cảm nhận được linh khí thiên địa lưu chuyển quanh mình.' },
      { name: 'Dẫn Khí', desc: 'Chủ động dẫn linh khí tự nhiên đi vào kinh mạch trong cơ thể.' },
      { name: 'Tụ Khí', desc: 'Gom tụ linh khí về Đan Điền, hình thành vòng tuần hoàn chu thiên.' },
      { name: 'Ngưng Khí', desc: 'Nén chặt linh khí trong kinh mạch, tinh thuần hóa linh lực.' },
      { name: 'Chân Khí', desc: 'Biến linh khí thiên địa thành chân khí nội tại của riêng mình.' }
    ]
  },
  {
    id: 'truc_co',
    macroRealm: 'I. Phàm Cảnh Lộ',
    name: 'Trúc Cơ',
    subtitle: 'Xây dựng đạo cơ',
    auraColor: '#34d399',
    auraSecondary: '#059669',
    titlePrefix: 'Trúc Cơ Tu Sĩ',
    stages: [
      { name: 'Tạp Cơ', desc: 'Xây dựng nền móng đạo cơ sơ khởi, chính thức thoát khỏi phàm thai.' },
      { name: 'Phàm Cơ', desc: 'Đạo cơ vững chắc, chân nguyên hóa dịch chảy khắp kinh mạch.' },
      { name: 'Linh Cơ', desc: 'Đạo cơ thông linh, bắt đầu thi triển các pháp thuật tu tiên chân chính.' },
      { name: 'Địa Cơ', desc: 'Đạo cơ giao cảm với mạch đất, mượn sức mạnh đại địa hộ thân.' },
      { name: 'Thiên Cơ', desc: 'Trúc cơ hoàn mỹ không tì vết, thiên địa chúc phúc, thọ mệnh tăng vọt.' }
    ]
  },
  {
    id: 'ket_dan',
    macroRealm: 'I. Phàm Cảnh Lộ',
    name: 'Kết Đan (Kim Đan)',
    subtitle: 'Ngưng tụ đan điền',
    auraColor: '#fbbf24',
    auraSecondary: '#d97706',
    titlePrefix: 'Kim Đan Chân Nhân',
    stages: [
      { name: 'Khí Đan', desc: 'Chân nguyên trong Đan Điền xoáy tròn, kết thành hình cầu dạng khí.' },
      { name: 'Dịch Đan', desc: 'Linh dịch cô đặc lại, viên đan bắt đầu mang hình thái bán lỏng.' },
      { name: 'Hư Đan', desc: 'Giả đan hình thành rõ rệt nhưng vẫn cần thêm hỏa hầu tôi luyện.' },
      { name: 'Thật Đan', desc: 'Viên đan rắn chắc, ẩn chứa năng lượng khổng lồ trong Đan Điền.' },
      { name: 'Kim Đan', desc: 'Kim Đan bất hoại tỏa vạn đạo kim quang, ngự kiếm phi hành ngang dọc trời xanh.' }
    ]
  },

  // === II. LINH CẢNH LỘ (Quy mô: Hệ Mặt Trời / Vệ Tinh) ===
  {
    id: 'nguyen_anh',
    macroRealm: 'II. Linh Cảnh Lộ',
    name: 'Nguyên Anh',
    subtitle: 'Tu luyện linh hồn',
    auraColor: '#a78bfa',
    auraSecondary: '#7c3aed',
    titlePrefix: 'Nguyên Anh Lão Tổ',
    stages: [
      { name: 'Phá Đan', desc: 'Dùng thần thức đập vỡ Kim Đan để thai nghén sinh mệnh đạo quả mới.' },
      { name: 'Kết Anh', desc: 'Nguyên Anh thành hình trong Đan Điền, thần thông quảng đại.' },
      { name: 'Xuất Khiếu', desc: 'Nguyên Anh có thể rời khỏi xác phàm trong thời gian ngắn để du hành.' },
      { name: 'Du Thần', desc: 'Linh hồn ngao du khắp bầu trời Trái Đất, thần thức bao phủ vạn dặm.' },
      { name: 'Hiển Thánh', desc: 'Nguyên Anh ngưng tụ như thực thể, thoát khỏi trọng lực hành tinh.' }
    ]
  },
  {
    id: 'hoa_than',
    macroRealm: 'II. Linh Cảnh Lộ',
    name: 'Hóa Thần',
    subtitle: 'Thao túng quy luật nhỏ',
    auraColor: '#f472b6',
    auraSecondary: '#db2777',
    titlePrefix: 'Hóa Thần Tôn Giả',
    stages: [
      { name: 'Khai Thần', desc: 'Mở rộng thần thức chạm tới quy luật nguyên tố của thiên địa.' },
      { name: 'Phân Thần', desc: 'Chia tách thần niệm tạo ra hóa thân có tu vi độc lập.' },
      { name: 'Dung Thần', desc: 'Hợp nhất các phân thân, thần hồn thông suốt cổ kim.' },
      { name: 'Lĩnh Vực', desc: 'Mở ra không gian lĩnh vực riêng, áp chế mọi sinh linh trong phạm vi.' },
      { name: 'Giới Ngoại', desc: 'Bắt đầu bước ra ngoài bầu khí quyển, sinh tồn giữa khoảng không vũ trụ.' }
    ]
  },
  {
    id: 'luyen_hu',
    macroRealm: 'II. Linh Cảnh Lộ',
    name: 'Luyện Hư',
    subtitle: 'Tiếp xúc chân không',
    auraColor: '#2dd4bf',
    auraSecondary: '#0d9488',
    titlePrefix: 'Luyện Hư Đạo Quân',
    stages: [
      { name: 'Đạp Không', desc: 'Thân thể hòa hợp hư không, tự do bước đi giữa khoảng không vũ trụ.' },
      { name: 'Ngự Không', desc: 'Cưỡi lên các cơn bão từ trường và gió vũ trụ mà di chuyển.' },
      { name: 'Xuyên Tinh', desc: 'Nhảy vọt không gian, du hành giữa các hành tinh và vệ tinh lân cận.' },
      { name: 'Vẫn Thạch', desc: 'Một chưởng đánh nát thiên thạch khổng lồ, hấp thu tinh hoa sao băng.' },
      { name: 'Tinh Trần', desc: 'Thôn phệ bụi vũ trụ và năng lượng bức xạ ngân hà để rèn đạo khu.' }
    ]
  },
  {
    id: 'hop_the',
    macroRealm: 'II. Linh Cảnh Lộ',
    name: 'Hợp Thể',
    subtitle: 'Hợp nhất thể xác và linh hồn',
    auraColor: '#fb923c',
    auraSecondary: '#ea580c',
    titlePrefix: 'Hợp Thể Thánh Quân',
    stages: [
      { name: 'Dung Huyết', desc: 'Máu thịt và nguyên thần dung hợp, mỗi giọt máu đều mang năng lượng tinh tú.' },
      { name: 'Tiên Cốt', desc: 'Xương cốt phát sáng rực rỡ, mang khí tức tiên gia bất hoại.' },
      { name: 'Nội Cảnh', desc: 'Trong cơ thể mở ra tiểu thế giới sơ khai, tự sinh linh khí.' },
      { name: 'Pháp Tướng', desc: 'Ngưng tụ Thiên Địa Pháp Tướng cao vạn trượng đứng giữa tinh không.' },
      { name: 'Hợp Đạo', desc: 'Nhục thân, Nguyên Thần và Đạo Tâm hòa làm một thể hoàn mỹ.' }
    ]
  },

  // === III. TIÊN CẢNH LỘ (Quy mô: Hệ Sao / Ngân Hà) ===
  {
    id: 'dai_thua',
    macroRealm: 'III. Tiên Cảnh Lộ',
    name: 'Đại Thừa',
    subtitle: 'Tiệm cận Tiên Đạo',
    auraColor: '#f87171',
    auraSecondary: '#dc2626',
    titlePrefix: 'Đại Thừa Chí Tôn',
    stages: [
      { name: 'Kim Thân', desc: 'Đúc thành Bất Diệt Kim Thân, vạn pháp bất xâm.' },
      { name: 'Động Thiên', desc: 'Nội cảnh hóa thành Động Thiên phúc địa hoàn chỉnh.' },
      { name: 'Chưởng Giới', desc: 'Nắm giữ quy tắc không gian của cả một tinh hệ nhỏ.' },
      { name: 'Bán Tiên', desc: 'Nửa bước chân đã bước vào Tiên giới, chân nguyên hóa thành bán tiên lực.' },
      { name: 'Chuẩn Tiên', desc: 'Đứng trên đỉnh cao nhân gian, chỉ còn chờ Lôi Kiếp để phi thăng.' }
    ]
  },
  {
    id: 'do_kiep',
    macroRealm: 'III. Tiên Cảnh Lộ',
    name: 'Độ Kiếp',
    subtitle: 'Nghịch thiên vượt kiếp',
    auraColor: '#e879f9',
    auraSecondary: '#a21caf',
    titlePrefix: 'Độ Kiếp Đại Năng',
    stages: [
      { name: 'Lôi Kiếp', desc: 'Đón nhận Cửu Trọng Thiên Lôi gột rửa phàm trần.' },
      { name: 'Hỏa Kiếp', desc: 'Hồng Liên Nghiệp Hỏa thiêu đốt mọi nhân quả vướng bận.' },
      { name: 'Phong Kiếp', desc: 'Hư Không Cửu Phong thổi bay mọi tạp niệm trong nguyên thần.' },
      { name: 'Tâm Kiếp', desc: 'Vượt qua Vực Thẳm Tâm Ma, đạo tâm kiên định vĩnh hằng.' },
      { name: 'Phi Thăng', desc: 'Phá toái hư không, bước qua Tiên Môn tiến vào Tiên Giới!' }
    ]
  },
  {
    id: 'chan_tien',
    macroRealm: 'III. Tiên Cảnh Lộ',
    name: 'Chân Tiên',
    subtitle: 'Trường sinh bất lão',
    auraColor: '#fde047',
    auraSecondary: '#ca8a04',
    titlePrefix: 'Thượng Giới Chân Tiên',
    stages: [
      { name: 'Thoát Phàm', desc: 'Hoàn toàn rũ bỏ phàm thai, thọ cùng trời đất.' },
      { name: 'Tiên Thể', desc: 'Đúc thành Tiên Thể vô cấu, hấp thu Tiên Khí thượng giới.' },
      { name: 'Tiên Nguyên', desc: 'Toàn bộ linh lực chuyển hóa thành Tiên Nguyên thuần khiết.' },
      { name: 'Tiên Thức', desc: 'Tiên thức quét qua hàng trăm hệ sao trong nháy mắt.' },
      { name: 'Địa Tiên', desc: 'Trấn giữ một phương tinh vực, sáng lập tiên tông vạn năm.' }
    ]
  },
  {
    id: 'kim_tien',
    macroRealm: 'III. Tiên Cảnh Lộ',
    name: 'Kim Tiên',
    subtitle: 'Bất hủ giữa ngân hà',
    auraColor: '#facc15',
    auraSecondary: '#a16207',
    titlePrefix: 'Bất Hủ Kim Tiên',
    stages: [
      { name: 'Thiên Tiên', desc: 'Nắm giữ quy tắc thiên văn, điều khiển quỹ đạo tinh cầu.' },
      { name: 'Huyền Tiên', desc: 'Thấu hiểu huyền cơ âm dương, nghịch chuyển sinh tử.' },
      { name: 'Thái Ất', desc: 'Ngưng tụ Thái Ất Đạo Quả, vạn kiếp bất ma.' },
      { name: 'Đại La', desc: 'Nhảy ra ngoài dòng sông thời gian cục bộ, quá khứ vị lai đồng nhất.' },
      { name: 'Tiên Quân', desc: 'Thống lĩnh chư tiên, uy chấn cả một thiên hà rộng lớn.' }
    ]
  },

  // === IV. THẦN CẢNH LỘ (Quy mô: Vũ Trụ / Đa Chiều) ===
  {
    id: 'tien_vuong',
    macroRealm: 'IV. Thần Cảnh Lộ',
    name: 'Tiên Vương',
    subtitle: 'Bá chủ Tiên Vực',
    auraColor: '#c084fc',
    auraSecondary: '#6b21a8',
    titlePrefix: 'Vô Thượng Tiên Vương',
    stages: [
      { name: 'Phong Vương', desc: 'Đăng cơ Tiên Vương, tên khắc lên Bia Đá Chư Thiên.' },
      { name: 'Tinh Vực', desc: 'Một ý niệm sinh diệt hàng ngàn ngôi sao trong tinh vực.' },
      { name: 'Chưởng Luật', desc: 'Viết lại quy tắc vật lý và pháp tắc trong lãnh địa của mình.' },
      { name: 'Bất Diệt', desc: 'Dù chỉ còn một tia tàn niệm cũng có thể trọng sinh qua vạn năm.' },
      { name: 'Chí Tôn', desc: 'Tiên Vương tuyệt đỉnh, nửa bước chạm tới ngôi vị Tiên Đế.' }
    ]
  },
  {
    id: 'tien_de',
    macroRealm: 'IV. Thần Cảnh Lộ',
    name: 'Tiên Đế',
    subtitle: 'Độc đoán vạn cổ',
    auraColor: '#f43f5e',
    auraSecondary: '#9f1239',
    titlePrefix: 'Chư Thiên Tiên Đế',
    stages: [
      { name: 'Đế Cơ', desc: 'Ngưng tụ Đế Đạo chi cơ, chư thiên vạn giới cúi đầu triều bái.' },
      { name: 'Đế Uy', desc: 'Ánh mắt xuyên thủng cổ kim, uy áp bao trùm cả vũ trụ.' },
      { name: 'Ngự Đạo', desc: 'Vạn đạo dưới chân, mọi pháp tắc thiên địa đều phải tuân lệnh.' },
      { name: 'Vạn Cổ', desc: 'Đi ngược dòng sông thời gian, ánh chiếu chư thiên vạn cổ.' },
      { name: 'Chư Thiên', desc: 'Đứng trên đỉnh cao nhất của Tiên Đạo, thống ngự vạn giới.' }
    ]
  },
  {
    id: 'than_canh',
    macroRealm: 'IV. Thần Cảnh Lộ',
    name: 'Thần Cảnh',
    subtitle: 'Khởi nguyên Thần Đạo',
    auraColor: '#38bdf8',
    auraSecondary: '#1e40af',
    titlePrefix: 'Thái Cổ Chân Thần',
    stages: [
      { name: 'Thần Hỏa', desc: 'Thắp sáng Thần Hỏa bất diệt, vượt qua ranh giới Tiên - Thần.' },
      { name: 'Thần Cách', desc: 'Ngưng tụ Thần Cách bản nguyên, nắm giữ quyền năng vũ trụ.' },
      { name: 'Chân Thần', desc: 'Hóa thân thành quy luật sống của vũ trụ đa chiều.' },
      { name: 'Thiên Thần', desc: 'Dạo bước giữa các chiều không gian song song.' },
      { name: 'Thần Vương', desc: 'Vua của các vị thần, chưởng quản sinh diệt của hàng vạn thiên hà.' }
    ]
  },
  {
    id: 'chi_ton_than',
    macroRealm: 'IV. Thần Cảnh Lộ',
    name: 'Tổ Thần',
    subtitle: 'Sáng thế và Hư vô',
    auraColor: '#818cf8',
    auraSecondary: '#3730a3',
    titlePrefix: 'Hỗn Độn Tổ Thần',
    stages: [
      { name: 'Cổ Thần', desc: 'Thân thể khổng lồ ngang với các cụm siêu thiên hà.' },
      { name: 'Tổ Thần', desc: 'Nguồn gốc của huyết mạch vạn linh trong vũ trụ.' },
      { name: 'Sáng Thế', desc: 'Một hơi thở khai mở thế giới mới, tạo dựng vạn vật.' },
      { name: 'Hư Vô', desc: 'Hòa mình vào hư vô tuyệt đối trước khi vũ trụ hình thành.' },
      { name: 'Hỗn Độn', desc: 'Làm chủ Hỗn Độn nguyên khí, thai nghén đại vũ trụ.' }
    ]
  },

  // === V. ĐẠI ĐẠO CẢNH LỘ (Quy mô: Đa Vũ Trụ / Siêu Việt) ===
  {
    id: 'chuan_thanh',
    macroRealm: 'V. Đại Đạo Cảnh Lộ',
    name: 'Chuẩn Thánh',
    subtitle: 'Trảm thi chứng đạo',
    auraColor: '#22d3ee',
    auraSecondary: '#0e7490',
    titlePrefix: 'Hồng Hoang Chuẩn Thánh',
    stages: [
      { name: 'Ngộ Đạo', desc: 'Chạm tới bản nguyên tối cao của Hồng Mông Đại Đạo.' },
      { name: 'Trảm Thi', desc: 'Trảm bỏ Thiện Thi, Ác Thi và Chấp Niệm để tâm hồn thuần khiết.' },
      { name: 'Ký Thác', desc: 'Gửi nguyên thần vào Hư Không Đa Vũ Trụ.' },
      { name: 'Thánh Khu', desc: 'Nhục thân bất hủ cùng đa vũ trụ, không thể bị xóa sổ.' },
      { name: 'Bán Thánh', desc: 'Uy năng vô lượng, chỉ cách ngôi vị Thánh Nhân một bước chân.' }
    ]
  },
  {
    id: 'thanh_nhan',
    macroRealm: 'V. Đại Đạo Cảnh Lộ',
    name: 'Thiên Đạo Thánh Nhân',
    subtitle: 'Vạn kiếp bất diệt',
    auraColor: '#34d399',
    auraSecondary: '#047857',
    titlePrefix: 'Vô Thượng Thánh Nhân',
    stages: [
      { name: 'Hợp Thiên', desc: 'Nguyên thần dung hợp cùng Thiên Đạo của đại vũ trụ.' },
      { name: 'Bất Tử', desc: 'Thiên Đạo còn thì Thánh Nhân còn, bất tử bất diệt.' },
      { name: 'Vạn Kiếp', desc: 'Trải qua vô lượng lượng kiếp vẫn tiêu dao tự tại.' },
      { name: 'Chưởng Thiên', desc: 'Thay mặt Thiên Đạo vận hành trật tự của vạn giới.' },
      { name: 'Siêu Thoát', desc: 'Vượt thoát khỏi sự ràng buộc của Thiên Đạo, hướng tới Đại Đạo.' }
    ]
  },
  {
    id: 'dai_dao',
    macroRealm: 'V. Đại Đạo Cảnh Lộ',
    name: 'Hồng Mông Đại Đạo',
    subtitle: 'Ngũ Thái Khởi Nguyên',
    auraColor: '#f472b6',
    auraSecondary: '#be185d',
    titlePrefix: 'Đại Đạo Thánh Tôn',
    stages: [
      { name: 'Thái Dịch', desc: 'Trước khi có khí, tĩnh lặng vô biên nơi khởi nguồn vạn đạo.' },
      { name: 'Thái Sơ', desc: 'Khí chất khởi sinh, điểm bắt đầu của mọi khái niệm tồn tại.' },
      { name: 'Thái Thủy', desc: 'Hình chất sơ khai xuất hiện giữa biển Hồng Mông.' },
      { name: 'Thái Tố', desc: 'Vật chất nguyên thủy tụ hội, định hình cấu trúc đa vũ trụ.' },
      { name: 'Thái Cực', desc: 'Âm dương phân định, nắm trọn cội nguồn Ngũ Thái trong lòng bàn tay.' }
    ]
  },
  {
    id: 'vinh_hang',
    macroRealm: 'V. Đại Đạo Cảnh Lộ',
    name: 'Vĩnh Hằng Chúa Tể',
    subtitle: 'Cai quản Đa Vũ Trụ',
    auraColor: '#fef08a',
    auraSecondary: '#eab308',
    titlePrefix: 'Vĩnh Hằng Đạo Tổ',
    stages: [
      { name: 'Phá Giới', desc: 'Bước ra ngoài bức tường ngăn cách của mọi đa vũ trụ.' },
      { name: 'Chưởng Nguyên', desc: 'Một ý niệm sáng tạo hoặc quy nguyên hàng tỷ vũ trụ.' },
      { name: 'Siêu Đa Vũ Trụ', desc: 'Hiện diện đồng thời ở mọi chiều không gian và dòng thời gian.' },
      { name: 'Vô Thượng', desc: 'Không còn khái niệm giới hạn, chính là bản thân của Đạo.' },
      { name: 'Vĩnh Hằng Đạo Tổ', desc: 'Đỉnh cao tối thượng thứ 100 — Thực thể vô biên cai quản Đa Vũ Trụ!' }
    ]
  }
];

/**
 * Xây dựng mảng phẳng gồm 100 cảnh giới từ danh sách 20 Cảnh Giới Lớn
 * để các module khác tra cứu nhanh theo chỉ số (0 -> 99).
 */
window.TuTien.REALMS = (function buildAllRealms() {
  const cfg = window.TuTien.CONFIG;
  const list = [];
  let currentQiReq = cfg.baseRealmQiRequirement;
  let currentSpeedMult = 1.0;

  window.TuTien.MAJOR_REALMS.forEach((major, majorIdx) => {
    major.stages.forEach((stage, stageIdx) => {
      const globalIdx = list.length; // 0 .. 99
      const isMajorBottleneck = (stageIdx === major.stages.length - 1); // Tầng 5 của mỗi Cảnh Giới Lớn

      // Tính tỉ lệ đột phá: các tầng trong cùng cảnh giới lớn là 100%,
      // riêng tầng cuối (đột phá lên Cảnh Giới Lớn tiếp theo) có thử thách độ khó
      let breakthroughChance = cfg.normalBreakthroughChance;
      if (isMajorBottleneck && globalIdx < 99) {
        breakthroughChance = Math.max(
          cfg.minBreakthroughChance,
          cfg.majorBreakthroughBaseChance - majorIdx * cfg.majorBreakthroughDropPerTier
        );
      }

      list.push({
        index: globalIdx,
        orderNumber: globalIdx + 1,
        majorIndex: majorIdx,
        stageIndex: stageIdx,
        macroRealm: major.macroRealm,
        majorId: major.id,
        majorName: major.name,
        majorSubtitle: major.subtitle,
        stageName: stage.name,
        fullName: `${major.name} - ${stage.name}`,
        tierLabel: `Cảnh giới ${globalIdx + 1}/100 • Tầng ${stageIdx + 1}/${major.stages.length}`,
        titlePrefix: major.titlePrefix,
        description: stage.desc,
        auraColor: major.auraColor,
        auraSecondary: major.auraSecondary,
        qiRequired: Math.round(currentQiReq),
        passiveMultiplier: Number(currentSpeedMult.toFixed(4)),
        isMajorBottleneck: isMajorBottleneck,
        breakthroughChance: Number(breakthroughChance.toFixed(3)),
        failPenalty: isMajorBottleneck ? cfg.breakthroughFailPenalty : 0
      });

      // Cập nhật linh khí và hệ số tốc độ cho cảnh giới tiếp theo
      currentQiReq *= cfg.subRealmQiMultiplier;
      if (isMajorBottleneck) {
        currentQiReq *= cfg.majorRealmQiJump;
        currentSpeedMult *= cfg.majorRealmSpeedMultiplier;
      } else {
        currentSpeedMult *= (1 + cfg.subRealmSpeedBonus);
      }
    });
  });

  return list;
})();
