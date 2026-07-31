import { notFound } from "next/navigation";
import { adminMode } from "@/lib/admin/auth";
import { getSitePreview } from "@/lib/content";
import { LandingView } from "../_components/LandingView";
import { PreviewBar, PreviewVazio } from "../_components/PreviewBar";

export const dynamic = "force-dynamic";

/* Ensaio da landing: mostra o que a Helô acabou de editar, ainda sem salvar.
 * Só abre com sessão do painel — para quem não está logado esta rota não
 * existe. O conteúdo publicado não é lido nem tocado aqui. */

export default async function PreVisualizarLanding() {
  if (adminMode() === "bloqueado") notFound();
  const s = await getSitePreview();
  return (
    <div className="prev-page">
      <PreviewBar voltarPara="/admin/site" o="a landing" />
      {s ? <LandingView s={s} preview /> : <PreviewVazio voltarPara="/admin/site" />}
    </div>
  );
}
