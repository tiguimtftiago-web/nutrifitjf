import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrifit Admin",
  description: "Painel administrativo Nutrifit",
  manifest: "/admin-manifest.webmanifest",
  icons: {
    icon: "/images/nutrifit-logo-icon.svg?v=5",
    shortcut: "/images/nutrifit-logo-icon.svg?v=5",
    apple: [{ url: "/apple-touch-icon.png?v=1", sizes: "180x180", type: "image/png" }],
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
