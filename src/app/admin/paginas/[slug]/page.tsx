import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuiaData } from "@/lib/content";
import { CardGuiaForm, PaginaForm } from "../../_components/AdminForms";

export const dynamic = "force-dynamic";

export default async function PaginaAdmin({ params }: { params: { slug: string } }) {
  const { pages, guide } = await getGuiaData();
  const page = pages.find((p) => p.slug === params.slug);
  if (!page) notFound();
  return (
    <div className="adm-wrap">
      <Link className="adm-back" href="/admin/paginas">
        ← Páginas do guia
      </Link>
      <h1 className="adm-h">{page.title}</h1>
      <p className="adm-sub">
        O que você salvar aqui aparece na hora no guia, na aba &quot;{page.title.split(" — ")[0]}&quot;.
      </p>
      <div className="adm-cat">
        <PaginaForm page={page} />
      </div>
      {/* O card "Prefere que a gente cuide de tudo?" aparece nesta tela do guia,
          então ele fica aqui também, e não só na home do painel. */}
      {page.slug === "meu-projeto" ? (
        <div className="adm-cat">
          <CardGuiaForm guide={guide} />
        </div>
      ) : null}
    </div>
  );
}
