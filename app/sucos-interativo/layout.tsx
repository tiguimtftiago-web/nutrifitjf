import type { Metadata } from "next";

const siteUrl = "https://www.nutrifitjf.com.br";
const pageUrl = `${siteUrl}/sucos-interativo`;
const description =
  "Conheça os sucos naturais e funcionais de 500 ml da Nutrifit em Juiz de Fora. Veja os sabores, ingredientes e opções para acompanhar suas refeições.";

export const metadata: Metadata = {
  title: "Sucos Naturais em Juiz de Fora | Nutrifit",
  description,
  keywords: [
    "sucos naturais em Juiz de Fora",
    "sucos funcionais Juiz de Fora",
    "suco natural 500 ml",
    "sucos Nutrifit",
    "sucos para acompanhar marmitas",
  ],
  alternates: { canonical: pageUrl },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    siteName: "Nutrifit",
    title: "Sucos Naturais e Funcionais em Juiz de Fora | Nutrifit",
    description,
    images: [{ url: "/images/banner-site-1.jpg", alt: "Sucos Nutrifit em Juiz de Fora" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sucos Naturais em Juiz de Fora | Nutrifit",
    description,
    images: ["/images/banner-site-1.jpg"],
  },
};

export default function JuicesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
