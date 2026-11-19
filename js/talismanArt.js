/**
 * js/talismanArt.js
 * Vẽ lá Phù Văn và các nét Họa Phù phát sáng trên HTML5 Canvas.
 */
window.TuTien = window.TuTien || {};

window.TuTien.TalismanArt = {
  drawPaperBase(ctx, w, h, borderColor = '#d4af37') {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f3df9d');
    grad.addColorStop(0.5, '#e8cb7d');
    grad.addColorStop(1, '#d8b45c');
    ctx.fillStyle = grad;
    ctx.fillRect(8, 8, w - 16, h - 16);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, w - 36, h - 36);
  },

  drawTemplateStrokes(ctx, w, h, strokes, activeIdx, completedCount, accentColor = '#dc2626') {
    (strokes || []).forEach((pts, idx) => {
      if (!pts || pts.length < 2) return;
      ctx.save();
      ctx.beginPath();
      pts.forEach((p, i) => {
        const px = p[0] * w;
        const py = p[1] * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });

      if (idx < completedCount) {
        // Nét đã vẽ xong: phát sáng rực rỡ
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      } else if (idx === activeIdx) {
        // Nét đang cần vẽ: hiện rõ nét đứt phát sáng + chấm khởi đầu
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.55)';
        ctx.lineWidth = 8;
        ctx.setLineDash([8, 6]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.setLineDash([]);

        // Chấm tròn đầu nét (điểm bắt đầu kéo)
        const sp = pts[0];
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(sp[0] * w, sp[1] * h, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), sp[0] * w, sp[1] * h);
      } else {
        // Nét sắp tới: mờ nhẹ
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.22)';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      ctx.restore();
    });
  },

  drawUserPath(ctx, pathPts, color = '#b91c1c') {
    if (!pathPts || pathPts.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pathPts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.restore();
  }
};
