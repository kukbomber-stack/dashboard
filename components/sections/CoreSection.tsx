import { Collapsible } from "@/components/ui";
import { ytd, week, corePlanFact, grrProgram, core, monthly, drillPlanFactTotal, rigPlan } from "@/lib/data";

// Пробоподготовка и аналитика: план/факт по той же логике столбцов, что и таблица «Бурение: план/факт».
// БП 2026 – бизнес-план (есть только по бурению: 25 000 м); Акт. БП – актуализированная производственная
// программа 2026; неделя – сентябрьский объём программы ÷ дней в месяце × 7; сентябрь – месячный объём
// программы целиком; с начала 2026 – факт января–августа по программе + план сентября.
// По суточному плану от 27.09.2026 документация керна планируется в объёме проходки, а по распиловке,
// пробоподготовке и аналитике плановые показатели не устанавливаются – в плановых столбцах стоит «-».
// Факт – суточный отчёт участка (доставка = проходка; документация, распиловка, пробоподготовка – по листам
// отчёта). Аналитика – результаты лаборатории: январь–август по программе, с 31.08 новых результатов нет.
type P = number | null;
type Row = { name: string; unit: string; bp: P; act: P; w: [number, P]; m: [number, P]; y: [number, P] };

const sept = (name: string) => grrProgram.rows.find(r => r.n.startsWith(name));
const monthPlan = (name: string): P => { const r = sept(name); return r && r.v.length ? r.v[0] : null; };
const weekPlan = (name: string): P => { const m = monthPlan(name); return m == null ? null : Math.round(m / week.daysInMonth * 7); };
const ytdPlan = (name: string): P => { const m = monthPlan(name); return m == null ? null : Math.round(((sept(name)?.jan8 ?? 0) + m) * 10) / 10; };
const yearPlan = (name: string): P => sept(name)?.y2026 ?? null;
const monthDrill = monthly.find(m => m.m.startsWith("Сен"))?.v ?? 0; // доставка керна за месяц равна проходке

const rows: Row[] = [
  { name: "Доставка керна", unit: "м", bp: drillPlanFactTotal.bp, act: yearPlan("Буровые"), w: [week.coreWeek, weekPlan("Буровые")], m: [monthDrill, monthPlan("Буровые")], y: [ytd.core, ytdPlan("Буровые")] },
  { name: "Документация керна", unit: "м", bp: null, act: yearPlan("Документация"), w: [week.docWeek, weekPlan("Документация")], m: [corePlanFact.month.doc, monthPlan("Документация")], y: [ytd.doc, ytdPlan("Документация")] },
  { name: "Распиловка", unit: "м", bp: null, act: yearPlan("Распиловка"), w: [corePlanFact.week.saw, weekPlan("Распиловка")], m: [corePlanFact.month.saw, monthPlan("Распиловка")], y: [corePlanFact.total.saw[1] ?? 0, ytdPlan("Распиловка")] },
  { name: "Пробоподготовка", unit: "проб", bp: null, act: yearPlan("Пробоподготовка"), w: [corePlanFact.week.prep, weekPlan("Пробоподготовка")], m: [corePlanFact.month.prep, monthPlan("Пробоподготовка")], y: [corePlanFact.total.prep[1] ?? 0, ytdPlan("Пробоподготовка")] },
  { name: "Аналитика (результаты)", unit: "проб", bp: null, act: yearPlan("Аналитика"), w: [corePlanFact.analytics.week, weekPlan("Аналитика")], m: [corePlanFact.analytics.month, monthPlan("Аналитика")], y: [corePlanFact.analytics.ytd, ytdPlan("Аналитика")] },
];

const dash = <span className="dim">–</span>;
const f = (v: P, unit: string) => v == null ? dash : v.toLocaleString("ru", { minimumFractionDigits: unit === "м" ? 1 : 0, maximumFractionDigits: unit === "м" ? 1 : 0 });
const dev = (plan: P, fact: number, unit: string) => {
  if (plan == null) return dash;
  const d = Math.round((fact - plan) * 10) / 10;
  return <span className={d >= 0 ? "pos" : "neg"}>{d > 0 ? "+" : ""}{f(d, unit)}</span>;
};
const pct = (fact: number, plan: P) => {
  if (!plan) return dash;
  const p = Math.round((fact / plan) * 100);
  return <span className={p >= 100 ? "pos" : p < 80 ? "neg" : ""}>{p}%</span>;
};
const labVal = (c: string) => core.lab.find(l => l.c === c)?.v ?? "–";

export default function CoreSection() {
  return (
    <Collapsible title="Пробоподготовка и аналитика: план/факт" subtitle="по видам работ · неделя, сентябрь и с начала года" defaultOpen>
      <p className="plain" style={{ fontSize: 12.5 }}>
        Столбцы как в таблице бурения. План по керну и пробам взят из производственной программы ПЭО:
        в суточном плане по станкам от {rigPlan.asOf} он не задан.
      </p>
      <table className="pf-table pf-wide core-pf">
        <tbody>
          <tr>
            <th rowSpan={2}>Показатель</th>
            <th className="num" rowSpan={2}>БП 2026</th>
            <th className="num" rowSpan={2}>Акт. БП</th>
            <th className="ctr" colSpan={2}>Неделя<br />{week.label}</th>
            <th className="ctr" colSpan={2}>Сентябрь<br />{week.monthLabel}</th>
            <th className="ctr" colSpan={4}>С начала 2026</th>
          </tr>
          <tr>
            <th className="num">БП</th><th className="num">факт</th>
            <th className="num">БП</th><th className="num">факт</th>
            <th className="num">БП</th><th className="num">факт</th><th className="num">+/- БП</th><th className="num">%</th>
          </tr>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><b>{r.name}</b>, {r.unit}</td>
              <td className="num">{r.bp == null ? dash : r.bp.toLocaleString("ru")}</td>
              <td className="num">{f(r.act, r.unit)}</td>
              <td className="num">{f(r.w[1], r.unit)}</td><td className="num">{f(r.w[0], r.unit)}</td>
              <td className="num">{f(r.m[1], r.unit)}</td><td className="num">{f(r.m[0], r.unit)}</td>
              <td className="num">{f(r.y[1], r.unit)}</td><td className="num">{f(r.y[0], r.unit)}</td>
              <td className="num">{dev(r.y[1], r.y[0], r.unit)}</td>
              <td className="num">{pct(r.y[0], r.y[1])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="plain" style={{ fontSize: 12.5, marginTop: 8 }}>
        <span className="pf-oneline">Отставание документации от доставки – {ytd.docLag.toLocaleString("ru", { maximumFractionDigits: 1 })} м.
        Лаборатория: отправлено {labVal("Отправлено в лабораторию")}, получено {labVal("Получено результатов")}, ожидается {labVal("Ожидается")} проб.</span>
        <span className="pf-oneline">Новых результатов с 31.08 не поступало: пять партий (1 213 проб) в лаборатории с 21.09.</span>
      </p>
    </Collapsible>
  );
}
