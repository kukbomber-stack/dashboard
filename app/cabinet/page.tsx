import React from "react";
import Topbar from "@/components/Topbar";
import Link from "next/link";
import { horizon, headcount, licenseStats, ytd, fleet, sectionAsOf } from "@/lib/data";
import SumIcon from "@/components/SumIcon";
import PrintFit from "@/components/PrintFit";
import OverviewMap from "./OverviewMap";

export const dynamic = "force-dynamic";

export const metadata = { title: "Обзор" };

export default function Overview() {
  // Числа в таблице – строки («24,2», «–»). num превращает их в числа для итогов, fmt – обратно.
  const num = (v: string | undefined) => { const t = (v ?? "").replace(",", "."); return /^[\d.]+$/.test(t) ? parseFloat(t) : null; };
  const fmt = (s: number) => (Math.round(s * 100) / 100).toLocaleString("ru", { maximumFractionDigits: 1 });
  const cell = (v: string) => num(v) == null ? <span className="dim">{v}</span> : v;
  // Итоги по портфелю считаются из строк лицензий: 2025 – из расшифровки по категориям, 2026 и 2027 – из годовых строк.
  const sum = (f: (l: typeof licenseStats[number]) => string) =>
    fmt(licenseStats.reduce((a, l) => a + (num(f(l)) ?? 0), 0));
  const totals = {
    gkz25: sum(l => l.tot25.gkz), jorc25: sum(l => l.tot25.jorc),
    gkzC: sum(l => l.det25.gkz.a), gkzP: sum(l => l.det25.gkz.b),
    jorcI: sum(l => l.det25.jorc.a), jorcU: sum(l => l.det25.jorc.b),
    gkz26: sum(l => l.y26.gkz), jorc26: sum(l => l.y26.jorc),
    gkz27: sum(l => l.y27.gkz), jorc27: sum(l => l.y27.jorc),
  };
  const km = (m: number) => (m / 1000).toFixed(1).replace(".", ",");

  return (
    <>
      <PrintFit pages={20} section="Обзор" />
      <Topbar title="Обзор" />
      <div className="content">
        <h1>Обзор</h1>
        <div className="as-of no-print">Данные: {sectionAsOf["/cabinet"]}</div>
        <p className="lede">Пинигинское золоторудное месторождение, Южная Якутия.<br />Недропользователь – ООО «Якутское ГРП», управление – УК ППР, партнёр – ГК «Гранель».</p>

        {/* Блок 1 - карта, блок 2 - запасы и участки по каждой лицензии */}
        <div className="ov-top">
          <OverviewMap src="/map-overview.png" alt="Карта лицензий и участков Пинигинской рудной площади с врезкой «Южная Якутия»" />

          <div className="lic-list">
            {/* Ссылка на подробную таблицу вынесена над таблицей: детализация относится ко всем столбцам, не только к Au */}
            <div className="lic-detail-link no-print">
              <Link href="/cabinet/resources#lic-years" className="th-link" title="Перейти к таблице «ГРР и прирост запасов по лицензиям» во вкладке «Запасы»">Детализация по лицензиям и годам ›</Link>
            </div>
            <table className="lic-all ctr-table">
              <tbody>
                <tr>
                  <th className="c-name">Лицензии и участки</th>
                  <th className="c-yr">Год</th>
                  <th className="c-cat">Категория</th>
                  <th className="num">ГКЗ, т</th>
                  <th className="c-cat">Категория</th>
                  <th className="num">JORC, т</th>
                  <th className="num c-au">Au, г/т</th>
                </tr>

                {licenseStats.map((l, i) => {
                  // Каждый участок – отдельной строкой, рядом способ отработки (если он известен).
                  const head = (
                    <>
                      <b>{l.asset.replace("Пинигинское месторождение", "Пинигинское м-е").replace("Пинигинская площадь", "Пинигинская пл.").replace("Малый Леглиер-Васильевка", "М. Леглиер-Васильевка")}</b>
                      {l.sites.map((s, k) => (
                        <span key={k} className="lic-site">
                          {s.name}
                          {s.method && s.method !== "–" ? <i className="lic-method" title="ОГР – открытая разработка (карьер), ПГР – подземная разработка (рудник)">{s.method}</i> : null}
                        </span>
                      ))}
                    </>
                  );
                  const two = (a: string, b: string) => <><span className="lic-2">{cell(a)}</span><span className="lic-2">{cell(b)}</span></>;
                  return (
                    <React.Fragment key={i}>
                      <tr className="lic-row-start">
                        <td className="lic-name" rowSpan={4}>{head}</td>
                        <td className="yr">2025</td>
                        <td className="cat cat-tot">ИТОГО</td>
                        <td className="num num-tot">{cell(l.tot25.gkz)}</td>
                        <td className="cat cat-tot">ИТОГО</td>
                        <td className="num num-tot">{cell(l.tot25.jorc)}</td>
                        <td className="num c-au" rowSpan={4}>
                          {l.au}{l.auNote ? <span className="v-note">{l.auNote}</span> : null}
                          {l.au2 ? <><span className="au-second">{l.au2}</span>{l.au2Note ? <span className="v-note">{l.au2Note}</span> : null}</> : null}
                          {l.note ? <span className="v-note">{l.note}</span> : null}
                        </td>
                      </tr>
                      <tr className="lic-det">
                        <td className="yr"></td>
                        <td className="cat">{two("Запасы (C1+C2)", "Ресурсы (P1+P2)")}</td>
                        <td className="num">{two(l.det25.gkz.a, l.det25.gkz.b)}</td>
                        <td className="cat">{two("Ind+Inf", "Unclassified")}</td>
                        <td className="num">{two(l.det25.jorc.a, l.det25.jorc.b)}</td>
                      </tr>
                      <tr>
                        <td className="yr">2026</td>
                        <td className="cat">Запасы (C1+C2)</td>
                        <td className="num">{cell(l.y26.gkz)}</td>
                        <td className="cat">Ind+Inf</td>
                        <td className="num">{cell(l.y26.jorc)}</td>
                      </tr>
                      <tr>
                        <td className="yr">2027</td>
                        <td className="cat">Запасы (C1+C2)</td>
                        <td className="num">{cell(l.y27.gkz)}</td>
                        <td className="cat">Ind+Inf</td>
                        <td className="num">{cell(l.y27.jorc)}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
                {/* Итого по портфелю – сумма строк лицензий, включая расшифровку 2025 года по категориям */}
                <tr className="lic-total lic-row-start">
                  <td className="lic-name" rowSpan={4}><b>Итого по портфелю</b></td>
                  <td className="yr">2025</td>
                  <td className="cat cat-tot">ИТОГО</td><td className="num num-tot">{totals.gkz25}</td>
                  <td className="cat cat-tot">ИТОГО</td><td className="num num-tot">{totals.jorc25}</td>
                  <td className="num c-au" rowSpan={4}></td>
                </tr>
                <tr className="lic-total lic-det">
                  <td className="yr"></td>
                  <td className="cat"><span className="lic-2">Запасы (C1+C2)</span><span className="lic-2">Ресурсы (P1+P2)</span></td>
                  <td className="num"><span className="lic-2">{totals.gkzC}</span><span className="lic-2">{totals.gkzP}</span></td>
                  <td className="cat"><span className="lic-2">Ind+Inf</span><span className="lic-2">Unclassified</span></td>
                  <td className="num"><span className="lic-2">{totals.jorcI}</span><span className="lic-2">{totals.jorcU}</span></td>
                </tr>
                <tr className="lic-total">
                  <td className="yr">2026</td>
                  <td className="cat">Запасы (C1+C2)</td><td className="num">{totals.gkz26}</td>
                  <td className="cat">Ind+Inf</td><td className="num">{totals.jorc26}</td>
                </tr>
                <tr className="lic-total">
                  <td className="yr">2027</td>
                  <td className="cat">Запасы (C1+C2)</td><td className="num">{totals.gkz27}</td>
                  <td className="cat">Ind+Inf</td><td className="num">{totals.jorc27}</td>
                </tr>
                <tr className="lic-legend">
                  <td colSpan={7}>
                    <i className="lic-method">ОГР</i> открытая разработка
                    <i className="lic-method" style={{ marginLeft: 10 }}>ПГР</i> подземная разработка · * общий отчёт JORC Унги и Бриваса
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        <div className="ov-summary">
          <Link className="sum-item" href="/cabinet/licenses">
            <div className="sum-head"><SumIcon k="lic" /><div className="sum-cap">Лицензии на поиск и разведку</div></div>
            <div className="sum-val">5<span>/10*</span></div>
            <div className="sum-note">действующих лицензий <i>(*5 заявок)</i></div>
          </Link>

          <Link className="sum-item" href="/cabinet/grr">
            <div className="sum-head"><SumIcon k="rig" /><div className="sum-cap">План ГРР до I кв. 2027 / прирост</div></div>
            <div className="sum-val">30,7 <small>км</small> <span>/ +10</span> <small>т</small></div>
            <div className="sum-note">объём бурения / JORC</div>
          </Link>

          <Link className="sum-item" href="/cabinet/grr#tehnika">
            <div className="sum-head"><SumIcon k="truck" /><div className="sum-cap">Парк техники</div></div>
            <div className="sum-val">{fleet.filter(f => f.where !== "город").length} <small>ед.</small></div>
            <div className="sum-note">из них 2 буровых станка</div>
          </Link>

          <Link className="sum-item" href="/cabinet/personnel">
            <div className="sum-head"><SumIcon k="people" /><div className="sum-cap">Аппарат управления</div></div>
            <div className="sum-val">{headcount.ukMoscow + headcount.ukOther + headcount.yagrpYakutia + headcount.yagrpMoscow} <small>чел.</small></div>
            <div className="sum-note">УК «ППР» {headcount.ukMoscow + headcount.ukOther} / ЯГРП {headcount.yagrpYakutia + headcount.yagrpMoscow}</div>
          </Link>

          <Link className="sum-item" href="/cabinet/personnel">
            <div className="sum-head"><SumIcon k="worker" /><div className="sum-cap">Производственный персонал</div></div>
            <div className="sum-val">{headcount.siteShift} <small>чел.</small></div>
            <div className="sum-note">вахта на участке</div>
          </Link>

          <Link className="sum-item" href="/cabinet/schedule#pin-9-4">
            <div className="sum-head"><SumIcon k="gold" /><div className="sum-cap">Первое золото / ЗИФ</div></div>
            <div className="sum-val">IV кв. 2027 <span>/ 300</span> <small>тыс. т</small></div>
            <div className="sum-note">по КСГ / руды в год</div>
          </Link>
        </div>
        </div>

        {/* Блок 3 - краткая сводка по проекту */}
      </div>
    </>
  );
}
