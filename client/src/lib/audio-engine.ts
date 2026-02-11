type GenreProfile = {
  baseFreq: number;
  scale: number[];
  tempo: number;
  waveform: OscillatorType;
  filterFreq: number;
  filterQ: number;
  attackTime: number;
  releaseTime: number;
  reverbMix: number;
  delayTime: number;
  delayFeedback: number;
  lfoRate: number;
  lfoDepth: number;
};

const GENRE_PROFILES: Record<string, GenreProfile> = {
  Electronic: {
    baseFreq: 130.81,
    scale: [0, 3, 5, 7, 10, 12, 15, 17],
    tempo: 128,
    waveform: "sawtooth",
    filterFreq: 2000,
    filterQ: 5,
    attackTime: 0.02,
    releaseTime: 0.3,
    reverbMix: 0.3,
    delayTime: 0.375,
    delayFeedback: 0.35,
    lfoRate: 0.25,
    lfoDepth: 400,
  },
  "Hip-Hop": {
    baseFreq: 65.41,
    scale: [0, 3, 5, 7, 10, 12, 14, 15],
    tempo: 90,
    waveform: "square",
    filterFreq: 800,
    filterQ: 3,
    attackTime: 0.01,
    releaseTime: 0.2,
    reverbMix: 0.2,
    delayTime: 0.5,
    delayFeedback: 0.25,
    lfoRate: 0.1,
    lfoDepth: 100,
  },
  Ambient: {
    baseFreq: 220,
    scale: [0, 2, 4, 7, 9, 12, 14, 16],
    tempo: 60,
    waveform: "sine",
    filterFreq: 3000,
    filterQ: 1,
    attackTime: 0.8,
    releaseTime: 2.0,
    reverbMix: 0.7,
    delayTime: 0.6,
    delayFeedback: 0.5,
    lfoRate: 0.05,
    lfoDepth: 200,
  },
  Synthwave: {
    baseFreq: 110,
    scale: [0, 2, 3, 5, 7, 8, 10, 12],
    tempo: 110,
    waveform: "sawtooth",
    filterFreq: 1500,
    filterQ: 8,
    attackTime: 0.05,
    releaseTime: 0.4,
    reverbMix: 0.4,
    delayTime: 0.3,
    delayFeedback: 0.4,
    lfoRate: 0.3,
    lfoDepth: 500,
  },
  Pop: {
    baseFreq: 261.63,
    scale: [0, 2, 4, 5, 7, 9, 11, 12],
    tempo: 120,
    waveform: "triangle",
    filterFreq: 2500,
    filterQ: 2,
    attackTime: 0.03,
    releaseTime: 0.25,
    reverbMix: 0.25,
    delayTime: 0.25,
    delayFeedback: 0.3,
    lfoRate: 0.15,
    lfoDepth: 150,
  },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

type EngineState = "stopped" | "playing" | "paused";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private schedulerTimer: number | null = null;
  private state: EngineState = "stopped";
  private currentStep = 0;
  private nextNoteTime = 0;
  private profile: GenreProfile = GENRE_PROFILES.Electronic;
  private rng: () => number = seededRandom(0);
  private filter: BiquadFilterNode | null = null;
  private graphNodes: AudioNode[] = [];
  private volumeValue = 0.5;

  private getOrCreateContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  private teardownGraph() {
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    for (const node of this.graphNodes) {
      try { node.disconnect(); } catch {}
      if (node instanceof OscillatorNode) {
        try { node.stop(0); } catch {}
      }
    }
    this.graphNodes = [];
    this.filter = null;
    this.masterGain = null;
  }

  private buildGraph() {
    const ctx = this.getOrCreateContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.volumeValue;
    this.graphNodes.push(this.masterGain);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    this.graphNodes.push(compressor);

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = this.profile.filterFreq;
    this.filter.Q.value = this.profile.filterQ;
    this.graphNodes.push(this.filter);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = this.profile.lfoRate;
    lfoGain.gain.value = this.profile.lfoDepth;
    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    lfo.start();
    this.graphNodes.push(lfo, lfoGain);

    const convolver = ctx.createConvolver();
    const reverbLength = ctx.sampleRate * 2;
    const reverbBuffer = ctx.createBuffer(2, reverbLength, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = reverbBuffer.getChannelData(ch);
      for (let i = 0; i < reverbLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2.5);
      }
    }
    convolver.buffer = reverbBuffer;
    this.graphNodes.push(convolver);

    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = this.profile.delayTime;
    const delayFeedbackGain = ctx.createGain();
    delayFeedbackGain.gain.value = this.profile.delayFeedback;
    delay.connect(delayFeedbackGain);
    delayFeedbackGain.connect(delay);
    this.graphNodes.push(delay, delayFeedbackGain);

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = this.profile.reverbMix;
    const dryGain = ctx.createGain();
    dryGain.gain.value = 1 - this.profile.reverbMix;
    const delayOutGain = ctx.createGain();
    delayOutGain.gain.value = 0.3;
    this.graphNodes.push(reverbGain, dryGain, delayOutGain);

    this.filter.connect(dryGain);
    this.filter.connect(convolver);
    convolver.connect(reverbGain);
    this.filter.connect(delay);
    delay.connect(delayOutGain);

    dryGain.connect(compressor);
    reverbGain.connect(compressor);
    delayOutGain.connect(compressor);
    compressor.connect(this.masterGain);
    this.buildEQChain();
  }

  private scheduleNote(time: number) {
    if (!this.ctx || !this.filter) return;
    const ctx = this.ctx;
    const p = this.profile;
    const step = this.currentStep;

    const scaleIdx = Math.floor(this.rng() * p.scale.length);
    const semitone = p.scale[scaleIdx];
    const octaveShift = Math.floor(this.rng() * 2) - (this.rng() > 0.7 ? 1 : 0);
    const freq = p.baseFreq * Math.pow(2, (semitone + octaveShift * 12) / 12);

    const osc = ctx.createOscillator();
    osc.type = p.waveform;
    osc.frequency.value = freq;
    if (p.waveform === "sawtooth" || p.waveform === "square") {
      osc.detune.value = (this.rng() - 0.5) * 10;
    }

    const noteGain = ctx.createGain();
    noteGain.gain.value = 0;
    const velocity = 0.15 + this.rng() * 0.2;
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(velocity, time + p.attackTime);

    const beatDuration = 60 / p.tempo;
    const noteDuration = beatDuration * (this.rng() > 0.3 ? 1 : 2);
    const releaseStart = time + noteDuration - p.releaseTime;
    noteGain.gain.setValueAtTime(velocity, Math.max(time + p.attackTime, releaseStart));
    noteGain.gain.linearRampToValueAtTime(0, time + noteDuration);

    osc.connect(noteGain);
    noteGain.connect(this.filter);
    osc.start(time);
    osc.stop(time + noteDuration + 0.1);
    this.graphNodes.push(osc, noteGain);

    osc.onended = () => {
      try { osc.disconnect(); } catch {}
      try { noteGain.disconnect(); } catch {}
      const oi = this.graphNodes.indexOf(osc);
      if (oi > -1) this.graphNodes.splice(oi, 1);
      const gi = this.graphNodes.indexOf(noteGain);
      if (gi > -1) this.graphNodes.splice(gi, 1);
    };

    if (step % 4 === 0 && this.rng() > 0.3) {
      const bassOsc = ctx.createOscillator();
      bassOsc.type = "sine";
      bassOsc.frequency.value = p.baseFreq / 2;

      const bassGain = ctx.createGain();
      bassGain.gain.value = 0;
      bassGain.gain.setValueAtTime(0, time);
      bassGain.gain.linearRampToValueAtTime(0.2, time + 0.01);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + beatDuration * 2);

      bassOsc.connect(bassGain);
      bassGain.connect(this.filter);
      bassOsc.start(time);
      bassOsc.stop(time + beatDuration * 2 + 0.1);
      this.graphNodes.push(bassOsc, bassGain);

      bassOsc.onended = () => {
        try { bassOsc.disconnect(); } catch {}
        try { bassGain.disconnect(); } catch {}
        const bi = this.graphNodes.indexOf(bassOsc);
        if (bi > -1) this.graphNodes.splice(bi, 1);
        const bgi = this.graphNodes.indexOf(bassGain);
        if (bgi > -1) this.graphNodes.splice(bgi, 1);
      };
    }

    if (this.rng() > 0.6) {
      const percOsc = ctx.createOscillator();
      percOsc.type = "square";
      percOsc.frequency.value = 80 + this.rng() * 200;

      const percGain = ctx.createGain();
      percGain.gain.value = 0;
      percGain.gain.setValueAtTime(0, time);
      percGain.gain.linearRampToValueAtTime(0.08, time + 0.005);
      percGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      percOsc.connect(percGain);
      percGain.connect(this.filter);
      percOsc.start(time);
      percOsc.stop(time + 0.15);
      this.graphNodes.push(percOsc, percGain);

      percOsc.onended = () => {
        try { percOsc.disconnect(); } catch {}
        try { percGain.disconnect(); } catch {}
        const pi = this.graphNodes.indexOf(percOsc);
        if (pi > -1) this.graphNodes.splice(pi, 1);
        const pgi = this.graphNodes.indexOf(percGain);
        if (pgi > -1) this.graphNodes.splice(pgi, 1);
      };
    }
  }

  private scheduler = () => {
    if (this.state !== "playing" || !this.ctx || !this.filter) return;

    const beatDuration = 60 / this.profile.tempo;
    const lookAhead = 0.1;

    while (this.nextNoteTime < this.ctx.currentTime + lookAhead) {
      this.scheduleNote(this.nextNoteTime);
      const skipChance = this.rng();
      this.nextNoteTime += skipChance > 0.2 ? beatDuration : beatDuration * 0.5;
      this.currentStep++;
    }

    this.schedulerTimer = window.setTimeout(this.scheduler, 25);
  };

  start(trackTitle: string, genre: string) {
    this.teardownGraph();

    this.rng = seededRandom(hashString(trackTitle + genre));
    this.profile = GENRE_PROFILES[genre] || GENRE_PROFILES.Electronic;
    this.currentStep = 0;

    this.buildGraph();

    const ctx = this.getOrCreateContext();
    this.nextNoteTime = ctx.currentTime + 0.05;
    this.state = "playing";
    this.scheduler();
  }

  stop() {
    this.state = "stopped";
    this.teardownGraph();
  }

  pause() {
    if (this.state === "playing") {
      this.state = "paused";
      if (this.schedulerTimer !== null) {
        clearTimeout(this.schedulerTimer);
        this.schedulerTimer = null;
      }
      if (this.ctx && this.ctx.state === "running") {
        this.ctx.suspend();
      }
    }
  }

  resume() {
    if (this.state === "paused" && this.ctx) {
      this.state = "playing";
      this.ctx.resume().then(() => {
        if (this.state === "playing") {
          this.nextNoteTime = this.ctx!.currentTime + 0.05;
          this.scheduler();
        }
      });
    }
  }

  setVolume(value: number) {
    this.volumeValue = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volumeValue;
    }
  }

  private eqBands: BiquadFilterNode[] = [];
  private eqGains: number[] = [0, 0, 0, 0, 0];
  static readonly EQ_FREQUENCIES = [60, 230, 910, 3600, 14000];
  static readonly EQ_LABELS = ["60 Hz", "230 Hz", "910 Hz", "3.6 kHz", "14 kHz"];

  applyEQ(bandIndex: number, gainDb: number) {
    this.eqGains[bandIndex] = gainDb;
    if (this.eqBands[bandIndex]) {
      this.eqBands[bandIndex].gain.value = gainDb;
    }
  }

  getEQGains(): number[] {
    return [...this.eqGains];
  }

  resetEQ() {
    for (let i = 0; i < 5; i++) {
      this.eqGains[i] = 0;
      if (this.eqBands[i]) {
        this.eqBands[i].gain.value = 0;
      }
    }
  }

  private buildEQChain() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    this.eqBands = [];

    let prevNode: AudioNode = this.masterGain;

    this.masterGain.disconnect();

    for (let i = 0; i < AudioEngine.EQ_FREQUENCIES.length; i++) {
      const eq = ctx.createBiquadFilter();
      if (i === 0) {
        eq.type = "lowshelf";
      } else if (i === AudioEngine.EQ_FREQUENCIES.length - 1) {
        eq.type = "highshelf";
      } else {
        eq.type = "peaking";
        eq.Q.value = 1.0;
      }
      eq.frequency.value = AudioEngine.EQ_FREQUENCIES[i];
      eq.gain.value = this.eqGains[i];
      prevNode.connect(eq);
      prevNode = eq;
      this.eqBands.push(eq);
      this.graphNodes.push(eq);
    }
    prevNode.connect(ctx.destination);
  }

  get currentState(): EngineState {
    return this.state;
  }

  destroy() {
    this.teardownGraph();
    this.state = "stopped";
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
    this.ctx = null;
  }
}

export const audioEngine = new AudioEngine();
