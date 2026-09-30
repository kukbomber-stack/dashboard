"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { makeXlsx, tablesToSheets, tilesToSheet, withCommentColumn, needsSheet, type Sheet } from "@/lib/xlsx";

// Короткие имена разделов для листов общей выгрузки: имя листа в Excel не длиннее 31 знака.
const SHORT: Record<string, string> = {
  "Обзор": "Обзор", "Лицензии": "Лиц", "Запасы": "Зап", "Статус задач": "Задачи", "ГРР": "ГРР", "ОПР": "ОПР",
  "Финансирование": "Фин", "Персонал": "Перс", "Закупки": "Зак", "График проекта": "КСГ", "Вехи проекта": "Вехи",
  "Россыпное золото": "Россыпь",
};

// Кнопка «Выгрузка»: печать раздела, печать всего дашборда, выгрузка таблиц и плашек в XLSX.
export default function PrintMenu({ hidePrintSelf = false }: { hidePrintSelf?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  // Выгружает раздел целиком: каждая таблица отдельным листом, затем лист «Плашки» (KPI-карточки
  // и плитки) и лист «Нет данных» (все – и н/д одним списком). В каждом листе последний столбец –
  // «Комментарий» для исправлений: файл рассылается ответственным на заполнение и сверку.
  // На странице «весь дашборд» выгружаются все разделы в один файл, листы получают короткий префикс раздела.
  const exportTables = () => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".print-section"));
    const used = new Set<string>();
    const uniq = (name: string) => {
      let n = name.slice(0, 31).trim(); let k = 2;
      while (used.has(n)) n = `${name.slice(0, 27).trim()} ${k++}`;
      used.add(n); return n;
    };
    const named = (sh: Sheet, prefix: string): Sheet => ({ ...sh, name: uniq(prefix ? `${prefix} · ${sh.name}` : sh.name) });
    const collect = (root: Element, prefix: string) => {
      const tables = tablesToSheets(root).map(withCommentColumn).map(sh => named(sh, prefix));
      const tiles = tilesToSheet(root);
      return { tables, tiles: tiles ? named(tiles, prefix) : null };
    };
    let tables: Sheet[] = [];
    const tiles: Sheet[] = [];
    let section = "";
    if (sections.length > 1) {
      sections.forEach(sec => {
        const root = sec.querySelector(".content");
        const name = sec.dataset.name || "";
        if (!root) return;
        const got = collect(root, SHORT[name] || name.slice(0, 6));
        tables = tables.concat(got.tables);
        if (got.tiles) tiles.push(got.tiles);
      });
      section = "Весь дашборд";
    } else {
      const root = document.querySelector(".content") || document.body;
      const got = collect(root, "");
      tables = got.tables;
      if (got.tiles) tiles.push(got.tiles);
      section = (document.querySelector(".content h1")?.textContent || "Кабинет ППР").trim();
    }
    const body = [...tables, ...tiles];
    if (!body.length) return;
    const needs = needsSheet(body);
    const sheets = [...body, ...(needs ? [needs] : [])];
    const stamp = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(makeXlsx(sheets));
    const a = document.createElement("a");
    a.href = url;
    a.download = `Пинигино ${section} ${stamp}.xlsx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="print-menu no-print" ref={box}>
      <button type="button" className="print-btn" onClick={() => setOpen(v => !v)}>Выгрузка ▾</button>
      {open ? (
        <div className="print-menu-list">
          {hidePrintSelf ? null : (
            <button type="button" onClick={() => { setOpen(false); setTimeout(() => window.print(), 50); }}>
              Печать: этот раздел
            </button>
          )}
          <button type="button" onClick={() => { setOpen(false); router.push("/cabinet/print-all"); }}
            disabled={path === "/cabinet/print-all"}>
            Печать: весь дашборд
          </button>
          <button type="button" onClick={() => { setOpen(false); exportTables(); }}>
            {hidePrintSelf ? "Весь дашборд в Excel (XLSX)" : "Таблицы и плашки в Excel (XLSX)"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
