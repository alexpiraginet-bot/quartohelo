import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/* Vídeo demonstrativo do Guia Digital.
 *
 * Cada cena é uma tela real do guia, capturada por video/capturar.mjs, com um
 * movimento lento por cima (o olho precisa de movimento para não ler a peça
 * como slide) e uma legenda dizendo o que aquela tela resolve.
 *
 * A quem a peça fala: a mãe grávida, não o comprador de software. Por isso as
 * legendas falam do que ela sente, e não do que o sistema faz.
 *
 * O guia ainda não abriu, então o fecho carrega a ressalva de que isto é uma
 * demonstração. Ela fica no fim, e não na abertura, para não gelar a entrada.
 */

const VINHO = "#67232B";
const VINHO_FUNDO = "#4A171F";
const CREME = "#F5EAD2";
const CARAMELO = "#D2B58E";

// Peça para mãe grávida: ritmo mais lento que o de uma demonstração técnica.
export const DURACAO_CENA = 120;
const TRANSICAO = 14;
const ABERTURA = 84;
const FECHO = 108;

interface Cena {
  arquivo: string;
  titulo: string;
  linha: string;
}

/* As legendas falam com a mãe, não sobre o produto. Quem assiste está grávida,
 * com um quarto para montar e pouca paciência para catálogo. Então cada tela
 * responde ao que ela sente, não ao que o sistema faz. */
export const CENAS: Cena[] = [
  { arquivo: "1-capa.jpg", titulo: "Você abre quando puder", linha: "De madrugada, na sala de espera, no fim do dia." },
  { arquivo: "2-visao-geral.jpg", titulo: "O guia chama vocês pelo nome", linha: "O nome do seu bebê está ali desde a primeira tela." },
  { arquivo: "3-conteudo.jpg", titulo: "Primeiro, o que ninguém conta", linha: "Medidas, circulação e a ordem certa de montar." },
  { arquivo: "4-decisao.jpg", titulo: "A Helô decide junto com você", linha: "Quando usar, quando não usar e o erro que quase todo mundo comete." },
  { arquivo: "5-faixas.jpg", titulo: "As opções já vêm escolhidas", linha: "Você decide quanto investir, não se está certo." },
  { arquivo: "6-escolha.jpg", titulo: "No seu tempo", linha: "Escolhe hoje, muda de ideia amanhã. O guia acompanha." },
  { arquivo: "7-moodboard.jpg", titulo: "E o quarto vai aparecendo", linha: "Cada escolha entra na prancha do seu bebê." },
  { arquivo: "8-investimento.jpg", titulo: "Com a conta sempre à vista", linha: "Você sabe quanto custa antes de comprar." },
];

export const duracaoTotal = () => ABERTURA + CENAS.length * DURACAO_CENA + FECHO;

const Fontes: React.FC = () => (
  <style>{`
    @font-face{font-family:'Fraunces';font-style:normal;font-weight:400;src:url('${staticFile("fontes/fraunces.woff2")}') format('woff2')}
    @font-face{font-family:'Fraunces';font-style:italic;font-weight:400;src:url('${staticFile("fontes/fraunces-italic.woff2")}') format('woff2')}
    @font-face{font-family:'Jost';font-style:normal;font-weight:300;src:url('${staticFile("fontes/jost-300.woff2")}') format('woff2')}
    @font-face{font-family:'Jost';font-style:normal;font-weight:400;src:url('${staticFile("fontes/jost.woff2")}') format('woff2')}
    @font-face{font-family:'Jost';font-style:normal;font-weight:500;src:url('${staticFile("fontes/jost-500.woff2")}') format('woff2')}
  `}</style>
);

const Rotulo: React.FC<{ texto: string; cor?: string }> = ({ texto, cor = CARAMELO }) => (
  <div style={{ fontFamily: "Jost", fontSize: 17, letterSpacing: "0.32em", textTransform: "uppercase", color: cor }}>
    {texto}
  </div>
);

/** Abertura e fecho: vinho, brasão à direita, como a capa do site. */
const Cartao: React.FC<{ rotulo: string; titulo: string; linha: string; nota?: string; frames: number }> = ({ rotulo, titulo, linha, nota, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const sai = interpolate(frame, [frames - 16, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: VINHO, opacity: sai }}>
      <Img
        src={staticFile("brasao-creme.png")}
        style={{ position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)", height: "150%", opacity: 0.08 }}
      />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 96px", opacity: entra, transform: `translateY(${(1 - entra) * 16}px)` }}>
        <Rotulo texto={rotulo} />
        <div style={{ fontFamily: "Fraunces", fontSize: 76, lineHeight: 1.05, color: "#FBF2DC", marginTop: 22 }}>{titulo}</div>
        <div style={{ fontFamily: "Fraunces", fontStyle: "italic", fontSize: 30, color: CARAMELO, marginTop: 20 }}>{linha}</div>
        {/* A ressalva de que é uma demonstração vive aqui, discreta: o acesso
            ainda não abriu e a peça não pode sugerir o contrário. */}
        {nota ? (
          <div style={{ fontFamily: "Jost", fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(239,227,203,.45)", marginTop: 34 }}>
            {nota}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Uma tela do guia com movimento lento e a legenda por cima. */
const Tela: React.FC<Cena> = ({ arquivo, titulo, linha }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Começa em 1: a captura tem a mesma proporção da composição, então a cena
  // abre mostrando a tela inteira e só depois se aproxima. Começar ampliado
  // cortava o logo na lateral do guia.
  const escala = interpolate(frame, [0, DURACAO_CENA], [1, 1.045]);
  const entrada = interpolate(frame, [0, TRANSICAO], [0, 1], { extrapolateRight: "clamp" });
  const saida = interpolate(frame, [DURACAO_CENA - TRANSICAO, DURACAO_CENA], [1, 0], { extrapolateLeft: "clamp" });
  const legenda = spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 26 });
  return (
    <AbsoluteFill style={{ background: VINHO_FUNDO, opacity: Math.min(entrada, saida) }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img src={staticFile(`telas/${arquivo}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${escala})` }} />
      </AbsoluteFill>
      {/* A legenda mora numa faixa vinho: o guia é claro, e texto creme direto
          sobre ele não teria contraste. */}
      <AbsoluteFill style={{ justifyContent: "flex-end" }}>
        <div
          style={{
            background: `linear-gradient(180deg, rgba(74,23,31,0) 0%, rgba(74,23,31,.86) 42%, rgba(74,23,31,.96) 100%)`,
            padding: "120px 72px 46px",
            opacity: legenda,
            transform: `translateY(${(1 - legenda) * 18}px)`,
          }}
        >
          <div style={{ fontFamily: "Fraunces", fontSize: 44, color: "#FBF2DC", lineHeight: 1.1 }}>{titulo}</div>
          <div style={{ fontFamily: "Jost", fontWeight: 300, fontSize: 25, color: CREME, marginTop: 12, opacity: 0.92 }}>{linha}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Demo: React.FC = () => (
  <AbsoluteFill style={{ background: VINHO_FUNDO }}>
    <Fontes />
    <Sequence durationInFrames={ABERTURA}>
      <Cartao
        rotulo="Quarto da Helô · Collection Nº 01"
        titulo="Enquanto o bebê não chega"
        linha="o quarto vai nascendo com você."
        frames={ABERTURA}
      />
    </Sequence>
    {CENAS.map((cena, i) => (
      <Sequence key={cena.arquivo} from={ABERTURA + i * DURACAO_CENA} durationInFrames={DURACAO_CENA}>
        <Tela {...cena} />
      </Sequence>
    ))}
    <Sequence from={ABERTURA + CENAS.length * DURACAO_CENA} durationInFrames={FECHO}>
      <Cartao
        rotulo="O Fim da Dúvida"
        titulo="Nenhum quarto é igual"
        linha="Enquanto isso, você vive a melhor parte: a espera."
        nota="Demonstração das telas · o acesso abre em breve"
        frames={FECHO}
      />
    </Sequence>
  </AbsoluteFill>
);
