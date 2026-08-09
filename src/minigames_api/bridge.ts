import { MinigamePayload } from '../types/engine';

export class MinigameBridge {
  /**
   * Called by the Minigame iframe to signal completion to the parent Engine.
   */
  public static complete(payload: MinigamePayload) {
    if (window.parent) {
      window.parent.postMessage({
        type: 'MINIGAME_COMPLETE',
        payload
      }, '*');
    }
  }

  /**
   * Listen for events from Minigames
   */
  public static listen(onComplete: (payload: MinigamePayload) => void) {
    const handler = (event: MessageEvent) => {
      // Security check could be added here (e.g., origin check)
      if (event.data && event.data.type === 'MINIGAME_COMPLETE') {
        onComplete(event.data.payload);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }
}
