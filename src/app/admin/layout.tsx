import Link from "next/link";
import { adminMode } from "@/lib/admin/auth";
import { LoginForm } from "./_components/AdminForms";
import { sairDoPainel } from "./actions";

export const dynamic = "force-dynamic";

// Portão do painel: com senha definida e sessão ativa, edita; sem sessão, pede
// a senha; sem senha definida, abre só em modo visualização (gravação bloqueada).

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const mode = adminMode();

  if (mode === "bloqueado") {
    return <div className="admin center">{<LoginForm />}</div>;
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
          {mode === "editor" ? (
            <form action={sairDoPainel}>
              <button type="submit" className="adm-sair">
                Sair
              </button>
            </form>
          ) : null}
        </div>
      </nav>
      {mode === "aberto" ? (
        <div className="adm-wrap" style={{ paddingBottom: 0 }}>
          <div className="adm-state off">
            <b>Modo visualização.</b> Para liberar a edição com segurança, defina a senha do painel
            (variável <code>QH_ADMIN_SENHA</code>) na Vercel. Sem ela, nada pode ser gravado.
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
