"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/* Navegação da landing v2 (doc "Alterações Landing Page"):
 * - Barra do topo: ☰ menu (esquerda) · logo (meio) · brasão (direita).
 * - Gaveta lateral com o menu completo.
 * - Barra inferior fixa em todas as páginas: Início · Serviços · Digital · Começar.
 * Os links usam /#ancora para funcionarem também a partir das páginas próprias. */

const MENU: { label: string; href: string }[] = [
  { label: "Início", href: "/#top" },
  { label: "Sobre nós", href: "/#sobre" },
  { label: "Como trabalhamos", href: "/#servicos" },
  { label: "Curadoria Assinada", href: "/curadoria-assinada" },
  { label: "Projeto Conceito", href: "/projeto-conceito" },
  { label: "Produto digital", href: "/produto-digital" },
  { label: "Contato", href: "/#contato" },
];

const I = {
  home: "M3 11.5 12 4l9 7.5M5.5 10v9h13v-9",
  sobre: "M12 20s-7-4.4-9.2-8.3C1.3 8.9 2.6 6 5.4 6c1.7 0 2.8 1 3.6 2 .8-1 1.9-2 3.6-2 2.8 0 4.1 2.9 2.6 5.7C19 15.6 12 20 12 20Z",
  serv: "M4 7h16M4 12h16M4 17h10",
  curadoria: "M12 3.5l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z",
  projeto: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.4 5.6-2 5-5 2 2-5z",
  digital: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 15h4",
  contato: "M4 5h16v11H9l-4 3z",
};

/* A barra inferior espelha o menu lateral: as mesmas seções, agora também
 * acessíveis com um toque. Rola na horizontal em telas bem estreitas. */
const BOTTOM: { label: string; href: string; d: string }[] = [
  { label: "Início", href: "/#top", d: I.home },
  { label: "Sobre", href: "/#sobre", d: I.sobre },
  { label: "Serviços", href: "/#servicos", d: I.serv },
  { label: "Curadoria", href: "/curadoria-assinada", d: I.curadoria },
  { label: "Projeto", href: "/projeto-conceito", d: I.projeto },
  { label: "Digital", href: "/produto-digital", d: I.digital },
  { label: "Contato", href: "/#contato", d: I.contato },
];

function Ico({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`ltop${solid ? " solid" : ""}`}>
        <button type="button" className="burger" aria-label="Abrir menu" onClick={() => setOpen(true)}>
          <span /><span /><span />
        </button>
        <Link href="/#top" className="mark" aria-label="Quarto da Helô — início">
          <img src="/images/logo-quarto-helo.png" alt="Quarto da Helô" />
        </Link>
        <Link href="/#top" className="crest" aria-label="Quarto da Helô">
          <img src="/images/brasao-creme.png" alt="" aria-hidden="true" />
        </Link>
      </header>

      {open ? <div className="ldrawer-scrim" onClick={() => setOpen(false)} /> : null}
      <nav className={`ldrawer${open ? " open" : ""}`} aria-hidden={!open}>
        <button type="button" className="x" aria-label="Fechar menu" onClick={() => setOpen(false)}>×</button>
        <img className="dcrest" src="/images/brasao-creme.png" alt="" aria-hidden="true" />
        <div className="dlinks">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} onClick={() => setOpen(false)}>{m.label}</Link>
          ))}
        </div>
        <span className="dfoot">Arquitetura · Interiores · Curadoria · Produção</span>
      </nav>

      <nav className="lbottom" aria-label="Navegação rápida">
        {BOTTOM.map((b) => (
          <Link key={b.href} href={b.href}><Ico d={b.d} /><span>{b.label}</span></Link>
        ))}
      </nav>
    </>
  );
}
