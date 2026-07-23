"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { GuideDica, GuidePage, Genero, Item, MeasureRow, PriceTier, ProductOption, ProjectTexts } from "@/lib/types";
import { GENERO_LABEL, TIER_LABEL } from "@/lib/types";
import {
  type ActionState,
  entrarNoPainel,
  excluirOpcao,
  salvarOpcao,
  salvarPagina,
  salvarTextosItem,
  trocarSenha,
} from "../actions";
import { ImageField } from "./ImageField";

/* Formulários do painel — pensados para uso leigo: campos com os nomes que a
 * Helô usa, resposta em português claro e nada de jargão técnico. */

const GENEROS: Genero[] = ["menina", "neutro", "menino"];
const TIER_ORDER: PriceTier[] = ["alto", "medio", "acessivel"];

function Feedback({ state }: { state: ActionState | null }) {
  if (!state) return null;
  return <p className={`adm-msg${state.ok ? " ok" : " err"}`}>{state.msg}</p>;
}

function SubmitBtn({ children, tone = "wine" }: { children: React.ReactNode; tone?: "wine" | "soft" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`adm-btn ${tone}`} disabled={pending}>
      {pending ? "Salvando…" : children}
    </button>
  );
}

/* ------------------------------ sessão ------------------------------ */

export function LoginForm() {
  const [state, action] = useFormState(entrarNoPainel, null);
  return (
    <form action={action} className="adm-login">
      <img src="/images/brasao-creme.png" alt="" aria-hidden="true" />
      <h1 className="serif">Painel da Helô</h1>
      <p>Digite a senha do painel para editar o guia e o site.</p>
      <input type="password" name="senha" placeholder="Senha" autoFocus />
      <SubmitBtn>Entrar</SubmitBtn>
      <Feedback state={state} />
    </form>
  );
}

/* --------------------------- trocar senha --------------------------- */

export function TrocarSenhaForm() {
  const [state, action] = useFormState(trocarSenha, null);
  return (
    <form action={action} className="adm-form" style={{ maxWidth: 420 }}>
      <label>
        Senha atual
        <input type="password" name="atual" autoComplete="current-password" />
      </label>
      <label>
        Nova senha (mínimo 6 caracteres)
        <input type="password" name="nova" autoComplete="new-password" />
      </label>
      <div className="adm-actions">
        <SubmitBtn tone="soft">Trocar senha</SubmitBtn>
        <Feedback state={state} />
      </div>
    </form>
  );
}

/* --------------------------- página do guia --------------------------- */

/* Editor dos textos fixos da tela "Meu projeto" (só rótulos/instruções). */
function ProjetoTextos({
  project,
  setProject,
}: {
  project: ProjectTexts;
  setProject: React.Dispatch<React.SetStateAction<ProjectTexts>>;
}) {
  const set = (patch: Partial<ProjectTexts>) => setProject((p) => ({ ...p, ...patch }));
  return (
    <div className="adm-cards">
      <div className="adm-cards-head">
        <span>Textos do &quot;Meu projeto&quot;</span>
        <small>Só os textos fixos da tela. Os itens, valores e o total da cliente continuam automáticos.</small>
      </div>
      <input type="hidden" name="project" value={JSON.stringify(project)} />
      <label>
        Título do bloco &quot;Como funciona&quot;
        <input value={project.howTitle ?? ""} onChange={(e) => set({ howTitle: e.target.value })} placeholder="Como funciona" />
      </label>
      <label>
        Texto do &quot;Como funciona&quot;
        <textarea rows={3} value={project.howText ?? ""} onChange={(e) => set({ howText: e.target.value })} />
      </label>
      <div className="adm-2col">
        <label>
          Título do Moodboard
          <input value={project.moodTitle ?? ""} onChange={(e) => set({ moodTitle: e.target.value })} placeholder="Moodboard" />
        </label>
        <label>
          Título da Análise financeira
          <input value={project.finTitle ?? ""} onChange={(e) => set({ finTitle: e.target.value })} placeholder="Análise financeira" />
        </label>
      </div>
      <label>
        Moodboard vazio (quando ainda não há escolhas)
        <textarea rows={2} value={project.moodEmpty ?? ""} onChange={(e) => set({ moodEmpty: e.target.value })} />
      </label>
      <label>
        Análise vazia (quando ainda não há escolhas)
        <textarea rows={2} value={project.finEmpty ?? ""} onChange={(e) => set({ finEmpty: e.target.value })} />
      </label>
      <label>
        Rótulo do total
        <input value={project.totalLabel ?? ""} onChange={(e) => set({ totalLabel: e.target.value })} placeholder="Total do projeto" />
      </label>
      <label>
        Observação abaixo dos valores
        <textarea rows={3} value={project.finNote ?? ""} onChange={(e) => set({ finNote: e.target.value })} />
        <small>Escreva {"{data}"} onde quiser que apareça a data-base dos preços.</small>
      </label>
    </div>
  );
}

export function PaginaForm({ page }: { page: GuidePage }) {
  const [state, action] = useFormState(salvarPagina, null);
  const [cards, setCards] = useState<{ n: string; title: string; text: string }[]>(
    (page.cards ?? []).map((c) => ({ n: c.n, title: c.title, text: c.text })),
  );

  const setCard = (i: number, patch: Partial<{ n: string; title: string; text: string }>) =>
    setCards((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const addCard = () =>
    setCards((prev) => [...prev, { n: String(prev.length + 1).padStart(2, "0"), title: "", text: "" }]);
  const removeCard = (i: number) => setCards((prev) => prev.filter((_, j) => j !== i));

  // Tabela de medidas (opcional): rótulos das 3 colunas + linhas + dica.
  const [cols, setCols] = useState(
    page.measures?.columns ?? { item: "Item", min: "Medida mínima", meaning: "O que isso significa na prática" },
  );
  const [mrows, setMrows] = useState<MeasureRow[]>(page.measures?.rows ?? []);
  const [tip, setTip] = useState<GuideDica>(page.measures?.tip ?? { label: "Dica da Helô", body: "" });
  const setMrow = (i: number, patch: Partial<MeasureRow>) =>
    setMrows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addMrow = () => setMrows((prev) => [...prev, { item: "", min: "", meaning: "" }]);
  const removeMrow = (i: number) => setMrows((prev) => prev.filter((_, j) => j !== i));
  const moveMrow = (i: number, dir: -1 | 1) =>
    setMrows((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const measuresPayload = mrows.some((r) => r.item.trim() || r.min.trim() || r.meaning.trim())
    ? {
        columns: cols,
        rows: mrows
          .map((r) => ({ item: r.item.trim(), min: r.min.trim(), meaning: r.meaning.trim() }))
          .filter((r) => r.item || r.min || r.meaning),
        tip: tip.body.trim() ? { label: (tip.label ?? "").trim() || null, body: tip.body.trim() } : null,
      }
    : null;

  // "Meu projeto" é uma página especial: edita só os textos fixos da tela (os
  // dados da cliente continuam automáticos). Escondemos os campos genéricos.
  const isProjeto = page.slug === "meu-projeto";
  const [project, setProject] = useState<ProjectTexts>(page.project ?? {});

  return (
    <form action={action} className="adm-form">
      <input type="hidden" name="slug" value={page.slug} />
      <input type="hidden" name="order" value={page.order} />
      <label>
        Título
        <input name="title" defaultValue={page.title} />
      </label>
      <label>
        Linha pequena acima do título (opcional)
        <input name="eyebrow" defaultValue={page.eyebrow ?? ""} />
      </label>
      <ImageField
        name="background_url"
        label="Imagem de fundo (opcional)"
        value={page.backgroundUrl}
        folder={`paginas/${page.slug}`}
        hint="Aparece atrás do conteúdo, com um véu claro por cima. Deixe vazia para o fundo padrão."
      />
      {isProjeto ? <ProjetoTextos project={project} setProject={setProject} /> : null}
      {!isProjeto ? (
        <>
      <label>
        Texto da página
        <textarea
          name="texto"
          rows={14}
          defaultValue={page.paragraphs.join("\n\n")}
          placeholder="Cole aqui o texto. Deixe uma linha em branco entre um parágrafo e outro."
        />
      </label>

      <div className="adm-cards">
        <div className="adm-cards-head">
          <span>Cards numerados (opcional)</span>
          <small>Os quadradinhos numerados da página — como os 4 passos do &quot;Como usar&quot;.</small>
        </div>
        <input type="hidden" name="cardCount" value={cards.length} />
        {cards.map((c, i) => (
          <div className="adm-cardrow" key={i}>
            <input
              className="num"
              name={`card_n_${i}`}
              value={c.n}
              onChange={(e) => setCard(i, { n: e.target.value })}
              aria-label="Número"
            />
            <div className="bd">
              <input
                name={`card_title_${i}`}
                value={c.title}
                onChange={(e) => setCard(i, { title: e.target.value })}
                placeholder="Título do card"
              />
              <textarea
                name={`card_text_${i}`}
                rows={2}
                value={c.text}
                onChange={(e) => setCard(i, { text: e.target.value })}
                placeholder="Texto do card"
              />
            </div>
            <button type="button" className="rm" onClick={() => removeCard(i)} title="Remover card">
              ×
            </button>
          </div>
        ))}
        <button type="button" className="adm-btn soft add" onClick={addCard}>
          + adicionar card
        </button>
      </div>

      <input type="hidden" name="measures" value={measuresPayload ? JSON.stringify(measuresPayload) : ""} />
      <div className="adm-cards adm-measures">
        <div className="adm-cards-head">
          <span>Tabela de medidas (opcional)</span>
          <small>Para a página de Medidas e Circulação. Cada linha vira uma linha da tabela no guia (e um cartão no celular).</small>
        </div>
        <div className="adm-mcols">
          <label>
            Título da coluna 1
            <input value={cols.item} onChange={(e) => setCols({ ...cols, item: e.target.value })} />
          </label>
          <label>
            Título da coluna 2
            <input value={cols.min} onChange={(e) => setCols({ ...cols, min: e.target.value })} />
          </label>
          <label>
            Título da coluna 3
            <input value={cols.meaning} onChange={(e) => setCols({ ...cols, meaning: e.target.value })} />
          </label>
        </div>
        {mrows.map((r, i) => (
          <div className="adm-mrow" key={i}>
            <div className="ord">
              <button type="button" onClick={() => moveMrow(i, -1)} disabled={i === 0} title="Subir">↑</button>
              <button type="button" onClick={() => moveMrow(i, 1)} disabled={i === mrows.length - 1} title="Descer">↓</button>
            </div>
            <div className="bd">
              <input value={r.item} onChange={(e) => setMrow(i, { item: e.target.value })} placeholder={cols.item} />
              <input value={r.min} onChange={(e) => setMrow(i, { min: e.target.value })} placeholder={cols.min} />
              <textarea rows={2} value={r.meaning} onChange={(e) => setMrow(i, { meaning: e.target.value })} placeholder={cols.meaning} />
            </div>
            <button type="button" className="rm" onClick={() => removeMrow(i)} title="Remover linha">
              ×
            </button>
          </div>
        ))}
        <button type="button" className="adm-btn soft add" onClick={addMrow}>
          + adicionar linha
        </button>
        <label className="adm-mtip">
          Dica abaixo da tabela (opcional)
          <textarea
            rows={3}
            value={tip.body}
            onChange={(e) => setTip({ ...tip, body: e.target.value })}
            placeholder="Deixe em branco para não mostrar a dica."
          />
          <small>Vira o card discreto &quot;Dica da Helô&quot; logo abaixo da tabela.</small>
        </label>
      </div>

      <label>
        Frase de fechamento (citação, opcional)
        <textarea name="closing" rows={2} defaultValue={page.closing ?? ""} placeholder="Uma frase de encerramento em destaque." />
      </label>
        </>
      ) : null}

      {!isProjeto ? (
        <label className="adm-check">
          <input type="checkbox" name="ready" defaultChecked={page.ready} />
          Este é o texto oficial (tira o aviso de &quot;texto provisório&quot; do guia)
        </label>
      ) : null}
      <div className="adm-actions">
        <SubmitBtn>Salvar página</SubmitBtn>
        <Feedback state={state} />
      </div>
    </form>
  );
}

/* ----------------------- textos do item (decisão) ----------------------- */

export function ItemTextosForm({ item }: { item: Item }) {
  const [state, action] = useFormState(salvarTextosItem, null);
  const d = item.decision ?? {};
  return (
    <form action={action} className="adm-form">
      <input type="hidden" name="slug" value={item.slug} />
      <label>
        Frase de abertura (o que é / por que importa)
        <input name="summary" defaultValue={item.summary ?? ""} />
      </label>
      <div className="adm-2col">
        <label>
          Quando usar
          <textarea name="quandoUsar" rows={3} defaultValue={d.quandoUsar ?? ""} />
        </label>
        <label>
          Quando não usar
          <textarea name="quandoNao" rows={3} defaultValue={d.quandoNao ?? ""} />
        </label>
        <label>
          Erro mais comum
          <textarea name="erroComum" rows={3} defaultValue={d.erroComum ?? ""} />
        </label>
        <label>
          O efeito no quarto
          <textarea name="efeito" rows={3} defaultValue={d.efeito ?? ""} />
        </label>
      </div>
      <label>
        Dica de instalação (opcional)
        <textarea name="instalacao" rows={2} defaultValue={d.instalacao ?? ""} />
      </label>
      <label className="adm-dica">
        Dica da Helô (card em destaque, opcional)
        <textarea
          name="dicaHelo"
          rows={3}
          defaultValue={d.dicaHelo ?? ""}
          placeholder="A dica especial da Helô para este item. Deixe em branco para não mostrar o card."
        />
        <small>Vira um card destacado (fundo vinho) na página do item. Apague o texto para remover o card.</small>
      </label>
      <div className="adm-actions">
        <SubmitBtn>Salvar textos</SubmitBtn>
        <Feedback state={state} />
      </div>
    </form>
  );
}

/* ------------------------- opções do catálogo ------------------------- */

function OpcaoForm({
  itemSlug,
  genero,
  tier,
  option,
  order,
}: {
  itemSlug: string;
  genero: Genero;
  tier: PriceTier;
  option?: ProductOption;
  order: number;
}) {
  const [state, action] = useFormState(salvarOpcao, null);
  const [delState, delAction] = useFormState(excluirOpcao, null);
  return (
    <div className={`adm-opt${option ? "" : " nova"}`}>
      <form action={action}>
        <input type="hidden" name="id" value={option?.id ?? ""} />
        <input type="hidden" name="itemSlug" value={itemSlug} />
        <input type="hidden" name="genero" value={genero} />
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="order" value={option?.order ?? order} />
        <div className="foto">
          <ImageField name="foto_url" label="Foto do produto" value={option?.photoUrl} folder={`opcoes/${itemSlug}`} hint="Anexe a foto — ela é otimizada automaticamente." />
          {option?.exemplo ? <i className="ex">exemplo — vira real ao salvar</i> : null}
        </div>
        <div className="campos">
          <label>
            Nome
            <input name="name" defaultValue={option?.name ?? ""} placeholder="Ex.: Berço Lume" />
          </label>
          <div className="linha">
            <label>
              Preço (R$)
              <input
                name="preco"
                inputMode="decimal"
                defaultValue={option?.priceCents != null ? (option.priceCents / 100).toFixed(2).replace(".", ",") : ""}
                placeholder="0,00"
              />
            </label>
            <label>
              Fornecedor (opcional)
              <input name="supplier" defaultValue={option?.supplier ?? ""} />
            </label>
          </div>
          <label>
            Link do produto (opcional)
            <input name="url" defaultValue={option?.url ?? ""} placeholder="https://…" />
          </label>
          <div className="adm-actions">
            <SubmitBtn tone={option ? "soft" : "wine"}>{option ? "Salvar" : "Adicionar ao guia"}</SubmitBtn>
            <Feedback state={state} />
          </div>
        </div>
      </form>
      {option ? (
        <form action={delAction} className="excluir">
          <input type="hidden" name="id" value={option.id} />
          <input type="hidden" name="itemSlug" value={itemSlug} />
          <button type="submit" title="Excluir esta opção do guia">
            Excluir
          </button>
          <Feedback state={delState} />
        </form>
      ) : null}
    </div>
  );
}

export function OpcoesEditor({ item, options }: { item: Item; options: ProductOption[] }) {
  const [genero, setGenero] = useState<Genero>("neutro");
  return (
    <div className="adm-opcoes">
      <div className="adm-gen">
        {GENEROS.map((g) => {
          const n = options.filter((o) => o.genero === g).length;
          return (
            <button key={g} type="button" className={`tab${genero === g ? " sel" : ""}`} onClick={() => setGenero(g)}>
              {GENERO_LABEL[g]}
              {n ? <em>{n}</em> : null}
            </button>
          );
        })}
      </div>
      {TIER_ORDER.map((tier) => {
        const row = options
          .filter((o) => o.genero === genero && o.tier === tier)
          .sort((a, b) => a.order - b.order);
        return (
          <section className="adm-faixa" key={tier}>
            <h3>
              {TIER_LABEL[tier]} <span>{row.length} de até 3 opções</span>
            </h3>
            {row.map((o) => (
              <OpcaoForm key={o.id} itemSlug={item.slug} genero={genero} tier={tier} option={o} order={o.order} />
            ))}
            {row.length < 3 ? (
              <OpcaoForm itemSlug={item.slug} genero={genero} tier={tier} order={row.length} />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
