/**
 * js/combat.js
 * Engine Chiến Đấu Theo Lượt kiểu Pokémon:
 * - Chiêu BUFF & HỒI PHỤC KHÔNG MẤT LƯỢT (có hồi chiêu, tốn MP, bị chặn bởi Trói Buộc).
 * - Chỉ chiêu TẤN CÔNG / HỆ HIỆU ỨNG / PHỔ CÔNG mới kết thúc lượt người chơi.
 * - Sát thương tính theo công thức cố định trong config.js (không ngẫu nhiên trừ khi bật randomEnabled).
 * - Thân Pháp (tốc độ) + thuộc tính ưu tiên quyết định ai đánh trước (hòa thì người chơi đánh trước).
 * - Thanh thông báo chiêu thức xếp hàng tuần tự cho cả người chơi và quái.
 * - Thua trận (hết máu): mất 10% Linh Khí & đợi 3 phút hồi sinh (không vào Bí Cảnh hay đánh quái trong lúc này).
 */
window.TuTien = window.TuTien || {};

window.TuTien.Combat = {
  state: null,
  autoBattle: false,
  autoTimer: null,
  bannerQueue: [],
  activeBanner: null,
  bannerTimer: null,

  isActive() {
    return !!(this.state && !this.state.closed);
  },

  startBattle(monsterDef, onFinishCb = null) {
    this.clearTimers();
    const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2) || {};
    const cStats = window.TuTien.Character
      ? window.TuTien.Character.getCombatStats()
      : { maxHp: 100, maxMp: 100, speed: 10, attack: 10 };
    const passives = window.TuTien.Loadout ? window.TuTien.Loadout.getActivePassiveBonuses() : { atkPct: 0, defPct: 0, spdPct: 0, hpPct: 0, statusResist: 0, mpRegenPct: 0, elemDmg: {} };

    const pMaxHp = Math.round(cStats.maxHp * (1 + (passives.hpPct || 0)));
    const pMaxMp = cStats.maxMp;
    const pDef = Math.round((20 + ((window.TuTien.State.data.realmIndex || 0) * 4.5)) * (1 + (passives.defPct || 0)));
    const pAtk = Math.round(cStats.attack * (1 + (passives.atkPct || 0)));
    const pSpd = Math.round(cStats.speed * (1 + (passives.spdPct || 0)));

    const expHp = window.TuTien.Expedition && window.TuTien.Expedition.playerCurrentHp;
    const expMp = window.TuTien.Expedition && window.TuTien.Expedition.playerCurrentMp;
    const startHp = expHp > 0 ? Math.min(pMaxHp, expHp) : pMaxHp;
    const startMp = expMp >= 0 && expMp !== null ? Math.min(pMaxMp, expMp) : pMaxMp;

    const mStats = monsterDef.customStats
      ? {
          maxHp: Math.max(60, Math.round(monsterDef.customStats.maxHp || 120)),
          attack: Math.max(10, Math.round(monsterDef.customStats.attack || 15)),
          defense: Math.max(8, Math.round(monsterDef.customStats.defense || 15)),
          speed: Math.max(8, Math.round(monsterDef.customStats.speed || 10))
        }
      : (window.TuTien.getMonsterStatsForRealm
          ? window.TuTien.getMonsterStatsForRealm(monsterDef)
          : { maxHp: 120, attack: 15, defense: 15, speed: 10 });
    const realmObj = monsterDef.realmLabelOverride
      ? { fullName: monsterDef.realmLabelOverride }
      : ((window.TuTien.REALMS && window.TuTien.REALMS[monsterDef.canhGioiIdx || 0]) || { fullName: 'Thối Thể - Sơ Kỳ' });

    const loadoutIds = window.TuTien.Loadout ? window.TuTien.Loadout.ensureState() : [];
    const Tech = window.TuTien.Techniques;
    const skills = loadoutIds.map(id => {
      if (!id) return null;
      const def = Tech.getDef(id);
      if (!def) return null;
      const tier = Tech.getGradeTier(id) || 1;
      return { id, def, tier, gradeObj: Tech.getGradeObj(tier), cooldownLeft: 0 };
    });

    const pRealmIdx = (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.realmIndex) || 0;
    const isOverlevel = !!(monsterDef.isBoss || (monsterDef.canhGioiIdx || 0) > pRealmIdx);

    this.state = {
      closed: false,
      turn: 1,
      busy: false,
      ended: false,
      onFinishCb,
      logs: [`Chạm trán 【${monsterDef.ten}】 (${realmObj.fullName})!`],
      floatingDamages: [],
      passives,
      skills,
      player: {
        name: (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.character && window.TuTien.State.data.character.name) || 'Đạo Hữu',
        gender: window.TuTien.Character ? window.TuTien.Character.getGender() : 'male',
        he: (window.TuTien.State && window.TuTien.State.data && window.TuTien.State.data.prestige && window.TuTien.State.data.prestige.rootId) || 'kim',
        maxHp: pMaxHp,
        currentHp: startHp,
        maxMp: pMaxMp,
        currentMp: startMp,
        attack: pAtk,
        defense: pDef,
        speed: pSpd,
        statusResist: passives.statusResist || 0,
        statuses: [],
        freezeImmunityTurns: 0
      },
      enemy: {
        def: monsterDef,
        name: monsterDef.ten,
        realmName: realmObj.fullName,
        he: monsterDef.he || 'kim',
        svgKey: monsterDef.svgKey || 'wolf',
        entityType: monsterDef.entityType || (monsterDef.isBoss ? 'boss' : 'monster'),
        isBoss: !!monsterDef.isBoss,
        isElite: !!monsterDef.isElite,
        maxHp: mStats.maxHp,
        currentHp: mStats.maxHp,
        attack: mStats.attack,
        defense: mStats.defense,
        speed: mStats.speed,
        statusResist: monsterDef.khangHieuUng || 0,
        chieu: monsterDef.chieu || ['can_xe'],
        statuses: [],
        freezeImmunityTurns: 0
      }
    };

    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToCombatBgm(isOverlevel);
    }
    if (window.TuTien.CombatUI) {
      window.TuTien.CombatUI.open();
    }
    if (this.autoBattle) {
      this.scheduleAutoAction();
    }
  },

  clearTimers() {
    if (this.autoTimer) { clearTimeout(this.autoTimer); this.autoTimer = null; }
    if (this.bannerTimer) { clearTimeout(this.bannerTimer); this.bannerTimer = null; }
    this.bannerQueue = [];
    this.activeBanner = null;
  },

  pushBanner(text, elemId = 'kim', icon = '⚔️') {
    const elMeta = (window.TuTien.COMBAT_ELEMENTS && window.TuTien.COMBAT_ELEMENTS[elemId]) || { color: '#fde047' };
    this.bannerQueue.push({ text, color: elMeta.color, icon });
    if (!this.activeBanner) this.drainBannerQueue();
  },

  drainBannerQueue() {
    if (!this.bannerQueue.length) {
      this.activeBanner = null;
      if (window.TuTien.CombatUI) window.TuTien.CombatUI.renderBanner();
      return;
    }
    this.activeBanner = this.bannerQueue.shift();
    if (window.TuTien.CombatUI) window.TuTien.CombatUI.renderBanner();
    this.bannerTimer = setTimeout(() => this.drainBannerQueue(), 1150);
  },

  pushFloatDamage(targetSide, text, isAdvantage = false, isHeal = false) {
    if (!this.state) return;
    const item = { id: Date.now() + Math.random(), targetSide, text, isAdvantage, isHeal };
    this.state.floatingDamages.push(item);
    setTimeout(() => {
      if (!this.state) return;
      this.state.floatingDamages = this.state.floatingDamages.filter(x => x.id !== item.id);
      if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
    }, 900);
  },

  canUseSkill(sk) {
    if (!this.state || !sk || this.state.busy || this.state.ended) return { ok: false, reason: 'Đang chờ' };
    const p = this.state.player;
    const isBuffKind = sk.def.loaiChieu === 'buff' || sk.def.loaiChieu === 'hoi_phuc';
    if (isBuffKind && window.TuTien.Status.hasFlag(p, 'blockBuff')) {
      return { ok: false, reason: 'Bị Trói Buộc' };
    }
    if (sk.cooldownLeft > 0) {
      return { ok: false, reason: `Hồi ${sk.cooldownLeft} hiệp` };
    }
    const useInfo = window.TuTien.Techniques ? window.TuTien.Techniques.getUsability(sk.id) : { canUse: true, powerMult: 1, status: 'full' };
    if (!useInfo.canUse) {
      return { ok: false, reason: '🔒 Cảnh giới quá thấp' };
    }
    if (p.currentMp < sk.def.chiPhiLinhLuc) {
      return { ok: false, reason: 'Thiếu Linh Lực' };
    }
    return { ok: true, reason: useInfo.status === 'weakened' ? '⚠️ 15% uy lực' : '', powerMult: useInfo.powerMult };
  },

  computeDeterministicDamage(attacker, defender, skillMult, atkElem, isAutoPlayer = false, isKetLieu = false) {
    const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2) || {};
    const Status = window.TuTien.Status;
    const aMod = Status.getStatModifiers(attacker);
    const dMod = Status.getStatModifiers(defender);

    const effAtk = attacker.attack * aMod.atkMult;
    const effDef = Math.max(0, defender.defense * dMod.defMult);
    const elemInfo = Status.getElementMultiplier(atkElem, defender.he);

    let elemBonus = 1.0;
    if (attacker === this.state.player && this.state.passives && this.state.passives.elemDmg[atkElem]) {
      elemBonus += this.state.passives.elemDmg[atkElem];
    }

    let finishBonus = 1.0;
    if (isKetLieu && defender.currentHp / defender.maxHp <= 0.40) {
      finishBonus = 1.80;
    }

    const autoScale = isAutoPlayer ? (cfg.autoDamageMult || 0.90) : 1.0;
    const variance = cfg.randomEnabled ? (0.94 + Math.random() * 0.12) : 1.0;
    const raw = effAtk * skillMult * elemInfo.mult * elemBonus * finishBonus * autoScale * variance * ((cfg.defenseDivisor || 100) / ((cfg.defenseDivisor || 100) + effDef));

    return {
      damage: Math.max(1, Math.round(raw)),
      elemLabel: elemInfo.label,
      isAdvantage: elemInfo.mult > 1.0
    };
  },

  /**
   * Người chơi chọn chiêu:
   * - Nếu là BUFF / HỒI PHỤC -> thực thi NGAY, KHÔNG MẤT LƯỢT!
   * - Nếu là TẤN CÔNG / HỆ HIỆU ỨNG / PHỔ CÔNG -> giải quyết cả hiệp (so tốc độ + ưu tiên).
   */
  playerChooseAction(actionType, skillObj = null) {
    if (!this.state || this.state.busy || this.state.ended) return;
    const s = this.state;
    const p = s.player;
    const e = s.enemy;
    const Status = window.TuTien.Status;
    const Utils = window.TuTien.Utils;

    if (actionType === 'flee') {
      if (Status.hasFlag(p, 'blockFlee')) {
        if (window.TuTien.UI) window.TuTien.UI.showToast('⛓️ Bạn đang bị Xích Khóa, không thể Rút Lui!', 'warn');
        return;
      }
      this.endBattle('flee');
      return;
    }

    // Nếu người chơi bị Đóng Băng -> mất lượt hiệp này, quái hành động luôn
    if (Status.hasFlag(p, 'skipTurn')) {
      s.busy = true;
      s.logs.push(`❄️ ${p.name} bị Đóng Băng, mất lượt hiệp ${s.turn}!`);
      this.pushBanner(`${p.name} bị Đóng Băng!`, 'bang', '❄️');
      setTimeout(() => this.runMonsterTurnThenEndRound(), 550);
      if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
      return;
    }

    // CHIÊU BUFF / HỒI PHỤC: KHÔNG MẤT LƯỢT!
    if (actionType === 'skill' && skillObj && (skillObj.def.loaiChieu === 'buff' || skillObj.def.loaiChieu === 'hoi_phuc')) {
      const chk = this.canUseSkill(skillObj);
      if (!chk.ok) return;

      p.currentMp -= skillObj.def.chiPhiLinhLuc;
      skillObj.cooldownLeft = skillObj.def.hoiChieu || 0;
      this.pushBanner(`${p.name} dùng 【${skillObj.def.ten}】 (Không mất lượt)`, skillObj.def.he, '✨');

      if (skillObj.def.giaiTru) {
        const removed = Status.cleanseHarmful(p);
        if (removed > 0) s.logs.push(`✨ Giải trừ ${removed} hiệu ứng bất lợi!`);
      }
      if (skillObj.def.healPct) {
        const pMult = chk.powerMult || 1;
        const healAmt = Math.max(1, Math.round(p.maxHp * skillObj.def.healPct * (0.85 + skillObj.gradeObj.mult * 0.15) * pMult));
        p.currentHp = Math.min(p.maxHp, p.currentHp + healAmt);
        this.pushFloatDamage('player', `+${Utils.formatNumber(healAmt)}`, false, true);
        s.logs.push(`💚 ${p.name} dùng 【${skillObj.def.ten}】 hồi +${Utils.formatNumber(healAmt)} HP (Không mất lượt).`);
      }
      (skillObj.def.hieuUng || []).forEach(ef => {
        Status.applyEffect(p, ef.id, ef.soHiep, ef.tiLeHieuUng);
        const edef = Status.getDef(ef.id);
        if (edef) s.logs.push(`${edef.icon} ${p.name} nhận 【${edef.ten}】 (${ef.soHiep} hiệp — Không mất lượt).`);
      });

      if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
      if (this.autoBattle) this.scheduleAutoAction();
      return;
    }

    // CHIÊU TẤN CÔNG / PHỔ CÔNG -> KẾT THÚC LƯỢT NGƯỜI CHƠI
    if (actionType === 'skill' && skillObj) {
      const chk = this.canUseSkill(skillObj);
      if (!chk.ok) return;
    }

    s.busy = true;
    const pMod = Status.getStatModifiers(p);
    const eMod = Status.getStatModifiers(e);
    const playerPriority = !!(actionType === 'skill' && skillObj && skillObj.def.uuTien);
    const playerFaster = playerPriority || (p.speed * pMod.spdMult >= e.speed * eMod.spdMult);

    const execPlayerStrike = () => {
      const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2) || {};
      if (actionType === 'basic') {
        const gainMp = Math.max(8, Math.round(p.maxMp * (cfg.basicAttackMpRegenPct || 0.14)));
        p.currentMp = Math.min(p.maxMp, p.currentMp + gainMp);
        const dmgRes = this.computeDeterministicDamage(p, e, 1.0, p.he, this.autoBattle, false);
        e.currentHp = Math.max(0, e.currentHp - dmgRes.damage);
        this.pushBanner(`${p.name} dùng 【Phổ Công】`, p.he, '⚔️');
        this.pushFloatDamage('enemy', `-${Utils.formatNumber(dmgRes.damage)}${dmgRes.elemLabel ? ' ' + dmgRes.elemLabel : ''}`, dmgRes.isAdvantage);
        s.logs.push(`⚔️ ${p.name} dùng Phổ Công gây -${Utils.formatNumber(dmgRes.damage)} HP (+${Utils.formatNumber(gainMp)} MP).`);
      } else if (skillObj) {
        const useChk = this.canUseSkill(skillObj);
        const pMult = (useChk && useChk.powerMult) || 1;
        p.currentMp -= skillObj.def.chiPhiLinhLuc;
        skillObj.cooldownLeft = skillObj.def.hoiChieu || 0;
        const mult = (skillObj.def.heSoSatThuong || 1.2) * skillObj.gradeObj.mult * pMult;
        const dmgRes = this.computeDeterministicDamage(p, e, mult, skillObj.def.he, this.autoBattle, !!skillObj.def.ketLieu);
        e.currentHp = Math.max(0, e.currentHp - dmgRes.damage);
        this.pushBanner(`${p.name} dùng 【${skillObj.def.ten}】`, skillObj.def.he, '💥');
        this.pushFloatDamage('enemy', `-${Utils.formatNumber(dmgRes.damage)}${dmgRes.elemLabel ? ' ' + dmgRes.elemLabel : ''}`, dmgRes.isAdvantage);
        s.logs.push(`💥 ${p.name} dùng 【${skillObj.def.ten}】 gây -${Utils.formatNumber(dmgRes.damage)} HP${dmgRes.elemLabel ? ` (${dmgRes.elemLabel})` : ''}.`);
        (skillObj.def.hieuUng || []).forEach(ef => {
          const r = Status.applyEffect(e, ef.id, ef.soHiep, ef.tiLeHieuUng);
          if (r.applied && r.def) s.logs.push(`${r.def.icon} ${e.name} dính 【${r.def.ten}】 (${ef.soHiep} hiệp)!`);
        });
      }
      if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
    };

    if (playerFaster) {
      execPlayerStrike();
      setTimeout(() => {
        if (!this.state || this.state.ended) return;
        if (e.currentHp <= 0) {
          this.endBattle('win');
        } else {
          this.runMonsterTurnThenEndRound();
        }
      }, 520);
    } else {
      this.execMonsterAction();
      setTimeout(() => {
        if (!this.state || this.state.ended) return;
        if (p.currentHp <= 0) {
          this.endBattle('lose');
        } else {
          execPlayerStrike();
          setTimeout(() => {
            if (!this.state || this.state.ended) return;
            if (e.currentHp <= 0) this.endBattle('win');
            else this.finishRound();
          }, 520);
        }
      }, 520);
    }
  },

  execMonsterAction() {
    const s = this.state;
    const p = s.player;
    const e = s.enemy;
    const Status = window.TuTien.Status;
    const Utils = window.TuTien.Utils;

    if (Status.hasFlag(e, 'skipTurn')) {
      s.logs.push(`❄️ ${e.name} bị Đóng Băng, mất lượt!`);
      this.pushBanner(`${e.name} bị Đóng Băng!`, 'bang', '❄️');
      if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
      return;
    }

    const mSkill = window.TuTien.CombatAI.pickMonsterSkill(e, s.turn);
    this.pushBanner(`${e.name} dùng 【${mSkill.ten}】`, mSkill.he || e.he, '👹');

    if (mSkill.loai === 'buff') {
      if (!Status.hasFlag(e, 'blockBuff')) {
        (mSkill.hieuUng || []).forEach(ef => Status.applyEffect(e, ef.id, ef.soHiep, ef.tiLeHieuUng));
        s.logs.push(`👹 ${e.name} dùng 【${mSkill.ten}】 tăng cường sức mạnh!`);
      } else {
        s.logs.push(`🪢 ${e.name} bị Trói Buộc nên không thể dùng 【${mSkill.ten}】!`);
      }
    } else {
      const dmgRes = this.computeDeterministicDamage(e, p, mSkill.heSo || 1.0, mSkill.he || e.he, false, false);
      p.currentHp = Math.max(0, p.currentHp - dmgRes.damage);
      this.pushFloatDamage('player', `-${Utils.formatNumber(dmgRes.damage)}${dmgRes.elemLabel ? ' ' + dmgRes.elemLabel : ''}`, dmgRes.isAdvantage);
      s.logs.push(`👹 ${e.name} dùng 【${mSkill.ten}】 gây -${Utils.formatNumber(dmgRes.damage)} HP.`);
      (mSkill.hieuUng || []).forEach(ef => {
        const r = Status.applyEffect(p, ef.id, ef.soHiep, ef.tiLeHieuUng);
        if (r.applied && r.def) s.logs.push(`${r.def.icon} Bạn dính 【${r.def.ten}】 (${ef.soHiep} hiệp)!`);
      });
    }
    if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
  },

  runMonsterTurnThenEndRound() {
    if (!this.state || this.state.ended) return;
    this.execMonsterAction();
    setTimeout(() => {
      if (!this.state || this.state.ended) return;
      if (this.state.player.currentHp <= 0) this.endBattle('lose');
      else this.finishRound();
    }, 520);
  },

  finishRound() {
    const s = this.state;
    if (!s || s.ended) return;
    const Status = window.TuTien.Status;
    const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2) || {};

    // Xử lý sát thương theo hiệp & giảm lượt trạng thái
    s.logs.push(...Status.processEndOfTurn(s.player));
    s.logs.push(...Status.processEndOfTurn(s.enemy));

    if (s.enemy.currentHp <= 0) { this.endBattle('win'); return; }
    if (s.player.currentHp <= 0) { this.endBattle('lose'); return; }

    // Giảm hồi chiêu 4 ô Chiến Kỹ & hồi 8% (+ buff bị động) Linh Lực mỗi hiệp
    s.skills.forEach(sk => { if (sk && sk.cooldownLeft > 0) sk.cooldownLeft -= 1; });
    const regenPct = (cfg.mpRegenPerTurnPct || 0.08) + ((s.passives && s.passives.mpRegenPct) || 0);
    const mpGain = Math.max(5, Math.round(s.player.maxMp * regenPct));
    s.player.currentMp = Math.min(s.player.maxMp, s.player.currentMp + mpGain);

    s.turn += 1;
    s.busy = false;
    if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
    if (this.autoBattle) this.scheduleAutoAction();
  },

  scheduleAutoAction() {
    if (this.autoTimer) clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => {
      if (!this.state || this.state.ended || this.state.busy || !this.autoBattle) return;
      const pick = window.TuTien.CombatAI.pickPlayerAutoAction(this.state);
      if (pick.type === 'skill') this.playerChooseAction('skill', pick.skill);
      else this.playerChooseAction('basic');
    }, 420);
  },

  endBattle(outcome) {
    if (!this.state || this.state.ended) return;
    const s = this.state;
    s.ended = true;
    s.busy = true;
    if (this.autoTimer) { clearTimeout(this.autoTimer); this.autoTimer = null; }

    const cfg = (window.TuTien.CONFIG && window.TuTien.CONFIG.combatV2) || {};
    const State = window.TuTien.State;
    const Utils = window.TuTien.Utils;

    // Đồng bộ HP/MP ra Expedition
    if (window.TuTien.Expedition) {
      window.TuTien.Expedition.playerCurrentHp = Math.max(0, s.player.currentHp);
      window.TuTien.Expedition.playerCurrentMp = Math.max(0, s.player.currentMp);
    }

    let summary = '';
    if (outcome === 'win') {
      const mDef = s.enemy.def;
      const qiGain = Math.max(40, Math.round(((window.TuTien.REALMS[mDef.canhGioiIdx || 0] || { qiRequired: 120 }).qiRequired || 120) * (mDef.isBoss ? 0.35 : mDef.isElite ? 0.14 : 0.06)));
      if (State && State.data) {
        State.data.qi += qiGain;
        State.data.totalQiEarned += qiGain;
      }

      const lootParts = [`✨ +${Utils.formatNumber(qiGain)} Linh Khí`];
      // Vị diện càng cao, số lượng & tỉ lệ rơi đồ hiếm / công pháp càng lớn!
      const planeIdx = Math.max(0, (window.TuTien.PLANES || []).findIndex(pl => pl.id === mDef.viDien));
      const planeLootMult = [1, 1.6, 2.5, 4.0][planeIdx] || 1;

      // Thưởng nguyên liệu rèn / linh phù theo cấp Vị Diện
      (mDef.phanThuong || []).forEach(matId => {
        const baseQty = mDef.isBoss ? 4 : mDef.isElite ? 2 : 1;
        const qty = Math.max(1, Math.round(baseQty * planeLootMult));
        if (window.TuTien.Forge && window.TuTien.Forge.getMaterialDef(matId)) {
          window.TuTien.Forge.addMaterialQty(matId, qty);
          const md = window.TuTien.Forge.getMaterialDef(matId);
          lootParts.push(`${md.icon} ${md.name} ×${qty}`);
        } else if (window.TuTien.Talisman && window.TuTien.Talisman.getMatDef(matId)) {
          window.TuTien.Talisman.addMatQty(matId, qty);
          const td = window.TuTien.Talisman.getMatDef(matId);
          lootParts.push(`${td.icon} ${td.name} ×${qty}`);
        }
      });

      // Rơi Linh Thạch theo hạng của Vị Diện hiện tại (cấu hình trong config.js)
      const planeDrops = window.TuTien.CONFIG && window.TuTien.CONFIG.shop && window.TuTien.CONFIG.shop.planeSpiritStoneDrops;
      if (planeDrops && window.TuTien.Inventory) {
        const pDrop = planeDrops[mDef.viDien] || planeDrops.tan_thu_gioi;
        const triple = mDef.isBoss ? pDrop.boss : mDef.isElite ? pDrop.elite : pDrop.mob;
        if (Array.isArray(triple)) {
          const [dLow, dMid, dHigh] = triple;
          const totalDropLow = (dLow || 0) + (dMid || 0) * 100 + (dHigh || 0) * 10000;
          if (totalDropLow > 0) {
            window.TuTien.Inventory.addSpiritStones(dLow || 0, dMid || 0, dHigh || 0);
            lootParts.push(`💎 +${window.TuTien.Inventory.formatSpiritStoneCost(totalDropLow)}`);
          }
        }
      }

      // Cơ hội rơi Công Pháp Chiến Đấu chưa học (vị diện càng cao rơi phẩm chất cao hơn)
      if (!mDef.isBoss && window.TuTien.Techniques) {
        const dropChance = (mDef.isElite ? 0.35 : 0.14) + planeIdx * 0.08;
        if (Math.random() <= dropChance) {
          const maxDropTier = Math.min(6, planeIdx + 3);
          const pool = (window.TuTien.COMBAT_TECHNIQUES || []).filter(
            t => !t.id.startsWith('boss_') && (t.phamGiaiKhoiDau || 1) <= maxDropTier && !window.TuTien.Techniques.isLearned(t.id)
          );
          if (pool.length > 0) {
            const picked = pool[Math.floor(Math.random() * pool.length)];
            window.TuTien.Techniques.learnFromDrop(picked.id);
            lootParts.push(`📖 Lĩnh ngộ Công Pháp: 【${picked.ten}】`);
          }
        }
      }
      // Nếu là Boss Thế Giới -> lưu mốc hồi sinh 30 phút & rơi Công Pháp loại 'co_dinh'
      if (mDef.isBoss) {
        if (window.TuTien.Planes) window.TuTien.Planes.markBossDefeated(mDef.id);
        if (mDef.dropTechId && window.TuTien.Techniques && window.TuTien.Techniques.learnFromDrop(mDef.dropTechId)) {
          const tDef = window.TuTien.Techniques.getDef(mDef.dropTechId);
          lootParts.push(`📖 Tuyệt Học Cố Định: 【${tDef.ten}】`);
        }
      }

      summary = `🏆 Chiến thắng 【${mDef.ten}】! Nhận: ${lootParts.join(', ')}`;
      if (window.TuTien.UI) window.TuTien.UI.showToast(summary, 'success');
    } else if (outcome === 'lose') {
      const lostQi = State && State.data ? Math.floor(State.data.qi * (cfg.deathQiPenalty || 0.10)) : 0;
      if (State && State.data) {
        State.data.qi = Math.max(0, State.data.qi - lostQi);
        State.data.expeditionDeathUntil = Date.now() + (cfg.deathRespawnSec || 180) * 1000;
      }
      if (window.TuTien.Expedition) {
        window.TuTien.Expedition.playerCurrentHp = s.player.maxHp;
        window.TuTien.Expedition.playerCurrentMp = s.player.maxMp;
      }
      summary = `💀 Bạn đã tử trận trước 【${s.enemy.name}】! Tổn thất -${Utils.formatNumber(lostQi)} Linh Khí và phải chờ 3 phút hồi sinh (tạm khóa đánh quái & Bí Cảnh).`;
      if (window.TuTien.UI) window.TuTien.UI.showToast(summary, 'warn');
    } else {
      summary = `🏳️ Đã rút lui an toàn khỏi 【${s.enemy.name}】.`;
    }

    s.logs.push(summary);
    if (window.TuTien.CombatUI) window.TuTien.CombatUI.render();
    if (window.TuTien.Save) window.TuTien.Save.saveToLocal();

    setTimeout(() => {
      if (window.TuTien.Audio) window.TuTien.Audio.switchToTrainingBgm();
      if (window.TuTien.CombatUI) window.TuTien.CombatUI.close();
      const cb = s.onFinishCb;
      s.closed = true;
      this.state = null;
      if (typeof cb === 'function') cb(outcome, summary);
    }, outcome === 'flee' ? 200 : 900);
  }
};
