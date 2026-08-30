import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrifit | Marmitas em Juiz de Fora",
  description: "Marmitas Fit, Performance, Tradicional e Premium da Nutrifit. Peça pelo WhatsApp em Juiz de Fora.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
