"use client";
import React, { useEffect, useRef, useState } from "react";

export function Kpi({ cap, val, unit, sub, hl, hint }: { cap: string; val: string; unit?: string; sub?: React.ReactNode; hl?: boolean; hint?: string }) {
  return (
    <div className={"kpi" + (hl ? " hl" : "")}>
      <div className="cap">{cap}{hint ? <span className="kpi-hint" data-tip={hint} aria-label={hint} tabIndex={0}>i</span> : null}</div>
      <div className="val">{val}{unit ? <small> {unit}</small> : null}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}

// KPI-карточка с разворачиваемой деталью (клик по подписи снизу открывает доп. содержимое внутри карточки).
// printHide – подробности не печатаются (на экране раскрываются кнопкой как обычно).
export function KpiExpand({ cap, val, unit, sub, hl, hint, detailLabel = "Подробнее", detail, printHide }: {
  cap: string; val: string; unit?: string; sub?: React.ReactNode; hl?: boolean; hint?: string; detailLabel?: string; detail: React.ReactNode; printHide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"kpi" + (hl ? " hl" : "") + (printHide ? " kpi-print-plain" : "")}>
      <div className="cap">{cap}{hint ? <span className="kpi-hint" data-tip={hint} aria-label={hint} tabIndex={0}>i</span> : null}</div>
      <div className="val">{val}{unit ? <small> {unit}</small> : null}</div>
      {sub ? <div className="sub">{sub}</div> : null}
      <button type="button" className="kpi-expand-btn" onClick={() => setOpen(o => !o)} aria-expanded={open} title="Нажмите, чтобы раскрыть подробности">
        <span className={"collapsible-chev" + (open ? " open" : "")}>›</span> {open ? "Свернуть" : detailLabel}
      </button>
      <div className={"kpi-expand-body" + (open ? "" : " is-off")}>{detail}</div>
    </div>
  );
}

// Столбчатая диаграмма (стек ZBO/XYDX либо один ряд). Значения масштабируются к max.
export function Bars({ data, max, height = 168 }: {
  data: { label: string; z?: number; x?: number; v?: number; pale?: boolean; note?: string }[];
  max: number; height?: number;
}) {
  // Запас сверху под подпись значения и снизу под подпись категории (она может быть в две строки).
  const H = height - 52;
  return (
    <div className="bars">
      {data.map((d, i) => {
        const z = d.z ?? 0, x = d.x ?? 0, v = d.v ?? (z + x);
        const zh = Math.round((z / max) * H), xh = Math.round((x / max) * H);
        const vh = d.v != null ? Math.round((v / max) * H) : 0;
        return (
          <div key={i} className={"bar" + (d.pale ? " pale" : "")}>
            <div className="bar-col" style={{ height: H + 22 }}>
              <b>{v != null ? v.toLocaleString("ru", { maximumFractionDigits: 1 }) : "–"}</b>
              <div className="stack" style={{ height: (d.v != null ? vh : zh + xh) || 4 }}>
                {d.v != null
                  ? <i style={{ height: "100%", background: d.pale ? "#D9D2C4" : "var(--teal)" }} />
                  : <><i className="z" style={{ height: zh }} /><i className="x" style={{ height: xh }} /></>}
              </div>
            </div>
            <span>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Progress({ rows, note }: { rows: { label: string; pct: number; val: string; color: string }[]; note?: React.ReactNode }) {
  return (
    <div className="progress">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="pr-row"><span>{r.label}</span><b>{r.val}</b></div>
          <div className="pr-bar"><div className="pr-fill" style={{ width: `${r.pct}%`, background: r.color }} /></div>
        </div>
      ))}
      {note ? <div className="pr-note">{note}</div> : null}
    </div>
  );
}

// Круговая диаграмма (donut) с легендой и подписью в центре.
export function Donut({ data, size = 172, thickness = 30, centerLabel, centerSub }: {
  data: { label: string; value: number; color: string }[];
  size?: number; thickness?: number; centerLabel?: string; centerSub?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const stops = data.map(d => {
    const start = (acc / total) * 360;
    acc += d.value;
    const end = (acc / total) * 360;
    return `${d.color} ${start}deg ${end}deg`;
  }).join(", ");
  return (
    <div className="donut-wrap" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", flex: "none", position: "relative",
        background: `conic-gradient(${stops})`,
      }}>
        <div style={{
          position: "absolute", inset: thickness, borderRadius: "50%", background: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 4,
        }}>
          {centerLabel ? <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.15 }}>{centerLabel}</div> : null}
          {centerSub ? <div style={{ fontSize: 11, color: "#6B4A34", marginTop: 2 }}>{centerSub}</div> : null}
        </div>
      </div>
      <div className="donut-legend" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5, minWidth: 0 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flex: "none" }} />
            <span style={{ color: "#4A3527", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.label}</span>
            <span style={{ marginLeft: 4, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#1F2937", flex: "none" }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Линейный тренд по годам/периодам (SVG, без внешних зависимостей).
export function Trend({ points, height = 180, unit, now }: {
  points: { x: string; y: number }[]; height?: number; unit?: string;
  now?: { afterIndex: number; frac: number; label: string }; // вертикальная отметка "сейчас" между точками afterIndex и afterIndex+1
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && Math.round(w) !== Math.round(W)) setW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vals = points.map(p => p.y);
  const max = Math.max(...vals), min = Math.min(...vals, 0);
  const padTop = 28, padBot = 24, padX = 30;
  const innerW = W - padX * 2, innerH = height - padTop - padBot;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
  const scaleY = (v: number) => padTop + innerH - ((v - min) / ((max - min) || 1)) * innerH;
  const coords = points.map((p, i) => [padX + i * stepX, scaleY(p.y)] as const);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${path} L ${coords[coords.length - 1][0].toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${coords[0][0].toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;
  const nowX = now ? padX + (now.afterIndex + now.frac) * stepX : null;
  const nowY = now ? points[now.afterIndex].y + (points[now.afterIndex + 1].y - points[now.afterIndex].y) * now.frac : null;
  const nowYPos = nowY != null ? scaleY(nowY) : null;
  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${height}`} width={W} height={height} style={{ width: "100%", height, display: "block" }}>
        <path d={area} fill="var(--teal)" opacity="0.12" />
        {nowX != null ? (
          <g>
            <line x1={nowX} y1={padTop - 12} x2={nowX} y2={padTop + innerH} stroke="var(--navy)" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.75" />
            <text x={nowX} y={padTop - 16} fontSize="11.5" fontWeight="700" textAnchor="middle" fill="var(--navy)">{now!.label}</text>
            {nowYPos != null ? (
              <>
                <circle cx={nowX} cy={nowYPos} r="5" fill="#fff" stroke="var(--navy)" strokeWidth="2" strokeDasharray="2.5 2" />
                <text x={nowX} y={nowYPos - 11} fontSize="11.5" fontWeight="700" fontStyle="italic" textAnchor="middle" fill="var(--navy)">
                  ≈{nowY!.toFixed(1)} {unit}
                </text>
                <text x={nowX} y={nowYPos + 20} fontSize="9.5" textAnchor="middle" fill="var(--navy)" opacity="0.75">оценка</text>
              </>
            ) : null}
          </g>
        ) : null}
        <path d={path} fill="none" stroke="var(--teal)" strokeWidth="2.5" />
        {coords.map(([x, y], i) => {
          const anchor = i === 0 ? "start" : i === coords.length - 1 ? "end" : "middle";
          const tx = i === 0 ? x - 14 : i === coords.length - 1 ? x + 14 : x;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4.5" fill="var(--teal)" />
              <text x={tx} y={y - 12} fontSize="12.5" fontWeight="700" textAnchor={anchor} fill="#1F1210">
                {points[i].y}{unit ? ` ${unit}` : ""}
              </text>
              <text x={tx} y={height - 4} fontSize="11.5" textAnchor={anchor} fill="#5A1F20">{points[i].x}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Горизонтальная навигация по разделам страницы (переход скроллом + подсветка активного раздела).
// Если адрес открыт с якорем (#id), совпадающим с id одного из разделов, сразу выбирает его -
// так работают ссылки вида /cabinet/costs#opr с других вкладок.
export function TabbedContent({ sections }: { sections: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && sections.some(s => s.id === hash)) setActive(hash);
    };
    apply();
    // Ссылки внутри страницы («перейти в подвкладку») меняют только якорь.
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Все панели рендерятся всегда; неактивные скрыты через CSS.
  // При печати CSS раскрывает их все - так в PDF попадает вся вкладка целиком.
  return (
    <>
      <div className="section-tabs no-print">
        {sections.map(s => (
          <button key={s.id} type="button" onClick={() => setActive(s.id)}
            className={"section-tab" + (active === s.id ? " active" : "")}>
            {s.label}
          </button>
        ))}
      </div>
      {sections.map(s => (
        <div key={s.id} className={"tab-panel" + (active === s.id ? " is-active" : "")}>
          <div className="print-only tab-print-title">{s.label}</div>
          {s.content}
        </div>
      ))}
    </>
  );
}

// Кнопка печати / экспорта вкладки в PDF (через диалог печати браузера).
export function PrintButton() {
  return (
    <button type="button" className="print-btn no-print" onClick={() => window.print()}
      title="Открыть диалог печати (можно сохранить как PDF)">
      Печать / PDF
    </button>
  );
}

// Сворачиваемый блок: в свёрнутом виде показывает только заголовок (и опционально первые N строк).
// printCollapsed – при печати блок остаётся свёрнутым: на листе только заголовок с подписью.
export function Collapsible({ title, subtitle, children, defaultOpen = false, preview, printCollapsed = false }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean; preview?: React.ReactNode; printCollapsed?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={"collapsible" + (printCollapsed ? " print-collapsed" : "")}>
      <button type="button" className="collapsible-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className={"collapsible-chev" + (open ? " open" : "")}>›</span>
        <span className="collapsible-title">{title}</span>
        {subtitle ? <span className="collapsible-sub">{subtitle}</span> : null}
        <span className="collapsible-action">{open ? "Свернуть" : "Развернуть"}</span>
      </button>
      {preview ? <div className={"collapsible-preview" + (open ? " is-off" : "")}>{preview}</div> : null}
      <div className={"collapsible-body" + (open ? "" : " is-off")}>{children}</div>
    </div>
  );
}

// Столбики план/факт: пара столбиков вплотную, между категориями - отступ.
export function BarsPlanFact({ data, max, height = 230, unit }: {
  data: { label: string; plan: number | null; fact: number | null; note?: string }[];
  max: number; height?: number; unit?: string;
}) {
  const H = height - 76;
  const fmt = (v: number) => v.toLocaleString("ru", { maximumFractionDigits: 0 });
  const h = (v: number | null) => v != null ? Math.max(Math.round(v / max * H), 3) : 0;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: H + 30, width: "100%", justifyContent: "center" }}>
              {/* подпись стоит над своим столбиком; у плана она поднята выше, чтобы не наезжать на факт */}
              <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                <span className="bv bv-plan">{d.plan != null ? fmt(d.plan) : "–"}</span>
                <div title={d.plan != null ? `план${unit ? ", " + unit : ""}: ${fmt(d.plan)}` : "план не установлен"}
                  style={{ width: "100%", height: h(d.plan), background: "#D3C8B2", borderRadius: "3px 3px 0 0" }} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                <span className="bv bv-fact">{d.fact != null ? fmt(d.fact) : "–"}</span>
                <div title={d.fact != null ? `факт${unit ? ", " + unit : ""}: ${fmt(d.fact)}` : "факта пока нет"}
                  style={{ width: "100%", height: h(d.fact), background: "var(--teal)", borderRadius: "3px 3px 0 0" }} />
              </div>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--mut)", marginTop: 6, textAlign: "center", maxWidth: "100%", minHeight: 26, lineHeight: 1.2 }}>{d.label}</span>
            {d.note ? <span style={{ fontSize: 10.5, color: "var(--teal)", fontWeight: 700, marginTop: 2, textAlign: "center" }}>{d.note}</span> : null}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 18, fontSize: 12.5, color: "var(--mut)", marginTop: 10, flexWrap: "wrap" }}>
        <span><i style={{ display: "inline-block", width: 10, height: 10, background: "#D3C8B2", borderRadius: 2, marginRight: 5 }} />план{unit ? `, ${unit}` : ""}</span>
        <span><i style={{ display: "inline-block", width: 10, height: 10, background: "var(--teal)", borderRadius: 2, marginRight: 5 }} />факт{unit ? `, ${unit}` : ""}</span>
        <span className="dim">прочерк – показатель не установлен</span>
      </div>
    </div>
  );
}

// ---- Диаграмма Ганта («График проекта») ----
// Парсит дату в формате ДД.ММ.ГГГГ; возвращает null для незаданных дат ("–").
function parseRuDate(s: string): Date | null {
  if (!s || s === "–") return null;
  const parts = s.split(".");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

// "PIN-9.4" -> "pin-9-4" – якорь для ссылок с других вкладок (например, из карточки «Первое золото»).
function codeToId(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export type GanttItem = { code: string; name: string; days: number | null; start: string; end: string; key?: boolean; milestone?: string };
export type GanttSection = GanttItem & { sub: GanttItem[] };

export function GanttChart({ sections }: { sections: GanttSection[] }) {
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [highlight, setHighlight] = useState<string | null>(null);
  const toggle = (code: string) => setOpenSet(s => {
    const n = new Set(s);
    if (n.has(code)) n.delete(code); else n.add(code);
    return n;
  });

  // Переход по ссылке вида /cabinet/schedule#pin-9-4: раскрыть нужный раздел (в т.ч. если код
  // относится к подпункту внутри раздела) и прокрутить/подсветить именно эту строку.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const parent = sections.find(s => codeToId(s.code) === hash);
    if (parent) {
      setHighlight(hash);
    } else {
      const owner = sections.find(s => s.sub.some(x => codeToId(x.code) === hash));
      if (!owner) return;
      setOpenSet(s => new Set(s).add(owner.code));
      setHighlight(hash);
    }
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    const t2 = setTimeout(() => setHighlight(null), 2200);
    return () => { clearTimeout(t); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allDates: Date[] = [];
  sections.forEach(s => {
    [parseRuDate(s.start), parseRuDate(s.end)].forEach(d => { if (d) allDates.push(d); });
    s.sub.forEach(x => {
      [parseRuDate(x.start), parseRuDate(x.end)].forEach(d => { if (d) allDates.push(d); });
    });
  });
  const minTs = Math.min(...allDates.map(d => d.getTime()));
  const maxTs = Math.max(...allDates.map(d => d.getTime()));
  const minD = new Date(minTs), maxD = new Date(maxTs);
  const rMin = new Date(minD.getFullYear(), 0, 1);
  const rMax = new Date(maxD.getFullYear() + 1, 0, 1);
  const totalMs = rMax.getTime() - rMin.getTime();
  const pct = (d: Date) => ((d.getTime() - rMin.getTime()) / totalMs) * 100;

  const years: number[] = [];
  for (let y = rMin.getFullYear(); y < rMax.getFullYear(); y++) years.push(y);

  const today = new Date();
  const todayPct = today.getTime() >= rMin.getTime() && today.getTime() <= rMax.getTime() ? pct(today) : null;
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");

  return (
    <div className="gantt">
      <div className="gantt-head">
        <div className="gantt-label" />
        <div className="gantt-track gantt-track-head">
          {years.map((y, i) => {
            const left = pct(new Date(y, 0, 1));
            const width = pct(new Date(y + 1, 0, 1)) - left;
            return <div key={y} className="gantt-year" style={{ left: `${left}%`, width: `${width}%`, borderLeft: i === 0 ? "none" : undefined }}>{y}</div>;
          })}
        </div>
        <div className="gantt-dates" />
      </div>

      {sections.map(s => {
        const st = parseRuDate(s.start), en = parseRuDate(s.end);
        const open = openSet.has(s.code);
        const hasSub = s.sub.length > 0;
        const id = codeToId(s.code);
        return (
          <div key={s.code} id={id} className={"gantt-section" + (highlight === id ? " gantt-flash" : "")}>
            <div className="gantt-row">
              <button type="button" className="gantt-label gantt-toggle" onClick={() => hasSub && toggle(s.code)} disabled={!hasSub} aria-expanded={open}>
                {hasSub ? <span className={"collapsible-chev" + (open ? " open" : "")}>›</span> : <span style={{ width: 14, display: "inline-block", flex: "none" }} />}
                <span className="gantt-code">{s.code.replace("PIN-", "")}</span>
                <span className="gantt-name">{s.name}</span>
              </button>
              <div className="gantt-track">
                {st && en ? (
                  <div className={"gantt-bar" + (s.key ? " key" : "")}
                    style={{ left: `${pct(st)}%`, width: `${Math.max(pct(en) - pct(st), 0.5)}%` }}
                    title={`${s.start} – ${s.end}${s.days ? ` · ${s.days} дн.` : ""}`} />
                ) : null}
              </div>
              <div className="gantt-dates">{st && en ? `${s.start} – ${s.end}` : "–"}</div>
            </div>

            <div className={"gantt-sub-wrap" + (open ? "" : " is-off gantt-sub-screen")}>
            {open ? s.sub.map(x => {
              const xs = parseRuDate(x.start), xe = parseRuDate(x.end);
              const xid = codeToId(x.code);
              return (
                <div key={x.code} id={xid} className={"gantt-row gantt-row-sub" + (highlight === xid ? " gantt-flash" : "")}>
                  <div className="gantt-label">
                    <span className="gantt-code">{x.code.replace("PIN-", "")}</span>
                    <span className="gantt-name">{x.name}</span>
                  </div>
                  <div className="gantt-track">
                    {xs && xe ? (
                      <div className={"gantt-bar sub" + (x.key ? " key" : "")}
                        style={{ left: `${pct(xs)}%`, width: `${Math.max(pct(xe) - pct(xs), 0.5)}%` }}
                        title={`${x.start} – ${x.end}${x.days ? ` · ${x.days} дн.` : ""}`} />
                    ) : <span className="dim" style={{ fontSize: 11 }}>даты не заданы</span>}
                  </div>
                  <div className="gantt-dates">{xs && xe ? `${x.start} – ${x.end}` : "–"}</div>
                </div>
              );
            }) : null}
            {open ? s.sub.filter(x => x.milestone).map(x => (
              <div key={x.code + "-m"} className="gantt-milestone-note"><b>◆ {x.code.replace("PIN-", "")}:</b> {x.milestone}</div>
            )) : null}
            </div>
          </div>
        );
      })}

      {todayPct != null ? (
        <div className="gantt-today-overlay" title={`Сегодня · ${dd}.${mm}.${today.getFullYear()}`}>
          <div className="gantt-label" />
          <div className="gantt-track"><div className="gantt-today" style={{ left: `${todayPct}%` }} /></div>
          <div className="gantt-dates" />
        </div>
      ) : null}
    </div>
  );
}

// Склонение существительного после числа: 1 вопрос, 2 вопроса, 5 вопросов.
export function plural(n: number, forms: [string, string, string]) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

// Таблица с предпросмотром: показывает первые N строк, остальные раскрываются по кнопке.
export function PreviewTable({ head, rows, preview = 5, noun = ["строка", "строки", "строк"] }: {
  head: React.ReactNode; rows: React.ReactNode[]; preview?: number; noun?: [string, string, string];
}) {
  const [open, setOpen] = useState(false);
  const hidden = rows.length - preview;
  // Скрытые строки остаются в DOM во втором tbody: на экране они спрятаны, при печати видны.
  return (
    <>
      <table>
        <tbody>
          {head}
          {rows.slice(0, preview)}
        </tbody>
        {hidden > 0 ? <tbody className={open ? "" : "pv-extra"}>{rows.slice(preview)}</tbody> : null}
      </table>
      {hidden > 0 ? (
        <button type="button" className="preview-more no-print" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          <span className={"collapsible-chev" + (open ? " open" : "")}>›</span>
          {open ? "Свернуть" : `Показать ещё ${hidden} ${plural(hidden, noun)}`}
        </button>
      ) : null}
    </>
  );
}

// Линейный график: ось X – подписи (годы), ось Y – значения; несколько серий, у точек подписи.
export function LineChart({ labels, series, unit, height = 190, factUntil }: {
  labels: string[];
  series: { name: string; color: string; values: (number | null)[] }[];
  unit?: string; height?: number;
  factUntil?: number; // индекс последней фактической точки: дальше линия пунктиром (план/прогноз)
}) {
  const W = 290, H = height, padL = 26, padR = 14, padT = 20, padB = 24;
  const all = series.flatMap(s => s.values.filter((v): v is number => v != null));
  const maxV = Math.max(...all) * 1.12, minV = 0;
  const x = (i: number) => padL + (i * (W - padL - padR)) / Math.max(1, labels.length - 1);
  const y = (v: number) => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const ticks = 4;
  const fmt = (v: number) => v.toLocaleString("ru", { maximumFractionDigits: 1 });
  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="none" role="img">
        {Array.from({ length: ticks + 1 }, (_, k) => {
          const v = minV + ((maxV - minV) * k) / ticks;
          return (
            <g key={k}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="rgba(120,95,60,.18)" strokeWidth="1" />
              <text x={padL - 5} y={y(v) + 3} textAnchor="end" fontSize="9.5" fill="#8A7A63">{Math.round(v)}</text>
            </g>
          );
        })}
        {labels.map((l, i) => (
          <text key={i} x={x(i)} y={H - 7} textAnchor="middle" fontSize="11" fill="#6B4A34">{l}</text>
        ))}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => (v != null ? [x(i), y(v)] : null)).filter(Boolean) as number[][];
          return (
            <g key={si}>
              {factUntil == null
                ? <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinejoin="round" />
                : <>
                    <polyline points={s.values.map((v, i) => (v != null && i <= factUntil ? `${x(i)},${y(v)}` : null)).filter(Boolean).join(" ")} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinejoin="round" />
                    <polyline points={s.values.map((v, i) => (v != null && i >= factUntil ? `${x(i)},${y(v)}` : null)).filter(Boolean).join(" ")} fill="none" stroke={s.color} strokeWidth="2.2" strokeDasharray="5 4" strokeLinejoin="round" />
                  </>}
              {s.values.map((v, i) => v != null ? (
                <g key={i}>
                  <circle cx={x(i)} cy={y(v)} r="3.6" fill={factUntil != null && i <= factUntil ? s.color : "#fff"} stroke={s.color} strokeWidth="2" />
                  <text x={x(i)} y={y(v) - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill={s.color}>{fmt(v)}</text>
                </g>
              ) : null)}
            </g>
          );
        })}
      </svg>
      <div className="line-legend">
        {series.map((s, i) => (
          <span key={i}><i style={{ background: s.color }} />{s.name}</span>
        ))}
        {unit ? <span className="dim">{unit}</span> : null}
      </div>
    </div>
  );
}
