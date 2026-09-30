import { redirect } from "next/navigation";

// Вкладка «Неделя» объединена с «Бурением» (сентябрь 2026). Оставляем редирект,
// чтобы старые ссылки/закладки не вели в никуда.
export default function WeekRedirect() {
  redirect("/cabinet/drilling");
}
