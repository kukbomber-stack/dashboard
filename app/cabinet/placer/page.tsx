import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import Link from "next/link";
import { licenseApplications, projectSchedule, sectionAsOf } from "@/lib/data";

const placerSchedule = projectSchedule.sections.find(s => s.code === "PIN-14");
const placerApplication = licenseApplications.rows.find(r => r.mineral === "золото россыпное");

export const metadata = { title: "Россыпное золото" };

export default function Placer() {
  return (
    <>
      <PrintFit pages={20} section="Россыпное золото" />
      <Topbar title="Россыпное золото" />
      <div className="content">
        <h1>Россыпное золото</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/placer"]}</div>
        <p className="lede">Отдельное направление проекта, наряду с рудным золотом Пинигинского месторождения.<br />Раздел пока собран по остаточному принципу из уже имеющихся данных – будет дополнен по мере поступления материалов.</p>

        {placerSchedule ? (
          <>
            <h2>Календарный график</h2>
            <p className="plain">
              По каркасу КСГ – <b>{placerSchedule.start} – {placerSchedule.end}</b> ({placerSchedule.days?.toLocaleString("ru")} дн.).
              Полная детализация и место в общем графике проекта – во вкладке <Link href="/cabinet/schedule#pin-14" style={{ color: "inherit", textDecoration: "underline" }}>«График проекта»</Link>.
            </p>
          </>
        ) : null}

        <h2 style={{ marginTop: 26 }}>Расходы</h2>
        <p className="plain">Россыпное бурение заложено отдельной строкой в бюджете ГРР: план 48,3 млн ₽, факт 45,7 млн ₽ (январь–август, отклонение −2,6 млн ₽). Полная сводка по всем статьям – во вкладке <Link href="/cabinet/costs" style={{ color: "inherit", textDecoration: "underline" }}>«Финансирование»</Link>.</p>

        {placerApplication ? (
          <>
            <h2 style={{ marginTop: 26 }}>Лицензирование</h2>
            <p className="plain">В работе заявка на участок «{placerApplication.site}» ({placerApplication.mineral}), регистрация {placerApplication.reg}: {placerApplication.note}. Полный список заявок – во вкладке <Link href="/cabinet/licenses#zayavki" style={{ color: "inherit", textDecoration: "underline" }}>«Лицензии» → «Заявки на лицензии»</Link>.</p>
          </>
        ) : null}
      </div>
    </>
  );
}
