# Prepara os insumos pesados da apresentação: as fontes do site em base64 e as
# estampas do public/images. Vão para um cache fora do repositório, porque são
# derivados (uns 700 KB) e podem ser refeitos a qualquer momento.
#
# Uso: python3 apresentacao/preparar.py [pasta-de-cache]
import base64, os, re, sys, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("QH_CACHE", "/tmp/qh-apresentacao")
IMAGENS = os.path.join(RAIZ, "public", "images")

# Fraunces e Jost são as fontes do site (ver src/app/layout.tsx). Elas entram
# embutidas no arquivo: um PDF que depende de CDN cai em fonte substituta na
# máquina de quem abrir.
CSS_FONTES = ("https://fonts.googleapis.com/css2?"
              "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400"
              "&family=Jost:wght@300;400;500&display=swap")
NAVEGADOR = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")


def abridor():
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    if proxy:
        return urllib.request.build_opener(urllib.request.ProxyHandler({"https": proxy, "http": proxy}))
    return urllib.request.build_opener()


def fontes(op):
    req = urllib.request.Request(CSS_FONTES, headers={"User-Agent": NAVEGADOR})
    css = op.open(req, timeout=60).read().decode()
    faces = []
    for bloco in re.findall(r"@font-face\s*\{[^}]*\}", css):
        faixa = re.search(r"unicode-range:\s*([^;]+);", bloco)
        # só o latino básico: o resto multiplicaria o tamanho do arquivo à toa
        if not faixa or not faixa.group(1).strip().startswith("U+0000-00FF"):
            continue
        url = re.search(r"url\((https://[^)]+\.woff2)\)", bloco).group(1)
        dados = op.open(url, timeout=60).read()
        faces.append(
            "@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:block;"
            "src:url(data:font/woff2;base64,%s) format('woff2')}" % (
                re.search(r"font-family:\s*'([^']+)'", bloco).group(1),
                re.search(r"font-style:\s*(\w+)", bloco).group(1),
                re.search(r"font-weight:\s*([\d ]+);", bloco).group(1).strip(),
                base64.b64encode(dados).decode()))
    if len(faces) < 4:
        raise SystemExit("Vieram só %d fontes. Confira a rede antes de gerar." % len(faces))
    return "\n".join(faces)


def imagens():
    def uri(arquivo, mime):
        with open(os.path.join(IMAGENS, arquivo), "rb") as f:
            return "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode())
    return {
        "BRASAO_CREME": uri("brasao-creme.png", "image/png"),
        "BRASAO_VINHO": uri("brasao-vinho.png", "image/png"),
        "LISTRAS": uri("estampa-listras.svg", "image/svg+xml"),
        "GEOMETRICA": uri("estampa-geometrica.svg", "image/svg+xml"),
    }


def main():
    os.makedirs(CACHE, exist_ok=True)
    op = abridor()
    with open(os.path.join(CACHE, "fontes.css"), "w") as f:
        f.write(fontes(op))
    with open(os.path.join(CACHE, "assets.py"), "w") as f:
        f.write("A=" + repr(imagens()))
    print("cache pronto em %s (%d KB)" % (
        CACHE, sum(os.path.getsize(os.path.join(CACHE, n)) for n in ("fontes.css", "assets.py")) // 1024))


if __name__ == "__main__":
    main()
