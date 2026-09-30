import { redirect } from "next/navigation";

// «Техника» теперь подвкладка внутри «ГРР».
export default function EquipmentRedirect() {
  redirect("/cabinet/grr");
}
