/**
 * js/config.js
 * Chứa toàn bộ các thông số cân bằng của game Tu Tiên Idle:
 * - Cân bằng Chính Đạo vs Ma Đạo (đầy đủ icon, color, title)
 * - Chỉ số mặc định (Máu 100, Linh lực 100, Tốc độ 10, Sức mạnh 10) và mức tăng mỗi khi Đột Phá
 * - Giới hạn cấp Công Pháp mỗi cảnh giới
 */
window.TuTien = window.TuTien || {};

window.TuTien.CONFIG = {
  // === 1. TỐC ĐỘ TU LUYỆN & CLICK ===
  basePassiveRate: 1.0,
  baseClickPower: 1.5,
  boostDurationMs: 1500,
  baseBoostMultiplier: 2.2,
  comboStepPerClick: 0.08,
  baseMaxComboMultiplier: 3.5,
  comboDecayRatePerSec: 1.8,

  // === 2. CHÍNH ĐẠO VS MA ĐẠO ===
  factions: {
    chinh_dao: {
      id: 'chinh_dao',
      name: 'Chính Đạo',
      icon: '☯️',
      color: '#38bdf8',
      title: 'Huyền Môn Chính Thống',
      subtitle: 'Huyền Môn Chính Thống',
      cultivateSpeedMult: 1.0,        // Tu luyện chậm rãi, vững chắc
      breakthroughChanceMod: 0.0,     // Tỉ lệ đột phá bình thường
      tribulationMaxHits: 3,          // Đỡ được 3 lần Thiên Kiếp
      tribulationSpeedMult: 1.0,      // Tốc độ Thiên Kiếp chuẩn
      hpMult: 1.20,                   // Chính đạo máu & linh lực dồi dào (+20% Máu)
      atkMult: 1.0
    },
    ma_dao: {
      id: 'ma_dao',
      name: 'Ma Đạo',
      icon: '🩸',
      color: '#f43f5e',
      title: 'Nghịch Thiên Ma Tông',
      subtitle: 'Nghịch Thiên Ma Tông',
      cultivateSpeedMult: 1.65,       // Tu luyện nhanh vượt trội (+65% tốc độ hấp thụ)
      breakthroughChanceMod: -0.15,   // Tỉ lệ đột phá thành công thấp hơn Chính Đạo 15%
      tribulationMaxHits: 2,          // Chỉ đỡ được 2 lần Thiên Kiếp!
      tribulationSpeedMult: 1.30,     // Thiên Kiếp của Ma Đạo nhanh và khốc liệt hơn 30%
      hpMult: 0.90,
      atkMult: 1.35                   // Sát phạt quyết đoán (+35% Sức mạnh)
    }
  },

  // === 3. HỆ THỐNG 4 CHỈ SỐ CHIẾN ĐẤU (MÁU, LINH LỰC, TỐC ĐỘ, SỨC MẠNH) ===
  combatStats: {
    baseHp: 100,                      // Máu mặc định: 100
    baseMp: 100,                      // Linh lực mặc định: 100
    baseSpeed: 10,                    // Tốc độ mặc định: 10
    baseAttack: 10,                   // Sức mạnh mặc định: 10
    // Mức tăng thêm mỗi khi đột phá 1 tiểu cảnh giới
    perSubRealmHp: 45,
    perSubRealmMp: 30,
    perSubRealmSpeed: 3,
    perSubRealmAttack: 8,
    // Hệ số nhân thêm mỗi khi bước qua 1 Đại Cảnh Giới (mỗi 5 tầng)
    perMajorRealmStatMult: 1.35
  },

  // === 4. CÂN BẰNG 100 CẢNH GIỚI & ĐỘT PHÁ ===
  baseRealmQiRequirement: 120,
  subRealmQiMultiplier: 1.58,
  majorRealmQiJump: 2.40,
  majorRealmSpeedMultiplier: 1.38,
  subRealmSpeedBonus: 0.07,

  normalBreakthroughChance: 0.95,
  majorBreakthroughBaseChance: 0.80,
  majorBreakthroughDropPerTier: 0.04,
  minBreakthroughChance: 0.15,
  breakthroughFailPenalty: 0.35,
  pityBonusPerFail: 0.06,

  // === 5. MINIGAME THIÊN KIẾP ===
  tribulation: {
    maxHitsAllowed: 3,
    baseDurationSec: 8.5,
    extraSecPerMajorRealm: 0.45,
    baseStrikeIntervalMs: 680,
    warningTimeMs: 560,
    strikeRadiusPct: 11,
    realmDropOnFail: 1
  },

  // === 6. HỆ SỐ GIÁ & GIỚI HẠN CẤP CÔNG PHÁP THEO CẢNH GIỚI ===
  upgradeCostMultiplierDefault: 1.22,
  upgradeLevelsPerRealm: 3,
  techniqueRefineBaseCost: 180,

  // === 7. AFK / BẾ QUAN OFFLINE ===
  autoSaveIntervalMs: 5000,
  baseMaxOfflineHours: 8,
  minOfflineSecondsForPopup: 20,
  offlineEfficiency: 0.85,

  // === 8. CHUYỂN SINH (PRESTIGE) & ĐẠO VẬN ===
  minRealmIndexForPrestige: 60,
  daoVanBasePerMajorRealm: 2,
  daoVanExponent: 1.42,

  // === 9. CƠ DUYÊN NGẪU NHIÊN ===
  fortuneMinIntervalSec: 45,
  fortuneMaxIntervalSec: 90,
  fortuneLifetimeMs: 7500,
  fortuneRewardSecondsOfProd: 18,

  // === 10. TƯ CHẤT & LĨNH VỰC ===
  aptitudeWeights: {
    pham_tu: 38,
    trung_pham: 34,
    thuong_pham: 17,
    thien_tai: 7,
    yeu_nghiet: 3,
    thien_dao_sung_nhi: 1
  },
  luckBoostPerLevel: 0.25,
  rerollAptitudeBaseCost: 2,
  rerollAptitudeCostMult: 1.65,

  fieldBaseExpPerSec: 1.4,
  fieldBaseExpReq: 90,
  fieldExpGrowthMult: 2.35,
  fieldClickExpSecondsEquivalent: 0.25,
  fieldPrestigeRetainRatio: 0.20,

  crafting: {
    pillBaseCooldownSec: 18,
    artifactBaseCooldownSec: 28,
    talismanBaseCooldownSec: 20,
    cooldownReductionPerRank: 0.075,
    maxEquippedArtifacts: 3,
    maxInventoryItems: 60
  },

  // === 11. HIỆU ỨNG HẠT LINH KHÍ CANVAS & NHÂN VẬT ===
  defaultNumberFormat: 'hanviet',
  maxFloatingTexts: 24,
  defaultFxQuality: 'high',
  characterHeightVh: 58,
  realmsPerCharacterSprite: 20,
  fiveColorRealmThreshold: 20,

  particles: {
    poolSizeByQuality: {
      high: 130,
      medium: 75,
      low: 35,
      off: 0
    },
    baseSpawnPerSec: 14,
    boostSpawnMultiplier: 3.8,
    clickBurstCount: 14,
    baseInwardSpeed: 115,
    swirlAngularSpeed: 1.85,
    dantianOffsetYRatio: 0.56
  },

  rootParticleColors: {
    kim: ['#ffffff', '#fef08a', '#fbbf24'],
    moc: ['#4ade80', '#10b981', '#a7f3d0'],
    thuy: ['#38bdf8', '#60a5fa', '#bae6fd'],
    hoa: ['#fb923c', '#f43f5e', '#fde047'],
    tho: ['#d97706', '#fbbf24', '#fcd34d'],
    loi: ['#c084fc', '#e879f9', '#f3e8ff'],
    bang: ['#67e8f9', '#22d3ee', '#ecfeff'],
    hon_don: ['#fef08a', '#4ade80', '#38bdf8', '#f43f5e', '#c084fc']
  },

  fiveElementColors: ['#fef08a', '#4ade80', '#38bdf8', '#fb923c', '#d97706']
,
// === 12. CẤU HÌNH RÈN PHÁP BẢO XÁC ĐỊNH (KHỐNG HỎA F/G/H) & KHAI KHOÁNG AFK ===
  forge: {
    maxSlots: 4,
    affixLevel1Ratio: 0.10,          // >= 10% tổng linh tài kích hoạt Đạo Vận mức 1
    affixMaxRatio: 0.30,             // >= 30% tổng linh tài kích hoạt Đạo Vận mức tối đa
    scoreBonusTier1Pct: 60,          // >= 60% Khống Hỏa: +1 phẩm giai
    scoreBonusTier2Pct: 90,          // >= 90% Khống Hỏa: +2 phẩm giai
    donNgoStreakSec: 5.5,            // Giữ kim liên tục trong vùng xanh 5.5s -> Đốn Ngộ (+1 phẩm giai)
    abandonPenalty: 0.50,            // Bỏ dở giữa chừng mất 50% linh tài (làm tròn lên cho người chơi)
    autoForgeBaseCapPct: 56,         // Trần điểm Tự Động Rèn cơ bản (%)
    autoForgeCapPerRank: 2,          // Mỗi cấp Luyện Khí tăng thêm 2% trần Tự Động (tối đa 70%)
    autoForgeMaxCapPct: 70,
    autoForgeTimeMult: 1.35,         // Tự Động Rèn tốn thời gian lâu hơn 35%
    heatRisePerSec: 36,              // Tốc độ tăng nhiệt khi giữ phím F (Thêm lửa)
    heatCoolPerSec: 38,              // Tốc độ hạ nhiệt khi giữ phím G (Quạt gió)
    focusDrainPerSec: 28,            // Tốc độ tiêu hao Linh Lực khi giữ phím H (Ngưng thần)
    focusRegenPerSec: 22,            // Tốc độ hồi Linh Lực khi nhả phím H
    defaultKeys: {
      addFire: 'KeyF',
      fanWind: 'KeyG',
      focusCalm: 'KeyH'
    }
  },

  mining: {
    baseIntervalSec: 12,             // Mỗi 12 giây Khai Khoáng AFK tự thu 1-2 linh tài
    maxOfflineMiningHours: 12
  },

  // === 13. CẤU HÌNH LUYỆN ĐAN XÁC ĐỊNH (ĐAN LÔ — HÒA DƯỢC F/G/H/J & NGƯNG ĐAN SPACE) ===
  alchemy: {
    maxSlots: 4,
    affixLevel1Ratio: 0.10,
    affixMaxRatio: 0.30,
    herbsPerPill: 4,                 // Mỗi 4 dược liệu tạo thành 1 viên đan
    hoaDuocMinSec: 20,
    hoaDuocMaxSec: 28,
    ngungDanSec: 10,
    barPushPerSec: 42,               // Tốc độ đẩy thanh dược lực khi giữ F/G/H/J
    barDecayPerSec: 16,              // Tốc độ tụt chậm khi nhả phím
    danVanBonusPct: 0.15,            // Mỗi Đan Vân (0-3) tăng +15% hiệu lực đan
    autoMaxHoaDuocPct: 65,           // Trần Hòa Dược khi Tự Động Luyện
    autoMaxDanVan: 1,                // Tối đa 1 Đan Vân khi Tự Động Luyện
    autoTimeMult: 1.35,
    abandonPenalty: 0.50,
    defaultKeys: {
      herb1: 'KeyF',
      herb2: 'KeyG',
      herb3: 'KeyH',
      herb4: 'KeyJ',
      condense: 'Space'
    }
  },

  // === 14. CẤU HÌNH LUYỆN PHÙ XÁC ĐỊNH (PHÙ ÁN — HỌA PHÙ CANVAS) ===
  talisman: {
    affixLevel1Ratio: 0.10,
    affixMaxRatio: 0.30,
    perfectScorePct: 95,             // >= 95% đạt Phù Văn Hoàn Mỹ (+1 phẩm giai)
    autoMaxScorePct: 70,             // Trần Tự Động Họa
    autoTimeMult: 1.4,
    abandonPenalty: 0.50
  },

  // === 15. CẤU HÌNH CHIẾN ĐẤU KIỂU POKÉMON, CÔNG PHÁP CHIẾN ĐẤU & VỊ DIỆN ===
  TECH_GRADES: [
    { tier: 1, id: 'pham',  name: 'Phàm Phẩm',  color: '#cbd5e1', mult: 1.00, reqRealmIdx: 0,  reqRealmName: 'Thối Thể - Sơ Kỳ' },
    { tier: 2, id: 'hoang', name: 'Hoàng Giai', color: '#fde047', mult: 1.35, reqRealmIdx: 10, reqRealmName: 'Luyện Khí - Sơ Kỳ' },
    { tier: 3, id: 'huyen', name: 'Huyền Giai', color: '#38bdf8', mult: 1.80, reqRealmIdx: 20, reqRealmName: 'Tử Phủ - Sơ Kỳ' },
    { tier: 4, id: 'dia',   name: 'Địa Giai',   color: '#4ade80', mult: 2.40, reqRealmIdx: 30, reqRealmName: 'Kim Thân - Sơ Kỳ' },
    { tier: 5, id: 'thien', name: 'Thiên Giai', color: '#c084fc', mult: 3.20, reqRealmIdx: 30, reqRealmName: 'Kim Thân - Sơ Kỳ' },
    { tier: 6, id: 'thanh', name: 'Thánh Phẩm', color: '#fb923c', mult: 4.30, reqRealmIdx: 40, reqRealmName: 'Hóa Thần - Sơ Kỳ' },
    { tier: 7, id: 'tien',  name: 'Tiên Phẩm',  color: '#f43f5e', mult: 5.80, reqRealmIdx: 50, reqRealmName: 'Hợp Thể - Sơ Kỳ' }
  ],


  // Cấu hình hệ thống Thương Thành (mọi con số cân bằng tập trung tại đây)
  shop: {
    TANG_4_ENABLED: false,                // Bật/tắt Tầng 4 (Đấu Giá) khi ra mắt
    unlockMode: 'theo_tang',              // 'theo_tang' (mặc định) hoặc 'tong'
    unlockThresholdsInLow: {
      2: 2000,                            // Mở Tầng 2: tiêu 2.000 Hạ Phẩm ở Tầng 1
      3: 500000,                          // Mở Tầng 3: tiêu 5.000 Trung Phẩm (= 500.000 Hạ) ở Tầng 2
      4: 1000000                          // Mở Tầng 4: tiêu 100 Thượng Phẩm (= 1.000.000 Hạ) ở Tầng 3
    },
    rotationCycleMs: 4 * 60 * 60 * 1000,  // Chu kỳ đổi hàng luân phiên & đơn hàng: 4 giờ
    rotatingSlotsPerShop: 4,              // Số ô hàng luân phiên mặc định mỗi tiệm
    rotatingSlotsByFloor: { 1: 4, 2: 5, 3: 6 }, // Tầng cao hiện nhiều hàng luân phiên hơn
    marketWaveEnabled: true,              // Dao động thị trường theo sóng thời gian cố định
    marketWaveAmplitude: 0.10,            // Biên độ dao động ±10%
    marketWavePeriodMs: 2 * 60 * 60 * 1000, // Chu kỳ sóng 2 giờ
    surgePerPurchase: 0.03,               // Mỗi lần mua nhích giá +3%
    surgeMax: 0.60,                       // Trần nhích giá tối đa +60%
    surgeDecayPerMinute: 0.01,            // Hạ 1% mỗi phút thực
    buybackRatio: 0.40,                   // Giá thu mua = 40% giá gốc (luôn thấp hơn giá mua thấp nhất)
    expensiveConfirmRatio: 0.25,          // Hỏi xác nhận khi mua món > 25% tổng tài sản
    highTierSellConfirm: 3,               // Hỏi xác nhận khi bán đồ từ phẩm 3 trở lên
    orderRewardMult: 1.5,                 // Thưởng Đơn Hàng x1.5 giá trị thường
    orderMinCount: 3,                     // Số đơn tối thiểu mỗi chu kỳ
    orderMaxCount: 5,                     // Số đơn tối đa mỗi chu kỳ
    affinityTiers: [
      { level: 0, name: 'Khách Qua Đường', minSpentLow: 0,      discount: 0.00 },
      { level: 1, name: 'Khách Quen',      minSpentLow: 1500,   discount: 0.05 },
      { level: 2, name: 'Quý Khách',       minSpentLow: 25000,  discount: 0.10 },
      { level: 3, name: 'Tri Kỷ',          minSpentLow: 150000, discount: 0.15 },
      { level: 4, name: 'Chí Tôn Khách',   minSpentLow: 600000, discount: 0.20 }
    ],
    // Linh Thạch rơi theo Vị Diện khi thắng quái / tinh anh / boss
    planeSpiritStoneDrops: {
      tan_thu_gioi:    { mob: [15, 0, 0],  elite: [45, 1, 0],  boss: [80, 3, 0] },
      huyen_linh_gioi: { mob: [0, 3, 0],   elite: [0, 8, 0],   boss: [0, 20, 1] },
      kiep_van_gioi:   { mob: [0, 12, 0],  elite: [0, 28, 1],  boss: [0, 50, 3] },
      hong_mong_gioi:     { mob: [0, 35, 1],  elite: [0, 60, 2],  boss: [0, 0, 8] },
      de_lo_chien_truong: { mob: [0, 60, 2],  elite: [0, 0, 6],   boss: [0, 0, 18] }
    }
  },

  combatV2: {
    randomEnabled: false,            // Mặc định TẮT ngẫu nhiên sát thương (công thức cố định)
    elementAdvantage: true,          // Bật khắc chế ngũ hành 7 hệ
    advantageMult: 1.5,              // Hệ khắc chế gây x1.5 sát thương
    disadvantageMult: 0.75,          // Hệ bị khắc gây x0.75 sát thương
    mpRegenPerTurnPct: 0.08,         // Hồi 8% Linh Lực tối đa mỗi hiệp
    basicAttackMpRegenPct: 0.14,     // Phổ Công miễn phí & hồi 14% Linh Lực
    autoDamageMult: 0.90,            // Tự Động đánh yếu hơn chơi tay 10%
    deathRespawnSec: 180,            // Chết khi chiến đấu phải đợi 3 phút (180s) hồi sinh
    deathQiPenalty: 0.10,            // Thua trận mất 10% Linh Khí hiện có
    mapRefreshSec: 300,              // Bản đồ tự làm mới quái sau 5 phút (300s)
    bossRespawnSec: 1800,            // Boss Thế Giới hồi sinh sau 30 phút (1800s)
    outOfCombatHealPctPerSec: 0.05 / 60, // Tự hồi tự nhiên 5% Máu & Linh Lực mỗi phút
    defenseDivisor: 100,             // Công thức giảm thương: 100 / (100 + DEF)
    bossHitCapPct: 0.12,             // Trần sát thương 1 đòn lên Boss: tối đa 12% máu (~9 đòn hạ Boss)
    eliteHitCapPct: 0.25,            // Trần sát thương 1 đòn lên Tinh Anh: tối đa 25% máu
    bossFollowPlayerMult: 0.7,       // Máu Boss tăng theo 70% hệ số cộng dồn người chơi
    eliteFollowPlayerMult: 0.4,      // Máu Tinh Anh tăng theo 40% hệ số cộng dồn người chơi
    realmSuppressionPerTier: 0.10,   // Áp đảo / Áp chế cảnh giới: ±10% sát thương mỗi 1 cảnh giới chênh lệch
    realmSuppressionMinMult: 0.05,   // Sàn sát thương tối thiểu (5%) khi bị địch áp chế quá nhiều cảnh giới
    monsterAtkMult: 1.65,            // Hệ số tăng sát thương cơ bản của Quái & Boss
    bossAtkFollowPlayerMult: 0.45,   // Sát thương Boss tăng theo 45% hệ số máu cộng dồn người chơi (khi ngang/hơn cảnh giới)
    eliteAtkFollowPlayerMult: 0.28,  // Sát thương Tinh Anh tăng theo 28% hệ số máu cộng dồn người chơi
    mobAtkFollowPlayerMult: 0.15     // Sát thương Quái thường tăng theo 15% hệ số máu cộng dồn người chơi
  }
};