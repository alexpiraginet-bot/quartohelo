/* Corpo de texto das páginas próprias (Curadoria Assinada, Projeto Conceito,
 * Produto Digital) — a fonte única da tipografia dessas páginas.
 *
 * Por que existe: o texto que a cliente salva pelo painel vem como parágrafos,
 * e ela marca os itens de lista com um tracinho no começo da linha ("- item").
 * Antes, uma página editada virava um monte de <p> (com o tracinho aparecendo),
 * enquanto uma página sem texto próprio caía nos bullets do card e ganhava a
 * lista formatada. Daí a diferença de fonte e espaçamento entre as três.
 *
 * Aqui a marcação vem da ESTRUTURA, não do texto salvo: linhas iniciadas por
 * tracinho (ou bolinha/asterisco) viram <li> de uma <ul class="lpage-list">, com
 * o marcador desenhado pelo CSS; as demais viram <p class="lead">. O texto no
 * banco não é alterado, então nada da cliente se perde e ela segue editando do
 * mesmo jeito. Referência visual: a página Curadoria Assinada. */

/** Uma linha "de lista": começa com -, –, —, • ou * seguido de espaço. */
const LIST_MARK = /^\s*[-–—•*]\s+/;

export function isListLine(line: string): boolean {
  return LIST_MARK.test(line);
}

/** Tira o marcador só para exibir (o texto salvo continua intacto). */
export function stripListMark(line: string): string {
  return line.replace(LIST_MARK, "").trim();
}

type Block = { kind: "p"; text: string } | { kind: "ul"; items: string[] };

/** Agrupa linhas consecutivas de lista numa única <ul>, preservando a ordem. */
export function toBlocks(paragraphs: string[]): Block[] {
  const blocks: Block[] = [];
  for (const raw of paragraphs) {
    const text = (raw ?? "").trim();
    if (!text) continue;
    if (isListLine(text)) {
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "ul") last.items.push(stripListMark(text));
      else blocks.push({ kind: "ul", items: [stripListMark(text)] });
    } else {
      blocks.push({ kind: "p", text });
    }
  }
  return blocks;
}

/** Renderiza os parágrafos salvos com a tipografia padrão das páginas próprias. */
export function PageBody({ paragraphs }: { paragraphs: string[] }) {
  const blocks = toBlocks(paragraphs);
  if (!blocks.length) return null;
  return (
    <>
      {blocks.map((b, i) =>
        b.kind === "ul" ? (
          <ul className="lpage-list" key={i}>
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ) : (
          <p className="lead" key={i}>
            {b.text}
          </p>
        ),
      )}
    </>
  );
}
