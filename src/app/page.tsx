import Link from "next/link";
import { getSiteContent } from "@/lib/content";
import { LandingFx } from "./_components/Interactive";
import { SiteNav } from "./_components/SiteNav";
import { Track } from "./_components/Track";
import type { ServiceCard } from "@/lib/types";

export const dynamic = "force-dynamic"; // reflete o CMS assim que o Supabase entra

const IG = "M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm5.2-.9a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0ZM7 3.5h10A3.5 3.5 0 0 1 20.5 7v10A3.5 3.5 0 0 1 17 20.5H7A3.5 3.5 0 0 1 3.5 17V7A3.5 3.5 0 0 1 7 3.5Z";
const FB = "M13.5 21v-7h2.3l.4-2.7h-2.7V9.4c0-.8.3-1.3 1.4-1.3h1.4V5.7c-.7-.1-1.5-.2-2.2-.2-2.2 0-3.6 1.3-3.6 3.7v2.1H8.3V14h2.6v7h2.6Z";
const WA = "M12 3.5a8.4 8.4 0 0 0-7.2 12.7L4 20.5l4.4-1.1A8.4 8.4 0 1 0 12 3.5Zm4.8 11.9c-.2.6-1.2 1.1-1.7 1.1-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1Z";

function Social({ d, href, label }: { d: string; href?: string | null; label: string }) {
  const svg = (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
  );
  if (!href) return <span className="soc off" aria-label={`${label} (em breve)`}>{svg}</span>;
  return <a className="soc" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>{svg}</a>;
}

function Card({ c }: { c: ServiceCard }) {
  return (
    <article className={`lcard rv${c.featured ? " feat" : ""}`}>
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

export default async function Home() {
  const s = await getSiteContent();
  const cards: ServiceCard[] = [...s.services, ...(s.produtoDigital ? [s.produtoDigital] : [])];
  return (
    <div className="land2">
      <LandingFx />
      <Track kind="visita_site" />
      <SiteNav />

      <header className="lhero" id="top">
        <div className="lhero-crest" aria-hidden="true"><img src="/images/brasao-creme.png" alt="" /></div>
        <div className="lwrap lhero-in">
          <div className="eyebrow">{s.heroEyebrow}</div>
          <h1 className="serif lhero-h1" dangerouslySetInnerHTML={{ __html: s.heroTitleHtml }} />
          <p className="lhero-sub">{s.heroSub}</p>
          <div className="lhero-cta">
            <a className="btn primary" href="#servicos">Como trabalhamos</a>
            <Link className="btn ghost" href="/produto-digital">Produto digital</Link>
          </div>
        </div>
      </header>

      <section className="lsobre" id="sobre">
        <div className="lsobre-photo" style={{ backgroundImage: `url(${s.sobrePhoto ?? ""})` }} aria-hidden="true" />
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

      <section className="lcontato" id="contato">
        <div className="lcontato-photo" style={{ backgroundImage: `url(${s.contatoPhoto ?? ""})` }} aria-hidden="true" />
        <div className="lwrap lcontato-in rv">
          <div className="eyebrow">{s.contatoEyebrow}</div>
          <h2 className="h2 serif" dangerouslySetInnerHTML={{ __html: s.contatoTitleHtml }} />
          <p className="lead">{s.contatoLead}</p>
          {s.whatsappHref ? (
            <a className="btn primary" href={s.whatsappHref} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          ) : null}
          <div className="lcontato-cards">
            <div className="lc">
              <b>WhatsApp</b>
              {s.horario ? <span>Horário de atendimento: {s.horario}</span> : null}
              {s.whatsapp ? <span>{s.whatsapp}</span> : null}
            </div>
            {s.email ? (
              <div className="lc"><b>E-mail</b><span>{s.email}</span></div>
            ) : null}
          </div>
          <div className="lsocial">
            <span className="k">Siga nossas redes</span>
            <div className="icons">
              <Social d={IG} href={s.instagram} label="Instagram" />
              <Social d={FB} href={s.facebook} label="Facebook" />
              <Social d={WA} href={s.whatsappHref} label="WhatsApp" />
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

      {s.whatsappHref ? (
        <a className="wa-fab" href={s.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WA} /></svg>
        </a>
      ) : null}
    </div>
  );
}
