import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import Link from "next/link";
import { Kpi } from "@/components/ui";
import { budgetTable, budgetFunding, budget2y, funding, sectionAsOf } from "@/lib/data";

export const metadata = { title: "Финансирование" };

// Все цифры в плашках раздела – целыми числами: дробные доли в них не читаются, а точные
// значения с десятыми остаются в таблице «Затраты и финансирование по статьям».
const m0 = (v: number) => Math.round(v).toLocaleString("ru");

// Бюджет двух лет: из чего складываются 55 млн $ решения рабочей группы.
// Полоса показывает доли ГРР и ОПР, под ней – суммы 2026 + 2027 и лимиты протокола.
function TwoYearBudget() {
  const w = (v: number) => (v / budget2y.core) * 100;
  return (
    <div className="keep-block b2y">
      <h2 className="h2-inline">Лимит проекта 2026-2027 <span>млн ₽ с НДС · курс {budget2y.rate} ₽/$</span></h2>
      {/* Пять плашек в одну линию: две цветные – доли стадий в долларах решения РГ,
          три светлые – из чего складываются суммы в рублях и лимиты протокола */}
      <div className="b2y-five">
        {budget2y.parts.map(p => (
          <div key={p.name} className={"b2y-seg b2y-" + (p.name === "ГРР" ? "grr" : "opr")}>
            <b>{p.name} <em>{Math.round(w(p.total))}%</em></b>
            <span>{p.usd} <small>млн $</small></span>
          </div>
        ))}
        {budget2y.parts.map(p => (
          <div key={p.name} className="b2y-row">
            <div className="b2y-cap">{p.name} <i>{p.note}</i></div>
            <div className="b2y-val">{m0(p.plan26)} <span>+</span> {m0(p.plan27)} <span>=</span> <b>{m0(p.total)}</b> млн ₽</div>
            <div className="b2y-sub">2026 + 2027 · лимит РГ {p.usd} млн $</div>
          </div>
        ))}
        <div className="b2y-row b2y-total">
          <div className="b2y-cap">Итого ГРР + ОПР</div>
          <div className="b2y-val"><b>{m0(budget2y.core)}</b> млн ₽ = <b>{budget2y.coreUsd}</b> млн $</div>
          <div className="b2y-sub">лимит РГ 55 млн $ = {m0(budget2y.limit)} млн ₽</div>
        </div>
      </div>
      <p className="plain" style={{ fontSize: 12.5, marginTop: 8 }}>
        Лимит рабочей группы (протокол 08–10.07.2026) – 4 400 млн ₽, или 55 млн $: ГРР до 800, ОПР до 3 600.
      </p>
    </div>
  );
}

export default function Costs() {
  const pct = (fact: number, plan: number) => Math.round((fact / plan) * 100);
  const rows = [...budgetTable, ...budgetFunding];

  return (
    <>
      <PrintFit pages={20} section="Финансирование" />
      <Topbar title="Финансирование" />
      <div className="content">
        <h1>Финансирование</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/costs"]}</div>

        <h2 className="h2-inline">Финансирование и оплата на {funding.asOf} с момента подписания сделки ({funding.dealDate}) <span>млн ₽ с НДС</span></h2>
        {/* Первый ряд – откуда деньги, второй – куда потрачены */}
        <div className="kpis kpis-sm fin-row1">
          <Kpi hl cap="Профинансировано" val={m0(funding.financed)} unit="млн ₽"
            sub={<>в т.ч. {funding.lenders.map(l => `${m0(l.v)} ${l.name}`).join(" · ")}</>} />
          <Kpi cap="Возмещение НДС" val={m0(funding.vat)} unit="млн ₽" sub={`с ${funding.dealDate}`} />
          <Kpi cap="Остаток на расчётном счёте" val={m0(funding.account)} unit="млн ₽" sub={`на ${funding.asOf}`} />
        </div>
        <div className="kpis kpis-sm fin-row2">
          <Kpi cap="Оплачено" val={m0(funding.paid)} unit="млн ₽" sub={`с ${funding.dealDate}`} />
          <Kpi cap="в т.ч. ГРР" val={m0(funding.grr)} unit="млн ₽"
            sub={`${pct(funding.grr, funding.grrLimit)}% лимита ${m0(funding.grrLimit)} млн ₽`} />
          <Kpi cap="в т.ч. ОПР" val={m0(funding.opr)} unit="млн ₽"
            sub={`${pct(funding.opr, funding.oprLimit)}% лимита ${m0(funding.oprLimit)} млн ₽`} />
          <Kpi cap="в т.ч. ГРР по россыпям" val={m0(funding.placer)} unit="млн ₽" sub={`с ${funding.dealDate}`} />
        </div>

        <TwoYearBudget />

        <div className="pf-page-break">
        <h2 className="h2-inline" style={{ marginTop: 22 }}>Затраты и финансирование по статьям <span>млн ₽ с НДС · факт – оплата</span></h2>
        <p className="plain" style={{ fontSize: 12.5, margin: "2px 0 8px" }}>
          Источник – форма ПЭО «Бюджет 2026-2027» на {funding.asOf}, факт – оплата.
          Отставание по ОПР ({m0(funding.opr)} млн ₽ при плане {m0(funding.oprPlan)}) – перенос изысканий, оборудования и СМР.
        </p>
        <table className="pf-table budget-v2">
          <colgroup>
            <col style={{ width: "3.5%" }} /><col style={{ width: "23.5%" }} />
            <col style={{ width: "7%" }} /><col style={{ width: "7%" }} /><col style={{ width: "7.5%" }} />
            <col style={{ width: "6.5%" }} /><col style={{ width: "6.5%" }} /><col style={{ width: "6.5%" }} /><col style={{ width: "6.5%" }} />
            <col style={{ width: "6.5%" }} /><col style={{ width: "6.5%" }} /><col style={{ width: "6.5%" }} />
          </colgroup>
          <tbody>
            <tr>
              <th rowSpan={2}>№</th>
              <th rowSpan={2}>Наименование статей затрат</th>
              <th className="ctr" colSpan={3}>Бизнес-план</th>
              <th className="ctr" colSpan={2}>Неделя {funding.week.replace(".2026", "")}</th>
              <th className="ctr" colSpan={2}>Сентябрь</th>
              <th className="ctr" colSpan={3}>С начала года</th>
            </tr>
            <tr>
              <th className="num">2026</th><th className="num">2027</th><th className="num">2026+2027</th>
              <th className="num">план</th><th className="num">факт</th>
              <th className="num">план</th><th className="num">факт</th>
              <th className="num">план</th><th className="num">факт</th><th className="num">%</th>
            </tr>
            {rows.map((r, i) => {
              // Пустая ячейка – не «нет данных»: в строке-заголовке организации показателей нет,
              // а по статьям 2027 года («операционные расходы по запуску», выручка) факта 2026 года быть не может.
              // Каждый вызов создаёт свой элемент: один и тот же объект в нескольких ячейках ломает сборку.
              const none = () => r.head ? null : r.only27 ? <span className="dim">–</span> : <span className="dim">–</span>;
              const f = (v: number | null) => v == null ? none() : v.toLocaleString("ru", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
              const p = r.y[0], fact = r.y[1];
              const done = p != null && fact != null && p > 0 ? Math.round((fact / p) * 100) : null;
              return (
                <tr key={i} className={(r.total ? "total " : "") + (r.level === 1 ? "budget-sub " : "") + (r.level === 2 ? "budget-sub2" : "")}>
                  <td className="num">{r.n}</td>
                  <td>{r.name}</td>
                  <td className="num">{f(r.bp)}</td><td className="num">{f(r.bp27)}</td><td className="num b-tot">{f(r.bpTot)}</td>
                  <td className="num">{f(r.w[0])}</td><td className="num">{f(r.w[1])}</td>
                  <td className="num">{f(r.m[0])}</td><td className="num">{f(r.m[1])}</td>
                  <td className="num">{f(r.y[0])}</td><td className="num">{f(r.y[1])}</td>
                  <td className="num">{done == null ? (p === 0 ? <span className="dim">–</span> : none()) : <span className={done >= 90 ? "pos" : done < 50 ? "neg" : ""}>{done}%</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

      </div>
    </>
  );
}
