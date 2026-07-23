import Link from "next/link";
import { getSiteContent } from "@/lib/content";
import { PageShell } from "../_components/PageShell";
import type { SitePage } from "@/lib/types";

export const dynamic = "force-dynamic";

const FALLBACK: SitePage = { eyebrow: "Produto digital", title: "O Fim da Dúvida", paragraphs: [] };

export default async function Page() {
  const s = await getSiteContent();
  return (
    <PageShell page={s.digitalPage ?? FALLBACK} whatsappHref={s.whatsappHref} footerTagline={s.footerTagline}>
      <div className="lpage-cta">
        <Link className="btn primary" href="/guia">Entrar no guia</Link>
      </div>
    </PageShell>
  );
}
