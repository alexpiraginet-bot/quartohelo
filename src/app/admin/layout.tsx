import Link from "next/link";
import { adminMode } from "@/lib/admin/auth";
import { LoginForm } from "./_components/AdminForms";
import { sairDoPainel } from "./actions";

export const dynamic = "force-dynamic";

// Portão do painel: sem sessão, mostra o login; com sessão, o painel completo.
// A senha é verificada no banco pela Edge Function — não depende de env na Vercel.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (adminMode() === "bloqueado") {
    return (
      <div className="admin center">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="admin">
      <nav className="adm-nav">
        <span className="logo">
          <img src="/images/logo-horizontal.png" alt="Quarto da Helô" />
        </span>
        <span className="t">Painel</span>
        <div className="adm-links">
          <Link href="/admin">Início</Link>
          <Link href="/admin/paginas">Páginas do guia</Link>
          <Link href="/admin/catalogo">Catálogo</Link>
          <Link href="/admin/analytics">Acessos</Link>
        </div>
        <div className="adm-right">
          <Link href="/guia">Ver o guia →</Link>
          <form action={sairDoPainel}>
            <button type="submit" className="adm-sair">
              Sair
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
