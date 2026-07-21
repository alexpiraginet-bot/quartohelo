import Link from "next/link";
import { getGuiaData } from "@/lib/content";
import type { ItemDecision } from "@/lib/types";

export const dynamic = "force-dynamic";

function richCount(decision: ItemDecision): number {
  return (["quandoUsar", "quandoNao", "erroComum", "efeito", "instalacao"] as const).filter((k) => decision?.[k])
    .length;
}

export default async function CatalogoAdmin() {
  const { categories, options } = await getGuiaData();
  return (
    <div className="adm-wrap">
      <h1 className="adm-h">Catálogo por categoria</h1>
      <p className="adm-sub">
        Abra uma categoria para editar os textos da decisão e as opções de cada faixa (foto, nome, preço, link) —
        por variação: menina, neutro e menino. Pode preencher aos poucos: o guia mostra &quot;Em curadoria&quot; no
        que ainda não existe.
      </p>
      {categories.map((c) => (
        <div className="adm-section" key={c.id}>
          <h2>{c.name}</h2>
          <div className="adm-cards three">
            {c.items.map((i) => {
              const reais = options.filter((o) => o.itemSlug === i.slug && !o.exemplo).length;
              const ex = options.filter((o) => o.itemSlug === i.slug && o.exemplo).length;
              const r = richCount(i.decision);
              return (
                <Link className="adm-card lk" key={i.slug} href={`/admin/catalogo/${i.slug}`}>
                  <h3>{i.name}</h3>
                  <p>
                    {reais} {reais === 1 ? "opção real" : "opções reais"}
                    {ex ? ` · ${ex} exemplos` : ""} · textos {r}/5
                  </p>
                  <span className="adm-go">Editar →</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
