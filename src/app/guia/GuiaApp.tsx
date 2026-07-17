"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Category, GuideMeta, PriceTier } from "@/lib/types";
import { TIER_LABEL } from "@/lib/types";

/* ------------------------------------------------------------------ *
 *  Jornada do Guia — o cliente decide item por item e vê o moodboard
 *  se montar em tempo real. Persiste no navegador (localStorage) até o
 *  login por cliente entrar; aí a mesma jornada migra para o Supabase.
 * ------------------------------------------------------------------ */

type ChoiceStatus = "escolhido" | "duvida" | "pulado";

interface LocalChoice {
  status: ChoiceStatus;
  tier?: PriceTier;
  supplierId?: string;
  updatedAt: string;
}

type Choices = Record<string, LocalChoice>;

const STORE_KEY = "qh_guia_choices_v1";
const TIERS: PriceTier[] = ["acessivel", "medio", "alto"];

function loadChoices(): Choices {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Choices) : {};
  } catch {
    return {};
  }
}

const STATUS_CHIP: Record<ChoiceStatus, string> = {
  escolhido: "No moodboard",
  duvida: "Em dúvida",
  pulado: "Pulei",
};

export default function GuiaApp({ categories, guide }: { categories: Category[]; guide: GuideMeta }) {
  const [choices, setChoices] = useState<Choices>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Carrega a jornada salva só no cliente (evita divergência de hidratação).
  useEffect(() => {
    setChoices(loadChoices());
    setHydrated(true);
  }, []);

  // Salva a cada mudança, depois de hidratar.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(choices));
    } catch {
      /* modo privado / quota — segue sem persistir */
    }
  }, [choices, hydrated]);

  const items = useMemo(
    () => categories.flatMap((c) => c.items.filter((i) => i.published).map((i) => ({ item: i, cat: c }))),
    [categories],
  );
  const total = items.length;
  const chosen = useMemo(
    () => items.filter(({ item }) => choices[item.id]?.status === "escolhido"),
    [items, choices],
  );
  const pct = total ? Math.round((chosen.length / total) * 100) : 0;

  function setStatus(itemId: string, status: ChoiceStatus) {
    setChoices((prev) => {
      const cur = prev[itemId];
      // Clicar de novo no mesmo status desmarca.
      if (cur?.status === status) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { ...cur, status, updatedAt: new Date().toISOString() } };
    });
  }

  function setTier(itemId: string, tier: PriceTier) {
    setChoices((prev) => {
      const cur = prev[itemId] ?? { status: "duvida" as ChoiceStatus, updatedAt: new Date().toISOString() };
      const tierSel = cur.tier === tier ? undefined : tier;
      return { ...prev, [itemId]: { ...cur, tier: tierSel, updatedAt: new Date().toISOString() } };
    });
  }

  function toggleOpen(itemId: string) {
    setOpen((p) => ({ ...p, [itemId]: !p[itemId] }));
  }

  return (
    <main className="gpage">
      <div className="wrap">
        <nav className="gback">
          <Link href="/">← Quarto da Helô</Link>
        </nav>

        <header className="ghead">
          <div className="in">
            <div className="eyebrow">Guia digital</div>
            <h1>{guide.name}</h1>
            <p>{guide.promise}</p>
            <div className="progress">
              <div className="bar">
                <i style={{ width: `${pct}%` }} />
              </div>
              <span className="n">
                {chosen.length} de {total} no moodboard
              </span>
            </div>
          </div>
        </header>

        <div className="glayout">
          <div className="gcol">
            {categories.map((c, ci) => {
              const pub = c.items.filter((i) => i.published);
              if (!pub.length) return null;
              return (
                <section className="gcat" key={c.id}>
                  <div className="cn">
                    Etapa {String(ci + 1).padStart(2, "0")}
                  </div>
                  <h2>{c.name}</h2>
                  {c.intro ? <p className="ci">{c.intro}</p> : null}

                  {pub.map((it) => {
                    const ch = choices[it.id];
                    const isOpen = !!open[it.id];
                    const d = it.decision ?? {};
                    const hasDecision = !!(d.quandoUsar || d.quandoNao || d.erroComum || d.efeito || d.instalacao);
                    const selTier = ch?.tier;
                    const supsByTier = (t: PriceTier) => it.suppliers.filter((s) => s.tier === t);
                    const shownSups = selTier ? supsByTier(selTier) : it.suppliers;
                    return (
                      <article className={`gitem${isOpen ? " open" : ""}`} key={it.id}>
                        <div className="top" onClick={() => toggleOpen(it.id)}>
                          <div>
                            <div className="name">{it.name}</div>
                            {it.summary ? <div className="sm">{it.summary}</div> : null}
                          </div>
                          <span className={`chip${ch?.status === "escolhido" ? " on" : ""}`}>
                            {ch ? STATUS_CHIP[ch.status] : "Ver decisão"}
                          </span>
                        </div>

                        <div className="body">
                          {hasDecision ? (
                            <div className="decision">
                              {d.quandoUsar ? (
                                <div className="d">
                                  <b>◆ Quando usar</b>
                                  <span>{d.quandoUsar}</span>
                                </div>
                              ) : null}
                              {d.quandoNao ? (
                                <div className="d">
                                  <b>✕ Quando NÃO usar</b>
                                  <span>{d.quandoNao}</span>
                                </div>
                              ) : null}
                              {d.erroComum ? (
                                <div className="d">
                                  <b>! Erro comum</b>
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
                          ) : (
                            <div className="decision">
                              <p className="empty">A curadoria desta decisão está sendo preparada pela Helô.</p>
                            </div>
                          )}

                          <div className="sup">
                            <div className="lbl">Fornecedores por faixa de investimento</div>
                            <div className="row">
                              {it.suppliers.length ? (
                                TIERS.map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    className={`tierbtn${selTier === t ? " sel" : ""}`}
                                    onClick={() => setTier(it.id, t)}
                                  >
                                    {TIER_LABEL[t]}
                                  </button>
                                ))
                              ) : (
                                <span className="empty">Fornecedores sugeridos chegam pelo painel da Helô.</span>
                              )}
                            </div>
                            {it.suppliers.length && shownSups.length ? (
                              <div className="row" style={{ marginTop: 8 }}>
                                {shownSups.map((s) => (
                                  <span key={s.id} className="tierbtn" style={{ cursor: "default" }}>
                                    {s.url ? (
                                      <a href={s.url} target="_blank" rel="noreferrer">
                                        {s.name}
                                      </a>
                                    ) : (
                                      s.name
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <div className="additem">
                            <button
                              type="button"
                              className={`tierbtn${ch?.status === "escolhido" ? " sel" : ""}`}
                              onClick={() => setStatus(it.id, "escolhido")}
                            >
                              ✓ Colocar no moodboard
                            </button>
                            <button
                              type="button"
                              className={`tierbtn${ch?.status === "duvida" ? " sel" : ""}`}
                              onClick={() => setStatus(it.id, "duvida")}
                            >
                              Ainda em dúvida
                            </button>
                            <button
                              type="button"
                              className={`tierbtn${ch?.status === "pulado" ? " sel" : ""}`}
                              onClick={() => setStatus(it.id, "pulado")}
                            >
                              Pular
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </section>
              );
            })}
          </div>

          <aside className="moodboard">
            <h3>Seu moodboard</h3>
            <p className="hint">Vai se montando com o que você escolhe. Fica salvo neste dispositivo.</p>
            {chosen.length ? (
              <div className="mb-grid">
                {chosen.map(({ item, cat }) => {
                  const t = choices[item.id]?.tier;
                  return (
                    <div className="mb-item" key={item.id}>
                      <div className="mn">{item.name}</div>
                      <div className="mt">
                        {cat.name}
                        {t ? ` · ${TIER_LABEL[t]}` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mb-empty">Nada aqui ainda. Comece marcando o que combina com o seu quarto.</div>
            )}
            <div className="mb-foot">
              {chosen.length
                ? `${chosen.length} ${chosen.length === 1 ? "escolha" : "escolhas"} · ${pct}% do guia`
                : "Cada escolha aparece aqui na hora."}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
