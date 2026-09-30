"use client";
import { useEffect } from "react";

// Альбомная ориентация при печати страницы (без масштабирования под один лист).
export default function PrintLandscape() {
  useEffect(() => {
    const st = document.createElement("style");
    st.textContent = "@page{size:A4 landscape;margin:10mm}";
    document.head.appendChild(st);
    return () => { st.remove(); };
  }, []);
  return null;
}
