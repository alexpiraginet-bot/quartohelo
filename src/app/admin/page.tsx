import Link from "next/link";
import { dbReady, getCategories, getGuide, getSiteContent } from "@/lib/content";
import { TIER_LABEL } from "@/lib/types";
import type { ItemDecision } from "@/lib/types";

export const dynamic = "force-dynamic";

// Painel da Helô. Nesta fundação ele já lê a mesma camada de conteúdo do site
// (seed hoje, Supabase quando conectado) e mostra o estado real do backend e a
// estrutura inteira do guia. A edição gravável entra sobre esta base.

function richCount(decision: ItemDecision): number {
  return (["quandoUsar", "quandoNao", "erroComum", "efeito", "instalacao"] as const).filter((k) => decision?.[k])
    .length;
}

export default async function AdminPage() {
  const [categories, guide, site] = await Promise.all([getCategories(), getGuide(), getSiteContent()]);

  const totalItems = categories.reduce((n, c) => n + c.items.length, 0);
  const richItems = categories.reduce((n, c) => n + c.items.filter((i) => richCount(i.decision) > 0).length, 0);
  const suppliers = categories.reduce(
    (n, c) => n + c.items.reduce((m, i) => m + i.suppliers.length, 0),
    0,
  );
  const statusLabel: Record<string, string> = {
    rascunho: "Rascunho",
    lista_espera: "Lista de espera",
    a_venda: "À venda",
  };
  const price =
    guide.priceCents != null
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(guide.priceCents / 100)
      : "A definir";

  return (
    <div className="admin">
      <nav className="adm-nav">
        <span className="logo">
          <img src="/images/logo-horizontal.png" alt="Quarto da Helô" />
        </span>
        <span className="t">Painel</span>
        <Link href="/">Ver o site →</Link>
      </nav>

      <div className="adm-wrap">
        {dbReady ? (
          <div className="adm-state on">
            <b>Backend conectado.</b> O conteúdo abaixo vem do Supabase. As alterações que você fizer aqui passam a
            valer no site e no guia na hora.
          </div>
        ) : (
          <div className="adm-state off">
            <b>Rodando na estrutura inicial.</b> O site e o guia já funcionam com o conteúdo semente. Quando o Supabase
            for conectado (variáveis de ambiente no projeto), este mesmo painel passa a ler e gravar no banco, sem trocar
            nada no código.
          </div>
        )}

        <h1 className="adm-h">Painel de conteúdo</h1>
        <p className="adm-sub">Tudo que aparece no site e no guia mora aqui. Nada é editado no código.</p>

        <div className="adm-cards">
          <div className="adm-card">
            <div className="k">Guia</div>
            <h3>{guide.name}</h3>
            <p>{guide.tagline}</p>
          </div>
          <div className="adm-card">
            <div className="k">Situação do produto</div>
            <div className="big">{statusLabel[guide.status] ?? guide.status}</div>
            <p>Preço público: {price}</p>
          </div>
          <div className="adm-card">
            <div className="k">Categorias · Itens</div>
            <div className="big">
              {categories.length} · {totalItems}
            </div>
            <p>{richItems} com decisão curada de um total de {totalItems}.</p>
          </div>
          <div className="adm-card">
            <div className="k">Fornecedores cadastrados</div>
            <div className="big">{suppliers}</div>
            <p>
              Por faixa: {TIER_LABEL.acessivel}, {TIER_LABEL.medio}, {TIER_LABEL.alto}.
            </p>
          </div>
        </div>

        <div className="adm-section">
          <h2>Estrutura do guia</h2>
          {categories.map((c) => (
            <div className="adm-cat" key={c.id}>
              <div className="ch">
                <b>{c.name}</b>
                <span>{c.items.length} itens</span>
              </div>
              {c.intro ? <span style={{ color: "var(--muted)", fontSize: 13 }}>{c.intro}</span> : null}
              <div className="adm-items">
                {c.items.map((i) => {
                  const r = richCount(i.decision);
                  return (
                    <span className={`it${r > 0 ? " rich" : ""}`} key={i.id} title={r > 0 ? `${r}/5 campos de decisão` : "Sem decisão ainda"}>
                      {i.name}
                      {r > 0 ? ` · ${r}/5` : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="adm-section">
          <h2>Landing</h2>
          <div className="adm-cat">
            <div className="ch">
              <b>Blocos editáveis</b>
              <span>texto e chamadas da página</span>
            </div>
            <div className="adm-items">
              {[
                "Topo / herói",
                "Quem somos",
                "Como trabalhamos",
                `Serviços (${site.services.length})`,
                "Bloco do guia",
                "Contato",
                "Rodapé",
              ].map((b) => (
                <span className="it" key={b}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-section">
          <h2>Próximo passo</h2>
          <div className="adm-cat">
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              Com o Supabase conectado, cada card e cada item acima ganham edição direta: criar categorias, escrever as
              decisões, subir fotos, cadastrar fornecedores por faixa e ajustar preço e textos da landing. A jornada de
              cada cliente que comprar o guia fica registrada para você acompanhar as escolhas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
