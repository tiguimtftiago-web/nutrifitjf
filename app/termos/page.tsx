import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso | Nutrifit",
  description: "Consulte as condições gerais de navegação, pedidos, pagamentos e entregas da Nutrifit.",
  alternates: { canonical: "/termos" },
};

const sections = [
  {
    title: "1. Sobre estes termos",
    paragraphs: [
      "Estes termos apresentam condições gerais para navegar pelo site da Nutrifit e consultar seus produtos. Ao utilizar o site, você concorda em respeitar estas condições e a legislação aplicável.",
    ],
  },
  {
    title: "2. Cardápio e disponibilidade",
    paragraphs: [
      "Fotos, descrições, ingredientes, pesos e preços são apresentados para orientar a escolha. A disponibilidade dos pratos pode variar conforme produção e estoque.",
      "O pedido só será considerado confirmado após a validação das opções escolhidas, do preço final, da disponibilidade e das condições de entrega pela Nutrifit.",
    ],
  },
  {
    title: "3. Preços, pedidos e pagamentos",
    paragraphs: [
      "Os preços e condições aplicáveis são os informados no momento da confirmação do pedido. Formas de pagamento, incluindo Pix e cartões Visa e Mastercard, devem ser confirmadas no fechamento.",
      "Quando disponível, um link de pagamento poderá ser fornecido pela Nutrifit por canal oficial. Não realize pagamentos por links recebidos de contatos que não tenham sido confirmados pela empresa.",
    ],
  },
  {
    title: "4. Entrega e recebimento",
    paragraphs: [
      "Área atendida, prazo, taxa e disponibilidade de entrega devem ser confirmados antes da conclusão do pedido. O cliente é responsável por informar endereço correto, referências e contato para recebimento.",
    ],
  },
  {
    title: "5. Informações alimentares",
    paragraphs: [
      "Clientes devem informar previamente alergias e restrições alimentares relevantes. Embora a Nutrifit procure fornecer informações corretas sobre os produtos, pessoas com alergias graves devem confirmar diretamente os ingredientes e os riscos de contaminação cruzada antes de consumir.",
    ],
  },
  {
    title: "6. Uso do site",
    paragraphs: [
      "Não é permitido tentar comprometer a segurança do site, interferir em seu funcionamento, manipular valores ou utilizar formulários e canais de contato para fins ilícitos.",
      "Recursos identificados como experimentais ou em teste não representam confirmação automática de pedido, preço ou disponibilidade.",
    ],
  },
  {
    title: "7. Privacidade e contato",
    paragraphs: [
      "O tratamento de dados pessoais é explicado na Política de Privacidade. Para dúvidas sobre pedidos, entre em contato pelo WhatsApp oficial da Nutrifit.",
      "Nutrifit — CNPJ 64.776.469/0001-08 — Juiz de Fora/MG.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0b0d0a] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold text-[#a7b86a] hover:text-[#ef7d18]">
          ← Voltar à Nutrifit
        </Link>
        <header className="mt-6 border-b border-white/15 pb-6">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#a7b86a]">Nutrifit • Juiz de Fora/MG</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Termos de Uso</h1>
          <p className="mt-4 text-sm leading-6 text-white/70">Condições gerais de navegação, pedidos, pagamentos e entregas.</p>
        </header>
        <div className="divide-y divide-white/10">
          {sections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-black text-[#a7b86a]">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-7 text-white/80">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
        <footer className="mt-5 flex flex-wrap gap-5 border-t border-white/15 pt-6 text-sm font-bold">
          <Link href="/privacidade" className="text-[#a7b86a] hover:text-[#ef7d18]">Política de Privacidade</Link>
          <Link href="/" className="text-[#a7b86a] hover:text-[#ef7d18]">Página inicial</Link>
        </footer>
      </div>
    </main>
  );
}
