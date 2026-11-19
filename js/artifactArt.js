/**
 * js/artifactArt.js
 * Vẽ hoàn toàn bằng SVG code cho 10 hình dáng Pháp Bảo (đổi màu theo hệ chiếm ưu thế,
 * thêm vòng hào quang theo phẩm giai) và Lò Rèn đá có ngọn lửa đổi màu theo hệ & nhiệt độ.
 */
window.TuTien = window.TuTien || {};

window.TuTien.ArtifactArt = {
  getElementPalette(elementId) {
    const meta = window.TuTien.ELEMENT_META || {};
    return meta[elementId] || { color: '#facc15', flame: '#f97316', name: 'Kim' };
  },

  getGradeMeta(tier) {
    const grades = window.TuTien.FORGE_GRADES || [];
    return grades.find(g => g.tier === tier) || { tier: 1, name: 'Phàm Phẩm', color: '#cbd5e1', glow: 'rgba(203,213,225,0.4)' };
  },

  /**
   * Vẽ Pháp Bảo bằng SVG theo hình dáng (shape), hệ chủ đạo (element), phẩm giai (tier)
   */
  renderArtifactSVG(shape, elementId = 'kim', tier = 1, size = 96, isSilhouette = false) {
    const el = this.getElementPalette(elementId);
    const grade = this.getGradeMeta(tier);
    const mainFill = isSilhouette ? '#1e1711' : el.color;
    const strokeCol = isSilhouette ? '#94826b' : '#fff8e1';
    const auraOpacity = isSilhouette ? 0 : Math.min(0.85, 0.12 + (tier - 1) * 0.18);

    const auraRings = !isSilhouette && tier >= 2
      ? `
        <circle cx="50" cy="50" r="42" fill="none" stroke="${grade.color}" stroke-width="${tier >= 4 ? 2.2 : 1.3}" stroke-dasharray="${tier >= 4 ? '6 3' : '4 4'}" opacity="${auraOpacity}" />
        ${tier >= 4 ? `<circle cx="50" cy="50" r="35" fill="${grade.glow}" opacity="0.22" />` : ''}
        ${tier >= 5 ? `<polygon points="50,4 54,14 46,14" fill="#fef08a"/><polygon points="50,96 54,86 46,86" fill="#fef08a"/><polygon points="4,50 14,54 14,46" fill="#fef08a"/><polygon points="96,50 86,54 86,46" fill="#fef08a"/>` : ''}
      `
      : '';

    const shapes = {
      cham: `
        <line x1="28" y1="74" x2="74" y2="26" stroke="${mainFill}" stroke-width="5" stroke-linecap="round"/>
        <polygon points="78,22 65,28 72,35" fill="${strokeCol}"/>
        <circle cx="28" cy="74" r="5" fill="${strokeCol}" stroke="${mainFill}" stroke-width="2"/>
      `,
      dao: `
        <path d="M26,74 L40,60 C55,48 68,36 78,20 C68,26 54,32 42,44 L34,54 Z" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2"/>
        <line x1="22" y1="78" x2="36" y2="64" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
      `,
      kiem: `
        <polygon points="50,12 56,64 50,70 44,64" fill="${mainFill}" stroke="${strokeCol}" stroke-width="1.8"/>
        <line x1="50" y1="18" x2="50" y2="62" stroke="${strokeCol}" stroke-width="1.2" opacity="0.7"/>
        <rect x="34" y="64" width="32" height="5" rx="2" fill="#d4af37" stroke="${strokeCol}" stroke-width="1"/>
        <rect x="47" y="69" width="6" height="16" rx="2" fill="#6b4f2a"/>
        <circle cx="50" cy="87" r="4" fill="${mainFill}" stroke="#d4af37" stroke-width="1.5"/>
      `,
      cu_kiem: `
        <polygon points="50,8 62,26 60,64 50,72 40,64 38,26" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2.2"/>
        <polygon points="50,16 54,28 50,62 46,28" fill="${strokeCol}" opacity="0.45"/>
        <polygon points="28,62 72,62 66,70 34,70" fill="#d4af37" stroke="${strokeCol}" stroke-width="1.2"/>
        <rect x="46" y="70" width="8" height="18" rx="2" fill="#5c3a1e"/>
        <circle cx="50" cy="90" r="5" fill="${mainFill}" stroke="#fef08a" stroke-width="1.8"/>
      `,
      dinh: `
        <path d="M26,38 Q26,72 50,72 Q74,72 74,38 Z" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2"/>
        <ellipse cx="50" cy="38" rx="25" ry="7" fill="#2b2118" stroke="${strokeCol}" stroke-width="2"/>
        <path d="M22,36 C16,24 28,22 29,34 M78,36 C84,24 72,22 71,34" fill="none" stroke="#d4af37" stroke-width="3.2"/>
        <line x1="34" y1="68" x2="29" y2="85" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
        <line x1="50" y1="72" x2="50" y2="87" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
        <line x1="66" y1="68" x2="71" y2="85" stroke="#d4af37" stroke-width="5" stroke-linecap="round"/>
      `,
      chuong: `
        <path d="M50,18 C34,18 28,44 22,72 L78,72 C72,44 66,18 50,18 Z" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2"/>
        <ellipse cx="50" cy="72" rx="28" ry="6" fill="#2b2118" stroke="#d4af37" stroke-width="2"/>
        <circle cx="50" cy="14" r="5" fill="none" stroke="#d4af37" stroke-width="3"/>
        <circle cx="50" cy="48" r="7" fill="none" stroke="${strokeCol}" stroke-width="1.6"/>
      `,
      an: `
        <polygon points="24,52 76,52 82,76 18,76" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2"/>
        <polygon points="32,34 68,34 74,52 26,52" fill="${mainFill}" opacity="0.82" stroke="${strokeCol}" stroke-width="1.6"/>
        <circle cx="50" cy="28" r="9" fill="#d4af37" stroke="${strokeCol}" stroke-width="1.6"/>
        <rect x="34" y="60" width="32" height="8" rx="2" fill="#241911" opacity="0.55"/>
      `,
      giap: `
        <path d="M30,22 L42,18 L50,26 L58,18 L70,22 L80,38 L68,46 L65,80 L35,80 L32,46 L20,38 Z" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2"/>
        <polygon points="50,32 59,46 50,62 41,46" fill="#241911" stroke="#d4af37" stroke-width="1.8"/>
      `,
      phu_boi: `
        <circle cx="50" cy="50" r="24" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2.2"/>
        <circle cx="50" cy="50" r="9" fill="#18120d" stroke="#d4af37" stroke-width="2"/>
        <line x1="50" y1="12" x2="50" y2="26" stroke="#d4af37" stroke-width="3"/>
        <path d="M44,74 L40,88 M50,74 L50,90 M56,74 L60,88" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>
      `,
      phien: `
        <path d="M50,78 L16,38 A42,42 0 0,1 84,38 Z" fill="${mainFill}" stroke="${strokeCol}" stroke-width="2"/>
        <line x1="50" y1="78" x2="32" y2="30" stroke="${strokeCol}" stroke-width="1.2" opacity="0.7"/>
        <line x1="50" y1="78" x2="50" y2="24" stroke="${strokeCol}" stroke-width="1.2" opacity="0.7"/>
        <line x1="50" y1="78" x2="68" y2="30" stroke="${strokeCol}" stroke-width="1.2" opacity="0.7"/>
        <circle cx="50" cy="78" r="4" fill="#d4af37"/>
      `
    };

    const art = shapes[shape] || shapes.kiem;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="artifact-svg-art">
        ${auraRings}
        ${art}
      </svg>
    `;
  },

  /**
   * Vẽ Lò Rèn Đá bằng SVG có ngọn lửa đổi màu theo hệ linh tài chiếm ưu thế & độ nóng
   */
  renderFurnaceSVG(elementId = 'hoa', heatPct = 50, isForging = false) {
    const el = this.getElementPalette(elementId);
    const flameScale = isForging ? 0.65 + (heatPct / 100) * 0.75 : 0.75;
    const flameColor = el.flame || '#f97316';
    const coreColor = '#fef08a';

    return `
      <svg viewBox="0 0 180 155" class="furnace-svg">
        <!-- Thân lò đá cổ phong -->
        <path d="M34,62 L146,62 L158,136 L22,136 Z" fill="#2c221b" stroke="#b08d57" stroke-width="2.5"/>
        <ellipse cx="90" cy="62" rx="56" ry="12" fill="#1a130e" stroke="#d4af37" stroke-width="2.5"/>
        <!-- Hoa văn cổ trên lò -->
        <path d="M46,84 L134,84 M50,92 L130,92" stroke="#856230" stroke-width="1.6" stroke-dasharray="6 4"/>
        <!-- Cửa lò lửa -->
        <path d="M62,136 L62,106 A28,24 0 0,1 118,106 L118,136 Z" fill="#120c08" stroke="#d4af37" stroke-width="2"/>
        <!-- Ngọn lửa trong cửa lò -->
        <g transform="translate(90,134) scale(${flameScale.toFixed(2)}) translate(-90,-134)">
          <path d="M90,94 C104,108 110,122 104,135 L76,135 C70,122 76,108 90,94 Z" fill="${flameColor}" opacity="0.92"/>
          <path d="M90,106 C98,116 101,126 97,135 L83,135 C79,126 82,116 90,106 Z" fill="${coreColor}"/>
        </g>
        <!-- Ngọn lửa bùng trên miệng lò -->
        <g transform="translate(90,62) scale(${flameScale.toFixed(2)}) translate(-90,-62)">
          <path d="M90,18 C108,36 116,52 108,62 L72,62 C64,52 72,36 90,18 Z" fill="${flameColor}" opacity="0.82"/>
          <path d="M90,32 C100,44 103,54 98,62 L82,62 C77,54 80,44 90,32 Z" fill="${coreColor}" opacity="0.95"/>
        </g>
        <!-- Chân lò -->
        <rect x="30" y="136" width="18" height="12" rx="3" fill="#3d2e22" stroke="#856230" stroke-width="1.5"/>
        <rect x="132" y="136" width="18" height="12" rx="3" fill="#3d2e22" stroke="#856230" stroke-width="1.5"/>
      </svg>
    `;
  }
};
