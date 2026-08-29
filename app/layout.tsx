import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutrifit | Marmitas em Juiz de Fora",
  description: "Marmitas Nutrifit para uma rotina mais prática em Juiz de Fora. Veja o cardápio e peça pelo WhatsApp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
