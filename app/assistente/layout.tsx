import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistente Nutrifit",
  description: "Assistente digital para orientar a escolha de marmitas e combos Nutrifit.",
  robots: { index: false, follow: false },
};

export default function AssistenteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
