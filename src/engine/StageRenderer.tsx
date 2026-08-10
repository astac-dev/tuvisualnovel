import React, { useEffect, useRef, useState } from 'react';
import { Application, Sprite, Assets, Container } from 'pixi.js';

interface StageRendererProps {
  backgroundUrl?: string;
  sprites?: {
    id: string;
    url: string;
    position: 'left' | 'center' | 'right' | { x: number, y: number };
    scale?: number;
  }[];
  width?: number;
  height?: number;
  activeSpeaker?: string | null;
}

export const StageRenderer: React.FC<StageRendererProps> = ({ 
  backgroundUrl, 
  sprites = [], 
  width = 1280, 
  height = 720,
  activeSpeaker
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [app, setApp] = useState<Application | null>(null);

  // Initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const pixiApp = new Application();
    
    pixiApp.init({
      canvas: canvasRef.current,
      width,
      height,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      // Setup Layers
      const bgLayer = new Container();
      const charLayer = new Container();
      const uiLayer = new Container();
      
      bgLayer.label = 'bgLayer';
      charLayer.label = 'charLayer';
      
      pixiApp.stage.addChild(bgLayer);
      pixiApp.stage.addChild(charLayer);
      pixiApp.stage.addChild(uiLayer);

      setApp(pixiApp);
    });

    return () => {
      if (app) app.destroy(true);
    };
  }, [width, height]);

  // Background Manager with Crossfade
  useEffect(() => {
    if (!app || !backgroundUrl) return;
    const bgLayer = app.stage.getChildByLabel('bgLayer') as Container;
    if (!bgLayer) return;

    let newBg: Sprite;

    const loadBg = async () => {
      const texture = await Assets.load(backgroundUrl);
      newBg = new Sprite(texture);
      newBg.width = width;
      newBg.height = height;
      newBg.alpha = 0;
      
      bgLayer.addChild(newBg);

      // Fade In (1s transition as required)
      let opacity = 0;
      const fadeIn = () => {
        opacity += 0.016; // Aprox 60fps -> 1 sec
        if (newBg) newBg.alpha = opacity;
        
        if (opacity >= 1) {
          newBg.alpha = 1;
          // Eliminar el fondo anterior para ahorrar memoria
          if (bgLayer.children.length > 1) {
            const oldBg = bgLayer.children[0];
            bgLayer.removeChild(oldBg);
            oldBg.destroy({ texture: false });
          }
        } else {
          requestAnimationFrame(fadeIn);
        }
      };
      fadeIn();
    };

    loadBg();

  }, [app, backgroundUrl, width, height]);

  // Character Sprites Manager
  useEffect(() => {
    if (!app) return;
    const charLayer = app.stage.getChildByLabel('charLayer') as Container;
    if (!charLayer) return;

    // Clear old characters (simplified for this demo)
    charLayer.removeChildren().forEach(c => c.destroy({ texture: false }));

    sprites.forEach(async (spriteData) => {
      try {
        const texture = await Assets.load(spriteData.url);
        const char = new Sprite(texture);
        char.anchor.set(0.5, 1); // Anchor at bottom center for easy positioning
        
        // Calculate Position (1/6, 3/6, 5/6) as standard visual novel
        let targetX = width / 2;
        if (spriteData.position === 'left') targetX = width * (1/6);
        if (spriteData.position === 'center') targetX = width * (3/6);
        if (spriteData.position === 'right') targetX = width * (5/6);
        if (typeof spriteData.position === 'object') {
          targetX = spriteData.position.x;
        }

        char.x = targetX;
        char.y = height; // Bottom aligned
        char.scale.set(spriteData.scale || 1);
        
        // 50% brightness if there is an active speaker and it's not this character
        if (activeSpeaker && activeSpeaker.toLowerCase() !== spriteData.id.toLowerCase() && activeSpeaker.toLowerCase() !== 'narrador') {
           char.tint = 0x808080;
        } else {
           char.tint = 0xFFFFFF;
        }

        charLayer.addChild(char);
      } catch (e) {
        console.error("Failed to load sprite:", spriteData.url);
      }
    });

  }, [app, sprites, width, height, activeSpeaker]);

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      <canvas ref={canvasRef} className="w-full h-full object-contain shadow-2xl" />
    </div>
  );
};
