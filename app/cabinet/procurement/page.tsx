import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import { Kpi, PreviewTable, TabbedContent, Collapsible } from "@/components/ui";
import { lots, lotStages, lotsAsOf, oprNeeds, oprNeedsTotal, unpricedRequests, emsSelection, sectionAsOf, type LotDate, type Dir } from "@/lib/data";

const m = (v: number) => v.toLocaleString("ru", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const m2 = (v: number) => v.toLocaleString("ru", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NO = <span className="dim">–</span>;

export const metadata = { title: "Статус закупок и услуг по ОПР и ГРР" };

export default function Procurement() {
  const lotsCost = lots.reduce((s, l) => s + l.cost, 0);
  const decided = lots.filter(l => l.final != null);
  // Ближайшее утверждение итогов среди ещё не завершённых лотов (плановые даты).
  const next = [...lots].filter(l => l.dates.approve.plan).sort((a, b) => a.dates.approve.v.split(".").reverse().join() < b.dates.approve.v.split(".").reverse().join() ? -1 : 1)[0];
  const D = (d: LotDate) => <span className={d.plan ? "d-plan" : "d-fact"} title={d.plan ? "плановая дата" : "фактическая дата"}>{d.v}</span>;
  const stageBar = (stage: string) => {
    const k = lotStages.indexOf(stage) + 1;
    return <span className="stage-bar" title={`этап ${k} из ${lotStages.length}: ${stage}`}>{lotStages.map((_, i) => <i key={i} className={i < k ? "on" : ""} />)}</span>;
  };
  const lotOf = (n: number) => lots.find(l => l.need === n);
  // Направление бюджета и статья затрат – как в реестре закупок; ГОК – работы следующей стадии, вне бюджета 2026–2027.
  const dirCell = (dir: Dir, art: string) => (
    <td className="ctr dir-cell"><span className={"dir-" + (dir === "ГРР" ? "grr" : dir === "ГОК" ? "gok" : "opr")}>{dir}</span><i>{art}</i></td>
  );

  return (
    <>
      <PrintFit pages={20} section="Закупки" />
      <Topbar title="Статус закупок и услуг по ОПР и ГРР" />
      <div className="content">
        <div className="page-head">
          <h1>Статус закупок и услуг по ОПР и ГРР</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/procurement"]}</div>
        </div>

        <div className="kpis kpis-sm fin-kpis5">
          <Kpi hl cap="Лотов в закупке" val={String(lots.length)} unit="лотов" sub={`оценочно ${m(lotsCost)} млн ₽ без НДС · итоги подведены по ${decided.length}`} hint="Реестр «Статусы лотов» управления по закупкам: лоты с номером, по которым идёт закупочная процедура." />
          <Kpi cap="Ближайшее утверждение итогов" val={next ? next.dates.approve.v : "–"} unit="" sub={next ? `${next.id} · ${next.subject.split(" для ")[0].toLowerCase()} · план` : ""} />
          <Kpi cap="План потребности ОПР" val={String(oprNeedsTotal.positions)} unit="позиций" sub={`${m(oprNeedsTotal.vat)} млн ₽ с НДС · ${m(oprNeedsTotal.noVat)} без НДС`} hint="Предварительный перечень основных потребностей в работах и услугах по бюджету ОПР (Плотников С.Н.). Стоимость – ориентировочная цена договора." />
          <Kpi cap="Открыто лотов из плана" val={`${lots.length}`} unit={`из ${oprNeedsTotal.positions}`} sub={`остальные ${oprNeedsTotal.positions - lots.length} – заявки в реестре без номера лота`} />
          <Kpi cap="Заявок без оценки" val={String(unpricedRequests.length)} unit="" sub="инициатор Нартов М.В. · стоимость не определена" />
        </div>

        <TabbedContent sections={[
          {
            id: "lots", label: `Закупочные процедуры · ${lots.length}`, content: (
              <>
        <h2>Реестр лотов на {lotsAsOf}</h2>
        <p className="plain" style={{ fontSize: 12.5, marginTop: 0 }}>
          Оценочная стоимость, млн ₽ без НДС. Даты: <span className="d-fact">чёрным – фактические</span>, <span className="d-plan">зелёным – плановые</span>. Инициатор – Плотников С.Н., закупка – Трубеев Н.В.
        </p>
        <table className="lots-table">
          <colgroup>
            <col style={{ width: "7.5%" }} /><col style={{ width: "23.5%" }} /><col style={{ width: "5.5%" }} /><col style={{ width: "6%" }} /><col style={{ width: "16.5%" }} />
            {[0, 1, 2, 3, 4, 5, 6].map(i => <col key={i} style={{ width: "5.857%" }} />)}
          </colgroup>
          <tbody>
            <tr>
              <th>№ лота</th><th>Предмет закупки</th><th className="ctr th-two" title="Направление бюджета и статья затрат по реестру закупок: ГРР – запасы, кондиции и лицензия; ОПР – карьер и ОПУ; ГОК – следующая стадия, в бюджет 2026–2027 не входит">Бюджет<span className="th-sub">статья затрат</span></th><th className="num">Оценка</th><th>Стадия</th>
              <th className="ctr">Заявка</th><th className="ctr">Рас{"\u00AD"}сылка</th><th className="ctr">Сбор ТКП</th><th className="ctr">Тех{"\u00AD"}оценка</th><th className="ctr">Перего{"\u00AD"}воры</th><th className="ctr">Итоги</th><th className="ctr">Утверж{"\u00AD"}дение</th>
            </tr>
            {lots.map(l => (
              <tr key={l.id}>
                <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{l.id}</td>
                <td><a href="#plan" className="row-link" title="Позиция плана потребности">{l.subject}{l.qty > 1 ? ` (${l.qty} ${l.unit})` : ""} ›</a>
                  {l.final != null ? <div className="lot-result">итог: {l.contractor}, {m2(l.final)} млн ₽</div> : null}
                </td>
                {dirCell(l.dir, l.art)}
                <td className="num">{l.cost >= 100 ? l.cost.toLocaleString("ru") : m2(l.cost)}</td>
                <td><span className={"chip " + (l.final != null ? "c-ok" : "c-run")}>{l.stage}</span>{stageBar(l.stage)}</td>
                <td className="ctr">{D(l.dates.req)}</td><td className="ctr">{D(l.dates.invite)}</td><td className="ctr">{D(l.dates.tkp)}</td>
                <td className="ctr">{D(l.dates.tech)}</td><td className="ctr">{D(l.dates.talks)}</td><td className="ctr">{D(l.dates.results)}</td><td className="ctr">{D(l.dates.approve)}</td>
              </tr>
            ))}
            <tr className="total">
              <td colSpan={3}>Итого по лотам</td><td className="num">{m(lotsCost)}</td><td colSpan={8} style={{ fontSize: 12.5, fontWeight: 500 }}>лот 03 (EPC) – 4 000 млн ₽ по реестру против 2 000 млн ₽ в плане потребности; расхождение на уточнении</td>
            </tr>
          </tbody>
        </table>
              </>
            )
          },
          {
            id: "plan", label: `План потребности ОПР · ${oprNeedsTotal.positions}`, content: (
              <>
        <h2>Предварительный перечень потребностей в работах и услугах по бюджету ОПР</h2>
        <p className="plain" style={{ fontSize: 12.5, marginTop: 0 }}>
          Ориентировочная цена договора, млн ₽. «Заявка» – позиция в реестре без номера лота. Ответственный – {oprNeedsTotal.owner}.
        </p>
        <PreviewTable
          preview={8}
          noun={["позиция", "позиции", "позиций"]}
          head={<tr><th>№</th><th style={{ width: "32%" }}>Наименование работ и услуг</th><th className="ctr th-two" title="Направление бюджета и статья затрат по реестру закупок: ГРР – запасы, кондиции и лицензия; ОПР – карьер и ОПУ; ГОК – следующая стадия, в бюджет 2026–2027 не входит">Бюджет<span className="th-sub">статья затрат</span></th><th>Срок выполнения</th><th className="num" title="Ориентировочная цена договора из плана потребности ОПР – так, как её дал инициатор закупки, без налога">без НДС</th><th className="num" title="Та же цена с НДС 22%: столбец «без НДС» × 1,22. Итог по плану – 3 259,1 млн ₽ без НДС и 3 976,1 млн ₽ с НДС">с НДС</th><th>Закупка</th><th>Примечание</th></tr>}
          rows={oprNeeds.map(r => {
            const lot = lotOf(r.n);
            return (
              <tr key={r.n}>
                <td className="num">{r.n}</td>
                <td><b>{r.name}</b>{r.qty > 1 ? ` (${r.unit} × ${r.qty})` : ""}<div className="need-why">{r.why}</div></td>
                {dirCell(r.dir, r.art)}
                <td style={{ fontSize: 12 }}>{r.term}</td>
                <td className="num">{r.costNoVat >= 100 ? r.costNoVat.toLocaleString("ru") : m2(r.costNoVat)}</td>
                <td className="num">{r.costVat >= 100 ? r.costVat.toLocaleString("ru") : m2(r.costVat)}</td>
                <td style={{ whiteSpace: "nowrap" }}>{lot ? <a href="#lots" className="chip c-run" title={lot.stage}>{lot.id}</a> : <span className="chip c-open">заявка</span>}</td>
                <td style={{ fontSize: 12 }}>{r.note}{r.flag ? <div className="need-flag">{r.flag}</div> : null}{r.ask ? <div className="need-ask">на уточнении: {r.ask}</div> : null}</td>
              </tr>
            );
          })}
        />
        <div className="needs-sum"><b>Итого по плану потребности, {oprNeedsTotal.positions} позиция:</b> {m(oprNeedsTotal.noVat)} млн ₽ без НДС · <b>{m(oprNeedsTotal.vat)} млн ₽ с НДС</b> (ставка 22%) · EPC-подряд «под ключ» – 61% суммы</div>
              </>
            )
          },
          {
            id: "requests", label: `Заявки без оценки · ${unpricedRequests.length}`, content: (
              <>
        <h2>Заявки в реестре закупок без оценки стоимости</h2>
        <p className="plain" style={{ fontSize: 12.5, marginTop: 0 }}>Инициатор – Нартов М.В., ответственный за закупку – Трубеев Н.В. Позиции внесены в реестр «Статусы лотов» без стоимости, статуса и сроков.</p>
        <table className="req-table">
          <tbody>
            <tr><th>№</th><th style={{ width: "52%" }}>Предмет закупки</th><th className="ctr">Бюджет</th><th>Ед. изм.</th><th className="num">Оценка</th><th>Стадия</th></tr>
            {unpricedRequests.map((r, i) => (
              <tr key={i}>
                <td className="num">{i + 1}</td>
                <td>{r.name}{r.ask ? <div className="need-ask">на уточнении: {r.ask}</div> : null}</td>
                {dirCell(r.dir, r.art)}
                <td style={{ whiteSpace: "nowrap" }}>{r.unit}</td><td className="num">{NO}</td><td><span className="chip c-open">заявка</span></td>
              </tr>
            ))}
          </tbody>
        </table>
              </>
            )
          },
          {
            id: "genproekt", label: "Генпроектировщик ОПР", content: (
              <>
                <h2 style={{ marginTop: 0 }}>Проектировщик ОПР 1 этап (ОТР + ТЭР + изыскания)</h2>
        <p className="plain plain-wide ems-lines">
          <span className="ems-line">Предмет закупки: {emsSelection.subject}.</span>
          <span className="ems-line">{emsSelection.scope}</span>
          <span className="ems-line">{emsSelection.procedure} Победитель – <b>ООО «ЕМС-майнинг»</b>.</span>
        </p>
        <Collapsible title="Сравнение ТКП участников" subtitle="млн ₽ без НДС · приведённая стоимость / по ТКП" defaultOpen>
          <table>
            <tbody>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Участник</th><th className="num" style={{ whiteSpace: "nowrap" }}>Изыскания</th><th className="num" style={{ whiteSpace: "nowrap" }}>ИД + ТЭР + ОТР</th><th className="num">Итого</th>
                <th className="num" style={{ whiteSpace: "nowrap" }}>Срок, мес.</th><th style={{ whiteSpace: "nowrap" }}>Соответствие ТЗ</th><th>Заключение</th>
              </tr>
              {emsSelection.bids.map((b, i) => (
                <tr key={i} className={b.win ? "total" : ""}>
                  <td style={{ whiteSpace: "nowrap" }}>{b.org}</td>
                  <td className="num">{m(b.ii[0])} / {m(b.ii[1])}</td>
                  <td className="num">{m(b.pd[0])} / {m(b.pd[1])}</td>
                  <td className="num"><b>{m(b.total[0])}</b> / {m(b.total[1])}</td>
                  <td className="num">{b.months}</td>
                  <td>{b.fit}</td>
                  <td style={{ fontSize: 12.5 }}>{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="plain" style={{ marginTop: 8, fontSize: 12.5 }}>{emsSelection.excluded}</p>
        </Collapsible>
        <div className="ems-boxes" style={{ display: "flex", flexWrap: "wrap", gap: 13 }}>
          <div className="notebox" style={{ borderLeftColor: "var(--copper)", flex: "1 1 330px" }}>
            <b style={{ fontSize: 14, display: "block", marginBottom: 6 }}>Почему ЕМС</b>
            <ul style={{ margin: 0 }}>{emsSelection.why.map((w, i) => <li key={i} style={{ fontSize: 13 }}>{w}</li>)}</ul>
          </div>
          <div className="notebox" style={{ borderLeftColor: "var(--copper)", flex: "1 1 330px" }}>
            <b style={{ fontSize: 14, display: "block", marginBottom: 6 }}>Финальные параметры договора</b>
            <ul style={{ margin: 0 }}>{emsSelection.final.map((f, i) => <li key={i} style={{ fontSize: 13 }}>{f}</li>)}</ul>
            <p className="plain" style={{ margin: "8px 0 0", fontSize: 12.5 }}>{emsSelection.risk}</p>
          </div>
        </div>

              </>
            )
          },
        ]} />
      </div>
    </>
  );
}
