import Link from "next/link";

export default function PedidoFalha() {
  return (
    <main className="min-h-screen bg-[#080a07] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#ef7d18]/30 bg-[#17120c] p-8 text-center md:p-12">
        <div className="text-5xl">!</div>
        <div className="mt-5 text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Pagamento não concluído</div>
        <h1 className="mt-2 text-4xl font-black">Não conseguimos confirmar o pagamento</h1>
        <p className="mt-4 leading-7 text-white/55">Você pode voltar ao site e tentar novamente. Se precisar, fale diretamente com a Nutrifit pelo WhatsApp.</p>
        <Link href="/#combos" className="mt-7 inline-flex rounded-full bg-[#ef7d18] px-6 py-3.5 font-black text-black">Tentar novamente</Link>
      </div>
    </main>
  );
}
