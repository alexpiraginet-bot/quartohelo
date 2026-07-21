"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { GuidePage, Genero, Item, PriceTier, ProductOption } from "@/lib/types";
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
      <img src="/images/brasao-vinho.png" alt="" aria-hidden="true" />
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

export function PaginaForm({ page }: { page: GuidePage }) {
  const [state, action] = useFormState(salvarPagina, null);
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
      <label>
        Texto da página
        <textarea
          name="texto"
          rows={14}
          defaultValue={page.paragraphs.join("\n\n")}
          placeholder="Cole aqui o texto. Deixe uma linha em branco entre um parágrafo e outro."
        />
      </label>
      <label className="adm-check">
        <input type="checkbox" name="ready" defaultChecked={page.ready} />
        Este é o texto oficial (tira o aviso de &quot;texto provisório&quot; do guia)
      </label>
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
          {option?.photoUrl ? (
            <img src={option.photoUrl} alt={option.name} />
          ) : (
            <span>{option ? "Sem foto ainda" : "Nova opção"}</span>
          )}
          <label className="upload">
            {option?.photoUrl ? "Trocar foto" : "Enviar foto"}
            <input type="file" name="foto" accept="image/*" />
          </label>
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
