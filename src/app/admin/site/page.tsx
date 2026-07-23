import { getSiteContent } from "@/lib/content";
import { SiteEditor } from "../_components/SiteEditor";

export const dynamic = "force-dynamic";

export default async function SiteAdmin() {
  const s = await getSiteContent();
  return (
    <div className="adm-wrap">
      <h1 className="adm-h">Site (landing)</h1>
      <p className="adm-sub">
        A página inicial do site: hero, Sobre nós, Como trabalhamos, Contato e as páginas próprias
        (Curadoria Assinada, Projeto Conceito, Produto Digital). Edite o e-mail, as redes e os textos —
        tudo reflete na hora em quartohelo.vercel.app.
      </p>
      <SiteEditor content={s} />
    </div>
  );
}
