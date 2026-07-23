"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ServiceCard, SiteContent } from "@/lib/types";
import { salvarSite, type ActionState } from "../actions";

/* Editor da landing (aba "Site"). Um único formulário com todas as seções;
 * salva o SiteContent inteiro de uma vez (a ação mescla com o atual). */

function Msg({ state }: { state: ActionState | null }) {
  if (!state) return null;
  return <p className={`adm-msg${state.ok ? " ok" : " err"}`}>{state.msg}</p>;
}
function SaveBar() {
  const { pending } = useFormStatus();
  return (
    <div className="adm-savebar">
      <button type="submit" className="adm-btn wine" disabled={pending}>
        {pending ? "Salvando…" : "Salvar o site"}
      </button>
    </div>
  );
}
function T({ name, label, def, ph }: { name: string; label: string; def?: string | null; ph?: string }) {
  return (
    <label>
      {label}
      <input name={name} defaultValue={def ?? ""} placeholder={ph} />
    </label>
  );
}
function A({ name, label, def, rows = 3, ph }: { name: string; label: string; def?: string | null; rows?: number; ph?: string }) {
  return (
    <label>
      {label}
      <textarea name={name} rows={rows} defaultValue={def ?? ""} placeholder={ph} />
    </label>
  );
}

function CardFields({ prefix, c }: { prefix: string; c?: ServiceCard | null }) {
  return (
    <div className="adm-2col">
      <T name={`${prefix}_tag`} label="Selo" def={c?.tag} />
      <T name={`${prefix}_title`} label="Título" def={c?.title} />
      <A name={`${prefix}_desc`} label="Descrição" def={c?.desc} rows={2} />
      <A name={`${prefix}_bullets`} label="Itens (um por linha)" def={(c?.bullets ?? []).join("\n")} rows={5} />
      <T name={`${prefix}_ctaLabel`} label="Texto do botão" def={c?.ctaLabel} ph="Conheça mais" />
      <T name={`${prefix}_ctaHref`} label="Link do botão" def={c?.ctaHref} ph="/curadoria-assinada" />
    </div>
  );
}

export function SiteEditor({ content }: { content: SiteContent }) {
  const [state, action] = useFormState(salvarSite, null);
  const s = content;
  const [svc0, svc1] = s.services;
  return (
    <form action={action} className="adm-form adm-site">
      <p className="adm-hint">Tudo que você editar aqui reflete na hora no site. Deixe um campo em branco para escondê-lo (ex.: e-mail ou uma rede social).</p>

      <fieldset className="adm-sec">
        <legend>Contato</legend>
        <T name="email" label="E-mail" def={s.email} ph="contato@quartodahelo.com" />
        <div className="adm-2col">
          <T name="whatsapp" label="WhatsApp (como aparece)" def={s.whatsapp} ph="(11) 93063-9390" />
          <T name="whatsappHref" label="Link do WhatsApp" def={s.whatsappHref} ph="https://wa.me/5511930639390" />
          <T name="horario" label="Horário de atendimento" def={s.horario} ph="9h30 às 17h30" />
          <T name="instagram" label="Instagram (link)" def={s.instagram} ph="https://instagram.com/…" />
          <T name="facebook" label="Facebook (link)" def={s.facebook} ph="https://facebook.com/…" />
        </div>
        <T name="contatoEyebrow" label="Rótulo" def={s.contatoEyebrow} />
        <T name="contatoTitleHtml" label="Título (use <i>…</i> para itálico)" def={s.contatoTitleHtml} />
        <T name="contatoLead" label="Frase" def={s.contatoLead} />
        <T name="contatoPhoto" label="Foto de fundo (caminho)" def={s.contatoPhoto} ph="/images/estudio-contato.jpg" />
      </fieldset>

      <fieldset className="adm-sec">
        <legend>Início (hero)</legend>
        <T name="heroEyebrow" label="Linha de cima" def={s.heroEyebrow} />
        <T name="heroTitleHtml" label="Título (use <i>…</i> para itálico)" def={s.heroTitleHtml} />
        <T name="heroSub" label="Frase abaixo" def={s.heroSub} />
      </fieldset>

      <fieldset className="adm-sec">
        <legend>Sobre nós</legend>
        <T name="quemEyebrow" label="Rótulo" def={s.quemEyebrow} />
        <A name="quemParagraphs" label="Texto (deixe uma linha em branco entre parágrafos)" def={s.quemParagraphs.join("\n\n")} rows={12} />
        <T name="quemClose" label="Frase de fechamento (destaque)" def={s.quemClose} />
        <T name="sobrePhoto" label="Foto de fundo (caminho)" def={s.sobrePhoto} ph="/images/estudio-sobre.jpg" />
      </fieldset>

      <fieldset className="adm-sec">
        <legend>Como trabalhamos</legend>
        <T name="trabalhoEyebrow" label="Rótulo" def={s.trabalhoEyebrow} />
        <T name="trabalhoTitle" label="Título" def={s.trabalhoTitle} />
        <A name="trabalhoLead" label="Frase de apoio" def={s.trabalhoLead} rows={2} />
        <div className="adm-cardbox"><span className="adm-cardname">Card 1 — {svc0?.title ?? "serviço"}</span><CardFields prefix="svc0" c={svc0} /></div>
        <div className="adm-cardbox"><span className="adm-cardname">Card 2 — {svc1?.title ?? "serviço"}</span><CardFields prefix="svc1" c={svc1} /></div>
        <div className="adm-cardbox"><span className="adm-cardname">Card — Produto Digital</span><CardFields prefix="pd" c={s.produtoDigital} /></div>
      </fieldset>

      <fieldset className="adm-sec">
        <legend>Páginas próprias (abertas pelos botões)</legend>
        {[
          { p: "cur", t: "Curadoria Assinada", d: s.curadoriaPage },
          { p: "proj", t: "Projeto Conceito", d: s.projetoPage },
          { p: "dig", t: "Produto Digital", d: s.digitalPage },
        ].map((pg) => (
          <div className="adm-cardbox" key={pg.p}>
            <span className="adm-cardname">{pg.t}</span>
            <div className="adm-2col">
              <T name={`${pg.p}_eyebrow`} label="Rótulo" def={pg.d?.eyebrow} />
              <T name={`${pg.p}_title`} label="Título" def={pg.d?.title ?? pg.t} />
            </div>
            <A name={`${pg.p}_paras`} label="Texto (linha em branco entre parágrafos)" def={(pg.d?.paragraphs ?? []).join("\n\n")} rows={6} />
          </div>
        ))}
      </fieldset>

      <fieldset className="adm-sec">
        <legend>Rodapé</legend>
        <T name="footerTagline" label="Frase do rodapé" def={s.footerTagline} />
      </fieldset>

      <SaveBar />
      <Msg state={state} />
    </form>
  );
}
