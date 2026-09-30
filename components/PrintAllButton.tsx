"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Дополнительная опция: печать всего дашборда одним документом.
export default function PrintAllButton() {
  const path = usePathname();
  if (path === "/cabinet/print-all") return null;
  return <Link href="/cabinet/print-all" className="btn-ghost no-print" title="Собрать все разделы в один документ для печати">Печать всего</Link>;
}
