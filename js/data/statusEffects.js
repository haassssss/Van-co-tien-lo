/**
 * js/data/statusEffects.js
 * Danh sách 8 Hiệu Ứng Trạng Thái chiến đấu và Bảng Khắc Chế 7 Hệ (Kim, Mộc, Thủy, Hỏa, Thổ, Lôi, Băng).
 */
window.TuTien = window.TuTien || {};

window.TuTien.COMBAT_ELEMENTS = {
  kim:  { id: 'kim',  name: 'Kim',  icon: '⚔️', color: '#facc15', strongAgainst: ['moc', 'bang'],  weakAgainst: ['hoa', 'loi'] },
  moc:  { id: 'moc',  name: 'Mộc',  icon: '🌿', color: '#4ade80', strongAgainst: ['tho', 'thuy'],  weakAgainst: ['kim', 'hoa', 'bang'] },
  thuy: { id: 'thuy', name: 'Thủy', icon: '💧', color: '#38bdf8', strongAgainst: ['hoa'],          weakAgainst: ['tho', 'moc', 'loi'] },
  hoa:  { id: 'hoa',  name: 'Hỏa',  icon: '🔥', color: '#fb923c', strongAgainst: ['kim', 'moc', 'bang'], weakAgainst: ['thuy'] },
  tho:  { id: 'tho',  name: 'Thổ',  icon: '⛰️', color: '#d97706', strongAgainst: ['thuy', 'loi'],  weakAgainst: ['moc'] },
  loi:  { id: 'loi',  name: 'Lôi',  icon: '⚡', color: '#c084fc', strongAgainst: ['thuy', 'kim'],  weakAgainst: ['tho'] },
  bang:  { id: 'bang',  name: 'Băng',  icon: '❄️', color: '#67e8f9', strongAgainst: ['moc'],          weakAgainst: ['hoa', 'kim'] },
  am:    { id: 'am',    name: 'Ám',    icon: '🌑', color: '#a855f7', strongAgainst: ['quang', 'moc'], weakAgainst: ['quang', 'loi'] },
  huyet: { id: 'huyet', name: 'Huyết', icon: '🩸', color: '#e11d48', strongAgainst: ['moc', 'thuy'],  weakAgainst: ['quang', 'kim'] },
  quang: { id: 'quang', name: 'Quang', icon: '✨', color: '#fef08a', strongAgainst: ['am', 'huyet'],  weakAgainst: ['am', 'tho'] }
};

window.TuTien.STATUS_EFFECTS = {
  thieu_dot: {
    id: 'thieu_dot', ten: 'Thiêu Đốt', icon: '🔥', color: '#fb923c',
    loai: 'gay_hai', soHiepMacDinh: 3, congDonToiDa: 1, giaiTruDuoc: true,
    dotHpPct: 0.06,
    moTa: 'Mất 6% Máu tối đa mỗi hiệp.'
  },
  trung_doc: {
    id: 'trung_doc', ten: 'Trúng Độc', icon: '☠️', color: '#a3e635',
    loai: 'gay_hai', soHiepMacDinh: 4, congDonToiDa: 3, giaiTruDuoc: true,
    dotHpPct: 0.04,
    moTa: 'Mất 4% Máu tối đa mỗi hiệp mỗi lớp (cộng dồn tối đa 3 lớp).'
  },
  dong_bang: {
    id: 'dong_bang', ten: 'Đóng Băng', icon: '❄️', color: '#67e8f9',
    loai: 'gay_hai', soHiepMacDinh: 1, congDonToiDa: 1, giaiTruDuoc: true,
    skipTurn: true, immunityAfterTurns: 2,
    moTa: 'Mất lượt 1 hiệp; sau khi tan băng được miễn nhiễm Đóng Băng 2 hiệp.'
  },
  xich_khoa: {
    id: 'xich_khoa', ten: 'Xích Khóa', icon: '⛓️', color: '#f43f5e',
    loai: 'gay_hai', soHiepMacDinh: 3, congDonToiDa: 1, giaiTruDuoc: true,
    spdMod: -0.40, blockFlee: true,
    moTa: 'Giảm 40% Thân Pháp và không thể Rút Lui.'
  },
  troi_buoc: {
    id: 'troi_buoc', ten: 'Trói Buộc', icon: '🪢', color: '#e879f9',
    loai: 'gay_hai', soHiepMacDinh: 2, congDonToiDa: 1, giaiTruDuoc: true,
    blockBuff: true,
    moTa: 'Không thể sử dụng chiêu Buff trong thời gian hiệu lực.'
  },
  suy_yeu: {
    id: 'suy_yeu', ten: 'Suy Yếu', icon: '📉', color: '#94a3b8',
    loai: 'gay_hai', soHiepMacDinh: 3, congDonToiDa: 1, giaiTruDuoc: true,
    atkMod: -0.28,
    moTa: 'Giảm 28% Sức Mạnh Công Kích.'
  },
  pha_giap: {
    id: 'pha_giap', ten: 'Phá Giáp', icon: '💔', color: '#f87171',
    loai: 'gay_hai', soHiepMacDinh: 3, congDonToiDa: 1, giaiTruDuoc: true,
    defMod: -0.35,
    moTa: 'Giảm 35% Phòng Thủ.'
  },
  tri_hoan: {
    id: 'tri_hoan', ten: 'Trì Hoãn', icon: '🐌', color: '#fbbf24',
    loai: 'gay_hai', soHiepMacDinh: 3, congDonToiDa: 1, giaiTruDuoc: true,
    spdMod: -0.30,
    moTa: 'Giảm 30% Tốc Độ (Thân Pháp).'
  },
  chay_mau: {
    id: 'chay_mau', ten: 'Chảy Máu', icon: '🩸', color: '#ef4444',
    loai: 'gay_hai', soHiepMacDinh: 3, congDonToiDa: 2, giaiTruDuoc: true,
    dotHpPct: 0.05,
    moTa: 'Mất 5% Máu tối đa mỗi hiệp (tối đa 2 lớp).'
  },
  dien_giat: {
    id: 'dien_giat', ten: 'Điện Giật', icon: '⚡', color: '#38bdf8',
    loai: 'gay_hai', soHiepMacDinh: 2, congDonToiDa: 1, giaiTruDuoc: true,
    dotHpPct: 0.04, spdMod: -0.25,
    moTa: 'Bị dòng lôi điện giật mất 4% Máu mỗi hiệp và giảm 25% Thân Pháp.'
  },
  // Các trạng thái có lợi (từ chiêu Buff — không mất lượt)
  tang_cong: {
    id: 'tang_cong', ten: 'Chiến Ý', icon: '⚔️', color: '#fde047',
    loai: 'co_loi', soHiepMacDinh: 3, congDonToiDa: 1, giaiTruDuoc: false,
    atkMod: 0.30,
    moTa: 'Tăng 30% Sức Mạnh Công Kích.'
  },
  ho_the: {
    id: 'ho_the', ten: 'Hộ Thể Kim Quang', icon: '🛡️', color: '#38bdf8',
    loai: 'co_loi', soHiepMacDinh: 2, congDonToiDa: 1, giaiTruDuoc: false,
    defMod: 0.45,
    moTa: 'Tăng 45% Phòng Thủ.'
  },
  tang_toc: {
    id: 'tang_toc', ten: 'Bằng Đằng Thân Pháp', icon: '💨', color: '#86efac',
    loai: 'co_loi', soHiepMacDinh: 3, congDonToiDa: 1, giaiTruDuoc: false,
    spdMod: 0.40,
    moTa: 'Tăng 40% Thân Pháp (Tốc Độ).'
  }
};
