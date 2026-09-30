import { NextResponse } from "next/server";

// Курс USD/RUB и цена золота (XAU) + недельная история для мини-графика.
// Источник - открытый бесплатный API без ключа (fawazahmed0/currency-api, CDN jsDelivr),
// обновляется у источника ежедневно. "Сегодня" кэшируем на 10 минут, прошлые даты - на
// 12 часов (они неизменны, но перепроверяем на случай, если источник досчитал день позже).
export const dynamic = "force-dynamic";

const GRAMS_PER_OZ = 31.1034768;
const HISTORY_DAYS = 7;

function urlFor(date: string) {
  return `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`;
}
function fallbackUrlFor(date: string) {
  return `https://${date}.currency-api.pages.dev/v1/currencies/usd.json`;
}

async function fetchDay(date: string, revalidate: number) {
  for (const url of [urlFor(date), fallbackUrlFor(date)]) {
    try {
      const res = await fetch(url, { next: { revalidate } });
      if (res.ok) return res.json();
    } catch {
      // пробуем следующий источник
    }
  }
  return null;
}

function toPoint(data: any) {
  const usd = data?.usd;
  if (!usd?.rub || !usd?.xau) return null;
  const usdRub = usd.rub as number;
  const goldUsdOz = 1 / (usd.xau as number);
  const goldRubG = (goldUsdOz / GRAMS_PER_OZ) * usdRub;
  return { date: data.date as string, usdRub: +usdRub.toFixed(2), goldRubG: Math.round(goldRubG) };
}

export async function GET() {
  try {
    const today = await fetchDay("latest", 600);
    const current = toPoint(today);
    if (!current) throw new Error("нет нужных полей в ответе источника");

    // История за последние дни (по датам, помимо "latest") - для мини-графика в топбаре.
    const dates: string[] = [];
    for (let i = HISTORY_DAYS; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const pastDays = await Promise.all(dates.map(d => fetchDay(d, 43200)));
    const history = pastDays
      .map(toPoint)
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .filter(p => p.date !== current.date);
    history.push(current);

    const goldUsdOz = history.length ? +(1 / (today!.usd.xau as number)).toFixed(2) : null;

    return NextResponse.json({
      date: current.date,
      usdRub: current.usdRub,
      goldUsdOz,
      goldRubG: current.goldRubG,
      history,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: "источник курсов недоступен" }, { status: 502 });
  }
}
