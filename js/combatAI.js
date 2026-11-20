/**
 * js/combatAI.js
 * AI cho Quái vật (theo mẫu cố định) và AI Tự Động cho Người Chơi (ưu tiên Hồi phục <30% -> Buff -> Khắc hệ -> Mạnh nhất -> Phổ Công).
 */
window.TuTien = window.TuTien || {};

window.TuTien.CombatAI = {
  pickMonsterSkill(enemy, turnNumber) {
    const allSkills = window.TuTien.MONSTER_SKILLS || {};
    const baseList = Array.isArray(enemy.chieu) && enemy.chieu.length ? enemy.chieu.slice() : ['can_xe'];

    // Bổ sung kỹ năng ngẫu nhiên theo vai trò để quái & boss đa dạng, khó lường hơn
    const bonusPool = enemy.isBoss
      ? ['chay_mau_trao', 'dien_giat_loi', 'ho_the_yeu_giap', 'yeu_than_toc', 'huyet_sat_hoi_phuc', 'am_sat_suy_yeu']
      : enemy.isElite
        ? ['chay_mau_trao', 'dien_giat_loi', 'ho_the_yeu_giap', 'huyet_sat_hoi_phuc', 'am_sat_suy_yeu']
        : ['chay_mau_trao', 'dien_giat_loi', 'ho_the_yeu_giap', 'yeu_than_toc'];

    const pool = Array.from(new Set([...baseList, ...bonusPool])).filter(k => allSkills[k]);
    const activeIds = new Set((enemy.statuses || []).map(st => st.id));

    // Nếu máu dưới 55% và có chiêu hồi phục -> 35% cơ hội tự hồi máu
    if (enemy.currentHp / Math.max(1, enemy.maxHp) < 0.55 && pool.includes('huyet_sat_hoi_phuc') && Math.random() < 0.35) {
      return allSkills.huyet_sat_hoi_phuc;
    }

    // Lọc bỏ buff nếu quái đã có sẵn buff đó để tránh lãng phí lượt
    const candidates = pool.filter(k => {
      const sk = allSkills[k];
      if (sk.loai === 'buff' && sk.hieuUng && sk.hieuUng[0] && activeIds.has(sk.hieuUng[0].id)) {
        return false;
      }
      if (sk.loai === 'hoi_phuc' && enemy.currentHp / Math.max(1, enemy.maxHp) > 0.78) {
        return false;
      }
      return true;
    });

    const finalPool = candidates.length ? candidates : baseList;
    const pickedKey = finalPool[Math.floor(Math.random() * finalPool.length)];
    return allSkills[pickedKey] || allSkills.can_xe;
  },

  pickPlayerAutoAction(combatState) {
    const Combat = window.TuTien.Combat;
    const Status = window.TuTien.Status;
    const p = combatState.player;
    const e = combatState.enemy;
    const equipped = combatState.skills || [];

    // 1. Máu dưới 30% -> ưu tiên chiêu hồi phục hoặc phòng thủ
    if (p.currentHp / p.maxHp < 0.30) {
      const healSkill = equipped.find(sk => sk && (sk.def.loaiChieu === 'hoi_phuc' || sk.def.id === 'ho_the_kim_quang') && Combat.canUseSkill(sk).ok);
      if (healSkill) return { type: 'skill', skill: healSkill };
    }

    // 2. Chiêu Buff chưa có hiệu lực và đủ điều kiện (không mất lượt)
    const readyBuff = equipped.find(sk => {
      if (!sk || sk.def.loaiChieu !== 'buff') return false;
      if (!Combat.canUseSkill(sk).ok) return false;
      const firstEff = sk.def.hieuUng && sk.def.hieuUng[0];
      if (firstEff && p.statuses.some(st => st.id === firstEff.id)) return false;
      return true;
    });
    if (readyBuff) return { type: 'skill', skill: readyBuff };

    // 3. Chiêu tấn công hệ khắc chế quái
    const advSkill = equipped.find(sk => {
      if (!sk || (sk.def.loaiChieu !== 'tan_cong' && sk.def.loaiChieu !== 'hieu_ung')) return false;
      if (!Combat.canUseSkill(sk).ok) return false;
      return Status.getElementMultiplier(sk.def.he, e.he).mult > 1.0;
    });
    if (advSkill) return { type: 'skill', skill: advSkill };

    // 4. Chiêu tấn công mạnh nhất còn dùng được
    let bestAtk = null;
    equipped.forEach(sk => {
      if (!sk || (sk.def.loaiChieu !== 'tan_cong' && sk.def.loaiChieu !== 'hieu_ung')) return;
      if (!Combat.canUseSkill(sk).ok) return;
      if (!bestAtk || (sk.def.heSoSatThuong || 0) > (bestAtk.def.heSoSatThuong || 0)) {
        bestAtk = sk;
      }
    });
    if (bestAtk) return { type: 'skill', skill: bestAtk };

    // 5. Cuối cùng: Phổ Công (miễn phí & hồi MP)
    return { type: 'basic' };
  }
};
