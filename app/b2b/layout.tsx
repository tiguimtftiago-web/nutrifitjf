import type { Metadata } from "next";

const siteUrl = "https://www.nutrifitjf.com.br";
const pageUrl = `${siteUrl}/b2b`;
const description =
  "Marmitas para empresas em Juiz de Fora e alimentação corporativa com cardápio adaptável e entregas programadas. Solicite uma proposta.";

export const metadata: Metadata = {
  title: "Marmitas para empresas em Juiz de Fora | Nutrifit",
  description,
  keywords: [
    "marmitas para empresas em Juiz de Fora",
    "alimentação corporativa Juiz de Fora",
    "refeições para funcionários",
    "fornecedor de marmitas para empresas",
    "marmitas para equipes",
    "refeições corporativas Juiz de Fora",
    "Nutrifit Empresas",
  ],
  alternates: {
    canonical: pageUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    siteName: "Nutrifit",
    title: "Marmitas para Empresas em Juiz de Fora | Nutrifit Empresas",
    description,
    images: [
      {
        url: "/images/nutrifit-b2b-hero.jpg",
        alt: "Nutrifit Empresas — refeições para equipes em Juiz de Fora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marmitas para Empresas em Juiz de Fora | Nutrifit Empresas",
    description,
    images: ["/images/nutrifit-b2b-hero.jpg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${pageUrl}#service`,
  name: "Fornecimento de marmitas para empresas",
  serviceType: "Refeições para equipes e alimentação corporativa",
  description,
  url: pageUrl,
  provider: {
    "@type": "Restaurant",
    "@id": `${siteUrl}/#restaurant`,
    name: "Nutrifit",
    url: siteUrl,
    telephone: "+55 32 99803-0038",
  },
  areaServed: {
    "@type": "City",
    name: "Juiz de Fora",
    containedInPlace: {
      "@type": "State",
      name: "Minas Gerais",
    },
  },
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Empresas, escritórios, clínicas, academias e equipes",
  },
};

export default function B2BLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
