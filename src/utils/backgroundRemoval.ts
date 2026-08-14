import { removeBackground, Config } from '@imgly/background-removal';

/**
 * Elimina el fondo por proximidad a blanco puro, con una tolerancia específica
 * @param imageSrc URL de la imagen
 * @param tolerance Tolerancia (0-255). 0 = Solo blanco absoluto, 255 = Todo
 * @returns Object URL de la imagen procesada
 */
export const removeBackgroundCanvas = async (imageSrc: string, tolerance: number = 10): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Canvas no soportado"));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        if (a > 0) {
          // Checamos proximidad a blanco (255, 255, 255)
          if (255 - r <= tolerance && 255 - g <= tolerance && 255 - b <= tolerance) {
            data[i+3] = 0; // Transparente
          }
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error("Fallo al crear Blob desde Canvas"));
        }
      }, 'image/png');
    };
    img.onerror = () => reject(new Error("Error cargando la imagen para procesar."));
    img.src = imageSrc;
  });
};

/**
 * Elimina el fondo mediante inteligencia artificial usando @imgly/background-removal
 * @param file Archivo o string URL
 * @param onProgress Callback de progreso (0 a 100%)
 * @returns Object URL de la imagen procesada
 */
export const removeBackgroundAI = async (
  file: File | string,
  onProgress?: (progress: number, label: string) => void
): Promise<string> => {
  
  const publicPath = `${window.location.origin}${import.meta.env.BASE_URL}imgly-assets/`;

  const config: Config = {
    publicPath,
    device: 'gpu', // intentará GPU con fallback a CPU
    progress: (key: string, current: number, total: number) => {
      if (onProgress) {
        const percentage = Math.round((current / total) * 100);
        onProgress(percentage, `Descargando/Procesando: ${key}`);
      }
    }
  };

  try {
    const blob = await removeBackground(file, config);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error en removeBackgroundAI:", error);
    throw new Error("No se pudo remover el fondo usando IA. Intenta con el método Canvas.");
  }
};

/**
 * Interface principal para exponer ambos métodos.
 */
export const removeBackgroundLocal = async (
  mode: 'canvas' | 'ai',
  imageInput: File | string,
  options?: {
    tolerance?: number;
    onProgress?: (progress: number, label: string) => void;
  }
): Promise<string> => {
  if (mode === 'canvas') {
    // Canvas solo acepta strings de manera nativa en nuestra impl., así que convertimos si es File
    const src = typeof imageInput === 'string' ? imageInput : URL.createObjectURL(imageInput);
    try {
      const result = await removeBackgroundCanvas(src, options?.tolerance);
      // Limpiar object URL temporal si lo creamos
      if (typeof imageInput !== 'string') URL.revokeObjectURL(src);
      return result;
    } catch (e) {
      if (typeof imageInput !== 'string') URL.revokeObjectURL(src);
      throw e;
    }
  } else {
    return removeBackgroundAI(imageInput, options?.onProgress);
  }
};
