/* Captura as telas reais do guia para o vídeo demonstrativo.
 *
 * Roda o app localmente e fotografa a jornada de ponta a ponta, com o catálogo
 * de verdade: fotos, fornecedores e preços que a Helô cadastrou.
 *
 * Duas particularidades deste ambiente, que explicam o que o script faz:
 *
 *  1. As fotos do catálogo moram no Storage do Supabase e o navegador daqui não
 *     sai para a internet. Então baixamos cada foto com o curl (que passa pelo
 *     proxy) e servimos a cópia local ao navegador por interceptação de rota.
 *  2. A curadoria com preço está na variação Menina. A Neutro ainda mostra
 *     "Valor em definição", que não é o que se quer num vídeo de venda.
 *
 * Uso:
 *   PORT=3390 npm run start        # na raiz do projeto, noutro terminal
 *   node video/capturar.mjs [porta]
 */
import { chromium } from "playwright-core";
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const PORTA = process.argv[2] || "3390";
const BASE = `http://localhost:${PORTA}`;
const SAIDA = join(AQUI, "public", "telas");
const CACHE = "/tmp/qh-video/produtos";
mkdirSync(SAIDA, { recursive: true });
mkdirSync(CACHE, { recursive: true });

const local = (url) => join(CACHE, basename(new URL(url).pathname));
function baixar(url) {
  const destino = local(url);
  if (!existsSync(destino)) execFileSync("curl", ["-s", "--max-time", "40", url, "-o", destino]);
  return destino;
}

const navegador = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await navegador.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });

// Entrega ao navegador a cópia baixada de cada foto do Storage.
await page.route("**vpwjaciuwgiwntyoaozj.supabase.co/**", (rota) => {
  try {
    const arquivo = baixar(rota.request().url());
    rota.fulfill({ body: readFileSync(arquivo), contentType: "image/webp" });
  } catch {
    rota.abort();
  }
});

const tirar = async (nome) => {
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(SAIDA, `${nome}.jpg`), quality: 88, type: "jpeg" });
  console.log("tela:", nome);
};
const fotosVisiveis = () =>
  page.evaluate(() => [...document.querySelectorAll("img")].filter((i) => i.naturalWidth > 0).length);

await page.goto(`${BASE}/guia`, { waitUntil: "networkidle" });
await tirar("1-capa");

await page.click("text=Entrar no guia");
await page.waitForSelector(".g2welcome", { timeout: 15000 });
await tirar("2-visao-geral");

// Uma página editorial: o guia tem conteúdo, não só grade de produto.
await page.click(".g2side a:has-text('Orientações'), .g2side button:has-text('Orientações')").catch(() => {});
await page.waitForTimeout(900);
await tirar("3-conteudo");

// A decisão escrita de um item, que é o que ninguém copia.
await page.click(".g2side a:has-text('Berço'), .g2side button:has-text('Berço')");
await page.waitForSelector(".g2opts", { timeout: 15000 });
await page.waitForTimeout(700);
await tirar("4-decisao");

// A grade por faixa de investimento, na variação que tem curadoria e preço.
await page.click(".g2opts button:has-text('Menina')").catch(() => {});
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelector(".g2opts").scrollIntoView({ block: "start" }));
await page.waitForTimeout(1400);
console.log("fotos carregadas na grade:", await fotosVisiveis());
await tirar("5-faixas");

// A escolha: o card fica marcado e o total do projeto se ajusta.
await page.locator(".g2card button:has-text('Escolher')").first().click();
await page.waitForTimeout(900);
await tirar("6-escolha");

/* Mais três escolhas, em silêncio, para o moodboard e a soma terem substância
 * na tela final. Um projeto com um item só não mostra o que o guia faz. */
for (const item of ["Cômoda", "Poltrona", "Tapete"]) {
  const link = page.locator(`.g2side a:has-text('${item}'), .g2side button:has-text('${item}')`).first();
  if (!(await link.count())) continue;
  await link.click();
  await page.waitForTimeout(700);
  await page.click(".g2opts button:has-text('Menina')").catch(() => {});
  await page.waitForTimeout(600);
  // Só opções com preço: "Definir valor" na soma final estraga a tela que
  // justamente mostra o orçamento do quarto fechando.
  const comPreco = page.locator(".g2card", { hasText: "R$" }).locator("button:has-text('Escolher')").first();
  const escolher = (await comPreco.count()) ? comPreco : page.locator(".g2card button:has-text('Escolher')").first();
  if (await escolher.count()) await escolher.click();
  await page.waitForTimeout(500);
}

// O resultado: moodboard e lista de investimento.
await page.click(".g2side a:has-text('Meu projeto'), .g2side button:has-text('Meu projeto')");
await page.waitForTimeout(1800);
console.log("fotos carregadas no moodboard:", await fotosVisiveis());
await page.evaluate(() => document.querySelector(".g2mb")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(1200);
await tirar("7-moodboard");

// A soma: o quarto inteiro com valor, item a item.
await page.evaluate(() => {
  const alvo = [...document.querySelectorAll("h2, h3")].find((h) => /investimento|análise|financeir/i.test(h.textContent));
  (alvo ?? document.querySelector(".g2view")).scrollIntoView({ block: "start" });
});
await page.waitForTimeout(1200);
await tirar("8-investimento");

await navegador.close();
console.log("pronto em", SAIDA);
