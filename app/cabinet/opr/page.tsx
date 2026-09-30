import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import Link from "next/link";
import { oprBlocks, oprAsOf, emsStages, emsContract, sectionAsOf } from "@/lib/data";

const stLabel: Record<string, string> = { done: "выполнено", part: "выполнено частично", work: "в работе", plan: "запланировано" };
import { Collapsible } from "@/components/ui";


export const metadata = { title: "ОПР" };

export default function Opr() {
  return (
    <>
      <PrintFit pages={20} section="ОПР" />
      <Topbar title="ОПР" />
      <div className="content">
        <h1>ОПР</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/opr"]}</div>
        <p className="lede">Опытно-промышленная разработка: проектирование, технология и фабрика, инфраструктура.<span className="no-print"><br />Данные на {oprAsOf}: статус по направлениям и календарный план договора ЕМС.</span></p>

        <div className="notebox opr-card opr-ems">
          <div className="opr-head">
            <Link href="/cabinet/procurement#genproekt" className="opr-title">Проектирование, I этап (изыскания, ОТР, ТЭР) – ЕМС Майнинг ›</Link>
            <span className="badge b-act">с 01.09.2026</span>
          </div>
          <div className="ems-facts">
            <span>Цена: <b><Link href="/cabinet/procurement#genproekt">{emsContract.priceNoVat.toLocaleString("ru")} млн ₽ без НДС · {emsContract.priceVat.toLocaleString("ru")} с НДС</Link></b></span>
            <span>Окончание работ: <b>{emsContract.end}</b></span>
            <span>Договор: <b>{emsContract.contractStatus}</b></span>
            <span>Субподрядчик на изыскания: <b>{emsContract.sub}</b></span>
          </div>
          <table className="ems-table" data-sheet="Договор ЕМС по этапам">
            <tbody>
              <tr><th>Этап работ</th><th className="num">млн ₽ без НДС</th><th>Статус</th><th>Окончание</th></tr>
              {emsStages.map((s, i) => (
                <tr key={i} className={"opr-" + s.st}>
                  <td><span className="opr-dot" /> {s.t}</td>
                  <td className="num">{s.cost != null ? s.cost.toLocaleString("ru", { minimumFractionDigits: 1 }) : "–"}</td>
                  <td><span className={"st-" + s.st}>{stLabel[s.st]}</span>{s.note ? <div className="ems-note">{s.note}</div> : null}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{s.due}</td>
                </tr>
              ))}
              <tr className="total"><td>Итого</td><td className="num">{emsContract.priceNoVat.toLocaleString("ru", { minimumFractionDigits: 1 })}</td><td colSpan={2}>{emsContract.priceVat.toLocaleString("ru")} млн ₽ с НДС 22%</td></tr>
            </tbody>
          </table>
        </div>

        {/* Скрытая таблица для выгрузки в Excel: направления ОПР и их пункты со статусами */}
        <table className="export-only" data-sheet="ОПР по направлениям">
          <tbody>
            <tr><th>Направление</th><th>Целевой срок</th><th>Пункт</th><th>Статус</th><th>Срок / состояние</th><th>Примечание</th></tr>
            {oprBlocks.flatMap((b, i) => b.items.map((it, j) => (
              <tr key={`${i}-${j}`}><td>{b.title}</td><td>{b.target}</td><td>{it.t}</td><td>{stLabel[it.st]}</td><td>{it.due}</td><td>{it.note ?? ""}</td></tr>
            )))}
          </tbody>
        </table>

        <div className="opr-grid">
          {oprBlocks.map((b, i) => {
            const cnt = (k: string) => b.items.filter(x => x.st === k).length;
            return (
              <div key={i} className="notebox opr-card">
                <div className="opr-head">
                  {b.link ? <Link href={b.link} className="opr-title">{b.title} ›</Link> : <b className="opr-title">{b.title}</b>}
                  <span className="badge b-act">{b.target}</span>
                </div>
                <div className="opr-counts">
                  <span className="st-done">выполнено {cnt("done")}</span>
                  <span className="st-work">в работе {cnt("work")}</span>
                  <span className="st-plan">план {cnt("plan")}</span>
                </div>
                <ul className="opr-list">
                  {b.items.map((it, j) => (
                    <li key={j} className={"opr-" + it.st}>
                      <span className="opr-dot" />
                      <span className="opr-t">{it.link ? <Link href={it.link}>{it.t}</Link> : it.t}</span>
                      <span className="opr-due">{it.due}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
