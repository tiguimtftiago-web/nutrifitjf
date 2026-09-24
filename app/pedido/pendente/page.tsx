import Link from "next/link";

export default function PedidoPendente() {
  return (
    <main className="min-h-screen bg-[#080a07] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#ef7d18]/30 bg-[#17120c] p-8 text-center md:p-12">
        <div className="text-5xl">⏳</div>
        <div className="mt-5 text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Pagamento em processamento</div>
        <h1 className="mt-2 text-4xl font-black">Estamos aguardando a confirmação</h1>
        <p className="mt-4 leading-7 text-white/55">O pagamento ainda não foi confirmado como concluído. Não faça outro pagamento antes de verificar o status.</p>
        <Link href="/#combos" className="mt-7 inline-flex rounded-full bg-[#a7b86a] px-6 py-3.5 font-black text-black">Voltar ao site</Link>
      </div>
    </main>
  );
}
