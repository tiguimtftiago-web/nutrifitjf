import type { Metadata } from "next";

const siteUrl = "https://www.nutrifitjf.com.br";
const pageUrl = `${siteUrl}/sucos-interativo`;
const title = "Sucos naturais 300 ml e 500 ml em Juiz de Fora | Nutrifit";
const description = "Conheça os sabores de sucos naturais Nutrifit, confira os tamanhos disponíveis e peça pelo WhatsApp em Juiz de Fora.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    siteName: "Nutrifit",
    title,
    description,
    images: [{ url: "/images/page-42.jpg", alt: "Sucos naturais Nutrifit" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/page-42.jpg"] },
};

export default function SucosInterativoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
