"use client";
export default function LogoutButton() {
  async function out() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return <button onClick={out} className="no-print" style={{ fontSize: 12.5, color: "#6B4A34", background: "none", border: "1px solid #E5E7EB", borderRadius: 7, padding: "5px 11px" }}>Выйти</button>;
}
