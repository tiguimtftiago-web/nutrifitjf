"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

type ConsentChoice = "accepted" | "rejected" | null;

const STORAGE_KEY = "nutrifit_analytics_consent";

function clearAnalyticsCookies() {
  if (typeof document === "undefined") return;
  const names = document.cookie.split(";").map((part) => part.trim().split("=")[0]);
  const analyticsNames = names.filter((name) =>
    name === "_ga" || name === "_gid" || name === "_gat" || name.startsWith("_ga_") || name.startsWith("_gac_") || name === "_gcl_au"
  );
  const host = window.location.hostname;
  const domains = [undefined, host, host.includes(".") ? "." + host.split(".").slice(-2).join(".") : undefined].filter(Boolean) as string[];
  for (const name of analyticsNames) {
    for (const domain of domains) {
      document.cookie = domain
        ? `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`
        : `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  }
}

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "accepted" || saved === "rejected") setChoice(saved);
    } catch {
      setChoice("rejected");
    }
  }, []);

  const saveChoice = (next: "accepted" | "rejected") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    if (next === "rejected") clearAnalyticsCookies();
    setChoice(next);
    setSettingsOpen(false);
  };

  return (
    <>
      {choice === "accepted" && (
        <>
          <Analytics />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-40YWBD3WXW"
            strategy="afterInteractive"
          />
          <Script id="google-analytics-consented" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-40YWBD3WXW');`}
          </Script>
        </>
      )}

      {(choice === null || settingsOpen) ? (
        <aside
          aria-label="Preferências de privacidade"
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-white/15 bg-[#10140d] p-4 text-white shadow-2xl sm:inset-x-5 sm:bottom-5 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-[#d9e5b2]">Privacidade e cookies</h2>
              <p className="mt-1 text-xs leading-5 text-white/70">
                Usamos armazenamento essencial para o funcionamento do site. Com sua autorização, o Google Analytics e a Vercel Analytics também medem visitas e uso das páginas para ajudar a melhorar a Nutrifit. Você pode recusar sem perder acesso à loja.
              </p>
              <a href="/privacidade" className="mt-2 inline-block text-xs font-bold text-[#f47b0b] underline underline-offset-4">
                Ler política de privacidade
              </a>
            </div>
            {choice !== null && (
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Fechar preferências" className="rounded-full p-1 text-white/60 hover:bg-white/10">
                ×
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => saveChoice("rejected")} className="min-h-11 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white/85 hover:bg-white/5">
              Recusar analíticos
            </button>
            <button type="button" onClick={() => saveChoice("accepted")} className="min-h-11 rounded-full bg-[#f47b0b] px-4 py-2 text-sm font-black text-black hover:bg-orange-400">
              Aceitar analíticos
            </button>
          </div>
        </aside>
      ) : (
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="fixed bottom-3 left-3 z-[90] rounded-full border border-white/20 bg-[#10140d]/95 px-3 py-2 text-[11px] font-bold text-white/70 shadow-lg backdrop-blur hover:text-white"
        >
          Preferências de privacidade
        </button>
      )}
    </>
  );
}
