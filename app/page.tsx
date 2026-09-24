import { ArrowRight, Check, MessageCircle, ShoppingBag } from "lucide-react";

const whatsapp =
  "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

type Product = {
  name: string;
  line: string;
  weight: string;
  price: string;
  description: string;
  image: string;
};

const fit: Product[] = [
  ["Patinho com Abóbora","FIT","350 g","R$ 23,97","Patinho moído temperado e purê de abóbora cremoso."],
  ["Carne Acebolada com Legumes","FIT","350 g","R$ 23,97","Carne bovina em tiras refogada com cebola e mix de legumes."],
  ["Frango Grelhado com Legumes","FIT","350 g","R$ 23,97","Peito de frango grelhado acompanhado de legumes selecionados."],
  ["Frango ao Molho de Ervas","FIT","350 g","R$ 23,97","Peito de frango ao molho de ervas finas com legumes."],
  ["Lombo Suíno com Legumes Assados","FIT","350 g","R$ 23,97","Lombo suíno grelhado temperado com legumes assados."],
  ["Patinho com Batata-doce","FIT","350 g","R$ 23,97","Patinho moído refogado com purê de batata-doce cremoso."],
  ["Patinho com Legumes","FIT","350 g","R$ 23,97","Patinho moído refogado com temperos naturais e legumes."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[4,5,6,7,8,9,10][i]}.jpg`}));

const performance: Product[] = [
  ["Chicken Parmesão","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, molho de tomate artesanal, queijo parmesão, arroz integral e legumes."],
  ["Tilápia Power","PERFORMANCE","450 g","R$ 27,90","Tilápia grelhada, arroz integral, batata-doce assada e legumes."],
  ["Beef & Sweet Potato","PERFORMANCE","450 g","R$ 29,90","Carne bovina grelhada, batata-doce assada e arroz branco."],
  ["Chicken Sweet Potato","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, batata-doce assada e arroz branco."],
  ["Chicken Potato","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, purê de batata inglesa, brócolis, cenoura e couve-flor."],
  ["Patinho Strong","PERFORMANCE","450 g","R$ 29,90","Patinho moído temperado, purê de abóbora e arroz branco."],
  ["Chicken Rice","PERFORMANCE","450 g","R$ 27,90","Frango grelhado, arroz branco e legumes salteados."],
  ["Beef Pasta","PERFORMANCE","450 g","R$ 29,90","Patinho em tiras grelhadas, macarrão integral ao molho de tomate artesanal e brócolis."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[12,13,14,15,16,17,18,19][i]}.jpg`}));

const salads: Product[] = [
  ["Mango Fresh","SALADAS","350 g","R$ 21,90","Mix de folhas, manga, tomate-cereja, pepino, castanhas, amêndoas, 100 g de frango e molho de maracujá."],
  ["Green Power","SALADAS","350 g","R$ 21,90","Mix de folhas, frango grelhado, abacate, brócolis, ervilha, pepino, tomate-cereja e sementes."],
  ["Tropical Chicken","SALADAS","350 g","R$ 21,90","Mix de alface, frango grelhado, abacaxi, milho, cenoura, repolho roxo, pepino e tomate-cereja."],
  ["Avocado Chicken","SALADAS","350 g","R$ 21,90","Mix de folhas, frango grelhado, abacate, tomate-cereja, pepino, cenoura, cebola roxa e molho."],
  ["Caesar Chicken","SALADAS","350 g","R$ 21,90","Mix de alface americana, frango grelhado, tomate-cereja, cenoura, croutons e queijo."],
  ["Summer Salad","SALADAS","350 g","R$ 21,90","Mix de alface, tomate-cereja, pepino, repolho roxo, cenoura, acompanhado de frango grelhado."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[21,22,23,24,25,26][i]}.jpg`}));

const traditional: Product[] = [
  ["Patinho com Abóbora","TRADICIONAL","500 g","R$ 29,90","Patinho moído refogado, purê de abóbora cremoso e arroz branco soltinho."],
  ["Parmegiana Cremosa","TRADICIONAL","500 g","R$ 26,90","Arroz branco, purê de batata, filé de frango empanado e assado, molho artesanal e queijo gratinado."],
  ["Feijoada Fit","TRADICIONAL","500 g","R$ 26,90","Feijão cremoso, calabresa, lombo suíno, arroz branco, couve e farofa crocante."],
  ["Frango Cremoso","TRADICIONAL","500 g","R$ 26,90","Frango em molho cremoso especial, arroz branco soltinho e legumes na manteiga."],
  ["Churrasco Fit Mineiro","TRADICIONAL","500 g","R$ 29,90","Contra-filé grelhado, vinagrete fresco, arroz branco soltinho e farofa caseira."],
  ["Strogonoff Leve","TRADICIONAL","500 g","R$ 26,90","Arroz branco, strogonoff leve de frango, brócolis e batata palha."],
  ["Executivo Saudável","TRADICIONAL","500 g","R$ 26,90","Lombo suíno grelhado, macarrão alho e óleo, molho cremoso leve e brócolis."]
].map(([name,line,weight,price,description], i) => ({name,line,weight,price,description,image:`/images/page-${[28,29,30,31,32,33,34][i]}.jpg`}));

const combos = [
  ["Fit 350 g","5 marmitas","R$ 117,00","R$ 23,40/un"],
  ["Fit 350 g","7 marmitas","R$ 164,00","R$ 23,43/un"],
  ["Fit 350 g","10 marmitas","R$ 235,00","R$ 23,50/un"],
  ["Fit 350 g","14 marmitas","R$ 328,00","R$ 23,43/un"],
  ["Fit 350 g","20 marmitas","R$ 459,00","R$ 22,95/un"],
  ["Performance 450 g","5 marmitas","R$ 139,90","R$ 27,98/un"],
  ["Performance 450 g","7 marmitas","R$ 194,90","R$ 27,84/un"],
  ["Performance 450 g","10 marmitas","R$ 274,90","R$ 27,49/un"],
  ["Performance 450 g","14 marmitas","R$ 384,90","R$ 27,49/un"],
  ["Performance 450 g","20 marmitas","R$ 539,90","R$ 27,00/un"],
  ["Tradicional 500 g","5 marmitas","R$ 139,90","R$ 27,98/un"],
  ["Tradicional 500 g","7 marmitas","R$ 194,90","R$ 27,84/un"],
  ["Tradicional 500 g","10 marmitas","R$ 269,90","R$ 26,99/un"],
  ["Tradicional 500 g","14 marmitas","R$ 379,90","R$ 27,14/un"],
  ["Tradicional 500 g","20 marmitas","R$ 529,90","R$ 26,50/un"],
];

const functionalJuices = ["Energy","Green","Pink","Sun","Purple","Glow"];
const naturalJuices = ["Suco de Laranja","Laranja com Acerola","Abacaxi com Hortelã"];

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035] transition hover:-translate-y-1 hover:border-[#a7b86a]/35">
      <div className="aspect-[4/3] overflow-hidden bg-black">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#a7b86a] px-3 py-1 text-[10px] font-black tracking-wider text-black">{product.line} • {product.weight}</span>
          <span className="font-black text-[#ef7d18]">{product.price}</span>
        </div>
        <h3 className="mt-4 text-xl font-black">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/50">{product.description}</p>
        <a href={whatsapp} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#cbd99a]">Pedir esta opção <ArrowRight size={15} /></a>
      </div>
    </article>
  );
}

function Section({ id, eyebrow, title, subtitle, products }: { id:string; eyebrow:string; title:string; subtitle:string; products:Product[] }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <div className="max-w-3xl">
        <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">{eyebrow}</div>
        <h2 className="mt-2 text-4xl font-black md:text-5xl">{title}</h2>
        <p className="mt-3 text-white/50">{subtitle}</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.name} product={product} />)}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a07]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#inicio" className="text-2xl font-black tracking-tight">nutri<span className="text-[#a7b86a]">fit</span></a>
          <nav className="hidden gap-7 text-sm font-semibold text-white/65 md:flex">
            <a href="#cardapio" className="hover:text-white">Cardápio</a>
            <a href="#combos" className="hover:text-white">Combos</a>
            <a href="#sucos" className="hover:text-white">Sucos</a>
            <a href="#como-pedir" className="hover:text-white">Como pedir</a>
          </nav>
          <a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-5 py-2.5 text-sm font-black text-black"><MessageCircle size={17} /> Pedir agora</a>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(167,184,106,.18),transparent_35%),radial-gradient(circle_at_15%_80%,rgba(239,125,24,.10),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-8 md:py-24">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#cbd99a]">Juiz de Fora • comida de verdade</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.92] tracking-[-.04em] md:text-7xl">Praticidade, sabor e qualidade<span className="block text-[#a7b86a]">todos os dias.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/60">Cardápio completo Nutrifit 2026: Linha Fit, Performance, Saladas, Tradicional e Sucos.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#combos" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-7 py-4 font-black text-black">Ver combos <ArrowRight size={18} /></a>
              <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 font-bold">Pedir pelo WhatsApp <MessageCircle size={18} /></a>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
              {[["350 g","Fit / Saladas"],["450 g","Performance"],["500 g","Tradicional"]].map(([value,label]) => <div key={value} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xl font-black">{value}</div><div className="mt-1 text-xs text-white/45">{label}</div></div>)}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#10130d] shadow-2xl">
            <img src={fit[0].image} alt="Nutrifit - Patinho com Abóbora" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/70 p-5 backdrop-blur-md">
              <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Linha Fit</div>
              <div className="mt-1 flex items-end justify-between gap-4"><div><div className="text-2xl font-black">350 g</div><div className="text-sm text-white/55">Patinho com Abóbora</div></div><div className="text-2xl font-black text-[#ef7d18]">R$ 23,97</div></div>
            </div>
          </div>
        </div>
      </section>

      <Section id="cardapio" eyebrow="Saudável, equilibrada, leve" title="Linha Fit • 350 g" subtitle="Marmitas 350 g para o seu dia a dia. Unidade R$ 23,97." products={fit} />
      <Section id="performance" eyebrow="Alta proteína e energia" title="Linha Performance • 450 g" subtitle="Frango R$ 27,90 • Bovina R$ 29,90." products={performance} />
      <Section id="saladas" eyebrow="Frescor, leveza e nutrição" title="Linha Saladas • 350 g" subtitle="Saladas vendidas por unidade • R$ 21,90." products={salads} />
      <Section id="tradicional" eyebrow="Sabor caseiro" title="Linha Tradicional • 500 g" subtitle="Bovina R$ 29,90 • Demais R$ 26,90." products={traditional} />

      <section id="combos" className="border-y border-white/10 bg-[#10130d]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Mais praticidade, mais economia</div><h2 className="mt-2 text-4xl font-black md:text-5xl">Combos Nutrifit</h2><p className="mt-4 text-white/50">Os combos podem misturar sabores dentro da mesma linha.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {combos.map(([line,quantity,price,average]) => <a key={line+quantity} href={whatsapp} className="rounded-3xl border border-white/10 bg-white/[.035] p-6 transition hover:-translate-y-1 hover:border-[#a7b86a]/40"><div className="text-xs font-black uppercase tracking-wider text-[#a7b86a]">{line}</div><div className="mt-3 text-sm font-bold text-white/55">{quantity}</div><div className="mt-2 text-3xl font-black">{price}</div><div className="mt-2 text-xs text-[#ef7d18]">{average}</div><div className="mt-5 text-sm font-bold text-white/60">Escolher combo →</div></a>)}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[["Combos dentro da linha","Misture sabores sem sair da mesma linha."],["Praticidade","Organize várias refeições de uma vez."],["Atendimento direto","Faça seu pedido pelo WhatsApp."]].map(([title,text]) => <div key={title} className="flex gap-3 rounded-2xl border border-white/10 p-5"><Check className="mt-0.5 shrink-0 text-[#a7b86a]" size={19} /><div><div className="font-black">{title}</div><div className="mt-1 text-sm text-white/45">{text}</div></div></div>)}
          </div>
        </div>
      </section>

      <section id="sucos" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#171d10] to-[#0e110c] p-8 md:p-12">
          <div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Funcionais e 100% naturais</div><h2 className="mt-2 text-4xl font-black">Linha de Sucos</h2><p className="mt-3 text-white/50">Nutrifit Mulher • 500 ml • R$ 12,90</p></div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">{functionalJuices.map(j => <a href={whatsapp} key={j} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center hover:border-[#a7b86a]/40"><div className="font-black">{j}</div><div className="mt-2 text-xs text-white/40">500 ml</div><div className="mt-3 font-black text-[#ef7d18]">R$ 12,90</div></a>)}</div>
          <div className="mt-10 border-t border-white/10 pt-8"><div className="text-sm font-black uppercase tracking-wider text-[#ef7d18]">Sucos Nutrifit • 500 ml • R$ 12,00</div><div className="mt-4 grid gap-3 sm:grid-cols-3">{naturalJuices.map(j => <a href={whatsapp} key={j} className="rounded-2xl border border-white/10 bg-black/20 p-5 font-black hover:border-[#a7b86a]/40">{j}</a>)}</div></div>
        </div>
      </section>

      <section id="como-pedir" className="border-t border-white/10 bg-[#0d100c]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-5 md:grid-cols-3">{[["01","Escolha","Veja o cardápio e escolha suas marmitas."],["02","Peça","Clique no WhatsApp e envie seu pedido."],["03","Receba","Combine entrega e pagamento com a Nutrifit."]].map(([number,title,text]) => <div key={number} className="rounded-3xl border border-white/10 bg-white/[.03] p-7"><div className="text-sm font-black text-[#ef7d18]">{number}</div><h3 className="mt-3 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/50">{text}</p></div>)}</div>
          <div className="mt-10 rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-8 md:p-10"><div className="flex flex-col justify-between gap-7 md:flex-row md:items-center"><div><h2 className="text-3xl font-black">Peça já a sua marmita</h2><p className="mt-2 text-white/50">Praticidade, sabor e qualidade — todos os dias.</p><p className="mt-4 text-sm text-white/60">Juiz de Fora / MG • @nutrifit_jf • (32) 99803-0038</p><p className="mt-1 text-sm text-white/40">iFood • Facebook • Atendimento B2B</p></div><a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-7 py-4 font-black text-black"><ShoppingBag size={18} /> Fazer pedido</a></div></div>
        </div>
      </section>

      <footer className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between md:px-8"><span>© 2026 Nutrifit • Juiz de Fora - MG</span><span>@nutrifit_jf • (32) 99803-0038</span></div></footer>
    </main>
  );
}
