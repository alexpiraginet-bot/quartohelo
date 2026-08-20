"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/* Os dois embutidos do LEX HUB vivem aqui porque cada um pertence a um público
 * diferente, e o layout raiz envolve o site e o painel:
 *
 *   /admin          → só o botão de suporte. Quem abre um chamado é a Helô.
 *   /pre-visualizar → nenhum dos dois. É o ensaio de como a página vai ficar;
 *                     qualquer coisa nossa por cima atrapalha a conferência.
 *   resto do site   → só a pílula da Lex. Visitante não abre chamado.
 */
export function ScriptsLex() {
  const caminho = usePathname() ?? "";
  if (caminho.startsWith("/pre-visualizar")) return null;

  if (caminho.startsWith("/admin")) {
    return (
      <Script
        src="https://alex-hub-three.vercel.app/support-widget.js"
        data-app="quartohelo"
        data-accent="#67232B"
        strategy="afterInteractive"
      />
    );
  }

  // data-safe-bottom: acima do dock (nav.lbottom) do site, para a pílula não
  // nascer em cima da navegação.
  return (
    <Script
      src="https://alex-hub-three.vercel.app/lex-cta.js"
      data-app="quartohelo"
      data-label="site do Quarto da Helô"
      data-delay="12000"
      data-safe-bottom="92"
      data-bg="linear-gradient(155deg,#67232B,#4A171F)"
      data-fg="#F3EBDB"
      data-muted="#E4D2B4"
      data-border="rgba(231,223,199,.32)"
      data-accent="#BC8880"
      strategy="afterInteractive"
    />
  );
}
