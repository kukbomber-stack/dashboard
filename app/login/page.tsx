"use client";
import { useState } from "react";

export default function Login() {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false); const [show, setShow] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) window.location.href = "/cabinet";
    else setErr(true);
  }
  return (
    <div style={{
      minHeight: "100vh", display: "grid", placeItems: "center", padding: 20,
      background: "linear-gradient(180deg, rgba(20,13,7,0.15), rgba(10,8,6,0.35)), url('/bg-texture.jpg') center/cover no-repeat fixed",
      backgroundColor: "#171310",
    }}>
      <div style={{
        width: "100%", maxWidth: 420, padding: "36px 32px 28px",
        background: "rgba(255,255,255,0.82)", backdropFilter: "blur(26px) saturate(150%)", WebkitBackdropFilter: "blur(26px) saturate(150%)",
        border: "1px solid rgba(255,255,255,0.65)", borderRadius: 22,
        boxShadow: "0 10px 34px rgba(20,12,4,0.28), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img src="/logo-mark-fill.png" alt="Пинигино" style={{ width: 112, height: 112, borderRadius: "50%", marginBottom: 14 }} />
          <div style={{ fontWeight: 700, fontSize: 17 }}>Кабинет ППР</div>
          <div style={{ fontSize: 12.5, color: "#5A1F20" }}>УК «Приоритет Природные Ресурсы»</div>
        </div>
        <h1 style={{ fontSize: 26, marginBottom: 22 }}>Вход в кабинет проекта</h1>
        <form onSubmit={submit}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#5A1F20", letterSpacing: .3 }}>ПАРОЛЬ</label>
          <div style={{ position: "relative", margin: "7px 0 4px" }}>
            <input type={show ? "text" : "password"} value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
              autoFocus style={{ width: "100%", padding: "13px 44px 13px 14px", fontSize: 15, border: "1px solid " + (err ? "#B42318" : "#D1D5DB"), borderRadius: 10, outline: "none" }} />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 6, top: 6, bottom: 6, width: 34, border: "none", background: "none", color: "#8A6B52" }} aria-label="Показать пароль">{show ? "H" : "O"}</button>
          </div>
          <p style={{ color: "#5A1F20", fontSize: 13, fontWeight: 600, margin: "8px 0 4px" }}>Внутренний ресурс проекта «Пинигинское».<br />Доступ для сотрудников УК ППР.</p>
          {err ? <div style={{ color: "#7A2E2E", fontSize: 13, marginBottom: 8 }}>Неверный пароль</div> : null}
          <button type="submit" style={{ width: "100%", marginTop: 14, padding: "13px", background: "#211710", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600 }}>Войти</button>
        </form>
      </div>
    </div>
  );
}
