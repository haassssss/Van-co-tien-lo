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
  minRealmIndexForPrestige: 10,
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
};
