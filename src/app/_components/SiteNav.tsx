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
  serv: "M4 7h16M4 12h16M4 17h10",
  digital: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 15h4",
  start: "M12 3v18M3 12h18",
};

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
          <img src="/images/helo-script-caramelo.png" alt="Quarto da Helô" />
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
        <Link href="/#top"><Ico d={I.home} /><span>Início</span></Link>
        <Link href="/#servicos"><Ico d={I.serv} /><span>Serviços</span></Link>
        <Link href="/produto-digital"><Ico d={I.digital} /><span>Digital</span></Link>
        <Link href="/#contato"><Ico d={I.start} /><span>Começar</span></Link>
      </nav>
    </>
  );
}
