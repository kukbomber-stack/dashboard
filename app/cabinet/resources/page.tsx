import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import { Kpi, LineChart, Collapsible } from "@/components/ui";
import { resources, licenseYears, licenseYearsTotal, gkzProtocol, sectionAsOf } from "@/lib/data";

const m = (v: number | null) => (v == null ? <span className="dim">–</span> : v.toLocaleString("ru"));
const tn = (v: number | null) => (v == null ? <span className="dim">–</span> : String(v).replace(".", ","));
const X = <span className="dim">–</span>;

const YEARS = ["2025 факт", "2026 прогн.", "2027 план", "2028 цель"];

// Справа от плашек – два линейных графика: прирост запасов и накопленное бурение.
function Charts() {
  return (
    <div className="res-lines">
      <div className="chart">
        <h3>Запасы на конец года, т <span className="h3-sub">факт 2025, дальше прогноз и план</span></h3>
        <LineChart height={200} factUntil={0} labels={YEARS} series={[
          { name: "JORC", color: "var(--teal)", values: [50.1, 60, 90, 100] },
          { name: "ГКЗ C1+C2", color: "var(--copper)", values: [24.2, 38, 53, 67] },
        ]} />
      </div>
      <div className="chart">
        <h3>Бурение, тыс. м <span className="h3-sub">факт до 2025, дальше план</span></h3>
        <LineChart height={200} factUntil={0} labels={YEARS} series={[
          { name: "накоплено с 2008 г.", color: "var(--navy)", values: [63, 88, 124, 164] },
          { name: "за год", color: "#C08752", values: [null, 25, 36, 40] },
        ]} />
      </div>
    </div>
  );
}

// Таблица ГРР и прироста по лицензиям (перенесена из «Лицензий»).
function LicenseTable() {
  const rows = licenseYears.filter(r => !r.number.includes("заяв"));
  return (
    <>
      <div className="keep-block" id="lic-years">
      <h2 style={{ marginTop: 20 }}>ГРР и прирост запасов по лицензиям</h2>
      <table className="lic-years ctr-table">
        <tbody>
          <tr>
            <th rowSpan={2}>Месторождение / лицензия</th>
            <th className="ctr" colSpan={3}>Факт на 31.12.25</th>
            <th className="ctr" colSpan={3}>Прогноз на 31.12.26</th>
            <th className="ctr" colSpan={3}>План на 31.12.27</th>
            <th className="ctr" colSpan={3}>План на 31.12.28</th>
            <th rowSpan={2} className="num">Прирост<br />JORC, т</th>
          </tr>
          <tr>
            <th className="num">ГРР, м</th><th>ГКЗ, т</th><th>JORC, т</th>
            <th className="num">ГРР, м</th><th>ГКЗ, т</th><th className="num">JORC, т</th>
            <th className="num">ГРР, м</th><th>ГКЗ, т</th><th className="num">JORC, т</th>
            <th className="num">ГРР, м</th><th>ГКЗ, т</th><th className="num">JORC, т</th>
          </tr>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ whiteSpace: "nowrap" }}><b>{r.asset}</b><div className="lic-sub">{r.number}</div></td>
              <td className="num">{m(r.f25.grr)}</td><td>{r.f25.gkz ?? X}</td><td>{r.f25.jorc ?? X}</td>
              <td className="num">{m(r.p26.grr)}</td><td>{r.p26.gkz ?? X}</td><td className="num">{tn(r.p26.jorc)}</td>
              <td className="num">{m(r.p27.grr)}</td><td>{r.p27.gkz ?? X}</td><td className="num">{tn(r.p27.jorc)}</td>
              <td className="num">{m(r.p28.grr)}</td><td className={r.p28.est ? "warncell" : ""}>{r.p28.gkz ?? X}</td><td className="num">{tn(r.p28.jorc)}</td>
              <td className="num">{r.p28.jorc != null ? <span className="pos">+{String(+(r.p28.jorc - (r.f25.jorcT ?? 0)).toFixed(1)).replace(".", ",")}</span> : X}</td>
            </tr>
          ))}
          <tr className="total">
            <td>Итого по активам</td>
            <td className="num">{m(licenseYearsTotal.f25.grr)}</td><td>{licenseYearsTotal.f25.gkz}</td><td>{licenseYearsTotal.f25.jorc}</td>
            <td className="num">{m(licenseYearsTotal.p26.grr)}</td><td>{licenseYearsTotal.p26.gkz}</td><td className="num">{licenseYearsTotal.p26.jorc}</td>
            <td className="num">{m(licenseYearsTotal.p27.grr)}</td><td>{licenseYearsTotal.p27.gkz}</td><td className="num">{licenseYearsTotal.p27.jorc}</td>
            <td className="num">{m(licenseYearsTotal.p28.grr)}</td><td>{licenseYearsTotal.p28.gkz}</td><td className="num">{licenseYearsTotal.p28.jorc}</td>
            <td className="num"><span className="pos">+49,9</span></td>
          </tr>
          <tr>
            <td style={{ fontSize: 12 }}>Затраты на ГРР</td>
            {licenseYearsTotal.money.map((v, i) => <td key={i} colSpan={3} style={{ fontSize: 12 }}>{v}</td>)}
            <td></td>
          </tr>
        </tbody>
      </table>
      {/* Одна строка без переноса: на узком экране шрифт ужимается, но строка остаётся одной */}
      <p className="plain res-note-1line">
        Итого 2028 – с учётом 5 000 м бурения на новых лицензиях (заявки на рассмотрении). Разбивка 2028 по лицензиям оценочная, суммы сведены к итогам 67 т C1+C2, 30 т P1 и 100 т JORC.
      </p>
      </div>

    </>
  );
}

// Протокол ГКЗ от 18.08.2026: утверждённые запасы по участкам и кондиции. На экране – раскрывающийся блок,
// в выгрузку идёт целиком; в печать не идёт (лист «Запасы» остаётся одним).
function GkzBlock() {
  const kg = (v: number) => v.toLocaleString("ru", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const g = (v: number) => v.toLocaleString("ru", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cell = (t: [number, number, number] | null) => t == null ? <><td className="num dim">-</td><td className="num dim">-</td><td className="num dim">-</td></> : <><td className="num">{kg(t[0])}</td><td className="num">{g(t[1])}</td><td className="num">{kg(t[2])}</td></>;
  const tot = gkzProtocol.totals;
  return (
    <Collapsible title={`Протокол ГКЗ от ${gkzProtocol.date}: утверждённые запасы и кондиции`}
      subtitle={`№ ${gkzProtocol.number} · ЯКУ 02634 БЭ · балансовые ${kg(gkzProtocol.totals.balance.sum[2])} кг C1+C2 (Кур ${kg(gkzProtocol.rows[0].sum[2] + gkzProtocol.rows[1].sum[2])}, Притрассовый ${kg(gkzProtocol.rows[3].sum[2])}) · забалансовые ${kg(gkzProtocol.totals.offBalance.sum[2])} кг`} printCollapsed>
      <p className="plain" style={{ fontSize: 12.5 }}>
        Утверждено {gkzProtocol.expertise}. Месторождение отнесено к {gkzProtocol.group}. Прежний протокол ГКЗ от {gkzProtocol.prev.date} № {gkzProtocol.prev.number} ({kg(gkzProtocol.prev.sum[2])} кг C1+C2 балансовых: {gkzProtocol.prev.bySite}) утратил силу.
        {" "}<a href={gkzProtocol.file} target="_blank" rel="noreferrer" className="no-print">Протокол (PDF) ›</a>
      </p>
      <table className="pf-table gkz-table" data-sheet="Протокол ГКЗ 18.08.2026: запасы">
        <tbody>
          <tr>
            <th rowSpan={2}>Участок</th><th rowSpan={2}>Способ</th><th rowSpan={2}>Запасы</th>
            <th className="ctr" colSpan={3}>C1</th><th className="ctr" colSpan={3}>C2</th><th className="ctr" colSpan={3}>C1 + C2</th>
          </tr>
          <tr>
            <th className="num">руда, тыс. т</th><th className="num">Au, г/т</th><th className="num">Au, кг</th>
            <th className="num">руда, тыс. т</th><th className="num">Au, г/т</th><th className="num">Au, кг</th>
            <th className="num">руда, тыс. т</th><th className="num">Au, г/т</th><th className="num">Au, кг</th>
          </tr>
          {gkzProtocol.rows.map((r, i) => (
            <tr key={i} className={r.kind === "забалансовые" ? "dim-row" : ""}>
              <td><b>{r.site}</b></td><td>{r.method}</td><td>{r.kind}</td>
              {cell(r.c1)}{cell(r.c2)}{cell(r.sum)}
            </tr>
          ))}
          <tr className="total">
            <td colSpan={2}>Всего по месторождению</td><td>балансовые</td>
            {cell(tot.balance.c1)}{cell(tot.balance.c2)}{cell(tot.balance.sum)}
          </tr>
          <tr>
            <td colSpan={2}>в т.ч. открытый способ</td><td>балансовые</td>
            <td className="num dim" colSpan={6}></td>{cell(tot.open)}
          </tr>
          <tr>
            <td colSpan={2}>в т.ч. подземный способ</td><td>балансовые</td>
            <td className="num dim" colSpan={6}></td>{cell(tot.underground)}
          </tr>
          <tr className="total dim-row">
            <td colSpan={2}>Всего по месторождению</td><td>забалансовые</td>
            {cell(tot.offBalance.c1)}{cell(tot.offBalance.c2)}{cell(tot.offBalance.sum)}
          </tr>
        </tbody>
      </table>
      <table className="pf-table gkz-cond" data-sheet="Протокол ГКЗ 18.08.2026: кондиции" style={{ marginTop: 10 }}>
        <tbody>
          <tr><th>Временные разведочные кондиции</th><th>Открытый способ</th><th>Подземный способ</th></tr>
          {gkzProtocol.conditions.map((c, i) => <tr key={i}><td>{c[0]}</td><td>{c[1]}</td><td>{c[2]}</td></tr>)}
        </tbody>
      </table>
      <p className="plain" style={{ fontSize: 12, marginTop: 8 }}>
        Забалансовые – блоки с содержанием выше бортового (1,0 г/т), но ниже минимального промышленного содержания (3,41 г/т) либо ниже содержания попутно вскрываемых блоков (2,36 г/т).
      </p>
    </Collapsible>
  );
}

export const metadata = { title: "Запасы" };

export default function Resources() {
  return (
    <>
      <PrintFit pages={20} section="Запасы" />
      <Topbar title="Запасы" />
      <div className="content">
        <h1>Запасы</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/resources"]}</div>
        {/* Пометка рабочей группы: раздел ждёт итогов стратегической сессии */}
        <div className="res-upd">
          <b>Стратегия бурения и прирост запасов будут обновлены к 15.10.2026</b> с учётом решений, принятых на стратегической сессии 22.09.2026.
          <span>Отв.: Якубчук А.С., Нартов М.В., Габбасова С.Г., Гармаев З.М.</span>
        </div>
              <>
                <div className="res-top">
                  <div>
                    <h2 className="res-h">Ресурсы <span className="tip" data-tip="JORC – международный кодекс отчётности о ресурсах и запасах: Measured, Indicated и Inferred; используется инвесторами и банками.">JORC</span></h2>
                    <div className="kpis kpis-4 kpis-micro">
                      {resources.jorc.map((p, i) => <Kpi key={i} hl={i === 3} cap={p.y} val={p.v} unit={p.u} sub={p.sub} hint={p.hint} />)}
                    </div>
                    <h2 className="res-h">Запасы <span className="tip" data-tip="ГКЗ – российская система подсчёта запасов: C1 и C2 – разведанные и оценённые запасы, P1 и P2 – прогнозные ресурсы.">ГКЗ</span></h2>
                    <div className="kpis kpis-4 kpis-micro">
                      {resources.gkz.map((p, i) => <Kpi key={i} cap={p.y} val={p.v} unit={p.u} sub={p.sub} hint={p.hint} />)}
                    </div>
                  </div>
                  <Charts />
                </div>
                <LicenseTable />
                <GkzBlock />
              </>

      </div>
    </>
  );
}
