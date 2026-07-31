"use client";

import { useEffect } from "react";

/* A faixa de pré-visualização é fixa no topo, então o conteúdo precisa começar
 * exatamente abaixo dela. A altura muda com a largura da tela (o texto quebra),
 * e chutar um valor por breakpoint deixa a faixa cobrindo o topo do site em
 * algum tamanho. Aqui a altura é medida e vira a variável --prev-h. */

export function PreviewFit() {
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".prev-bar");
    const page = document.querySelector<HTMLElement>(".prev-page");
    if (!bar || !page) return;
    const ajustar = () =>
      page.style.setProperty("--prev-h", `${Math.round(bar.getBoundingClientRect().height)}px`);
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(bar);
    window.addEventListener("resize", ajustar);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", ajustar);
    };
  }, []);
  return null;
}
