/**
 * Global Jest setup for the app.
 *
 * - Adds @testing-library/jest-dom matchers
 * - Stubs HTMLAudioElement.play/pause to avoid autoplay errors in jsdom
 * - Stubs minimal Web Audio API (AudioContext) used by AudioEngine
 * - Provides requestAnimationFrame/cancelAnimationFrame fallback for jsdom
 */
import '@testing-library/jest-dom';

// Stub requestAnimationFrame for environments where it's missing
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
}
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}

// Stub HTMLMediaElement play/pause to avoid "NotAllowedError: play() failed because the user didn't interact with the document"
const mediaProto = window.HTMLMediaElement && window.HTMLMediaElement.prototype;
if (mediaProto) {
  if (!mediaProto.play || !mediaProto.play.__stubbed) {
    const play = function play() {
      return Promise.resolve(); // pretend playback started
    };
    play.__stubbed = true;
    mediaProto.play = play;
  }
  if (!mediaProto.pause || !mediaProto.pause.__stubbed) {
    const pause = function pause() {
      return undefined;
    };
    pause.__stubbed = true;
    mediaProto.pause = pause;
  }
}

// Minimal AudioContext stub for Web Audio API usage in AudioEngine
if (!window.AudioContext && !window.webkitAudioContext) {
  class FakeGain {
    constructor() {
      this.gain = {
        value: 1,
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        cancelScheduledValues: () => {},
      };
    }
    connect() {}
    disconnect() {}
  }
  class FakeAnalyser {
    constructor() {
      this.fftSize = 2048;
      this.frequencyBinCount = 1024;
    }
    connect() {}
    disconnect() {}
    getByteFrequencyData(arr) {
      if (arr && arr.length) {
        // Fill with zeros to be deterministic
        arr.fill(0);
      }
    }
  }
  class FakeMediaElementSource {
    connect() {}
    disconnect() {}
  }
  class FakeAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'suspended';
      this.destination = {};
    }
    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
    close() {
      this.state = 'closed';
      return Promise.resolve();
    }
    createGain() {
      return new FakeGain();
    }
    createAnalyser() {
      return new FakeAnalyser();
    }
    createMediaElementSource() {
      return new FakeMediaElementSource();
    }
  }
  window.AudioContext = FakeAudioContext;
  window.webkitAudioContext = FakeAudioContext;
}
