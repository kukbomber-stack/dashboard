"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Ic, icons } from "./Icons";

const NAV = [
  ["/cabinet", "overview", "Обзор"],
  ["/cabinet/licenses", "lic", "Лицензии"],
  ["/cabinet/resources", "res", "Запасы"],
  ["/cabinet/status", "status", "Статус задач"],
  ["/cabinet/grr", "drill", "ГРР"],
  ["/cabinet/opr", "opr", "ОПР"],
  ["/cabinet/costs", "costs", "Финансирование"],
  ["/cabinet/personnel", "people", "Персонал"],
  ["/cabinet/procurement", "proc", "Закупки"],
  ["/cabinet/schedule", "gantt", "График проекта"],
  ["/cabinet/roadmap", "miles", "Вехи проекта"],
  ["/cabinet/placer", "placer", "Россыпное золото"],
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src="/logo-mark-fill.png" alt="Пинигино" className="sb-logo" />
        <div>
          <div className="t">Кабинет ППР</div>
          <div className="s">Пинигинский проект</div>
        </div>
      </div>
      <nav className="sb-nav">
        {NAV.map(([href, ic, label]) => (
          <Link key={href} href={href} className={path === href ? "active" : ""}>
            <Ic d={icons[ic]} /> {label}
          </Link>
        ))}
      </nav>
      <nav className="sb-nav sb-nav-bottom">
        <Link href="/cabinet/sources" className={path === "/cabinet/sources" ? "active" : ""}>
          <Ic d={icons["sources"]} /> Источники
        </Link>
      </nav>
      <div className="sb-foot">
        УК «Приоритет Природные Ресурсы»<br />Внутренний ресурс проекта
      </div>
    </aside>
  );
}
