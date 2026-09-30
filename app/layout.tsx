import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Кабинет ППР – Пинигинский проект", template: "%s · Кабинет ППР" },
  description: "Внутренний ресурс проекта «Пинигинское»",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru"><body>{children}</body></html>
  );
}
