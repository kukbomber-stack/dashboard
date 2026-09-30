"use client";
import { useEffect, useState } from "react";

type Point = { date: string; usdRub: number; goldRubG: number };
type Rates = { date: string; usdRub: number; goldUsdOz: number | null; goldRubG: number; history: Point[]; fetchedAt: string };

// Маленький спарклайн-фон: ломаная линия по значениям, растянутая на всю ширину/высоту чипа.
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const w = 100, h = 100;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg className="rates-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Курс USD/RUB и цена золота в топбаре, с недельной мини-динамикой на фоне цифр.
// Подтягивается с сервера при заходе на страницу и затем перезапрашивается раз в 10 минут,
// пока вкладка открыта - без пересборки и передеплоя.
export default function RatesTicker() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/rates")
        .then(r => (r.ok ? r.json() : Promise.reject()))
        .then(d => { if (alive) { setRates(d); setFailed(false); } })
        .catch(() => { if (alive) setFailed(true); });
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (failed && !rates) return null;
  if (!rates) return <span className="rates-ticker dim">курс…</span>;

  const t = new Date(rates.fetchedAt);
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  const usdHist = rates.history.map(p => p.usdRub);
  const goldHist = rates.history.map(p => p.goldRubG);
  const span = rates.history.length > 1 ? `${rates.history[0].date} – ${rates.date}` : rates.date;

  return (
    <span className="rates-ticker">
      <i className="rates-dot" />
      <span className="rates-chip" title={`Курс USD/RUB, динамика ${span}`}>
        <Sparkline values={usdHist} color="#5C7A3A" />
        <span className="rates-txt">$ {rates.usdRub.toLocaleString("ru")} ₽</span>
      </span>
      <span className="rates-sep">·</span>
      <span className="rates-chip"
        title={`Золото${rates.goldUsdOz ? `: $${rates.goldUsdOz.toLocaleString("ru")} за унцию` : ""}, динамика ${span}. Обновлено в браузере ${hh}:${mm}.`}>
        <Sparkline values={goldHist} color="#C08752" />
        <span className="rates-txt">Au {rates.goldRubG.toLocaleString("ru")} ₽/г</span>
      </span>
    </span>
  );
}
