import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | Nutrifit",
  description: "Saiba como a Nutrifit coleta, utiliza, compartilha e protege dados pessoais, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "1. Quem somos (controlador dos dados)",
    body: [
      "Controlador dos dados: Nutrifit",
      "CNPJ: 64.776.469/0001-08",
      "Endereço: Rua Enéas Mascarenhas, nº 94, bairro Monte Castelo, Juiz de Fora/MG",
      "Site: www.nutrifitjf.com.br",
      "WhatsApp: (32) 99803-0038",
      "E-mail para assuntos de privacidade: NutriFit.cozinhajf@gmail.com",
    ],
  },
  {
    title: "2. Quais dados coletamos",
    body: [
      "Ao solicitar uma proposta ou se cadastrar como empresa cliente (Nutrifit Empresas), podemos coletar:",
      "Dados da empresa: nome fantasia, razão social, CNPJ, inscrições estadual e municipal, segmento, porte e site.",
      "Dados de contato dos responsáveis: nome, cargo, telefone, WhatsApp e e-mail de quem atende, de quem aprova a contratação e do financeiro.",
      "Dados de entrega: endereço, ponto de referência, dados de quem recebe o pedido e instruções ao entregador.",
      "Dados do pedido: tipo e quantidade de refeições, dias e horários de fornecimento e preferências de cardápio.",
      "Dados de faturamento: e-mail e telefone do financeiro, forma e prazo de pagamento, endereço de cobrança e necessidade de nota fiscal.",
      "Restrições alimentares e alergias, para montar um cardápio adequado e seguro.",
      "Dados de navegação: endereço IP, tipo de navegador, páginas visitadas e cookies.",
      "Mensagens enviadas por WhatsApp, e-mail ou formulários.",
    ],
  },
  {
    title: "3. Dados sensíveis",
    body: [
      "Informações sobre alergias e restrições alimentares podem estar ligadas à saúde de pessoas. Pedimos que sejam informadas só na medida necessária para a produção segura das refeições, de preferência de forma agregada (por exemplo, “2 refeições sem glúten”), sem identificar o colaborador, a menos que seja indispensável. Esses dados são tratados exclusivamente para garantir a segurança alimentar.",
    ],
  },
  {
    title: "4. Para que usamos os dados e bases legais",
    body: [
      "Elaborar e enviar propostas comerciais: procedimentos preliminares relacionados a contrato.",
      "Produzir, entregar e acompanhar pedidos: execução de contrato.",
      "Emitir nota fiscal, cobrar e manter registros fiscais: cumprimento de obrigação legal.",
      "Atender dúvidas, solicitações e reclamações: execução de contrato e legítimo interesse.",
      "Tratar dados sensíveis sobre alergias e restrições alimentares: consentimento específico e destacado, quando aplicável, limitado ao necessário para a segurança alimentar.",
      "Enviar novidades, cardápios e ofertas: consentimento ou legítimo interesse, com opção de cancelar a qualquer momento.",
      "Melhorar o site e a experiência de uso: legítimo interesse e, quando aplicável, consentimento.",
      "Defender direitos em processos judiciais ou administrativos: exercício regular de direitos.",
    ],
  },
  {
    title: "5. Com quem compartilhamos os dados",
    body: [
      "Não vendemos dados pessoais. Podemos compartilhá-los apenas quando necessário, com:",
      "Entregadores e parceiros de logística, apenas com os dados indispensáveis à entrega.",
      "Prestadores de serviços de pagamento e instituições financeiras.",
      "Contabilidade e emissores de nota fiscal.",
      "Fornecedores de tecnologia (hospedagem do site, e-mail, ferramentas de atendimento e comunicação, como o WhatsApp).",
      "Autoridades públicas, quando exigido por lei ou ordem judicial.",
      "Exigimos desses parceiros o compromisso de proteger os dados conforme a LGPD.",
    ],
  },
  {
    title: "6. Por quanto tempo guardamos os dados",
    body: [
      "Guardamos os dados pelo tempo necessário para cumprir as finalidades acima e as obrigações legais. De forma geral:",
      "Propostas sem contratação: até 12 meses após o último contato.",
      "Clientes ativos: durante a vigência da relação comercial.",
      "Dados fiscais e contábeis: pelo prazo exigido por lei (em regra, 5 anos).",
      "Depois disso, os dados são eliminados ou anonimizados, salvo obrigação legal de mantê-los.",
    ],
  },
  {
    title: "7. Seus direitos",
    body: [
      "Você pode solicitar, a qualquer momento:",
      "Confirmação de que tratamos seus dados e acesso a eles.",
      "Correção de dados incompletos, inexatos ou desatualizados.",
      "Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei.",
      "Portabilidade dos dados, conforme regulamentação da ANPD.",
      "Informação sobre com quem compartilhamos seus dados.",
      "Eliminação dos dados tratados com base no consentimento e revogação do consentimento.",
      "Oposição a tratamentos feitos com base em outras hipóteses legais, em caso de descumprimento da lei.",
      "Revisão de decisões tomadas exclusivamente de forma automatizada, se houver.",
      "Para exercer esses direitos, escreva para NutriFit.cozinhajf@gmail.com ou envie mensagem para o WhatsApp (32) 99803-0038. Podemos pedir informações para confirmar sua identidade. Responderemos no prazo previsto pela legislação.",
    ],
  },
  {
    title: "8. Segurança",
    body: [
      "Adotamos medidas técnicas e administrativas razoáveis para proteger os dados contra acessos não autorizados, perda, alteração ou divulgação indevida, como controle de acesso, conexão segura (HTTPS) e limitação do acesso a quem precisa deles. Nenhum sistema é totalmente imune a falhas; em caso de incidente que possa gerar risco relevante, comunicaremos os titulares e a ANPD conforme a lei.",
    ],
  },
  {
    title: "9. Cookies",
    body: [
      "Nosso site pode usar cookies para funcionamento básico, lembrar preferências e entender como o site é usado. Você pode bloquear ou apagar cookies nas configurações do navegador, mas algumas funções podem ser afetadas. Cookies não essenciais só serão usados mediante seu consentimento, quando exigido.",
    ],
  },
  {
    title: "10. Links e serviços de terceiros",
    body: [
      "Nosso site pode conter links para outros sites e serviços (como o WhatsApp). Esses terceiros têm suas próprias políticas de privacidade, pelas quais não somos responsáveis.",
    ],
  },
  {
    title: "11. Menores de idade",
    body: [
      "Nossos serviços são voltados a empresas e a pessoas maiores de 18 anos. Não coletamos intencionalmente dados de crianças ou adolescentes.",
    ],
  },
  {
    title: "12. Canal de contato sobre privacidade",
    body: [
      "Para dúvidas, solicitações ou reclamações sobre privacidade:",
      "Canal de privacidade: atendimento Nutrifit.",
      "E-mail: NutriFit.cozinhajf@gmail.com",
      "WhatsApp: (32) 99803-0038",
      "Você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD) em www.gov.br/anpd.",
    ],
  },
  {
    title: "13. Alterações desta política",
    body: [
      "Podemos atualizar esta política para refletir mudanças legais ou em nossos serviços. A versão vigente estará sempre disponível nesta página, com a data da última atualização no topo.",
    ],
  },
  {
    title: "14. Foro",
    body: [
      "Esta política é regida pelas leis brasileiras. Fica eleito o foro da Comarca de Juiz de Fora/MG para resolver eventuais controvérsias, ressalvados os direitos do titular previstos em lei.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#080a07] text-white">
      <header className="border-b border-white/10 bg-black/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="flex items-center gap-3 font-black tracking-wide">
            <img src="/images/nutrifit-logo-icon.svg" alt="" className="h-9 w-9 object-contain" />
            NUTRIFIT
          </Link>
          <Link href="/" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/75 transition hover:border-[#a7b86a] hover:text-white">
            Voltar ao site
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        <p className="text-xs font-black uppercase tracking-[.22em] text-[#a7b86a]">Transparência e proteção de dados</p>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-white/50">Nutrifit · Última atualização: 25 de outubro de 2026</p>
        <p className="mt-7 text-base leading-7 text-white/70">
          A Nutrifit respeita a sua privacidade e protege os dados pessoais que trata, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD). Esta política explica quais dados coletamos, para que os usamos, com quem os compartilhamos e quais são os seus direitos.
        </p>
        <div className="mt-9 space-y-7">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 sm:p-7">
              <h2 className="text-lg font-black text-[#d9e5b2]">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-white/70">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-9 rounded-2xl border border-[#a7b86a]/25 bg-[#a7b86a]/[.06] p-5 text-sm leading-6 text-white/70">
          Para solicitações relacionadas aos seus dados pessoais, entre em contato pelo e-mail{" "}
          <a className="font-bold text-[#d9e5b2] underline underline-offset-4" href="mailto:NutriFit.cozinhajf@gmail.com">NutriFit.cozinhajf@gmail.com</a>{" "}
          ou pelo WhatsApp{" "}
          <a className="font-bold text-[#d9e5b2] underline underline-offset-4" href="https://wa.me/5532998030038">(32) 99803-0038</a>.
        </div>
      </article>
      <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-white/35">
        Nutrifit · Juiz de Fora/MG
      </footer>
    </main>
  );
}
