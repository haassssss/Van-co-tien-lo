/**
 * js/audio.js
 * Hệ thống phát 5 bản nhạc MP3 của người chơi kết hợp với Hiệu ứng âm thanh (SFX) Web Audio:
 * - Lúc Tu Luyện / Ở Động Phủ / Đi dạo Bản Đồ: phát luân phiên 2 bài `training1.mp3` và `training2.mp3`.
 * - Lúc Giao Chiến thường (1v1 ngang cấp hoặc dưới cấp): phát `one-vs-one.mp3`.
 * - Lúc Đánh Vượt Cấp (đối thủ cảnh giới cao hơn mình) hoặc Độ Đại Thiên Kiếp: phát `clouds-over-the-river.mp3` (Clouds over the River).
 * - Đưa sẵn `clan-war.mp3` vào hệ thống (`playClanWarBgm()`) để dùng cho Tông Môn Chiến về sau.
 */
window.TuTien = window.TuTien || {};

window.TuTien.Audio = {
  ctx: null,
  musicEnabled: true,
  sfxEnabled: true,
  currentMode: 'training', // 'training' | '1v1' | 'overlevel' | 'clanwar'
  trainingTrackIndex: 0,
  audioEl: null,

  TRACKS: {
    training: ['assets/audio/training1.mp3', 'assets/audio/training2.mp3'],
    oneVsOne: 'assets/audio/one-vs-one.mp3',
    overlevel: 'assets/audio/clouds-over-the-river.mp3',
    clanWar: 'assets/audio/clan-war.mp3'
  },

  NOTES: [329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77],

  init() {
    const State = window.TuTien.State;
    if (State && State.data && State.data.settings) {
      const s = State.data.settings;
      if (s.musicEnabled !== undefined) this.musicEnabled = !!s.musicEnabled;
      if (s.sfxEnabled !== undefined) this.sfxEnabled = !!s.sfxEnabled;
    }

    // Khởi tạo phần tử HTMLAudioElement để phát các file MP3 mượt mà
    this.audioEl = new window.Audio();
    this.audioEl.preload = 'auto';
    this.audioEl.volume = 0.55;

    // Khi một bài nhạc kết thúc: nếu đang ở chế độ 'training' thì tự động chuyển luân phiên training1 <-> training2
    this.audioEl.addEventListener('ended', () => {
      if (!this.musicEnabled) return;
      if (this.currentMode === 'training') {
        this.trainingTrackIndex = (this.trainingTrackIndex + 1) % this.TRACKS.training.length;
        this.playCurrentModeTrack();
      } else {
        // Các bản nhạc chiến đấu tự lặp lại nếu trận đấu vẫn đang diễn ra
        this.audioEl.currentTime = 0;
        this.audioEl.play().catch(() => {});
      }
    });

    this.updateSoundButtonUI();

    const unlockAudio = () => {
      this.ensureContext();
      if (this.musicEnabled && this.audioEl.paused) {
        this.playCurrentModeTrack();
      }
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
  },

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  /**
   * Phát bản nhạc ứng với chế độ hiện tại ('training', '1v1', 'overlevel', 'clanwar')
   */
  playCurrentModeTrack() {
    if (!this.audioEl || !this.musicEnabled) return;

    let targetSrc = '';
    if (this.currentMode === 'training') {
      targetSrc = this.TRACKS.training[this.trainingTrackIndex % this.TRACKS.training.length];
    } else if (this.currentMode === '1v1') {
      targetSrc = this.TRACKS.oneVsOne;
    } else if (this.currentMode === 'overlevel') {
      targetSrc = this.TRACKS.overlevel;
    } else if (this.currentMode === 'clanwar') {
      targetSrc = this.TRACKS.clanWar;
    }

    if (!targetSrc) return;
    if (!this.audioEl.src || !this.audioEl.src.endsWith(targetSrc)) {
      this.audioEl.src = targetSrc;
    }
    this.audioEl.play().catch(() => {});
  },

  /**
   * Chuyển về nhạc Tập Luyện / Tu Luyện (phát luân phiên training1.mp3 & training2.mp3)
   */
  switchToTrainingBgm() {
    if (this.currentMode === 'training' && !this.audioEl.paused) return;
    this.currentMode = 'training';
    if (this.musicEnabled) {
      this.playCurrentModeTrack();
    }
  },

  /**
   * Chuyển sang nhạc Giao Chiến:
   * - Nếu isOverlevel = true (đánh vượt cấp cảnh giới): phát `clouds-over-the-river.mp3`
   * - Ngược lại: phát `one-vs-one.mp3`
   */
  switchToCombatBgm(isOverlevel = false) {
    const nextMode = isOverlevel ? 'overlevel' : '1v1';
    if (this.currentMode === nextMode && !this.audioEl.paused) return;
    this.currentMode = nextMode;
    if (this.musicEnabled) {
      this.playCurrentModeTrack();
    }
  },

  /**
   * Hàm phát sẵn nhạc Tông Môn Chiến (`clan-war.mp3`) để dành mở rộng sau này
   */
  playClanWarBgm() {
    this.currentMode = 'clanwar';
    if (this.musicEnabled) {
      this.playCurrentModeTrack();
    }
  },

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (window.TuTien.State && window.TuTien.State.data) {
      window.TuTien.State.data.settings.musicEnabled = this.musicEnabled;
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }

    if (this.musicEnabled) {
      this.playCurrentModeTrack();
    } else if (this.audioEl) {
      this.audioEl.pause();
    }
    this.updateSoundButtonUI();
    if (window.TuTien.Panels) window.TuTien.Panels.renderSystemPanel();
  },

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    if (window.TuTien.State && window.TuTien.State.data) {
      window.TuTien.State.data.settings.sfxEnabled = this.sfxEnabled;
      if (window.TuTien.Save) window.TuTien.Save.saveToLocal();
    }
    if (this.sfxEnabled) {
      this.ensureContext();
      this.playPluck(659.25, 0.5, 0.08);
    }
    if (window.TuTien.Panels) window.TuTien.Panels.renderSystemPanel();
  },

  toggleSound() {
    this.toggleMusic();
  },

  updateSoundButtonUI() {
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) {
      btn.innerHTML = this.musicEnabled ? '🎵 Nhạc: Bật' : '🔇 Nhạc: Tắt';
      btn.classList.toggle('sound-on', this.musicEnabled);
    }
  },

  playPluck(freq, duration = 0.9, volume = 0.08) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(volume * 0.35, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.4);

    osc1.connect(gain);
    osc2.connect(gain2);
    gain2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.04);
    osc2.stop(now + duration + 0.04);
  },

  playClickQi() {
    // Đã tắt tiếng khi click vận công
  },

  playCraftSuccess(tier = 1) {
    if (!this.sfxEnabled) return;
    const baseNotes = [440, 587.33, 659.25, 880, 1046.5];
    baseNotes.slice(0, Math.min(5, tier + 1)).forEach((freq, idx) => {
      setTimeout(() => {
        this.playPluck(freq, 0.85, 0.09);
      }, idx * 75);
    });
  },

  playThunderStrike() {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.45;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.14));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(580, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + 0.42);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  },

  playBreakthroughSuccess(isMajor = false) {
    if (!this.sfxEnabled) return;
    const chord = isMajor
      ? [329.63, 440.0, 587.33, 659.25, 880.0, 1174.66]
      : [440.0, 587.33, 659.25, 880.0];

    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPluck(freq, isMajor ? 2.4 : 1.5, isMajor ? 0.14 : 0.10);
      }, idx * 70);
    });
  },

  playBreakthroughFail() {
    if (!this.sfxEnabled) return;
    this.playPluck(196.0, 1.2, 0.12);
    setTimeout(() => this.playPluck(164.81, 1.5, 0.12), 160);
  }
};
