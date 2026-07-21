import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";

/**
 * Proteção simples do painel: uma senha única (env QH_ADMIN_SENHA) vira um
 * cookie httpOnly. Sem a senha definida, o painel abre em modo visualização e
 * toda gravação fica bloqueada — nunca existe escrita aberta ao público.
 */

const COOKIE = "qh_admin";

export const adminPassword = (): string | null => process.env.QH_ADMIN_SENHA || null;

const token = (pw: string) => createHash("sha256").update(`qh-admin::${pw}`).digest("hex");

export function isAdminAuthed(): boolean {
  const pw = adminPassword();
  if (!pw) return false;
  return cookies().get(COOKIE)?.value === token(pw);
}

export function grantAdmin(pw: string): boolean {
  const real = adminPassword();
  if (!real || pw !== real) return false;
  cookies().set(COOKIE, token(real), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return true;
}

export function revokeAdmin() {
  cookies().delete(COOKIE);
}

/**
 * aberto     — sem QH_ADMIN_SENHA: visualização livre, gravação bloqueada.
 * bloqueado  — senha definida e sessão ainda não autenticada: pede a senha.
 * editor     — autenticada: edição liberada (gravação ainda exige a service key).
 */
export function adminMode(): "aberto" | "bloqueado" | "editor" {
  if (!adminPassword()) return "aberto";
  return isAdminAuthed() ? "editor" : "bloqueado";
}
