//
// AudioEngine.js
// Lightweight Web Audio wrapper to control playback, volume, analysis, and time updates.
// No external dependencies. Designed for React usage.
//
// PUBLIC_INTERFACE
export default class AudioEngine {
  /**
   * This class wraps an HTMLAudioElement connected to an AudioContext via
   * MediaElementSource -> GainNode -> AnalyserNode -> Destination.
   *
   * Public API:
   * - init/resume(): initialize and/or resume the AudioContext (autoplay policy)
   * - load(url, metadata?): load a new audio source URL
   * - play(): play with a short fade-in
   * - pause(): pause with a short fade-out
   * - seek(seconds): seek playback position in seconds
   * - setVolume(0..1): set linear gain (0..1)
   * - getCurrentTime(): seconds
   * - getDuration(): seconds (NaN if unknown)
   * - onTimeUpdate(cb): subscribe to time updates (cb(currentTime, duration, bufferedSeconds))
   * - onAnalyzerData(cb): subscribe to analyzer data (Uint8Array of frequency bins)
   * - dispose(): cleanup
   */
  constructor({ fadeMs = 200, fftSize = 1024 } = {}) {
    // Dom audio element
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.crossOrigin = "anonymous";

    // AudioContext related
    this.ctx = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.analyser = null;

    // Fade settings
    this.fadeMs = Math.max(0, fadeMs);

    // Analyzer
    this.fftSize = fftSize;
    this.freqData = null;

    // Volume cache (0..1). Default to 1.0
    this._volume = 1.0;

    // Subscribers
    this._timeSubs = new Set();
    this._analyserSubs = new Set();

    // RAF loop ids
    this._rafId = null;
    this._rafAnalyserId = null;

    // Bind handlers
    this._onTimeTick = this._onTimeTick.bind(this);
    this._onAnalyserTick = this._onAnalyserTick.bind(this);
    this._onAudioEnded = this._onAudioEnded.bind(this);
    this._onAudioProgress = this._onAudioProgress.bind(this);

    // Attach basic events
    this.audio.addEventListener("ended", this._onAudioEnded);
    this.audio.addEventListener("progress", this._onAudioProgress);
    this.audio.addEventListener("loadedmetadata", () => {
      // Trigger a time tick so subscribers get initial duration
      this._emitTimeUpdate();
    });
  }

  // PUBLIC_INTERFACE
  async init() {
    /** Initialize AudioContext graph if not already created. */
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      throw new Error("Web Audio API not supported in this browser.");
    }
    this.ctx = new Ctx();

    // Create nodes
    this.gainNode = this.ctx.createGain();
    // start at volume 0 to allow fade-in on first play
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    const bins = this.analyser.frequencyBinCount;
    this.freqData = new Uint8Array(bins);

    // Create media element source (must be after ctx exists)
    this.sourceNode = this.ctx.createMediaElementSource(this.audio);

    // Connect graph: source -> gain -> analyser -> destination
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  // PUBLIC_INTERFACE
  async resume() {
    /**
     * Resume AudioContext due to autoplay restrictions.
     * Should be called on first user gesture (e.g., in play() path).
     */
    if (!this.ctx) await this.init();
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  // PUBLIC_INTERFACE
  async load(url, metadata = {}) {
    /**
     * Load an audio URL. Stops current playback and resets timers.
     */
    // Pause and reset
    try {
      this.audio.pause();
    } catch {}
    // Clear source and set new
    this.audio.src = url;
    // Attach metadata if needed in future
    this._metadata = metadata || {};
    // Ensure context exists
    await this.init();
    // Reset gain to 0 so next play can fade-in
    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    // Reset time loop to provide early duration if available
    this._emitTimeUpdate();
  }

  // INTERNAL fade helper
  _fadeTo(targetGain, durationMs) {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;
    const dur = Math.max(0, durationMs) / 1000;
    this.gainNode.gain.cancelScheduledValues(now);
    const current = this.gainNode.gain.value;
    this.gainNode.gain.setValueAtTime(current, now);
    this.gainNode.gain.linearRampToValueAtTime(targetGain, now + dur);
  }

  // PUBLIC_INTERFACE
  async play() {
    /**
     * Plays audio and performs a short fade-in.
     * Resumes AudioContext to satisfy autoplay policy.
     */
    await this.resume();

    // Start audio element
    await this.audio.play().catch(() => {
      // If play() fails (e.g., due to policy), the resume() above should handle it
      // but in some browsers, user gesture is still required. Surface error silently.
    });

    // Fade in to current volume
    this._fadeTo(this._volume, this.fadeMs);

    // Start RAF loops
    this._beginLoops();
  }

  // PUBLIC_INTERFACE
  async pause() {
    /**
     * Pauses audio with a short fade-out.
     */
    if (!this.ctx || !this.gainNode) {
      try {
        this.audio.pause();
      } catch {}
      this._endLoops();
      return;
    }

    // Fade out, then pause
    this._fadeTo(0, this.fadeMs);
    // Schedule pause slightly after fade duration
    setTimeout(() => {
      try {
        this.audio.pause();
      } catch {}
      this._endLoops();
    }, this.fadeMs + 10);
  }

  // PUBLIC_INTERFACE
  seek(seconds) {
    /** Seek to provided time in seconds. */
    if (!Number.isFinite(seconds)) return;
    const clamped = Math.max(0, seconds);
    try {
      this.audio.currentTime = clamped;
    } catch {}
    // Emit immediate update
    this._emitTimeUpdate();
  }

  // PUBLIC_INTERFACE
  setVolume(v) {
    /**
     * Set linear gain 0..1. If playing, ramp smoothly to target.
     */
    const vol = Math.min(1, Math.max(0, Number(v)));
    if (Number.isNaN(vol)) return;
    this._volume = vol;
    if (this.ctx && this.gainNode) {
      // Smooth ramp over a short time for better UX
      const ms = 120;
      this._fadeTo(this.audio.paused ? 0 : this._volume, ms);
    }
  }

  // PUBLIC_INTERFACE
  getCurrentTime() {
    /** Returns current time in seconds. */
    return Number(this.audio.currentTime || 0);
    }

  // PUBLIC_INTERFACE
  getDuration() {
    /** Returns duration in seconds (NaN if unknown). */
    return Number(this.audio.duration);
  }

  // PUBLIC_INTERFACE
  onTimeUpdate(cb) {
    /**
     * Subscribe to time updates. Returns an unsubscribe function.
     * Callback signature: (currentTime: number, duration: number, bufferedSeconds: number) => void
     */
    if (typeof cb !== "function") return () => {};
    this._timeSubs.add(cb);
    // Push an immediate update to new subscriber
    this._emitTimeUpdate();
    return () => {
      this._timeSubs.delete(cb);
    };
  }

  // PUBLIC_INTERFACE
  onAnalyzerData(cb) {
    /**
     * Subscribe to analyser data updates. Returns an unsubscribe function.
     * Callback signature: (freqUint8Array) => void
     */
    if (typeof cb !== "function") return () => {};
    this._analyserSubs.add(cb);
    return () => {
      this._analyserSubs.delete(cb);
    };
  }

  // INTERNAL
  _emitTimeUpdate() {
    if (this._timeSubs.size === 0) return;
    const current = this.getCurrentTime();
    const duration = this.getDuration();

    // Compute buffered seconds (end of last buffered range)
    let bufferedSeconds = 0;
    try {
      const ranges = this.audio.buffered;
      if (ranges && ranges.length > 0) {
        bufferedSeconds = Number(ranges.end(ranges.length - 1) || 0);
      }
    } catch {
      bufferedSeconds = 0;
    }

    for (const cb of this._timeSubs) {
      try {
        cb(current, duration, bufferedSeconds);
      } catch {
        // ignore subscriber errors
      }
    }
  }

  // INTERNAL
  _onTimeTick() {
    this._emitTimeUpdate();
    this._rafId = window.requestAnimationFrame(this._onTimeTick);
  }

  // INTERNAL
  _onAnalyserTick() {
    if (this.analyser && this.freqData) {
      try {
        this.analyser.getByteFrequencyData(this.freqData);
        if (this._analyserSubs.size) {
          for (const cb of this._analyserSubs) {
            try {
              cb(this.freqData);
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }
    }
    this._rafAnalyserId = window.requestAnimationFrame(this._onAnalyserTick);
  }

  // INTERNAL
  _beginLoops() {
    if (this._rafId == null) {
      this._rafId = window.requestAnimationFrame(this._onTimeTick);
    }
    if (this._rafAnalyserId == null) {
      this._rafAnalyserId = window.requestAnimationFrame(this._onAnalyserTick);
    }
  }

  // INTERNAL
  _endLoops() {
    if (this._rafId != null) {
      window.cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this._rafAnalyserId != null) {
      window.cancelAnimationFrame(this._rafAnalyserId);
      this._rafAnalyserId = null;
    }
  }

  // INTERNAL
  _onAudioEnded() {
    // Ensure loops stop and emit final time update
    this._endLoops();
    this._emitTimeUpdate();
  }

  // INTERNAL
  _onAudioProgress() {
    // Notifying buffered updates proactively
    this._emitTimeUpdate();
  }

  // PUBLIC_INTERFACE
  dispose() {
    /** Cleanup nodes and subscriptions. */
    try {
      this.audio.pause();
    } catch {}
    this._endLoops();

    this.audio.removeEventListener("ended", this._onAudioEnded);
    this.audio.removeEventListener("progress", this._onAudioProgress);

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {}
    }
    // Close AudioContext if allowed
    if (this.ctx && typeof this.ctx.close === "function") {
      try {
        // Some browsers disallow closing/resuming cycle frequently; ignore errors.
        this.ctx.close();
      } catch {}
    }

    this._timeSubs.clear();
    this._analyserSubs.clear();

    this.ctx = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.analyser = null;
    this.freqData = null;
  }
}
