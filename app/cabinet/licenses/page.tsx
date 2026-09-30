import Topbar from "@/components/Topbar";
import { licenses, licenseApplications, sectionAsOf } from "@/lib/data";
import { Kpi } from "@/components/ui";
import Board from "./Board";
import PrintFit from "@/components/PrintFit";

// Подсветка статуса оформления под сроком действия лицензии.
const tone = (s: string) =>
  s.startsWith("заявка на продление") || s.startsWith("продление") ? "st-warn" : s === "на рассмотрении" ? "st-rev" : "st-ok";

export const metadata = { title: "Лицензии" };

export default function Licenses() {
  return (
    <>
      <PrintFit pages={20} section="Лицензии" />
      <Topbar title="Лицензии" />
      <div className="content">
        <h1>Лицензии</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/licenses"]}</div>

        <div className="kpis kpis-sm lic-kpis">
          <Kpi hl cap="Лицензионная площадь" val="132,6" unit="км²" sub="действующие · ещё 492 км² на рассмотрении, всего 625 км²" />
          <Kpi cap="Лицензии" val="5 + 5" unit="" sub="5 действующих · 5 поданных заявок, Якутнедра" />
          <Kpi cap="Ближайший срок" val="15.02.2027" unit="" sub="ЯКУ 02634 БЭ · продление в процессе" />
        </div>

        <Board licenses={licenses} apps={licenseApplications} />

      </div>
    </>
  );
}
