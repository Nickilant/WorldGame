import { useEffect, useRef, useState } from 'react';

const SIZE = 32;

export default function PixelWallEditor({ onTextureChange }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#ffffff');

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, SIZE, SIZE);
    onTextureChange(canvas.toDataURL());
  }, [onTextureChange]);

  const paint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * SIZE);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * SIZE);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
    onTextureChange(canvas.toDataURL());
  };

  return (
    <div className="panel">
      <h3>Wall Pixel Editor (32×32)</h3>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <canvas ref={canvasRef} className="pixel-canvas" onMouseMove={(e) => e.buttons === 1 && paint(e)} onClick={paint} />
    </div>
  );
}
