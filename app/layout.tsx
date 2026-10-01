import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrifit | Marmitas Fit em Juiz de Fora",
  applicationName: "Nutrifit",
  category: "food",
  creator: "Nutrifit",
  publisher: "Nutrifit",
  description: "Marmitas Fit, Performance e Tradicional, saladas e sucos da Nutrifit. Monte seu combo e peça pelo WhatsApp em Juiz de Fora.",
  metadataBase: new URL("https://www.nutrifitjf.com.br"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: "Nutrifit", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  keywords: ["marmitas fit em Juiz de Fora", "marmitas fitness Juiz de Fora", "marmitas saudáveis Juiz de Fora", "Nutrifit Juiz de Fora", "marmitas para empresas Juiz de Fora"],
  icons: {
    icon: "/images/nutrifit-logo-icon.svg",
    shortcut: "/images/nutrifit-logo-icon.svg",
  },
  openGraph: {
    title: "Nutrifit | Marmitas Fit em Juiz de Fora",
    description: "Comida de verdade para todos os estilos de vida. Confira o cardápio e monte seu combo.",
    locale: "pt_BR",
    type: "website",
    url: "https://www.nutrifitjf.com.br",
    siteName: "Nutrifit",
    images: [{ url: "/images/banner-site-1.jpg", width: 1200, height: 630, alt: "Nutrifit — marmitas e alimentação prática em Juiz de Fora" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutrifit | Marmitas Fit em Juiz de Fora",
    description: "Confira o cardápio da Nutrifit, monte seu combo e peça pelo WhatsApp.",
    images: ["/images/banner-site-1.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080a07",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}<Analytics /></body></html>;
}
