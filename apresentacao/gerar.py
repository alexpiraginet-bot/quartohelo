# Apresentação do formato do produto, na identidade do site.
#
# Público: consultor, parceiro, investidor. Mostra o que o produto é e o que vem
# em seguida. Não entra aqui: pendência, número de venda, preço, pergunta nossa.
#
# A régua: nenhuma frase afirma no presente algo que ainda não existe. O que
# ainda não está no ar aparece como sequência ("entra em seguida"), nunca como
# conquista. Quem for mexer no texto, mantenha essa régua.
#
# Uso:
#   python3 apresentacao/preparar.py        # uma vez, baixa fontes e estampas
#   python3 apresentacao/gerar.py [saida.html]
import os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.environ.get("QH_CACHE", "/tmp/qh-apresentacao")
SAIDA = sys.argv[1] if len(sys.argv) > 1 else os.path.join(CACHE, "apresentacao-formato.html")
sys.path.insert(0, CACHE)
try:
    from assets import A
except ImportError:
    raise SystemExit("Falta o cache. Rode antes: python3 apresentacao/preparar.py")

CSS = """
%(fontes)s

:root{
  --bone:#EFEAD9; --bone-2:#E7DFC7; --card:#F6F2E4;
  --wine:#67232B; --wine-deep:#4A171F; --wine-soft:#82363C;
  --rose:#BC8880; --olive:#5A521C; --olive-soft:#A79E6C; --caramel:#D2B58E;
  --ink:#38291E; --muted:#7E7258; --faint:#9A8F73; --line:#D9D0B2;
  --ocre:#8F6A2A;
  /* O --muted do site (#7E7258) dá 4,3:1 sobre o creme, abaixo do mínimo para
     texto pequeno. Nas notas de 9pt entra uma versão mais escura, 5,8:1. */
  --nota:#6A5E45;
  --serif:'Fraunces',Georgia,serif;
  --sans:'Jost',system-ui,-apple-system,'Segoe UI',sans-serif;
}
@page{size:A4; margin:0}
*{box-sizing:border-box}
html,body{margin:0; padding:0}
body{background:var(--bone-2); color:var(--ink); font-family:var(--sans); font-weight:300;
  -webkit-font-smoothing:antialiased; -webkit-print-color-adjust:exact; print-color-adjust:exact}

.page{position:relative; width:210mm; min-height:297mm; padding:19mm 20mm 22mm;
  background:var(--card); overflow:hidden; break-after:page; margin:0 auto;
  display:flex; flex-direction:column}
/* O que sobra de folha se reparte entre o topo e o pé: numa peça de
   apresentação, bloco centrado lê como composição, encostado no topo lê como
   página que acabou antes da hora. */
.conteudo{flex:1; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:1}
.page:last-child{break-after:auto}
.page.wine{background:var(--wine); color:#F5EAD2}

/* estampas do site */
.listras{position:absolute; left:0; right:0; top:0; height:9px;
  background:url("%(listras)s"); background-size:230px 230px; background-position:center top;
  border-bottom:1px solid var(--line)}
.page.wine .listras{opacity:.5; border-bottom-color:rgba(239,227,203,.16)}
.brasao{position:absolute; inset:0; background:url("%(brasao_creme)s") right center/auto 92%% no-repeat;
  opacity:.075; pointer-events:none}
/* Nas páginas de conteúdo o brasão é menor e mais fraco: acompanha o texto,
   não disputa com ele. No tamanho da capa, atravessaria a coluna de leitura. */
.brasao.tinto{background-image:url("%(brasao_vinho)s"); background-size:auto 44%%; opacity:.05}
.geo{position:absolute; inset:0; background:url("%(geometrica)s") center/240px; opacity:.05; pointer-events:none}

/* tipografia */
.eyebrow{font-size:9.5pt; letter-spacing:.3em; text-transform:uppercase; color:var(--ocre);
  font-weight:400; margin:0 0 9mm}
.page.wine .eyebrow{color:var(--caramel)}
h1{font-family:var(--serif); font-weight:400; font-size:44pt; line-height:1.02; letter-spacing:-.01em;
  margin:0; color:#FBF2DC}
h2{font-family:var(--serif); font-weight:400; font-size:26pt; line-height:1.15; margin:0 0 5mm; color:var(--wine)}
.page.wine h2{color:#FBF2DC}
h3{font-family:var(--serif); font-weight:500; font-size:13.5pt; line-height:1.25; margin:0 0 2mm; color:var(--wine)}
.page.wine h3{color:var(--caramel)}
p{margin:0 0 3.8mm; font-size:11.5pt; line-height:1.62; max-width:152mm}
p:last-child{margin-bottom:0}
.lede{font-family:var(--serif); font-size:17pt; line-height:1.42; color:var(--wine); max-width:145mm}
b,strong{font-weight:500; color:var(--wine)}
.page.wine b,.page.wine strong{color:var(--caramel)}

/* capa e fecho */
.capa-in{position:relative; z-index:1; flex:1; display:flex; flex-direction:column}
.marca{font-size:10pt; letter-spacing:.34em; text-transform:uppercase; color:var(--caramel); font-weight:400}
.capa-meio{margin-top:auto}
.capa-sub{font-family:var(--serif); font-style:italic; font-size:16pt; line-height:1.35; color:var(--caramel);
  margin:6mm 0 0; max-width:120mm}
.capa-desc{font-size:10.5pt; line-height:1.6; color:#EAD8BC; margin:8mm 0 0; max-width:118mm}
.fichas{margin-top:auto; padding-top:7mm; border-top:1px solid rgba(239,227,203,.22);
  display:grid; grid-template-columns:repeat(4,1fr); gap:6mm}
.fichas dt{font-size:7.5pt; letter-spacing:.2em; text-transform:uppercase; color:rgba(239,227,203,.6); margin:0 0 1.5mm}
.fichas dd{margin:0; font-size:10pt; color:#F5EAD2}
.fecho{position:relative; z-index:1; flex:1; display:flex; flex-direction:column; justify-content:center}
.fecho .frase{font-family:var(--serif); font-size:26pt; line-height:1.25; color:#FBF2DC; max-width:130mm; margin:0}
.fecho .ass{margin-top:14mm; font-size:9.5pt; letter-spacing:.28em; text-transform:uppercase; color:var(--caramel)}

/* citação */
.pull{border-left:2px solid var(--caramel); padding:4mm 0 4mm 7mm; margin:7mm 0 0}
.pull p{font-family:var(--serif); font-style:italic; font-size:15.5pt; line-height:1.4; color:var(--wine); max-width:135mm}

/* jornada */
ol.passos{list-style:none; counter-reset:p; margin:7mm 0 0; padding:0}
ol.passos li{counter-increment:p; position:relative; padding:0 0 6.5mm 13mm; border-left:1px solid var(--line); max-width:150mm}
ol.passos li:last-child{border-left-color:transparent; padding-bottom:0}
ol.passos li::before{content:counter(p,decimal-leading-zero); position:absolute; left:-4.5mm; top:-.5mm;
  width:9mm; height:9mm; display:grid; place-items:center; font-size:8pt; color:var(--wine);
  background:var(--card); border:1px solid var(--rose); border-radius:50%%}
ol.passos b{display:block; font-family:var(--serif); font-weight:500; font-size:13pt; color:var(--wine); margin-bottom:1mm}
ol.passos span{font-size:10.8pt; line-height:1.55; display:block; max-width:140mm}

/* o termo em destaque */
.termo .en{font-family:var(--serif); font-style:italic; font-weight:400; font-size:40pt; line-height:1;
  color:var(--caramel); margin:0}
.termo .pt{font-size:11.8pt; line-height:1.6; color:#EAD8BC; margin:6mm 0 0; max-width:140mm}
.camadas{display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; margin-top:11mm}
.camadas > div{background:rgba(74,23,31,.55); border:1px solid rgba(239,227,203,.16); padding:6mm 6mm 7mm}
.camadas p{font-size:10.2pt; line-height:1.55; color:#EAD8BC; max-width:none}
.camadas .rot{font-size:7.5pt; letter-spacing:.2em; text-transform:uppercase; color:rgba(239,227,203,.55); margin:0 0 2.5mm}
.traducao{margin-top:14mm; padding-top:7mm; border-top:1px solid rgba(239,227,203,.2)}
.traducao .rot{font-size:7.5pt; letter-spacing:.2em; text-transform:uppercase; color:rgba(239,227,203,.55); margin:0 0 4mm}
.traducao p{font-size:11.2pt; line-height:1.55; color:#EAD8BC; max-width:150mm}

/* blocos de conteúdo */
.entrega{display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; margin-top:8mm}
.entrega > div{background:#FBF8EE; border:1px solid var(--line); border-top:2px solid var(--rose); padding:6mm}
.entrega h3{margin-bottom:2.5mm}
.entrega p{font-size:10.2pt; line-height:1.55; max-width:none}
.medida{display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; margin-top:7mm}
.medida > div{border-left:1px solid var(--rose); padding:1mm 0 1mm 6mm}
.medida .v{font-family:var(--serif); font-size:32pt; line-height:1; color:var(--wine)}
.medida .l{font-size:9.2pt; line-height:1.5; color:var(--nota); margin-top:2.5mm}
.proximo{margin-top:7mm}
.proximo > div{display:grid; grid-template-columns:54mm 1fr; gap:0 6mm; padding:5.5mm 0; border-top:1px solid var(--line)}
.proximo h3{margin:0; font-size:11.5pt}
.proximo p{font-size:10.2pt; line-height:1.55; margin:0; max-width:none; color:var(--nota)}
.frentes{display:grid; grid-template-columns:1fr 1fr; gap:5mm; margin-top:7mm}
.frentes > div{background:#FBF8EE; border:1px solid var(--line); border-top:2px solid var(--rose); padding:6mm}
.frentes .rot{font-size:7.5pt; letter-spacing:.2em; text-transform:uppercase; color:var(--ocre); margin:0 0 2mm}
.frentes p{font-size:10.2pt; line-height:1.55; max-width:none}
.frentes dl{display:grid; grid-template-columns:auto 1fr; gap:2mm 4mm; margin:4mm 0 0; font-size:9.6pt}
.frentes dt{font-size:7.5pt; letter-spacing:.14em; text-transform:uppercase; color:var(--ocre); padding-top:.6mm}
.frentes dd{margin:0; line-height:1.5}

/* perguntas e respostas: a pergunta em itálico, a resposta em bloco */
.qa{margin-top:6mm}
.qa > div{padding:5mm 0; border-top:1px solid var(--line)}
.qa .p{font-family:var(--serif); font-style:italic; font-size:13.5pt; line-height:1.3; color:var(--wine);
  margin:0 0 2.5mm}
.qa .r{font-size:10.8pt; line-height:1.58; margin:0; max-width:158mm}
.qa .r + .r{margin-top:2.5mm}
.qa .r em{font-style:normal; color:var(--ocre)}

.rodape{position:absolute; left:20mm; right:20mm; bottom:9mm; display:flex; justify-content:space-between;
  align-items:baseline; font-size:7.5pt; letter-spacing:.16em; text-transform:uppercase; color:var(--faint)}
.page.wine .rodape{color:rgba(239,227,203,.5)}

/* Na tela estreita a folha A4 deixa de ser folha: uma coluna só e margem menor.
   Fica no fim da folha de estilo de propósito, para vencer as regras acima. */
@media screen{
  body{padding:26px 14px 60px}
  .page{box-shadow:0 1px 2px rgba(74,23,31,.06), 0 18px 50px rgba(74,23,31,.14);
    margin-bottom:26px; max-width:100%%}
}
@media screen and (max-width:860px){
  .page{width:auto; min-height:0; padding:13mm 7mm 16mm}
  .capa-in,.fecho{min-height:150mm}
  h1{font-size:32pt}
  h2{font-size:19pt}
  .camadas,.entrega,.medida,.frentes{grid-template-columns:1fr; gap:4mm}
  .fichas{grid-template-columns:1fr 1fr; gap:5mm}
  .proximo > div{grid-template-columns:1fr; gap:2mm}
  .rodape{left:7mm; right:7mm}
}
""" % {
    "fontes": open(os.path.join(CACHE, "fontes.css")).read(),
    "listras": A["LISTRAS"],
    "geometrica": A["GEOMETRICA"],
    "brasao_creme": A["BRASAO_CREME"],
    "brasao_vinho": A["BRASAO_VINHO"],
}


def pagina(n, conteudo, wine=False, brasao=None, geo=False):
    p = ['<div class="%s">' % ("page wine" if wine else "page"), '<div class="listras"></div>']
    if brasao:
        p.append('<div class="brasao%s"></div>' % (" tinto" if brasao == "vinho" else ""))
    if geo:
        p.append('<div class="geo"></div>')
    p.append('<div class="conteudo">%s</div>' % conteudo)
    p.append('<div class="rodape"><span>Quarto da Helô · O Fim da Dúvida</span><span>%s</span></div>' % n)
    p.append("</div>")
    return "\n".join(p)


P = []

# ------------------------------------------------------------------ capa
P.append("""<div class="page wine">
  <div class="listras"></div>
  <div class="brasao"></div>
  <div class="capa-in">
    <div class="marca">Quarto da Helô · Collection Nº 01</div>
    <div class="capa-meio">
      <p class="eyebrow" style="margin-bottom:5mm">O formato</p>
      <h1>O Fim<br>da Dúvida</h1>
      <p class="capa-sub">Guia de Decisão Estética para o quarto do seu bebê.</p>
      <p class="capa-desc">Um produto digital que decide o quarto junto com a mãe:
      ela escolhe dentro da curadoria da Helô e sai com o projeto montado.</p>
    </div>
    <dl class="fichas">
      <div><dt>Formato</dt><dd>Guided selling</dd></div>
      <div><dt>Segmento</dt><dd>Primeira infância</dd></div>
      <div><dt>Modelo</dt><dd>Licença por projeto</dd></div>
      <div><dt>Estúdio</dt><dd>Quarto da Helô</dd></div>
    </dl>
  </div>
</div>""")

# ------------------------------------------------------------------ 02
P.append(pagina("02", """
<p class="eyebrow">O formato</p>
<p class="lede">Um guia interativo que decide o quarto junto com a mãe. Ela entra, escolhe dentro de
um conjunto fechado por faixa de investimento, e sai com o moodboard e o orçamento do quarto inteiro.</p>
<div class="pull"><p>Não é conteúdo sobre como montar o quarto.<br>É o lugar onde o quarto é decidido.</p></div>

<h2 style="margin-top:13mm">O que ela leva para casa</h2>
<div class="entrega">
  <div>
    <h3>O moodboard</h3>
    <p>As escolhas dela reunidas em uma prancha só, do papel de parede ao enxoval, montada enquanto
    ela decide.</p>
  </div>
  <div>
    <h3>O orçamento</h3>
    <p>A lista de tudo que ela escolheu, com o valor de cada item e o total do quarto, atualizado a
    cada decisão.</p>
  </div>
  <div>
    <h3>O caminho</h3>
    <p>Cada item com a marca, a faixa de investimento e o link do fornecedor. Ela sai sabendo onde
    comprar, não só o que comprar.</p>
  </div>
</div>
<p style="margin-top:11mm">É o método do estúdio inteiro, o mesmo que a Helô aplica nos projetos
assinados, entregue em forma de produto. A cliente decide sozinha e nunca decide no escuro.</p>""",
    brasao="vinho"))

# ------------------------------------------------------------------ 03
P.append(pagina("03", """
<p class="eyebrow">O nome disso no mercado</p>
<div class="termo">
  <p class="en">guided selling</p>
  <p class="pt">Software que conduz alguém até a escolha certa dentro de um sortimento que um
  especialista fechou. É a categoria em que o produto se encaixa, verticalizada para quarto de bebê
  e com a diferença que vale dinheiro: a curadoria é autoral, não é catálogo de loja.</p>
</div>
<div class="camadas">
  <div>
    <p class="rot">O produto</p>
    <h3>Guia de decisão assistida</h3>
    <p>Com curadoria proprietária. A cliente não aprende a decidir, ela decide.</p>
  </div>
  <div>
    <p class="rot">O negócio</p>
    <h3>Licença por projeto</h3>
    <p>Ticket único por quarto, e porta de entrada para a Curadoria Assinada e o Projeto Conceito.
    Do lado do estúdio é serviço produtizado: o que era refeito a cada cliente virou ativo.</p>
  </div>
  <div>
    <p class="rot">A técnica</p>
    <h3>Micro-SaaS de conteúdo</h3>
    <p>Conta por cliente, jornada por pessoa e catálogo editável. A mesma estrutura serve outra
    curadoria sem reescrever o produto.</p>
  </div>
</div>
<div class="traducao">
  <p class="rot">Como falar de cada lado da mesa</p>
  <div>
    <p><b>Para a cliente grávida:</b> um guia interativo que decide o quarto com ela.</p>
    <p><b>Para o mercado:</b> guided selling verticalizado, com curadoria autoral e escada de valor
    para serviço de alto ticket.</p>
  </div>
</div>""", wine=True, geo=True))

# ------------------------------------------------------------------ 04
P.append(pagina("04", """
<p class="eyebrow">A experiência</p>
<h2>A jornada, na ordem em que acontece</h2>
<ol class="passos">
  <li><b>Entra com o nome dela e o do bebê</b><span>O guia passa a falar com ela pelo nome. Nada de tela de configuração.</span></li>
  <li><b>Escolhe a variação do quarto</b><span>Menina, neutro ou menino. Isso troca a curadoria inteira, não só a cor da interface.</span></li>
  <li><b>Percorre os 22 itens do quarto, um a um</b><span>Em cada item ela lê a decisão da Helô: quando usar, quando não usar, o erro comum, o efeito no ambiente, como instalar e a dica do estúdio.</span></li>
  <li><b>Escolhe entre três faixas de investimento</b><span>Acessível, médio e alto padrão, com foto, preço e fornecedor. A escolha fica salva e o total do quarto se ajusta na hora.</span></li>
  <li><b>Vê o projeto montado</b><span>Moodboard, lista de investimento e o progresso, “8 de 22 decididos”. Quem preferir não decidir sozinha encontra ali o convite para os serviços do estúdio.</span></li>
</ol>
<p style="margin-top:10mm">A jornada é a peça central do formato. Ela transforma um catálogo em um
caminho, e é por isso que a mãe termina com um quarto coerente em vez de uma pasta de referências.</p>""",
    brasao="vinho"))

# ------------------------------------------------------------------ 05
P.append(pagina("05", """
<p class="eyebrow">O que está dentro</p>
<h2>A substância do produto</h2>
<div class="medida">
  <div><div class="v">22</div><div class="l">itens do quarto, em 4 categorias, cada um com a decisão escrita pela Helô</div></div>
  <div><div class="v">150+</div><div class="l">opções curadas com foto, preço, faixa e fornecedor</div></div>
  <div><div class="v">3</div><div class="l">faixas de investimento em cada item: acessível, médio e alto padrão</div></div>
</div>
<p style="margin-top:11mm">Nenhuma dessas escolhas é busca automática. Cada uma passou pelo critério
da Helô, e é esse conjunto, e não o software, que ninguém remonta em um fim de semana.</p>

<h2 style="margin-top:12mm">E o estúdio no comando</h2>
<div class="entrega">
  <div>
    <h3>Painel próprio</h3>
    <p>A Helô edita texto, foto, catálogo e páginas do guia sozinha, sem depender de programador.</p>
  </div>
  <div>
    <h3>Ensaio antes do ar</h3>
    <p>Ela vê como o site e o guia vão ficar antes de publicar. O que está no ar não se mexe por engano.</p>
  </div>
  <div>
    <h3>Medição própria</h3>
    <p>Cada passo da jornada é registrado, do primeiro acesso ao clique no fornecedor, sem depender de
    ferramenta de terceiro.</p>
  </div>
</div>""", brasao="vinho"))

# ------------------------------------------------------------------ 06
P.append(pagina("06", """
<p class="eyebrow">A sequência</p>
<h2>O que entra em seguida</h2>
<p>O formato foi desenhado com essas frentes já previstas na estrutura de dados e no servidor. Elas
entram na ordem em que o negócio pedir.</p>
<div class="proximo">
  <div>
    <h3>Conta por cliente</h3>
    <p>Cada mãe com o seu código de acesso e a sua jornada guardada, para retomar de qualquer
    aparelho e para o estúdio acompanhar quem está montando o quarto.</p>
  </div>
  <div>
    <h3>Compra com acesso imediato</h3>
    <p>Pagou, entrou. A conta é criada na hora, sem ninguém do estúdio no meio do caminho.</p>
  </div>
  <div>
    <h3>Curadoria das outras variações</h3>
    <p>Neutro e menino com a mesma profundidade da variação já publicada, nas três faixas.</p>
  </div>
  <div>
    <h3>Leitura da jornada</h3>
    <p>Quais itens travam a decisão, quais faixas a cliente escolhe e onde ela para. Isso vira insumo
    da próxima curadoria e argumento na conversa com fornecedor.</p>
  </div>
  <div>
    <h3>Outra marca no mesmo motor</h3>
    <p>Categorias, itens, decisão, faixas e moodboard não têm nada de específico do quarto. Outra
    curadoria entra sem reescrever o produto.</p>
  </div>
</div>""", brasao="vinho"))

# ------------------------------------------------------------------ 07
P.append(pagina("07", """
<p class="eyebrow">Alcance</p>
<h2>Quatro frentes que o mesmo formato abre</h2>
<div class="frentes">
  <div>
    <p class="rot">Frente A</p><h3>Porta de entrada do estúdio</h3>
    <p>O guia apresenta o método e o critério da Helô. Quem quiser o estúdio conduzindo sobe para a
    Curadoria Assinada e o Projeto Conceito.</p>
    <dl><dt>Exige</dt><dd>Só a venda do guia.</dd>
        <dt>Receita</dt><dd>A licença, e o serviço de alto ticket que vem atrás.</dd></dl>
  </div>
  <div>
    <p class="rot">Frente B</p><h3>Licença em escala</h3>
    <p>O mesmo produto atende uma cliente ou mil sem consumir a agenda da Helô. É a única receita do
    estúdio que não depende de hora trabalhada.</p>
    <dl><dt>Exige</dt><dd>Venda automática e curadoria atualizada.</dd>
        <dt>Receita</dt><dd>Volume vezes ticket.</dd></dl>
  </div>
  <div>
    <p class="rot">Frente C</p><h3>Plataforma para outros estúdios</h3>
    <p>Outro escritório de arquitetura infantil entra com a curadoria dele e publica o próprio guia,
    com a marca dele, sobre o mesmo motor.</p>
    <dl><dt>Exige</dt><dd>Contrato de licença do motor.</dd>
        <dt>Receita</dt><dd>Recorrente, a mais previsível das quatro.</dd></dl>
  </div>
  <div>
    <p class="rot">Frente D</p><h3>Relação com o fornecedor</h3>
    <p>O guia leva compra qualificada para as marcas curadas, e o clique já é medido. Isso é moeda em
    qualquer conversa comercial com elas.</p>
    <dl><dt>Exige</dt><dd>Acordo com as marcas.</dd>
        <dt>Receita</dt><dd>Participação sobre o quarto inteiro.</dd></dl>
  </div>
</div>""", brasao="vinho"))

# ------------------------------------------------------------------ 08
# As perguntas que a própria cliente levantou antes de mostrar o produto.
# Respostas escritas para serem ditas em voz alta, não lidas.
P.append(pagina("08", """
<p class="eyebrow">Na conversa</p>
<h2>As perguntas que vêm primeiro</h2>
<div class="qa">
  <div>
    <p class="p">“É um ebook? É uma planilha?”</p>
    <p class="r">É um site interativo. Abre no navegador, sem baixar nada, e conduz item por item até
    o quarto montado.</p>
    <p class="r">Ebook se lê. Planilha se preenche. Aqui a decisão já está tomada: a mãe escolhe
    dentro do que a Helô selecionou, na faixa de investimento dela.</p>
  </div>
  <div>
    <p class="p">“Então é um site ou um aplicativo?”</p>
    <p class="r">É um site por onde se entra e um aplicativo pelo que faz: guarda a escolha de cada
    pessoa e monta o moodboard e o orçamento enquanto ela decide.</p>
    <p class="r">Quem trabalha com produto digital chama esse formato de <em>guided selling</em>.</p>
  </div>
  <div>
    <p class="p">“Como foi feito?”</p>
    <p class="r">Sob medida, programado do zero. Não é template de site pronto. É por isso que o guia
    guarda a jornada de cada cliente e o estúdio edita o conteúdo sozinho.</p>
  </div>
  <div>
    <p class="p">“Me manda para eu ver.”</p>
    <p class="r">O guia tem um endereço público que abre em qualquer aparelho, sem instalar nada.
    É esse link que se manda.</p>
    <p class="r">O painel de edição fica em outro endereço, com senha, e esse não se compartilha
    com ninguém.</p>
  </div>
</div>""", brasao="vinho"))

# ------------------------------------------------------------------ fecho
P.append("""<div class="page wine">
  <div class="listras"></div>
  <div class="brasao"></div>
  <div class="fecho">
    <p class="eyebrow">O Fim da Dúvida</p>
    <p class="frase">O quarto da Helô sempre nasceu de um método.<br>
    O guia é esse método virando produto.</p>
    <p class="ass">Quarto da Helô · Collection Nº 01</p>
  </div>
  <div class="rodape"><span>Quarto da Helô · O Fim da Dúvida</span><span>09</span></div>
</div>""")

HTML = "<title>O Fim da Dúvida · O formato</title>\n<style>%s</style>\n%s" % (CSS, "\n".join(P))
os.makedirs(os.path.dirname(SAIDA) or ".", exist_ok=True)
with open(SAIDA, "w") as f:
    f.write(HTML)
print("ok, %d páginas, %d KB -> %s" % (len(P), len(HTML) // 1024, SAIDA))
