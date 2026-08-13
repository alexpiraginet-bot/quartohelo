---
name: transcrever-audio
description: Transcreve áudio e vídeo enviados na conversa (m4a, mp3, ogg, wav, mp4, opus), em português ou qualquer idioma. Use SEMPRE que o usuário anexar um arquivo de áudio ou vídeo, mandar um áudio de WhatsApp, ou pedir para "ouvir", "escutar", "transcrever" ou "ver o que a cliente falou". Não responda que não consegue ouvir: este ambiente transcreve localmente, basta seguir os passos.
---

# Transcrever áudio

O ambiente **não vem** com transcrição pronta, mas instala em menos de um minuto e
roda offline depois disso. Áudio anexado na conversa cai em
`/root/.claude/uploads/<sessão>/`.

Nunca diga que não é possível ouvir. Instale e transcreva.

## Passo 1: instalar

```bash
pip3 install --break-system-packages -q faster-whisper
```

Puxa `av` junto, que decodifica m4a, ogg, opus e mp4 sozinho. **Não precisa de
ffmpeg** no sistema, e não adianta procurar por ele: não existe aqui.

## Passo 2: transcrever

```python
from faster_whisper import WhisperModel
modelo = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = modelo.transcribe(caminho, language="pt", vad_filter=True, beam_size=5)
for s in segs:
    print("[%02d:%02d] %s" % (int(s.start)//60, int(s.start)%60, s.text.strip()))
```

- `small` é o ponto de equilíbrio para português: baixa cerca de 500 MB na
  primeira vez e transcreve mais ou menos no tempo real do áudio (46 s de áudio
  levaram 42 s). `base` é o dobro de rápido e erra mais nome próprio.
- `language="pt"` evita que ele tente adivinhar o idioma em áudio curto.
- `vad_filter=True` corta silêncio e reduz alucinação em gravação de celular.
- Passe vários arquivos de uma vez: o modelo carrega uma só vez.

## Passo 3: usar

Mostre a transcrição com marca de tempo antes de responder, para o usuário
conferir se você entendeu. Áudio de celular erra nome próprio e sotaque, então
**não trate a transcrição como citação literal** em documento de cliente: confirme
o trecho quando a decisão depender dele.

## Se o ambiente reverter

Esta máquina volta para um instantâneo antigo quando é reciclada, e leva junto o
que o pip instalou. Se `import faster_whisper` falhar de novo, repita o passo 1.
O modelo baixado também some, então a primeira transcrição depois da reversão
demora um pouco mais.
