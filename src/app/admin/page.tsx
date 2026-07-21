import Link from "next/link";
import { getGuiaData } from "@/lib/content";
import { serverClient } from "@/lib/db/supabase";
import { adminPassword } from "@/lib/admin/auth";
import type { ItemDecision } from "@/lib/types";
import { PrepararBancoForm } from "./_components/AdminForms";

export const dynamic = "force-dynamic";

// Painel inicial: o estado de tudo em linguagem simples + os atalhos de edição.

function richCount(decision: ItemDecision): number {
  return (["quandoUsar", "quandoNao", "erroComum", "efeito", "instalacao"] as const).filter((k) => decision?.[k])
    .length;
}

export default async function AdminPage() {
  const { categories, guide, pages, options } = await getGuiaData();

  const totalItems = categories.reduce((n, c) => n + c.items.length, 0);
  const comTexto = categories.reduce((n, c) => n + c.items.filter((i) => richCount(i.decision) > 0).length, 0);
  const reais = options.filter((o) => !o.exemplo).length;
  const exemplos = options.length - reais;
  const prontas = pages.filter((p) => p.ready).length;

  const escrita = Boolean(serverClient());
  const senha = Boolean(adminPassword());

  return (
    <div className="adm-wrap">
      <h1 className="adm-h">Painel de conteúdo</h1>
      <p className="adm-sub">
        Tudo que aparece no guia mora aqui: os textos, as categorias e o catálogo com fotos e preços. Nada é editado
        no código.
      </p>

      <div className="adm-cards">
        <div className="adm-card">
          <div className="k">Guia</div>
          <h3>{guide.name}</h3>
          <p>
            {guide.collection ?? "Collection Nº 01"} · {guide.tagline}
          </p>
        </div>
        <div className="adm-card">
          <div className="k">Páginas do guia</div>
          <div className="big">
            {prontas} de {pages.length}
          </div>
          <p>com texto oficial. As demais mostram o aviso de texto provisório.</p>
          <Link className="adm-go" href="/admin/paginas">
            Editar páginas →
          </Link>
        </div>
        <div className="adm-card">
          <div className="k">Catálogo de opções</div>
          <div className="big">{reais}</div>
          <p>
            opções reais cadastradas{exemplos ? ` (+ ${exemplos} exemplos para substituir)` : ""}. Fotos, nomes e
            preços, categoria por categoria.
          </p>
          <Link className="adm-go" href="/admin/catalogo">
            Editar catálogo →
          </Link>
        </div>
        <div className="adm-card">
          <div className="k">Textos das categorias</div>
          <div className="big">
            {comTexto} de {totalItems}
          </div>
          <p>itens com a decisão escrita (quando usar, erro comum, efeito…).</p>
          <Link className="adm-go" href="/admin/catalogo">
            Editar textos →
          </Link>
        </div>
      </div>

      <div className="adm-section">
        <h2>Estado do sistema</h2>
        <div className="adm-cat">
          <div className="adm-items">
            <span className={`it${senha ? " rich" : ""}`}>
              {senha ? "✓ Senha do painel definida" : "Senha do painel: falta definir QH_ADMIN_SENHA na Vercel"}
            </span>
            <span className={`it${escrita ? " rich" : ""}`}>
              {escrita
                ? "✓ Chave de gravação configurada"
                : "Gravação: falta a SUPABASE_SERVICE_ROLE_KEY na Vercel"}
            </span>
            <span className="it rich">✓ Leitura do guia no ar (com reserva local se o banco oscilar)</span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.7, margin: "10px 0 0" }}>
            Primeira vez editando? 1) Rode o arquivo <code>supabase/schema.sql</code> no SQL Editor do Supabase;
            2) defina as duas variáveis acima na Vercel; 3) toque em &quot;Preparar o banco&quot; aqui embaixo. Depois
            disso é só editar — cada salvamento já vale no guia.
          </p>
          <div style={{ marginTop: 12 }}>
            <PrepararBancoForm />
          </div>
        </div>
      </div>

      <div className="adm-section">
        <h2>Estrutura do guia</h2>
        {categories.map((c) => (
          <div className="adm-cat" key={c.id}>
            <div className="ch">
              <b>{c.name}</b>
              <span>{c.items.length} categorias</span>
            </div>
            <div className="adm-items">
              {c.items.map((i) => {
                const n = options.filter((o) => o.itemSlug === i.slug && !o.exemplo).length;
                const r = richCount(i.decision);
                return (
                  <Link
                    className={`it lk${n > 0 || r > 0 ? " rich" : ""}`}
                    key={i.slug}
                    href={`/admin/catalogo/${i.slug}`}
                    title="Abrir para editar"
                  >
                    {i.name}
                    {n > 0 ? ` · ${n} opções` : ""}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
