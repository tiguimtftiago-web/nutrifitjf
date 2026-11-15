import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistente Nutrifit",
  description: "Assistente de atendimento Nutrifit.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AssistantLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
