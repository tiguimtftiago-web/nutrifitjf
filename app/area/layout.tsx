import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área Nutrifit 360",
  description: "Área privada de clientes Nutrifit.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AreaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
