/**
 * js/expedition.js
 * Hệ thống "🗡️ Bí Cảnh Hồng Hoang" — Bản Đồ Pixel-Art 2000×2000 & Màn Hình Chiến Đấu Tu Tiên:
 * - Tích hợp trọn bộ 32 Sprite Di Chuyển 4 hướng (Lên, Xuống, Trái, Phải × 4 frame) cho cả Nam và Nữ (`assets/sprites_walk/{nam|nu}/...`).
 * - Màn hình chiến đấu Linh Đài thoáng đãng:
 *   + Chính giữa phía trên: Lệnh bài "❖ HIỆP X ❖".
 *   + Cột Trái (Người Chơi): Thanh Máu & Linh Lực của mình nằm ngay TRÊN ĐẦU nhân vật của mình.
 *   + Cột Phải (Kẻ Địch): Kẻ địch đứng trên bệ Linh Trận phía trên, Thanh Máu của địch nằm ngay DƯỚI CHÂN địch.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Expedition = {
  WORLD_W: 2000,
  WORLD_H: 2000,
  FOG_SCALE: 4,
  REVEAL_RADIUS: 255,
  REFRESH_INTERVAL_MS: 5 * 60 * 1000,

  isOpen: false,
  statsExpanded: false,
  mapSeed: Date.now(),
  tileImages: {},
  walkSpriteCache: {},
  tilesLoaded: false,

  playerX: 1000,
  playerY: 1060,
  targetX: 1000,
  targetY: 1060,
  cameraX: 0,
  cameraY: 0,
  isMoving: false,
  facingDir: 'down',
  walkFrame: 0,
  walkAnimTimerMs: 0,
  pendingNodeId: null,

  refreshRemainingMs: 5 * 60 * 1000,
  exploredPoints: [],
  nodes: [],
  merchantStock: [],
  activeView: 'map',

  inCombat: false,
  autoBattle: false,
  autoBattleTimerMs: 0,
  combatState: null,
  combatExitTimeout: null,

  overlayEl: null,
  viewportEl: null,
  worldLayerEl: null,
  terrainCanvasEl: null,
  fogCanvasEl: null,
  fogCtx: null,
  minimapCanvasEl: null,
  minimapCtx: null,
  nodesLayerEl: null,
  playerTokenEl: null,
  playerSpriteImgEl: null,
  targetMarkerEl: null,
  combatViewEl: null,
  merchantViewEl: null,

  init() {
    this.overlayEl = document.getElementById('expedition-modal-overlay');
    const closeBtn = document.getElementById('expedition-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.closeModal();
      });
    }
    if (this.overlayEl) {
      this.overlayEl.addEventListener('pointerdown', e => {
        if (e.target === this.overlayEl) {
          e.preventDefault();
          this.closeModal();
        }
      });
    }
    this.preloadTileTextures();
    this.preloadWalkSprites();
    this.generateSecretRealm(true);
  },

  /**
   * Nạp sẵn 32 frame di chuyển 4 hướng của Nam & Nữ để chuyển frame mượt mà không nhấp nháy
   */
  preloadWalkSprites() {
    if (typeof Image === 'undefined') return;
    const genders = ['nam', 'nu'];
    const dirs = ['xuong', 'len', 'trai', 'phai'];
    const frames = ['01', '02', '03', '04'];

    genders.forEach(g => {
      dirs.forEach(d => {
        frames.forEach(f => {
          const path = `assets/sprites_walk/${g}/${g}_di_${d}_${f}.png`;
          const img = new Image();
          img.src = path;
          this.walkSpriteCache[path] = img;
        });
      });
    });
  },

  /**
   * Nạp bộ Texture Pixel-Art từ `window.TuTien.MAP_TILES_DATA` (và fallback `assets/tiles/*.png`)
   */
  preloadTileTextures() {
    const dataMap = window.TuTien.MAP_TILES_DATA || {};
    const keys = [
      'grass',
      'cobble',
      'stairs',
      'cliff_left',
      'cliff_mid',
      'cliff_corner',
      'cliff_pass',
      'cliff_ridge',
      'tree',
      'grass_ice',
      'tree_ice',
      'grass_abyss',
      'tree_abyss',
      'grass_lava',
      'tree_peach',
      'water_tile'
    ];

    let loadedCount = 0;
    keys.forEach(k => {
      if (typeof Image !== 'undefined') {
        const img = new Image();
        img.onload = () => {
          loadedCount += 1;
          if (loadedCount >= keys.length) {
            this.tilesLoaded = true;
            if (this.isOpen && this.terrainCanvasEl) {
              this.drawProceduralTerrainCanvas();
            }
          }
        };
        img.src = dataMap[k] || `assets/tiles/${k}.png`;
        this.tileImages[k] = img;
      }
    });
  },

  openModal() {
    this.isOpen = true;
    if (!this.overlayEl) {
      this.overlayEl = document.getElementById('expedition-modal-overlay');
    }
    if (this.overlayEl) {
      this.overlayEl.classList.remove('hidden');
    }
    if (!this.nodes || this.nodes.length === 0) {
      this.generateSecretRealm(true);
    }
    this.renderPanel();
    setTimeout(() => {
      this.drawProceduralTerrainCanvas();
      this.initFogCanvas();
      this.updateCameraAndPlayerDOM();
      this.updateFogVisibilityForNodes();
      this.renderMinimap();
    }, 25);
  },

  closeModal() {
    this.isOpen = false;
    this.isMoving = false;
    this.pendingNodeId = null;
    if (this.combatExitTimeout) {
      clearTimeout(this.combatExitTimeout);
      this.combatExitTimeout = null;
    }
    if (this.inCombat) {
      this.inCombat = false;
      this.autoBattle = false;
      this.combatState = null;
      this.activeView = 'map';
    }
    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToTrainingBgm();
    }
    if (this.overlayEl) {
      this.overlayEl.classList.add('hidden');
    }
  },

  seededRandom(seedObj) {
    seedObj.v = (seedObj.v * 1664525 + 1013904223) % 4294967296;
    return seedObj.v / 4294967296;
  },

  /**
   * Vẽ Bản Đồ Pixel-Art 2000×2000 từ bộ Texture người chơi tải lên + vẽ bổ sung các Biome còn thiếu bằng code
   */
  drawProceduralTerrainCanvas() {
    if (!this.terrainCanvasEl) return;
    const ctx = this.terrainCanvasEl.getContext('2d');
    if (!ctx) return;

    const W = this.WORLD_W;
    const H = this.WORLD_H;
    const seed = { v: this.mapSeed || 1234567 };
    const rand = () => this.seededRandom(seed);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);

    const tGrass = this.tileImages.grass;
    const tGrassIce = this.tileImages.grass_ice || tGrass;
    const tGrassAbyss = this.tileImages.grass_abyss || tGrass;
    const tGrassLava = this.tileImages.grass_lava || tGrass;
    const tWater = this.tileImages.water_tile || tGrass;
    const tCobble = this.tileImages.cobble;
    const tStairs = this.tileImages.stairs;
    const tCliffLeft = this.tileImages.cliff_left;
    const tCliffMid = this.tileImages.cliff_mid;
    const tCliffCorner = this.tileImages.cliff_corner;
    const tCliffPass = this.tileImages.cliff_pass;
    const tCliffRidge = this.tileImages.cliff_ridge;
    const tTree = this.tileImages.tree;
    const tTreeIce = this.tileImages.tree_ice || tTree;
    const tTreeAbyss = this.tileImages.tree_abyss || tTree;
    const tTreePeach = this.tileImages.tree_peach || tTree;

    const canDrawImg = img => img && img.complete && img.naturalWidth > 0;

    // 1. LỚP NỀN TILE 64×64 TRẢI KHẮP 2000×2000 THEO 5 QUẦN XÃ ĐỊA HÌNH (BIOMES)
    const tileS = 64;
    for (let y = 0; y < H; y += tileS) {
      for (let x = 0; x < W; x += tileS) {
        const cx = x + 32;
        const cy = y + 32;
        const jitter = (rand() - 0.5) * 140;

        let chosenTile = tGrass;
        let fallbackColor = '#98c964';

        if (Math.hypot(cx - 320, cy - 320) + jitter < 620) {
          chosenTile = tGrassAbyss;
          fallbackColor = '#4c286e';
        } else if (Math.hypot(cx - 1680, cy - 320) + jitter < 620) {
          chosenTile = tGrassIce;
          fallbackColor = '#9bd4f0';
        } else if (Math.hypot(cx - 320, cy - 1680) + jitter < 620) {
          chosenTile = tGrassLava;
          fallbackColor = '#7c3424';
        } else if (Math.hypot(cx - 1680, cy - 1680) + jitter < 620) {
          const distIsland1 = Math.hypot(cx - 1560, cy - 1540);
          const distIsland2 = Math.hypot(cx - 1780, cy - 1740);
          if (distIsland1 < 180 || distIsland2 < 160) {
            chosenTile = tGrass;
            fallbackColor = '#98c964';
          } else {
            chosenTile = tWater;
            fallbackColor = '#2890b8';
          }
        }

        if (canDrawImg(chosenTile)) {
          ctx.drawImage(chosenTile, x, y, tileS, tileS);
        } else {
          ctx.fillStyle = fallbackColor;
          ctx.fillRect(x, y, tileS, tileS);
        }
      }
    }

    // 2. CON ĐƯỜNG ĐÁ CỔ & QUẢNG TRƯỜNG TRUNG TÂM BẰNG TEXTURE COBBLE
    const drawCobbleTile = (gx, gy) => {
      const tx = Math.floor(gx / tileS) * tileS;
      const ty = Math.floor(gy / tileS) * tileS;
      if (canDrawImg(tCobble)) {
        ctx.drawImage(tCobble, tx, ty, tileS, tileS);
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(tx, ty, tileS, tileS);
      }
    };

    for (let py = 896; py <= 1152; py += tileS) {
      for (let px = 896; px <= 1088; px += tileS) {
        drawCobbleTile(px, py);
      }
    }

    const roadTargets = [
      { x: 320, y: 320 },
      { x: 1680, y: 320 },
      { x: 320, y: 1680 },
      { x: 1620, y: 1620 },
      { x: 1000, y: 260 },
      { x: 1000, y: 1760 }
    ];

    roadTargets.forEach(rt => {
      const steps = 42;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const rx = 1000 + (rt.x - 1000) * t + Math.sin(t * Math.PI * 3) * 36;
        const ry = 1024 + (rt.y - 1024) * t + Math.cos(t * Math.PI * 3) * 36;
        drawCobbleTile(rx, ry);
      }
    });

    // 3. VÁCH ĐÁ BẬC THANG & ĐÈO ĐÁ BẰNG 6 TEXTURE CLIFF + STAIRS
    const drawPlateau = (px, py, midCols = 3, withStairs = true) => {
      let curX = px;
      if (canDrawImg(tCliffLeft)) {
        ctx.drawImage(tCliffLeft, curX, py, 102, 96);
      }
      curX += 96;

      const stairCol = Math.floor(midCols / 2);
      for (let c = 0; c < midCols; c++) {
        if (withStairs && c === stairCol && canDrawImg(tStairs)) {
          ctx.drawImage(tStairs, curX, py, 96, 95);
        } else if (canDrawImg(tCliffMid)) {
          ctx.drawImage(tCliffMid, curX, py, 96, 96);
        }
        curX += 92;
      }

      if (canDrawImg(tCliffCorner)) {
        ctx.drawImage(tCliffCorner, curX, py, 102, 96);
      }
    };

    const plateaus = [
      { x: 760, y: 690, cols: 4, stairs: true },
      { x: 1180, y: 820, cols: 3, stairs: true },
      { x: 540, y: 1120, cols: 3, stairs: true },
      { x: 1320, y: 1200, cols: 3, stairs: true },
      { x: 220, y: 520, cols: 3, stairs: true },
      { x: 1420, y: 460, cols: 3, stairs: true },
      { x: 260, y: 1380, cols: 3, stairs: true },
      { x: 860, y: 1420, cols: 4, stairs: true }
    ];
    plateaus.forEach(p => drawPlateau(p.x, p.y, p.cols, p.stairs));

    const passes = [
      { x: 640, y: 440 },
      { x: 1280, y: 600 },
      { x: 620, y: 1480 },
      { x: 1360, y: 1480 },
      { x: 960, y: 420 }
    ];
    passes.forEach(ps => {
      if (canDrawImg(tCliffPass)) {
        ctx.drawImage(tCliffPass, ps.x, ps.y, 128, 96);
      }
    });

    const ridges = [
      { x: 460, y: 220 },
      { x: 1150, y: 200 },
      { x: 1520, y: 740 },
      { x: 180, y: 920 },
      { x: 480, y: 1760 },
      { x: 1220, y: 1740 }
    ];
    ridges.forEach(rg => {
      if (canDrawImg(tCliffRidge)) {
        ctx.drawImage(tCliffRidge, rg.x, rg.y, 171, 77);
      }
    });

    // 4. VẼ BỔ SUNG ĐẶC TRƯNG ĐỊA HÌNH BẰNG CODE CHO CÁC BIOME
    for (let i = 0; i < 18; i++) {
      const lx = 120 + rand() * 520;
      const ly = 1380 + rand() * 500;
      ctx.save();
      ctx.strokeStyle = '#ff5722';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + (rand() - 0.5) * 90, ly + (rand() - 0.5) * 70);
      ctx.lineTo(lx + (rand() - 0.5) * 140, ly + (rand() - 0.5) * 110);
      ctx.stroke();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < 20; i++) {
      const ix = 1360 + rand() * 540;
      const iy = 100 + rand() * 500;
      const h = 16 + rand() * 18;
      ctx.save();
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ix, iy - h);
      ctx.lineTo(ix + h * 0.45, iy);
      ctx.lineTo(ix, iy + h * 0.25);
      ctx.lineTo(ix - h * 0.45, iy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < 16; i++) {
      const ax = 100 + rand() * 520;
      const ay = 100 + rand() * 520;
      ctx.save();
      ctx.fillStyle = 'rgba(192, 132, 252, 0.28)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ax, ay, 10 + rand() * 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 5. TRỒNG RỪNG CÂY PIXEL-ART THEO TỪNG BIOME
    const totalTrees = 185;
    for (let i = 0; i < totalTrees; i++) {
      const tx = 50 + rand() * (W - 140);
      const ty = 50 + rand() * (H - 140);

      if (Math.hypot(tx - 1000, ty - 1020) < 165) continue;

      let treeImg = tTree;
      if (Math.hypot(tx - 320, ty - 320) < 580) {
        treeImg = tTreeAbyss;
      } else if (Math.hypot(tx - 1680, ty - 320) < 580) {
        treeImg = tTreeIce;
      } else if (Math.hypot(tx - 320, ty - 1680) < 560) {
        if (rand() < 0.72) continue;
        treeImg = tTreeAbyss;
      } else if (Math.hypot(tx - 1680, ty - 1680) < 580) {
        const onIsland =
          Math.hypot(tx - 1560, ty - 1540) < 165 || Math.hypot(tx - 1780, ty - 1740) < 145;
        if (!onIsland) continue;
        treeImg = tTreePeach;
      } else if (rand() < 0.22) {
        treeImg = tTreePeach;
      }

      if (canDrawImg(treeImg)) {
        const scale = 0.95 + rand() * 0.35;
        const dw = Math.round(62 * scale);
        const dh = Math.round(57 * scale);
        ctx.drawImage(treeImg, Math.round(tx - dw / 2), Math.round(ty - dh / 2), dw, dh);
      }
    }

    // 6. ĐÀI ĐÁ CỔ TỌA THIỀN GIỮA THÁI THANH LINH CỐC (1000, 1060)
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.78)';
    ctx.fillStyle = 'rgba(15, 35, 42, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(1000, 1060, 74, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(45, 212, 191, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(1000, 1060, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  /**
   * Khởi tạo hoặc làm mới Bí Cảnh 2000×2000 (5 phút / lần)
   */
  generateSecretRealm(resetPlayerPos = false) {
    const Utils = window.TuTien.Utils;
    const State = window.TuTien.State;
    const Inv = window.TuTien.Inventory;
    const pRealmIdx = (State && State.data && State.data.realmIndex) || 0;
    const pStats = window.TuTien.Character
      ? window.TuTien.Character.getCombatStats()
      : { maxHp: 100, maxMp: 100, speed: 10, attack: 10 };

    this.mapSeed = Date.now() + Math.floor(Math.random() * 100000);
    this.refreshRemainingMs = this.REFRESH_INTERVAL_MS;

    if (resetPlayerPos) {
      this.playerX = 1000;
      this.playerY = 1060;
      this.targetX = 1000;
      this.targetY = 1060;
      this.isMoving = false;
      this.exploredPoints = [{ x: 1000, y: 1060, r: this.REVEAL_RADIUS + 40 }];
    } else {
      this.exploredPoints = [{ x: this.playerX, y: this.playerY, r: this.REVEAL_RADIUS + 30 }];
      if (this.fogCanvasEl) {
        this.initFogCanvas();
      }
    }

    const usedCoords = [{ x: this.playerX, y: this.playerY }];
    const pickCoord = (minX, maxX, minY, maxY, minDist = 135) => {
      for (let attempt = 0; attempt < 40; attempt++) {
        const cx = Utils.randomInt(minX, maxX);
        const cy = Utils.randomInt(minY, maxY);
        const tooClose = usedCoords.some(p => Math.hypot(p.x - cx, p.y - cy) < minDist);
        if (!tooClose) {
          usedCoords.push({ x: cx, y: cy });
          return { x: cx, y: cy };
        }
      }
      const fallback = { x: Utils.randomInt(minX, maxX), y: Utils.randomInt(minY, maxY) };
      usedCoords.push(fallback);
      return fallback;
    };

    this.nodes = [];
    let nextId = 1;

    // 1. 18 YÊU THÚ & TÁN TU TRÊN KHẮP 5 VÙNG ĐỊA HÌNH 2000×2000
    const enemyTemplates = [
      { type: 'monster', name: 'Thanh Vân Yêu Lộc', title: 'Linh Thú Đồng Cỏ', icon: '🦌', offset: -1, scale: 0.72, spd: 0.85, zone: [680, 1320, 680, 1350] },
      { type: 'monster', name: 'Thiết Giáp Sơn Trư', title: 'Hung Thú Chân Núi', icon: '🐗', offset: 0, scale: 0.90, spd: 0.80, zone: [640, 1360, 640, 1380] },
      { type: 'cultivator', gender: 'male', name: 'Vân Du Tán Tu', title: 'Chính Đạo Kiếm Khách', icon: '🗡️', offset: 0, scale: 1.0, spd: 1.02, zone: [600, 1400, 580, 1420] },
      { type: 'cultivator', gender: 'female', name: 'Bích Thủy Tiên Tử', title: 'Tán Tu Ngự Kiếm', icon: '🧚‍♀️', offset: 0, scale: 1.05, spd: 1.12, zone: [650, 1420, 600, 1400] },
      { type: 'monster', name: 'Bích Nhãn Yêu Lang', title: 'Yêu Thú Rừng Sâu', icon: '🐺', offset: 0, scale: 0.95, spd: 1.08, zone: [450, 1550, 450, 1550] },
      { type: 'monster', name: 'Hàn Băng Tuyết Báo', title: 'Yêu Thú Tuyết Đỉnh', icon: '🐆', offset: 1, scale: 1.25, spd: 1.20, zone: [1280, 1860, 140, 680] },
      { type: 'monster', name: 'Băng Tinh Huyền Quy', title: 'Linh Thú Hàn Đàm', icon: '🐢', offset: 1, scale: 1.35, spd: 0.85, zone: [1300, 1880, 160, 720] },
      { type: 'cultivator', gender: 'female', name: 'Hàn Cung Kiếm Nữ', title: 'Tán Tu Băng Tuyết', icon: '❄️', offset: 2, scale: 1.45, spd: 1.22, zone: [1320, 1850, 150, 650] },
      { type: 'monster', name: 'Xích Viêm Hỏa Chu', title: 'Độc Trùng Dung Nham', icon: '🕷️', offset: 1, scale: 1.30, spd: 1.12, zone: [140, 720, 1280, 1860] },
      { type: 'monster', name: 'Dung Nham Cự Nhân', title: 'Tinh Linh Hỏa Sơn', icon: '👹', offset: 2, scale: 1.55, spd: 0.92, zone: [160, 740, 1300, 1880] },
      { type: 'monster', name: 'Hỏa Diệm Kỳ Lân', title: 'Yêu Vương Hỏa Sơn (Vượt Cấp)', icon: '🦁', offset: 4, scale: 2.15, spd: 1.28, isOverlevel: true, zone: [150, 580, 1420, 1860] },
      { type: 'monster', name: 'U Minh Huyết Dực', title: 'Hung Thú Ma Vực', icon: '🦇', offset: 1, scale: 1.28, spd: 1.20, zone: [140, 720, 140, 700] },
      { type: 'cultivator', gender: 'male', name: 'Huyết Ảnh Ma Tu', title: 'Ma Đạo Tán Tu', icon: '🩸', offset: 2, scale: 1.50, spd: 1.18, zone: [160, 700, 160, 720] },
      { type: 'monster', name: 'Thái Cổ Minh Giao', title: 'Ma Long U Minh (Vượt Cấp)', icon: '🐉', offset: 4, scale: 2.35, spd: 1.30, isOverlevel: true, zone: [140, 520, 140, 520] },
      { type: 'monster', name: 'Bích Hải Giao Nhân', title: 'Yêu Tộc Linh Đảo', icon: '🧜', offset: 1, scale: 1.32, spd: 1.10, zone: [1280, 1860, 1280, 1860] },
      { type: 'monster', name: 'Kim Giáp Cự Giải', title: 'Hải Thú Bích Hải', icon: '🦀', offset: 2, scale: 1.50, spd: 0.95, zone: [1300, 1880, 1300, 1880] },
      { type: 'cultivator', gender: 'male', name: 'Đông Hải Kiếm Tôn', title: 'Cao Thủ Vượt Cấp', icon: '⚡', offset: 3, scale: 1.95, spd: 1.25, isOverlevel: true, zone: [1420, 1880, 1420, 1880] },
      { type: 'monster', name: 'Cửu Thiên Lôi Bằng', title: 'Thần Thú Chí Tôn (Vượt Cấp)', icon: '🦅', offset: 5, scale: 2.75, spd: 1.40, isOverlevel: true, zone: [820, 1180, 220, 520] }
    ];

    enemyTemplates.forEach(tpl => {
      const eRealmIdx = Utils.clamp(pRealmIdx + tpl.offset, 0, window.TuTien.REALMS.length - 1);
      const eRealmObj = window.TuTien.REALMS[eRealmIdx];
      const pos = pickCoord(tpl.zone[0], tpl.zone[1], tpl.zone[2], tpl.zone[3], 135);
      const isOverlevel = !!tpl.isOverlevel || eRealmIdx >= pRealmIdx + 3;

      this.nodes.push({
        id: `node_${nextId++}`,
        nodeCategory: 'enemy',
        type: tpl.type,
        gender: tpl.gender || 'male',
        name: tpl.name,
        title: tpl.title,
        icon: tpl.icon,
        x: pos.x,
        y: pos.y,
        realmIndex: eRealmIdx,
        realmName: eRealmObj.fullName,
        isOverlevel,
        maxHp: Math.max(60, Math.round(pStats.maxHp * tpl.scale)),
        maxMp: Math.max(50, Math.round(pStats.maxMp * tpl.scale)),
        speed: Math.max(6, Math.round(pStats.speed * tpl.spd)),
        attack: Math.max(8, Math.round(pStats.attack * tpl.scale)),
        statScale: tpl.scale
      });
    });

    // 2. 14 ĐIỂM MỌC LINH THẢO HIẾM TRÊN BẢN ĐỒ
    const herbSpawnDefs = [
      { herbId: 'tu_linh_thao', minTier: 1, maxTier: 3, zone: [620, 1380, 620, 1380] },
      { herbId: 'pha_chuong_qua', minTier: 1, maxTier: 3, zone: [600, 1400, 600, 1400] },
      { herbId: 'huyet_ngoc_sam', minTier: 2, maxTier: 4, zone: [520, 1480, 520, 1480] },
      { herbId: 'loi_tam_thao', minTier: 2, maxTier: 4, zone: [500, 1500, 500, 1500] },
      { herbId: 'han_bang_tuyet_lien', minTier: 2, maxTier: 5, zone: [1280, 1880, 140, 700] },
      { herbId: 'han_bang_tuyet_lien', minTier: 3, maxTier: 5, zone: [1360, 1880, 140, 640] },
      { herbId: 'xich_viem_chu_qua', minTier: 2, maxTier: 5, zone: [140, 720, 1280, 1880] },
      { herbId: 'xich_viem_chu_qua', minTier: 3, maxTier: 5, zone: [140, 640, 1360, 1880] },
      { herbId: 'u_minh_bi_ngan', minTier: 2, maxTier: 5, zone: [140, 720, 140, 720] },
      { herbId: 'u_minh_bi_ngan', minTier: 3, maxTier: 5, zone: [140, 620, 140, 620] },
      { herbId: 'tinh_than_long_thao', minTier: 2, maxTier: 5, zone: [1280, 1880, 1280, 1880] },
      { herbId: 'tinh_than_long_thao', minTier: 3, maxTier: 5, zone: [1360, 1880, 1360, 1880] },
      { herbId: 'thai_at_duong_hon_moc', minTier: 3, maxTier: 5, zone: [400, 1600, 260, 1740] },
      { herbId: 'cuu_chuyen_tien_chi', minTier: 4, maxTier: 5, zone: [180, 1820, 180, 620] }
    ];

    herbSpawnDefs.forEach(hs => {
      const herbDef = window.TuTien.HERB_TYPES.find(h => h.id === hs.herbId);
      if (!herbDef) return;
      const pos = pickCoord(hs.zone[0], hs.zone[1], hs.zone[2], hs.zone[3], 120);
      const qTier = Utils.randomInt(hs.minTier, hs.maxTier);
      const qObj = Inv ? Inv.getQualityByTier(qTier) : window.TuTien.ITEM_QUALITIES[0];
      const qty = herbDef.id === 'cuu_chuyen_tien_chi' ? 1 : Utils.randomInt(1, 3);

      this.nodes.push({
        id: `node_${nextId++}`,
        nodeCategory: 'herb',
        herbId: herbDef.id,
        name: herbDef.name,
        icon: herbDef.icon,
        desc: herbDef.desc,
        qty,
        qualityTier: qObj.tier,
        qualityName: qObj.name,
        qualityColor: qObj.color,
        x: pos.x,
        y: pos.y
      });
    });

    // 3. 10 MỎ QUẶNG LINH THẠCH
    const oreSpawns = [
      { grade: 'low', name: 'Quặng Linh Thạch Hạ Phẩm', icon: '💎', color: '#38bdf8', minAmt: 18, maxAmt: 45, zone: [550, 1450, 550, 1450] },
      { grade: 'low', name: 'Quặng Linh Thạch Hạ Phẩm', icon: '💎', color: '#38bdf8', minAmt: 20, maxAmt: 55, zone: [500, 1500, 500, 1500] },
      { grade: 'low', name: 'Quặng Linh Thạch Hạ Phẩm', icon: '💎', color: '#38bdf8', minAmt: 25, maxAmt: 65, zone: [400, 1600, 400, 1600] },
      { grade: 'low', name: 'Quặng Linh Thạch Hạ Phẩm', icon: '💎', color: '#38bdf8', minAmt: 30, maxAmt: 75, zone: [300, 1700, 300, 1700] },
      { grade: 'mid', name: 'Mạch Linh Thạch Trung Phẩm', icon: '💠', color: '#c084fc', minAmt: 1, maxAmt: 3, zone: [200, 800, 200, 800] },
      { grade: 'mid', name: 'Mạch Linh Thạch Trung Phẩm', icon: '💠', color: '#c084fc', minAmt: 1, maxAmt: 3, zone: [1200, 1800, 200, 800] },
      { grade: 'mid', name: 'Mạch Linh Thạch Trung Phẩm', icon: '💠', color: '#c084fc', minAmt: 1, maxAmt: 4, zone: [200, 800, 1200, 1800] },
      { grade: 'mid', name: 'Mạch Linh Thạch Trung Phẩm', icon: '💠', color: '#c084fc', minAmt: 1, maxAmt: 4, zone: [1200, 1800, 1200, 1800] },
      { grade: 'high', name: 'Long Mạch Linh Thạch Thượng Phẩm', icon: '🌟', color: '#fbbf24', minAmt: 1, maxAmt: 1, zone: [150, 520, 150, 520] },
      { grade: 'high', name: 'Long Mạch Linh Thạch Thượng Phẩm', icon: '🌟', color: '#fbbf24', minAmt: 1, maxAmt: 2, zone: [1480, 1860, 1480, 1860] }
    ];

    oreSpawns.forEach(os => {
      const pos = pickCoord(os.zone[0], os.zone[1], os.zone[2], os.zone[3], 125);
      this.nodes.push({
        id: `node_${nextId++}`,
        nodeCategory: 'ore',
        grade: os.grade,
        name: os.name,
        icon: os.icon,
        color: os.color,
        amount: Utils.randomInt(os.minAmt, os.maxAmt),
        x: pos.x,
        y: pos.y
      });
    });

    const merchantPos1 = pickCoord(760, 1240, 740, 1240, 130);
    const merchantPos2 = pickCoord(280, 1720, 280, 1720, 150);

    [merchantPos1, merchantPos2].forEach((pos, idx) => {
      this.nodes.push({
        id: `node_merchant_${idx + 1}`,
        nodeCategory: 'merchant',
        name: idx === 0 ? 'Vân Du Tiên Thương' : 'Kỳ Trân Các Lão Nhân',
        title: '🏮 Thương Nhân Bí Cảnh',
        icon: '🏮',
        x: pos.x,
        y: pos.y
      });
    });

    this.generateMerchantStock();
  },

  generateMerchantStock() {
    const Utils = window.TuTien.Utils;
    const Upgrades = window.TuTien.Upgrades;
    const Fields = window.TuTien.Fields;
    const Inv = window.TuTien.Inventory;
    const stock = [];

    const lockedTechs = window.TuTien.UPGRADES.filter(u => u.requiresUnlock && !Upgrades.isUnlocked(u));
    if (lockedTechs.length > 0) {
      const pickT = lockedTechs[Math.floor(Math.random() * lockedTechs.length)];
      const dispName = Upgrades.getDisplayName(pickT);
      stock.push({
        stockId: 'm_tech_unlock',
        type: 'unlock_tech',
        targetId: pickT.id,
        icon: '📘',
        name: `Bí Tịch: ${dispName}`,
        qualityName: 'Bí Truyền',
        qualityColor: '#fbbf24',
        desc: `Mở khóa vĩnh viễn 【${dispName}】 (+Tầng 1)`,
        costLow: 120,
        sold: false
      });
    } else {
      const pickT = window.TuTien.UPGRADES[Math.floor(Math.random() * window.TuTien.UPGRADES.length)];
      const dispName = Upgrades.getDisplayName(pickT);
      stock.push({
        stockId: 'm_tech_quality',
        type: 'upgrade_tech_quality',
        targetId: pickT.id,
        icon: '📖',
        name: `Tâm Đắc: ${dispName}`,
        qualityName: 'Thăng Phẩm',
        qualityColor: '#c084fc',
        desc: `Thăng +1 bậc Phẩm Chất cho 【${dispName}】`,
        costLow: 180,
        sold: false
      });
    }

    const lockedPills = window.TuTien.PILL_RECIPES.filter(
      r => r.requiresRecipeUnlock && !Fields.isPillRecipeUnlocked(r)
    );
    if (lockedPills.length > 0) {
      const pickP = lockedPills[Math.floor(Math.random() * lockedPills.length)];
      stock.push({
        stockId: 'm_pill_recipe',
        type: 'unlock_pill_recipe',
        targetId: pickP.id,
        icon: '📜',
        name: `Đan Phương: ${pickP.name}`,
        qualityName: 'Đan Phương Cổ',
        qualityColor: '#38bdf8',
        desc: `Mở khóa luyện chế 【${pickP.name}】`,
        costLow: 85,
        sold: false
      });
    }

    const lockedTals = window.TuTien.TALISMAN_RECIPES.filter(
      t => t.requiresRecipeUnlock && !Fields.isTalismanRecipeUnlocked(t)
    );
    if (lockedTals.length > 0) {
      const pickTal = lockedTals[Math.floor(Math.random() * lockedTals.length)];
      stock.push({
        stockId: 'm_tal_recipe',
        type: 'unlock_talisman_recipe',
        targetId: pickTal.id,
        icon: '🧧',
        name: `Phù Phương: ${pickTal.name}`,
        qualityName: 'Phù Phương Cổ',
        qualityColor: '#4ade80',
        desc: `Mở khóa họa phù 【${pickTal.name}】`,
        costLow: 80,
        sold: false
      });
    }

    const rareHerbs = window.TuTien.HERB_TYPES.filter(h => h.mapOnly);
    for (let i = 0; i < 2; i++) {
      const h = rareHerbs[Math.floor(Math.random() * rareHerbs.length)];
      const qObj = Inv.getQualityByTier(Utils.randomInt(3, 5));
      stock.push({
        stockId: `m_herb_${i}`,
        type: 'item_herb',
        herbDef: h,
        qualityObj: qObj,
        qty: 2,
        icon: h.icon,
        name: `${h.name} ×2`,
        qualityName: qObj.name,
        qualityColor: qObj.color,
        desc: h.shortDesc || h.desc,
        costLow: 35 * qObj.tier,
        sold: false
      });
    }

    const pillRec = window.TuTien.PILL_RECIPES[Math.floor(Math.random() * window.TuTien.PILL_RECIPES.length)];
    const pillQ = Inv.getQualityByTier(Utils.randomInt(3, 5));
    stock.push({
      stockId: 'm_ready_pill',
      type: 'item_pill',
      recipe: pillRec,
      qualityObj: pillQ,
      icon: pillRec.icon,
      name: pillRec.name,
      qualityName: pillQ.name,
      qualityColor: pillQ.color,
      desc: `${pillRec.getEffectText(5)} (${pillQ.name} x${pillQ.mult})`,
      costLow: 55 * pillQ.tier,
      sold: false
    });

    const talRec = window.TuTien.TALISMAN_RECIPES[Math.floor(Math.random() * window.TuTien.TALISMAN_RECIPES.length)];
    const talQ = Inv.getQualityByTier(Utils.randomInt(3, 5));
    stock.push({
      stockId: 'm_ready_tal',
      type: 'item_talisman',
      recipe: talRec,
      qualityObj: talQ,
      icon: talRec.icon,
      name: talRec.name,
      qualityName: talQ.name,
      qualityColor: talQ.color,
      desc: talRec.shortDesc || talRec.description,
      costLow: 50 * talQ.tier,
      sold: false
    });

    this.merchantStock = stock;
  },

  buyMerchantItem(stockId) {
    const entry = this.merchantStock.find(s => s.stockId === stockId);
    if (!entry || entry.sold) return false;

    const Inv = window.TuTien.Inventory;
    const State = window.TuTien.State;
    const Upgrades = window.TuTien.Upgrades;
    const Fields = window.TuTien.Fields;

    if (!Inv.canAffordSpiritStonesInLow(entry.costLow)) {
      window.TuTien.UI.showToast(
        `Không đủ Linh Thạch! Cần ${Inv.formatSpiritStoneCost(entry.costLow)}.`,
        'warn'
      );
      return false;
    }

    Inv.spendSpiritStonesInLow(entry.costLow);
    entry.sold = true;

    if (entry.type === 'unlock_tech') {
      Upgrades.unlockTechnique(entry.targetId);
      State.addLog(`📘 Đã mua & lĩnh ngộ 【${entry.name}】 từ Vân Du Tiên Thương!`, 'success');
    } else if (entry.type === 'upgrade_tech_quality') {
      const curTier = Upgrades.getUpgradeQualityTier(entry.targetId);
      State.data.upgradeQualities[entry.targetId] = Math.min(5, curTier + 1);
      State.addLog(`📖 Đã mua 【${entry.name}】, thăng bậc Phẩm Chất Công Pháp!`, 'success');
    } else if (entry.type === 'unlock_pill_recipe') {
      Fields.unlockPillRecipe(entry.targetId);
      State.addLog(`📜 Đã lĩnh ngộ 【${entry.name}】! Có thể luyện chế trong Đan Phòng.`, 'success');
    } else if (entry.type === 'unlock_talisman_recipe') {
      Fields.unlockTalismanRecipe(entry.targetId);
      State.addLog(`🧧 Đã lĩnh ngộ 【${entry.name}】! Có thể họa phù trong Phù Đường.`, 'success');
    } else if (entry.type === 'item_herb') {
      Inv.addStackableItem(
        'herb',
        entry.herbDef.id,
        entry.herbDef.name,
        entry.herbDef.icon,
        entry.qualityObj,
        entry.desc,
        entry.qty
      );
      State.addLog(`🌿 Đã mua ${entry.name} [${entry.qualityName}] cất vào Túi Đồ!`, 'success');
    } else if (entry.type === 'item_pill') {
      Inv.addStackableItem(
        'pill',
        entry.recipe.id,
        entry.recipe.name,
        entry.recipe.icon,
        entry.qualityObj,
        entry.desc,
        1
      );
      State.addLog(`⚗️ Đã mua 1 viên 【${entry.name} — ${entry.qualityName}】 cất vào Túi Đồ!`, 'success');
    } else if (entry.type === 'item_talisman') {
      Inv.addStackableItem(
        'talisman',
        entry.recipe.id,
        entry.recipe.name,
        entry.recipe.icon,
        entry.qualityObj,
        entry.desc,
        1
      );
      State.addLog(`📜 Đã mua 1 lá 【${entry.name} — ${entry.qualityName}】 cất vào Túi Đồ!`, 'success');
    }

    if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(4);
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(`Đã mua: ${entry.name}!`, 'success', 'happy');
      window.TuTien.UI.updateAll();
    }
    this.renderMerchantView();
    this.updateHeaderDOM();
    return true;
  },

  /**
   * Lấy đường dẫn ảnh Sprite di chuyển 4 hướng (4 frame 01..04) của Nam / Nữ từ `assets/sprites_walk/`
   */
  getPlayerMapSpriteInfo() {
    const prefix =
      window.TuTien.Character && window.TuTien.Character.getGender() === 'female' ? 'nu' : 'nam';

    let dirKey = 'xuong';
    if (this.facingDir === 'up') dirKey = 'len';
    else if (this.facingDir === 'left') dirKey = 'trai';
    else if (this.facingDir === 'right') dirKey = 'phai';

    const frameIdx = this.isMoving ? (this.walkFrame % 4) + 1 : 1;
    const frameStr = String(frameIdx).padStart(2, '0');

    return {
      src: `assets/sprites_walk/${prefix}/${prefix}_di_${dirKey}_${frameStr}.png`,
      flipX: false
    };
  },

  getCombatPoseSprite(gender, pose = 'idle') {
    const folder = gender === 'female' ? 'nu' : 'nam';
    if (pose === 'down') {
      return `assets/sprites/${folder}/hang7/hang7_6.png`;
    }
    if (pose === 'attack') {
      return `assets/sprites/${folder}/hang4.png`;
    }
    if (pose === 'skill') {
      return folder === 'nam'
        ? `assets/sprites/nam/hang7/hang7_5.png`
        : `assets/sprites/nu/hang7/hang7_1.png`;
    }
    if (pose === 'meditate') {
      return `assets/sprites/${folder}/hang7/hang7_2.png`;
    }
    if (pose === 'hurt') {
      return folder === 'nam'
        ? `assets/sprites/nam/hang7/hang7_4.png`
        : `assets/sprites/nu/hang3.png`;
    }
    return folder === 'nam'
      ? `assets/sprites/nam/hang7/hang7_1.png`
      : `assets/sprites/nu/hang1.png`;
  },

  formatTimerMMSS(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
  },

  renderPanel() {
    const container = document.getElementById('expedition-panel-container');
    if (!container) return;

    const pStats = window.TuTien.Character.getCombatStats();
    const st = window.TuTien.Inventory.getSpiritStones();
    const Utils = window.TuTien.Utils;
    const initSprite = this.getPlayerMapSpriteInfo();

    container.innerHTML = `
      <!-- Thanh thông tin tinh gọn: Kho Linh Thạch, Nút nhỏ thu gọn/hiện Chỉ Số, Thời gian làm mới & Tọa độ -->
      <div class="exp-compact-topbar">
        <div class="exp-stones-bar" title="100 Hạ Phẩm = 1 Trung Phẩm • 100 Trung Phẩm = 1 Thượng Phẩm">
          <span class="stone-chip low-stone">💎 Hạ: <strong id="exp-stone-low">${st.low || 0}</strong></span>
          <span class="stone-chip mid-stone">💠 Trung: <strong id="exp-stone-mid">${st.mid || 0}</strong></span>
          <span class="stone-chip high-stone">🌟 Thượng: <strong id="exp-stone-high">${st.high || 0}</strong></span>
          <button id="btn-toggle-exp-stats" class="btn-ancient-sm exp-stats-toggle-btn">
            ${this.statsExpanded ? '📊 Ẩn Chỉ Số ▴' : '📊 Chỉ Số ▾'}
          </button>
        </div>

        <div class="exp-timer-box">
          <span class="exp-refresh-clock">⏳ Làm mới: <strong id="exp-refresh-timer">${this.formatTimerMMSS(this.refreshRemainingMs)}</strong></span>
          <span class="exp-coord-badge" id="exp-coord-text">📍 (${Math.round(this.playerX)}, ${Math.round(this.playerY)})</span>
        </div>
      </div>

      <!-- Dải 4 chỉ số chiến đấu (có thể thu gọn / mở rộng bằng nút nhỏ) -->
      <div id="exp-collapsible-stats" class="exp-collapsible-stats ${this.statsExpanded ? '' : 'hidden'}">
        <span class="exp-stat-pill">❤️ Máu: <strong id="exp-hdr-hp">${Utils.formatNumber(pStats.maxHp)}</strong></span>
        <span class="exp-stat-pill">💧 Linh Lực: <strong id="exp-hdr-mp">${Utils.formatNumber(pStats.maxMp)}</strong></span>
        <span class="exp-stat-pill">💨 Tốc: <strong id="exp-hdr-spd">${Utils.formatNumber(pStats.speed)}</strong></span>
        <span class="exp-stat-pill">⚔️ Công: <strong id="exp-hdr-atk">${Utils.formatNumber(pStats.attack)}</strong></span>
      </div>

      <!-- 1. KHUNG NHÌN BẢN ĐỒ BÍ CẢNH HỒNG HOANG 2000×2000 -->
      <div id="expedition-map-view" class="exp-map-wrapper ${this.activeView === 'map' ? '' : 'hidden'}">
        <div id="expedition-map-viewport" class="exp-map-viewport">
          <div id="expedition-world-layer" class="exp-world-layer">
            <canvas id="exp-terrain-canvas" width="2000" height="2000" class="exp-terrain-canvas"></canvas>

            <div class="exp-world-biome-label biome-center">⛩️ Thái Thanh Linh Cốc</div>
            <div class="exp-world-biome-label biome-nw">🟣 U Minh Ma Vực</div>
            <div class="exp-world-biome-label biome-ne">❄️ Hàn Băng Tuyết Đỉnh</div>
            <div class="exp-world-biome-label biome-sw">🔥 Xích Viêm Hỏa Sơn</div>
            <div class="exp-world-biome-label biome-se">🌊 Bích Hải Linh Đảo</div>

            <div id="exp-target-marker" class="exp-target-marker hidden"></div>
            <div id="exp-entities-layer" class="exp-entities-layer"></div>

            <div id="exp-player-token" class="exp-player-token" style="left:${this.playerX}px;top:${this.playerY}px">
              <span class="exp-player-name-tag">✦ Bạn ✦</span>
              <img id="exp-player-sprite-img" src="${initSprite.src}" alt="Tu sĩ" />
              <span class="exp-player-foot-ring"></span>
            </div>

            <canvas id="exp-fog-canvas" width="500" height="500" class="exp-fog-canvas"></canvas>
          </div>

          <div class="exp-minimap-box" title="Thần Thức Đồ 2000×2000">
            <canvas id="exp-minimap-canvas" width="116" height="116"></canvas>
          </div>
        </div>
      </div>

      <!-- 2. GIAO DIỆN CHIẾN ĐẤU LINH ĐÀI TU TIÊN (THANH MÁU TRÊN ĐẦU MÌNH LÀ CỦA MÌNH, DƯỚI CHÂN ĐỊCH LÀ CỦA ĐỊCH) -->
      <div id="expedition-combat-view" class="exp-combat-wrapper ${this.activeView === 'combat' ? '' : 'hidden'}"></div>

      <!-- 3. GIAO DIỆN KỲ TRÂN CÁC CỦA VÂN DU TIÊN THƯƠNG -->
      <div id="expedition-merchant-view" class="exp-combat-wrapper ${this.activeView === 'merchant' ? '' : 'hidden'}"></div>
    `;

    this.mapViewEl = document.getElementById('expedition-map-view');
    this.viewportEl = document.getElementById('expedition-map-viewport');
    this.worldLayerEl = document.getElementById('expedition-world-layer');
    this.terrainCanvasEl = document.getElementById('exp-terrain-canvas');
    this.fogCanvasEl = document.getElementById('exp-fog-canvas');
    this.minimapCanvasEl = document.getElementById('exp-minimap-canvas');
    this.nodesLayerEl = document.getElementById('exp-entities-layer');
    this.playerTokenEl = document.getElementById('exp-player-token');
    this.playerSpriteImgEl = document.getElementById('exp-player-sprite-img');
    this.targetMarkerEl = document.getElementById('exp-target-marker');
    this.combatViewEl = document.getElementById('expedition-combat-view');
    this.merchantViewEl = document.getElementById('expedition-merchant-view');

    const toggleStatsBtn = document.getElementById('btn-toggle-exp-stats');
    const collapsibleStatsEl = document.getElementById('exp-collapsible-stats');
    if (toggleStatsBtn && collapsibleStatsEl) {
      toggleStatsBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.statsExpanded = !this.statsExpanded;
        collapsibleStatsEl.classList.toggle('hidden', !this.statsExpanded);
        toggleStatsBtn.textContent = this.statsExpanded ? '📊 Ẩn Chỉ Số ▴' : '📊 Chỉ Số ▾';
      });
    }

    if (this.viewportEl) {
      this.viewportEl.addEventListener('pointerdown', e => {
        if (this.activeView !== 'map') return;
        if (e.target.closest('.exp-entity-node') || e.target.closest('.exp-minimap-box')) return;
        e.preventDefault();
        const rect = this.viewportEl.getBoundingClientRect();
        const clickViewX = e.clientX - rect.left;
        const clickViewY = e.clientY - rect.top;
        const worldX = window.TuTien.Utils.clamp(clickViewX + this.cameraX, 65, this.WORLD_W - 65);
        const worldY = window.TuTien.Utils.clamp(clickViewY + this.cameraY, 75, this.WORLD_H - 65);
        this.moveToPoint(worldX, worldY, null);
      });
    }

    this.drawProceduralTerrainCanvas();
    this.renderMapNodes();
    this.initFogCanvas();
    this.updateCameraAndPlayerDOM();
    this.updateFogVisibilityForNodes();
    this.renderMinimap();

    if (this.activeView === 'combat') {
      this.renderCombatView();
    } else if (this.activeView === 'merchant') {
      this.renderMerchantView();
    }
  },

  updateHeaderDOM() {
    if (!this.isOpen) return;
    const Utils = window.TuTien.Utils;
    const pStats = window.TuTien.Character.getCombatStats();
    const st = window.TuTien.Inventory.getSpiritStones();

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setTxt('exp-hdr-hp', Utils.formatNumber(pStats.maxHp));
    setTxt('exp-hdr-mp', Utils.formatNumber(pStats.maxMp));
    setTxt('exp-hdr-spd', Utils.formatNumber(pStats.speed));
    setTxt('exp-hdr-atk', Utils.formatNumber(pStats.attack));
    setTxt('exp-stone-low', st.low || 0);
    setTxt('exp-stone-mid', st.mid || 0);
    setTxt('exp-stone-high', st.high || 0);
    setTxt('exp-refresh-timer', this.formatTimerMMSS(this.refreshRemainingMs));
    setTxt('exp-coord-text', `📍 (${Math.round(this.playerX)}, ${Math.round(this.playerY)})`);
  },

  initFogCanvas() {
    if (!this.fogCanvasEl) return;
    this.fogCtx = this.fogCanvasEl.getContext('2d');
    if (!this.fogCtx) return;

    const w = this.fogCanvasEl.width;
    const h = this.fogCanvasEl.height;
    this.fogCtx.globalCompositeOperation = 'source-over';
    this.fogCtx.fillStyle = 'rgba(4, 10, 16, 0.88)';
    this.fogCtx.fillRect(0, 0, w, h);

    this.exploredPoints.forEach(pt => {
      this.carveFogCircle(pt.x, pt.y, pt.r);
    });
  },

  carveFogCircle(worldX, worldY, radiusWorld) {
    if (!this.fogCtx) return;
    const cx = worldX / this.FOG_SCALE;
    const cy = worldY / this.FOG_SCALE;
    const r = radiusWorld / this.FOG_SCALE;

    this.fogCtx.save();
    this.fogCtx.globalCompositeOperation = 'destination-out';
    const grad = this.fogCtx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    this.fogCtx.fillStyle = grad;
    this.fogCtx.beginPath();
    this.fogCtx.arc(cx, cy, r, 0, Math.PI * 2);
    this.fogCtx.fill();
    this.fogCtx.restore();
  },

  revealFogAtPlayer() {
    const last = this.exploredPoints[this.exploredPoints.length - 1];
    if (!last || Math.hypot(last.x - this.playerX, last.y - this.playerY) >= 28) {
      this.exploredPoints.push({ x: this.playerX, y: this.playerY, r: this.REVEAL_RADIUS });
      this.carveFogCircle(this.playerX, this.playerY, this.REVEAL_RADIUS);
      this.updateFogVisibilityForNodes();
      this.renderMinimap();
    }
  },

  isPointExplored(worldX, worldY) {
    for (let i = 0; i < this.exploredPoints.length; i++) {
      const pt = this.exploredPoints[i];
      if (Math.hypot(pt.x - worldX, pt.y - worldY) <= pt.r * 0.92) {
        return true;
      }
    }
    return false;
  },

  updateFogVisibilityForNodes() {
    if (!this.nodesLayerEl) return;
    this.nodes.forEach(n => {
      const dom = document.getElementById(`map-node-${n.id}`);
      if (!dom) return;
      const visible = this.isPointExplored(n.x, n.y);
      dom.classList.toggle('hidden-in-fog', !visible);
    });
  },

  renderMinimap() {
    if (!this.minimapCanvasEl) return;
    if (!this.minimapCtx) {
      this.minimapCtx = this.minimapCanvasEl.getContext('2d');
    }
    const ctx = this.minimapCtx;
    if (!ctx) return;

    const mw = this.minimapCanvasEl.width;
    const mh = this.minimapCanvasEl.height;
    const scale = mw / this.WORLD_W;

    ctx.clearRect(0, 0, mw, mh);
    ctx.fillStyle = '#050d12';
    ctx.fillRect(0, 0, mw, mh);

    ctx.fillStyle = 'rgba(34, 92, 68, 0.85)';
    this.exploredPoints.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x * scale, pt.y * scale, pt.r * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    this.nodes.forEach(n => {
      if (!this.isPointExplored(n.x, n.y)) return;
      ctx.beginPath();
      if (n.nodeCategory === 'merchant') {
        ctx.fillStyle = '#fbbf24';
        ctx.arc(n.x * scale, n.y * scale, 3, 0, Math.PI * 2);
      } else if (n.nodeCategory === 'herb') {
        ctx.fillStyle = '#4ade80';
        ctx.arc(n.x * scale, n.y * scale, 2.2, 0, Math.PI * 2);
      } else if (n.nodeCategory === 'ore') {
        ctx.fillStyle = '#38bdf8';
        ctx.arc(n.x * scale, n.y * scale, 2.2, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = n.isOverlevel ? '#f43f5e' : '#fb923c';
        ctx.arc(n.x * scale, n.y * scale, n.isOverlevel ? 3 : 2.3, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.playerX * scale, this.playerY * scale, 3.4, 0, Math.PI * 2);
    ctx.fill();
  },

  renderMapNodes() {
    if (!this.nodesLayerEl) return;
    const Utils = window.TuTien.Utils;

    this.nodesLayerEl.innerHTML = this.nodes
      .map(n => {
        if (n.nodeCategory === 'enemy') {
          const isRogue = n.type === 'cultivator';
          const roguePrefix = n.gender === 'female' ? 'nu' : 'nam';
          const visualHtml = isRogue
            ? `<div class="exp-token-circle rogue-circle"><img src="assets/sprites_walk/${roguePrefix}/${roguePrefix}_di_xuong_01.png" class="exp-rogue-sprite" alt="${n.name}" /></div>`
            : `<div class="exp-token-circle ${n.isOverlevel ? 'boss-glow' : ''}">${n.icon}</div>`;

          return `
            <div id="map-node-${n.id}" class="exp-entity-node ${n.isOverlevel ? 'overlevel-node' : ''}"
                 data-node-id="${n.id}"
                 style="left:${n.x}px;top:${n.y}px">
              <div class="exp-entity-tag">
                <div class="exp-ent-realm">${n.isOverlevel ? '🔥 ' : ''}${n.realmName}</div>
                <div class="exp-ent-name">${n.name}</div>
                <div class="exp-ent-spd">💨 ${Utils.formatNumber(n.speed)} • ⚔️ ${Utils.formatNumber(n.attack)}</div>
              </div>
              ${visualHtml}
            </div>
          `;
        }

        if (n.nodeCategory === 'herb') {
          return `
            <div id="map-node-${n.id}" class="exp-entity-node resource-node"
                 data-node-id="${n.id}"
                 style="left:${n.x}px;top:${n.y}px">
              <div class="exp-entity-tag" style="border-color:${n.qualityColor}">
                <div class="exp-ent-realm" style="color:${n.qualityColor}">✦ ${n.qualityName}</div>
                <div class="exp-ent-name">${n.name} ×${n.qty}</div>
              </div>
              <div class="exp-token-circle herb-circle" style="border-color:${n.qualityColor}">${n.icon}</div>
            </div>
          `;
        }

        if (n.nodeCategory === 'ore') {
          return `
            <div id="map-node-${n.id}" class="exp-entity-node resource-node"
                 data-node-id="${n.id}"
                 style="left:${n.x}px;top:${n.y}px">
              <div class="exp-entity-tag" style="border-color:${n.color}">
                <div class="exp-ent-realm" style="color:${n.color}">⛏️ Linh Khoáng</div>
                <div class="exp-ent-name">${n.name} (+${n.amount})</div>
              </div>
              <div class="exp-token-circle ore-circle" style="border-color:${n.color}">${n.icon}</div>
            </div>
          `;
        }

        return `
          <div id="map-node-${n.id}" class="exp-entity-node merchant-node"
               data-node-id="${n.id}"
               style="left:${n.x}px;top:${n.y}px">
            <div class="exp-entity-tag" style="border-color:#fbbf24">
              <div class="exp-ent-realm" style="color:#fde047">${n.title}</div>
              <div class="exp-ent-name">${n.name}</div>
            </div>
            <div class="exp-token-circle merchant-circle">${n.icon}</div>
          </div>
        `;
      })
      .join('');

    this.nodesLayerEl.querySelectorAll('.exp-entity-node').forEach(dom => {
      dom.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        const nodeId = dom.getAttribute('data-node-id');
        const nodeObj = this.nodes.find(x => x.id === nodeId);
        if (nodeObj) {
          this.moveToPoint(nodeObj.x, nodeObj.y, nodeObj.id);
        }
      });
    });
  },

  moveToPoint(worldX, worldY, nodeId = null) {
    this.targetX = worldX;
    this.targetY = worldY;
    this.pendingNodeId = nodeId;
    this.isMoving = true;

    const dx = this.targetX - this.playerX;
    const dy = this.targetY - this.playerY;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.facingDir = dx < 0 ? 'left' : 'right';
    } else {
      this.facingDir = dy < 0 ? 'up' : 'down';
    }

    if (this.targetMarkerEl) {
      this.targetMarkerEl.style.left = `${worldX}px`;
      this.targetMarkerEl.style.top = `${worldY}px`;
      this.targetMarkerEl.classList.remove('hidden');
    }

    this.updateCameraAndPlayerDOM();
  },

  updateCameraAndPlayerDOM() {
    if (!this.worldLayerEl || !this.playerTokenEl || !this.playerSpriteImgEl) return;

    const viewW = (this.viewportEl && this.viewportEl.clientWidth) || 820;
    const viewH = (this.viewportEl && this.viewportEl.clientHeight) || 460;

    this.cameraX = window.TuTien.Utils.clamp(
      this.playerX - viewW / 2,
      0,
      Math.max(0, this.WORLD_W - viewW)
    );
    this.cameraY = window.TuTien.Utils.clamp(
      this.playerY - viewH / 2,
      0,
      Math.max(0, this.WORLD_H - viewH)
    );

    this.worldLayerEl.style.transform = `translate3d(${-Math.round(this.cameraX)}px, ${-Math.round(this.cameraY)}px, 0)`;

    this.playerTokenEl.style.left = `${this.playerX.toFixed(1)}px`;
    this.playerTokenEl.style.top = `${this.playerY.toFixed(1)}px`;
    this.playerTokenEl.classList.toggle('walking', this.isMoving);

    const spriteInfo = this.getPlayerMapSpriteInfo();
    if (!(this.playerSpriteImgEl.getAttribute('src') || '').endsWith(spriteInfo.src)) {
      this.playerSpriteImgEl.setAttribute('src', spriteInfo.src);
    }
    this.playerSpriteImgEl.style.transform = spriteInfo.flipX ? 'scaleX(-1)' : 'scaleX(1)';
  },

  onArriveAtNode(nodeObj) {
    if (!nodeObj) return;
    const Inv = window.TuTien.Inventory;
    const State = window.TuTien.State;

    if (nodeObj.nodeCategory === 'herb') {
      const qObj = Inv.getQualityByTier(nodeObj.qualityTier);
      Inv.addStackableItem(
        'herb',
        nodeObj.herbId,
        nodeObj.name,
        nodeObj.icon,
        qObj,
        `${nodeObj.desc} (${qObj.name} x${qObj.mult})`,
        nodeObj.qty
      );
      if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(qObj.tier);
      const msg = `${nodeObj.icon} Thu thập: +${nodeObj.qty} ${nodeObj.name} [${qObj.name}]!`;
      State.addLog(msg, 'success');
      if (window.TuTien.UI) window.TuTien.UI.showToast(msg, 'success', 'happy');

      this.nodes = this.nodes.filter(n => n.id !== nodeObj.id);
      this.renderMapNodes();
      this.updateFogVisibilityForNodes();
      this.renderMinimap();
      return;
    }

    if (nodeObj.nodeCategory === 'ore') {
      if (nodeObj.grade === 'high') {
        Inv.addSpiritStones(0, 0, nodeObj.amount);
      } else if (nodeObj.grade === 'mid') {
        Inv.addSpiritStones(0, nodeObj.amount, 0);
      } else {
        Inv.addSpiritStones(nodeObj.amount, 0, 0);
      }
      if (window.TuTien.Audio) window.TuTien.Audio.playCraftSuccess(3);
      const msg = `⛏️ Khai thác: +${nodeObj.amount} ${nodeObj.name}!`;
      State.addLog(msg, 'success');
      if (window.TuTien.UI) window.TuTien.UI.showToast(msg, 'success', 'happy');

      this.nodes = this.nodes.filter(n => n.id !== nodeObj.id);
      this.renderMapNodes();
      this.updateFogVisibilityForNodes();
      this.updateHeaderDOM();
      this.renderMinimap();
      return;
    }

    if (nodeObj.nodeCategory === 'merchant') {
      this.openMerchantShop(nodeObj);
      return;
    }

    if (nodeObj.nodeCategory === 'enemy') {
      this.startCombat(nodeObj);
    }
  },

  openMerchantShop(merchantNode) {
    this.activeView = 'merchant';
    if (this.mapViewEl) this.mapViewEl.classList.add('hidden');
    if (this.combatViewEl) this.combatViewEl.classList.add('hidden');
    if (this.merchantViewEl) this.merchantViewEl.classList.remove('hidden');
    this.renderMerchantView(merchantNode);
  },

  renderMerchantView() {
    if (!this.merchantViewEl) return;
    const Inv = window.TuTien.Inventory;
    const st = Inv.getSpiritStones();

    const cardsHtml = this.merchantStock
      .map(s => {
        const canBuy = !s.sold && Inv.canAffordSpiritStonesInLow(s.costLow);
        const priceStr = Inv.formatSpiritStoneCost(s.costLow);

        return `
          <div class="jade-card" style="border-left:3px solid ${s.qualityColor}">
            <div class="jade-card-icon">${s.icon}</div>
            <div class="jade-card-body">
              <div class="item-top-meta-row">
                <span class="equip-quality-top-tag" style="color:${s.qualityColor};border-color:${s.qualityColor}">
                  ${s.qualityName}
                </span>
                <span class="jade-badge">💎 ${priceStr}</span>
              </div>
              <div class="jade-card-title" style="color:${s.qualityColor}">${s.name}</div>
              <div class="jade-card-desc">${s.desc}</div>
            </div>
            <button class="btn-ancient-sm btn-buy-merchant ${canBuy ? 'affordable' : ''}"
                    data-stock-id="${s.stockId}"
                    ${s.sold || !canBuy ? 'disabled' : ''}>
              ${s.sold ? 'Đã Mua' : '💎 Mua'}
            </button>
          </div>
        `;
      })
      .join('');

    this.merchantViewEl.innerHTML = `
      <div class="combat-arena-box">
        <div class="combat-top-banner">
          <span>🏮 KỲ TRÂN CÁC — VÂN DU TIÊN THƯƠNG</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="jade-badge">💎 Hạ: ${st.low} • 💠 Trung: ${st.mid} • 🌟 Thượng: ${st.high}</span>
            <button id="btn-close-merchant" class="btn-ancient-sm affordable">🗺️ Về Bản Đồ</button>
          </div>
        </div>
        <div class="jade-cards-stack">
          ${cardsHtml}
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('btn-close-merchant');
    if (closeBtn) {
      closeBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.activeView = 'map';
        if (this.merchantViewEl) this.merchantViewEl.classList.add('hidden');
        if (this.mapViewEl) this.mapViewEl.classList.remove('hidden');
      });
    }

    this.merchantViewEl.querySelectorAll('.btn-buy-merchant').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.buyMerchantItem(btn.getAttribute('data-stock-id'));
      });
    });
  },

  update(dtMs) {
    this.refreshRemainingMs -= dtMs;
    if (this.refreshRemainingMs <= 0) {
      this.generateSecretRealm(false);
      if (this.isOpen && this.activeView === 'map') {
        this.drawProceduralTerrainCanvas();
        this.renderMapNodes();
        this.updateFogVisibilityForNodes();
        this.renderMinimap();
      }
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast('🌪️ Thiên địa biến chuyển: Bí Cảnh Hồng Hoang đã làm mới!', 'info');
      }
    }

    if (!this.isOpen) return;
    const dtSec = dtMs / 1000;

    this.updateHeaderDOM();

    if (this.isMoving && this.activeView === 'map') {
      const dx = this.targetX - this.playerX;
      const dy = this.targetY - this.playerY;
      const dist = Math.hypot(dx, dy);
      const moveSpeedPxPerSec = 320;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.facingDir = dx < 0 ? 'left' : 'right';
      } else {
        this.facingDir = dy < 0 ? 'up' : 'down';
      }

      // Chu kỳ 4 frame di chuyển (01 -> 02 -> 03 -> 04)
      this.walkAnimTimerMs += dtMs;
      if (this.walkAnimTimerMs >= 165) {
        this.walkAnimTimerMs = 0;
        this.walkFrame = (this.walkFrame + 1) % 4;
      }

      if (dist <= moveSpeedPxPerSec * dtSec) {
        this.playerX = this.targetX;
        this.playerY = this.targetY;
        this.isMoving = false;
        this.walkFrame = 0;
        if (this.targetMarkerEl) this.targetMarkerEl.classList.add('hidden');
        this.revealFogAtPlayer();
        this.updateCameraAndPlayerDOM();

        if (this.pendingNodeId) {
          const targetNode = this.nodes.find(x => x.id === this.pendingNodeId);
          this.pendingNodeId = null;
          if (targetNode) {
            this.onArriveAtNode(targetNode);
          }
        }
      } else {
        this.playerX += (dx / dist) * moveSpeedPxPerSec * dtSec;
        this.playerY += (dy / dist) * moveSpeedPxPerSec * dtSec;
        this.revealFogAtPlayer();
        this.updateCameraAndPlayerDOM();
      }
    }

    if (this.inCombat && this.autoBattle && this.combatState && !this.combatState.finished) {
      this.autoBattleTimerMs += dtMs;
      if (this.autoBattleTimerMs >= 850) {
        this.autoBattleTimerMs = 0;
        if (this.combatState.playerMp >= 30) {
          this.executePlayerCombatAction('skill');
        } else {
          this.executePlayerCombatAction('attack');
        }
      }
    }
  },

  startCombat(enemy) {
    if (this.combatExitTimeout) {
      clearTimeout(this.combatExitTimeout);
      this.combatExitTimeout = null;
    }
    const pStats = window.TuTien.Character.getCombatStats();
    const playerFirst = pStats.speed >= enemy.speed;

    this.inCombat = true;
    this.activeView = 'combat';
    this.autoBattle = false;
    this.combatState = {
      enemy: { ...enemy, currentHp: enemy.maxHp, currentMp: enemy.maxMp },
      playerHp: pStats.maxHp,
      playerMaxHp: pStats.maxHp,
      playerMp: pStats.maxMp,
      playerMaxMp: pStats.maxMp,
      playerSpeed: pStats.speed,
      playerAttack: pStats.attack,
      playerPose: 'idle',
      enemyPose: 'idle',
      turnNumber: 1,
      playerFirst,
      finished: false,
      logs: [`Chạm trán 【${enemy.name}】 (${enemy.realmName})! Hãy chọn chiêu thức xuất kích.`]
    };

    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToCombatBgm(enemy.isOverlevel);
    }

    if (!playerFirst) {
      this.performEnemyTurn();
    }

    if (this.mapViewEl) this.mapViewEl.classList.add('hidden');
    if (this.merchantViewEl) this.merchantViewEl.classList.add('hidden');
    if (this.combatViewEl) this.combatViewEl.classList.remove('hidden');
    this.renderCombatView();
  },

  /**
   * MÀN HÌNH CHIẾN ĐẤU LINH ĐÀI TU TIÊN THOÁNG ĐÃNG:
   * - Chính giữa phía trên: Lệnh bài "❖ HIỆP X ❖".
   * - BÊN TRÁI (Phe Ta): Thanh Máu & Linh Lực của mình nằm ngay TRÊN ĐẦU nhân vật của mình (`player-plate` ở trên, `player-spot` ở dưới).
   * - BÊN PHẢI (Phe Địch): Kẻ địch đứng trên bệ Linh Trận phía trên (`enemy-spot`), Thanh Máu của địch nằm ngay DƯỚI CHÂN địch (`enemy-plate`).
   * - Dưới đáy: Khung Ngọc Giản diễn biến 1 câu + Lưới 2×2 Phù Ấn chiêu thức.
   */
  renderCombatView() {
    if (!this.combatViewEl || !this.combatState) return;
    const Utils = window.TuTien.Utils;
    const cs = this.combatState;
    const en = cs.enemy;
    const gender = window.TuTien.Character.getGender();
    const factionCfg = window.TuTien.Character.getFactionConfig();
    const skillName =
      factionCfg.id === 'ma_dao'
        ? '🩸 Huyết Ma Thôn Hồn'
        : '⚔️ Thái Thanh Kiếm Quyết';

    const pHpPct = Utils.clamp((cs.playerHp / cs.playerMaxHp) * 100, 0, 100);
    const pMpPct = Utils.clamp((cs.playerMp / cs.playerMaxMp) * 100, 0, 100);
    const eHpPct = Utils.clamp((en.currentHp / en.maxHp) * 100, 0, 100);

    const playerSpriteSrc = this.getCombatPoseSprite(gender, cs.playerPose);
    const playerAttackClass =
      cs.playerPose === 'attack'
        ? 'player-lunge-right'
        : cs.playerPose === 'skill'
        ? 'player-cast-glow'
        : '';

    const enemyVisualHtml =
      en.type === 'cultivator'
        ? `<img src="${this.getCombatPoseSprite(en.gender || 'male', cs.enemyPose)}" class="poke-fighter-sprite enemy-flip" alt="${en.name}" />`
        : `<div class="poke-monster-sprite ${cs.enemyPose === 'hurt' ? 'hurt-shake' : cs.enemyPose === 'down' ? 'monster-defeated' : ''}">${en.icon}</div>`;

    const latestMessage = cs.logs[0] || `Đang giao chiến với ${en.name}...`;

    this.combatViewEl.innerHTML = `
      <div class="poke-battle-container">
        <!-- SÂN ĐẤU LINH ĐÀI ĐẤU PHÁP -->
        <div class="poke-battle-scene">
          <!-- Lệnh bài HIỆP nằm chính giữa phía trên màn hình trận đấu -->
          <div class="poke-turn-center-badge">❖ HIỆP ${cs.turnNumber} ❖</div>

          <!-- Nút Tự Động góc phải trên sân đấu -->
          <button id="btn-cb-auto" class="poke-auto-pill ${this.autoBattle ? 'active' : ''}" ${cs.finished ? 'disabled' : ''}>
            ⚡ Tự Động: ${this.autoBattle ? 'Bật' : 'Tắt'}
          </button>

          <!-- HAI CỘT ĐỐI KHÁNG: BÊN TRÁI (MÁU MÌNH TRÊN ĐẦU MÌNH) — BÊN PHẢI (MÁU ĐỊCH DƯỚI CHÂN ĐỊCH) -->
          <div class="poke-duel-columns">
            <!-- CỘT TRÁI: PHE TA (Thanh Máu & Linh Lực của mình ở ngay trên đầu nhân vật mình) -->
            <div class="poke-duel-col player-col">
              <div class="poke-status-plate player-plate">
                <div class="poke-plate-header">
                  <span class="poke-fighter-name">${window.TuTien.State.data.character.daoName}</span>
                  <span class="poke-fighter-realm" style="color:${factionCfg.color}">${factionCfg.icon} ${factionCfg.name}</span>
                </div>
                <div class="poke-hp-track">
                  <div class="poke-hp-fill" style="width:${pHpPct.toFixed(1)}%"></div>
                </div>
                <div class="poke-hp-numbers">❤️ ${Utils.formatNumber(cs.playerHp)} / ${Utils.formatNumber(cs.playerMaxHp)}</div>

                <div class="poke-mp-track">
                  <div class="poke-mp-fill" style="width:${pMpPct.toFixed(1)}%"></div>
                </div>
                <div class="poke-hp-numbers">💧 ${Utils.formatNumber(cs.playerMp)} / ${Utils.formatNumber(cs.playerMaxMp)}</div>
              </div>

              <div class="poke-platform-spot player-spot">
                <div class="poke-Actor-wrap">
                  <img src="${playerSpriteSrc}" class="poke-fighter-sprite ${playerAttackClass}" alt="Tu sĩ" />
                </div>
                <div class="poke-ground-pad player-pad"></div>
              </div>
            </div>

            <!-- CỘT PHẢI: PHE ĐỊCH (Kẻ địch đứng trên bệ phía trên, Thanh Máu của địch nằm ngay dưới chân địch) -->
            <div class="poke-duel-col enemy-col">
              <div class="poke-platform-spot enemy-spot">
                <div class="poke-Actor-wrap">
                  ${enemyVisualHtml}
                </div>
                <div class="poke-ground-pad enemy-pad"></div>
              </div>

              <div class="poke-status-plate enemy-plate">
                <div class="poke-plate-header">
                  <span class="poke-fighter-name">${en.name}</span>
                  <span class="poke-fighter-realm">${en.realmName}</span>
                </div>
                <div class="poke-hp-track">
                  <div class="poke-hp-fill enemy-hp" style="width:${eHpPct.toFixed(1)}%"></div>
                </div>
                <div class="poke-hp-numbers">❤️ ${Utils.formatNumber(en.currentHp)} / ${Utils.formatNumber(en.maxHp)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- KHUNG NGỌC GIẢN DIỄN BIẾN + BẢNG 4 PHÙ ẤN CHIÊU THỨC 2×2 -->
        <div class="poke-bottom-dock">
          <div class="poke-dialog-box">
            <p>${latestMessage}</p>
          </div>

          <div class="poke-action-grid">
            <button id="btn-cb-attack" class="poke-move-btn move-attack" ${cs.finished ? 'disabled' : ''}>
              <strong>⚔️ Phổ Công</strong>
              <small>+15 Linh Lực</small>
            </button>
            <button id="btn-cb-skill" class="poke-move-btn move-skill" ${cs.playerMp < 30 || cs.finished ? 'disabled' : ''}>
              <strong>${skillName}</strong>
              <small>30 Linh Lực</small>
            </button>
            <button id="btn-cb-guard" class="poke-move-btn move-guard" ${cs.playerMp < 20 || cs.finished ? 'disabled' : ''}>
              <strong>🛡️ Hộ Thể</strong>
              <small>20 Linh Lực</small>
            </button>
            <button id="btn-cb-leave" class="poke-move-btn move-run">
              <strong>🏳️ Rút Lui</strong>
              <small>Về Bản Đồ</small>
            </button>
          </div>
        </div>
      </div>
    `;

    const bindBtn = (id, fn) => {
      const b = document.getElementById(id);
      if (b) {
        b.addEventListener('pointerdown', e => {
          e.preventDefault();
          fn();
        });
      }
    };

    bindBtn('btn-cb-attack', () => this.executePlayerCombatAction('attack'));
    bindBtn('btn-cb-skill', () => this.executePlayerCombatAction('skill'));
    bindBtn('btn-cb-guard', () => this.executePlayerCombatAction('guard'));
    bindBtn('btn-cb-auto', () => {
      this.autoBattle = !this.autoBattle;
      this.renderCombatView();
    });
    bindBtn('btn-cb-leave', () => this.exitCombatToMap());
  },

  executePlayerCombatAction(actionType) {
    const cs = this.combatState;
    if (!cs || cs.finished) return;

    const Utils = window.TuTien.Utils;
    const en = cs.enemy;
    const factionId = window.TuTien.Character.getFactionId();
    let dmg = 0;
    let guardMultiplier = 1.0;

    if (actionType === 'attack') {
      dmg = Math.round(cs.playerAttack * Utils.randomRange(0.92, 1.12));
      cs.playerMp = Math.min(cs.playerMaxMp, cs.playerMp + 15);
      cs.playerPose = 'attack';
      cs.enemyPose = 'hurt';
      en.currentHp = Math.max(0, en.currentHp - dmg);
      cs.logs.unshift(`⚔️ Xuất kiếm chém trúng ${en.name}, gây -${Utils.formatNumber(dmg)} sát thương!`);
    } else if (actionType === 'skill' && cs.playerMp >= 30) {
      cs.playerMp -= 30;
      cs.playerPose = 'skill';
      cs.enemyPose = 'hurt';
      if (factionId === 'ma_dao') {
        dmg = Math.round(cs.playerAttack * 2.45 * Utils.randomRange(0.95, 1.1));
        const lifesteal = Math.round(dmg * 0.25);
        en.currentHp = Math.max(0, en.currentHp - dmg);
        cs.playerHp = Math.min(cs.playerMaxHp, cs.playerHp + lifesteal);
        cs.logs.unshift(
          `🩸 【Huyết Ma Thôn Hồn】 gây -${Utils.formatNumber(dmg)} sát thương, hút +${Utils.formatNumber(lifesteal)} Máu!`
        );
      } else {
        dmg = Math.round(cs.playerAttack * 2.25 * Utils.randomRange(0.95, 1.1));
        const heal = Math.round(cs.playerMaxHp * 0.15);
        en.currentHp = Math.max(0, en.currentHp - dmg);
        cs.playerHp = Math.min(cs.playerMaxHp, cs.playerHp + heal);
        cs.logs.unshift(
          `⚔️ 【Thái Thanh Kiếm Quyết】 gây -${Utils.formatNumber(dmg)} sát thương, hồi +${Utils.formatNumber(heal)} Máu!`
        );
      }
    } else if (actionType === 'guard' && cs.playerMp >= 20) {
      cs.playerMp -= 20;
      cs.playerPose = 'meditate';
      guardMultiplier = 0.4;
      const heal = Math.round(cs.playerMaxHp * 0.22);
      cs.playerHp = Math.min(cs.playerMaxHp, cs.playerHp + heal);
      cs.logs.unshift(`🛡️ Vận Hộ Thể Linh Thuẫn: hồi +${Utils.formatNumber(heal)} Máu, giảm 60% sát thương!`);
    } else {
      return;
    }

    if (en.currentHp <= 0) {
      cs.enemyPose = 'down';
      cs.finished = true;
      this.onWinCombat(en);
      this.renderCombatView();
      this.scheduleAutoExitCombat();
      return;
    }

    this.performEnemyTurn(guardMultiplier);
    cs.turnNumber += 1;
    this.renderCombatView();
  },

  performEnemyTurn(guardMultiplier = 1.0) {
    const cs = this.combatState;
    if (!cs || cs.finished) return;
    const Utils = window.TuTien.Utils;
    const en = cs.enemy;

    const rawDmg = en.attack * Utils.randomRange(0.88, 1.15) * guardMultiplier;
    const dmg = Math.max(1, Math.round(rawDmg));
    cs.playerHp = Math.max(0, cs.playerHp - dmg);

    cs.logs.unshift(`💥 ${en.name} phản kích, bạn mất -${Utils.formatNumber(dmg)} Máu!`);

    if (cs.playerHp <= 0) {
      cs.playerPose = 'down';
      cs.finished = true;
      const loseMsg = `⚠️ Trọng thương trước ${en.name}! Tự động thu thân về Bí Cảnh Hồng Hoang...`;
      cs.logs.unshift(loseMsg);
      window.TuTien.State.addLog(`Trọng thương khi giao chiến với 【${en.name}】 tại Bí Cảnh Hồng Hoang.`, 'warn');
      if (window.TuTien.UI) {
        window.TuTien.UI.showToast(loseMsg, 'warn', 'angry');
      }
      this.scheduleAutoExitCombat();
    }
  },

  scheduleAutoExitCombat() {
    if (this.combatExitTimeout) {
      clearTimeout(this.combatExitTimeout);
    }
    this.combatExitTimeout = setTimeout(() => {
      this.combatExitTimeout = null;
      if (this.inCombat) {
        this.exitCombatToMap();
      }
    }, 850);
  },

  onWinCombat(enemy) {
    const State = window.TuTien.State;
    const Utils = window.TuTien.Utils;
    const Inv = window.TuTien.Inventory;
    const Upgrades = window.TuTien.Upgrades;
    const Fields = window.TuTien.Fields;

    const baseProd = window.TuTien.Cultivate.getBasePassiveRate();
    const powerFactor = enemy.statScale || 1.0;
    const rewardQi = Math.max(
      80,
      Math.round((baseProd * 28 + (enemy.realmIndex + 1) * 95) * powerFactor * (enemy.isOverlevel ? 2.2 : 1.0))
    );

    window.TuTien.Cultivate.addQi(rewardQi);
    const lootMessages = [`+${Utils.formatNumber(rewardQi)} Linh Khí`];

    const lowStones = Math.round(Utils.randomInt(12, 35) * powerFactor * (enemy.isOverlevel ? 2.5 : 1));
    Inv.addSpiritStones(lowStones, 0, 0);
    lootMessages.push(`+${Inv.formatSpiritStoneCost(lowStones)}`);

    if (enemy.type === 'cultivator') {
      State.data.stats.roguesDefeated = (State.data.stats.roguesDefeated || 0) + 1;
    } else {
      State.data.stats.monstersDefeated = (State.data.stats.monstersDefeated || 0) + 1;
    }

    const herbChance = enemy.isOverlevel ? 0.95 : 0.65;
    if (Math.random() < herbChance) {
      const minTier = enemy.isOverlevel ? 3 : 2;
      const maxTier = enemy.isOverlevel ? 5 : 4;
      const qObj = Inv.getQualityByTier(Utils.randomInt(minTier, maxTier));
      const allHerbs = window.TuTien.HERB_TYPES;
      const pickedHerb = allHerbs[Math.floor(Math.random() * allHerbs.length)];
      const qty = enemy.isOverlevel ? 2 : 1;

      Inv.addStackableItem(
        'herb',
        pickedHerb.id,
        pickedHerb.name,
        pickedHerb.icon,
        qObj,
        `${pickedHerb.shortDesc || pickedHerb.desc} (${qObj.name} x${qObj.mult})`,
        qty
      );
      lootMessages.push(`+${qty} ${pickedHerb.name} [${qObj.name}]`);
    }

    const secretChance = enemy.isOverlevel ? 0.55 : 0.20;
    if (Math.random() < secretChance) {
      const lockedTechs = window.TuTien.UPGRADES.filter(u => u.requiresUnlock && !Upgrades.isUnlocked(u));
      const lockedPills = window.TuTien.PILL_RECIPES.filter(r => r.requiresRecipeUnlock && !Fields.isPillRecipeUnlocked(r));
      const lockedTals = window.TuTien.TALISMAN_RECIPES.filter(t => t.requiresRecipeUnlock && !Fields.isTalismanRecipeUnlocked(t));

      if (lockedTechs.length > 0 && Math.random() < 0.45) {
        const t = lockedTechs[Math.floor(Math.random() * lockedTechs.length)];
        Upgrades.unlockTechnique(t.id);
        lootMessages.push(`📘 Bí Tịch 【${Upgrades.getDisplayName(t)}】`);
      } else if (lockedPills.length > 0 && Math.random() < 0.6) {
        const p = lockedPills[Math.floor(Math.random() * lockedPills.length)];
        Fields.unlockPillRecipe(p.id);
        lootMessages.push(`📜 Đan Phương 【${p.name}】`);
      } else if (lockedTals.length > 0) {
        const tal = lockedTals[Math.floor(Math.random() * lockedTals.length)];
        Fields.unlockTalismanRecipe(tal.id);
        lootMessages.push(`🧧 Phù Phương 【${tal.name}】`);
      }
    }

    if (enemy.isOverlevel) {
      State.data.prestige.daoVan += 2;
      State.data.prestige.totalDaoVanEarned += 2;
      lootMessages.push(`+2 Đạo Vận`);
    }

    this.nodes = this.nodes.filter(n => n.id !== enemy.id);

    const summaryStr = `🏆 Trảm 【${enemy.name}】! Nhận: ${lootMessages.join(' • ')}`;
    this.combatState.logs.unshift(summaryStr);
    State.addLog(summaryStr, 'success');

    if (window.TuTien.Audio) window.TuTien.Audio.playBreakthroughSuccess();
    if (window.TuTien.UI) {
      window.TuTien.UI.showToast(summaryStr, 'success', 'happy');
      window.TuTien.UI.updateAll();
    }
  },

  exitCombatToMap() {
    if (this.combatExitTimeout) {
      clearTimeout(this.combatExitTimeout);
      this.combatExitTimeout = null;
    }
    this.inCombat = false;
    this.autoBattle = false;
    this.combatState = null;
    this.activeView = 'map';

    if (window.TuTien.Audio) {
      window.TuTien.Audio.switchToTrainingBgm();
    }

    if (this.combatViewEl) this.combatViewEl.classList.add('hidden');
    if (this.merchantViewEl) this.merchantViewEl.classList.add('hidden');
    if (this.mapViewEl) this.mapViewEl.classList.remove('hidden');

    this.renderMapNodes();
    this.updateFogVisibilityForNodes();
    this.updateHeaderDOM();
    this.renderMinimap();
  }
};
