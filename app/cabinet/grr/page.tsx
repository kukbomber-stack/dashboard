import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import { TabbedContent } from "@/components/ui";
import { statusReport, sectionAsOf } from "@/lib/data";
import DrillingSection from "@/components/sections/DrillingSection";
import EquipmentSection from "@/components/sections/EquipmentSection";

export const metadata = { title: "ГРР" };

export default function Grr() {
  return (
    <>
      <PrintFit pages={20} section="ГРР" />
      <Topbar title="ГРР" />
      <div className="content">
        <h1>ГРР <span className="h1-note">включая период (янв–фев 2026), не входящий в параметры KPI</span></h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/grr"]}</div>
<p className="lede lede-wide">
          Кондиции и запасы участков Кур, Притрассовый и Рохма утверждены протоколом ГКЗ № Э003-00174-77/06125238 от 18.08.2026: 24,2 т C1+C2 на балансе и ещё 0,7 т за балансом.
        </p>

        <TabbedContent sections={[
          { id: "burenie", label: "Бурение, пробоподготовка и аналитика", content: <DrillingSection /> },
          { id: "tehnika", label: "Техника и обеспечение участка", content: <EquipmentSection /> },
        ]} />
      </div>
    </>
  );
}
