import Link from "next/link";
import { getGuiaData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PaginasAdmin() {
  const { pages } = await getGuiaData();
  return (
    <div className="adm-wrap">
      <h1 className="adm-h">Páginas do guia</h1>
      <p className="adm-sub">
        Os textos que aparecem no menu do guia (Sobre nós, Introdução, Antes de começar, Cronograma). Toque para
        editar; cole o texto oficial quando quiser e marque como oficial.
      </p>
      <div className="adm-cards">
        {pages.map((p) => (
          <Link className="adm-card lk" key={p.slug} href={`/admin/paginas/${p.slug}`}>
            <div className="k">{p.eyebrow ?? "Página"}</div>
            <h3>{p.title}</h3>
            <p>
              {p.ready ? "✓ Texto oficial" : "Texto provisório"} · {p.paragraphs.length}{" "}
              {p.paragraphs.length === 1 ? "parágrafo" : "parágrafos"}
            </p>
            <span className="adm-go">Editar →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
