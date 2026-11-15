import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validação de documento Nutrifit",
  description: "Consulta de autenticidade de documentos comerciais Nutrifit.",
  robots: { index: false, follow: false },
};

export default function ValidarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
