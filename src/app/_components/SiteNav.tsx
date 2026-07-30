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
  { label: "Portfólio", href: "/#portfolio" },
  { label: "Contato", href: "/#contato" },
];

/* A barra inferior espelha o menu lateral: as mesmas seções, agora também
 * acessíveis com um toque. Rola na horizontal em telas bem estreitas.
 * No lugar dos ícones vai um ponto negritado acima de cada rótulo. */
const BOTTOM: { label: string; href: string }[] = [
  { label: "Início", href: "/#top" },
  { label: "Sobre nós", href: "/#sobre" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Curadoria Assinada", href: "/curadoria-assinada" },
  { label: "Projeto Conceito", href: "/projeto-conceito" },
  { label: "Guia Digital", href: "/produto-digital" },
  { label: "Portfólio", href: "/#portfolio" },
  { label: "Contato", href: "/#contato" },
];

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
          <Link key={b.href} href={b.href}>
            <i className="dot" aria-hidden="true" />
            <span>{b.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
