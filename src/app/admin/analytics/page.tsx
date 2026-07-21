import { serverClient } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

// Dashboard de acessos e conversões, lido direto de qh_analytics_events.
// Agregação simples no servidor: últimos 30 dias, sem dependências externas.

const KIND_LABEL: Record<string, string> = {
  visita_site: "Visitas ao site",
  visita_guia: "Visitas ao guia",
  entrou_guia: "Entraram no guia",
  escolha_item: "Escolhas de itens",
  projeto_visto: "Viram o Meu Projeto",
  clique_fornecedor: "Cliques em fornecedor",
  interesse_marcenaria: "Interesse na marcenaria",
};

interface Row {
  kind: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export default async function AnalyticsAdmin() {
  const db = serverClient();

  if (!db) {
    return (
      <div className="adm-wrap">
        <h1 className="adm-h">Acessos e conversões</h1>
        <div className="adm-state off" style={{ marginTop: 18 }}>
          <b>Coleta ainda não ativada.</b> Os eventos passam a ser gravados assim que a chave
          <code> SUPABASE_SERVICE_ROLE_KEY</code> estiver configurada na Vercel. O site e o guia já estão preparados
          para registrar visitas, entradas, escolhas e cliques.
        </div>
      </div>
    );
  }

  const desde = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data, error } = await db
    .from("qh_analytics_events")
    .select("kind, meta, created_at")
    .gte("created_at", desde)
    .order("created_at", { ascending: false })
    .limit(20000);

  if (error) {
    return (
      <div className="adm-wrap">
        <h1 className="adm-h">Acessos e conversões</h1>
        <div className="adm-state off" style={{ marginTop: 18 }}>
          <b>Não consegui ler os eventos.</b> {error.message}. Se o banco ainda não foi provisionado, rode o
          <code> supabase/schema.sql</code> no SQL Editor do Supabase.
        </div>
      </div>
    );
  }

  const rows = (data ?? []) as Row[];
  const now = Date.now();
  const h24 = now - 24 * 3600 * 1000;
  const d7 = now - 7 * 24 * 3600 * 1000;

  const count = (kind: string, sinceMs?: number) =>
    rows.filter((r) => r.kind === kind && (!sinceMs || new Date(r.created_at).getTime() >= sinceMs)).length;

  const kinds = Object.keys(KIND_LABEL);

  // Funil do guia (30 dias)
  const fVisita = count("visita_guia");
  const fEntrou = count("entrou_guia");
  const fEscolha = count("escolha_item");
  const fProjeto = count("projeto_visto");
  const fFornecedor = count("clique_fornecedor");
  const funil = [
    { label: "Visitaram o guia", n: fVisita },
    { label: "Entraram (capa)", n: fEntrou },
    { label: "Escolheram itens", n: fEscolha },
    { label: "Viram o Meu Projeto", n: fProjeto },
    { label: "Clicaram em fornecedor", n: fFornecedor },
  ];
  const fMax = Math.max(1, ...funil.map((f) => f.n));

  // Série diária (14 dias): visitas ao guia × escolhas
  const dias: { label: string; visitas: number; escolhas: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 3600 * 1000);
    const key = d.toISOString().slice(0, 10);
    dias.push({
      label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d).slice(0, 5),
      visitas: rows.filter((r) => r.kind === "visita_guia" && r.created_at.slice(0, 10) === key).length,
      escolhas: rows.filter((r) => r.kind === "escolha_item" && r.created_at.slice(0, 10) === key).length,
    });
  }
  const dMax = Math.max(1, ...dias.map((d) => Math.max(d.visitas, d.escolhas)));

  // Itens mais escolhidos (30 dias)
  const porItem = new Map<string, number>();
  for (const r of rows) {
    if (r.kind !== "escolha_item") continue;
    const item = typeof r.meta?.item === "string" ? (r.meta.item as string) : "—";
    porItem.set(item, (porItem.get(item) ?? 0) + 1);
  }
  const topItens = [...porItem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const tMax = Math.max(1, ...topItens.map(([, n]) => n));

  return (
    <div className="adm-wrap">
      <h1 className="adm-h">Acessos e conversões</h1>
      <p className="adm-sub">
        Últimos 30 dias, direto do nosso banco (sem cookies de terceiros). {rows.length} eventos registrados.
      </p>

      <div className="adm-cards ana">
        {kinds.map((k) => (
          <div className="adm-card" key={k}>
            <div className="k">{KIND_LABEL[k]}</div>
            <div className="big">{count(k)}</div>
            <p>
              hoje {count(k, h24)} · 7 dias {count(k, d7)}
            </p>
          </div>
        ))}
      </div>

      <div className="adm-section">
        <h2>Funil do guia (30 dias)</h2>
        <div className="adm-cat">
          <div className="ana-funil">
            {funil.map((f, i) => (
              <div className="row" key={f.label}>
                <span className="lb">{f.label}</span>
                <div className="bar">
                  <i style={{ width: `${Math.round((f.n / fMax) * 100)}%` }} />
                </div>
                <span className="n">
                  {f.n}
                  {i > 0 && funil[0].n > 0 ? ` · ${Math.round((f.n / funil[0].n) * 100)}%` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="adm-section">
        <h2>Dia a dia (14 dias)</h2>
        <div className="adm-cat">
          <div className="ana-chart">
            {dias.map((d) => (
              <div className="col" key={d.label} title={`${d.label}: ${d.visitas} visitas · ${d.escolhas} escolhas`}>
                <div className="bars">
                  <i className="v" style={{ height: `${Math.round((d.visitas / dMax) * 100)}%` }} />
                  <i className="e" style={{ height: `${Math.round((d.escolhas / dMax) * 100)}%` }} />
                </div>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
          <div className="ana-leg">
            <span>
              <i className="v" /> Visitas ao guia
            </span>
            <span>
              <i className="e" /> Escolhas de itens
            </span>
          </div>
        </div>
      </div>

      <div className="adm-section">
        <h2>Itens mais escolhidos (30 dias)</h2>
        <div className="adm-cat">
          {topItens.length ? (
            <div className="ana-funil">
              {topItens.map(([item, n]) => (
                <div className="row" key={item}>
                  <span className="lb">{item.replace(/-/g, " ")}</span>
                  <div className="bar">
                    <i style={{ width: `${Math.round((n / tMax) * 100)}%` }} />
                  </div>
                  <span className="n">{n}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Ainda sem escolhas registradas. Assim que as clientes começarem a usar o guia, os itens mais escolhidos
              aparecem aqui.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
