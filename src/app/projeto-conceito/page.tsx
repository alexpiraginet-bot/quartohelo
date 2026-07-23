import { getSiteContent } from "@/lib/content";
import { PageShell } from "../_components/PageShell";
import type { SitePage } from "@/lib/types";

export const dynamic = "force-dynamic";

const FALLBACK: SitePage = { eyebrow: "Como trabalhamos", title: "Projeto Conceito", paragraphs: [] };

export default async function Page() {
  const s = await getSiteContent();
  return <PageShell page={s.projetoPage ?? FALLBACK} whatsappHref={s.whatsappHref} footerTagline={s.footerTagline} />;
}
