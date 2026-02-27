import { useEffect, useRef } from 'react';

const BG_COLOR = { r: 15, g: 23, b: 41 }; // #0f1729

export function useChromaKey(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        frameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        frameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const max = Math.max(r, g, b);
        const greenDominance = g - Math.max(r, b);

        if (g > 60 && greenDominance > 20 && max === g) {
          d[i] = BG_COLOR.r;
          d[i + 1] = BG_COLOR.g;
          d[i + 2] = BG_COLOR.b;
        } else if (g > 50 && greenDominance > 8 && max === g) {
          const blend = Math.min(1, (greenDominance - 8) / 20);
          d[i] = Math.round(r * (1 - blend) + BG_COLOR.r * blend);
          d[i + 1] = Math.round(g * (1 - blend) + BG_COLOR.g * blend);
          d[i + 2] = Math.round(b * (1 - blend) + BG_COLOR.b * blend);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      frameRef.current = requestAnimationFrame(processFrame);
    };

    frameRef.current = requestAnimationFrame(processFrame);

    return () => cancelAnimationFrame(frameRef.current);
  }, [active, videoRef]);

  return canvasRef;
}
