import React from "react";

// Иконки сводной строки на Обзоре. Рисуем фигурами, а не одним path,
// чтобы формы читались однозначно.
const ICONS: Record<string, React.ReactNode> = {
  // документ с печатью
  lic: (
    <>
      <path d="M6 2.5h8l4 4v15H6z" />
      <path d="M14 2.5v4h4" />
      <path d="M9 12h6M9 15.5h6M9 19h4" />
    </>
  ),
  // буровая установка: мачта на основании
  rig: (
    <>
      <path d="M12 3.5v13" />
      <path d="M12 3.5 8 16.5M12 3.5l4 13" />
      <path d="M9.4 9h5.2M8.6 12.5h6.8" />
      <path d="M4 20.5h16M6 16.5h12v4H6z" />
    </>
  ),
  // экскаватор: гусеница, поворотная платформа с кабиной, стрела, рукоять, ковш
  truck: (
    <>
      <path d="M3.6 17.2h7.8a1.9 1.9 0 010 3.8H3.6a1.9 1.9 0 010-3.8z" />
      <path d="M2.4 15.6v-3.2h10.4l.8 3.2z" />
      <path d="M4.2 12.4V9.2h3.6l1.2 3.2" />
      <path d="M11.2 12.4 16.4 4l1.6.5" />
      <path d="M18 4.5l2.6 9.3" />
      <path d="M20.6 13.8c1.3 1.3 1.5 3.4.6 4.9h-3.7z" />
    </>
  ),
  // два человека: руководитель и сотрудник
  people: (
    <>
      <circle cx="9" cy="7.5" r="3" />
      <path d="M3.5 20c0-3.2 2.5-5.2 5.5-5.2s5.5 2 5.5 5.2" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15 15.2c3 .1 5.2 1.9 5.2 4.8" />
    </>
  ),
  // человек в каске
  worker: (
    <>
      <path d="M7.8 8.2a4.2 4.2 0 018.4 0" />
      <path d="M6.6 8.2h10.8" />
      <path d="M12 4v1.4" />
      <circle cx="12" cy="11.6" r="2.5" />
      <path d="M5.8 21.5c0-3.4 2.8-5.5 6.2-5.5s6.2 2.1 6.2 5.5" />
    </>
  ),
  // слиток золота
  gold: (
    <>
      <path d="M3.5 19.5h17l-2.4-7.5H5.9z" />
      <path d="M7.6 12 9 7h6l1.4 5" />
      <path d="M10.2 7 11 3.5h2L13.8 7" />
    </>
  ),
};

export default function SumIcon({ k }: { k: string }) {
  const icon = ICONS[k];
  if (!icon) return null;
  return (
    <svg className="sum-icon" viewBox="0 0 24 24" width="24" height="24" fill="none"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {icon}
    </svg>
  );
}
