import { cookies } from "next/headers";
const COOKIE = "ppr_auth";
export async function isAuthed() {
  const c = await cookies();
  return c.get(COOKIE)?.value === "ok";
}
export { COOKIE };
