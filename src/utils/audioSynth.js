/**
 * audioSynth.js
 * Hardware audio synthesizer using Web Audio API.
 * Provides realistic sensory feedback for buzzer alerts, multimeter continuity test,
 * relay clicks, and motor spinning without any external audio asset dependencies.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a multimeter continuity beep (1800 Hz sine tone)
 */
export function playContinuityBeep(durationMs = 250) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    console.debug('Audio synth error:', e);
  }
}

/**
 * Play parking sensor or alert buzzer beep
 */
export function playBuzzerTone(freq = 1000, durationMs = 120) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    console.debug('Audio synth error:', e);
  }
}

/**
 * Play electromechanical relay click sound (dual transient clicks)
 */
export function playRelayClick(isOpen = true) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * 0.05; // 50ms buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = isOpen ? 2200 : 1800;
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {
    console.debug('Audio synth error:', e);
  }
}

/**
 * Motor hum audio synthesis node manager
 */
let activeMotorNode = null;

export function setMotorSound(rpm = 0, maxRpm = 3000) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (rpm <= 0) {
    if (activeMotorNode) {
      try {
        activeMotorNode.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        setTimeout(() => {
          if (activeMotorNode) {
            activeMotorNode.osc.stop();
            activeMotorNode = null;
          }
        }, 120);
      } catch (e) {}
    }
    return;
  }

  const normalizedRpm = Math.min(1, Math.max(0, rpm / maxRpm));
  const baseFreq = 40 + normalizedRpm * 180; // 40Hz to 220Hz hum

  if (!activeMotorNode) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      activeMotorNode = { osc, gain };
    } catch (e) {
      console.debug('Motor synth error:', e);
    }
  } else {
    try {
      activeMotorNode.osc.frequency.linearRampToValueAtTime(baseFreq, ctx.currentTime + 0.05);
      activeMotorNode.gain.gain.linearRampToValueAtTime(0.02 + normalizedRpm * 0.04, ctx.currentTime + 0.05);
    } catch (e) {}
  }
}
