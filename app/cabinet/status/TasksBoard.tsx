"use client";
import { useState, useEffect } from "react";
import { plural } from "@/components/ui";

import type { Task } from "@/lib/data";

export default function TasksBoard({ tasks }: { tasks: Task[] }) {
  // Статус хранится в браузере (localStorage), поэтому отметки переживают перезагрузку страницы.
  const KEY = "ppr-tasks-done";
  const [done, setDone] = useState<number[]>([]);
  const [cat, setCat] = useState("Все");
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<"work" | "done" | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDone(parsed);
        window.dispatchEvent(new CustomEvent("ppr-tasks-changed", { detail: parsed }));
      }
    } catch { /* localStorage может быть недоступен */ }
  }, []);

  const save = (next: number[]) => {
    setDone(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* игнорируем */ }
    // счётчики наверху страницы слушают это событие
    window.dispatchEvent(new CustomEvent("ppr-tasks-changed", { detail: next }));
  };

  const cats = ["Все", ...Array.from(new Set(tasks.map(t => t.cat)))];
  const active = tasks.filter(t => !done.includes(t.n));
  const finished = tasks.filter(t => done.includes(t.n));
  const filtered = cat === "Все" ? active : active.filter(t => t.cat === cat);
  const PREVIEW = 3;
  const shown = showAll ? filtered : filtered.slice(0, PREVIEW);
  const hidden = filtered.length - shown.length;

  const move = (n: number, toDone: boolean) =>
    save(toDone ? (done.includes(n) ? done : [...done, n]) : done.filter(x => x !== n));

  const drop = (zone: "work" | "done") => {
    if (drag != null) move(drag, zone === "done");
    setDrag(null); setOver(null);
  };

  // Квадратик-отметка: пустой у задач в работе, с галочкой у выполненных.
  // Клик по нему переносит задачу между колонками.
  const check = (t: Task, isDone: boolean) => (
    <button type="button" className={"task-check no-print" + (isDone ? " is-on" : "")}
      onClick={() => move(t.n, !isDone)} aria-pressed={isDone}
      aria-label={isDone ? `Вернуть в работу: ${t.topic}` : `Отметить выполненной: ${t.topic}`}
      title={isDone ? "Снять отметку и вернуть в работу" : "Отметить выполненной"}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6" /></svg>
    </button>
  );

  const card = (t: Task, isDone: boolean) => isDone ? (
    // Выполненная задача – компактная строка: отметка и название
    <div key={t.n} className={"task-card is-done" + (drag === t.n ? " is-dragging" : "")}
      draggable onDragStart={() => setDrag(t.n)} onDragEnd={() => { setDrag(null); setOver(null); }}>
      <div className="task-head">
        {check(t, true)}
        <b><span className="task-num">{t.num}</span>{t.topic}</b>
      </div>
    </div>
  ) : (
    // Задача в работе: первая строка – заголовок и тип, вторая – суть, исполнитель и срок
    <div key={t.n} className={"task-card task-wide" + (drag === t.n ? " is-dragging" : "")}
      draggable onDragStart={() => setDrag(t.n)} onDragEnd={() => { setDrag(null); setOver(null); }}>
      <div className="task-head">
        {check(t, false)}
        <b><span className="task-num">{t.num}</span>{t.topic}</b>
        {t.src ? <span className="chip c-open task-src" title="Источник поручения">{t.src}</span> : null}
        <span className="chip c-due">{t.cat}</span>
      </div>
      <div className="task-line2">
        <span className="task-body">{t.t}{t.sub ? <ul className="task-sub">{t.sub.map((x, i) => <li key={i}>{x}</li>)}</ul> : null}</span>
        <span className="task-who">{t.who}{t.approve ? <i className="task-approve">согласование: {t.approve}</i> : null}</span>
        <span className="task-due">{t.due}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="section-tabs no-print" style={{ marginBottom: 10 }}>
        {cats.map(c => (
          <button key={c} type="button" onClick={() => setCat(c)}
            className={"section-tab" + (c === cat ? " active" : "")}>
            {c} · {c === "Все" ? active.length : active.filter(t => t.cat === c).length}
          </button>
        ))}
      </div>
      <p className="plain no-print" style={{ marginTop: 0 }}>Отметьте квадратик у задачи, чтобы перенести её в «Выполнено»; повторный клик возвращает задачу в работу.</p>

      <div className="board-work">
        <div className={"board-col" + (over === "work" ? " is-over" : "")}
          onDragOver={e => { e.preventDefault(); setOver("work"); }}
          onDragLeave={() => setOver(null)}
          onDrop={() => drop("work")}>
          <div className="board-head">В работе <span>{filtered.length}</span></div>
          {filtered.length ? filtered.map((t, i) => (showAll || i < PREVIEW) ? card(t, false) : <div key={t.n} className="task-extra">{card(t, false)}</div>)
            : <div className="board-empty">Нет задач в этой категории</div>}
          {hidden > 0 || showAll ? (
            <button type="button" className="preview-more no-print" onClick={() => setShowAll(v => !v)} aria-expanded={showAll}>
              <span className={"collapsible-chev" + (showAll ? " open" : "")}>›</span>
              {showAll ? "Свернуть" : `Показать ещё ${hidden} ${plural(hidden, ["задачу", "задачи", "задач"])}`}
            </button>
          ) : null}
        </div>
      </div>

      {/* Скрытая таблица для выгрузки в Excel: все задачи с текущими отметками, на экран и печать не идёт */}
      <table className="export-only" data-sheet="Задачи РГ">
        <tbody>
          <tr><th>№</th><th>Тема</th><th>Категория</th><th>Источник</th><th>Содержание</th><th>Ответственные</th><th>Согласование</th><th>Срок</th><th>Статус</th></tr>
          {tasks.map(t => (
            <tr key={t.n}>
              <td>{t.num}</td><td>{t.topic}</td><td>{t.cat}</td><td>{t.src ?? "протокол РГ"}</td>
              <td>{t.t}{t.sub ? " " + t.sub.map((x, i) => `${i + 1}) ${x}`).join("; ") : ""}</td>
              <td>{t.who}</td><td>{t.approve ?? ""}</td><td>{t.due}</td>
              <td>{done.includes(t.n) ? "Выполнено" : t.st}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* «Выполнено» скрыта по умолчанию; при перетаскивании раскрывается сама */}
      <div className={"done-zone no-print" + (over === "done" ? " is-over" : "")}
        onDragOver={e => { e.preventDefault(); setOver("done"); setShowDone(true); }}
        onDragLeave={() => setOver(null)}
        onDrop={() => drop("done")}>
        <button type="button" className="done-head no-print" onClick={() => setShowDone(v => !v)} aria-expanded={showDone}>
          <span className={"collapsible-chev" + (showDone ? " open" : "")}>›</span>
          <span className="collapsible-title">Выполнено</span>
          <span className="done-count">{finished.length}</span>
          <span className="collapsible-action">{showDone ? "Свернуть" : "Развернуть"}</span>
        </button>
        {showDone ? (
          <div className="done-body">
            {finished.length ? <div className="done-list">{finished.map(t => card(t, true))}</div>
              : <div className="board-empty">Отметьте квадратик у закрытой задачи или перетащите её сюда</div>}
            <div className="board-drop">перенести сюда</div>
          </div>
        ) : null}
      </div>
    </>
  );
}
