import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quarto da Helô — Estúdio criativo de arquitetura e curadoria para a primeira infância",
  description:
    "Estúdio criativo especializado em quartos infantis. Arquitetura, interiores, curadoria assinada e produção, com bossa, afeto e primor em cada detalhe.",
  robots: { index: false, follow: false }, // noindex enquanto não é o lançamento oficial
};

export const viewport: Viewport = { themeColor: "#67232B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        {/* data-safe-bottom: o rodapé daqui tem o dock (nav.lbottom) e, acima
            dele à direita, o WhatsApp do estúdio (a.wa-fab, topo a 146px do
            fundo). Sem reservar essa faixa, o botão de suporte nascia EM CIMA
            do WhatsApp do site. */}
        <Script
          src="https://alex-hub-three.vercel.app/support-widget.js"
          data-app="quartohelo"
          data-accent="#67232B"
          data-safe-bottom="158"
          strategy="afterInteractive"
        />
        {/* Captação da Lex vestindo a paleta da casa (vinho/creme) — pílula
            delicada, aprovada pelo dono. Canto oposto ao suporte. */}
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
      </body>
    </html>
  );
}
