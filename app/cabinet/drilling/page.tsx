import { redirect } from "next/navigation";

// «Бурение» теперь подвкладка внутри «ГРР».
export default function DrillingRedirect() {
  redirect("/cabinet/grr");
}
