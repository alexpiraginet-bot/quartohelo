// Edge Function qh-admin — login + gravação do painel + clientes/jornada do guia.
// Roda no Supabase com a service role NATIVA (env injetada), então tudo funciona
// sem depender de variáveis na Vercel. Autenticação do admin: senha (hash em
// qh_admin_config) -> token = sha256(service_key + "::" + hash). As ações de
// cliente por LINK usam o access_code (o segredo do link pessoal) como chave.
import { createClient } from "jsr:@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(URL, SERVICE, { auth: { persistSession: false } });
const BUCKET = "qh-fotos";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const hashSenha = (senha: string) => sha256hex("qh-admin::" + senha);
const tokenFor = (hash: string) => sha256hex(SERVICE + "::" + hash);
const genCode = () => (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");

async function currentHash(): Promise<string | null> {
  const { data } = await db.from("qh_admin_config").select("password_hash").eq("id", "main").maybeSingle();
  return data?.password_hash ?? null;
}
async function authed(token: unknown): Promise<boolean> {
  if (typeof token !== "string" || !token) return false;
  const h = await currentHash();
  if (!h) return false;
  return token === (await tokenFor(h));
}

// deno-lint-ignore no-explicit-any
async function clientByCode(code: unknown): Promise<any | null> {
  if (typeof code !== "string" || code.length < 16) return null;
  const { data } = await db.from("qh_clients").select("*").eq("access_code", code).maybeSingle();
  return data ?? null;
}

async function uploadFoto(dataUrl: string, itemSlug: string, genero: string, tier: string): Promise<string | null> {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  const mime = m[1];
  const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
  const ext = (mime.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "") || "jpg";
  const path = `opcoes/${itemSlug}/${genero}-${tier}-${Date.now()}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, bytes, { contentType: mime, upsert: true });
  if (error) throw new Error("upload: " + error.message);
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, msg: "Método inválido." }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, msg: "Corpo inválido." }, 400);
  }
  const action = String(body.action ?? "");
  const token = body.token;
  const S = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");

  try {
    /* ============ PÚBLICO ============ */

    if (action === "event") {
      const kind = String(body.kind ?? "");
      const KINDS = new Set([
        "visita_site", "visita_guia", "entrou_guia", "escolha_item",
        "projeto_visto", "clique_fornecedor", "interesse_marcenaria", "signup",
      ]);
      if (!KINDS.has(kind)) return json({ ok: true });
      let meta: unknown = null;
      if (body.meta && typeof body.meta === "object" && JSON.stringify(body.meta).length <= 2000) meta = body.meta;
      await db.from("qh_analytics_events").insert({ kind, meta });
      return json({ ok: true });
    }

    if (action === "login") {
      const senha = S("senha");
      if (!senha) return json({ ok: false, msg: "Digite a senha." });
      const h = await currentHash();
      if (!h || (await hashSenha(senha)) !== h) return json({ ok: false, msg: "Senha incorreta." });
      return json({ ok: true, token: await tokenFor(h), msg: "Pronto! Edição liberada." });
    }

    // Cadastro pela landing: cria a cliente e devolve o link imediato.
    if (action === "signup") {
      const mother = S("mother_name");
      const baby = S("baby_name");
      const email = S("email").toLowerCase();
      if (!mother || !baby) return json({ ok: false, msg: "Preencha o seu nome e o do bebê." });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, msg: "Informe um e-mail válido." });
      const existing = await db.from("qh_clients").select("access_code").eq("email", email).maybeSingle();
      if (existing.data?.access_code) {
        return json({ ok: true, code: existing.data.access_code, reused: true, msg: "Você já tem acesso — bem-vinda de volta!" });
      }
      const code = genCode();
      const { error } = await db.from("qh_clients").insert({
        name: S("name") || mother, mother_name: mother, baby_name: baby, email, access_code: code, status: "ativo",
      });
      if (error) return json({ ok: false, msg: "Não consegui criar o acesso: " + error.message });
      await db.from("qh_analytics_events").insert({ kind: "signup", meta: { via: "landing" } });
      return json({ ok: true, code, msg: "Acesso criado!" });
    }

    // Perfil da cliente pelo link (só se ativa).
    if (action === "client_by_code") {
      const c = await clientByCode(body.code);
      if (!c || c.status !== "ativo") return json({ ok: false, msg: "Link inválido ou acesso não liberado." });
      return json({ ok: true, mother_name: c.mother_name, baby_name: c.baby_name, genero: c.genero, dpp: c.dpp });
    }

    if (action === "journey_get") {
      const c = await clientByCode(body.code);
      if (!c || c.status !== "ativo") return json({ ok: false, msg: "Link inválido." });
      const { data } = await db.from("qh_client_journey").select("*").eq("client_id", c.id);
      return json({ ok: true, dpp: c.dpp, genero: c.genero, choices: data ?? [] });
    }

    if (action === "journey_set") {
      const c = await clientByCode(body.code);
      if (!c || c.status !== "ativo") return json({ ok: false, msg: "Link inválido." });
      const slug = S("item_slug");
      if (!slug) return json({ ok: false, msg: "Item inválido." });
      if (body.remove) {
        await db.from("qh_client_journey").delete().eq("client_id", c.id).eq("item_slug", slug);
        return json({ ok: true });
      }
      const { error } = await db.from("qh_client_journey").upsert({
        client_id: c.id, item_slug: slug,
        status: S("status") || "escolhido",
        option_id: body.option_id ? String(body.option_id) : null,
        genero: body.genero ? String(body.genero) : null,
        price_override_cents: (body.price_override_cents === null || body.price_override_cents === undefined || body.price_override_cents === "") ? null : Number(body.price_override_cents),
        updated_at: new Date().toISOString(),
      }, { onConflict: "client_id,item_slug" });
      if (error) return json({ ok: false, msg: error.message });
      return json({ ok: true });
    }

    if (action === "journey_meta") {
      const c = await clientByCode(body.code);
      if (!c || c.status !== "ativo") return json({ ok: false, msg: "Link inválido." });
      const patch: Record<string, unknown> = {};
      if ("dpp" in body) patch.dpp = body.dpp ? String(body.dpp) : null;
      if ("genero" in body) patch.genero = body.genero ? String(body.genero) : null;
      if (Object.keys(patch).length) await db.from("qh_clients").update(patch).eq("id", c.id);
      return json({ ok: true });
    }

    /* ============ ADMIN (token) ============ */
    if (!(await authed(token))) return json({ ok: false, msg: "Sessão expirada. Entre de novo." }, 401);

    if (action === "change_password") {
      const atual = S("atual");
      const nova = S("nova");
      const h = await currentHash();
      if (!h || (await hashSenha(atual)) !== h) return json({ ok: false, msg: "A senha atual está incorreta." });
      if (nova.length < 6) return json({ ok: false, msg: "A nova senha precisa de ao menos 6 caracteres." });
      const novoHash = await hashSenha(nova);
      const { error } = await db.from("qh_admin_config").update({ password_hash: novoHash, updated_at: new Date().toISOString() }).eq("id", "main");
      if (error) return json({ ok: false, msg: "Não consegui trocar: " + error.message });
      return json({ ok: true, token: await tokenFor(novoHash), msg: "Senha trocada. Continue editando." });
    }

    if (action === "save_page") {
      const slug = S("slug");
      const title = S("title");
      if (!slug || !title) return json({ ok: false, msg: "A página precisa de um título." });
      const paragraphs = Array.isArray(body.paragraphs) ? body.paragraphs.map(String) : [];
      const { error } = await db.from("qh_guide_pages").upsert({
        slug, title, eyebrow: S("eyebrow") || null, paragraphs, ready: !!body.ready, order: Number(body.order) || 0,
      });
      if (error) return json({ ok: false, msg: "Não consegui salvar: " + error.message });
      return json({ ok: true, msg: "Página salva. Já está valendo no guia." });
    }

    if (action === "save_item_texts") {
      const slug = S("slug");
      if (!slug) return json({ ok: false, msg: "Item inválido." });
      const d = (body.decision ?? {}) as Record<string, unknown>;
      const decision = {
        quandoUsar: d.quandoUsar ? String(d.quandoUsar) : null,
        quandoNao: d.quandoNao ? String(d.quandoNao) : null,
        erroComum: d.erroComum ? String(d.erroComum) : null,
        efeito: d.efeito ? String(d.efeito) : null,
        instalacao: d.instalacao ? String(d.instalacao) : null,
      };
      const { data, error } = await db.from("qh_items").update({ summary: S("summary") || null, decision }).eq("slug", slug).select("id");
      if (error) return json({ ok: false, msg: "Não consegui salvar: " + error.message });
      if (!data?.length) return json({ ok: false, msg: "Item não encontrado no banco." });
      return json({ ok: true, msg: "Textos salvos. Já estão valendo no guia." });
    }

    if (action === "save_option") {
      const itemSlug = S("item_slug");
      const genero = S("genero");
      const tier = S("tier");
      const name = S("name");
      if (!itemSlug || !genero || !tier) return json({ ok: false, msg: "Opção inválida." });
      if (!name) return json({ ok: false, msg: "Dê um nome para a opção (ex.: Berço Lume)." });
      const id = body.id ? String(body.id) : crypto.randomUUID();
      if (!body.id) {
        const { count } = await db.from("qh_product_options").select("id", { count: "exact", head: true })
          .eq("item_slug", itemSlug).eq("genero", genero).eq("tier", tier);
        if ((count ?? 0) >= 3) return json({ ok: false, msg: "Esta faixa já tem 3 opções. Exclua uma antes de adicionar." });
      }
      let photoUrl: string | null = null;
      if (typeof body.foto === "string" && body.foto.startsWith("data:")) {
        try { photoUrl = await uploadFoto(body.foto, itemSlug, genero, tier); }
        catch (e) { return json({ ok: false, msg: "A foto não subiu: " + (e as Error).message }); }
      }
      const row: Record<string, unknown> = {
        id, item_slug: itemSlug, genero, tier, name,
        price_cents: (body.price_cents === null || body.price_cents === undefined || body.price_cents === "") ? null : Number(body.price_cents),
        url: S("url") || null, supplier: S("supplier") || null, note: null, exemplo: false, order: Number(body.order) || 0,
      };
      if (photoUrl) row.photo_url = photoUrl;
      const { error } = await db.from("qh_product_options").upsert(row);
      if (error) return json({ ok: false, msg: "Não consegui salvar: " + error.message });
      return json({ ok: true, msg: photoUrl ? "Opção e foto salvas. Já estão no guia." : "Opção salva. Já está no guia." });
    }

    if (action === "delete_option") {
      const id = S("id");
      if (!id) return json({ ok: false, msg: "Opção inválida." });
      const { error } = await db.from("qh_product_options").delete().eq("id", id);
      if (error) return json({ ok: false, msg: "Não consegui excluir: " + error.message });
      return json({ ok: true, msg: "Opção excluída do guia." });
    }

    if (action === "analytics") {
      const desde = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data, error } = await db.from("qh_analytics_events").select("kind, meta, created_at")
        .gte("created_at", desde).order("created_at", { ascending: false }).limit(20000);
      if (error) return json({ ok: false, msg: error.message });
      return json({ ok: true, rows: data ?? [] });
    }

    /* ---- clientes (admin) ---- */
    if (action === "create_client") {
      const mother = S("mother_name");
      const baby = S("baby_name");
      if (!mother || !baby) return json({ ok: false, msg: "Preencha o nome da mãe e do bebê." });
      const email = S("email").toLowerCase();
      if (email) {
        const ex = await db.from("qh_clients").select("access_code").eq("email", email).maybeSingle();
        if (ex.data?.access_code) return json({ ok: true, code: ex.data.access_code, reused: true, msg: "Essa cliente já existia — link recuperado." });
      }
      const code = genCode();
      const { error } = await db.from("qh_clients").insert({
        name: S("name") || mother, mother_name: mother, baby_name: baby, email: email || null, access_code: code, status: "ativo",
      });
      if (error) return json({ ok: false, msg: "Não consegui cadastrar: " + error.message });
      return json({ ok: true, code, msg: "Cliente cadastrada. Link de acesso gerado." });
    }

    if (action === "list_clients") {
      const { data, error } = await db.from("qh_clients")
        .select("id, name, mother_name, baby_name, email, status, access_code, created_at")
        .order("created_at", { ascending: false }).limit(500);
      if (error) return json({ ok: false, msg: error.message });
      return json({ ok: true, rows: data ?? [] });
    }

    if (action === "delete_client") {
      const id = S("id");
      if (!id) return json({ ok: false, msg: "Cliente inválida." });
      const { error } = await db.from("qh_clients").delete().eq("id", id);
      if (error) return json({ ok: false, msg: error.message });
      return json({ ok: true, msg: "Cliente removida." });
    }

    if (action === "set_client_status") {
      const id = S("id");
      const status = S("status");
      if (!id || !["pendente", "ativo"].includes(status)) return json({ ok: false, msg: "Dados inválidos." });
      const { error } = await db.from("qh_clients").update({ status }).eq("id", id);
      if (error) return json({ ok: false, msg: error.message });
      return json({ ok: true, msg: status === "ativo" ? "Acesso liberado." : "Acesso pausado." });
    }

    return json({ ok: false, msg: "Ação desconhecida." }, 400);
  } catch (e) {
    return json({ ok: false, msg: "Erro: " + ((e as Error).message ?? "inesperado") }, 500);
  }
});
