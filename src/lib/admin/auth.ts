import "server-only";
import { cookies } from "next/headers";

/**
 * Sessão do painel. A senha mora no banco (qh_admin_config) e é verificada pela
 * Edge Function qh-admin, que devolve um token. Guardamos esse token num cookie
 * httpOnly; toda gravação reenvia o token para a função, que é a fonte da
 * verdade. Não há mais senha em variável de ambiente — o login sempre aparece.
 */

const COOKIE = "qh_admin_tk";

export function adminToken(): string | null {
  return cookies().get(COOKIE)?.value ?? null;
}

export function setAdminSession(token: string) {
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function clearAdminSession() {
  cookies().delete(COOKIE);
}

/** bloqueado = sem sessão (mostra login); editor = com sessão (edita). */
export function adminMode(): "bloqueado" | "editor" {
  return adminToken() ? "editor" : "bloqueado";
}
