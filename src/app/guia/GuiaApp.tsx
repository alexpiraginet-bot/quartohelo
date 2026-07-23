"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type {
  Category,
  Genero,
  GuestProfile,
  GuideMeta,
  GuidePage,
  Item,
  PriceTier,
  ProductOption,
} from "@/lib/types";
import { GENERO_LABEL, TIER_LABEL } from "@/lib/types";
import { openSupport } from "@/app/_components/Interactive";
import { track } from "@/app/_components/Track";

/* ------------------------------------------------------------------ *
 *  Guia Digital v2 — "Collection Nº 01".
 *  Capa de entrada + menu lateral (referência aprovada pela Helô) +
 *  páginas de conteúdo + 22 categorias com grade 3 faixas × 3 opções por
 *  gênero + MEU PROJETO (moodboard e análise financeira). A jornada
 *  persiste no navegador (localStorage), ancorada por SLUG de item, até o
 *  link por cliente entrar; aí migra para o Supabase.
 * ------------------------------------------------------------------ */

type ChoiceStatus = "escolhido" | "duvida" | "pulado";

interface LocalChoice {
  status: ChoiceStatus;
  optionId?: string;
  genero?: Genero;
  /** Edição manual do valor (R$) — prevalece sobre o preço do catálogo. */
  priceOverrideCents?: number | null;
  updatedAt: string;
}

type Choices = Record<string, LocalChoice>; // chave = slug do item

const STORE_KEY = "qh_guia_v2_jornada";
const ENTER_KEY = "qh_guia_v2_entrou";
const GEN_KEY = "qh_guia_v2_genero";
const DPP_KEY = "qh_guia_v2_dpp";

/** Cronograma vivo: janelas de decisão/encomenda contadas a partir da data
 *  prevista de chegada (prazos de produção de 30–90 dias considerados). */
const CRONO: { semanas: number; titulo: string; desc: string; slugs: string[] }[] = [
  {
    semanas: 20,
    titulo: "Conceito e papel de parede",
    desc: "Defina a atmosfera do quarto e o papel de parede — tudo dialoga com ele.",
    slugs: ["papel-de-parede"],
  },
  {
    semanas: 16,
    titulo: "Berço e marcenaria",
    desc: "Berço, armário e cômoda levam de 30 a 90 dias de produção. É a hora de encomendar.",
    slugs: ["berco", "armario", "comoda"],
  },
  {
    semanas: 14,
    titulo: "Assentos e apoios",
    desc: "Poltrona de amamentação, cama auxiliar e mesa lateral.",
    slugs: ["poltrona-de-amamentacao", "cama-auxiliar", "mesa-lateral"],
  },
  {
    semanas: 10,
    titulo: "Iluminação e pontos elétricos",
    desc: "Arandelas, abajur e pendente — os pontos elétricos vêm antes do acabamento.",
    slugs: ["arandelas", "abajur", "pendente"],
  },
  {
    semanas: 8,
    titulo: "Têxteis e enxoval",
    desc: "Cortina, tapete, enxovais, almofadas, trocador e porta-treco.",
    slugs: [
      "tapete",
      "cortina",
      "enxoval-berco",
      "enxoval-cama",
      "almofadas-decorativas",
      "almofada-de-amamentacao",
      "trocador",
      "porta-treco",
    ],
  },
  {
    semanas: 6,
    titulo: "Complementos",
    desc: "Kit higiene e adornos — os detalhes que fecham o ambiente.",
    slugs: ["kit-higiene", "adornos"],
  },
  {
    semanas: 4,
    titulo: "Montagem final",
    desc: "Quarto montado, enxoval lavado e cada coisa no seu lugar.",
    slugs: [],
  },
  {
    semanas: 2,
    titulo: "Mala pronta",
    desc: "Mala maternidade e bolsa de passeio prontas na porta.",
    slugs: ["mala-maternidade", "bolsa-de-passeio"],
  },
];

/** Ordem do documento: primeira linha os mais altos, última os acessíveis. */
const TIER_ORDER: PriceTier[] = ["alto", "medio", "acessivel"];
const GENEROS: Genero[] = ["menina", "neutro", "menino"];

type View =
  | { kind: "inicio" }
  | { kind: "pagina"; slug: string }
  | { kind: "projeto" }
  | { kind: "categoria"; slug: string };

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

function parseBRLInput(s: string): number | null {
  const t = s.replace(/[^\d.,]/g, "");
  if (!t) return null;
  const norm = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const v = Number(norm);
  return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const Ico = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const I_HOME = "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z";
const I_BOOK = "M12 6C10 4 7 4 4 5v13c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1v13";
const I_HEART = "M12 20S5 15.5 3 11c-1.2-2.8.6-6 3.8-6C9 5 10.7 6.6 12 8c1.3-1.4 3-3 5.2-3C20.4 5 22.2 8.2 21 11c-2 4.5-9 9-9 9z";

export default function GuiaApp({
  categories,
  guide,
  pages,
  options,
  profile,
}: {
  categories: Category[];
  guide: GuideMeta;
  pages: GuidePage[];
  options: ProductOption[];
  profile: GuestProfile;
}) {
  const [choices, setChoices] = useState<Choices>({});
  const [genero, setGenero] = useState<Genero>("neutro");
  const [entered, setEntered] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>({ kind: "inicio" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [dpp, setDpp] = useState<string>("");
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChoices(loadJSON<Choices>(STORE_KEY, {}));
    try {
      if (window.localStorage.getItem(ENTER_KEY) === "1") setEntered(true);
      const g = window.localStorage.getItem(GEN_KEY) as Genero | null;
      if (g && GENEROS.includes(g)) setGenero(g);
      setDpp(window.localStorage.getItem(DPP_KEY) ?? "");
    } catch {
      /* segue sem persistência */
    }
    setHydrated(true);
    track("visita_guia");
  }, []);

  function saveDpp(v: string) {
    setDpp(v);
    try {
      if (v) window.localStorage.setItem(DPP_KEY, v);
      else window.localStorage.removeItem(DPP_KEY);
    } catch {}
  }

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(choices));
    } catch {
      /* modo privado / quota — segue sem persistir */
    }
  }, [choices, hydrated]);

  useEffect(() => {
    setMenuOpen(false);
    mainRef.current?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0 });
    if (view.kind === "projeto") track("projeto_visto");
  }, [view]);

  const allEntries = useMemo(
    () => categories.flatMap((c) => c.items.filter((i) => i.published).map((item) => ({ item, cat: c }))),
    [categories],
  );
  const bySlug = useMemo(() => new Map(allEntries.map((e) => [e.item.slug, e])), [allEntries]);
  const optionsBySlug = useMemo(() => {
    const m = new Map<string, ProductOption[]>();
    for (const o of options) {
      const arr = m.get(o.itemSlug) ?? [];
      arr.push(o);
      m.set(o.itemSlug, arr);
    }
    return m;
  }, [options]);
  const optionById = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);

  const total = allEntries.length;
  const decididos = useMemo(
    () => allEntries.filter(({ item }) => choices[item.slug]?.status === "escolhido"),
    [allEntries, choices],
  );
  const pct = total ? Math.round((decididos.length / total) * 100) : 0;

  const effectivePrice = (slug: string): number | null => {
    const ch = choices[slug];
    if (!ch) return null;
    if (ch.priceOverrideCents != null) return ch.priceOverrideCents;
    const opt = ch.optionId ? optionById.get(ch.optionId) : undefined;
    return opt?.priceCents ?? null;
  };
  const totalCents = decididos.reduce((sum, { item }) => sum + (effectivePrice(item.slug) ?? 0), 0);

  function pickGenero(g: Genero) {
    setGenero(g);
    try {
      window.localStorage.setItem(GEN_KEY, g);
    } catch {}
  }

  function chooseOption(slug: string, opt: ProductOption) {
    if (choices[slug]?.optionId !== opt.id) {
      track("escolha_item", { item: slug, tier: opt.tier, genero: opt.genero });
    }
    setChoices((prev) => {
      const cur = prev[slug];
      if (cur?.optionId === opt.id) {
        const next = { ...prev };
        delete next[slug];
        return next;
      }
      return {
        ...prev,
        [slug]: {
          status: "escolhido",
          optionId: opt.id,
          genero: opt.genero,
          priceOverrideCents: undefined,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }

  function setStatus(slug: string, status: ChoiceStatus) {
    setChoices((prev) => {
      const cur = prev[slug];
      if (cur?.status === status && !cur.optionId) {
        const next = { ...prev };
        delete next[slug];
        return next;
      }
      return { ...prev, [slug]: { status, genero, updatedAt: new Date().toISOString() } };
    });
  }

  function setOverride(slug: string, cents: number | null) {
    setChoices((prev) => {
      const cur = prev[slug];
      if (!cur) return prev;
      return { ...prev, [slug]: { ...cur, priceOverrideCents: cents, updatedAt: new Date().toISOString() } };
    });
  }

  function removeChoice(slug: string) {
    setChoices((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }

  function enter() {
    setEntered(true);
    track("entrou_guia");
    try {
      window.localStorage.setItem(ENTER_KEY, "1");
    } catch {}
  }

  /* ------------------------------- capa ------------------------------- */
  if (!entered) {
    return (
      <div className="g2cover">
        <div className="in">
          <img className="crest" src="/images/brasao-creme.png" alt="Brasão Quarto da Helô" />
          <div className="eyebrow">Quarto da Helô · {guide.collection ?? "Collection Nº 01"}</div>
          <h1 className="serif">{guide.coverTitle ?? "Do conceito ao último detalhe"}</h1>
          <p>{guide.coverSub ?? "O guia completo para montar o quarto do seu bebê."}</p>
          <button type="button" className="btn primary" onClick={enter}>
            Entrar no guia
          </button>
          <Link className="site" href="/">
            quartodahelo.com
          </Link>
        </div>
      </div>
    );
  }

  const firstName = profile.motherName.split(" ")[0];

  const statusDot = (slug: string) => {
    const st = choices[slug]?.status;
    if (st === "escolhido") return <span className="dot on" title="Decidido" />;
    if (st === "duvida") return <span className="dot half" title="Em dúvida" />;
    return null;
  };

  const navTo = (v: View) => () => setView(v);

  const isActive = (v: View) =>
    (view.kind === v.kind &&
      ((v.kind !== "pagina" && v.kind !== "categoria") ||
        ("slug" in v && "slug" in view && view.slug === v.slug))) ||
    false;

  /* ------------------------------ visões ------------------------------ */

  function OrderBump({ compact = false }: { compact?: boolean }) {
    return (
      <aside className={`g2bump${compact ? " mini" : ""}`}>
        <div className="in">
          <span className="k">Curadoria Assinada · Projeto Conceito</span>
          <b className="serif">Prefere que a gente cuide de tudo?</b>
          <p>
            Este guia foi feito para você montar o quarto com autonomia e segurança. Mas se em algum momento você
            sentir que prefere entregar tudo em nossas mãos, nós estamos aqui.
          </p>
          <p>
            Na Curadoria Assinada e no Projeto Conceito, cuidamos de cada detalhe por você: do conceito ao último
            bordado, com a intermediação direta junto aos fornecedores. Você não decide nada sozinha, cada escolha
            chega pronta e em harmonia com o todo.
          </p>
          <button
            type="button"
            className="btn wine"
            onClick={() => {
              track("interesse_marcenaria");
              openSupport();
            }}
          >
            Para conhecer, é só falar com a gente
          </button>
        </div>
      </aside>
    );
  }

  const hoje = new Date();
  const dppDate = dpp ? new Date(`${dpp}T12:00:00`) : null;
  const semanasRestantes = dppDate ? Math.ceil((dppDate.getTime() - hoje.getTime()) / (7 * 24 * 3600 * 1000)) : null;
  const fmtData = (d: Date) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);

  function CronogramaVivo() {
    const proxima = dppDate
      ? CRONO.find((m) => new Date(dppDate.getTime() - m.semanas * 7 * 24 * 3600 * 1000) >= hoje)
      : null;
    return (
      <section className="g2crono">
        <div className="g2crono-head">
          <div>
            <b className="serif">O seu cronograma</b>
            {dppDate ? (
              <p>
                {semanasRestantes != null && semanasRestantes > 0
                  ? `Faltam ${semanasRestantes} ${semanasRestantes === 1 ? "semana" : "semanas"} para a chegada. As janelas abaixo já estão nas suas datas.`
                  : "A chegada é agora! Priorize o que ainda estiver aberto."}
              </p>
            ) : (
              <p>Conte quando o bebê chega e cada janela abaixo ganha a sua data certa, cruzada com as suas decisões.</p>
            )}
          </div>
          <label className="g2dpp">
            Data prevista da chegada
            <input type="date" value={dpp} onChange={(e) => saveDpp(e.target.value)} />
          </label>
        </div>
        <ol className="g2tl">
          {CRONO.map((m) => {
            const data = dppDate ? new Date(dppDate.getTime() - m.semanas * 7 * 24 * 3600 * 1000) : null;
            const itens = m.slugs.map((s) => bySlug.get(s)).filter(Boolean);
            const decididosNa = m.slugs.filter((s) => choices[s]?.status === "escolhido").length;
            const completa = itens.length > 0 && decididosNa === itens.length;
            const passada = data ? data < hoje && !completa : false;
            const atual = proxima === m;
            return (
              <li
                key={m.semanas}
                className={`${completa ? "ok" : ""}${passada ? " late" : ""}${atual ? " now" : ""}`}
              >
                <span className="when">
                  {data ? fmtData(data) : `${m.semanas} sem. antes`}
                  {atual ? <i>você está aqui</i> : null}
                </span>
                <div className="what">
                  <b>
                    {m.titulo}
                    {completa ? " ✓" : ""}
                  </b>
                  <p>{m.desc}</p>
                  {itens.length ? (
                    <span className="st">
                      {decididosNa}/{itens.length} decididos
                      {passada ? " · janela passada — priorize" : ""}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  function renderInicio() {
    return (
      <div className="g2view g2welcome">
        <div className="brasao-bg" aria-hidden="true" />
        <div className="in">
          <div className="eyebrow">Bem-vinda ao seu guia · {guide.collection ?? "Collection Nº 01"}</div>
          <h1 className="serif g2h1">Olá, {firstName}.</h1>
          <p className="lead-title serif">
            DO CONCEITO AO ÚLTIMO DETALHE: O guia completo para montar o quarto do seu bebê.
          </p>
          <p className="lead-sub">
            A beleza é a forma mais pura de cuidado e o primeiro cenário de uma vida merece ser impecável.
          </p>
          <p className="lead-sub">
            Aqui você encontrará o método, o critério e o olhar da Helô para você executar com primor.
          </p>
        </div>
      </div>
    );
  }

  function renderPagina(slug: string) {
    const page = pages.find((p) => p.slug === slug);
    if (!page) return null;
    return (
      <div className="g2view">
        {page.eyebrow ? <div className="eyebrow">{page.eyebrow}</div> : null}
        <h1 className="serif g2h1">{page.title}</h1>
        {!page.ready ? (
          <span className="g2chip">Texto provisório — o conteúdo oficial da Helô entra pelo painel</span>
        ) : null}
        <div className="g2prose">
          {page.paragraphs.map((p, i) => {
            const t = p.trim();
            // Linha de dica (começa com ✦) → card destacado "Dica da Helô".
            if (t.startsWith("✦")) {
              const raw = t.replace(/^✦\s*/, "");
              // Separa o rótulo "Dica da Helô" do corpo (separador — ou :).
              const m = raw.match(/^Dica da Hel[ôo]\s*[—:-]\s*(.+)$/is);
              const body = m ? m[1] : raw;
              return (
                <aside className="g2dica page" key={i}>
                  <span className="ic" aria-hidden="true">◆</span>
                  <div className="bd">
                    <b className="serif">Dica da Helô</b>
                    <p>{body}</p>
                  </div>
                </aside>
              );
            }
            // Cabeçalho de mês (ex.: "4° MÊS — ...") → título de seção.
            if (/^\d+\s*°?\s*m[êe]s\b/i.test(t)) {
              return (
                <h3 className="g2ph" key={i}>
                  {t}
                </h3>
              );
            }
            return <p key={i}>{t}</p>;
          })}
        </div>
        {page.cards?.length ? (
          <div className="g2cards">
            {page.cards.map((c, i) => (
              <div className="c" key={i}>
                <div className="n serif">{c.n}</div>
                <b>{c.title}</b>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        ) : null}
        {page.closing ? <blockquote className="g2quote serif">{page.closing}</blockquote> : null}
        {page.slug === "cronograma" ? <CronogramaVivo /> : null}
      </div>
    );
  }

  function renderCategoria(slug: string) {
    const entry = bySlug.get(slug);
    if (!entry) return null;
    const { item, cat } = entry;
    const ch = choices[slug];
    const d = item.decision ?? {};
    const hasDecision = !!(d.quandoUsar || d.quandoNao || d.erroComum || d.efeito || d.instalacao);
    const idx = allEntries.findIndex((e) => e.item.slug === slug);
    const prev = idx > 0 ? allEntries[idx - 1] : null;
    const next = idx < allEntries.length - 1 ? allEntries[idx + 1] : null;
    const itemOpts = optionsBySlug.get(slug) ?? [];
    const chosenOpt = ch?.optionId ? optionById.get(ch.optionId) : undefined;

    return (
      <div className="g2view">
        <div className="eyebrow">{cat.name}</div>
        <h1 className="serif g2h1">{item.name}</h1>
        {item.summary ? <p className="g2lead">{item.summary}</p> : null}
        {chosenOpt || ch?.status ? (
          <span className={`g2chip${ch?.status === "escolhido" ? " ok" : ""}`}>
            {ch?.status === "escolhido"
              ? chosenOpt
                ? `No seu projeto: ${chosenOpt.name}${effectivePrice(slug) != null ? ` · ${brl(effectivePrice(slug)!)}` : ""}`
                : "No seu projeto (escolha própria)"
              : ch?.status === "duvida"
                ? "Marcado: ainda em dúvida"
                : "Marcado: pulado por agora"}
          </span>
        ) : null}

        {hasDecision ? (
          <section className="g2dec">
            <div className="lbl">A decisão, pelo olhar da Helô</div>
            <div className="grid">
              {d.quandoUsar ? (
                <div className="d">
                  <b>◆ Quando usar</b>
                  <span>{d.quandoUsar}</span>
                </div>
              ) : null}
              {d.quandoNao ? (
                <div className="d">
                  <b>✕ Quando não usar</b>
                  <span>{d.quandoNao}</span>
                </div>
              ) : null}
              {d.erroComum ? (
                <div className="d">
                  <b>! Erro mais comum</b>
                  <span>{d.erroComum}</span>
                </div>
              ) : null}
              {d.efeito ? (
                <div className="d">
                  <b>♦ O efeito no quarto</b>
                  <span>{d.efeito}</span>
                </div>
              ) : null}
              {d.instalacao ? (
                <div className="d">
                  <b>⚙ Instalação</b>
                  <span>{d.instalacao}</span>
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="g2dec">
            <div className="lbl">A decisão, pelo olhar da Helô</div>
            <p className="empty">A curadoria desta decisão está sendo preparada.</p>
          </section>
        )}

        {d.dicaHelo ? (
          <aside className="g2dica">
            <span className="ic" aria-hidden="true">◆</span>
            <div className="bd">
              <b className="serif">Dica da Helô</b>
              <p>{d.dicaHelo}</p>
            </div>
          </aside>
        ) : null}

        <section className="g2opts">
          <div className="g2gen">
            <span className="lbl">Variação do quarto</span>
            <div className="pills">
              {GENEROS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`pill${genero === g ? " sel" : ""}`}
                  onClick={() => pickGenero(g)}
                >
                  {GENERO_LABEL[g]}
                </button>
              ))}
            </div>
          </div>

          {TIER_ORDER.map((tier) => {
            const row = itemOpts
              .filter((o) => o.genero === genero && o.tier === tier)
              .sort((a, b) => a.order - b.order)
              .slice(0, 3);
            return (
              <div className="g2tier" key={tier}>
                <div className="tl">{TIER_LABEL[tier]}</div>
                <div className="row">
                  {row.map((o) => {
                    const sel = ch?.optionId === o.id;
                    const shownPrice = sel && ch?.priceOverrideCents != null ? ch.priceOverrideCents : o.priceCents;
                    return (
                      <article className={`g2card${sel ? " sel" : ""}`} key={o.id}>
                        <div className="ph">
                          {o.photoUrl ? (
                            <img src={o.photoUrl} alt={o.name} loading="lazy" />
                          ) : (
                            <span className="serif">{o.name}</span>
                          )}
                          {o.exemplo ? <i className="ex">exemplo</i> : null}
                        </div>
                        <div className="bd">
                          <div className="nm">{o.name}</div>
                          <div className="pr serif">{shownPrice != null ? brl(shownPrice) : "Valor em definição"}</div>
                          {o.supplier ? <div className="sp">{o.supplier}</div> : null}
                          {o.url ? (
                            <a
                              className="lk"
                              href={o.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => track("clique_fornecedor", { item: slug, url: o.url })}
                            >
                              Ver no fornecedor ↗
                            </a>
                          ) : null}
                          <button type="button" className={`pick${sel ? " on" : ""}`} onClick={() => chooseOption(slug, o)}>
                            {sel ? "✓ No meu projeto" : "Escolher"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {Array.from({ length: Math.max(0, 3 - row.length) }).map((_, i) => (
                    <div className="g2slot" key={i}>
                      <span>Em curadoria</span>
                      <i>A seleção da Helô para esta faixa entra em breve.</i>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="g2acts">
            <button
              type="button"
              className={`pill${ch?.status === "escolhido" && !ch.optionId ? " sel" : ""}`}
              onClick={() => setStatus(slug, "escolhido")}
            >
              ✓ Decidi por fora do guia
            </button>
            <button
              type="button"
              className={`pill${ch?.status === "duvida" ? " sel" : ""}`}
              onClick={() => setStatus(slug, "duvida")}
            >
              Ainda em dúvida
            </button>
            <button
              type="button"
              className={`pill${ch?.status === "pulado" ? " sel" : ""}`}
              onClick={() => setStatus(slug, "pulado")}
            >
              Pular por agora
            </button>
          </div>
        </section>

        {slug === "armario" || slug === "comoda" ? <OrderBump compact /> : null}

        <nav className="g2pn">
          {prev ? (
            <button type="button" onClick={navTo({ kind: "categoria", slug: prev.item.slug })}>
              ← {prev.item.name}
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button type="button" onClick={navTo({ kind: "categoria", slug: next.item.slug })}>
              {next.item.name} →
            </button>
          ) : (
            <button type="button" onClick={navTo({ kind: "projeto" })}>
              Ver meu projeto →
            </button>
          )}
        </nav>
      </div>
    );
  }

  function FinRow({ slug, item, cat }: { slug: string; item: Item; cat: Category }) {
    const ch = choices[slug];
    const opt = ch?.optionId ? optionById.get(ch.optionId) : undefined;
    const price = effectivePrice(slug);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const start = () => {
      setDraft(price != null ? (price / 100).toFixed(2).replace(".", ",") : "");
      setEditing(true);
    };
    const commit = () => {
      setEditing(false);
      const cents = parseBRLInput(draft);
      const base = opt?.priceCents ?? null;
      // Igual ao preço do catálogo (ou vazio sem catálogo) = sem ajuste manual.
      setOverride(slug, cents != null && cents !== base ? cents : cents === base ? null : null);
    };
    return (
      <div className="g2frow">
        <div className="fi">
          <b>{item.name}</b>
        <span>
            {opt ? opt.name : "Escolha própria"}
            {" · "}
            {cat.name}
            {ch?.priceOverrideCents != null ? " · valor ajustado por você" : ""}
          </span>
        </div>
        {editing ? (
          <input
            className="fv"
            autoFocus
            inputMode="decimal"
            value={draft}
            placeholder="0,00"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <button type="button" className="fv btnlike" onClick={start} title="Toque para ajustar o valor">
            {price != null ? brl(price) : "Definir valor"}
          </button>
        )}
        <button type="button" className="fx" onClick={() => removeChoice(slug)} title="Tirar do projeto">
          ✕
        </button>
      </div>
    );
  }

  function renderProjeto() {
    return (
      <div className="g2view">
        <div className="eyebrow">O seu quarto, escolha a escolha</div>
        <h1 className="serif g2h1">Meu projeto</h1>

        <div className="g2how">
          <b>Como funciona</b>
          <p>
            Tudo que você marca nas categorias aparece aqui na hora: a foto compõe o seu moodboard e o valor entra na
            análise financeira, somado automaticamente. Toque em qualquer valor para ajustar — o ajuste vale só para o
            seu projeto.
          </p>
        </div>

        <section className="g2sec-b">
          <h2 className="serif">Moodboard</h2>
          {decididos.length ? (
            <div className="g2mb">
              {decididos.map(({ item, cat }) => {
                const ch = choices[item.slug];
                const opt = ch?.optionId ? optionById.get(ch.optionId) : undefined;
                return (
                  <figure className="t" key={item.slug}>
                    <div className="ph">
                      {opt?.photoUrl ? (
                        <img src={opt.photoUrl} alt={opt.name} loading="lazy" />
                      ) : (
                        <span className="serif">{opt?.name ?? item.name}</span>
                      )}
                    </div>
                    <figcaption>
                      <b>{opt?.name ?? `${item.name} · escolha própria`}</b>
                      <span>
                        {item.name} · {cat.name}
                        {opt ? ` · ${TIER_LABEL[opt.tier]}` : ""}
                      </span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ) : (
            <p className="g2empty">
              Seu moodboard ainda está em branco. Comece pelas categorias no menu — cada escolha aparece aqui na hora.
            </p>
          )}
        </section>

        <section className="g2sec-b">
          <h2 className="serif">Análise financeira</h2>
          {decididos.length ? (
            <div className="g2fin">
              {decididos.map(({ item, cat }) => (
                <FinRow key={item.slug} slug={item.slug} item={item} cat={cat} />
              ))}
              <div className="g2frow total">
                <div className="fi">
                  <b>Total do projeto</b>
                  <span>
                    {decididos.length} {decididos.length === 1 ? "item" : "itens"} · {pct}% do guia decidido
                  </span>
                </div>
                <div className="fv serif tt">{brl(totalCents)}</div>
                <span className="fx" />
              </div>
            </div>
          ) : (
            <p className="g2empty">Os valores das suas escolhas aparecem aqui, item a item e somados.</p>
          )}
          <p className="g2note">
            Os valores têm como base os preços de {guide.precoDataBase ?? "quando o guia foi elaborado"}. Se algo
            mudou no fornecedor, toque no valor e ajuste — o total recalcula na hora.
          </p>
        </section>

        <OrderBump />
      </div>
    );
  }

  /* ------------------------------ layout ------------------------------ */

  return (
    <div className="g2">
      <aside className={`g2side${menuOpen ? " open" : ""}`}>
        <div className="brand">
          <img src="/images/helo-script-caramelo.png" alt="Helô" className="script" />
          <span className="col">{guide.collection ?? "Collection Nº 01"}</span>
        </div>

        <nav className="g2nav">
          <button type="button" className={`g2link${isActive({ kind: "inicio" }) ? " act" : ""}`} onClick={navTo({ kind: "inicio" })}>
            <Ico d={I_HOME} />
            <span>Visão geral</span>
          </button>

          <div className="g2sec">O guia</div>
          {pages.map((p) => (
            <button
              key={p.slug}
              type="button"
              className={`g2link${isActive({ kind: "pagina", slug: p.slug }) ? " act" : ""}`}
              onClick={navTo({ kind: "pagina", slug: p.slug })}
            >
              <Ico d={I_BOOK} />
              <span>{p.title.split(" — ")[0]}</span>
            </button>
          ))}

          <button type="button" className={`g2link proj${isActive({ kind: "projeto" }) ? " act" : ""}`} onClick={navTo({ kind: "projeto" })}>
            <Ico d={I_HEART} />
            <span>Meu projeto</span>
            {decididos.length ? <em>{decididos.length}</em> : null}
          </button>

          {categories.map((c) => {
            const pub = c.items.filter((i) => i.published);
            if (!pub.length) return null;
            const done = pub.filter((i) => choices[i.slug]?.status === "escolhido").length;
            return (
              <div key={c.id}>
                <div className="g2sec">
                  {c.name}
                  <i>
                    {done}/{pub.length}
                  </i>
                </div>
                {pub.map((i) => (
                  <button
                    key={i.slug}
                    type="button"
                    className={`g2link cat${isActive({ kind: "categoria", slug: i.slug }) ? " act" : ""}`}
                    onClick={navTo({ kind: "categoria", slug: i.slug })}
                  >
                    <span>{i.name}</span>
                    {statusDot(i.slug)}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="g2foot">
          <div className="g2prog">
            <div className="bar">
              <i style={{ width: `${pct}%` }} />
            </div>
            <span>
              {decididos.length} de {total} decididos
            </span>
          </div>
          <div className="g2user">
            <span className="av plain">
              <img src="/images/brasao-creme.png" alt="" aria-hidden="true" />
            </span>
            <span className="who">
              <b>{profile.motherName}</b>
              <span>Quarto da {profile.babyName}</span>
            </span>
          </div>
        </div>
      </aside>

      {menuOpen ? <div className="g2scrim" onClick={() => setMenuOpen(false)} /> : null}

      <div className="g2main" ref={mainRef}>
        <header className="g2top">
          <button type="button" className="g2burger" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <span />
            <span />
            <span />
          </button>
          <span className="baby">
            Quarto da {profile.babyName} <i>· {guide.collection ?? "Collection Nº 01"}</i>
          </span>
          <Link className="out" href="/">
            Quarto da Helô →
          </Link>
        </header>

        {view.kind === "inicio"
          ? renderInicio()
          : view.kind === "pagina"
            ? renderPagina(view.slug)
            : view.kind === "projeto"
              ? renderProjeto()
              : renderCategoria(view.slug)}
      </div>
    </div>
  );
}
