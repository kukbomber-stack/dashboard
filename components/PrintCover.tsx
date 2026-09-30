"use client";
import { usePathname } from "next/navigation";
import { meta } from "@/lib/data";

// Титульный лист печати. Виден только при печати, первой страницей.
// Раскладка повторяет титульный слайд презентации «Пинигино»: тёмный фон,
// фотография полосой справа, медальон в правом верхнем углу тёмного поля,
// заголовок и бежевая плашка с датами данных – по центру по вертикали.
export default function PrintCover() {
  const path = usePathname() || "/cabinet";
  const coverOnly = path === "/cabinet" || path === "/cabinet/print-all";
  if (!coverOnly) return null;
  return (
    <div className="print-cover print-only">
      <img src="/cover-photo.jpg" alt="" className="pc-photo" />
      {/* Знак с подписью – в правом верхнем углу, название по центру, дата в левом нижнем */}
      <img src="/cover-logo.png" alt="" className="pc-logo" />
      <div className="pc-mark">УК «ППР»</div>
      <div className="pc-text">
        <div className="pc-title">
          <span className="pc-title-top">Статус проекта</span>
          <span className="pc-title-main">Пинигино</span>
          <span className="pc-rule" />
        </div>
      </div>
      <div className="pc-date">{meta.asOfProd} г.</div>
    </div>
  );
}
