import { useEffect, useRef } from 'react';
import { drawAvatar, AvatarOptions } from '@/lib/avatarRenderer';

interface AvatarCanvasProps {
  options: AvatarOptions;
  size: number;
  className?: string;
}

const AvatarCanvas = ({ options, size, className = '' }: AvatarCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawAvatar(canvasRef.current, options);
    }
  }, [options]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
};

export default AvatarCanvas;
