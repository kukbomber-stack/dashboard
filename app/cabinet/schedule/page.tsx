import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import { GanttChart, Collapsible } from "@/components/ui";
import { projectSchedule, ksgRemarks, sectionAsOf } from "@/lib/data";

export const metadata = { title: "График проекта" };

export default function Schedule() {
  return (
    <>
      <PrintFit pages={20} section="График проекта" />
      <Topbar title="График проекта" />
      <div className="content">
        <div className="page-head">
          <h1>График проекта</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/schedule"]}</div>
        </div>

        <GanttChart sections={projectSchedule.sections} />

        {/* Скрытая таблица для выгрузки в Excel: каркас КСГ с подпунктами и вехами */}
        <table className="export-only" data-sheet="КСГ: разделы и работы">
          <tbody>
            <tr><th>Код</th><th>Раздел / работа</th><th>Начало</th><th>Окончание</th><th>Дней</th><th>Критический путь</th><th>Веха</th></tr>
            {projectSchedule.sections.flatMap(sec => [
              <tr key={sec.code}><td>{sec.code}</td><td>{sec.name}</td><td>{sec.start}</td><td>{sec.end}</td><td>{sec.days ?? "–"}</td><td>{sec.key ? "да" : ""}</td><td>{sec.milestone ?? ""}</td></tr>,
              ...sec.sub.map(x => (
                <tr key={x.code}><td>{x.code}</td><td>{"    " + x.name}</td><td>{x.start}</td><td>{x.end}</td><td>{x.days ?? "–"}</td><td>{x.key ? "да" : ""}</td><td>{x.milestone ?? ""}</td></tr>
              )),
            ])}
          </tbody>
        </table>

        <div className="gantt-legend">
          <span><i style={{ background: "var(--teal)" }} />раздел (14 направлений)</span>
          <span><i style={{ background: "#9BAE6E" }} />подпункт направления</span>
          <span><i style={{ background: "var(--warn)" }} />критический путь / ключевая веха</span>
          <span><i style={{ background: "none", border: "none", borderLeft: "1.5px dashed var(--navy)", borderRadius: 0, width: 0, height: 12 }} />сегодня</span>
        </div>

        <p className="plain" style={{ marginTop: 14 }}>Нажмите на раздел, чтобы раскрыть подпункты и вехи.<br />Полная детализация (уровень 2–3, ~150 работ) – в исходном файле КСГ, по запросу.</p>

        <div className="no-print">
        <h2 style={{ marginTop: 24 }}>Замечания к графику</h2>
        <Collapsible title="Перечень замечаний к графику реализации проекта" subtitle={`${ksgRemarks.length} пунктов · номера строк исходного графика`}>
          <table>
            <tbody>
              <tr><th style={{ width: "13%" }}>Строки</th><th style={{ width: "19%" }}>Тема</th><th>Замечание</th></tr>
              {ksgRemarks.map((r, i) => (
                <tr key={i}><td style={{ whiteSpace: "nowrap" }}>{r.rows}</td><td><b>{r.topic}</b></td><td style={{ fontSize: 12.5 }}>{r.text}</td></tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
        </div>
      </div>
    </>
  );
}
