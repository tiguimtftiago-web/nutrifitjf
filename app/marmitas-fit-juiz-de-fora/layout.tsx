import type { Metadata } from "next";

const pageUrl = "https://www.nutrifitjf.com.br/marmitas-fit-juiz-de-fora";

export const metadata: Metadata = {
  title: "Marmitas Fit em Juiz de Fora | Nutrifit",
  description:
    "Marmitas fit, fitness e saudáveis da Nutrifit em Juiz de Fora. Conheça as linhas Fit 350 g, Performance 450 g e Tradicional 500 g, combos, saladas e sucos.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Marmitas Fit em Juiz de Fora | Nutrifit",
    description:
      "Marmitas fit, fitness e saudáveis da Nutrifit em Juiz de Fora. Confira o cardápio, monte seu combo e peça online.",
    url: pageUrl,
    siteName: "Nutrifit",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://www.nutrifitjf.com.br/images/banner-site-1.jpg",
        width: 1200,
        height: 630,
        alt: "Nutrifit — marmitas fit em Juiz de Fora",
      },
    ],
  },
};

export default function LocalSeoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
