"use client";
import { useEffect, useState } from "react";
import { Kpi, plural } from "@/components/ui";

// Счётчики «в работе» и «закрыто» берут те же отметки, что и доска задач,
// и обновляются сразу после переноса карточки (через событие ppr-tasks-changed).
export default function TasksCounters({ total }: { total: number }) {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    const read = () => {
      try {
        const saved = localStorage.getItem("ppr-tasks-done");
        setDone(saved ? JSON.parse(saved) : []);
      } catch { /* localStorage может быть недоступен */ }
    };
    read();
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<number[]>).detail;
      setDone(Array.isArray(d) ? d : []);
    };
    window.addEventListener("ppr-tasks-changed", onChange);
    window.addEventListener("storage", read);          // синхронизация между вкладками
    return () => {
      window.removeEventListener("ppr-tasks-changed", onChange);
      window.removeEventListener("storage", read);
    };
  }, []);

  const closed = done.length;
  const inWork = Math.max(total - closed, 0);

  return (
    <Kpi hl cap="Задач в работе" val={String(inWork)} unit={`из ${total}`}
      sub={closed ? `закрыто ${closed} ${plural(closed, ["задача", "задачи", "задач"])} · отмечено на доске ниже` : "поручения рабочей группы"} />
  );
}
