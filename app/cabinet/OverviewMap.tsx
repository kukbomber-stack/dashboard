"use client";
import { useEffect, useRef, useState } from "react";

// Карта Обзора под любой экран: ширина – по месту, которое остаётся от таблицы лицензий,
// высота – строго по пропорциям изображения. Раньше рамка тянулась до высоты таблицы, и когда
// таблица выросла, над картой и под ней появлялись пустые поля.
const RATIO = 704 / 565;    // пропорции изображения map-overview.png
const MIN_TABLE = 430;      // таблице оставляем не меньше этой ширины

export default function OverviewMap({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const frame = ref.current;
    const row = frame?.parentElement;
    const table = row?.querySelector(".lic-all") as HTMLElement | null;
    if (!frame || !row || !table) return;
    const calc = () => {
      const total = row.getBoundingClientRect().width;
      if (total < 900) { setSize(null); return; }
      const gap = parseFloat(getComputedStyle(row).columnGap) || 14;
      // минимальная ширина таблицы по содержимому и её естественная высота (без растяжки)
      const prevW = table.style.width, prevH = table.style.height;
      table.style.width = "1px"; table.style.height = "auto";
      const minTable = Math.max(MIN_TABLE, Math.ceil(table.getBoundingClientRect().width));
      table.style.width = prevW;
      const nat = table.getBoundingClientRect().height;
      table.style.height = prevH;
      // карта берёт не меньше половины ширины блока, но оставляет место таблице
      // Таблице сначала даётся запас к её минимальной ширине – иначе на среднем экране она
      // сжималась до предела, а карта забирала всё остальное. Карта берёт то, что осталось,
      // но не больше высоты таблицы в своих пропорциях и не меньше 40% ширины блока.
      // Карта берёт всё место, которое остаётся после минимальной ширины таблицы, но не больше,
      // чем нужно её пропорциям при высоте таблицы: так пустого поля под картой остаётся минимум.
      const w = Math.round(Math.max(Math.min(nat * RATIO, total - gap - minTable), total * 0.4));
      const h = Math.round(w / RATIO);   // высота – ровно по пропорции, без растяжки под таблицу
      setSize(p => (p && p.w === w && p.h === h ? p : { w, h }));
    };
    // защита от зацикливания наблюдателя: пересчёт не чаще кадра и не во время печати
    let busy = false;
    const schedule = () => {
      if (busy || document.documentElement.classList.contains("pf-on")) return;
      busy = true;
      requestAnimationFrame(() => { busy = false; calc(); });
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(row); ro.observe(table);
    calc();
    // после печати браузер возвращает экранную раскладку – пересчитываем один раз
    const after = () => requestAnimationFrame(calc);
    window.addEventListener("afterprint", after);
    return () => { ro.disconnect(); window.removeEventListener("afterprint", after); };
  }, []);

  return (
    <div ref={ref} className={"map-frame" + (size ? " map-fit" : "")}
      style={size ? { width: size.w, height: size.h } : undefined}>
      <img src={src} alt={alt} />
    </div>
  );
}
