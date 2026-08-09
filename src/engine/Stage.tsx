import React, { useEffect, useRef, useState } from 'react';
import { Application, Sprite, Assets, Container } from 'pixi.js';

interface StageProps {
  backgroundUrl?: string;
  sprites?: {
    id: string;
    url: string;
    position: 'left' | 'center' | 'right' | { x: number, y: number };
    scale: number;
  }[];
  width?: number;
  height?: number;
}

export const Stage: React.FC<StageProps> = ({ backgroundUrl, sprites = [], width = 1280, height = 720 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [app, setApp] = useState<Application | null>(null);

  // Initialize Pixi Application
  useEffect(() => {
    if (!canvasRef.current) return;

    const pixiApp = new Application();
    
    // Initialize async
    pixiApp.init({
      canvas: canvasRef.current,
      width,
      height,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      setApp(pixiApp);
    });

    return () => {
      if (app) app.destroy(true);
    };
  }, [width, height]);

  // Handle Background
  useEffect(() => {
    if (!app || !backgroundUrl) return;

    let bgSprite: Sprite | null = null;
    const bgContainer = new Container();
    app.stage.addChildAt(bgContainer, 0); // Background is always at bottom

    const loadBg = async () => {
      const texture = await Assets.load(backgroundUrl);
      bgSprite = new Sprite(texture);
      bgSprite.width = app.screen.width;
      bgSprite.height = app.screen.height;
      bgSprite.alpha = 0; // Prepare for fade in

      bgContainer.addChild(bgSprite);

      // Fade in transition (1 second fade as requested in rules)
      let opacity = 0;
      const fadeIn = () => {
        opacity += 0.05;
        if (bgSprite) bgSprite.alpha = opacity;
        if (opacity < 1) {
          requestAnimationFrame(fadeIn);
        }
      };
      fadeIn();
    };

    loadBg();

    return () => {
      if (bgSprite) {
        bgSprite.destroy();
      }
      app.stage.removeChild(bgContainer);
    };
  }, [app, backgroundUrl]);

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-2xl" />
    </div>
  );
};
