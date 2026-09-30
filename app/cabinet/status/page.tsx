import Topbar from "@/components/Topbar";
import { Collapsible, Kpi, TabbedContent } from "@/components/ui";
import PrintFit from "@/components/PrintFit";
import TasksBoard from "./TasksBoard";
import TasksCounters from "./TasksCounters";
import { tasks, openItems, resolvedItems, protocols, statusReport, sectionAsOf } from "@/lib/data";

const chip: Record<string, string> = { "В работе": "c-run", "К совещанию": "c-due", "Готов": "c-ok", "Открыто": "c-open", "Решено": "c-ok" };

export const metadata = { title: "Статус задач" };

export default function Status() {
  const openCount = openItems.length;
  const current = protocols.find(p => p.current);
  const archive = protocols.filter(p => !p.current);

  return (
    <>
      <PrintFit pages={20} section="Статус задач" />
      <Topbar title="Статус задач" />
      <div className="content">
        <div className="page-head">
          <h1>Статус задач</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/status"]}</div>
        </div>
        <div className="status-top">
          {/* Две группы со своими подписями: даты переносятся на вторую строку вместе со своей группой,
              поэтому на узком экране ничего не уезжает за край плашки */}
          <div className="docs-line">
            <div className="docs-group">
              <span className="docs-lbl">Протоколы</span>
              {protocols.filter(p => p.short !== "Справка по статусу").map((p, i) => (
                <a key={i} className={"doc-d" + (p.current ? " is-current" : "")} href={p.file} target="_blank" rel="noopener" download
                  title={`${p.title} · ${p.org}`}>
                  {p.date}
                </a>
              ))}
            </div>
            <div className="docs-group">
              <span className="docs-lbl">Справки</span>
              {protocols.filter(p => p.short === "Справка по статусу").map((p, i) => (
                <a key={i} className="doc-d" href={p.file} target="_blank" rel="noopener" download title={`${p.title} · ${p.org}`}>
                  {p.date}
                </a>
              ))}
            </div>
          </div>
          <div className="status-kpis status-kpis-row">
            <TasksCounters total={tasks.length} />
            <Kpi cap="Критичных вопросов" val={String(openCount)} unit="шт."
              sub={<a href="#voprosy" className="kpi-link">перейти к списку</a>} />
          </div>
        </div>

        <TabbedContent sections={[
          {
            id: "zadachi", label: "Задачи рабочей группы", content: (
              <TasksBoard tasks={tasks} />
            )
          },
          {
            id: "voprosy", label: `Критичные вопросы · ${openCount}`, content: (
              <div className="crit-block">
                <p className="plain" style={{ fontSize: 12.5, marginTop: 0 }}>
                  Критичные вопросы на контроле рабочей группы: от их решения зависят сроки и состав проекта. Открытые вопросы по вехам – во вкладке «Вехи проекта».
                </p>
                <table>
                  <tbody>
                    <tr><th style={{ width: "50%" }}>Вопрос</th><th>Владелец</th><th>Срок</th><th>Статус</th></tr>
                    {openItems.map((q, i) => (
                      <tr key={i}><td>{q.q}</td><td>{q.who}</td><td style={{ whiteSpace: "nowrap" }}>{q.due}</td>
                        <td><span className={"chip " + (chip[q.st] || "c-open")}>{q.st}</span></td></tr>
                    ))}
                  </tbody>
                </table>
                {resolvedItems.length > 0 ? (
                  <Collapsible title="Решено" subtitle={`${resolvedItems.length} вопроса закрыто`}>
                    <table>
                      <tbody>
                        <tr><th style={{ width: "42%" }}>Вопрос</th><th>Решение</th><th>Дата</th></tr>
                        {resolvedItems.map((q, i) => (
                          <tr key={i}><td>{q.q}</td><td>{q.answer}</td><td style={{ whiteSpace: "nowrap" }}>{q.date}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </Collapsible>
                ) : null}
              </div>
            )
          },
        ]} />
      </div>
    </>
  );
}
