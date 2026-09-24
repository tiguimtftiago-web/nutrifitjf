import { ArrowRight, Check, MessageCircle, ShoppingBag, MapPin, Truck, Building2, HelpCircle } from "lucide-react";

const whatsapp =
  "https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20fazer%20um%20pedido.";

const whatsappOrder = (text: string) =>
  `https://wa.me/5532998030038?text=${encodeURIComponent(text)}`;

const instagram = "https://www.instagram.com/nutrifit_jf/";

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

const comboHighlights = [
  {
    line: "FIT",
    weight: "350 g",
    title: "Patinho com Abóbora",
    image: "/images/page-4.jpg",
    price: "a partir de R$ 117,00",
    text: "Escolha seus sabores e monte seu combo com 5, 7, 10, 14 ou 20 marmitas."
  },
  {
    line: "PERFORMANCE",
    weight: "450 g",
    title: "Chicken Parmesão",
    image: "/images/page-12.jpg",
    price: "a partir de R$ 139,90",
    text: "Mais proteína e refeições maiores para sua rotina. Combine os sabores da linha."
  },
  {
    line: "TRADICIONAL",
    weight: "500 g",
    title: "Parmegiana Cremosa",
    image: "/images/page-29.jpg",
    price: "a partir de R$ 139,90",
    text: "Comida com sabor caseiro em combos de 5, 7, 10, 14 ou 20 marmitas."
  },
];

const functionalJuices = [
  ["Energy","/images/page-36.jpg"],
  ["Green","/images/page-37.jpg"],
  ["Pink","/images/page-38.jpg"],
  ["Sun","/images/page-39.jpg"],
  ["Purple","/images/page-40.jpg"],
  ["Glow","/images/page-41.jpg"],
];
const naturalJuices = [
  ["Suco de Laranja","/images/page-42.jpg"],
  ["Laranja com Acerola","/images/page-43.jpg"],
  ["Abacaxi com Hortelã","/images/page-44.jpg"],
];

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
        <a href={whatsappOrder(`Olá, Nutrifit! Quero pedir: ${product.name} (${product.line}, ${product.weight}).`)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#cbd99a]">Pedir esta opção <ArrowRight size={15} /></a>
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
          <nav className="hidden gap-6 text-sm font-semibold text-white/65 lg:flex">
            <a href="#cardapio" className="hover:text-white">Cardápio</a>
            <a href="#combos" className="hover:text-white">Combos</a>
            <a href="#sucos" className="hover:text-white">Sucos</a>
            <a href="#como-pedir" className="hover:text-white">Como pedir</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#cardapio" className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/75 lg:hidden">Cardápio</a>
            <a href="#combos" className="inline-flex rounded-full border border-[#a7b86a]/30 bg-[#a7b86a]/10 px-4 py-2 text-xs font-black text-[#cbd99a] lg:hidden">Combos</a>
            <a href={whatsapp} className="inline-flex items-center gap-2 rounded-full bg-[#ef7d18] px-4 py-2.5 text-sm font-black text-black"><MessageCircle size={17} /> <span className="hidden sm:inline">Pedir agora</span><span className="sm:hidden">Pedir</span></a>
          </div>
        </div>
      </header>

      <section id="inicio" className="border-b border-white/10 bg-[#080a07]">
        <div className="w-full overflow-hidden">
          <img
            src="/images/91de66d4-d4da-471c-9178-6ca8f363602c.png"
            alt="Nutrifit — comida de verdade para todos os estilos de vida"
            className="block h-auto w-full"
            fetchPriority="high"
          />
        </div>
      </section>
      <Section id="cardapio" eyebrow="Saudável, equilibrada, leve" title="Linha Fit • 350 g" subtitle="Marmitas 350 g para o seu dia a dia. Unidade R$ 23,97." products={fit} />
      <Section id="performance" eyebrow="Alta proteína e energia" title="Linha Performance • 450 g" subtitle="Frango R$ 27,90 • Bovina R$ 29,90." products={performance} />
      <Section id="saladas" eyebrow="Frescor, leveza e nutrição" title="Linha Saladas • 350 g" subtitle="Saladas vendidas por unidade • R$ 21,90." products={salads} />
      <Section id="tradicional" eyebrow="Sabor caseiro" title="Linha Tradicional • 500 g" subtitle="Bovina R$ 29,90 • Demais R$ 26,90." products={traditional} />

      <section id="combos" className="border-y border-white/10 bg-[#10130d]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Mais praticidade, mais economia</div>
            <h2 className="mt-2 text-4xl font-black md:text-6xl">Escolha seu combo</h2>
            <p className="mt-4 text-white/50">Comida de verdade, porções prontas para sua rotina. Escolha a linha e misture os sabores dentro dela.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {comboHighlights.map((item) => (
              <article key={item.line} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0e09] shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute left-4 top-4 rounded-full bg-[#a7b86a] px-3 py-1.5 text-[10px] font-black tracking-[.15em] text-black">{item.line} • {item.weight}</div>
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{item.text}</p>
                  <div className="mt-5 text-lg font-black text-[#ef7d18]">{item.price}</div>
                  <a href={whatsappOrder(`Olá, Nutrifit! Quero o combo ${item.line} ${item.weight} — ${item.price}.`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3.5 text-sm font-black text-black transition hover:scale-[1.01]">Escolher este combo <ArrowRight size={16} /></a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-5 md:p-7">
            <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
              <div>
                <div className="text-xs font-black uppercase tracking-[.18em] text-[#a7b86a]">Todos os tamanhos</div>
                <h3 className="mt-1 text-2xl font-black">Combos por linha</h3>
              </div>
              <p className="text-sm text-white/45">Misture sabores dentro da mesma linha.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {combos.map(([line,quantity,price,average]) => (
                <a key={line+quantity} href={whatsappOrder(`Olá, Nutrifit! Quero o combo ${line} — ${quantity} — ${price}.`)} className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-[#a7b86a]/40">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#a7b86a]">{line}</div>
                  <div className="mt-2 text-sm font-bold text-white/55">{quantity}</div>
                  <div className="mt-1 text-2xl font-black">{price}</div>
                  <div className="mt-1 text-xs text-[#ef7d18]">{average}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[["Combos dentro da linha","Misture sabores sem sair da mesma linha."],["Praticidade","Organize várias refeições de uma vez."],["Atendimento direto","Faça seu pedido pelo WhatsApp."]].map(([title,text]) => <div key={title} className="flex gap-3 rounded-2xl border border-white/10 p-5"><Check className="mt-0.5 shrink-0 text-[#a7b86a]" size={19} /><div><div className="font-black">{title}</div><div className="mt-1 text-sm text-white/45">{text}</div></div></div>)}
          </div>
        </div>
      </section>

      <section id="sucos" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#171d10] to-[#0e110c] p-8 md:p-12">
          <div className="max-w-3xl"><div className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Funcionais e 100% naturais</div><h2 className="mt-2 text-4xl font-black">Linha de Sucos</h2><p className="mt-3 text-white/50">Nutrifit Mulher • 500 ml • R$ 12,90</p></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{functionalJuices.map(([name,image]) => <a href={whatsapp} key={name} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:border-[#a7b86a]/40"><div className="aspect-[4/3] overflow-hidden"><img src={image} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></div><div className="p-4"><div className="font-black">{name}</div><div className="mt-1 text-xs text-white/40">500 ml</div><div className="mt-2 font-black text-[#ef7d18]">R$ 12,90</div></div></a>)}</div>
          <div className="mt-10 border-t border-white/10 pt-8"><div className="text-sm font-black uppercase tracking-wider text-[#ef7d18]">Sucos Nutrifit • 500 ml • R$ 12,00</div><div className="mt-4 grid gap-4 sm:grid-cols-3">{naturalJuices.map(([name,image]) => <a href={whatsapp} key={name} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:border-[#a7b86a]/40"><div className="aspect-[4/3] overflow-hidden"><img src={image} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></div><div className="p-4"><div className="font-black">{name}</div><div className="mt-1 text-xs text-white/40">500 ml</div><div className="mt-2 font-black text-[#ef7d18]">R$ 12,00</div></div></a>)}</div></div>
        </div>
      </section>

      <section id="como-pedir" className="border-t border-white/10 bg-[#0d100c]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01","Escolha","Veja o cardápio e escolha suas marmitas."],
              ["02","Peça","Clique no WhatsApp e envie seu pedido já com a opção escolhida."],
              ["03","Receba","Após a confirmação do pagamento, combinamos a entrega do seu pedido."]
            ].map(([number,title,text]) => (
              <div key={number} className="rounded-3xl border border-white/10 bg-white/[.03] p-7">
                <div className="text-sm font-black text-[#ef7d18]">{number}</div>
                <h3 className="mt-3 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-white/50">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-7 md:p-9">
              <div className="flex items-center gap-3">
                <Truck className="text-[#a7b86a]" size={22} />
                <h2 className="text-2xl font-black">Entrega em Juiz de Fora</h2>
              </div>
              <p className="mt-3 leading-7 text-white/55">
                Consulte pelo WhatsApp a disponibilidade, a taxa e o horário de entrega para o seu endereço.
              </p>
              <a href={whatsappOrder("Olá, Nutrifit! Gostaria de consultar a entrega para o meu endereço.")} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#a7b86a] px-5 py-3 font-black text-black">
                Consultar entrega <ArrowRight size={16} />
              </a>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[.03] p-7 md:p-9">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-[#ef7d18]" size={22} />
                <h2 className="text-2xl font-black">Pedido e pagamento</h2>
              </div>
              <p className="mt-3 leading-7 text-white/55">
                Escolha seus produtos, confirme o pedido e realize o pagamento antes da entrega. Após a confirmação do pagamento, a Nutrifit prepara e entrega seu pedido.
              </p>
              <a href={whatsapp} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-bold">
                Falar com a Nutrifit <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-[#ef7d18]/20 bg-[#17120c] p-7 md:p-9">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="text-[#ef7d18]" size={22} />
                  <h2 className="text-2xl font-black">Nutrifit para empresas</h2>
                </div>
                <p className="mt-3 max-w-2xl leading-7 text-white/55">
                  Atendimento B2B para empresas e pedidos corporativos. Fale com a equipe para conhecer as possibilidades.
                </p>
              </div>
              <a href={whatsappOrder("Olá, Nutrifit! Tenho interesse em atendimento B2B para minha empresa.")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-6 py-3.5 font-black text-black">
                Atendimento B2B <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="mt-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-[#a7b86a]" size={22} />
                <h2 className="text-3xl font-black">Perguntas frequentes</h2>
              </div>
              <p className="mt-2 text-white/45">As informações abaixo seguem o catálogo Nutrifit.</p>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                ["Posso misturar sabores no combo?","Sim. Os combos podem misturar sabores dentro da mesma linha."],
                ["Quais são os tamanhos das marmitas?","Fit e Saladas: 350 g. Performance: 450 g. Tradicional: 500 g."],
                ["Saladas entram nos combos?","O catálogo informa as saladas como vendidas por unidade."],
                ["Os sucos entram nos combos?","Os sucos são vendidos por unidade; consulte disponibilidade pelo WhatsApp."],
                ["Como faço meu pedido?","Escolha suas opções no cardápio e clique em qualquer botão de pedido para falar com a Nutrifit."],
                ["Como funciona a entrega?","A disponibilidade e a taxa de entrega devem ser confirmadas pelo WhatsApp."],
                ["Quando faço o pagamento?","O pagamento é realizado antecipadamente. Após a confirmação do pagamento, a Nutrifit prepara e realiza a entrega do pedido."]
              ].map(([question,answer]) => (
                <details key={question} className="group rounded-2xl border border-white/10 bg-white/[.025] p-5">
                  <summary className="cursor-pointer list-none font-black marker:hidden">{question}</summary>
                  <p className="mt-3 leading-6 text-white/50">{answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-[#a7b86a]/20 bg-[#171d10] p-8 md:p-10">
            <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black">Peça já a sua marmita</h2>
                <p className="mt-2 text-white/50">Praticidade, sabor e qualidade — todos os dias.</p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/60">
                  <span className="inline-flex items-center gap-2"><MessageCircle size={16} className="text-[#a7b86a]" />(32) 99803-0038</span>
                  <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[#a7b86a]" />Juiz de Fora / MG</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={instagram} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-bold">
                  @nutrifit_jf
                </a>
                <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ef7d18] px-7 py-4 font-black text-black">
                  <ShoppingBag size={18} /> Fazer pedido
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-white/40 md:flex-row md:items-center md:justify-between md:px-8">
          <span>© 2026 Nutrifit • Juiz de Fora - MG</span>
          <div className="flex flex-wrap gap-4">
            <a href={instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram @nutrifit_jf</a>
            <a href={whatsapp} className="hover:text-white">WhatsApp (32) 99803-0038</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
