"use client";
import { useState } from "react";
import MapZoom from "./MapZoom";
import type { licenses as Licenses, licenseApplications as Apps } from "@/lib/data";

type Lic = (typeof Licenses)[number];
type AppsData = typeof Apps;

const tone = (s: string) =>
  s.startsWith("заявка на продление") || s.startsWith("продление") ? "st-warn" : s === "на рассмотрении" ? "st-rev" : "st-ok";

// Портфель лицензий, карта и раскрывающийся блок заявок под ними на всю ширину.
export default function Board({ licenses, apps }: { licenses: Lic[]; apps: AppsData }) {
  const [open, setOpen] = useState(false);
  const rows = licenses.filter(l => !l.asset.startsWith("Новые лицензии"));
  const newLic = licenses.find(l => l.asset.startsWith("Новые лицензии"));
  return (
    <>
      <div className="lic-apps lic-portfolio">
        <div>
          <table className="ctr-table lic-port">
            <tbody>
              <tr>
                <th>Актив / участки</th><th>Лицензия</th><th className="num">Площадь, км²</th><th>Срок действия лицензии</th>
              </tr>
              {rows.map((l, i) => (
                <tr key={i}>
                  <td>
                    <b>{l.asset}</b>
                    {l.sites !== "–" ? <div className="lic-sub">{l.sites}</div> : null}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{l.number}</td>
                  <td className="num">{String(l.area).replace(".", ",")}</td>
                  <td>
                    <div className="lic-exp">{l.expiry}</div>
                    <span className={"lic-st " + tone(l.status)}>{l.status}</span>
                  </td>
                </tr>
              ))}
              {newLic ? (
                <tr className={"apps-head" + (open ? " is-open" : "")} onClick={() => setOpen(v => !v)} title="Показать все заявки">
                  <td>
                    <button type="button" className="apps-toggle" aria-expanded={open}>
                      <span className={"collapsible-chev" + (open ? " open" : "")}>›</span>
                      <b>Новые лицензии (заявки)</b>
                    </button>
                    <div className="lic-sub">{apps.rows.length} участков · данные на {apps.asOf}</div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{newLic.number}</td>
                  <td className="num">{String(newLic.area).replace(".", ",")}</td>
                  <td><span className="lic-st st-rev">{newLic.status}</span></td>
                </tr>
              ) : null}
              <tr className="total"><td>Итого</td><td></td><td className="num">625</td><td></td></tr>
            </tbody>
          </table>
        </div>
        <MapZoom src="/map-licenses.jpg" alt="Схема расположения полученных и запрашиваемых лицензионных площадей, 2026" />
      </div>

      <div className={"apps-panel" + (open ? "" : " is-off")}>
          <h2>Заявки на новые лицензии <span className="h2-note">данные на {apps.asOf} · 492 км² на рассмотрении</span></h2>
          <table className="apps-table ctr-table">
            <tbody>
              <tr><th>№</th><th>Участок недр</th><th>Полезное ископаемое</th><th>Регистрация</th><th>Статус</th><th>Ход согласования</th></tr>
              {apps.rows.map(a => (
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
          <p className="plain" style={{ fontSize: 12.5 }}>{apps.note}</p>
      </div>
    </>
  );
}
