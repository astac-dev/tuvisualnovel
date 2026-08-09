export class WebAudioController {
  private ctx: AudioContext;
  private channels: {
    bgm: { source: AudioBufferSourceNode | null, gain: GainNode },
    sfx: { source: AudioBufferSourceNode | null, gain: GainNode },
    voice: { source: AudioBufferSourceNode | null, gain: GainNode }
  };
  private audioCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.channels = {
      bgm: { source: null, gain: this.ctx.createGain() },
      sfx: { source: null, gain: this.ctx.createGain() },
      voice: { source: null, gain: this.ctx.createGain() }
    };

    // Connect all gains to master destination
    Object.values(this.channels).forEach(channel => {
      channel.gain.connect(this.ctx.destination);
    });
  }

  private async loadAudio(url: string): Promise<AudioBuffer> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.audioCache.set(url, audioBuffer);
    return audioBuffer;
  }

  public async playBGM(url: string, fadeDuration: number = 2) {
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    
    const buffer = await this.loadAudio(url);
    
    // Stop current BGM if playing
    if (this.channels.bgm.source) {
      this.channels.bgm.source.stop();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    // Fade in
    this.channels.bgm.gain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.channels.bgm.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + fadeDuration);
    
    source.connect(this.channels.bgm.gain);
    source.start(0);
    this.channels.bgm.source = source;
  }

  public async playSFX(url: string, volume: number = 1) {
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    
    const buffer = await this.loadAudio(url);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const tempGain = this.ctx.createGain();
    tempGain.gain.value = volume;
    tempGain.connect(this.channels.sfx.gain);
    
    source.connect(tempGain);
    source.start(0);
  }

  public stopBGM(fadeDuration: number = 2) {
    if (this.channels.bgm.source) {
      this.channels.bgm.gain.gain.setValueAtTime(this.channels.bgm.gain.gain.value, this.ctx.currentTime);
      this.channels.bgm.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeDuration);
      
      const source = this.channels.bgm.source;
      setTimeout(() => {
        try { source.stop(); } catch(e) {}
      }, fadeDuration * 1000);
      
      this.channels.bgm.source = null;
    }
  }
}

export const audioController = new WebAudioController();
