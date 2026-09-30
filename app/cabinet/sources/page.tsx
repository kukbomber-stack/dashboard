import Topbar from "@/components/Topbar";
import PrintFit from "@/components/PrintFit";
import { sources, dataQuality, ytd, meta, sectionAsOf } from "@/lib/data";
import { TabbedContent } from "@/components/ui";

export const metadata = { title: "Источники" };

export default function Sources() {
  return (
    <>
      <PrintFit pages={20} section="Источники" />
      <Topbar title="Источники" />
      <div className="content">
        <h1>Источники</h1>
        <div className="as-of">Данные: {sectionAsOf["/cabinet/sources"]}</div>
        <p className="lede">Каждый показатель кабинета имеет первичный документ. Сверка расчётов и контроль данных.</p>

        <TabbedContent sections={[
          {
            id: "sverka", label: "Сверка бурения", content: (
              <>
                <h2>Сверка бурения на {meta.asOfProd}</h2>
                <table>
                  <tbody>
                    <tr><th>Проверка</th><th className="num">Результат</th></tr>
                    <tr><td>11 387,6 (янв–авг) + 3 222,0 (1–27.09) по реестру проходки</td><td className="num pos">{ytd.drill.toLocaleString("ru", { minimumFractionDigits: 1 })} ✓</td></tr>
                    <tr><td>{ytd.zbo.toLocaleString("ru", { minimumFractionDigits: 1 })} (ZBO) + {ytd.xydx.toLocaleString("ru", { minimumFractionDigits: 1 })} (XYDX)</td><td className="num pos">{ytd.drill.toLocaleString("ru", { minimumFractionDigits: 1 })} ✓</td></tr>
                    <tr><td>По участкам: Притрассовый 7 708,8 (в т.ч. ЮВ 630,7) + Унга-Нимгеркан 6 900,8</td><td className="num pos">{ytd.drill.toLocaleString("ru", { minimumFractionDigits: 1 })} ✓</td></tr>
                    <tr><td>1–27.09: реестр проходки против строки «факт с начала месяца» отчёта от 27.09</td><td className="num pos">3 222,0 = 3 222,0 ✓</td></tr>
                    <tr><td>27.09: сводка бурового мастера против реестра (ZBO 24,5 м, забой 382,5; HYDX 66 м, забой 76)</td><td className="num pos">24,5 и 66 м ✓</td></tr>
                    <tr><td>Неделя 21–27.09: сумма дней реестра (180 + 83,5 + 116 + 123 + 114 + 94,8 + 90,5)</td><td className="num pos">801,8 ✓</td></tr>
                    <tr><td>Документация: 14 609,6 − 13 442,8 против строки «отставание документации»</td><td className="num pos">1 166,8 = 1 166,8 ✓</td></tr>
                    <tr><td>Выполнение плана {ytd.drill.toLocaleString("ru", { maximumFractionDigits: 0 })} ÷ 25 000 (ориентир РГ)</td><td className="num pos">{String(ytd.pct).replace(".", ",")}% ✓</td></tr>
                    <tr><td>Выполнение плана 14 609,6 ÷ 30 655,9 (производственная программа: 2026 + I кв. 2027)</td><td className="num pos">47,7% ✓</td></tr>
                    <tr><td>Сводка мастера: скважина ZBO названа PP-2-4 (закрыта в 2024), по реестру – PP-2-8</td><td className="num warncell">описка в сводке, взят реестр</td></tr>
                    <tr><td>Скв. UP2657: закрыта на 502,8 м при проекте 395 м; в реестре скважин статус «в работе», дата окончания 26.06.2026</td><td className="num warncell">ошибка в источнике, на сверке</td></tr>
                    <tr><td>Январь–август: реестр против прежней производственной сводки</td><td className="num warncell">+31,4 м, итоги пересчитаны по реестру</td></tr>
                    <tr><td>Скв. PP-3-7: дата начала «31.09.2026» в реестре скважин</td><td className="num warncell">ошибка в источнике, на сверке</td></tr>
                  </tbody>
                </table>
              </>
            )
          },
          {
            id: "kontrol", label: "Контроль данных", content: (
              <>
                <h2>Контроль данных</h2>
                <div className="notebox">
                  <ul>{dataQuality.map((q, i) => <li key={i}>{q}</li>)}</ul>
                </div>
              </>
            )
          },
          {
            id: "reestr", label: "Реестр источников", content: (
              <>
                <h2>Реестр источников</h2>
                <div className="srcs">
                  {sources.map((s, i) => (
                    <div key={i} className="src">
                      <span className={"st" + (s.on ? "" : " off")}>{s.on ? "Подключён" : "Не передан"}</span>
                      <b>{s.name}</b><div className="what">{s.what}</div>
                    </div>
                  ))}
                </div>
              </>
            )
          },
          {
            id: "it", label: "Для ИТ", content: (
              <>
                <h2>Для ИТ (развёртывание)</h2>
                <div className="notebox">
                  <ul>
                    <li>Приложение на Next.js, размещено на платформе Render; исходный код – в приватном репозитории GitHub.</li>
                    <li>Пароль входа задаётся переменной окружения CABINET_PASSWORD в настройках сервиса на Render.</li>
                    <li>Данные вынесены в отдельный модуль; на следующем этапе заменяются на подключение к базе данных.</li>
                    <li>Аккаунты Render и GitHub оформлены на корпоративную почту; при необходимости передаются в ИТ штатной процедурой.</li>
                  </ul>
                </div>
              </>
            )
          },
        ]} />
      </div>
    </>
  );
}
