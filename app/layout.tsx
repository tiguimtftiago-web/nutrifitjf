import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrifit | Marmitas Fit em Juiz de Fora",
  description: "Marmitas Fit, Performance e Tradicional, saladas e sucos da Nutrifit. Monte seu combo e peça pelo WhatsApp em Juiz de Fora.",
  metadataBase: new URL("https://www.nutrifitjf.com.br"),
  alternates: { canonical: "/" },
  keywords: ["marmitas fit em Juiz de Fora","marmitas fitness Juiz de Fora","marmitas saudáveis Juiz de Fora","Nutrifit Juiz de Fora","marmitas para empresas Juiz de Fora"],
  openGraph: {
    title: "Nutrifit | Marmitas Fit em Juiz de Fora",
    description: "Comida de verdade para todos os estilos de vida. Confira o cardápio e monte seu combo.",
    locale: "pt_BR",
    type: "website",
    url: "https://www.nutrifitjf.com.br",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}<Analytics /></body></html>;
}
