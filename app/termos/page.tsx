import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso | Nutrifit",
  description: "Condições para navegação, pedidos, pagamentos e entregas da Nutrifit em Juiz de Fora.",
  alternates: { canonical: "/termos" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "1. Identificação",
    paragraphs: [
      "Este site é operado pela Nutrifit, CNPJ 64.776.469/0001-08, com endereço em Rua Enéas Mascarenhas, nº 94, Monte Castelo, Juiz de Fora/MG.",
      "Contato: NutriFit.cozinhajf@gmail.com e WhatsApp (32) 99803-0038.",
    ],
  },
  {
    title: "2. Aceitação e uso do site",
    paragraphs: [
      "Ao navegar pelo site ou enviar um pedido, você declara que leu estes Termos de Uso. Utilize as informações e funcionalidades de forma lícita, fornecendo dados corretos e atualizados.",
      "O cadastro e a realização de pedidos devem ser feitos por pessoa capaz de assumir obrigações legais. Quando o pedido for feito em nome de outra pessoa, o responsável deve ter autorização para informar os dados necessários.",
    ],
  },
  {
    title: "3. Cardápio, disponibilidade e informações dos produtos",
    paragraphs: [
      "As fotos são ilustrativas. A apresentação, os acompanhamentos e a disponibilidade dos pratos podem variar conforme o cardápio e a produção.",
      "Ingredientes, composição e informações nutricionais são apresentados conforme os dados disponíveis para cada produto. Em caso de alergias, intolerâncias ou restrições alimentares, entre em contato com a Nutrifit antes de concluir o pedido para confirmar os ingredientes e os cuidados possíveis.",
      "A Nutrifit poderá atualizar o cardápio, os produtos e os preços. Valem para o pedido os valores e as condições apresentados no momento da confirmação.",
    ],
  },
  {
    title: "4. Preços, combos e planos",
    paragraphs: [
      "Os preços são exibidos em reais (R$). Combos e planos possuem quantidades e valores próprios, que devem ser conferidos antes da confirmação.",
      "A indicação de plano mensal descreve uma opção de compra de 30 ou 60 refeições. A frequência, o calendário de entregas e eventuais condições específicas devem ser alinhados com a Nutrifit antes da contratação; não há economia adicional presumida além do preço total e unitário apresentados.",
      "Descontos de boas-vindas, cupons e campanhas dependem dos critérios informados no site e não são cumulativos quando o sistema indicar essa restrição.",
    ],
  },
  {
    title: "5. Pedido e confirmação",
    paragraphs: [
      "O envio do pedido pelo site ou pelo WhatsApp representa uma solicitação de compra. O pedido será considerado confirmado após a conferência de disponibilidade, endereço, taxa de entrega, valor final e forma de pagamento pela Nutrifit.",
      "Confira cuidadosamente os itens, quantidades, dados de contato e endereço antes de enviar. Se houver divergência, fale com a equipe antes de realizar o pagamento.",
    ],
  },
  {
    title: "6. Entrega",
    paragraphs: [
      "A disponibilidade da entrega depende da região atendida e da confirmação do endereço. A taxa aplicável é calculada conforme o CEP ou bairro informado e deve ser conferida no resumo do pedido.",
      "A condição de frete grátis para pedidos com 20 itens ou mais, quando exibida no site, aplica-se conforme as regras apresentadas no fechamento do pedido. Prazo e janela de entrega são confirmados pela equipe.",
      "O cliente deve informar endereço completo e garantir que haja alguém disponível para receber o pedido no local combinado.",
    ],
  },
  {
    title: "7. Pagamento",
    paragraphs: [
      "As opções de pagamento disponíveis são informadas durante o atendimento e podem variar conforme o pedido. Quando o pagamento for realizado por Pix, confira o valor e os dados do destinatário antes de transferir.",
      "Não efetue pagamento se os dados do destinatário ou o valor não corresponderem às informações confirmadas pela Nutrifit. O comprovante deve ser enviado pelo canal indicado no atendimento.",
    ],
  },
  {
    title: "8. Cancelamentos e problemas com o pedido",
    paragraphs: [
      "Se precisar alterar ou cancelar um pedido, entre em contato com a Nutrifit o quanto antes pelo WhatsApp, informando o número ou os dados do pedido.",
      "Solicitações relacionadas a atraso, item divergente, avaria ou qualidade devem ser comunicadas pelo canal de atendimento, preferencialmente com fotos e descrição do ocorrido. Os direitos previstos na legislação de defesa do consumidor permanecem preservados.",
    ],
  },
  {
    title: "9. Clube Nutrifit",
    paragraphs: [
      "O benefício de boas-vindas atualmente divulgado é de R$ 10,00 de desconto na primeira compra, sujeito às regras de elegibilidade e aplicação exibidas no cadastro e no fechamento do pedido.",
      "O cadastro no Clube não substitui a confirmação do pedido nem garante descontos adicionais. A Nutrifit poderá atualizar campanhas futuras, respeitando as condições já confirmadas para pedidos realizados.",
    ],
  },
  {
    title: "10. Propriedade intelectual e links externos",
    paragraphs: [
      "As marcas, textos, imagens, identidade visual e demais conteúdos do site pertencem à Nutrifit ou são utilizados com autorização. Não é permitido copiar ou utilizar esses materiais comercialmente sem autorização.",
      "O site pode conter links para serviços de terceiros, como WhatsApp e redes sociais. O uso desses serviços também está sujeito aos termos e políticas dos respectivos fornecedores.",
    ],
  },
  {
    title: "11. Privacidade e proteção de dados",
    paragraphs: [
      "O tratamento de dados pessoais segue a Política de Privacidade da Nutrifit e a legislação aplicável, especialmente a Lei Geral de Proteção de Dados (LGPD).",
    ],
  },
  {
    title: "12. Atualizações e legislação",
    paragraphs: [
      "Estes termos podem ser atualizados para refletir mudanças nos serviços, processos ou exigências legais. A versão vigente estará disponível nesta página.",
      "Nada nestes termos limita direitos assegurados ao consumidor pela legislação brasileira. Dúvidas podem ser encaminhadas pelos canais de contato indicados acima.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#080a07] px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#a7b86a] hover:text-white">← Voltar para a Nutrifit</Link>
        <header className="mt-8 border-b border-white/10 pb-7">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#ef7d18]">Nutrifit • Juiz de Fora/MG</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Termos de Uso</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">Condições de navegação, pedidos, pagamentos e entregas.</p>
          <p className="mt-2 text-xs text-white/40">Última atualização: 29 de outubro de 2026</p>
        </header>
        <div className="divide-y divide-white/10">
          {sections.map((section) => (
            <section key={section.title} className="py-6">
              <h2 className="text-lg font-black text-[#cbd99a]">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-white/70">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.title.startsWith("11.") && <p><Link href="/privacidade" className="font-bold text-[#ef7d18] underline underline-offset-4">Leia a Política de Privacidade</Link>.</p>}
              </div>
            </section>
          ))}
        </div>
        <footer className="mt-8 border-t border-white/10 pt-6 text-xs leading-6 text-white/45">
          <p>Nutrifit • CNPJ 64.776.469/0001-08 • Juiz de Fora/MG</p>
          <p>Contato: NutriFit.cozinhajf@gmail.com • (32) 99803-0038</p>
          <p className="mt-3"><Link href="/privacidade" className="text-[#a7b86a] underline">Política de Privacidade</Link></p>
        </footer>
      </div>
    </main>
  );
}
