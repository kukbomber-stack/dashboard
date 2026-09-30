"use client";
import { useState } from "react";
import type { Staffer } from "@/lib/data";

// Карточка организации: шапка с численностью и городами видна всегда,
// поимённый состав свёрнут и раскрывается по клику. При печати и в выгрузке
// состав берётся целиком независимо от того, раскрыта карточка или нет.
export default function TeamCard({ full, note, people }: { full: string; note: string; people: Staffer[] }) {
  const [open, setOpen] = useState(false);
  const byCity = (city: string) => people.filter(p => p.city === city).length;
  const cities = ["Москва", "Якутия", "Ташкент"].filter(c => byCity(c)).sort((a, b) => byCity(b) - byCity(a));
  return (
    <div className="team-card keep-block">
      <button type="button" className="team-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className="team-head-main">
          <b>{full}</b>
          <div className="team-note">{note}</div>
        </div>
        <div className="team-count">{people.length}<span> чел.</span></div>
        <span className={"collapsible-chev team-chev" + (open ? " open" : "")}>›</span>
      </button>
      <div className="team-cities">
        {cities.map(c => (
          <span key={c} className="team-city">{c} <i>{byCity(c)}</i></span>
        ))}
        {/* Та же кнопка, что и шапка карточки: подпись «показать состав» тоже раскрывает список */}
        <button type="button" className="team-more no-print" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          {open ? "свернуть состав" : "показать состав"}
        </button>
      </div>
      <div className={"team-body" + (open ? "" : " is-off")}>
        <table className="team-table">
          <tbody>
            {people.map(p => (
              <tr key={p.fio}>
                <td className="tm-fio">{p.fio}</td>
                <td className="tm-role">{p.role}</td>
                <td className="tm-city">{p.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
