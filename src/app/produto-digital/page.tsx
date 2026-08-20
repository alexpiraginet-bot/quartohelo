import { getSiteContent } from "@/lib/content";
import { WA_MSG } from "@/lib/whatsapp";
import { PageShell } from "../_components/PageShell";
import type { SitePage } from "@/lib/types";

export const dynamic = "force-dynamic";

const FALLBACK: SitePage = { eyebrow: "Produto digital", title: "O Fim da Dúvida", paragraphs: [] };

export default async function Page() {
  const s = await getSiteContent();
  return (
    <PageShell page={s.digitalPage ?? FALLBACK} whatsapp={s.whatsapp} waMessage={WA_MSG.guia} footerTagline={s.footerTagline}>
      <div className="lpage-cta">
        {/* O botão "Entrar no guia" sai enquanto o guia não abre. Quando abrir,
            volta um <Link className="btn primary" href="/guia"> aqui. */}
        <span className="lpage-soon">Em breve</span>
      </div>
    </PageShell>
  );
}
