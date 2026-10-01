"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080a07] px-6 text-white">
      <section className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#b7dc62] text-xl font-black text-black shadow-lg shadow-[#b7dc62]/10">
          NF
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b7dc62]">Nutrifit</p>
        <Loader2 className="mt-5 h-6 w-6 animate-spin text-white/60" aria-label="Carregando" />
        <p className="mt-3 text-sm text-white/55">Carregando seu cardápio...</p>
      </section>
    </main>
  );
}
