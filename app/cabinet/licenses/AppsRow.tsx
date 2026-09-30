"use client";
import { useState } from "react";

// Строка «Новые лицензии (заявки)» раскрывается и показывает все заявки:
// участок, полезное ископаемое, дату регистрации, статус и ход согласования.
// При печати заявки выводятся всегда.
type App = { n: number; site: string; mineral: string; status: string; reg: string; note: string };

export default function AppsRow({ area, status, apps, asOf, note }: {
  area: number; status: string; apps: App[]; asOf: string; note: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className={"apps-head" + (open ? " is-open" : "")} onClick={() => setOpen(v => !v)} title="Показать все заявки">
        <td>
          <button type="button" className="apps-toggle" aria-expanded={open}>
            <span className={"collapsible-chev" + (open ? " open" : "")}>›</span>
            <b>Новые лицензии (заявки)</b>
          </button>
          <div className="lic-sub">{apps.length} участков · данные на {asOf}</div>
        </td>
        <td style={{ whiteSpace: "nowrap" }}>не присвоены</td>
        <td className="num">{String(area).replace(".", ",")}</td>
        <td><span className="lic-st st-rev">{status}</span></td>
      </tr>
      <tr className={"apps-body" + (open ? " is-open" : "")}>
        <td colSpan={4}>
          <table className="apps-table">
            <tbody>
              <tr><th>№</th><th>Участок недр</th><th>Полезное ископаемое</th><th>Регистрация</th><th>Статус</th><th>Ход согласования</th></tr>
              {apps.map(a => (
                <tr key={a.n}>
                  <td className="num">{a.n}</td>
                  <td>{a.site}</td>
                  <td>{a.mineral}</td>
                  <td>{a.reg}</td>
                  <td><span className={"lic-st " + (a.status === "в работе" ? "st-ok" : "st-warn")}>{a.status}</span></td>
                  <td className="apps-note">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="apps-foot">Площадь по участкам в материалах не выделена, общая – 492 км². {note}</div>
        </td>
      </tr>
    </>
  );
}
