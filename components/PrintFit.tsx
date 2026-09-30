"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { printOrder, printTotal } from "@/lib/data";

// Печать Обзора на одном листе A4 (альбомная ориентация).
// Перед печатью страница раскладывается в фиксированную ширину, измеряется её высота,
// и весь блок масштабируется так, чтобы поместиться на один лист без переноса.
const LAYOUT_W = 1400;          // ширина раскладки для печати, px
const PAGE_W = 1062;            // 297 мм минус поля 2×8 мм, в CSS px
const PAGE_H = 726;             // 210 мм минус поля 2×9 мм, в CSS px.
// Chrome отнимает высоту под свои колонтитулы вдобавок к полям страницы, и сколько именно –
// из документа не видно. Поэтому поля держим минимальными, а содержимое листа – заведомо ниже
// его полезной высоты: разница уходит в запас, который эти колонтитулы перекрывает.
const NUM_UP = 56;              // номер листа: столько точек листа над его нижним краем
// Распорка, которой лист добивается до конца, останавливается выше номера: номер стоит
// абсолютно и на своём листе удержится, а короткая распорка оставляет запас высоты на
// случай, если браузер заберёт часть листа под свои колонтитулы.
const STRUT_UP = 106;
const SAFE_BOTTOM = 24;         // неприкосновенный запас у нижнего края листа
const HEADER_RESERVE = 78;      // Chrome отнимает высоту под свои колонтитулы вдобавок к полям
// страницы, и сколько именно – из документа не видно. Запас проверен подстановкой укороченного
// листа: раскладка держится, пока браузер забирает не более 12 мм высоты. Прежние 132 точки
// (35 мм) браузер не забирал никогда: нижняя шестая часть каждого листа просто пустовала,
// и из-за неё разделы разъезжались на лишние листы.
// Раскладка шире – в строку входит больше, шрифт мельче, раздел занимает меньше листов.
// Верхняя граница выбрана по читаемости: при 1640 основной текст таблиц на бумаге ≈6 пунктов.
// Шире 1800 раскладка не идёт: на таком сжатии неразрезаемые блоки перестают
// помещаться на лист, и листы внутри них остаются без шапки и без номера.
const WIDTHS = [960, 1000, 1040, 1100, 1160, 1240, 1320, 1400, 1480, 1560, 1640, 1720, 1800];
const WIDTHS_MASTER = WIDTHS;   // общий документ подбирается по той же лестнице
const SAFETY = 0.96;
// Подбор раскладки перебирает ширины и для каждой размечает листы – на медленной машине
// это заметная пауза. Больше этого времени перебор не идёт: берётся лучшее из найденного.
const BUDGET = 4000;
// Клик, пришедший вместе с открытием окна печати, печать не отменяет.
const GRACE = 900;
// Знак УК встроен прямо в код: при печати шапка создаётся на лету, и внешний файл
// может не успеть загрузиться – тогда знак не попадает на лист.
const MARK = "data:image/jpeg;base64,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";         // неприкосновенный запас у нижнего края листа, точек листа
const BAND_FALLBACK = 92;
// Разбивать на несколько листов разрешено только этим разделам. Остальные подбор
// ужимает до одного листа, даже если для этого нужна более широкая раскладка.
const SPLIT_OK = new Set(["Статус задач", "ГРР", "Закупки"]);       // запасная высота печатной шапки, если замер не удался
// Нижняя граница раскладки для отдельных разделов. На узкой раскладке лист вмещает
// меньше, и блок, который должен стоять на первом листе раздела, уезжает на второй.
// ГРР: на первом листе вместе с диаграммами должна помещаться производственная программа.
const WIDTH_FLOOR: Record<string, number> = {};

export default function PrintFit({ pages = 1, section, master = false }: { pages?: number; section?: string; master?: boolean }) {
  const path = usePathname();
  useEffect(() => {
    if (path === "/cabinet/print-all" && !master) return;
    const html = document.documentElement;
    const page = document.createElement("style");
    // Поля сверху и снизу объявлены с запасом: колонтитулы браузера помещаются внутрь них,
    // и браузеру не нужно самому урезать полезную высоту листа. Иначе у одного пользователя
    // документ печатается как задумано, а у другого разделы переполняются и лезут пустые листы.
    page.textContent = "@page{size:A4 landscape;margin:9mm 8mm}";
    document.head.appendChild(page);

    // Части, на которые была разрезана длинная таблица: строки возвращаются в исходную
    // таблицу перед следующим расчётом и после печати.
    const splits: { orig: HTMLElement; part: HTMLElement }[] = [];
    const unsplit = (root?: HTMLElement) => {
      // В обратном порядке добавления – это порядок частей в документе, строки вернутся
      // в исходную последовательность.
      for (let i = splits.length - 1; i >= 0; i--) {
        const { orig, part } = splits[i];
        if (root && !root.contains(orig)) continue;
        const body = orig.querySelector("tbody") || orig;
        const src = part.querySelector("tbody");
        if (src) Array.from(src.children).slice(1).forEach(r => body.appendChild(r));
        part.remove();
        splits.splice(i, 1);
      }
      (root || document).querySelectorAll<HTMLElement>("[data-pf-fixed]").forEach(t => {
        const keep = t.dataset.pfFixed || "";
        t.style.tableLayout = keep.trim();
        delete t.dataset.pfFixed;
        const cg = t.querySelector("colgroup");
        if (cg) cg.remove();
      });
    };
    let prepared = false;
    let savedScroll = 0;
    let savedTitle = "";
    let openedAt = 0;
    // Подобранная раскладка сеанса печати. Chrome шлёт beforeprint заново на каждую смену
    // настроек в окне печати, и полный перебор ширин на каждый такой вызов подвешивал вкладку.
    let fit: { w: number; z: number; h: number } | null = null;
    let fitAll: { w: number; z: number; h: number }[] | null = null;
    const before = () => {
      if (prepared) return;          // предпросмотр печати пересчитывается много раз – готовим один раз
      prepared = true;
      openedAt = Date.now();
      savedScroll = window.scrollY;
      savedTitle = document.title;
      document.title = " ";
      try {
      html.classList.add("pf-on");
      html.classList.add("pf-sim");   // на время измерений включаем печатную раскладку
      html.style.setProperty("--pf-zoom", "1");   // и снимаем масштаб, иначе замеры будут зумлёнными
      const main = document.querySelector(".main") as HTMLElement | null;
      const PAGE = PAGE_H - HEADER_RESERVE;
      let z = 0.72;
      // Высота считается по самому содержимому раздела: титульный лист и топбар
      // в эту высоту входить не должны, иначе масштаб занижается.
      const measure = () => {
        const boxes = master
          ? Array.from(document.querySelectorAll<HTMLElement>(".print-section .content"))
          : (main ? Array.from(main.querySelectorAll<HTMLElement>(".content")) : []);
        boxes.forEach(b => { b.style.minHeight = ""; });
        if (!boxes.length) return main ? main.scrollHeight : PAGE_H;
        return boxes.reduce((a, b) => a + b.scrollHeight, 0);
      };
      // Разбиение на страницы: верхнеуровневые блоки не рвутся, в начале каждого листа
      // ставится шапка с названием раздела, знаком УК и номером листа.
      const clearMarks = (root?: HTMLElement) => {
        const sc: ParentNode = root || document;
        unsplit(root);
        sc.querySelectorAll(".pf-break, .pf-first, .pf-abs-mark, .pf-stamp, .pf-foot, .pf-num, .pf-num-inner, .pf-spacer").forEach(el => el.remove());
        sc.querySelectorAll<HTMLElement>("[data-pf-tall]").forEach(el => { el.style.breakInside = ""; delete el.dataset.pfTall; });
        sc.querySelectorAll<HTMLElement>("[data-pf-ov]").forEach(el => {
        el.style.overflow = el.dataset.pfOv || ""; delete el.dataset.pfOv;
      });
      sc.querySelectorAll<HTMLElement>("[data-pf-br]").forEach(el => {
        el.style.breakBefore = ""; delete el.dataset.pfBr;
      });
      sc.querySelectorAll<HTMLElement>("[data-pf-box]").forEach(el => { el.style.minHeight = ""; delete el.dataset.pfBox; });
      sc.querySelectorAll<HTMLElement>("[data-pf-tall-pos]").forEach(el => {
        el.style.position = ""; delete el.dataset.pfTallPos;
      });
      };
      clearMarks();
      // Высоту шапки меряем на месте: она зависит от размера знака и шрифта.
      let BAND = BAND_FALLBACK;
      {
        const probeBox = (master
          ? document.querySelector<HTMLElement>(".print-section .content")
          : main?.querySelector<HTMLElement>(".content")) || null;
        if (probeBox) {
          const probe = document.createElement("div");
          probe.className = "pf-first";
          probe.innerHTML = '<div class="pf-head"><div class="pf-mark-line">Раздел 1/2</div>'
            + '<div class="pf-num">1/20</div>'
            + '<div class="pf-stamp"><img src="' + MARK + '" alt=""><span>УК «ППР»</span></div></div>';
          probeBox.insertBefore(probe, probeBox.firstChild);
          const head = probe.firstElementChild as HTMLElement;
          const mb = parseFloat(getComputedStyle(head).marginBottom || "0") || 0;
          const got = head.offsetHeight + mb;
          if (got > 30 && got < 260) BAND = got;
          probe.remove();
        }
      }
      const plan = (zTry: number, apply: boolean, only?: HTMLElement, startAt?: number,
                    counts?: { name: string; n: number }[], holes?: number[]) => {
      let totalPages = 0;
      const pageFull = PAGE / zTry;
      const pageCss = (PAGE - BAND) / zTry;           // шапка на каждом листе, её высота на бумаге постоянна
      const realPage = PAGE_H / zTry;                 // вся печатная высота листа
      if (!isFinite(pageCss) || pageCss < 200) return 99;
      const groups: { name: string; box: HTMLElement }[] = [];
      const entry = printOrder.find(x => x.path === path);
      const startFor = entry?.start ?? 0;   // 0 – раздела нет в общем документе, нумеруем внутри себя
      let running = startAt ?? (master ? 2 : (startFor || 1));   // в общем документе первый лист – титульный
      if (master) {
        document.querySelectorAll<HTMLElement>(".print-section").forEach(sec => {
          const box = sec.querySelector<HTMLElement>(".content");
          if (box && (!only || only === box)) groups.push({ name: sec.dataset.name || "", box });
        });
      } else if (main && section) {
        const box = main.querySelector<HTMLElement>(".content");
        if (box) groups.push({ name: section, box });
      }
      groups.forEach(({ name, box }) => {
        // «Атомы» – блоки, которые должны остаться целыми. В высокие блоки спускаемся глубже,
        // но только если это обычный поток: внутри flex и grid разрывы страниц не работают.
        const atoms: HTMLElement[] = [];
        // Каждая подвкладка раздела начинается с нового листа: так лист не смешивает
        // «Бурение» с «Техникой», а внутри подвкладки содержимое идёт подряд.
        const panels = Array.from(box.querySelectorAll<HTMLElement>(".tab-panel"));
        const breakBefore = new Set<HTMLElement>();
        // Жёсткий разрыв: блок с классом pf-page-break всегда начинает новый лист,
        // сколько бы места ни оставалось на текущем.
        const hardBreak = new Set<HTMLElement>();
        let pendingBreak = false, pendingHard = false;
        const collect = (el: HTMLElement) => {
          Array.from(el.children).forEach(node => {
            const kid = node as HTMLElement;
            if (!kid.offsetHeight) return;
            if (panels.indexOf(kid) > 0) pendingBreak = true;
            if (kid.classList.contains("pf-page-break")) { pendingBreak = true; pendingHard = true; }
            const disp = getComputedStyle(kid).display;
            const flows = disp === "block" || disp === "flow-root" || disp === "list-item";
            const take = (a: HTMLElement) => {
              if (pendingBreak) { breakBefore.add(a); pendingBreak = false; }
              if (pendingHard) { hardBreak.add(a); pendingHard = false; }
              atoms.push(a);
            };
            if (kid.classList.contains("keep-block")) { take(kid); return; }
            // Панель подвкладки – только контейнер: в неё спускаемся всегда, иначе невысокая
            // панель (заголовок, абзац и таблица на полстраницы) переносится на новый лист
            // целиком, хотя её таблица могла бы продолжиться по строкам на текущем.
            const panel = kid.classList.contains("tab-panel");
            if ((panel || kid.offsetHeight > pageCss * 0.45) && flows && kid.children.length) collect(kid);
            else take(kid);
          });
        };
        collect(box);
        // Если содержимое шире раскладки (обычно это таблица с неразрывными ячейками),
        // браузер ужимает под лист весь документ целиком, и печать уезжает в левый верхний
        // угол. Такую раскладку помечаем негодной, чтобы подбор взял вариант пошире.
        if (box.scrollWidth > box.clientWidth + 2) counts?.push({ name: "__шире листа", n: 99 });
        if (!atoms.length || atoms.length > 900) {
          // Раздел не разобрался на блоки: считаем такую раскладку непригодной,
          // иначе подбор примет её за раздел в ноль листов и выберет именно её.
          totalPages += 99;
          counts?.push({ name, n: 99 });
          return;
        }
        const boxTop = box.getBoundingClientRect().top;
        let shift = 0, page = 0, pageEnd = pageCss;
        // Начало каждого листа: элемент и номер листа внутри раздела. Шапку получают все
        // листы без исключения, в том числе те, что начинаются частью разрезанной таблицы.
        const starts: { el: HTMLElement; idx: number }[] = [];
        const absMarks: { el: HTMLElement; page: number }[] = [];
        // firstEdge – координата конца листа, на котором блок начинается. Блок может
        // начинаться и в середине листа: тогда первый разрыв приходится на остаток.
        // Разрез блока по строкам. В сухом прогоне только считаем листы; в рабочем –
        // делим таблицу на самостоятельные части. Каждая часть начинает свой лист, поэтому
        // получает и шапку раздела со знаком, и номер листа, и повторённую строку заголовков.
        // Возвращаются: число занятых листов, координата последнего разрыва (по ней
        // пересчитывается сдвиг) и элементы, с которых начинаются новые листы.
        const markInside = (el: HTMLElement, firstEdge: number, shiftNow: number,
                            requireTail: boolean, doApply: boolean) => {
          const none = { used: 1, last: 0, stride: pageCss, heads: [] as HTMLElement[] };
          const isTable = el.tagName === "TABLE";
          // Строки таблицы годятся как место разрыва только у самой таблицы: у обёртки
          // (например, сворачиваемого блока) разрыв встал бы внутрь tbody и растянул таблицу
          // на ширину листа. Такой блок либо режется по своим строкам-блокам, либо переносится целиком.
          const rows = Array.from(el.querySelectorAll<HTMLElement>("tr, .mile, .task-card, li"))
            .filter(r => isTable || r.tagName !== "TR");
          if (!rows.length) return none;
          // Шапку повторяем на каждой части, поэтому её высота отнимается от листа.
          // Шапка может быть в два яруса (объединённые ячейки): берём все идущие подряд
          // первые строки, где нет ни одной ячейки данных, и переносим их целиком.
          const headRows: HTMLElement[] = [];
          if (isTable) {
            for (const r of rows) {
              const tr = r as HTMLTableRowElement;
              if (tr.cells.length && Array.from(tr.cells).every(c => c.tagName === "TH")) headRows.push(r);
              else break;
            }
          }
          const headRow = headRows[0] ?? null;
          const isHead = (r: HTMLElement) => headRows.indexOf(r) >= 0;
          // Ширины столбцов снимаем со строки данных: в шапке с объединёнными ячейками
          // их меньше, чем столбцов, и сетка у части поехала бы.
          const dataRow = isTable
            ? (rows.find(r => !isHead(r)) as HTMLTableRowElement | undefined)
            : undefined;
          // Без строк данных резать нечего – такую таблицу переносим целиком.
          if (isTable && headRows.length && !dataRow) return none;
          const headH = headRows.reduce((s, r) => s + r.getBoundingClientRect().height, 0);
          const stride = pageCss - headH;
          if (stride < pageCss * 0.4) return none;
          const box0 = el.getBoundingClientRect();
          const elTop = box0.top - boxTop + shiftNow;
          const elBottom = elTop + box0.height;
          const geo = rows.map(r => {
            const rr = r.getBoundingClientRect();
            const t = rr.top - boxTop + shiftNow;
            return { el: r, top: t, bottom: t + rr.height };
          });
          const bounds: number[] = [];
          const brk: HTMLElement[] = [];
          let edge = firstEdge;
          while (edge < elBottom - 4 && bounds.length < 40) {
            let pos = 0, rowEl: HTMLElement | null = null;
            for (const g of geo) {
              if (isHead(g.el)) continue;
              if ((g.top < edge && g.bottom > edge) || g.top >= edge) { pos = g.top; rowEl = g.el; break; }
            }
            if (!rowEl) break;
            bounds.push(pos); brk.push(rowEl);
            edge = pos + stride;
          }
          // Разрыв, после которого на текущем листе не осталось ничего, смысла не имеет:
          // это перенос блока целиком, только с лишним листом в счёте.
          // Если разрыв приходится на одну из первых строк, в исходной таблице не остаётся
          // содержимого и на листе печатается пустая рамка. Такой блок переносим целиком.
          const firstIdx = brk.length ? rows.indexOf(brk[0]) : -1;
          const empty = bounds.length > 0 && (bounds[0] <= elTop + 2 || firstIdx < headRows.length + 1);
          // Хвост в одну-две строки отрывать не стоит, если за блоком ничего не следует.
          const orphan = requireTail && bounds.length > 0
            && elBottom - bounds[bounds.length - 1] < stride * 0.06;
          if (!bounds.length || empty || orphan) return none;
          const out = { used: bounds.length + 1, last: bounds[bounds.length - 1], stride,
                        heads: [] as HTMLElement[] };
          if (!doApply) return out;
          if (isTable && headRow) {
            // Колонки фиксируем по замеру, иначе части получат разную ширину столбцов.
            const cells = Array.from((dataRow ?? (headRow as HTMLTableRowElement)).cells);
            const widths = cells.map(c => c.getBoundingClientRect().width);
            const colgroup = () => {
              const cg = document.createElement("colgroup");
              widths.forEach(w => {
                const c = document.createElement("col");
                c.style.width = `${Math.round(w)}px`;
                cg.appendChild(c);
              });
              return cg;
            };
            if (!el.dataset.pfFixed) {
              el.dataset.pfFixed = el.style.tableLayout || " ";
              el.style.tableLayout = "fixed";
              el.insertBefore(colgroup(), el.firstChild);
            }
            for (let k = brk.length - 1; k >= 0; k--) {
              const part = document.createElement("table");
              part.className = el.className;
              part.dataset.pfPart = "1";
              part.style.tableLayout = "fixed";
              part.style.width = `${Math.round(box0.width)}px`;
              part.appendChild(colgroup());
              const tb = document.createElement("tbody");
              headRows.forEach(h => tb.appendChild(h.cloneNode(true)));
              // Строки берём по всей таблице, а не из одного tbody: у таблицы с раскрывающимся
              // «хвостом» (PreviewTable) их два, и часть строк иначе осталась бы в исходной таблице.
              const kids = Array.from(el.querySelectorAll<HTMLElement>("tr")).filter(r => !isHead(r));
              let seen = false;
              kids.forEach(ch => { if (ch === brk[k]) seen = true; if (seen) tb.appendChild(ch); });
              part.appendChild(tb);
              el.parentElement?.insertBefore(part, el.nextSibling);
              splits.push({ orig: el, part });
              out.heads.unshift(part);
            }
          } else {
            // Обычный поток: лист начинает сама строка, перед ней встанет шапка.
            brk.forEach(r => out.heads.push(r));
          }
          return out;
        };
        // Заголовок не должен оставаться один внизу листа: вместе с ним нужно место
        // хотя бы под начало следующего блока, иначе название уезжает от своей таблицы.
        const headish = (e: HTMLElement) => e.classList.contains("collapsible-head")
          || e.classList.contains("sec-h") || e.classList.contains("tab-print-title")
          || /^H[1-4]$/.test(e.tagName);
        // Блок, который переносится на новый лист целиком, уводит с собой и «вступление» над ним
        // на этом же листе: заголовки (h2/h3, шапка сворачиваемого блока, название подвкладки)
        // и короткие абзацы-пояснения подряд. Без заголовка в этой цепочке ничего не переносим:
        // заголовок не должен оставаться один внизу листа без своей таблицы.
        const carryAnchor = (ai: number, el: HTMLElement) => {
          let anchor: HTMLElement = el;
          let sawHead = false;
          for (let j = ai - 1; j >= 0; j--) {
            const a = atoms[j];
            const ar = a.getBoundingClientRect();
            const aTop = ar.top - boxTop + shift;
            if (aTop <= pageEnd - pageCss + 2 || starts.some(st => st.el === a)) break;
            const small = ar.height < 90 && (a.tagName === "P" || a.classList.contains("plain") || a.classList.contains("lede"));
            if (headish(a)) { sawHead = true; anchor = a; continue; }
            if (small) { anchor = a; continue; }
            break;
          }
          return sawHead ? anchor : el;
        };
        atoms.forEach((el, ai) => {
          const r = el.getBoundingClientRect();
          let top = r.top - boxTop + shift;
          const next = atoms[ai + 1];
          const withNext = headish(el) && next
            ? Math.min(next.getBoundingClientRect().height, pageCss * 0.14) : 0;
          const h2 = r.height + withNext;
          const tall = r.height > pageCss;
          // Разрезанный блок продолжается на своём последнем листе, и следующий блок идёт
          // сразу за ним. Сдвиг после разреза пересчитан, поэтому отдельный лист не нужен.
          // Начало подвкладки переносим на новый лист только тогда, когда на текущем почти
          // не осталось места. Если место есть, подвкладка продолжается на том же листе:
          // иначе лист наполовину пустует.
          const hard = hardBreak.has(el);
          if ((breakBefore.has(el) || hard) && top > pageEnd - pageCss + 2
              && (hard || pageEnd - top < pageCss * 0.32)) {
            page += 1;
            shift += pageEnd - top;
            top = pageEnd;
            pageEnd += pageCss;
            starts.push({ el, idx: page });
          }
          // Блок можно разрезать по строкам, если это обычный поток с достаточным
          // числом строк: таблица, список вех, доска задач. Сетки и колонки не режем –
          // там строка одного столбца не соответствует строке соседнего.
          const disp = getComputedStyle(el).display;
          const splittable = disp !== "grid" && disp !== "flex" && disp !== "inline-grid"
            && el.querySelectorAll("tr, .mile, .task-card, li").length >= 5;
          const room = pageEnd - top;                 // сколько осталось на текущем листе
          const fits = top + h2 <= pageEnd + 2;

          if (tall) {
            // Высокий блок: если на листе осталось мало места, начинаем со следующего,
            // иначе режем прямо здесь и занимаем остаток.
            if (room < pageCss * 0.25) {
              const anchor = carryAnchor(ai, el);
              const aTop = anchor === el ? top : anchor.getBoundingClientRect().top - boxTop + shift;
              page += 1;
              holes?.push(room / pageCss);
              shift += pageEnd - aTop;
              top = pageEnd + (top - aTop);
              pageEnd += pageCss;
              starts.push({ el: anchor, idx: page });
            }
            el.style.breakInside = "auto";
            el.dataset.pfTall = "1";
            const firstEdge = pageEnd;
            const { used, last, stride, heads } = markInside(el, firstEdge, shift, false, apply);
            if (used > 1) {
              // после последнего разрыва содержимое встаёт в начало своего листа
              heads.forEach((h, i) => starts.push({ el: h, idx: page + i + 1 }));
              shift += firstEdge + (used - 2) * stride - last;
              page += used - 1;
              pageEnd = firstEdge + (used - 1) * stride;
            } else {
              // Блок выше листа, но по строкам не режется: он всё равно займёт
              // несколько листов, и это нужно учесть, иначе раздел считается короче,
              // чем он есть, и подбор выберет заведомо переполненную раскладку.
              el.style.breakInside = "";
              delete el.dataset.pfTall;
              const over = Math.ceil((top + h2 - pageEnd) / pageCss);
              if (over > 0) {
                page += over; pageEnd += over * pageCss;
                // Такие листы начинаются внутри неразрезаемого блока и остаются без шапки
                // и без номера. Помечаем раскладку как негодную, чтобы подбор её обошёл.
                counts?.push({ name: "__перелив", n: 99 });
              }
            }
            return;
          }

          if (!fits && splittable && room > pageCss * 0.22) {
            // Блок меньше листа, но в остаток не влезает. Перенести его целиком – значит
            // оставить больше пятой части листа пустой, поэтому режем по строкам.
            el.style.breakInside = "auto";
            el.dataset.pfTall = "1";
            const firstEdge = pageEnd;
            const { used, last, stride, heads } = markInside(el, firstEdge, shift, true, apply);
            if (used > 1) {
              heads.forEach((h, i) => starts.push({ el: h, idx: page + i + 1 }));
              shift += firstEdge + (used - 2) * stride - last;
              page += used - 1;
              pageEnd = firstEdge + (used - 1) * stride;
              return;
            }
            el.style.breakInside = "";
            delete el.dataset.pfTall;
          }

          if (!fits) {
            // Обычный блок переносим на новый лист целиком. Если прямо над ним на этом же листе
            // стоит заголовок (h2/h3, шапка сворачиваемого блока), уносим и его: заголовок
            // не должен оставаться один внизу листа без своей таблицы.
            const anchor = carryAnchor(ai, el);
            const aTop = anchor === el ? top : anchor.getBoundingClientRect().top - boxTop + shift;
            page += 1;
            holes?.push(room / pageCss);
            shift += pageEnd - aTop;
            top = pageEnd + (top - aTop);
            pageEnd += pageCss;
            starts.push({ el: anchor, idx: page });
          }
        });
        const total = page + 1;
        if (holes && atoms.length) {
          const lastEl = atoms[atoms.length - 1];
          const lb = lastEl.getBoundingClientRect();
          const bottom = lb.bottom - boxTop + shift;
          holes.push(Math.max(0, Math.min(1, (pageEnd - bottom) / pageCss)));
        }
        totalPages += total;
        counts?.push({ name, n: total });
        if (!apply) return;
        // Шапка листа: слева подпись «Раздел N/M» (только для многостраничных),
        // справа знак УК. Оба стоят в потоке, поэтому всегда у верхнего края листа.
        const label = (i: number) => {
          const head = document.createElement("div");
          head.className = "pf-head";
          const mark = document.createElement("div");
          mark.className = "pf-mark-line";
          mark.textContent = total > 1 ? `${name} ${i}/${total}` : name;
          const stamp = document.createElement("div");
          stamp.className = "pf-stamp";
          stamp.innerHTML = '<img src="' + MARK + '" alt=""><span>УК «ППР»</span>';
          // номер листа: абсолютно внутри шапки, отсчёт от верхнего края своего листа
          const num = document.createElement("div");
          num.className = "pf-num";
          num.textContent = startFor || master
            ? `${running + i - 1}/${printTotal}`
            : `${i}/${total}`;
          num.style.top = `${Math.round(realPage - NUM_UP / zTry)}px`;
          head.appendChild(mark);
          head.appendChild(num);
          head.appendChild(stamp);
          return head;
        };
        // номера для листов, которые начинаются внутри длинного блока
        const first = document.createElement("div");
        first.className = "pf-first";
        // В общем документе новый лист начинает сама шапка раздела, а не блок раздела:
        // разрыв страницы должен стоять внутри масштабируемого содержимого, иначе браузер
        // делит блок по неотмасштабированной высоте и вставляет пустой лист.
        if (master && running > 2) first.classList.add("pf-sec-first");
        first.appendChild(label(1));
        box.insertBefore(first, box.firstChild);
        absMarks.forEach(m => { m.el.textContent = `${name} ${m.page}/${total}`; });
        // Шапку ставим перед элементом, с которого начинается лист. Этот элемент может
        // лежать в узком контейнере – тогда шапка без явной ширины съёживается, знак уезжает
        // к середине, а номер листа уходит от правого края. Поэтому ширину и левый край
        // шапки задаём по разделу.
        const boxRect = box.getBoundingClientRect();
        starts.forEach(({ el, idx }) => {
          const br = document.createElement("div");
          br.className = "pf-break";
          const off = Math.round(el.getBoundingClientRect().left - boxRect.left);
          if (off > 1) br.style.marginLeft = `${-off}px`;
          br.style.width = `${Math.round(boxRect.width)}px`;
          br.appendChild(label(idx + 1));
          el.parentElement?.insertBefore(br, el);
        });
        if (getComputedStyle(box).position === "static") box.style.position = "relative";
        box.dataset.pfBox = "1";
        // Номер листа стоит абсолютно и не может уйти ниже конца содержимого своего листа:
        // в постраничном потоке он провалился бы на следующий лист. Поэтому каждый лист
        // добиваем невидимой распоркой до полной высоты страницы – тогда номер встаёт в угол.
        const heads = Array.from(box.querySelectorAll<HTMLElement>(".pf-head"));
        if (heads.length) {
          // Раскладка размечается при снятом масштабе, поэтому замеры уже в её единицах.
          const bTop = box.getBoundingClientRect().top;
          const tops = heads.map(h => h.getBoundingClientRect().top - bTop);
          const endAll = box.getBoundingClientRect().height;
          // Номер листа стоит внутри шапки и выходит за её нижний край, поэтому у всех
          // блоков над шапкой снимаем обрезку: иначе номер срезается (например, у .collapsible).
          heads.forEach(h => {
            let el: HTMLElement | null = h.parentElement;
            while (el && el !== box) {
              if (getComputedStyle(el).overflow !== "visible") {
                el.dataset.pfOv = el.style.overflow || "";
                el.style.overflow = "visible";
              }
              el = el.parentElement;
            }
          });
          // Номер листа стоит абсолютно и не может уйти ниже конца содержимого своего листа,
          // поэтому лист добивается невидимой распоркой до строки с номером. У блоков с рамкой
          // рамка при печати снята, иначе распорка растягивала бы пустую рамку до низа листа.
          const target = realPage - STRUT_UP / zTry + 16;
          const spacers: (HTMLElement | null)[] = heads.map(() => null);
          for (let k = heads.length - 1; k >= 0; k--) {
            const len = (k + 1 < heads.length ? tops[k + 1] : endAll) - tops[k];
            const gap = target - len;
            if (gap <= 4) continue;
            const sp = document.createElement("div");
            sp.className = "pf-spacer";
            sp.style.height = `${Math.round(gap)}px`;
            const wrap = k + 1 < heads.length ? heads[k + 1].parentElement : null;
            if (wrap && wrap.parentElement) wrap.parentElement.insertBefore(sp, wrap);
            else box.appendChild(sp);
            spacers[k] = sp;
          }
          // Отступы последнего блока прибавляются к распорке: перемеряем и подрезаем по факту.
          const limit = realPage - SAFE_BOTTOM / zTry;
          const bTop2 = box.getBoundingClientRect().top;
          const tops2 = heads.map(h => h.getBoundingClientRect().top - bTop2);
          const end2 = box.getBoundingClientRect().height;
          for (let k = 0; k < heads.length; k++) {
            const len = (k + 1 < heads.length ? tops2[k + 1] : end2) - tops2[k];
            const over = len - limit;
            const sp = spacers[k];
            if (over > 0 && sp) sp.style.height = `${Math.max(0, Math.round(parseFloat(sp.style.height) - over))}px`;
          }
        }
        running += total;
      });
      return totalPages;
      };

      // Подбор раскладки. Ширина задаёт и масштаб: по ширине лист заполняется всегда,
      // поэтому z = PAGE_W / W. Широкая раскладка вмещает больше в строку и даёт мельче
      // шрифт – так раздел и ужимается в меньшее число листов. Берём вариант с наименьшим
      // числом листов, а среди равных – самую узкую раскладку, то есть крупнейший шрифт.
      const pick = (box: HTMLElement, setW: (w: number) => void, startAt?: number) => {
        let bW = LAYOUT_W, bZ = 0, bN = Infinity;
        const t0 = Date.now();
        for (const W of WIDTHS) {
          setW(W);
          clearMarks(box);
          const h = box.scrollHeight;
          const zW = Math.min(PAGE_W / W, (PAGE * pages) / h) * SAFETY;
          if (zW >= 0.45) {
            const n = plan(zW, false, box, startAt);
            if (n < bN || (n === bN && zW > bZ)) { bN = n; bZ = zW; bW = W; }
          }
          // перебор не должен замораживать вкладку: дальше идём с лучшим из найденного
          if (bZ && Date.now() - t0 > BUDGET) break;
        }
        if (!bZ) { bW = LAYOUT_W; bZ = (PAGE_W / LAYOUT_W) * SAFETY; }
        return { w: bW, z: bZ };
      };

      // Подбор раскладки. Ширина задаёт и масштаб: z = PAGE_W / W, поэтому самая узкая
      // подходящая раскладка одновременно даёт и крупнейший шрифт, и наиболее заполненный
      // лист. Разделу без права на разбивку раскладка подбирается так, чтобы он лёг на один
      // лист; разделам с правом – так, чтобы листов было меньше.
      const pickFor = (box: HTMLElement, setW: (w: number) => void, only?: HTMLElement,
                       startAt?: number, secName?: string) => {
        const tried: { w: number; z: number; n: number; bad: number; hole: number }[] = [];
        const t0 = Date.now();
        const floor = (secName && WIDTH_FLOOR[secName]) || 0;
        for (const W of WIDTHS) {
          if (W < floor) continue;
          setW(W);
          clearMarks(only);
          const h = box.scrollHeight;
          const zW = Math.min(PAGE_W / W, (PAGE * pages) / h) * SAFETY;
          if (zW >= 0.45) {
            const counts: { name: string; n: number }[] = [];
            const holes: number[] = [];
            const n = plan(zW, false, only, startAt, counts, holes);
            const bad = counts.filter(c => !SPLIT_OK.has(c.name) && c.n > 1).length;
            // самый пустой лист раздела: из двух раскладок с одинаковым числом листов
            // берём ту, где нет листа, заполненного наполовину
            const hole = holes.length ? Math.max(...holes) : 0;
            tried.push({ w: W, z: zW, n, bad, hole });
          }
          // перебор не должен замораживать вкладку: дальше идём с лучшим из найденного
          if (tried.some(t => t.bad === 0) && Date.now() - t0 > BUDGET) break;
        }
        if (!tried.length) return { w: LAYOUT_W, z: (PAGE_W / LAYOUT_W) * SAFETY };
        const minBad = Math.min(...tried.map(t => t.bad));
        const pool = tried.filter(t => t.bad === minBad);
        const minN = Math.min(...pool.map(t => t.n));
        const ok = pool.filter(t => t.n === minN);
        // Сначала – наименьшая пустота на самом пустом листе (с шагом 5% листа, чтобы
        // мелкая разница не перевешивала размер шрифта), затем – крупнейший шрифт.
        const step = (v: number) => Math.round(v * 20);
        const minHole = Math.min(...ok.map(t => step(t.hole)));
        const best = ok.filter(t => step(t.hole) === minHole);
        const win = best.reduce((a, t) => (t.z > a.z ? t : a), best[0]);
        return { w: win.w, z: win.z };
      };

      if (master) {
        // Каждый раздел считается отдельно и получает свой масштаб: с одним масштабом
        // на весь документ лёгкие разделы ужимались под самый тяжёлый и занимали
        // половину листа. Масштаб стоит на содержимом раздела, а разрыв страницы – на
        // самом разделе: если держать их на одном элементе, браузер вставляет между
        // разделами пустой лист.
        html.style.setProperty("--pf-w", `${PAGE_W}px`);
        html.style.setProperty("--pf-zoom", "1");
        const secs: { sec: HTMLElement; box: HTMLElement }[] = [];
        document.querySelectorAll<HTMLElement>(".print-section").forEach(sec => {
          const box = sec.querySelector<HTMLElement>(".content");
          if (box) secs.push({ sec, box });
        });
        const cached = fitAll && fitAll.length === secs.length;
        const zooms: { box: HTMLElement; z: number }[] = [];
        const fresh: { w: number; z: number; h: number }[] = [];
        let running = 2;                         // первый лист общего документа – титульный
        secs.forEach(({ sec, box }, i) => {
          sec.dataset.pfSec = "1";
          const setW = (w: number) => { sec.style.setProperty("--pf-sw", `${w}px`); };
          let got: { w: number; z: number };
          if (cached) {
            setW(fitAll![i].w);
            clearMarks(box);
            got = Math.abs(box.scrollHeight - fitAll![i].h) < 3
              ? { w: fitAll![i].w, z: fitAll![i].z }
              : pickFor(box, setW, box, running, sec.dataset.name);
          } else {
            got = pickFor(box, setW, box, running, sec.dataset.name);
          }
          setW(got.w);
          clearMarks(box);
          fresh.push({ w: got.w, z: got.z, h: box.scrollHeight });
          // Колонтитул задан в единицах раскладки, а масштаб у разделов разный. Чтобы на
          // бумаге название, номер и знак были одного размера везде, размеры делятся на масштаб.
          box.style.setProperty("--pf-inv", (1 / got.z).toFixed(4));
          running += plan(got.z, true, box, running);
          zooms.push({ box, z: got.z });
        });
        fitAll = fresh;
        // Сквозная нумерация: общее число листов известно только после разметки всех
        // разделов, поэтому номера проставляем в конце.
        const total = running - 1;
        Array.from(document.querySelectorAll<HTMLElement>(".pf-head .pf-num"))
          .forEach((n, i) => { n.textContent = `${i + 2}/${total}`; });
        // масштаб включаем после разметки: она считается при снятом масштабе
        zooms.forEach(({ box, z }) => { box.style.zoom = z.toFixed(4); });
      } else {
        const boxOne = main?.querySelector<HTMLElement>(".content") || null;
        const setW = (w: number) => { html.style.setProperty("--pf-w", `${w}px`); };
        let got: { w: number; z: number };
        if (fit && boxOne) {
          setW(fit.w);
          clearMarks();
          got = Math.abs(boxOne.scrollHeight - fit.h) < 3
            ? { w: fit.w, z: fit.z } : pickFor(boxOne, setW, undefined, undefined, section);
        } else if (boxOne) {
          got = pickFor(boxOne, setW, undefined, undefined, section);
        } else {
          got = { w: LAYOUT_W, z: (PAGE_W / LAYOUT_W) * SAFETY };
        }
        z = got.z;
        setW(got.w);
        html.style.setProperty("--pf-zoom", "1");   // размечаем без масштаба, иначе замеры зумлёные
        html.style.setProperty("--pf-page", `${Math.round(PAGE / z)}px`);
        html.style.setProperty("--pf-inv", (1 / z).toFixed(4));
        clearMarks();
        if (boxOne) fit = { w: got.w, z: got.z, h: boxOne.scrollHeight };
        plan(z, true);
        html.style.setProperty("--pf-zoom", z.toFixed(4));   // и только теперь включаем масштаб
      }
      } catch { after(); }            // печать не должна ломать страницу
      finally {
        html.classList.remove("pf-sim");
        openedAt = Date.now();        // пауза отсчитывается от конца подготовки
      }
    };
    const after = () => {
      if (!prepared && !html.classList.contains("pf-on")) return;
      prepared = false;
      unsplit();
      html.classList.remove("pf-on");
      html.classList.remove("pf-sim");
      html.style.removeProperty("--pf-zoom");
      html.style.removeProperty("--pf-w");
      html.style.removeProperty("--pf-page");
      html.style.removeProperty("--pf-inv");
      document.querySelectorAll(".pf-break, .pf-first, .pf-abs-mark, .pf-stamp, .pf-foot, .pf-num, .pf-num-inner, .pf-spacer").forEach(el => el.remove());
      document.querySelectorAll<HTMLElement>("[data-pf-tall]").forEach(el => {
        el.style.breakInside = ""; delete el.dataset.pfTall;
      });
      document.querySelectorAll<HTMLElement>("[data-pf-tall-pos]").forEach(el => {
        el.style.position = ""; delete el.dataset.pfTallPos;
      });
      document.querySelectorAll<HTMLElement>("[data-pf-ov]").forEach(el => {
        el.style.overflow = el.dataset.pfOv || ""; delete el.dataset.pfOv;
      });
      document.querySelectorAll<HTMLElement>("[data-pf-br]").forEach(el => {
        el.style.breakBefore = ""; delete el.dataset.pfBr;
      });
      document.querySelectorAll<HTMLElement>("[data-pf-box]").forEach(el => {
        el.style.minHeight = ""; el.style.position = ""; delete el.dataset.pfBox;
      });
      document.querySelectorAll<HTMLElement>("[data-pf-sec]").forEach(el => {
        el.style.removeProperty("--pf-sw"); delete el.dataset.pfSec;
        const c = el.querySelector<HTMLElement>(".content");
        if (c) { c.style.zoom = ""; c.style.removeProperty("--pf-inv"); }
      });
      if (savedTitle) document.title = savedTitle;
      // возвращаем экранную раскладку и прежнюю позицию прокрутки
      requestAnimationFrame(() => window.scrollTo(0, savedScroll));
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    // Страховка на случай, когда окно печати закрыли мимо события afterprint – например,
    // кликом вне его. Любое действие на самой странице означает, что окна печати уже нет:
    // пока оно открыто, до страницы не доходят ни клики, ни клавиши, ни прокрутка.
    // Короткая пауза после открытия нужна, чтобы клик, которым окно и вызвали, печать не снял.
    const heal = () => {
      if (!prepared && !html.classList.contains("pf-on")) return;
      if (Date.now() - openedAt > GRACE) after();
    };
    const acts = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    acts.forEach(t => window.addEventListener(t, heal, { capture: true, passive: true }));
    const mq = window.matchMedia("print");
    const onMq = (e: MediaQueryListEvent) => { if (!e.matches) heal(); };
    mq.addEventListener?.("change", onMq);
    const onVis = () => { if (!document.hidden) heal(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      acts.forEach(t => window.removeEventListener(t, heal, { capture: true }));
      mq.removeEventListener?.("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
      page.remove();
      after();
    };
  }, [pages, section, master, path]);
  return null;
}
