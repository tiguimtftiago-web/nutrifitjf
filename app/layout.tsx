import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = "https://www.nutrifitjf.com.br";

export const metadata: Metadata = {
  title: "Nutrifit | Marmitas Fit em Juiz de Fora",
  applicationName: "Nutrifit",
  category: "food",
  creator: "Nutrifit",
  publisher: "Nutrifit",
  description:
    "Nutrifit em Juiz de Fora: marmitas Fit, Performance e Tradicional, saladas, sucos e combos. Confira o cardápio, monte seu combo e peça online.",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: "Nutrifit", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  referrer: "strict-origin-when-cross-origin",
  keywords: [
    "Nutrifit Juiz de Fora",
    "Nutrifit JF",
    "marmitas fit em Juiz de Fora",
    "marmitas fitness Juiz de Fora",
    "marmitas saudáveis Juiz de Fora",
    "marmitas congeladas Juiz de Fora",
    "marmitas para empresas Juiz de Fora",
    "combo de marmitas Juiz de Fora",
    "saladas em Juiz de Fora",
    "sucos naturais Juiz de Fora",
  ],
  icons: {
    icon: "/images/nutrifit-logo-icon.svg",
    shortcut: "/images/nutrifit-logo-icon.svg",
  },
  openGraph: {
    title: "Nutrifit | Marmitas Fit em Juiz de Fora",
    description:
      "Marmitas Fit, Performance e Tradicional, saladas, sucos e combos da Nutrifit em Juiz de Fora. Confira o cardápio e peça online.",
    locale: "pt_BR",
    type: "website",
    url: siteUrl,
    siteName: "Nutrifit",
    images: [
      {
        url: "/images/banner-site-1.jpg",
        width: 1200,
        height: 630,
        alt: "Nutrifit — marmitas fit em Juiz de Fora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutrifit | Marmitas Fit em Juiz de Fora",
    description:
      "Confira o cardápio da Nutrifit, monte seu combo e peça online.",
    images: ["/images/banner-site-1.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080a07",
  colorScheme: "dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": siteUrl + "/#restaurant",
  name: "Nutrifit",
  url: siteUrl,
  logo: siteUrl + "/images/nutrifit-logo-icon.svg",
  image: siteUrl + "/images/banner-site-1.jpg",
  description:
    "Nutrifit: marmitas Fit, Performance e Tradicional, saladas, sucos e combos em Juiz de Fora, MG.",
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
  hasMenu: siteUrl + "/marmitas-fit-juiz-de-fora",
  hasMap:
    "https://www.google.com/maps/search/?api=1&query=NutriFit%2C%20Juiz%20de%20Fora&query_place_id=ChIJuyiAyo2dmAARYrAmd8603w4",
  sameAs: ["https://www.instagram.com/nutrifit_jf/"],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55 32 99803-0038",
    contactType: "customer service",
    areaServed: "BR",
    availableLanguage: ["pt-BR"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
