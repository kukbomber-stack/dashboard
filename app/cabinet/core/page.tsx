import { redirect } from "next/navigation";

// «Пробоподготовка и аналитика» теперь подвкладка внутри «ГРР».
export default function CoreRedirect() {
  redirect("/cabinet/grr");
}
