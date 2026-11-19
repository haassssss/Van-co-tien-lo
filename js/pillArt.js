/**
 * js/pillArt.js
 * Vẽ Viên Đan Dược (kèm 0-3 vòng Đan Vân & khói đan) và Đan Lô bằng 100% SVG code.
 */
window.TuTien = window.TuTien || {};

window.TuTien.PillArt = {
  renderPillSVG(color = '#4ade80', danVan = 0, grade = 1, size = 86) {
    const vanRings = [];
    for (let i = 1; i <= Math.min(3, danVan); i++) {
      const r = 24 + i * 5;
      vanRings.push(
        `<ellipse cx="50" cy="54" rx="${r}" ry="${Math.round(r * 0.42)}" fill="none" stroke="#fde047" stroke-width="1.8" stroke-dasharray="6 3" opacity="${0.92 - i * 0.14}" transform="rotate(${i * 22 - 30} 50 54)"/>`
      );
    }
    const smoke = `
      <path d="M38,24 Q34,14 42,8 M50,20 Q56,10 48,4 M62,24 Q66,14 58,8" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
    `;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="pill-svg-art">
        ${smoke}
        <circle cx="50" cy="54" r="24" fill="${color}" stroke="#fff8e1" stroke-width="2"/>
        <circle cx="42" cy="46" r="7" fill="#ffffff" opacity="0.45"/>
        <circle cx="50" cy="54" r="19" fill="none" stroke="#18120d" stroke-width="1" opacity="0.35"/>
        ${vanRings.join('')}
        ${grade >= 7 ? `<polygon points="50,24 53,31 47,31" fill="#fef08a"/>` : ''}
      </svg>
    `;
  },

  renderCauldronSVG(color = '#4ade80', active = false) {
    return `
      <svg viewBox="0 0 180 145" class="furnace-svg">
        <!-- Khói đan bốc lên -->
        <path d="M72,38 Q66,20 78,10 M90,34 Q98,16 88,6 M108,38 Q114,20 102,10" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="${active ? 0.85 : 0.4}"/>
        <!-- Thân Đan Lô đồng cổ -->
        <path d="M40,56 Q34,108 90,112 Q146,108 140,56 Z" fill="#2c241d" stroke="#d4af37" stroke-width="2.5"/>
        <ellipse cx="90" cy="56" rx="50" ry="11" fill="#18120d" stroke="#facc15" stroke-width="2.2"/>
        <!-- Quai Đan Lô -->
        <path d="M36,64 C20,54 20,86 38,84 M144,64 C160,54 160,86 142,84" fill="none" stroke="#d4af37" stroke-width="3.5"/>
        <!-- Vòng bát quái giữa thân lò -->
        <circle cx="90" cy="84" r="15" fill="#18120d" stroke="${color}" stroke-width="2"/>
        <circle cx="90" cy="84" r="6" fill="${color}" opacity="0.85"/>
        <!-- 3 chân đỉnh + lửa đan dưới đáy -->
        <line x1="56" y1="106" x2="48" y2="132" stroke="#b08d57" stroke-width="6" stroke-linecap="round"/>
        <line x1="90" y1="112" x2="90" y2="136" stroke="#b08d57" stroke-width="6" stroke-linecap="round"/>
        <line x1="124" y1="106" x2="132" y2="132" stroke="#b08d57" stroke-width="6" stroke-linecap="round"/>
        <path d="M90,112 C102,122 104,132 90,136 C76,132 78,122 90,112 Z" fill="${active ? '#f97316' : '#854d0e'}" opacity="0.9"/>
      </svg>
    `;
  }
};
