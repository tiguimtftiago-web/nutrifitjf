"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Nutrifit global application error:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="bg-[#080a07] text-white">
        <main className="flex min-h-screen items-center justify-center px-6 py-12">
          <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[.04] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#b7dc62] text-2xl font-black text-black">
              NF
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b7dc62]">
              Nutrifit
            </p>
            <h1 className="text-2xl font-black md:text-3xl">
              Tivemos uma instabilidade
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
              Não foi possível carregar o site agora. Tente novamente para
              restaurar a página.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-full bg-[#b7dc62] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.01]"
            >
              Tentar novamente
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
