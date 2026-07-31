import { notFound } from "next/navigation";
import { adminMode } from "@/lib/admin/auth";
import { getGuiaData, getPagePreview } from "@/lib/content";
import { seedGuestProfile } from "@/data/seed";
import GuiaApp from "@/app/guia/GuiaApp";
import { PreviewBar, PreviewVazio } from "@/app/_components/PreviewBar";

export const dynamic = "force-dynamic";

/* Ensaio de uma página do guia: o guia inteiro, com a página que a Helô está
 * editando no lugar da publicada, já aberta. Só com sessão do painel. */

export default async function PreVisualizarGuia() {
  if (adminMode() === "bloqueado") notFound();
  const previa = await getPagePreview();
  const voltar = previa ? `/admin/paginas/${previa.slug}` : "/admin/paginas";
  if (!previa) {
    return (
      <div className="prev-page">
        <PreviewBar voltarPara={voltar} o="a página" />
        <PreviewVazio voltarPara={voltar} />
      </div>
    );
  }
  const { categories, guide, pages, options } = await getGuiaData();
  // Substitui a página publicada pela versão em edição (ou acrescenta, se for
  // uma página que ainda não existe no guia).
  const comPrevia = pages.some((p) => p.slug === previa.slug)
    ? pages.map((p) => (p.slug === previa.slug ? { ...p, ...previa } : p))
    : [...pages, previa].sort((a, b) => a.order - b.order);
  return (
    <div className="prev-page">
      <PreviewBar voltarPara={voltar} o="a página" />
      <GuiaApp
        categories={categories}
        guide={guide}
        pages={comPrevia}
        options={options}
        profile={seedGuestProfile}
        previewSlug={previa.slug}
      />
    </div>
  );
}
