import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrifit Admin",
  description: "Painel administrativo Nutrifit",
  manifest: "/admin-manifest.webmanifest",
  icons: {
    icon: "/images/nutrifit-logo-icon.svg?v=2",
    shortcut: "/images/nutrifit-logo-icon.svg?v=2",
    apple: "/images/nutrifit-logo-icon.svg?v=2",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
