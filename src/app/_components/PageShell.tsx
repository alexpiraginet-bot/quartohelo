import Link from "next/link";
import { SiteNav } from "./SiteNav";
import { waHref, WA_MSG } from "@/lib/whatsapp";
import type { ServiceCard, SitePage } from "@/lib/types";

const WA = "M12 3.5a8.4 8.4 0 0 0-7.2 12.7L4 20.5l4.4-1.1A8.4 8.4 0 1 0 12 3.5Zm4.8 11.9c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1Z";

// Nunca mostrar frase operacional ao visitante — se o texto próprio ainda não
// foi preenchido (ou é um resíduo de placeholder), montamos um resumo útil a
// partir do card do serviço da landing (dados que já existem, sem inventar).
const PLACEHOLDER = /em breve|preenche esta p[áa]gina/i;

/** Casca das páginas próprias (Curadoria Assinada, Projeto Conceito, Produto
 *  Digital): mesma navegação da landing + conteúdo editável da página. Quando a
 *  página não tem texto próprio, cai num resumo do card (`card`). */
export function PageShell({
  page,
  card,
  whatsapp,
  waMessage,
  footerTagline,
  children,
}: {
  page: SitePage;
  card?: ServiceCard | null;
  whatsapp?: string | null;
  waMessage?: string | null;
  footerTagline?: string | null;
  children?: React.ReactNode;
}) {
  const realParas = (page.paragraphs ?? []).filter((p) => p.trim() && !PLACEHOLDER.test(p));
  const useFallback = realParas.length === 0 && !!card;
  const wa = waHref(whatsapp, waMessage ?? WA_MSG.geral);
  return (
    <div className="land2 lpage-wrap">
      <SiteNav />
      <main className="lpage" id="top">
        <div className="lpage-crest" aria-hidden="true"><img src="/images/brasao-creme.png" alt="" /></div>
        <div className="lwrap lpage-in">
          {page.eyebrow ? <div className="eyebrow">{page.eyebrow}</div> : null}
          <h1 className="serif lpage-h1">{page.title}</h1>
          {useFallback ? (
            <>
              {card?.desc ? <p className="lead">{card.desc}</p> : null}
              {card?.bullets?.length ? (
                <ul className="lpage-list">{card.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              ) : null}
              {card?.foot ? <p className="lpage-note">{card.foot}</p> : null}
              {wa ? (
                <div className="lpage-cta">
                  <a className="btn primary" href={wa} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
                </div>
              ) : null}
            </>
          ) : (
            realParas.map((p, i) => <p className="lead" key={i}>{p}</p>)
          )}
          {children}
          <Link className="lback" href="/#servicos">← Voltar</Link>
        </div>
      </main>
      <footer className="lfoot">
        <div className="lwrap foot-row">
          <span className="logo"><img src="/images/logo-horizontal.png" alt="Quarto da Helô" /></span>
          <span>{footerTagline}</span>
        </div>
      </footer>
      {wa ? (
        <a className="wa-fab" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WA} /></svg>
        </a>
      ) : null}
    </div>
  );
}
