import Link from "next/link";
import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import { ksgMilestones, sectionAsOf } from "@/lib/data";
import { Collapsible } from "@/components/ui";


export const metadata = { title: "Вехи проекта" };

// Вехи выводятся по датам: в каркасе КСГ они сгруппированы по разделам, поэтому в исходном
// списке 15.07.2026 стоит после 18.08.2026.
const byDate = (d: string) => d.split(".").reverse().join("");
const milestones = [...ksgMilestones].sort((a, b) => byDate(a.date).localeCompare(byDate(b.date)));

export default function Roadmap() {

  return (
    <>
      <PrintFit pages={20} section="Вехи проекта" />
      <Topbar title="Вехи проекта" noPrint />
      <div className="content">
        <h1>Вехи проекта</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/roadmap"]}</div>
        <p className="lede">Ключевые вехи по календарно-сетевому графику v0.7 от 23.09.2026.<br />Поручения и открытые вопросы – во вкладке <Link href="/cabinet/status">«Статус задач»</Link>.</p>

        <h2 style={{ marginTop: 4 }}>Ключевые вехи по КСГ</h2>
        <table className="miles-table">
          <tbody>
            <tr><th style={{ width: 96 }}>Дата</th><th>Веха</th><th style={{ width: 190 }}>Блок</th><th style={{ width: 84 }}>Шифр</th></tr>
            {milestones.slice(0, 3).map((m, i) => (
              <tr key={i} className={m.key ? "is-key" : ""}>
                <td className="d">{m.date}</td>
                <td>{m.key ? <b>{m.name}</b> : m.name}</td>
                <td className="blk">{m.block}</td>
                <td className="code">{m.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Collapsible title={`Ещё ${milestones.length - 3} вех`} subtitle="до 01.06.2028 · по КСГ v0.7">
          <table className="miles-table">
            <tbody>
              <tr><th style={{ width: 96 }}>Дата</th><th>Веха</th><th style={{ width: 190 }}>Блок</th><th style={{ width: 84 }}>Шифр</th></tr>
              {milestones.slice(3).map((m, i) => (
                <tr key={i} className={m.key ? "is-key" : ""}>
                  <td className="d">{m.date}</td>
                  <td>{m.key ? <b>{m.name}</b> : m.name}</td>
                  <td className="blk">{m.block}</td>
                  <td className="code">{m.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>

              </div>
    </>
  );
}
