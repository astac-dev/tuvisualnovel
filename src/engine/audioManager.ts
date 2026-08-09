class AudioManager {
  private bgm: HTMLAudioElement | null = null;
  private sfxChannels: HTMLAudioElement[] = [];
  
  public playBGM(url: string, volume: number = 0.5) {
    if (this.bgm) {
      if (this.bgm.src.endsWith(url)) return; // Already playing
      this.bgm.pause();
    }
    this.bgm = new Audio(url);
    this.bgm.loop = true;
    this.bgm.volume = volume;
    this.bgm.play().catch(e => console.error("Audio play blocked by browser:", e));
  }
  
  public stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  public playSFX(url: string, volume: number = 0.8) {
    const sfx = new Audio(url);
    sfx.volume = volume;
    sfx.play().catch(e => console.error("Audio play blocked by browser:", e));
    
    this.sfxChannels.push(sfx);
    
    // Cleanup finished sounds
    sfx.addEventListener('ended', () => {
      this.sfxChannels = this.sfxChannels.filter(a => a !== sfx);
    });
  }
}

export const audioManager = new AudioManager();
