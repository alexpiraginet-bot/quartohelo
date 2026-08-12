#!/bin/bash
# Ressincroniza o checkout quando o sandbox volta no tempo.
#
# POR QUE ISTO EXISTE
# A sessão roda numa máquina efêmera. Quando ela é reciclada, o disco volta
# para um instantâneo antigo: o HEAD retrocede vários merges e os arquivos das
# entregas mais novas somem. Nada disso passa pelo git, então não aparece no
# reflog. O efeito prático é perigoso: o hook de parada vê "alterações não
# commitadas" e pede um commit que, se feito, reverteria em produção tudo que
# já foi mergeado.
#
# O QUE ELE FAZ
# Só age quando o HEAD local já está contido no origin/main, ou seja, quando
# não existe commit local por publicar. Nesse caso guarda o estado do disco num
# stash (para nada sumir sem rastro) e traz o checkout de volta para o
# origin/main. Se houver commit local ainda não mergeado, ele não toca em nada
# e apenas avisa.
set -uo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || exit 0
[[ -n "$(git remote 2>/dev/null)" ]] || exit 0

aviso() { printf '{"systemMessage":%s,"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$1" "$1"; }
json() { printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'; }

git fetch -q origin main 2>/dev/null || exit 0
git rev-parse -q --verify origin/main >/dev/null 2>&1 || exit 0

# Nada fora do lugar: árvore limpa e no mesmo commit do main.
sujo=""
git diff --quiet && git diff --cached --quiet || sujo="1"
[[ -n "$(git ls-files --others --exclude-standard)" ]] && sujo="1"
if [[ -z "$sujo" && "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]]; then
  exit 0
fi

# Existe commit local que ainda não está no main? Então é trabalho de verdade:
# não é papel deste hook decidir o destino dele.
if ! git merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
  pendentes="$(git rev-list origin/main..HEAD --count 2>/dev/null || echo '?')"
  aviso "$(json "A árvore tem $pendentes commit(s) locais fora do origin/main. Não mexi em nada: confira antes de publicar.")"
  exit 0
fi

atras="$(git rev-list HEAD..origin/main --count 2>/dev/null || echo 0)"
if [[ "$atras" == "0" && -n "$sujo" ]]; then
  # No commit certo, só com edições em andamento. Provavelmente trabalho real.
  exit 0
fi

ramo="$(git branch --show-current)"
[[ -n "$ramo" ]] || ramo="claude/ressincronizado"
if [[ -n "$sujo" ]]; then
  git stash push -u -q -m "disco anterior a ressincronizacao ($(git rev-parse --short HEAD))" 2>/dev/null
fi
git checkout -f -B "$ramo" origin/main -q 2>/dev/null || exit 0

aviso "$(json "O disco tinha voltado $atras merge(s) atrás. Ressincronizei o checkout com o origin/main ($(git rev-parse --short HEAD)). O estado anterior ficou em 'git stash list'. Não commite conteúdo antigo por cima do que já está publicado.")"
exit 0
