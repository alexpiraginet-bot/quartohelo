"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    LexSupport?: { open?: () => void };
  }
}

export function openSupport() {
  if (typeof window !== "undefined" && window.LexSupport?.open) window.LexSupport.open();
  else document.querySelector<HTMLElement>("#lex-support-btn,[data-lex-support]")?.click();
}

/** Efeitos da landing: nav solidifica ao rolar + reveal on scroll (degradável). */
export function LandingFx() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("solid", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const rv = document.querySelectorAll<HTMLElement>(".rv");
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      document.documentElement.classList.add("jsrv");
      io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io?.unobserve(e.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      rv.forEach((el) => io?.observe(el));
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);
  return null;
}

export function SupportButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={openSupport}>
      {children}
    </button>
  );
}
