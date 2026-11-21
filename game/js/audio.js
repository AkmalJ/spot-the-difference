// audio.js — every sound in Pasar Perbedaan is synthesized with the Web
// Audio API: no audio files, nothing to load. The context is created
// lazily on the first call, which always follows a click or a key press,
// so the browser's autoplay rules are satisfied.

let sharedContext = null;

function audioContext() {
  if (sharedContext === null) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (Ctor === undefined) return null;
    sharedContext = new Ctor();
  }
  if (sharedContext.state === 'suspended') void sharedContext.resume();
  return sharedContext;
}

function tone({ frequency, at = 0, duration = 0.12, type = 'sine', volume = 0.16, slideTo = null }) {
  const ctx = audioContext();
  if (ctx === null) return;
  const start = ctx.currentTime + at;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo !== null) {
    oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

// A bright two-note chirp when a difference is found.
export function playFind() {
  tone({ frequency: 659.25, duration: 0.1, type: 'triangle', volume: 0.2 });
  tone({ frequency: 987.77, at: 0.07, duration: 0.16, type: 'triangle', volume: 0.2 });
}

// A low dull buzz for a wrong click.
export function playWrong() {
  tone({ frequency: 164.81, duration: 0.22, type: 'sawtooth', volume: 0.1, slideTo: 110 });
}

// A soft rising blip when a hint pulses.
export function playHint() {
  tone({ frequency: 523.25, duration: 0.12, type: 'sine', volume: 0.14, slideTo: 783.99 });
}

// A small fanfare arpeggio when the last difference is found.
export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, i) => {
    tone({ frequency, at: i * 0.11, duration: 0.22, type: 'triangle', volume: 0.2 });
  });
  tone({ frequency: 1318.5, at: 0.46, duration: 0.4, type: 'triangle', volume: 0.16 });
}

// A neutral tick for buttons.
export function playClick() {
  tone({ frequency: 440, duration: 0.05, type: 'square', volume: 0.06 });
}
