import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nutrifit | Acesso",
  description: "Acesse o painel administrativo ou a loja Nutrifit.",
  appleWebApp: { capable: true, title: "Nutrifit", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/apple-touch-icon.png?v=1", sizes: "180x180", type: "image/png" },
      { url: "/images/nutrifit-logo-icon.svg?v=5", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=1", sizes: "180x180", type: "image/png" }],
  },
};

export default function AcessoNutrifit() {
  return (
    <main style={{ minHeight: "100svh", background: "#080a07", color: "#f7f7f2", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "100%", maxWidth: 520, border: "1px solid #30342b", borderRadius: 28, padding: "clamp(24px, 6vw, 42px)", background: "#10130e", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>
          <img src="/images/nutrifit-logo-icon.svg?v=5" alt="Logo Nutrifit" width="70" height="70" style={{ objectFit: "contain" }} />
          <div>
            <div style={{ color: "#a7b83f", letterSpacing: 4, fontWeight: 800, fontSize: 14 }}>NUTRIFIT</div>
            <div style={{ color: "#a7b83f", marginTop: 5, fontSize: 13 }}>ACESSO OFICIAL</div>
          </div>
        </div>
        <h1 style={{ fontSize: "clamp(30px, 7vw, 42px)", lineHeight: 1.1, margin: "0 0 12px", fontWeight: 800 }}>Bem-vindo à Nutrifit</h1>
        <p style={{ color: "#a8aaa3", fontSize: 17, lineHeight: 1.55, margin: "0 0 28px" }}>Escolha onde deseja entrar.</p>
        <Link href="/admin" style={{ display: "block", background: "#a7b83f", color: "#080a07", borderRadius: 18, padding: "21px 20px", textDecoration: "none", fontSize: 19, fontWeight: 800, marginBottom: 14 }}>
          Área administrativa <span style={{ display: "block", fontWeight: 500, fontSize: 14, marginTop: 6 }}>Entrar no painel profissional →</span>
        </Link>
        <Link href="/" style={{ display: "block", background: "#1d2119", border: "1px solid #424737", color: "#f7f7f2", borderRadius: 18, padding: "21px 20px", textDecoration: "none", fontSize: 19, fontWeight: 800 }}>
          Acessar a loja Nutrifit <span style={{ display: "block", color: "#b7bd9e", fontWeight: 500, fontSize: 14, marginTop: 6 }}>Cardápio, combos e pedidos →</span>
        </Link>
        <p style={{ color: "#777b70", textAlign: "center", fontSize: 12, margin: "28px 0 0" }}>Nutrifit • Juiz de Fora</p>
      </section>
    </main>
  );
}
