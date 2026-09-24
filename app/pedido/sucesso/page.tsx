import Link from "next/link";

export default function PedidoSucesso() {
  return (
    <main className="min-h-screen bg-[#080a07] px-5 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-[#a7b86a]/30 bg-[#10130d] p-8 text-center md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#a7b86a] text-3xl text-black">✓</div>
        <div className="mt-6 text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Pagamento confirmado</div>
        <h1 className="mt-2 text-4xl font-black">Pedido recebido!</h1>
        <p className="mt-4 leading-7 text-white/55">O Mercado Pago confirmou o pagamento. A Nutrifit recebeu a confirmação e seguirá com o preparo do pedido.</p>
        <Link href="/#combos" className="mt-7 inline-flex rounded-full bg-[#ef7d18] px-6 py-3.5 font-black text-black">Voltar ao site</Link>
      </div>
    </main>
  );
}
