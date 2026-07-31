import Link from "next/link";
import { PreviewFit } from "./PreviewFit";

/* Faixa fixa no topo da pré-visualização. Existe para nunca haver dúvida sobre
 * o que ela está olhando: isto é um ensaio, o site publicado continua igual. */

export function PreviewBar({ voltarPara, o = "o site" }: { voltarPara: string; o?: string }) {
  return (
    <div className="prev-bar">
      <PreviewFit />
      <span className="prev-tag">Pré-visualização</span>
      <span className="prev-txt">
        Assim vai ficar {o} quando você salvar. Ninguém mais vê esta tela, e o que está no ar continua igual.
      </span>
      {/* No celular a frase longa faria a faixa crescer e cobrir o topo do
          site. A curta diz a mesma coisa em uma linha. */}
      <span className="prev-txt-curta">Ensaio. O site no ar não mudou.</span>
      <Link className="prev-back" href={voltarPara}>
        Voltar e salvar
      </Link>
    </div>
  );
}

export function PreviewVazio({ voltarPara }: { voltarPara: string }) {
  return (
    <div className="prev-empty">
      <h1>Ainda não há nada para ver</h1>
      <p>
        A pré-visualização é montada quando você clica em “Ver como vai ficar”, na tela de edição.
        Volte, clique nele e esta página abre sozinha.
      </p>
      <Link className="adm-btn wine" href={voltarPara}>
        Voltar para a edição
      </Link>
    </div>
  );
}
