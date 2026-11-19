/**
 * js/data/realms.js
 * Hệ thống 28 Đại Cảnh Giới × 5 Tiểu Cảnh Giới (Sơ Kỳ → Trung Kỳ → Hậu Kỳ → Đỉnh Phong → Viên Mãn) = 140 Cảnh Giới.
 * Đầy đủ thuộc tính tương thích 100% với ui.js, cultivate.js, breakthrough.js và renderRoadmapPanel().
 */
window.TuTien = window.TuTien || {};

window.TuTien.SUB_REALM_NAMES = [
  'Sơ Kỳ',
  'Trung Kỳ',
  'Hậu Kỳ',
  'Đỉnh Phong',
  'Viên Mãn'
];

window.TuTien.MAJOR_REALMS = [
  { id: 'thoi_the',        name: 'Thối Thể',        macroRealm: 'I. Phàm Cảnh Lộ',   auraColor: '#cbd5e1', auraSecondary: '#94a3b8', subtitle: 'Tôi luyện gân cốt, tẩy sạch phàm trần' },
  { id: 'ngung_khi',       name: 'Ngưng Khí',       macroRealm: 'I. Phàm Cảnh Lộ',   auraColor: '#e2e8f0', auraSecondary: '#cbd5e1', subtitle: 'Cảm ứng thiên địa, tụ khí nhập thể' },
  { id: 'luyen_khi',       name: 'Luyện Khí',       macroRealm: 'I. Phàm Cảnh Lộ',   auraColor: '#86efac', auraSecondary: '#4ade80', subtitle: 'Khai mở kinh mạch, vận chuyển chân khí' },
  { id: 'truc_co',         name: 'Trúc Cơ',         macroRealm: 'I. Phàm Cảnh Lộ',   auraColor: '#4ade80', auraSecondary: '#10b981', subtitle: 'Đúc nền đạo cơ, chính thức bước vào tiên đồ' },
  { id: 'tu_phu',          name: 'Tử Phủ',          macroRealm: 'I. Phàm Cảnh Lộ',   auraColor: '#34d399', auraSecondary: '#059669', subtitle: 'Mở rộng Tử Phủ, chứa đựng chân nguyên cuồn cuộn' },
  { id: 'kim_dan',         name: 'Kim Đan',         macroRealm: 'I. Phàm Cảnh Lộ',   auraColor: '#facc15', auraSecondary: '#eab308', subtitle: 'Ngưng tụ Kim Đan, thọ nguyên đại tăng' },
  { id: 'kim_than',        name: 'Kim Thân',        macroRealm: 'II. Linh Cảnh Lộ',  auraColor: '#fbbf24', auraSecondary: '#d97706', subtitle: 'Luyện thành Kim Thân bất hoại, đao thương bất nhập' },
  { id: 'nguyen_anh',      name: 'Nguyên Anh',      macroRealm: 'II. Linh Cảnh Lộ',  auraColor: '#a78bfa', auraSecondary: '#7c3aed', subtitle: 'Phá đan thành anh, thần thức xuất khiếu' },
  { id: 'hoa_than',        name: 'Hóa Thần',        macroRealm: 'II. Linh Cảnh Lộ',  auraColor: '#c084fc', auraSecondary: '#9333ea', subtitle: 'Hóa thần thông thiên, điều động thiên địa chi lực' },
  { id: 'luyen_hu',        name: 'Luyện Hư',        macroRealm: 'II. Linh Cảnh Lộ',  auraColor: '#38bdf8', auraSecondary: '#0284c7', subtitle: 'Luyện hóa hư không, đạp không nhi hành' },
  { id: 'hop_the',         name: 'Hợp Thể',         macroRealm: 'II. Linh Cảnh Lộ',  auraColor: '#60a5fa', auraSecondary: '#2563eb', subtitle: 'Hợp nhất thể xác và nguyên thần, pháp tướng hiện thế' },
  { id: 'dai_thua',        name: 'Đại Thừa',        macroRealm: 'II. Linh Cảnh Lộ',  auraColor: '#fb7185', auraSecondary: '#e11d48', subtitle: 'Đại đạo viên dung, tiệm cận cảnh giới phi thăng' },
  { id: 'do_kiep',         name: 'Độ Kiếp',         macroRealm: 'II. Linh Cảnh Lộ',  auraColor: '#f43f5e', auraSecondary: '#be123c', subtitle: 'Nghịch thiên nghênh chiến Cửu Thiên Lôi Kiếp' },
  { id: 'ban_thanh',       name: 'Bán Thánh',       macroRealm: 'III. Thánh Cảnh Lộ', auraColor: '#fb923c', auraSecondary: '#ea580c', subtitle: 'Nửa bước nhập Thánh, thánh uy sơ hiện' },
  { id: 'thanh_canh',      name: 'Thánh Cảnh',      macroRealm: 'III. Thánh Cảnh Lộ', auraColor: '#f97316', auraSecondary: '#c2410c', subtitle: 'Siêu phàm nhập Thánh, bất tử bất diệt' },
  { id: 'thanh_vuong',     name: 'Thánh Vương',     macroRealm: 'III. Thánh Cảnh Lộ', auraColor: '#f59e0b', auraSecondary: '#b45309', subtitle: 'Vương giả trong Thánh tộc, trấn áp nhất phương' },
  { id: 'tao_hoa_canh',    name: 'Tạo Hóa Cảnh',    macroRealm: 'III. Thánh Cảnh Lộ', auraColor: '#2dd4bf', auraSecondary: '#0d9488', subtitle: 'Chưởng khống tạo hóa, sinh tử trong nhất niệm' },
  { id: 'dao_canh',        name: 'Đạo Cảnh',        macroRealm: 'IV. Đạo Cảnh Lộ',   auraColor: '#22d3ee', auraSecondary: '#0891b2', subtitle: 'Sơ nhập Đại Đạo, cảm ngộ bản nguyên vũ trụ' },
  { id: 'thuy_dao_canh',   name: 'Thủy Đạo Cảnh',   macroRealm: 'IV. Đạo Cảnh Lộ',   auraColor: '#06b6d4', auraSecondary: '#0e7490', subtitle: 'Khởi nguồn đạo tắc, tự lập đạo tâm' },
  { id: 'tri_dao_canh',    name: 'Tri Đạo Cảnh',    macroRealm: 'IV. Đạo Cảnh Lộ',   auraColor: '#0ea5e9', auraSecondary: '#0369a1', subtitle: 'Thấu triệt vạn đạo, nhìn thấu nhân quả' },
  { id: 'chung_dao_canh',  name: 'Chứng Đạo Cảnh',  macroRealm: 'IV. Đạo Cảnh Lộ',   auraColor: '#818cf8', auraSecondary: '#4f46e5', subtitle: 'Chứng đắc đại đạo chi vị, vạn kiếp bất ma' },
  { id: 'chuong_dao_canh', name: 'Chưởng Đạo Cảnh', macroRealm: 'IV. Đạo Cảnh Lộ',   auraColor: '#a855f7', auraSecondary: '#7e22ce', subtitle: 'Chưởng khống pháp tắc, ngôn xuất pháp tùy' },
  { id: 'thien_dao_canh',  name: 'Thiên Đạo Cảnh',  macroRealm: 'IV. Đạo Cảnh Lộ',   auraColor: '#e879f9', auraSecondary: '#c026d3', subtitle: 'Hợp thân cùng Thiên Đạo, chi phối chư thiên' },
  { id: 'than_canh',       name: 'Thần Cảnh',       macroRealm: 'V. Đế Cảnh Lộ',     auraColor: '#f472b6', auraSecondary: '#db2777', subtitle: 'Thần quang phổ chiếu, siêu thoát phàm trần vạn giới' },
  { id: 'chi_canh',        name: 'Chí Cảnh',        macroRealm: 'V. Đế Cảnh Lộ',     auraColor: '#fb7185', auraSecondary: '#e11d48', subtitle: 'Đạt tới cực hạn Chí Tôn, độc bộ cổ kim' },
  { id: 'chuan_de',        name: 'Chuẩn Đế',        macroRealm: 'V. Đế Cảnh Lộ',     auraColor: '#fcd34d', auraSecondary: '#d97706', subtitle: 'Đế uy cái thế, chỉ cách Đế vị một bước chân' },
  { id: 'phong_de',        name: 'Phong Đế',        macroRealm: 'V. Đế Cảnh Lộ',     auraColor: '#facc15', auraSecondary: '#ca8a04', subtitle: 'Chính thức Phong Đế, vạn tộc triều bái' },
  { id: 'dai_de',          name: 'Đại Đế',          macroRealm: 'V. Đế Cảnh Lộ',     auraColor: '#fef08a', auraSecondary: '#eab308', subtitle: 'Vạn Cổ Đại Đế, chí cao vô thượng trấn áp chư thiên' }
].map(maj => ({
  ...maj,
  stages: window.TuTien.SUB_REALM_NAMES.map(sName => ({ name: sName }))
}));

window.TuTien.REALMS = (function buildRealms() {
  const list = [];
  const cfg = window.TuTien.CONFIG || {};
  const baseReq = cfg.baseRealmQiRequirement || 120;
  const subMult = cfg.subRealmQiMultiplier || 1.58;
  const majorJump = cfg.majorRealmQiJump || 2.40;
  const majSpeed = cfg.majorRealmSpeedMultiplier || 1.38;
  const subSpeed = cfg.subRealmSpeedBonus || 0.07;
  const majBaseChance = cfg.majorBreakthroughBaseChance || 0.80;
  const dropPerTier = cfg.majorBreakthroughDropPerTier || 0.04;
  const minChance = cfg.minBreakthroughChance || 0.15;
  const failPen = cfg.breakthroughFailPenalty || 0.35;
  const totalRealms = window.TuTien.MAJOR_REALMS.length * 5;

  let currentReq = baseReq;
  let globalIdx = 0;

  window.TuTien.MAJOR_REALMS.forEach((maj, mIdx) => {
    maj.stages.forEach((st, sIdx) => {
      const isMajorBottleneck = sIdx === 4;
      const pMult = Number((Math.pow(majSpeed, mIdx) * (1 + sIdx * subSpeed)).toFixed(3));
      const btChance = isMajorBottleneck
        ? Math.max(minChance, Number((majBaseChance - mIdx * (dropPerTier * 0.65)).toFixed(3)))
        : (cfg.normalBreakthroughChance || 0.95);

      list.push({
        index: globalIdx,
        orderNumber: globalIdx + 1,
        majorIndex: mIdx,
        subIndex: sIdx,
        macroRealm: maj.macroRealm,
        majorName: maj.name,
        subName: st.name,
        fullName: `${maj.name} - ${st.name}`,
        name: `${maj.name} - ${st.name}`,
        tierLabel: `Cảnh giới ${globalIdx + 1}/${totalRealms} • Tầng ${sIdx + 1}/5`,
        titlePrefix: maj.subtitle,
        auraColor: maj.auraColor,
        auraSecondary: maj.auraSecondary,
        qiRequired: Math.round(currentReq),
        req: Math.round(currentReq),
        passiveMultiplier: pMult,
        speedMultiplier: pMult,
        isMajorBottleneck,
        isMajorBreakthrough: isMajorBottleneck,
        breakthroughChance: btChance,
        failPenalty: failPen
      });

      globalIdx += 1;
      currentReq *= isMajorBottleneck ? majorJump : subMult;
    });
  });

  return list;
})();
