import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import PrintAllRunner from "./PrintAllRunner";
import Overview from "../page";
import Licenses from "../licenses/page";
import Resources from "../resources/page";
import Status from "../status/page";
import Grr from "../grr/page";
import Opr from "../opr/page";
import Costs from "../costs/page";
import Personnel from "../personnel/page";
import Procurement from "../procurement/page";
import Schedule from "../schedule/page";
import Roadmap from "../roadmap/page";
import Placer from "../placer/page";

export const metadata = { title: "Кабинет ППР: все разделы" };

const SECTIONS: [string, () => React.ReactElement][] = [
  ["Обзор", Overview], ["Лицензии", Licenses], ["Запасы", Resources], ["Статус задач", Status],
  ["ГРР", Grr], ["ОПР", Opr], ["Финансирование", Costs], ["Персонал", Personnel], ["Закупки", Procurement],
  ["График проекта", Schedule], ["Вехи проекта", Roadmap], ["Россыпное золото", Placer],
];

export default function PrintAll() {
  return (
    <>
      <PrintFit pages={200} master />
      <Topbar noPrint />
      <PrintAllRunner />
      <div className="print-all">
        {SECTIONS.map(([name, Section], i) => (
          <section key={i} className="print-section" data-name={name}>
            <div className="print-run-head">{name}</div>
            <Section />
          </section>
        ))}
      </div>
    </>
  );
}
