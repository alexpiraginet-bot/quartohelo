import Link from "next/link";
import { waHref, WA_MSG } from "@/lib/whatsapp";
import { LandingFx } from "./Interactive";
import { SiteNav } from "./SiteNav";
import { Track } from "./Track";
import { CardMediaBg, CardMediaTop, cardHasBg } from "./CardMedia";
import { Portfolio } from "./Portfolio";
import type { ServiceCard, SiteContent } from "@/lib/types";
import { DEFAULT_PAGE_OPACITY } from "@/lib/types";

/* A landing inteira, a partir de um SiteContent. A página pública passa o
 * conteúdo publicado; a tela de pré-visualização passa o que a Helô acabou de
 * editar, ainda sem salvar. Com preview, não registramos visita: o acesso é
 * dela mesma conferindo, e contaria como cliente no relatório de Acessos. */

const IG = "M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm5.2-.9a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0ZM7 3.5h10A3.5 3.5 0 0 1 20.5 7v10A3.5 3.5 0 0 1 17 20.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Z";
const WA = "M12 3.5a8.4 8.4 0 0 0-7.2 12.7L4 20.5l4.4-1.1A8.4 8.4 0 1 0 12 3.5Zm4.8 11.9c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1Z";

/** Aceita o Instagram do jeito que a Helô digitar: link completo, "@usuario"
 *  ou só o nome. Sempre devolve uma URL que abre o perfil (ou null se vazio). */
function igHref(v?: string | null): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.includes("instagram.com")) return `https://${t.replace(/^\/+/, "")}`;
  const handle = t.replace(/^@+/, "").replace(/^\/+/, "").trim();
  return handle ? `https://instagram.com/${handle}` : null;
}

/** Opacidade de foto de fundo escolhida no painel; sem escolha, o padrão. */
function photoOpacity(v?: number | null): number {
  return typeof v === "number" && v > 0 && v <= 1 ? v : DEFAULT_PAGE_OPACITY;
}

function Social({ d, href, label }: { d: string; href?: string | null; label: string }) {
  const svg = (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
  );
  if (!href) return <span className="soc off" aria-label={`${label} (em breve)`}>{svg}</span>;
  return <a className="soc" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>{svg}</a>;
}

function Card({ c }: { c: ServiceCard }) {
  return (
    <article className={`lcard rv${c.featured ? " feat" : ""}${cardHasBg(c.image) ? " has-bg" : ""}`}>
      <CardMediaBg image={c.image} />
      <CardMediaTop image={c.image} />
      <div className="tag">{c.tag}</div>
      <h3 className="serif">{c.title}</h3>
      <p className="desc">{c.desc}</p>
      {c.bullets?.length ? <ul>{c.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul> : null}
      {c.featured && c.featuredLabel ? <span className="plus">{c.featuredLabel}</span> : null}
      {c.foot ? <p className="foot">{c.foot}</p> : null}
      {c.ctaHref ? <Link className="btn ghost sm" href={c.ctaHref}>{c.ctaLabel ?? "Conheça mais"}</Link> : null}
    </article>
  );
}

export function LandingView({ s, preview = false }: { s: SiteContent; preview?: boolean }) {
  const cards: ServiceCard[] = [...s.services, ...(s.produtoDigital ? [s.produtoDigital] : [])];
  // WhatsApp: todos os links vêm do MESMO campo (s.whatsapp).
  const waMain = waHref(s.whatsapp, WA_MSG.geral);
  const waPlain = waHref(s.whatsapp);
  // Fundo do Início: foto opcional com opacidade própria (o texto segue opaco).
  const heroPhoto = s.heroPhoto?.trim() ? s.heroPhoto : null;
  const heroOpacity =
    typeof s.heroPhotoOpacity === "number" && s.heroPhotoOpacity > 0 && s.heroPhotoOpacity <= 1
      ? s.heroPhotoOpacity
      : 0.5;
  const portfolio = s.portfolio ?? null;
  const portfolioPhotos = portfolio?.photos?.filter((p) => p?.url?.trim()) ?? [];
  return (
    <div className="land2">
      <LandingFx />
      {preview ? null : <Track kind="visita_site" />}
      <SiteNav />

      <header className={`lhero${heroPhoto ? " has-photo" : ""}`} id="top">
        {heroPhoto ? (
          <div
            className="lhero-photo"
            aria-hidden="true"
            style={{ "--photo-op": heroOpacity } as React.CSSProperties}
          >
            <span className="ph" style={{ backgroundImage: `url(${heroPhoto})`, opacity: heroOpacity }} />
          </div>
        ) : null}
        {/* O brasão é o fundo padrão do Início. Quando ela anexa uma foto, ele
            sai: a foto é que vira o fundo, sem marca d'água por cima. */}
        {heroPhoto ? null : (
          <div className="lhero-crest" aria-hidden="true"><img src="/images/brasao-creme.png" alt="" /></div>
        )}
        <div className="lwrap lhero-in">
          <div className="eyebrow">{s.heroEyebrow}</div>
          <h1 className="serif lhero-h1" dangerouslySetInnerHTML={{ __html: s.heroTitleHtml }} />
          <p className="lhero-sub">{s.heroSub}</p>
        </div>
      </header>

      <section className="lsobre" id="sobre">
        <div className="lsobre-photo" style={{ backgroundImage: `url(${s.sobrePhoto ?? ""})`, opacity: photoOpacity(s.sobrePhotoOpacity) }} aria-hidden="true" />
        <div className="lwrap lsobre-in rv">
          <div className="eyebrow">{s.quemEyebrow}</div>
          {s.quemTitleHtml ? <h2 className="h2 serif" dangerouslySetInnerHTML={{ __html: s.quemTitleHtml }} /> : null}
          {s.quemParagraphs.map((p, i) => <p className="lead" key={i}>{p}</p>)}
          {s.quemClose ? <p className="close serif">{s.quemClose}</p> : null}
        </div>
      </section>

      <section className="lserv" id="servicos">
        <div className="lwrap">
          <div className="rv lserv-head">
            <div className="eyebrow">{s.trabalhoEyebrow}</div>
            <h2 className="h2 serif">{s.trabalhoTitle}</h2>
            <p className="lead">{s.trabalhoLead}</p>
          </div>
          <div className="lserv-grid">
            {cards.map((c, i) => <Card c={c} key={i} />)}
          </div>
        </div>
      </section>

      <section className="lport" id="portfolio">
        <div className="lwrap">
          <div className="rv lport-head">
            {portfolio?.eyebrow?.trim() ? <div className="eyebrow">{portfolio.eyebrow}</div> : null}
            <h2 className="h2 serif">{portfolio?.title?.trim() || "Portfólio"}</h2>
            {portfolio?.lead?.trim() ? <p className="lead">{portfolio.lead}</p> : null}
          </div>
          <div className="rv">
            {portfolioPhotos.length ? (
              <Portfolio photos={portfolioPhotos} />
            ) : (
              <p className="lport-empty">Em breve, os quartos que assinamos.</p>
            )}
          </div>
        </div>
      </section>

      <section className="lcontato" id="contato">
        <div className="lcontato-photo" style={{ backgroundImage: `url(${s.contatoPhoto ?? ""})`, opacity: photoOpacity(s.contatoPhotoOpacity) }} aria-hidden="true" />
        <div className="lwrap lcontato-in rv">
          <div className="eyebrow">{s.contatoEyebrow}</div>
          <h2 className="h2 serif" dangerouslySetInnerHTML={{ __html: s.contatoTitleHtml }} />
          <p className="lead">{s.contatoLead}</p>
          {waMain ? (
            <a className="btn primary" href={waMain} target="_blank" rel="noopener noreferrer">Nosso WhatsApp</a>
          ) : null}
          <div className="lcontato-cards">
            {s.horario ? (
              <div className="lc">
                <span>Horário de atendimento: {s.horario}</span>
              </div>
            ) : null}
            {s.email ? (
              <div className="lc"><b>E-mail</b><span>{s.email}</span></div>
            ) : null}
          </div>
          <div className="lsocial">
            <span className="k">Siga nossas redes</span>
            <div className="icons">
              <Social d={IG} href={igHref(s.instagram)} label="Instagram" />
              <Social d={WA} href={waPlain} label="WhatsApp" />
            </div>
          </div>
        </div>
      </section>

      <footer className="lfoot">
        <div className="lwrap foot-row">
          <span className="logo"><img src="/images/logo-horizontal.png" alt="Quarto da Helô" /></span>
          <span>{s.footerTagline}</span>
        </div>
      </footer>

      {waMain ? (
        <a className="wa-fab" href={waMain} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WA} /></svg>
        </a>
      ) : null}
    </div>
  );
}
