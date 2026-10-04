import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrifit Admin",
  description: "Painel administrativo Nutrifit",
  manifest: "/admin-manifest.webmanifest",
  icons: {
    icon: "/images/nutrifit-logo-icon.svg",
    shortcut: "/images/nutrifit-logo-icon.svg",
    apple: "/images/nutrifit-logo-icon.svg",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
