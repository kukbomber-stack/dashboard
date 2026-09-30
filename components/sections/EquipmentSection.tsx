import { Kpi, Donut, Collapsible } from "@/components/ui";
import { fleet, fleetAsOf, stock, downtime, week, ytd } from "@/lib/data";

// Простои по дням отчётной недели 21–27.09; часы в суточных отчётах не заполняются, события – из реестра проходки.
const weekDowntime = [
  { d: "21.09", h: null, note: "часы простоев в отчёте не указаны; ZBO 121 м, XYDX 59 м" },
  { d: "22.09", h: null, note: "ZBO: закрытие PP-4-6 (205,5 м), часы не указаны" },
  { d: "23.09", h: null, note: "ZBO: переезд и забурка PP-2-8; XYDX: 13 м за сутки на UP2657, причина в отчёте не указана" },
  { d: "24.09", h: null, note: "часы простоев не указаны; XYDX 30 м" },
  { d: "25.09", h: null, note: "часы простоев не указаны; XYDX 30 м" },
  { d: "26.09", h: null, note: "ZBO: замена коронки днём (PP-2-8); XYDX: каротаж, демонтаж, переезд и монтаж на UP2656 – часы не указаны" },
  { d: "27.09", h: 6, note: "XYDX: замена генератора, 6 ч; ZBO: PP-2-8 закрыта на 382,5 м, каротаж и демонтаж" },
];

// Техника – из суточного отчёта (lib/data.ts, fleet). «Город» – единица не на участке.
const onSite = fleet.filter(f => f.where !== "город");
const inTown = fleet.filter(f => f.where === "город");
const byGroup = (g: string) => onSite.filter(f => f.group === g).length;
const worked = fleet.filter(f => (f.hours ?? 0) > 0);
// Станки бурили, но часы в отчёте не заполнены – считаем их работавшими по факту проходки.
const rigsDrilled = fleet.filter(f => f.group === "Буровые станки" && f.hours == null);
const hoursTotal = fleet.reduce((a, f) => a + (f.hours ?? 0), 0);
// Ближайшие ТО: плановая дата не позже чем через двое суток после даты отчёта (дд.мм текущего года).
const dayOf = (dm: string) => { const m = dm.match(/^(\d{2})\.(\d{2})$/); return m ? new Date(2026, +m[2] - 1, +m[1]).getTime() : NaN; };
const soonLimit = dayOf(fleetAsOf) + 2 * 86400000;
const soonLabel = (() => { const d = new Date(soonLimit); return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`; })();
const soonTo = fleet.filter(f => !isNaN(dayOf(f.to)) && dayOf(f.to) <= soonLimit);
// Простои за неделю: суммируем только те дни, где часы в отчёте проставлены.
const weekFilled = weekDowntime.filter(d => d.h != null).length;
const weekHours = weekFilled ? weekDowntime.reduce((a, d) => a + (d.h ?? 0), 0) : null;

export default function EquipmentSection() {
  return (
    <>
      <h2>Сводка за неделю {week.label}</h2>
        <div className="kpis">
          <Kpi cap="Пройдено за неделю" val={week.totalWeek.toLocaleString("ru")} unit="м"
            sub={`ZBO ${week.zboWeek.toLocaleString("ru")} · XYDX ${week.xydxWeek.toLocaleString("ru")}`} />
          <Kpi cap="Простои за неделю" val={weekHours != null ? String(weekHours) : "н/д"} unit={weekHours != null ? "ч" : ""}
            sub={weekHours != null
              ? `часы указаны в ${weekFilled} суточных отчётах из ${weekDowntime.length}`
              : "часы простоя в суточных отчётах за неделю не проставлены"} />
          <Kpi cap={`ТО до ${soonLabel}`} val={String(soonTo.length)} unit="ед." sub={soonTo.map(f => `${f.name} (${f.to})`).join(", ")} />
          <Kpi cap="Единиц на участке" val={String(onSite.length)} unit="ед." sub={`из них 2 буровых станка; ещё ${inTown.length} в городе`} />
        </div>

      <h2 style={{ marginTop: 18 }}>Буровые станки и парк техники</h2>
      <div className="eq-top">
        <div className="rig">
          <h3>ZBO S15 <span className="st st-ok">в работе</span></h3>
          <div className="place">участок Притрассовый · скв. PP-2-8, забой 358 м из 390 · приобретён в мае 2026</div>
          <div className="nums">
            <div className="n"><b>{week.zboWeek.toLocaleString("ru")} м</b><span>за неделю</span></div>
            <div className="n"><b>{ytd.zbo.toLocaleString("ru", { maximumFractionDigits: 0 })} м</b><span>с начала года</span></div>
          </div>
          <div className="note">Выработка за июнь – 2 070 м при норме 1 500 м/мес.</div>
        </div>
        <div className="rig">
          <h3>XYDX-5C <span className="st st-ok">в работе</span></h3>
          <div className="place">участок Унга-Нимгеркан · UP2657 закрыта 26.09 (502,8 м), начата UP2656 · мобилизован 01.2026</div>
          <div className="nums">
            <div className="n"><b>{week.xydxWeek.toLocaleString("ru")} м</b><span>за неделю</span></div>
            <div className="n"><b>{ytd.xydx.toLocaleString("ru", { maximumFractionDigits: 0 })} м</b><span>с начала года</span></div>
          </div>
          <div className="note">Простой ~2,5 мес из-за поломки; за август – 10.09: {downtime.xydx} ч простоя против {downtime.zbo} ч у ZBO.</div>
        </div>
        <div className="chart eq-struct"><h3 className="eq-struct-h">Парк техники, {onSite.length} ед. на участке</h3>
          <Donut size={128} thickness={22}
            centerLabel={String(onSite.length)}
            centerSub="на участке"
            data={[
              { label: "Буровые станки", value: byGroup("Буровые станки"), color: "var(--teal)" },
              { label: "Вспомогательная", value: byGroup("Вспомогательная"), color: "var(--copper)" },
              { label: "Пробоподготовка: кернорез и документаторская", value: byGroup("Пробоподготовка"), color: "var(--navy)" },
              { label: "ДЭС", value: byGroup("Энергоснабжение"), color: "#C08752" },
              { label: "Аренда", value: byGroup("Аренда"), color: "#BDB2A0" },
            ]}
          />
        </div>
      </div>

      <div className="eq-grid">
        <div>
        <Collapsible defaultOpen title="Парк по суточному отчёту" subtitle={`${fleet.length} единиц на ${fleetAsOf} · моточасы и пробег план/факт, местонахождение, сроки ТО`}>
          <table className="fleet-table">
            <tbody>
              <tr>
                <th>Единица</th><th>Группа</th>
                <th className="num" style={{ whiteSpace: "nowrap" }}>М.ч. план<span className="th-hint" data-tip="М.ч./пробег за сутки, план: плановые моточасы (для автотранспорта – пробег). Нормативы участок пока не передал.">i</span></th>
                <th className="num" style={{ whiteSpace: "nowrap" }}>М.ч. факт<span className="th-hint" data-tip="М.ч./пробег за сутки, факт: моточасы по суточному отчёту участка. Пробег автотранспорта в километрах в отчёте не ведётся.">i</span></th>
                <th>Местонахождение</th><th>Ближайшее ТО</th><th>Примечание</th>
              </tr>
              {onSite.map((r, i) => (
                <tr key={i}><td>{r.name}</td><td>{r.group}</td>
                  <td className="num">{r.plan != null ? r.plan : <span className="dim" title="норматив не передан">–</span>}</td>
                  <td className="num">{r.hours != null ? <>{r.hours}<small className="unit-sm"> м.ч.</small></> : <span className="dim">–</span>}</td>
                  <td>{r.where}</td>
                  <td className={soonTo.includes(r) ? "warncell" : ""}>{r.to}</td>
                  <td style={{ fontSize: 12.5 }}>{r.note ?? ""}</td></tr>
              ))}
              {/* Техника в городе – одной строкой: моточасов нет, ТО по ней в отчёте не планируется */}
              {inTown.length ? (
                <tr><td>{inTown.map(f => f.name).join(", ")}</td><td>В городе, {inTown.length} ед.</td>
                  <td className="num"><span className="dim">–</span></td><td className="num">0<small className="unit-sm"> м.ч.</small></td>
                  <td>город</td><td><span className="dim">–</span></td><td style={{ fontSize: 12.5 }}>не на участке</td></tr>
              ) : null}
            </tbody>
          </table>
        </Collapsible>
        </div>
        <div className="keep-block">
      <h2 style={{ marginTop: 0 }}>Обеспечение участка</h2>
      <p className="plain" style={{ fontSize: 12.5 }}>Остатки на {fleetAsOf}. Средний расход в сутки – по суточному отчёту; расход с начала месяца и нормативы (план) появятся, когда участок передаст суточные отчёты с 1 сентября и нормы расхода.</p>
      <table className="stock-table stock-pf">
        <tbody>
          <tr>
            <th rowSpan={2}>Позиция</th><th className="num" rowSpan={2}>Осталось</th>
            <th className="ctr" colSpan={2}>С начала месяца</th>
            <th className="ctr" colSpan={2}>Средний расход в сутки</th>
            <th rowSpan={2}>Оценка</th>
          </tr>
          <tr><th className="num">план</th><th className="num">факт</th><th className="num">план</th><th className="num">факт</th></tr>
          {stock.map((r, i) => {
            const v = (x: number | null) => x != null ? x.toLocaleString("ru") : <span className="dim">–</span>;
            return (
              <tr key={i}>
                <td><span className={"lamp l-" + r.lamp} />{r.name}</td>
                <td className="num">{v(r.now)}</td>
                <td className="num">{v(r.mtdPlan)}</td><td className="num">{v(r.mtd)}</td>
                <td className="num">{v(r.dayPlan)}</td><td className="num">{v(r.spent)}</td>
                <td className={r.lamp === "y" || r.lamp === "r" ? "warncell" : ""} style={{ fontSize: 12.5 }}>{r.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

        </div>
        <div className="keep-block">
      <h2 style={{ marginTop: 0 }}>Простои</h2>
      <table className="pf-table downtime-pf">
        <tbody>
          <tr><th>Период</th><th className="num">План, ч</th><th className="num">Факт, ч</th><th className="num">ZBO S15</th><th className="num">XYDX-5C</th><th>Комментарий</th></tr>
          {downtime.periods.map((r, i) => {
            const fact = r.zbo != null && r.xydx != null ? r.zbo + r.xydx : null;
            const v = (x: number | null) => x != null ? x : <span className="dim">–</span>;
            return (
              <tr key={i} className={r.p.startsWith("Справочно") ? "dim-row" : ""}>
                <td>{r.p}</td>
                <td className="num">{v(r.plan)}</td><td className="num">{fact != null ? <b>{fact}</b> : <span className="dim">–</span>}</td>
                <td className="num">{v(r.zbo)}</td><td className="num">{v(r.xydx)}</td>
                <td style={{ fontSize: 12.5 }}>{r.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Collapsible title="Простои по дням" subtitle={`${week.label} · по суточным сводкам · часы не проставлены, события – в кабинете`} printCollapsed>
        <table>
          <tbody>
            <tr><th>День</th><th className="num">Часов</th><th>Причина</th></tr>
            {weekDowntime.map((d, i) => {
              const lamp = d.h == null ? "l-d" : d.h === 0 ? "l-g" : "l-y";
              return (
                <tr key={i}>
                  <td><span className={"lamp " + lamp} />{d.d}</td>
                  <td className="num">{d.h != null ? <b>{d.h}</b> : <span className="dim">–</span>}</td>
                  <td style={{ fontSize: 12.5 }}>{d.note ?? <span className="dim">–</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Collapsible>
      <Collapsible title="Простои по причинам (август – 10 сентября), часов" subtitle={`всего ${downtime.total} ч · ZBO ${downtime.zbo} · XYDX ${downtime.xydx} · вынужденные и аварийные ${downtime.byReason[0].zbo + downtime.byReason[0].xydx}`} printCollapsed>
        <p className="plain">Основная причина отставания XYDX-5C – вынужденные и аварийные простои.</p>
        <table>
          <tbody>
            <tr><th>Причина</th><th className="num">ZBO S15</th><th className="num">XYDX-5C</th><th className="num">Итого</th></tr>
            {downtime.byReason.map((r, i) => (
              <tr key={i}><td>{r.r}</td><td className="num">{r.zbo}</td><td className="num">{r.xydx}</td><td className="num">{r.zbo + r.xydx}</td></tr>
            ))}
            <tr className="total"><td>Всего</td><td className="num">{downtime.zbo}</td><td className="num">{downtime.xydx}</td><td className="num">{downtime.total}</td></tr>
          </tbody>
        </table>
      </Collapsible>
      <Collapsible defaultOpen title="Ходимость коронок: план/факт" subtitle="средняя проходка на коронку по маркам, м">
        <table className="bit-table">
          <tbody>
            <tr><th>Марка</th><th className="num">Норматив (план), м</th><th className="num">Факт, м</th><th className="num">Откл.</th></tr>
            {downtime.bitLife.map((b, i) => (
              <tr key={i}>
                <td>{b.brand}</td>
                <td className="num">{b.plan != null ? b.plan : <span className="dim" title="норматив ходимости не передан">–</span>}</td>
                <td className="num"><b>{b.m}</b></td>
                <td className="num">{b.plan != null ? <span className={b.m - b.plan >= 0 ? "pos" : "neg"}>{b.m - b.plan > 0 ? "+" : ""}{b.m - b.plan}</span> : <span className="dim">–</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="plain" style={{ fontSize: 12.5, marginTop: 6 }}>Факт – отчёт участка «август – 10 сентября». Нормативы ходимости по маркам коронок участок и ПЭО пока не передали.</p>
      </Collapsible>
        </div>
      </div>

    </>
  );
}
