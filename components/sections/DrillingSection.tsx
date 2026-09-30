import React from "react";
import { BarsPlanFact, Collapsible, Donut } from "@/components/ui";
import CoreSection from "@/components/sections/CoreSection";
import {
  monthly, ytd, week, drillPlanFact, drillPlanFactTotal,
  drillMonthPlan, drillPlanTotals, grrProgram, rigPlan, corePlanFact,
} from "@/lib/data";

const ru = (v: number, d = 1) => v.toLocaleString("ru", { maximumFractionDigits: d });
const cm = (v: number) => String(v).replace(".", ",");

export default function DrillingSection() {
  // План по месяцам из производственной программы + отдельный столбец перехода на I кв. 2027.
  const planFactData = [
    ...monthly.map(m => ({ label: m.m, plan: drillMonthPlan[m.m] ?? null, fact: m.v })),
    { label: "Окт", plan: drillMonthPlan["Окт"], fact: null },
    { label: "Ноя", plan: drillMonthPlan["Ноя"], fact: null },
    { label: "Дек", plan: drillMonthPlan["Дек"], fact: null },
    { label: "янв. 2027", plan: 2500, fact: null },
    { label: "фев. 2027", plan: 3200, fact: null },
    { label: "мар. 2027", plan: 3200, fact: null },
  ];
  const maxPF = Math.max(...planFactData.flatMap(d => [d.plan ?? 0, d.fact ?? 0]));

  const maxD = Math.max(...week.days.map(d => d.total));
  const barData = week.days.map(d =>
    d.zbo == null || d.xydx == null
      ? { label: d.d, v: d.total, pale: true }
      : { label: d.d, z: d.zbo, x: d.xydx });

  const pctYear = (ytd.drill / drillPlanTotals.withQ1) * 100;
  // С начала месяца (форма экономического управления): план сентября из производственной программы,
  // факт – реестр проходки с 1 сентября по отчётный день; дневной план – месячный план / 30 дней.
  const monthPlan = drillMonthPlan["Сен*"] ?? 2500;
  const monthFact = monthly.find(m => m.m === "Сен*")?.v ?? 0;
  const daysMonth = week.daysElapsed, daysInMonth = week.daysInMonth;
  const dayPlan = Math.round(monthPlan / daysInMonth);
  const monthPlanToDate = Math.round(monthPlan / daysInMonth * daysMonth);
  const pctMonth = Math.round(monthFact / monthPlan * 100);
  const rateMonth = Math.round(monthFact / daysMonth);
  const monthRemain = Math.max(+(monthPlan - monthFact).toFixed(1), 0);
  const monthOver = Math.max(+(monthFact - monthPlan).toFixed(1), 0);
  const rateNeedMonth = daysInMonth > daysMonth ? Math.round(monthRemain / (daysInMonth - daysMonth)) : 0;
  // Аналитика: по суточному плану от 27.09.2026 плановые показатели по керну не устанавливаются – план null, в плашке «-».
  const anMonthPlan: number | null = grrProgram.rows.find(r => r.n.startsWith("Аналитика"))?.v[0] ?? null;
  // План/факт по дням недели.
  const dayData = week.days.map(d => ({ label: d.d, plan: dayPlan, fact: d.total }));
  const maxDay = Math.max(...dayData.map(d => Math.max(d.plan, d.fact)));
  const weekPlanDay = Math.round(drillPlanTotals.weekPlan / 7);
  const anWeekPlan = anMonthPlan == null ? null : Math.round(anMonthPlan / daysInMonth * 7);
  // С начала года: план на дату – факт января–августа из производственной программы плюс план сентября;
  // годовой ориентир – программа 2026 с переходом на I кв. 2027 (30 655,9 м).
  const prog = (name: string) => grrProgram.rows.find(r => r.n.startsWith(name));
  const drillRow = prog("Буровые"), anRow = prog("Аналитика");
  const ytdPlanDate = Math.round(((drillRow?.jan8 ?? 0) + (drillRow?.v[0] ?? 0)) * 10) / 10;
  const anYtdPlan = Math.round((anRow?.jan8 ?? 0) + (anRow?.v[0] ?? 0));
  const k = (v: number) => cm(+(v / 1000).toFixed(1));   // тысячи метров, один знак
  // Остаток считаем от округлённых значений плашек, чтобы 30,7 - 14,6 на экране сходилось в 16,1
  const remainK = cm(+(+(drillPlanTotals.withQ1 / 1000).toFixed(1) - +(ytd.drill / 1000).toFixed(1)).toFixed(1));
  const noPlan = <>новых результатов нет · план не устанавливается</>;

  // plan = "" – в плашке одно число без пары «факт / план»
  const K = (hl: boolean, cap: string, fact: string, plan: string, unit: string, sub: React.ReactNode) => (
    <div className={"kpi kpi-pf" + (hl ? " hl" : "")}>
      <div className="cap">{cap}</div>
      {/* Факт со слэшем и план – два неразрывных куска: при переносе строка рвётся между ними, а не внутри числа */}
      <div className="val">
        <span className="pf-a">{fact}{plan ? <span className="pf-sep"> /</span> : null}</span>
        {plan ? <span className="pf-b"><span className="pf-plan">{plan}</span>{unit ? <small> {unit}</small> : null}</span>
              : (unit ? <span className="pf-b"><small>{unit}</small></span> : null)}
      </div>
      <div className="sub">{sub}</div>
    </div>
  );

  return (
    <>
      <div className="grr-cols">
        <div>
          <h2 style={{ marginTop: 0 }}>Бурение и аналитика с начала года: факт / план</h2>
          <div className="kpis kpis-4 kpis-pf">
            {K(true, "ГРР, тыс. м", k(ytd.drill), k(drillPlanTotals.withQ1), "", <>{Math.round(pctYear)}% плана с переходом на I кв. 2027</>)}
            {K(false, "Остаток ГРР, тыс. м", remainK, "", "", <>осталось пробурить до конца I квартала 2027 года</>)}
            {K(false, "Аналитика, проб", ru(corePlanFact.analytics.ytd, 0), ru(anYtdPlan, 0), "", <>{Math.round(corePlanFact.analytics.ytd / anYtdPlan * 100)}% плана · с 31.08 без движения</>)}
            {K(false, "Темп бурения, м/сут", String(ytd.rateNow), String(dayPlan), "", <>темп сейчас / план по станкам</>)}
          </div>

          <h3 className="sec-h">По месяцам: план и факт, м <span className="sec-total">сентябрь {ru(monthFact)} из {ru(monthPlan)} м · {pctMonth}%{monthOver > 0 && week.monthPlanDone ? <>, план закрыт {week.monthPlanDone}</> : null}</span></h3>
          <div className="chart chart-eq"><BarsPlanFact data={planFactData} max={maxPF} unit="м" height={262} /></div>
        </div>
        <div>
          <h2 style={{ marginTop: 0 }}>Бурение и аналитика за неделю {week.label}: факт / план</h2>
          <div className="kpis kpis-4 kpis-pf">
            {K(false, "ГРР", ru(week.totalWeek), String(drillPlanTotals.weekPlan), "м", <>{Math.round(week.totalWeek / drillPlanTotals.weekPlan * 100)}% плана недели</>)}
            {K(false, "Аналитика", "0", anWeekPlan == null ? "–" : String(anWeekPlan), "проб", anWeekPlan == null ? noPlan : <>новых результатов нет</>)}
            {K(false, "Темп бурения", String(ytd.rateNow), String(weekPlanDay), "м/сут", <>за неделю / план</>)}
            <div className="kpi kpi-pf">
              <div className="cap">Простои</div>
              <div className="val">–<small> ч</small></div>
              <div className="sub"><a href="#tehnika">не заполнены в отчётах</a></div>
            </div>
          </div>

          <div className="week-row week-row-narrow">
            <div>
              <h3 className="sec-h">По дням: план и факт, м <span className="sec-total">всего {ru(week.totalWeek)} м</span></h3>
              <div className="chart chart-eq"><BarsPlanFact data={dayData} max={maxDay} unit="м" height={262} /></div>
            </div>
            <div>
              <h3 className="sec-h">Бурение станками/нед.</h3>
              <a className="chart chart-link chart-eq" href="#tehnika" title="Перейти в «Техника и обеспечение участка»">
                <Donut size={150} thickness={26}
                  centerLabel={ru(week.totalWeek)} centerSub="м за неделю"
                  data={[
                    { label: `ZBO ${ru(week.zboWeek)}`, value: week.zboWeek, color: "var(--teal)" },
                    { label: `XYDX ${ru(week.xydxWeek)}`, value: week.xydxWeek, color: "var(--copper)" },
                  ]} />
                <div className="chart-link-note">Подробнее ›</div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Скрытые таблицы для выгрузки в Excel: данные графиков «по месяцам» и «по дням» */}
      <table className="export-only" data-sheet="Бурение по месяцам">
        <tbody>
          <tr><th>Месяц</th><th>План, м</th><th>Факт, м</th></tr>
          {/* будущие месяцы без факта остаются пустыми: это не пробел в данных, а ещё не наступивший период */}
          {planFactData.map((d, i) => <tr key={i}><td>{d.label}</td><td>{d.plan != null ? ru(d.plan) : ""}</td><td>{d.fact != null ? ru(d.fact) : ""}</td></tr>)}
        </tbody>
      </table>
      <table className="export-only" data-sheet="Бурение по дням недели">
        <tbody>
          <tr><th>День</th><th>План, м</th><th>Факт, м</th><th>ZBO S15, м</th><th>XYDX-5C, м</th><th>Примечание</th></tr>
          {week.days.map((d, i) => <tr key={i}><td>{d.d}</td><td>{dayPlan}</td><td>{ru(d.total)}</td><td>{d.zbo != null ? ru(d.zbo) : "–"}</td><td>{d.xydx != null ? ru(d.xydx) : "–"}</td><td>{d.note}</td></tr>)}
        </tbody>
      </table>

      <Collapsible title="План бурения по станкам" subtitle={`суточный план от ${rigPlan.asOf} · ${rigPlan.variant} · ${ru(rigPlan.all)} м за сентябрь 2026 – март 2027`} defaultOpen>
        {/* Вариант 2: в 2026 году оба станка на Унге, с января 2027 оба на Пинигино. Строка станка –
            метры по месяцам его участка, под ней плановый темп в сутки из того же файла. */}
        <table className="prog-table rig-plan">
          <tbody>
            <tr>
              <th rowSpan={2}>Станок</th>
              {rigPlan.siteBand.map((b, i) => <th key={i} className="ctr band" colSpan={b.span}>{b.site} <em>{ru(b.v)} м</em></th>)}
              <th className="num" rowSpan={2}>Сен–дек<br />2026</th>
              <th className="num" rowSpan={2}>I кв.<br />2027</th>
              <th className="num" rowSpan={2}>Итого<br />7 мес.</th>
            </tr>
            <tr>{rigPlan.months.map((m, i) => <th key={i} className="num">{m}</th>)}</tr>
            {rigPlan.rigs.map((r, i) => {
              const s2026 = r.v.slice(0, 4).reduce((a, b) => a + b, 0), q1 = r.v.slice(4).reduce((a, b) => a + b, 0);
              return (
                <React.Fragment key={i}>
                  <tr className="total">
                    <td>{r.rig}, м</td>
                    {r.v.map((v, j) => <td key={j} className="num">{ru(v)}</td>)}
                    <td className="num">{ru(s2026)}</td><td className="num">{ru(q1)}</td><td className="num">{ru(r.total)}</td>
                  </tr>
                  <tr className="dim-row">
                    <td>в сутки на станок, м</td>
                    {r.day.map((v, j) => <td key={j} className="num">{v}</td>)}
                    <td className="num"></td><td className="num"></td><td className="num"></td>
                  </tr>
                </React.Fragment>
              );
            })}
            <tr className="total">
              <td>Итого по станкам, м</td>
              {rigPlan.total.map((v, j) => <td key={j} className="num">{ru(v)}</td>)}
              <td className="num">{ru(rigPlan.y2026)}</td><td className="num">{ru(rigPlan.q1_2027)}</td><td className="num">{ru(rigPlan.all)}</td>
            </tr>
          </tbody>
        </table>
        <p className="plain" style={{ marginTop: 8, fontSize: 12.5 }}>
          <span className="pf-oneline">Вариант 2 (Сценарий 2 протокола РГ): до конца 2026 года оба станка на Унге-Нимгеркане ({ru(rigPlan.y2026)} м), с января 2027 – на Пинигино ({ru(rigPlan.q1_2027)} м).</span>
          <span className="pf-oneline">План 2026 по участкам: Унга {ru(rigPlan.plan2026[1].v)} м и Притрассовый {ru(rigPlan.plan2026[0].v)} м, вместе {ru(rigPlan.plan2026total)} м, как в программе.</span>
          <span className="pf-oneline">Факт сентября на 27.09: XYDX {ru(drillPlanFact.find(r => r.site.includes("Унга"))?.mFact ?? 0)} м, ZBO {ru(drillPlanFact.find(r => r.site.includes("Притрассовый"))?.mFact ?? 0)} м.</span>
        </p>
      </Collapsible>

      {/* Производственная программа по месяцам: на экране раскрыта, в печать не идёт – помесячные объёмы
          бурения повторяют план по станкам, а керн и пробы есть в таблице «Пробоподготовка и аналитика». */}
      <Collapsible title="Производственная программа ГРР по месяцам" subtitle={`форма ПЭО от 27.09.2026 · ${ru(drillPlanTotals.y2026)} м в 2026 году`} defaultOpen printCollapsed>
        <table className="prog-table">
          <tbody>
            <tr>
              <th>Показатель</th>
              <th className="num">Янв–авг<br />факт</th>
              {grrProgram.cols.map((c, i) => <th key={i} className="num">{c}</th>)}
              <th className="num">Итого<br />2026</th>
              <th className="num">2026 +<br />I кв. 27</th>
            </tr>
            {grrProgram.rows.map((r, i) => (
              <tr key={i} className={r.key ? "total" : ""}>
                <td>{r.n}</td>
                <td className="num">{ru(r.jan8)}</td>
                {grrProgram.cols.map((_, j) => <td key={j} className="num">{r.v[j] != null ? ru(r.v[j]) : <span className="dim">–</span>}</td>)}
                <td className="num">{r.y2026 != null ? ru(r.y2026) : <span className="dim">–</span>}</td>
                <td className="num">{r.tot != null ? ru(r.tot) : <span className="dim">–</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="plain" style={{ marginTop: 8, fontSize: 12.5 }}>{grrProgram.caution}</p>
      </Collapsible>

      <Collapsible title="Бурение: план/факт, пог. м" subtitle="по объектам · неделя, сентябрь и с начала года">
      <p className="plain" style={{ fontSize: 12.5 }}>
        <span className="pf-oneline">БП – бизнес-план (+10 т JORC к I кв. 2027), Акт. БП – годовой план участка по производственной программе в варианте 2.</span>
        <span className="pf-oneline">Планы недели и сентября – по суточному плану от 29.09.2026: весь сентябрь отнесён к Унге, поэтому у Притрассового план 0 при факте {ru(drillPlanFact[2].mFact ?? 0)} м.</span>
        <span className="pf-oneline">План с начала года – факт января–августа по реестру плюс сентябрь.</span>
      </p>
      <table className="pf-table pf-wide">
        <tbody>
          <tr>
            <th rowSpan={2}>Объект</th>
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
          {drillPlanFact.map((r, i) => {
            const pct = r.yPlan && r.yFact ? Math.round((r.yFact / r.yPlan) * 100) : null;
            const f = (v: number | null) => v == null ? <span className="dim">–</span> : ru(v);
            // Акт. БП: по участку – из программы, по строке лицензии – сумма её участков.
            const siteAct = (name: string) => grrProgram.bySite2026.find(s => name.includes(s.site.split("-")[0]))?.drill ?? null;
            const licAct: Record<string, number> = {
              "Пинигинское м-е": (siteAct("Притрассовый") ?? 0) + (siteAct("Кур") ?? 0),
              "Пинигинская пл.": siteAct("Унга") ?? 0,
              "М. Леглиер-Васильевка": 0, "Ручей Аппы": 0, "Медведевка-Михайловка": 0,
            };
            // Участки, которых нет в программе (Рохма, Бривас), в 2026 году не бурятся – это 0, а не пропуск.
            const act = r.lic ? licAct[r.site] ?? null : siteAct(r.site) ?? 0;
            const dev = (plan: number | null, fact: number | null) => {
              if (plan == null || fact == null) return <span className="dim">–</span>;
              const d = +(fact - plan).toFixed(1);
              return <span className={d >= 0 ? "pos" : "neg"}>{d > 0 ? "+" : ""}{ru(d)}</span>;
            };
            return (
              <tr key={i} className={r.lic ? "pf-lic" : ""}>
                <td>{r.site}</td>
                <td className="num">{f(r.bp)}</td>
                <td className="num">{f(act)}</td>
                <td className="num">{f(r.wPlan)}</td><td className="num">{f(r.wFact)}</td>
                <td className="num">{f(r.mPlan)}</td><td className="num">{f(r.mFact)}</td>
                <td className="num">{f(r.yPlan)}</td><td className="num">{f(r.yFact)}</td><td className="num">{dev(r.yPlan, r.yFact)}</td>
                <td className={"num" + (pct && pct > 100 ? " warncell" : "")}>{pct != null ? pct + "%" : <span className="dim">–</span>}</td>
              </tr>
            );
          })}
          <tr className="total">
            <td>Итого по лицензиям</td>
            <td className="num">{ru(drillPlanFactTotal.bp, 0)}</td>
            <td className="num">{ru(drillPlanTotals.y2026)}</td>
            <td className="num">{ru(drillPlanFactTotal.wPlan)}</td><td className="num">{ru(drillPlanFactTotal.wFact)}</td>
            <td className="num">{ru(drillPlanFactTotal.mPlan, 0)}</td><td className="num">{ru(drillPlanFactTotal.mFact)}</td>
            <td className="num">{ru(drillPlanFactTotal.yPlan)}</td><td className="num">{ru(drillPlanFactTotal.yFact)}</td>
            <td className="num">{(() => { const d = +(drillPlanFactTotal.yFact - drillPlanFactTotal.yPlan).toFixed(1); return <span className={d >= 0 ? "pos" : "neg"}>{d > 0 ? "+" : ""}{ru(d)}</span>; })()}</td>
            <td className="num">{Math.round(drillPlanFactTotal.yFact / drillPlanFactTotal.yPlan * 100)}%</td>
          </tr>
          <tr><td>Станков в работе</td><td className="num" colSpan={10}>{drillPlanFactTotal.rigs}</td></tr>
        </tbody>
      </table>

      </Collapsible>

      <CoreSection />

    </>
  );
}