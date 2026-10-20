import type { Metadata } from "next";

const siteUrl = "https://www.nutrifitjf.com.br";

export const metadata: Metadata = {
  title: "Conheça a Nutrifit | Marmitas Fit, Performance e Tradicional",
  description:
    "Conheça as linhas Fit, Performance e Tradicional da Nutrifit em Juiz de Fora. Consulte o cardápio e faça seu pedido pelo WhatsApp.",
  alternates: {
    canonical: "/campanha",
  },
  openGraph: {
    title: "Conheça a Nutrifit | Marmitas em Juiz de Fora",
    description:
      "Refeições práticas para sua rotina. Conheça as linhas da Nutrifit e consulte o cardápio pelo WhatsApp.",
    url: siteUrl + "/campanha",
    siteName: "Nutrifit",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/page-4.jpg",
        alt: "Refeição Nutrifit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conheça a Nutrifit | Marmitas em Juiz de Fora",
    description:
      "Conheça as linhas da Nutrifit em Juiz de Fora e consulte o cardápio pelo WhatsApp.",
    images: ["/images/page-4.jpg"],
  },
};

export default function CampanhaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
