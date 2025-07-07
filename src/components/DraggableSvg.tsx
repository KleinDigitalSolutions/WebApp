import React, { useRef, useState } from 'react';

// Nur im Dev-Modus rendern!
const isDev = process.env.NODE_ENV === 'development';

export type DraggableSvgProps = {
  src: string;
  alt?: string;
  initial?: { x: number; y: number; rot: number; width: number };
  style?: React.CSSProperties;
};

export default function DraggableSvg({ src, alt, initial = { x: 0, y: 0, rot: 0, width: 120 }, style }: DraggableSvgProps) {
  const [pos, setPos] = useState({ ...initial });
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const rotStart = useRef(0);
  const widthStart = useRef(0);

  // Drag
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.altKey) {
      setRotating(true);
      rotStart.current = pos.rot;
      dragStart.current = { x: e.clientX, y: e.clientY };
    } else if (e.shiftKey) {
      setResizing(true);
      widthStart.current = pos.width;
      dragStart.current = { x: e.clientX, y: e.clientY };
    } else {
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { x: pos.x, y: pos.y };
    }
    e.preventDefault();
  };
  const onMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setPos((prev) => ({ ...prev, x: posStart.current.x + e.clientX - dragStart.current.x, y: posStart.current.y + e.clientY - dragStart.current.y }));
    }
    if (rotating) {
      setPos((prev) => ({ ...prev, rot: rotStart.current + (e.clientX - dragStart.current.x) }));
    }
    if (resizing) {
      setPos((prev) => ({ ...prev, width: Math.max(24, widthStart.current + (e.clientX - dragStart.current.x)) }));
    }
  };
  const onMouseUp = () => {
    setDragging(false);
    setRotating(false);
    setResizing(false);
  };
  React.useEffect(() => {
    if (dragging || rotating || resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [dragging, rotating, resizing]);

  if (!isDev) return (
    <img src={src} alt={alt} style={{ ...style, width: pos.width, position: 'fixed', left: pos.x, top: pos.y, transform: `rotate(${pos.rot}deg)`, pointerEvents: 'none', userSelect: 'none', zIndex: 0, opacity: 0.5 }} />
  );

  return (
    <div style={{
      position: 'fixed',
      left: pos.x,
      top: pos.y,
      zIndex: 1000,
      width: pos.width, // Parent-Div bekommt wieder die Breite des SVGs
      height: pos.width, // und eine Höhe (quadratisch, für Sichtbarkeit)
      pointerEvents: 'none',
    }}>
      <img
        src={src}
        alt={alt}
        width={pos.width}
        style={{
          ...style,
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'auto',
          userSelect: 'none',
          opacity: 0.7,
          transform: `rotate(${pos.rot}deg)`
        }}
        onMouseDown={onMouseDown}
        draggable={false}
      />
      <div style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, padding: 4, borderRadius: 4, marginTop: 2, pointerEvents: 'auto' }}>
        x: {Math.round(pos.x)}, y: {Math.round(pos.y)}, rot: {Math.round(pos.rot)}°, width: {Math.round(pos.width)}px
        <button style={{ marginLeft: 8, fontSize: 10 }} onClick={() => navigator.clipboard.writeText(JSON.stringify(pos))}>Copy</button>
        <span style={{ marginLeft: 8, fontSize: 10, color: '#ccc' }}>[Drag, Alt+Drag=Rotate, Shift+Drag=Resize]</span>
      </div>
    </div>
  );
}
