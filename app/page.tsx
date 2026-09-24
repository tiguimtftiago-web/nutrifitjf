import { ArrowRight, Check, MessageCircle, ShoppingBag, Star } from "lucide-react";

const whatsapp =
  "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

const products = [
  {
    name: "Patinho com Abóbora",
    tag: "FIT • 350 G",
    price: "R$ 23,97",
    description: "150 g de proteína + acompanhamento equilibrado.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=88",
  },
  {
    name: "Patinho com Batata-Doce",
    tag: "FIT • 350 G",
    price: "R$ 23,97",
    description: "Patinho temperado, batata-doce e legumes.",
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=1200&q=88",
  },
  {
    name: "Frango Cremoso Fit",
    tag: "FIT • 350 G",
    price: "R$ 23,97",
    description: "Frango suculento com acompanhamentos da linha Fit.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=88",
  },
  {
    name: "Strogonoff Leve",
    tag: "FIT • 350 G",
    price: "R$ 23,97",
    description: "Versão cremosa e equilibrada para a rotina.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=88",
  },
  {
    name: "Churrasco Fit Mineiro",
    tag: "FIT • 350 G",
    price: "R$ 23,97",
    description: "Sabor de churrasco em uma refeição prática.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=88",
  },
  {
    name: "Parmegiana Cremosa",
    tag: "FIT • 350 G",
    price: "R$ 23,97",
    description: "Parmegiana com acompanhamentos selecionados.",
    image: "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=1200&q=88",
  },
];

const combos = [
  ["5 marmitas", "R$ 114,90", "R$ 22,98 / un."],
  ["7 marmitas", "R$ 157,90", "R$ 22,56 / un."],
  ["10 marmitas", "R$ 219,90", "R$ 21,99 / un."],
  ["14 marmitas", "R$ 299,90", "R$ 21,42 / un."],
  ["20 marmitas", "R$ 419,90", "R$ 21,00 / un."],
];

const juices = ["GREEN", "GLOW", "SUN", "ENERGY", "PINK"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a07]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#inicio" className="text-2xl font-black tracking-tight">
            nutri<span className="text-[#a7b86a]">fit</span>
          </a>
          <nav className="hidden gap-7 text-sm font-semibold text-white/65 md:flex">
            <a href="#cardapio" className="transition hover:text-white">Cardápio</a>
            <a href="#combos" className="transition hover:text-white">Combos</a>
            <a href="#sucos" className="transition hover:text-white">Sucos</a>
            <a href="#como-pedir" className="transition hover:text-white">Como pedir</a>
          </nav>
          <a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-5 py-2.5 text-sm font-black text-black transition hover:scale-[1.02]">
            <MessageCircle size={17} /> Pedir agora
          </a>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(167,184,106,.18),transparent_35%),radial-gradient(circle_at_15%_80%,rgba(239,125,24,.10),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-8 md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#cbd99a]">
              Juiz de Fora • comida de verdade
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.92] tracking-[-.04em] md:text-7xl">
              Sua semana mais
              <span className="block text-[#a7b86a]">prática e saborosa.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/60">
              Marmitas preparadas para quem quer comer bem sem complicar a rotina.
              Linha Fit de 350 g com 150 g de proteína.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#combos" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-7 py-4 font-black text-black transition hover:scale-[1.01]">
                Ver combos <ArrowRight size={18} />
              </a>
              <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 font-bold transition hover:bg-white/10">
                Pedir pelo WhatsApp <MessageCircle size={18} />
              </a>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["350 g", "Linha Fit"],
                ["150 g", "Proteína"],
                ["JF", "Entrega local"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                  <div className="text-xl font-black text-white">{value}</div>
                  <div className="mt-1 text-xs text-white/45">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10130d] shadow-2xl">
            <img
              src={products[0].image}
              alt="Marmita saudável"
              className="aspect-[4/4.2] w-full object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/70 p-5 backdrop-blur-md">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Linha Fit</div>
                  <div className="mt-1 text-2xl font-black">350 g</div>
                  <div className="mt-1 text-sm text-white/55">150 g de proteína</div>
                </div>
                <div className="text-2xl font-black text-[#ef7d18]">R$ 23,97</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cardapio" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Cardápio</div>
            <h2 className="mt-2 text-4xl font-black md:text-5xl">Linha Fit 350 g</h2>
            <p className="mt-3 max-w-2xl text-white/50">Comida de verdade, porção prática e 150 g de proteína.</p>
          </div>
          <div className="rounded-2xl border border-[#a7b86a]/25 bg-[#a7b86a]/10 px-5 py-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#cbd99a]">Avulsa</div>
            <div className="text-2xl font-black text-[#a7b86a]">R$ 23,97</div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.name} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-[#a7b86a]/35">
              <div className="aspect-[4/3] overflow-hidden bg-black">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#a7b86a] px-3 py-1 text-[10px] font-black tracking-wider text-black">{product.tag}</span>
                  <span className="font-black text-[#ef7d18]">{product.price}</span>
                </div>
                <h3 className="mt-4 text-xl font-black">{product.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{product.description}</p>
                <a href={whatsapp} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#cbd99a]">Pedir esta marmita <ArrowRight size={15} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="combos" className="border-y border-white/10 bg-[#10130d]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Compre mais, pague menos</div>
            <h2 className="mt-2 text-4xl font-black md:text-5xl">Combos Nutrifit</h2>
            <p className="mt-4 text-white/50">O preço avulso é R$ 23,97. Nos combos, o valor médio por marmita diminui conforme você compra mais.</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {combos.map(([quantity, price, average], index) => (
              <a key={quantity} href={whatsapp} className={`rounded-3xl border p-6 transition hover:-translate-y-1 ${index === 2 ? "border-[#ef7d18]/50 bg-[#ef7d18]/10" : "border-white/10 bg-white/[.035]"}`}>
                {index === 2 && <div className="mb-4 inline-flex rounded-full bg-[#ef7d18] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">Mais pedido</div>}
                <div className="text-sm font-bold text-white/55">{quantity}</div>
                <div className="mt-2 text-3xl font-black">{price}</div>
                <div className="mt-2 text-xs text-[#a7b86a]">{average}</div>
                <div className="mt-5 text-sm font-bold text-white/60">Escolher combo →</div>
              </a>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Mais variedade", "Monte sua semana com diferentes pratos."],
              ["Mais economia", "Quanto maior o combo, menor o preço médio."],
              ["Mais praticidade", "Resolva várias refeições de uma vez."],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-3 rounded-2xl border border-white/10 p-5">
                <Check className="mt-0.5 shrink-0 text-[#a7b86a]" size={19} />
                <div><div className="font-black">{title}</div><div className="mt-1 text-sm text-white/45">{text}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sucos" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#171d10] to-[#0e110c] p-8 md:p-12">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Sucos naturais</div>
              <h2 className="mt-2 text-4xl font-black">500 ml • R$ 12,90</h2>
              <p className="mt-3 text-white/50">Para completar sua refeição com praticidade.</p>
            </div>
            <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold">
              Pedir suco <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {juices.map((juice) => (
              <a key={juice} href={whatsapp} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center transition hover:border-[#a7b86a]/40">
                <div className="font-black">{juice}</div>
                <div className="mt-2 text-xs text-white/40">500 ml</div>
                <div className="mt-3 font-black text-[#ef7d18]">R$ 12,90</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="como-pedir" className="border-t border-white/10 bg-[#0d100c]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01", "Escolha", "Veja o cardápio e escolha suas marmitas."],
              ["02", "Peça", "Clique no WhatsApp e envie seu pedido."],
              ["03", "Receba", "Combine entrega e pagamento com a Nutrifit."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-3xl border border-white/10 bg-white/[.03] p-7">
                <div className="text-sm font-black text-[#ef7d18]">{number}</div>
                <h3 className="mt-3 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/50">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-8 md:p-10">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-1 text-[#ef7d18]">
                  {[1,2,3,4,5].map((i) => <Star key={i} size={15} fill="currentColor" />)}
                </div>
                <h2 className="mt-3 text-3xl font-black">Pronto para organizar sua semana?</h2>
                <p className="mt-2 text-white/50">Faça seu pedido direto pelo WhatsApp.</p>
              </div>
              <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-7 py-4 font-black text-black">
                <ShoppingBag size={18} /> Fazer pedido
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between md:px-8">
          <span>© 2026 Nutrifit • Juiz de Fora - MG</span>
          <span>@nutrifit_jf • (32) 99803-0038</span>
        </div>
      </footer>
    </main>
  );
}
