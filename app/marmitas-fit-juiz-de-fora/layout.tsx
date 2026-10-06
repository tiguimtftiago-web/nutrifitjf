import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marmitas Fit em Juiz de Fora | Nutrifit",
  description:
    "Nutrifit em Juiz de Fora: marmitas fit, fitness e saudáveis, combos para a semana, saladas e sucos. Confira o cardápio e peça online.",
  alternates: {
    canonical: "https://www.nutrifitjf.com.br/marmitas-fit-juiz-de-fora",
  },
  openGraph: {
    title: "Marmitas Fit em Juiz de Fora | Nutrifit",
    description:
      "Marmitas fit, fitness e saudáveis da Nutrifit em Juiz de Fora. Confira o cardápio, monte seu combo e peça online.",
    url: "https://www.nutrifitjf.com.br/marmitas-fit-juiz-de-fora",
    siteName: "Nutrifit",
    locale: "pt_BR",
    type: "website",
  },
};

export default function LocalSeoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
