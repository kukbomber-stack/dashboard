import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.CABINET_PASSWORD || "PPRGold2026";
  if (password === expected) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, "ok", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
