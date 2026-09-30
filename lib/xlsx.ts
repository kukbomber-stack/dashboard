// Минимальная сборка XLSX без внешних библиотек: zip без сжатия + четыре XML-файла.
function crc32(buf: Uint8Array) {
  let c, crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xFF;
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
const enc = (s: string) => new TextEncoder().encode(s);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function zip(files: { name: string; data: Uint8Array }[]) {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const u16 = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF];
  const u32 = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF];
  files.forEach(f => {
    const name = enc(f.name), crc = crc32(f.data), size = f.data.length;
    const local = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0)]);
    chunks.push(local, name, f.data);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0),
      ...u32(offset)]), name);
    offset += local.length + name.length + size;
  });
  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
    ...u32(centralSize), ...u32(offset), ...u16(0)]);
  const all = [...chunks, ...central, end];
  const total = all.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  all.forEach(c => { out.set(c, p); p += c.length; });
  return out;
}

const colName = (i: number) => {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

// merges – объединённые ячейки в координатах строк и столбцов листа, от нуля.
// filter – автофильтр по строке заголовков; noteCols – столбцы, которые всегда выравниваются по левому краю.
export type Merge = { r1: number; c1: number; r2: number; c2: number };
export type Sheet = { name: string; rows: string[][]; head?: number; merges?: Merge[]; filter?: boolean; widths?: Record<number, number> };

// Стили ячеек (индексы cellXfs): 0 – по умолчанию; 1 – шапка; 2/3 – текст слева (обычная / полосатая строка);
// 4/5 – по центру (числа); 6/7 – слева / по центру с жёлтой заливкой «нет данных»; 8 – заголовок строки в листе без шапки.
const STYLES = `<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><sz val="11"/><b/><name val="Arial"/></font></fonts>
<fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF6B4A34"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF3E9DD"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFF1BF"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFC9B9A6"/></left><right style="thin"><color rgb="FFC9B9A6"/></right><top style="thin"><color rgb="FFC9B9A6"/></top><bottom style="thin"><color rgb="FFC9B9A6"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="9">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

// Ячейка «нет данных»: показатель в отчётности не выделен или не передан – её нужно заполнить.
const NEEDS_FILL = /^(–|-|н\/д|нет данных|не передан[оы]?)$/i;
const asNumber = (v: string) => {
  const num = v.replace(/\u00a0|\s/g, "").replace(",", ".");
  return num !== "" && /^-?\d+(\.\d+)?%?$/.test(num) && !num.endsWith("%") ? num : null;
};

export function makeXlsx(sheets: Sheet[]) {
  const sheetXml = (s: Sheet) => {
    const head = s.head ?? 1;   // 0 – в таблице нет строки-шапки
    const width = s.rows.reduce((m, r) => Math.max(m, r.length), 0);
    // Столбец считается числовым, если в нём числа – большинство заполненных ячеек тела таблицы;
    // такие столбцы центрируются, текстовые идут по левому краю (длинные пояснения так читаются).
    const numeric: boolean[] = [];
    for (let c = 0; c < width; c++) {
      let n = 0, filled = 0;
      s.rows.forEach((r, i) => {
        if (i < head) return;
        const v = (r[c] ?? "").trim();
        if (!v || NEEDS_FILL.test(v)) return;
        filled += 1;
        if (asNumber(v) !== null || /^[-+]?\d[\d\s\u00a0,.]*%?$/.test(v)) n += 1;
      });
      numeric[c] = c > 0 && filled > 0 && n / filled >= 0.6;
    }
    // Ширина столбца – по самой длинной ячейке, но не шире 60 знаков для текста и 16 для чисел;
    // у столбца «Комментарий» – 34 знака под свободный текст.
    const widths: number[] = [];
    for (let c = 0; c < width; c++) {
      const longest = s.rows.reduce((m, r) => Math.max(m, (r[c] ?? "").length), 0);
      const headText = head > 0 ? (s.rows[0][c] ?? "") : "";
      let w = numeric[c] ? Math.min(16, Math.max(9, longest + 2)) : Math.min(60, Math.max(10, Math.min(longest, 60) + 2));
      if (headText === "Комментарий") w = 34;
      if (s.widths && s.widths[c]) w = s.widths[c];
      widths.push(w);
    }
    const cols = `<cols>${widths.map((w, c) => `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>`;
    const rows = s.rows.map((cells, r) => {
      const zebra = (r - head) % 2 === 1;
      const styleFor = (c: number, v: string) => {
        if (r < head) return 1;
        if (head === 0 && c === 0) return 8;
        const need = NEEDS_FILL.test(v.trim());
        if (numeric[c]) return need ? 7 : (zebra ? 5 : 4);
        return need ? 6 : (zebra ? 3 : 2);
      };
      // Высота строки – по числу строк переноса в самой длинной ячейке: иначе в Excel и Numbers
      // многострочные пояснения обрезаются по высоте одной строки.
      let lines = 1;
      cells.forEach((v, c) => {
        const perLine = Math.max(6, Math.floor((widths[c] ?? 10) * 1.05));
        const est = v.split("\n").reduce((a, part) => a + Math.max(1, Math.ceil(part.length / perLine)), 0);
        lines = Math.max(lines, est);
      });
      const ht = Math.min(15 + (lines - 1) * 14.5, 190);
      const cs = cells.map((v, c) => {
        const style = styleFor(c, v);
        const num = asNumber(v);
        const ref = `${colName(c)}${r + 1}`;
        return num !== null
          ? `<c r="${ref}" s="${style}"><v>${num}</v></c>`
          : `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
      }).join("");
      return `<row r="${r + 1}" ht="${ht.toFixed(1)}" customHeight="1">${cs}</row>`;
    }).join("");
    const freeze = head > 0
      ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${head}" topLeftCell="A${head + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
      : `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;
    const filter = s.filter && head > 0 && s.rows.length > head
      ? `<autoFilter ref="A${head}:${colName(width - 1)}${s.rows.length}"/>` : "";
    // Объединённые ячейки: повторяют разметку таблицы на экране (rowspan и colspan).
    const merges = (s.merges ?? []).filter(m => m.r2 > m.r1 || m.c2 > m.c1);
    const mergeXml = merges.length
      ? `<mergeCells count="${merges.length}">${merges
          .map(m => `<mergeCell ref="${colName(m.c1)}${m.r1 + 1}:${colName(m.c2)}${m.r2 + 1}"/>`).join("")}</mergeCells>`
      : "";
    return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${freeze}${cols}<sheetData>${rows}</sheetData>${filter}${mergeXml}</worksheet>`;
  };
  const files = [
    { name: "[Content_Types].xml", data: enc(`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`) },
    { name: "_rels/.rels", data: enc(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`) },
    { name: "xl/workbook.xml", data: enc(`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`) },
    { name: "xl/_rels/workbook.xml.rels", data: enc(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`) },
    { name: "xl/styles.xml", data: enc(STYLES) },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: enc(sheetXml(s)) })),
  ];
  return new Blob([zip(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// Собирает все таблицы страницы: имя листа берётся из ближайшего заголовка над таблицей.
export function tablesToSheets(root: ParentNode): Sheet[] {
  const used = new Set<string>();
  const clean = (s: string) => s.replace(/\u00ad/g, "").replace(/\s+/g, " ").trim();
  const sheets: Sheet[] = [];
  // Выгрузка отдаёт данные раздела целиком: таблицы в неактивных подвкладках, в свёрнутых
  // блоках, скрытые строки «показать ещё» и блоки, которые не идут на печать, на экране
  // не видны, но в файл попадают. Пропускаются только блоки внутри меню и кнопок.
  const visible = (el: Element) => el.closest(".print-menu, .section-tabs, button") === null;
  root.querySelectorAll("table").forEach((table, idx) => {
    if (table.closest("td, th")) return;          // вложенные таблицы выгружаем отдельно
    if (!visible(table)) return;                   // скрытые на экране пропускаем
    // Имя листа: явное (data-sheet), иначе от карточки или сворачиваемого блока, иначе от заголовка над таблицей.
    let title = (table.getAttribute("data-sheet") || "").trim();
    // Таблица внутри карточки или сворачиваемого блока берёт имя от него, а не от общего
    // заголовка раздела: иначе соседние листы получают одно имя с номером.
    const card = title ? null : table.closest(".team-card");
    if (card) title = clean(card.querySelector(".team-head b")?.textContent || "");
    if (!title) {
      const host = table.closest(".collapsible");
      if (host) title = clean(host.querySelector(".collapsible-title")?.textContent || "");
    }
    let node: Element | null = table;
    while (node && !title) {
      let prev: Element | null = node.previousElementSibling;
      while (prev && !title) {
        if (/^H[1-4]$/.test(prev.tagName)) title = clean(prev.textContent || "");
        prev = prev.previousElementSibling;
      }
      node = node.parentElement;
    }
    if (!title) title = clean(table.closest(".tab-panel")?.querySelector(".tab-print-title")?.textContent || "").replace(/\s·\s\d+$/, "");
    let name = (title || `Таблица ${idx + 1}`).replace(/[\\/?*\[\]:]/g, " ").slice(0, 31).trim() || `Лист ${idx + 1}`;
    let n = 2;
    while (used.has(name)) { name = `${name.slice(0, 28)} ${n++}`; }
    used.add(name);
    const rows: string[][] = [];
    const merges: Merge[] = [];
    // Сколько строк вниз ещё занимает ячейка, объединённая по вертикали, в каждом столбце.
    // Без этого учёта значения строк без такой ячейки съезжают на столбец влево.
    const carry: number[] = [];
    let head = 0, seenBody = false;
    table.querySelectorAll("tr").forEach(tr => {
      if (tr.closest("table") !== table) return;   // строки вложенной таблицы не смешиваем
      if (tr.querySelector("table")) return;       // строка-контейнер с вложенной таблицей
      if (tr.closest(".print-menu, .section-tabs, button")) return;
      const r = rows.length;
      const cells: string[] = [];
      let col = 0;
      const own: string[] = [];
      tr.querySelectorAll("th, td").forEach(cell => {
        const cSpan = Number((cell as HTMLTableCellElement).colSpan || 1);
        const rSpan = Number((cell as HTMLTableCellElement).rowSpan || 1);
        const copy = cell.cloneNode(true) as HTMLElement;
        copy.querySelectorAll(".th-hint, .no-print, .tip-mark, button, table").forEach(el => el.remove());
        // Плашки (способ отработки, статус) стоят в строке и слипаются с соседним текстом –
        // в таблице их отделяет фон, в ячейке листа берём в скобки.
        copy.querySelectorAll(".lic-method, .lic-st, .st, .chip, .badge, .lamp").forEach(el => {
          const t = (el.textContent || "").trim();
          if (t) el.textContent = ` (${t})`;
        });
        // Блочные куски внутри ячейки разделяем, иначе текст слипается: подпись столбца
        // с расшифровкой под ней, значение с примечанием, перечень участков.
        Array.from(copy.children).forEach(child => {
          if (getComputedStyle(child).display === "inline") return;
          const before = (child.previousSibling?.textContent || "").trim()
            || (child.previousElementSibling ? "x" : "");
          if (before) child.insertAdjacentText("beforebegin", " · ");
        });
        const text = clean(copy.textContent || "").replace(/^ ?· ?/, "").replace(/ ?· ?$/, "");
        own.push(text);
        while (carry[col] > 0) { cells[col] = cells[col] ?? ""; col += 1; }   // место занято сверху
        cells[col] = text;
        if (rSpan > 1 || cSpan > 1) merges.push({ r1: r, c1: col, r2: r + rSpan - 1, c2: col + cSpan - 1 });
        for (let k = 0; k < cSpan; k++) {
          if (k > 0) cells[col + k] = "";
          carry[col + k] = rSpan;                  // включая текущую строку, уменьшим ниже
        }
        col += cSpan;
      });
      if (own.some(c => c !== "")) {
        for (let c = 0; c < cells.length; c++) cells[c] = cells[c] ?? "";
        rows.push(cells);
        const onlyTh = tr.querySelector("td") === null;
        if (onlyTh && !seenBody) head += 1; else seenBody = true;
      }
      for (let c = 0; c < carry.length; c++) if (carry[c] > 0) carry[c] -= 1;
    });
    const width = rows.reduce((m, r) => Math.max(m, r.length), 0);
    rows.forEach(r => { while (r.length < width) r.push(""); });
    const hasTh = table.querySelector("th") !== null;
    const headRows = hasTh ? Math.max(1, head) : 0;
    if (rows.length) sheets.push({ name, rows, head: headRows, merges, filter: headRows === 1 && rows.length > 3 });
  });
  return sheets;
}

// Ближайший заголовок над элементом: сначала среди предыдущих соседей, потом у родителей.
function headingAbove(el: Element, clean: (s: string) => string) {
  let node: Element | null = el;
  while (node) {
    let prev: Element | null = node.previousElementSibling;
    while (prev) {
      // H1 – название раздела, оно не считается блоком: у плашек верхнего уровня блок остаётся пустым.
      if (/^H[2-4]$/.test(prev.tagName)) {
        const copy = prev.cloneNode(true) as HTMLElement;
        copy.querySelectorAll(".kpi-hint, .th-hint, .tip, .no-print, .sec-total, .h3-sub").forEach(x => x.remove());
        // Единица измерения в заголовке блока («млн ₽ с НДС») стоит отдельным span – отделяем точкой.
        copy.querySelectorAll("span").forEach(sp => { sp.textContent = " · " + (sp.textContent || ""); });
        return clean(copy.textContent || "").replace(/ · $/, "");
      }
      prev = prev.previousElementSibling;
    }
    node = node.parentElement;
    if (node && (node.classList.contains("content") || node.classList.contains("tab-panel"))) break;
  }
  return "";
}

// Период показателя – из подписи блока или пояснения: «с начала месяца 1–27.09», «за неделю 21–27.09»,
// «на 20.09.2026», «с начала года». Если периода нет, столбец остаётся пустым.
function periodOf(...texts: string[]) {
  const re = /(с начала (?:года|месяца|работ)(?: \d{1,2}–\d{1,2}\.\d{2})?|за неделю(?: \d{1,2}–\d{1,2}\.\d{2})?|за сутки|за месяц|на \d{2}\.\d{2}\.\d{4}|на \d{2}\.\d{2}|до \d{2}\.\d{2}(?:\.\d{4})?|\d{1,2}–\d{1,2}\.\d{2}|[IV]+ кв\. \d{4}|\d{4} г\.)/i;
  for (const t of texts) {
    const m = t.match(re);
    if (m) return m[1];
  }
  return "";
}

// Значение плашки вида «15 ед.», «40 чел.», «3 222,0 м» раскладывается на число и единицу;
// составные значения («30,6 км / +10 т», «5/10*») остаются текстом.
function splitUnit(v: string): [string, string] {
  const m = v.match(/^([-+]?\d[\d\s\u00a0]*(?:[,.]\d+)?)\s*([A-Za-zА-Яа-яЁё₽$€%][^/]*)?$/);
  if (!m) return [v, ""];
  return [m[1].trim(), (m[2] || "").trim()];
}

// Плашки раздела одним листом: KPI-карточки, сводные плитки Обзора и карточки станков.
// Для карточек «факт / план» значение раскладывается на два столбца. Ячейки без данных (–, н/д)
// выделяются жёлтым, последний столбец «Комментарий» пустой – для исправлений и уточнений.
export function tilesToSheet(root: ParentNode): Sheet | null {
  const clean = (s: string) => s.replace(/\u00ad/g, "").replace(/\s+/g, " ").trim();
  const txt = (el: Element | null | undefined, drop = "") => {
    if (!el) return "";
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelectorAll(".kpi-hint, .th-hint, .tip, .no-print, .kpi-link, .chart-link-note, button, svg" + (drop ? ", " + drop : "")).forEach(x => x.remove());
    return clean(copy.textContent || "");
  };
  const visible = (el: Element) => el.closest(".print-menu, .section-tabs, button") === null;
  const tabOf = (el: Element) => clean(el.closest(".tab-panel")?.querySelector(".tab-print-title")?.textContent || "").replace(/\s·\s\d+$/, "");
  const rows: string[][] = [["Вкладка", "Блок", "Показатель", "Период", "Факт / значение", "План", "Ед. изм.", "Пояснение", "Комментарий"]];
  const push = (tab: string, block: string, cap: string, fact: string, plan: string, unit: string, note: string) =>
    rows.push([tab, block, cap, periodOf(cap, block, note), fact, plan, unit, note, ""]);
  root.querySelectorAll(".kpi, .sum-item, .rig").forEach(el => {
    if (!visible(el)) return;
    const tab = tabOf(el);
    const block = headingAbove(el.classList.contains("kpi") || el.classList.contains("sum-item") ? (el.parentElement || el) : el, clean);
    if (el.classList.contains("kpi")) {
      const cap = txt(el.querySelector(".cap"));
      const val = el.querySelector(".val");
      const unit = txt(val?.querySelector("small"));
      const plan = txt(val?.querySelector(".pf-plan"));
      const fact = txt(val, "small, .pf-sep, .pf-plan");
      const sub = txt(el.querySelector(".sub"));
      const detail = txt(el.querySelector(".kpi-expand-body"));
      const [f, u] = unit ? [fact, unit] : splitUnit(fact);
      push(tab, block, cap, f, plan, u, [sub, detail].filter(Boolean).join(" · "));
    } else if (el.classList.contains("sum-item")) {
      const cap = txt(el.querySelector(".sum-cap"));
      const [f, u] = splitUnit(txt(el.querySelector(".sum-val")));
      push(tab, block || "Сводка по проекту", cap, f, "", u, txt(el.querySelector(".sum-note")));
    } else {
      const name = txt(el.querySelector("h3"), ".st");
      const st = txt(el.querySelector("h3 .st"));
      const place = txt(el.querySelector(".place"));
      const note = txt(el.querySelector(".note"));
      const nums = Array.from(el.querySelectorAll(".n"));
      if (!nums.length) push(tab, block, name, "", "", "", [st, place, note].filter(Boolean).join(" · "));
      nums.forEach((n, i) => {
        const [f, u] = splitUnit(txt(n.querySelector("b")));
        push(tab, block, `${name}: ${txt(n.querySelector("span"))}`, f, "", u, i === 0 ? [st, place, note].filter(Boolean).join(" · ") : "");
      });
    }
  });
  return rows.length > 1 ? { name: "Плашки", rows, head: 1, filter: true } : null;
}

// Столбец «Комментарий» в конце каждой таблицы: место для исправлений и уточнений.
export function withCommentColumn(sheet: Sheet): Sheet {
  const width = sheet.rows.reduce((m, r) => Math.max(m, r.length), 0);
  const head = sheet.head ?? 1;
  const rows = sheet.rows.map((r, i) => {
    const out = r.slice();
    while (out.length < width) out.push("");
    out.push(i === 0 && head > 0 ? "Комментарий" : "");
    return out;
  });
  const merges = (sheet.merges ?? []).slice();
  if (head > 1) merges.push({ r1: 0, c1: width, r2: head - 1, c2: width });
  return { ...sheet, rows, merges };
}

// Лист «Нет данных»: все жёлтые ячейки из остальных листов одним списком – готовый перечень
// того, что нужно заполнить. Строка называется по первой ячейке (показатель), столбец – по шапке.
export function needsSheet(sheets: Sheet[]): Sheet | null {
  const rows: string[][] = [["Лист", "Показатель / строка", "Столбец", "Сейчас", "Значение", "Комментарий"]];
  sheets.forEach(sh => {
    const head = sh.head ?? 1;
    const headers = (c: number) => {
      const parts: string[] = [];
      for (let r = 0; r < head; r++) {
        // у объединённой шапки текст стоит в первой ячейке диапазона – берём его
        let v = sh.rows[r][c] ?? "";
        if (!v) {
          const m = (sh.merges ?? []).find(x => x.r1 <= r && r <= x.r2 && x.c1 <= c && c <= x.c2);
          if (m) v = sh.rows[m.r1][m.c1] ?? "";
        }
        if (v && !parts.includes(v)) parts.push(v);
      }
      return parts.join(" · ");
    };
    sh.rows.forEach((r, i) => {
      if (i < head) return;
      // Подпись строки: у плашек – вкладка, блок и показатель; у таблиц – первая ячейка, а если это
      // короткий номер (№ п/п, код), то вместе со следующей ячейкой-названием.
      const first = (r[0] || "").trim();
      const label = sh.name === "Плашки"
        ? [r[0], r[1], r[2]].filter(Boolean).join(" · ")
        : first.length <= 5 && (r[1] || "").trim() ? `${first} ${(r[1] || "").trim()}`.trim() : (first || r[1] || "");
      r.forEach((v, c) => {
        if (!NEEDS_FILL.test(v.trim())) return;
        rows.push([sh.name, label, headers(c), v.trim(), "", ""]);
      });
    });
  });
  return rows.length > 1 ? { name: "Нет данных", rows, head: 1, filter: true, widths: { 0: 28, 1: 52, 2: 30, 3: 10, 4: 18, 5: 34 } } : null;
}

// Первый лист выгрузки: что это за файл и как в нём работать.
export function infoSheet(section: string, asOf: string, sheets: Sheet[], owner?: string): Sheet {
  const stamp = new Date();
  const dd = String(stamp.getDate()).padStart(2, "0"), mm = String(stamp.getMonth() + 1).padStart(2, "0");
  const need = sheets.reduce((n, s) => n + s.rows.reduce((k, r) => k + r.filter(v => NEEDS_FILL.test(v.trim())).length, 0), 0);
  return {
    name: "О выгрузке", head: 0, widths: { 0: 24, 1: 90 }, rows: [
      ["Раздел кабинета", section],
      ["Данные на", asOf],
      ["Выгружено", `${dd}.${mm}.${stamp.getFullYear()} из кабинета ППР (ppr-cabinet.onrender.com)`],
      ["Ответственный за данные", owner || "не назначен протоколом РГ – уточнить"],
      ["Листы", sheets.map(s => s.name).join(" · ")],
      ["Как заполнять", "Исправления и недостающие значения вписывайте в столбец «Комментарий» той же строки. Жёлтым выделены ячейки без данных: прочерк – показатель в отчётности не выделен, н/д – данные не переданы."],
      ["Ячеек без данных", need ? `${need} – список на листе «Нет данных»: их нужно заполнить или подтвердить, что данных нет` : "нет"],
    ],
  };
}
