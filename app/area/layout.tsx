import type { Metadata } from "next";
import "./charts.css";

export const metadata: Metadata = {
  title: "Área Nutrifit 360",
  description: "Área pessoal do cliente Nutrifit.",
  robots: { index: false, follow: false },
};

export default function AreaNutrifitLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
