import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrifit | Marmitas e alimentação saudável em Juiz de Fora",
  description: "Marmitas Fit, Performance, Tradicional, Premium, saladas e sucos da Nutrifit. Faça seu pedido pelo WhatsApp em Juiz de Fora.",
  keywords: ["Nutrifit", "marmitas", "Juiz de Fora", "marmita fitness", "alimentação saudável"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
