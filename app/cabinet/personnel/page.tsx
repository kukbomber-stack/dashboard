import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import { Kpi, Collapsible } from "@/components/ui";
import TeamCard from "@/components/TeamCard";
import { teamOrgs, contractorTeam, hiringPlan, sitePersonnel, headcount, sectionAsOf } from "@/lib/data";

export const metadata = { title: "Персонал" };

export default function Personnel() {
  const office = teamOrgs.filter(o => o.org !== "ГК «Гранель»");
  const officeCount = office.reduce((a, o) => a + o.people.length, 0);
  const partnerCount = teamOrgs.length - office.length
    ? teamOrgs.filter(o => o.org === "ГК «Гранель»").reduce((a, o) => a + o.people.length, 0) : 0;
  const contractors = contractorTeam.reduce((a, c) => a + c.people.length, 0);

  return (
    <>
      <PrintFit pages={20} section="Персонал" />
      <Topbar title="Персонал" />
      <div className="content">
        <h1>Персонал</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/personnel"]}</div>
        <p className="lede no-print">
          Рабочая группа – {officeCount} человек в УК «ППР» и ООО «ЯГРП», ещё {partnerCount} со стороны партнёра; на участке вахта из {sitePersonnel.total} человек.
        </p>

        <div className="kpis kpis-4">
          <Kpi cap="Всего в проекте" val={String(officeCount + partnerCount + sitePersonnel.total)} unit="чел."
            hl sub={`аппарат ${officeCount + partnerCount} · вахта ${sitePersonnel.total}`} />
          <Kpi cap="Аппарат управления" val={String(officeCount)} unit="чел."
            sub={`УК «ППР» ${office[0].people.length} · ЯГРП ${office[1].people.length}`} />
          <Kpi cap="Вахта на участке" val={String(sitePersonnel.total)} unit="чел."
            sub={`на ${sitePersonnel.asOf}`} />
          <Kpi cap="Подрядчики" val={String(contractors)} unit="чел."
            sub={`${contractorTeam.length} организаций в работе`} />
        </div>

        {/* Структура по организациям: состав с должностями */}
        <h2>Рабочая группа проекта</h2>
        <div className="team-grid">
          {teamOrgs.map(o => (
            <TeamCard key={o.org} full={o.full} note={o.note} people={o.people} />
          ))}
        </div>

        {/* Усиление команды и подрядчики: на экране в две колонки, в печать не идут */}
        <div className="pers-cols no-print">
        <div>
        {/* План усиления команды из справки по статусу: сверен с контактами */}
        <Collapsible title="Усиление команды УК «ППР»"
          subtitle={`план по справке от 09.09.2026 · все ${hiringPlan.length} позиций закрыты`}>
          <p className="plain no-print">
            Цель по справке – «+6 сотрудников в штат УК «ППР»», в перечне семь позиций.
            По контактам на 16.09.2026 закрыты все семь.
          </p>
          <table className="hire-table">
            <tbody>
              <tr><th>Позиция по справке</th><th>Кем закрыта</th><th className="ctr">Статус</th></tr>
              {hiringPlan.map(h => (
                <tr key={h.role}>
                  <td><b>{h.role}</b></td>
                  <td>{h.who}</td>
                  <td className="ctr"><span className="st st-ok">закрыта</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
        </div>
        <div>
        {/* Подрядчики: организации, предмет работ и контактные лица */}
        <Collapsible title="Подрядчики и привлечённые специалисты"
          subtitle={`${contractorTeam.length} организаций · ${contractors} контактных лиц`}>
          <table className="contr-table">
            <tbody>
              <tr><th>Организация</th><th>Предмет работ</th><th>Специалисты</th><th>Город</th></tr>
              {contractorTeam.map(c => (
                <tr key={c.org}>
                  <td><b>{c.org}</b></td>
                  <td>{c.task}</td>
                  <td>
                    {c.people.map(p => (
                      <div key={p.fio} className="contr-person">
                        <b>{p.fio}</b><span>{p.role}</span>
                      </div>
                    ))}
                  </td>
                  <td className="tm-city">{c.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Collapsible>
        <p className="plain dim-note">
          Источник состава – корпоративные контакты от {headcount.asOf}; телефоны и почта в кабинет не выводятся.
        </p>
        </div>
        </div>

      </div>
    </>
  );
}
