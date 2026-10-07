import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = "https://www.nutrifitjf.com.br";

export const metadata: Metadata = {
  title: "Marmitas Fit em Juiz de Fora | Nutrifit",
  description:
    "Marmitas fit, fitness e saudáveis em Juiz de Fora, MG. Na Nutrifit você encontra Fit 350 g, Performance 450 g, Tradicional 500 g, saladas, sucos e combos para a semana.",
  alternates: { canonical: "/marmitas-fit-juiz-de-fora" },
  openGraph: {
    title: "Marmitas Fit em Juiz de Fora | Nutrifit",
    description:
      "Escolha sua linha de marmitas, monte seu combo e peça online. Nutrifit em Juiz de Fora/MG.",
    url: siteUrl + "/marmitas-fit-juiz-de-fora",
    siteName: "Nutrifit",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/banner-site-1.jpg",
        width: 1200,
        height: 630,
        alt: "Nutrifit — marmitas fit em Juiz de Fora",
      },
    ],
  },
  robots: { index: true, follow: true },
};

const lines = [
  {
    title: "Marmitas Fit 350 g",
    text: "Opções para quem busca praticidade no dia a dia, com diferentes combinações de proteínas e acompanhamentos.",
  },
  {
    title: "Marmitas Performance 450 g",
    text: "Uma linha mais robusta para quem procura refeições maiores e organizadas para a rotina.",
  },
  {
    title: "Marmitas Tradicional 500 g",
    text: "Pratos variados para quem quer comida de verdade com praticidade no pedido semanal.",
  },
  {
    title: "Saladas e sucos",
    text: "Saladas e sucos naturais e funcionais para completar sua rotina alimentar.",
  },
  {
    title: "Combos para a semana",
    text: "Monte seu combo com as marmitas disponíveis no cardápio e organize várias refeições de uma vez.",
  },
];

const faqs = [
  {
    q: "A Nutrifit entrega em Juiz de Fora?",
    a: "Sim. A Nutrifit atende Juiz de Fora/MG com entrega conforme a área e as condições informadas no pedido.",
  },
  {
    q: "Quais tamanhos de marmita a Nutrifit oferece?",
    a: "A Nutrifit trabalha com as linhas Fit de 350 g, Performance de 450 g e Tradicional de 500 g.",
  },
  {
    q: "Como faço meu pedido?",
    a: "Você pode consultar o cardápio no site, montar seu pedido e finalizar pelo fluxo de compra da Nutrifit ou pelo WhatsApp.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Restaurant", "LocalBusiness"],
      "@id": siteUrl + "/#restaurant",
      name: "Nutrifit",
      url: siteUrl,
      logo: siteUrl + "/images/nutrifit-logo-icon.svg",
      image: siteUrl + "/images/banner-site-1.jpg",
      telephone: "+55 32 99803-0038",
      priceRange: "$$",
      servesCuisine: ["Marmitas fitness", "Alimentação saudável", "Comida brasileira"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "R. Enéas Mascarenhas",
        addressLocality: "Juiz de Fora",
        addressRegion: "MG",
        postalCode: "36081-110",
        addressCountry: "BR",
      },
      areaServed: {
        "@type": "City",
        name: "Juiz de Fora",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Juiz de Fora",
          addressRegion: "MG",
          addressCountry: "BR",
        },
      },
      sameAs: [
        "https://www.instagram.com/nutrifit_jf/",
        "https://www.google.com/maps/search/?api=1&query=NutriFit%2C%20Juiz%20de%20Fora&query_place_id=ChIJuyiAyo2dmAARYrAmd8603w4",
      ],
      hasMap:
        "https://www.google.com/maps/search/?api=1&query=NutriFit%2C%20Juiz%20de%20Fora&query_place_id=ChIJuyiAyo2dmAARYrAmd8603w4",
    },
    {
      "@type": "WebPage",
      "@id": siteUrl + "/marmitas-fit-juiz-de-fora#webpage",
      url: siteUrl + "/marmitas-fit-juiz-de-fora",
      name: "Marmitas Fit em Juiz de Fora | Nutrifit",
      description:
        "Marmitas fit, fitness e saudáveis em Juiz de Fora, MG, com linhas Fit, Performance, Tradicional, saladas, sucos e combos.",
      isPartOf: { "@id": siteUrl + "/#website" },
      about: { "@id": siteUrl + "/#restaurant" },
      inLanguage: "pt-BR",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Nutrifit",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Marmitas Fit em Juiz de Fora",
          item: siteUrl + "/marmitas-fit-juiz-de-fora",
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": siteUrl + "/#website",
      url: siteUrl,
      name: "Nutrifit",
      publisher: { "@id": siteUrl + "/#restaurant" },
      inLanguage: "pt-BR",
    },
  ],
};

export default function LocalSeoPage() {
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
        <Link href="/" className="text-sm font-black text-[#a7b86a]">
          ← Voltar para a Nutrifit
        </Link>

        <div className="mt-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#ef7d18]">
            Nutrifit • Juiz de Fora/MG
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
            Marmitas fit em Juiz de Fora
          </h1>
          <p className="mt-5 text-base leading-7 text-white/60 sm:text-lg">
            A Nutrifit prepara marmitas fit, fitness e saudáveis para quem
            quer praticidade, sabor e refeições organizadas para a semana em
            Juiz de Fora. Escolha sua linha, monte seu combo e faça o pedido
            online.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {lines.map((line) => (
            <article
              key={line.title}
              className="rounded-3xl border border-white/10 bg-white/[.025] p-5"
            >
              <h2 className="text-lg font-black">{line.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                {line.text}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-[#a7b86a]/20 bg-[#a7b86a]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-black">
            Marmitas saudáveis para sua rotina em Juiz de Fora
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            No cardápio da Nutrifit você encontra refeições individuais e
            combos, além de saladas e sucos. A proposta é facilitar a
            organização da alimentação sem abrir mão de variedade.
          </p>

          <div className="mt-5 grid gap-3 text-sm leading-6 text-white/65 sm:grid-cols-2">
            <div>• Fit 350 g para uma refeição prática e equilibrada.</div>
            <div>• Performance 450 g para uma refeição maior.</div>
            <div>• Tradicional 500 g com pratos variados.</div>
            <div>• Combos para organizar as refeições da semana.</div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[.025] p-6 sm:p-8">
          <h2 className="text-2xl font-black">Perguntas frequentes</h2>
          <div className="mt-5 space-y-5">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-black">{faq.q}</h3>
                <p className="mt-1 text-sm leading-6 text-white/45">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/#cardapio"
            className="rounded-full bg-[#a7b86a] px-6 py-3 text-sm font-black text-black"
          >
            Ver cardápio
          </Link>
          <Link
            href="/#combos"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-black"
          >
            Montar meu combo
          </Link>
          <a
            href="https://wa.me/5532998030038?text=Ol%C3%A1%20Nutrifit!%20Quero%20conhecer%20as%20marmitas."
            className="rounded-full border border-[#ef7d18]/50 px-6 py-3 text-sm font-black text-[#ef7d18]"
          >
            Pedir pelo WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
