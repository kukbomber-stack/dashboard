"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Карта с лупой: наведение увеличивает участок под курсором, колесо меняет масштаб,
// перетаскивание двигает изображение. Рамка карты остаётся того же размера.
const MIN = 1, MAX = 6, HOVER = 2.2;

export default function MapZoom({ src, alt }: { src: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(MIN);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [drag, setDrag] = useState(false);

  const pointTo = useCallback((clientX: number, clientY: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100));
    setOrigin({ x, y });
  }, []);

  // Колесо мыши: нужен неактивный (non-passive) слушатель, иначе браузер прокрутит страницу.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      pointTo(e.clientX, e.clientY);
      setZoom(v => Math.min(MAX, Math.max(MIN, +(v + (e.deltaY < 0 ? 0.45 : -0.45)).toFixed(2))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [pointTo]);

  return (
    <div className="map-zoom-wrap">
      <div
        ref={box}
        className={"lic-map map-zoom" + (zoom > MIN ? " is-zoomed" : "")}
        onMouseEnter={() => setZoom(v => (v === MIN ? HOVER : v))}
        onMouseLeave={() => { setZoom(MIN); setDrag(false); }}
        onMouseMove={e => { if (!drag || zoom > MIN) pointTo(e.clientX, e.clientY); }}
        onMouseDown={() => setDrag(true)}
        onMouseUp={() => setDrag(false)}
        onDoubleClick={() => setZoom(MIN)}
        title="Наведите, чтобы рассмотреть участок; колесо мыши меняет масштаб, двойной клик сбрасывает"
      >
        <img src={src} alt={alt} draggable={false}
          style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x}% ${origin.y}%` }} />
        <div className="map-zoom-bar no-print">
          <button type="button" onClick={() => setZoom(v => Math.max(MIN, +(v - 0.45).toFixed(2)))} aria-label="Уменьшить">−</button>
          <span>{zoom.toFixed(1)}×</span>
          <button type="button" onClick={() => setZoom(v => Math.min(MAX, +(v + 0.45).toFixed(2)))} aria-label="Увеличить">+</button>
          <button type="button" className="reset" onClick={() => { setZoom(MIN); setOrigin({ x: 50, y: 50 }); }}>сброс</button>
        </div>
      </div>
    </div>
  );
}
