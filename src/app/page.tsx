import Link from "next/link";
import { getSiteContent } from "@/lib/content";
import { LandingFx, SupportButton } from "./_components/Interactive";
import { Track } from "./_components/Track";

export const dynamic = "force-dynamic"; // reflete o CMS assim que o Supabase entra

export default async function Home() {
  const s = await getSiteContent();
  return (
    <>
      <LandingFx />
      <Track kind="visita_site" />
      <nav className="nav" id="nav">
        <a className="logo" href="#top"><img src="/images/logo-horizontal.png" alt="Quarto da Helô" /></a>
        <div className="links">
          <a href="#quem">Quem somos</a>
          <a href="#trabalho">Como trabalhamos</a>
          <Link href="/guia" className="pill">Guia digital</Link>
          <a href="#contato">Contato</a>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-bg" aria-hidden="true" />
        <div className="wrap">
          <div className="hero-grid">
            <div className="vinho">
              <div className="eyebrow">{s.heroEyebrow}</div>
              <h1 className="serif" dangerouslySetInnerHTML={{ __html: s.heroTitleHtml }} />
              <p className="sub">{s.heroSub}</p>
              <div className="cats">{s.heroCats.map((c) => <span key={c}>{c}</span>)}</div>
              <div className="hero-cta">
                <a className="btn primary" href="#trabalho">Como trabalhamos</a>
                <Link className="btn ghost" href="/guia">Conhecer o guia</Link>
              </div>
              <div className="sig"><img src="/images/helo-script-caramelo.png" alt="" aria-hidden="true" /></div>
            </div>
            <div className="hero-aside">
              <div className="portrait">
                <img src="/images/atmosfera-floral.webp" alt="Estampa floral da identidade Quarto da Helô" />
                <span className="tag">Estampa da casa</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="band" id="quem">
        <div className="wrap quem rv">
          <div className="eyebrow">{s.quemEyebrow}</div>
          <h2 className="h2" dangerouslySetInnerHTML={{ __html: s.quemTitleHtml }} />
          {s.quemParagraphs.map((p, i) => <p className="lead" key={i}>{p}</p>)}
          <p className="close serif">{s.quemClose}</p>
        </div>
      </section>

      <div className="ribbon" aria-hidden="true" />

      <section className="band alt" id="trabalho">
        <div className="wrap">
          <div className="rv">
            <div className="eyebrow">{s.trabalhoEyebrow}</div>
            <h2 className="h2">{s.trabalhoTitle}</h2>
            <p className="lead" style={{ marginTop: 14 }}>{s.trabalhoLead}</p>
          </div>
          <div className="svc">
            {s.services.map((sv, i) => (
              <div className={`scard rv${sv.featured ? " feat" : ""}`} key={i}>
                <div className="tag">{sv.tag}</div>
                <h3>{sv.title}</h3>
                <p className="desc">{sv.desc}</p>
                <ul>{sv.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                {sv.featured && sv.featuredLabel ? <span className="plus">{sv.featuredLabel}</span> : null}
                {sv.foot ? <p className="foot">{sv.foot}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="guia">
        <div className="wrap rv">
          <div className="guia">
            <div className="in">
              <div className="eyebrow">{s.guiaEyebrow}</div>
              <h2>{s.guiaTitle}</h2>
              <span className="k">{s.guiaKicker}</span>
              <p>{s.guiaText}</p>
              <Link className="btn primary" href="/guia">Conhecer o guia</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band alt" id="contato">
        <div className="wrap contact rv">
          <div className="eyebrow">{s.contatoEyebrow}</div>
          <h2 className="h2" dangerouslySetInnerHTML={{ __html: s.contatoTitleHtml }} />
          <p className="lead">{s.contatoLead}</p>
          <SupportButton className="btn primary">Iniciar uma conversa</SupportButton>
        </div>
      </section>

      <div className="ribbon" aria-hidden="true" />

      <footer>
        <div className="wrap foot-row">
          <span className="logo"><img src="/images/logo-horizontal.png" alt="Quarto da Helô" /></span>
          <span>{s.footerTagline}</span>
          <span className="soon">Instagram em breve</span>
        </div>
      </footer>
    </>
  );
}
