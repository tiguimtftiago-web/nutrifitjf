"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowLeft, Bot, CheckCircle2, ChevronRight, Factory, MessageCircle, Package, RefreshCw, Search, ShoppingBag, Sparkles, Truck, Users, Wallet, Mic, Target, BarChart3, CircleDot } from "lucide-react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdllpyqrbofszvallzxf.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_txHW3n6PyIFEw7P4uLzETA_A4wSJHSJ";

type Order = { id:string; created_at:string; customer_name:string|null; item_count:number; total:number; status:string; acquisition_source?:string|null };
type Inventory = { id:string; name:string; unit:string; current_quantity:number; minimum_quantity:number; average_cost:number; active:boolean };
type Lead = { id:string; company:string; contact_name:string; status:string; estimated_meals:string|null };
type Message = { id:string; created_at:string; display_name:string|null; message_text:string|null; processed:boolean };
type Acquisition = { source:string; visits:number; leads:number; orders:number; revenue:number };

async function request(path:string, token:string) {
  const r=await fetch(path,{headers:{apikey:KEY,Authorization:`Bearer ${token}`}});
  const t=await r.text();
  if(!r.ok) throw new Error(t||"Erro");
  return t?JSON.parse(t):null;
}

const money=(v:number)=>`R$ ${Number(v||0).toFixed(2).replace(".",",")}`;

const hudCss = `
@keyframes nf-pulse { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.05);opacity:1} }
@keyframes nf-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes nf-spin-rev { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
@keyframes nf-scan { 0%{transform:translateY(-45px);opacity:0} 25%{opacity:.6} 100%{transform:translateY(45px);opacity:0} }
.nf-hud-ring{animation:nf-spin 18s linear infinite}
.nf-hud-ring-rev{animation:nf-spin-rev 12s linear infinite}
.nf-hud-core{animation:nf-pulse 3s ease-in-out infinite}
.nf-scan{animation:nf-scan 3.5s ease-in-out infinite}
`;

export default function NFCorePage(){
  const [token,setToken]=useState("");
  const [email,setEmail]=useState("");
  const [orders,setOrders]=useState<Order[]>([]);
  const [inventory,setInventory]=useState<Inventory[]>([]);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [messages,setMessages]=useState<Message[]>([]);
  const [recipes,setRecipes]=useState<any[]>([]);
  const [recipeItems,setRecipeItems]=useState<any[]>([]);
  const [catalog,setCatalog]=useState<any[]>([]);
  const [planning,setPlanning]=useState(false);
  const [command,setCommand]=useState("");
  const [listening,setListening]=useState(false);
  const [voiceStatus,setVoiceStatus]=useState("");
  const recognitionRef=useRef<any>(null);
  const [answer,setAnswer]=useState("Estou pronto. Pergunte sobre vendas, pedidos, estoque, produção, B2B ou WhatsApp.");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [purchaseDraft,setPurchaseDraft]=useState(false);
  const [purchaseMessage,setPurchaseMessage]=useState("");
  const [lastCommand,setLastCommand]=useState("");
  const [voiceReply,setVoiceReply]=useState(true);
  const [microphonePermission,setMicrophonePermission]=useState<"unknown"|"granted"|"prompt"|"denied">("unknown");
  const [acquisitionEvents,setAcquisitionEvents]=useState<any[]>([]);

  function speak(text:string){
    if(typeof window==="undefined" || !voiceReply || !("speechSynthesis" in window))return;
    try{
      window.speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang="pt-BR";
      utterance.rate=1;
      utterance.pitch=1;
      window.speechSynthesis.speak(utterance);
    }catch{}
  }

  function respond(text:string){
    setAnswer(text);
    speak(text);
  }

  async function load(t=token){
    if(!t)return;
    setBusy(true);setError("");
    try{
      const [o,i,l,m,r,ri,cp]=await Promise.all([
        request(`${URL}/rest/v1/customer_orders?select=id,created_at,customer_name,item_count,total,status,acquisition_source&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/inventory_items?select=id,name,unit,current_quantity,minimum_quantity,average_cost,active&active=eq.true&order=name.asc&limit=500`,t),
        request(`${URL}/rest/v1/b2b_leads?select=id,company,contact_name,status,estimated_meals&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/whatsapp_messages?select=id,created_at,display_name,message_text,processed&order=created_at.desc&limit=100`,t),
        request(`${URL}/rest/v1/inventory_recipes?select=id,name,product_name,yield_quantity,yield_unit,active,catalog_product_id&active=eq.true&limit=500`,t),
        request(`${URL}/rest/v1/inventory_recipe_items?select=id,recipe_id,item_id,quantity&limit=5000`,t),
        request(`${URL}/rest/v1/catalog_products?select=id,name,active,line,size_grams&active=eq.true&limit=500`,t)
      ]);
      setOrders(o||[]);setInventory(i||[]);setLeads(l||[]);setMessages(m||[]);setRecipes(r||[]);setRecipeItems(ri||[]);setCatalog(cp||[]);
       try{const events=await request(`${URL}/rest/v1/acquisition_events?select=id,created_at,event,source&order=created_at.desc&limit=5000`,t);setAcquisitionEvents(events||[]);}catch{setAcquisitionEvents([]);}
    }catch(e){setError("Não consegui carregar os dados do painel.");}
    finally{setBusy(false);}
  }

  useEffect(()=>{
    const t=sessionStorage.getItem("nutrifit_admin_token")||"";
    const e=sessionStorage.getItem("nutrifit_admin_email")||"";
    setToken(t);setEmail(e);
    if(t)void load(t);
  },[]);

  const today=new Date().toLocaleDateString("pt-BR");
  const todayOrders=orders.filter(o=>new Date(o.created_at).toLocaleDateString("pt-BR")===today);
  const todayRevenue=todayOrders.reduce((s,o)=>s+Number(o.total||0),0);
  const lowStock=inventory.filter(i=>Number(i.current_quantity)<=Number(i.minimum_quantity));
  const pending=orders.filter(o=>["enviado_whatsapp","novo","confirmado","pago_recebido"].includes(o.status));
  const prep=orders.filter(o=>o.status==="em_preparo");
  const delivery=orders.filter(o=>o.status==="saiu_entrega");
  const openLeads=leads.filter(l=>!["Perdido","Cliente ativo"].includes(l.status));
  const actionableOrders=orders.filter(o=>["confirmado","pago_recebido","em_preparo"].includes(o.status));
  const inventoryMap=useMemo(()=>new Map(inventory.map(i=>[i.id,i])),[inventory]);
  const recipeMap=useMemo(()=>new Map(recipes.map(r=>[r.catalog_product_id,r])),[recipes]);
  const plannedNeeds=useMemo(()=>{const totals=new Map<string,number>();let mapped=0;for(const order of actionableOrders){const raw:any=(order as any).items;const lines=Array.isArray(raw)?raw:(raw?.items&&Array.isArray(raw.items)?raw.items:[]);for(const line of lines){const qty=Number(line.quantity||line.qty||line.amount||1);if(!qty)continue;const pid=line.product_id||line.productId||line.catalog_product_id||line.id;const name=String(line.name||line.product_name||line.product||"").trim();const recipe=recipeMap.get(pid)||recipes.find(r=>r.name===name||r.product_name===name);if(!recipe)continue;mapped+=qty;const yieldQty=Number(recipe.yield_quantity||1)||1;for(const ri of recipeItems.filter(x=>x.recipe_id===recipe.id)){const need=Number(ri.quantity||0)*(qty/yieldQty);totals.set(ri.item_id,(totals.get(ri.item_id)||0)+need);}}}const rows=[...totals.entries()].map(([item_id,required])=>{const i=inventoryMap.get(item_id);const current=Number(i?.current_quantity||0);return {item_id,required,current,shortage:Math.max(required-current,0),name:i?.name||"Insumo não cadastrado",unit:i?.unit||"un",cost:Number(i?.average_cost||0)};}).filter(x=>x.required>0).sort((a,b)=>b.shortage-a.shortage);return {rows,mapped};},[actionableOrders,inventoryMap,recipeItems,recipes,recipeMap]);
  const productionSummary=useMemo(()=>({orders:actionableOrders.length,mapped:plannedNeeds.mapped,items:plannedNeeds.rows.filter(x=>x.shortage>0).length,estimated:plannedNeeds.rows.reduce((s,x)=>s+x.shortage*x.cost,0)}),[actionableOrders.length,plannedNeeds]);

  const acquisitionSummary=useMemo<Acquisition[]>(()=>{
    const sources=["instagram","google","facebook","tiktok","direct"];
    return sources.map(source=>{
      const visits=acquisitionEvents.filter(e=>e.source===source&&e.event==="site_visit").length;
      const leads=acquisitionEvents.filter(e=>e.source===source&&e.event==="lead_captured").length;
      const sourceOrders=orders.filter(o=>(o.acquisition_source||"direct")===source);
      return {source,visits,leads,orders:sourceOrders.length,revenue:sourceOrders.reduce((s,o)=>s+Number(o.total||0),0)};
    });
  },[acquisitionEvents,orders]);

  const insight=useMemo(()=>{
    if(lowStock.length)return `Atenção: ${lowStock.length} item(ns) estão no mínimo ou abaixo dele. O primeiro é ${lowStock[0].name}.`;
    if(pending.length)return `Há ${pending.length} pedido(s) aguardando uma ação.`;
    if(prep.length)return `Há ${prep.length} pedido(s) em preparo.`;
    return "A operação não apresenta alertas críticos nos dados carregados.";
  },[lowStock.length,pending.length,prep.length]);

  async function createPurchaseDraft(){
    if(!token||!lowStock.length)return;
    setBusy(true);setPurchaseMessage("");
    try{
      const response=await fetch(`${URL}/rest/v1/inventory_purchases`,{method:"POST",headers:{apikey:KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({status:"rascunho",total_cost:0,notes:"Rascunho gerado pelo NF CORE a partir dos alertas de estoque."})});
      const created=await response.json();
      if(!response.ok)throw new Error(JSON.stringify(created));
      const id=created?.[0]?.id;
      if(id){
        const items=lowStock.map(i=>{const q=Math.max(Number(i.minimum_quantity)-Number(i.current_quantity),1);return {purchase_id:id,item_id:i.id,quantity:q,unit_cost:Number(i.average_cost||0),total_cost:q*Number(i.average_cost||0),is_promotion:false};});
        const itemResponse=await fetch(`${URL}/rest/v1/inventory_purchase_items`,{method:"POST",headers:{apikey:KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(items)});
        if(!itemResponse.ok)throw new Error(await itemResponse.text());
      }
      setPurchaseMessage("Rascunho de compra criado. Ele ainda não foi enviado nem marcado como recebido.");
      setPurchaseDraft(false);
    }catch(e){console.error(e);setPurchaseMessage("Não foi possível criar o rascunho de compra.");}
    finally{setBusy(false);}
  }

  async function ensureMicrophonePermission(){
    if(typeof window==="undefined" || !navigator.mediaDevices?.getUserMedia){
      setMicrophonePermission("denied");
      return false;
    }
    try{
      const permissions=(navigator as any).permissions;
      if(permissions?.query){
        try{
          const status=await permissions.query({name:"microphone" as PermissionName});
          setMicrophonePermission(status.state as any);
          if(status.state==="denied"){
            setVoiceStatus("Microfone bloqueado para este site. No Chrome, toque no ícone de configurações ao lado do endereço, abra Permissões e deixe Microfone como Permitir.");
            return false;
          }
        }catch{}
      }
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      stream.getTracks().forEach(track=>track.stop());
      setMicrophonePermission("granted");
      return true;
    }catch(error:any){
      setMicrophonePermission("denied");
      const code=String(error?.name||"");
      const message=code==="NotAllowedError"||code==="PermissionDeniedError"
        ?"Microfone bloqueado para este site. No Chrome, toque no ícone de configurações ao lado do endereço, abra Permissões e deixe Microfone como Permitir. Depois volte e toque no microfone do NF CORE."
        :"Não consegui acessar o microfone. Verifique se ele não está sendo usado por outro aplicativo.";
      setVoiceStatus(message);
      setAnswer(message);
      return false;
    }
  }

  async function startVoiceCommand(){
    if(typeof window === "undefined" || listening)return;
    const SpeechRecognition=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SpeechRecognition){
      setVoiceStatus("Seu navegador não oferece reconhecimento de voz. Abra esta página no Google Chrome.");
      setAnswer("O comando de voz não está disponível neste navegador. Use o Google Chrome no celular ou digite o comando.");
      return;
    }

    try{
      // Solicita a permissão explicitamente no clique do usuário e só depois inicia o reconhecimento.
      const allowed=await ensureMicrophonePermission();
      if(!allowed)return;
      const recognition=new SpeechRecognition();
      recognitionRef.current=recognition;
      recognition.lang="pt-BR";
      recognition.continuous=false;
      recognition.interimResults=false;
      recognition.maxAlternatives=1;
      recognition.onstart=()=>{
        setListening(true);
        setVoiceStatus("Ouvindo… fale agora.");
      };
      recognition.onerror=(event:any)=>{
        setListening(false);
        recognitionRef.current=null;
        const code=String(event?.error||"");
        const message=code==="not-allowed"||code==="service-not-allowed"
          ?"Microfone bloqueado para este site. No Chrome, toque no ícone de configurações ao lado do endereço, abra Permissões e deixe Microfone como Permitir. Depois toque novamente no microfone do NF CORE."
          :code==="audio-capture"
          ?"O microfone não está disponível. Verifique se outro aplicativo está usando o microfone e tente novamente."
          :code==="no-speech"
          ?"Não detectei sua fala. Toque no microfone e fale normalmente."
          :"Não consegui iniciar o reconhecimento de voz. Tente novamente.";
        setVoiceStatus(message);
        setAnswer(message);
      };
      recognition.onend=()=>{
        setListening(false);
        recognitionRef.current=null;
      };
      recognition.onresult=(event:any)=>{
        const transcript=String(event.results?.[0]?.[0]?.transcript||"").trim();
        if(!transcript){
          setVoiceStatus("Não detectei uma frase. Tente novamente.");
          return;
        }
        setCommand(transcript);
        setVoiceStatus("Comando reconhecido. Processando…");
        runCommand(transcript);
      };
      recognition.start();
    }catch(error:any){
      setListening(false);
      recognitionRef.current=null;
      const code=String(error?.name||"");
      const message=code==="NotAllowedError"||code==="PermissionDeniedError"
        ?"O navegador bloqueou o microfone. No Chrome, abra as permissões deste site, deixe Microfone como Permitir e toque novamente no microfone."
        :"Não consegui acessar o microfone. Verifique a permissão do navegador e tente novamente.";
      setVoiceStatus(message);
      setAnswer(message);
    }
  }

  useEffect(()=>()=>{try{recognitionRef.current?.abort();}catch{}},[]);

  function runCommand(raw=command){
    const normalize=(value:string)=>value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9\s]/g," ")
      .replace(/\s+/g," ")
      .trim();

    const original=raw.trim();
    const q=normalize(raw);
    if(!q)return;
    setLastCommand(original);

    const has=(...terms:string[])=>terms.some(term=>q.includes(term));
    const asksAttention=has("atencao","problema","problemas","alerta","alertas","urgente","preocupacao","preocupacoes","pegando","complicado","critico","criticos","o que esta acontecendo","o que esta errado");
    const asksSales=has("venda","vendas","faturamento","faturar","receita","receitas","faturou","faturamos","quanto vendemos","quanto entrou","dinheiro entrou","movimento");
    const asksOrders=has("pedido","pedidos","encomenda","encomendas","cliente pediu","aguardando","atrasado","atrasados","em rota","entrega");
    const asksStock=has("estoque","estoques","insumo","insumos","ingrediente","ingredientes","material","materiais","comprar","compra","compras","faltando","falta","acabando","baixo","minimo");
    const asksProduction=has("producao","produzir","produzindo","preparo","preparar","fabricar","fabricacao","montagem","cozinha","ficha tecnica","fichas tecnicas","planejamento","planejar");
    const asksB2B=has("b2b","empresa","empresas","corporativo","corporativas","cliente empresarial","lead","leads");
    const asksWhatsApp=has("whatsapp","mensagem","mensagens","conversa","conversas","atendimento");
    const asksPurchaseDraft=has("rascunho de compra","preparar compra","montar compra","criar compra","prepare a compra","prepara a compra");
    const asksDailyBrief=has("resumo do dia","resumo de hoje","briefing","me atualiza","me atualize","como esta tudo","como estamos");
    const asksPlan=has("planejar producao","planejamento de producao","organizar producao","organize a producao","o que produzir","planeje a producao");
    const asksMorningRoutine=has("rotina de abertura","abrir o dia","comecei o dia","inicio do dia","comecar o dia");
    const asksCloseRoutine=has("fechar o dia","encerrar o dia","fechamento do dia","fim do dia");

    // Super comandos: atalhos curtos que sempre têm prioridade sobre a interpretação natural.
    const slashMatch=original.toLowerCase().match(/^\/([a-z0-9_]+)/);
    const slash=slashMatch?.[1]||"";
    const slashHandlers:Record<string,()=>void>={
      vendas:()=>respond(`Vendas hoje: ${todayOrders.length} pedido(s), ${money(todayRevenue)} faturados. ${todayOrders.length?"Posso detalhar o movimento por pedido.":"Ainda não há vendas registradas hoje."}`),
      pedidos:()=>respond(`Pedidos: ${pending.length} aguardando ação, ${prep.length} em preparo e ${delivery.length} em rota. Total carregado: ${orders.length}.`),
      estoque:()=>respond(lowStock.length?`Estoque crítico: ${lowStock.length} item(ns). ${lowStock.slice(0,6).map(i=>`${i.name}: ${i.current_quantity} ${i.unit}, mínimo ${i.minimum_quantity}.`).join(" ")}`:"Estoque dentro dos mínimos cadastrados."),
      compras:()=>{ if(lowStock.length){setPurchaseDraft(true);respond(`Encontrei ${lowStock.length} item(ns) para compra. O rascunho está pronto para sua confirmação.`);}else respond("Não há itens abaixo dos mínimos para montar uma compra agora."); },
      producao:()=>{setPlanning(true);respond(productionSummary.orders?`Produção: ${productionSummary.orders} pedido(s) elegíveis, ${productionSummary.mapped} unidade(s) mapeadas e ${productionSummary.items} insumo(s) com falta.`:"Não há pedidos elegíveis para planejamento agora.");},
      b2b:()=>respond(`B2B: ${openLeads.length} lead(s) em aberto de ${leads.length} cadastrados.`),
      whatsapp:()=>respond(`WhatsApp: ${messages.length} mensagens carregadas e ${messages.filter(m=>!m.processed).length} pendente(s) de processamento.`),
      alertas:()=>respond(insight),
      resumo:()=>respond(`Resumo: ${todayOrders.length} pedido(s), ${money(todayRevenue)} em vendas, ${pending.length} aguardando, ${prep.length} em preparo, ${delivery.length} em rota, ${lowStock.length} alerta(s) de estoque e ${openLeads.length} lead(s) B2B em aberto.`),
      hoje:()=>respond(`Hoje: ${todayOrders.length} pedido(s), ${money(todayRevenue)} em vendas. Prioridades: ${[lowStock.length?`${lowStock.length} alerta(s) de estoque`:"estoque OK",pending.length?`${pending.length} pedido(s) aguardando`:"sem pedidos pendentes",openLeads.length?`${openLeads.length} lead(s) B2B`:"sem lead(s) B2B pendente(s)"].join("; ")}.`),
      amanha:()=>respond("Amanhã: ainda não existe uma agenda operacional futura consolidada nesta tela. Posso usar os pedidos já registrados e o planejamento de produção para preparar a próxima operação."),
      cliente:()=>respond(`Clientes: há ${orders.length} pedido(s) carregados. Para um cliente específico, diga o nome depois de /cliente e eu procuro nos pedidos carregados.`),
      produto:()=>respond(`Produtos: o catálogo tem ${catalog.length} produto(s) ativo(s) carregado(s). Diga o nome do produto depois de /produto para eu localizar o item.`),
      cardapio:()=>respond(`Cardápio: ${catalog.length} produto(s) ativo(s) carregado(s). Posso cruzar os produtos com os pedidos para orientar a operação.`),
      marketing:()=>respond("Marketing: posso estruturar uma ação comercial da Nutrifit com oferta, público, argumento, conteúdo e chamada para ação. Diga o objetivo ou produto."),
      conteudo:()=>respond("Conteúdo: posso criar um plano de posts, Reels e Stories baseado em um produto, campanha ou objetivo da Nutrifit."),
      followup:()=>respond(`Follow-up: ${openLeads.length} lead(s) B2B estão em aberto. Posso priorizar os contatos pelo status cadastrado.`),
      prioridades:()=>{const p:string[]=[];if(lowStock.length)p.push(`${lowStock.length} alerta(s) de estoque`);if(pending.length)p.push(`${pending.length} pedido(s) aguardando`);if(openLeads.length)p.push(`${openLeads.length} lead(s) B2B em aberto`);respond(p.length?`Minhas prioridades agora: ${p.join("; ")}.`:"Nenhuma prioridade crítica identificada agora.");},
      offer:()=>respond("Oferta: diga qual produto ou campanha você quer vender e eu estruturo a oferta com preço, benefício, argumento e CTA."),
      standout:()=>respond("Destaque: diga qual produto, serviço ou diferencial da Nutrifit você quer posicionar e eu monto o argumento de diferenciação."),
      content:()=>respond("Conteúdo: diga o tema ou produto e eu preparo a estrutura do conteúdo."),
      ad:()=>respond("Anúncio: diga o produto, público e objetivo. Eu estruturo benefício, mensagem e chamada para ação."),
      proposal:()=>respond("Proposta: diga a empresa ou cliente e o objetivo. Eu estruturo uma proposta objetiva."),
      objections:()=>respond("Objeções: diga qual produto ou oferta está sendo vendida e eu preparo respostas para as principais objeções."),
      negotiation:()=>respond("Negociação: diga o cliente, oferta e limite desejado. Eu organizo argumentos, concessões e próximos passos."),
      retention:()=>respond("Retenção: posso montar uma ação para recuperar clientes. Diga o produto ou público que quer recuperar.")
    };

    if(slash){
      const handler=slashHandlers[slash];
      if(handler){handler();setCommand("");return;}
      respond(`O comando /${slash} ainda não está cadastrado. Use /vendas, /pedidos, /estoque, /compras, /producao, /b2b, /whatsapp, /alertas, /resumo, /hoje, /cliente, /produto, /marketing ou /prioridades.`);
      setCommand("");
      return;
    }

    if(asksMorningRoutine){
      const parts=[
        `Bom dia. A operação tem ${todayOrders.length} pedido(s) hoje, ${money(todayRevenue)} em vendas, ${pending.length} pendente(s), ${lowStock.length} alerta(s) de estoque e ${openLeads.length} lead(s) B2B em aberto.`,
        lowStock.length?`Prioridade de compra: ${lowStock.slice(0,3).map(i=>i.name).join(", ")}.`:"",
        pending.length?`Prioridade de pedidos: ${pending.slice(0,3).map(o=>o.customer_name||"cliente").join(", ")}.`:""
      ].filter(Boolean);
      respond(parts.join(" "));
    }else if(asksCloseRoutine){
      respond(`Fechamento: ${todayOrders.length} pedido(s), ${money(todayRevenue)} em vendas, ${delivery.length} em rota e ${messages.filter(m=>!m.processed).length} mensagem(ns) do WhatsApp pendente(s). ${lowStock.length?lowStock.length+" alerta(s) de estoque ainda precisam de atenção.":"Sem alerta crítico de estoque."}`);
    }else if(asksDailyBrief){
      respond(`Resumo do dia: ${todayOrders.length} pedido(s), ${money(todayRevenue)} em vendas, ${pending.length} aguardando ação, ${prep.length} em preparo, ${delivery.length} em rota, ${lowStock.length} alerta(s) de estoque e ${openLeads.length} lead(s) B2B em aberto.`);
    }else if(asksPlan){
      setPlanning(true);
      respond(productionSummary.orders
        ? `Planejamento executado. Cruzei ${productionSummary.orders} pedido(s) com as fichas técnicas: ${productionSummary.mapped} unidade(s) mapeadas e ${productionSummary.items} insumo(s) com falta. O painel abaixo mostra o que precisa ser comprado.`
        : "Não há pedidos elegíveis para planejamento neste momento.");
    }else if(asksPurchaseDraft){
      if(lowStock.length){
        setPurchaseDraft(true);
        respond(`Posso preparar um rascunho com ${lowStock.length} item(ns) abaixo ou no mínimo do estoque. Nada será enviado sem sua confirmação.`);
      }else{
        respond("Não encontrei itens abaixo dos mínimos cadastrados para montar uma compra agora.");
      }
    }else if(asksAttention){
      const parts:string[]=[];
      if(lowStock.length)parts.push(`${lowStock.length} item(ns) de estoque precisam de atenção`);
      if(pending.length)parts.push(`${pending.length} pedido(s) aguardam ação`);
      if(prep.length)parts.push(`${prep.length} pedido(s) estão em preparo`);
      if(openLeads.length)parts.push(`${openLeads.length} lead(s) B2B estão em aberto`);
      respond(parts.length
        ? `Minha leitura agora: ${parts.join("; ")}. ${insight}`
        : "Neste momento não identifiquei alertas críticos nos dados carregados.");
    }else if(asksSales){
      respond(`Hoje tivemos ${todayOrders.length} pedido(s) e ${money(todayRevenue)} em vendas. ${todayOrders.length===0?"Ainda não há pedidos registrados hoje.":"Posso detalhar os pedidos e o movimento comercial a partir desses dados."}`);
    }else if(asksOrders){
      respond(`Agora existem ${pending.length} pedido(s) aguardando ação, ${prep.length} em preparo e ${delivery.length} em rota. Total carregado: ${orders.length} pedido(s).`);
    }else if(asksStock){
      respond(lowStock.length
        ? `Encontrei ${lowStock.length} item(ns) que merecem atenção: ${lowStock.slice(0,8).map(i=>`${i.name} (${i.current_quantity} ${i.unit}, mínimo ${i.minimum_quantity} ${i.unit})`).join("; ")}.`
        : "O estoque está acima dos mínimos cadastrados. Não há item crítico neste momento.");
    }else if(asksProduction){
      respond(productionSummary.orders
        ? `Tenho ${productionSummary.orders} pedido(s) elegíveis para planejamento, ${productionSummary.mapped} unidade(s) mapeadas pelas fichas técnicas e ${productionSummary.items} insumo(s) com falta.`
        : "Não há pedidos em confirmado, pago ou em preparo para planejar agora.");
    }else if(asksB2B){
      respond(`Tenho ${openLeads.length} lead(s) B2B em aberto de ${leads.length} cadastrados.`);
    }else if(asksWhatsApp){
      respond(`Há ${messages.length} mensagens carregadas; ${messages.filter(m=>!m.processed).length} ainda estão pendentes de processamento.`);
    }else{
      respond(insight+` Hoje são ${todayOrders.length} pedido(s), ${money(todayRevenue)} em vendas e ${openLeads.length} lead(s) B2B em aberto.`);
    }
    setCommand("");
  }
  if(!token)return <main className="min-h-screen bg-[#080a07] p-6 text-white"><div className="mx-auto mt-20 max-w-md rounded-3xl border border-white/10 bg-[#0d110b] p-6"><Bot className="text-[#a7b86a]" size={32}/><h1 className="mt-4 text-2xl font-black">NF CORE</h1><p className="mt-2 text-sm text-white/50">Entre no painel administrativo primeiro para usar o agente.</p><a href="/admin" className="mt-5 block rounded-full bg-[#a7b86a] px-5 py-3 text-center font-black text-black">Abrir painel</a></div></main>;

  const cards=[
    {label:"Vendas hoje",value:money(todayRevenue),icon:Wallet},
    {label:"Pedidos pendentes",value:pending.length,icon:ShoppingBag},
    {label:"Estoque crítico",value:lowStock.length,icon:Package},
    {label:"B2B em aberto",value:openLeads.length,icon:Users},
  ];

  return <main className="min-h-screen bg-[#050706] text-white">
    <style>{hudCss}</style>
    <div className="pointer-events-none fixed inset-0 opacity-40" style={{backgroundImage:"radial-gradient(circle at 50% 10%,rgba(167,184,106,.10),transparent 35%),linear-gradient(rgba(167,184,106,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(167,184,106,.025) 1px,transparent 1px)",backgroundSize:"100% 100%,32px 32px,32px 32px"}}/>
    <header className="sticky top-0 z-30 border-b border-[#a7b86a]/15 bg-[#050706]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <a href="/admin" className="rounded-xl border border-white/10 bg-white/[.03] p-2.5" aria-label="Voltar"><ArrowLeft size={17}/></a>
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#a7b86a]/40 bg-[#a7b86a]/10 text-[#d9e5a5]"><Bot size={20}/></div>
          <div><div className="text-[9px] font-black uppercase tracking-[.28em] text-[#a7b86a]">NUTRIFIT SYSTEM</div><div className="font-black tracking-wide">NF CORE</div></div>
        </div>
        <div className="hidden items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-white/35 md:flex">
          <span className="text-[#a7b86a]">● Sistema online</span><span>{email||"Administrador"}</span>
        </div>
        <button onClick={()=>void load()} disabled={busy} className="rounded-xl border border-white/10 bg-white/[.03] p-2.5"><RefreshCw size={15} className={busy?"animate-spin":""}/></button>
      </div>
    </header>

    <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-5 pb-12 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-[#a7b86a]/20 bg-[#080b09]/90 shadow-[0_0_80px_rgba(76,180,100,.06)]">
        <div className="grid lg:grid-cols-[.9fr_1.1fr]">
          <div className="flex flex-col justify-center p-5 pb-4 sm:p-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-[#a7b86a]"><Activity size={13}/> Inteligência operacional</div>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">NF <span className="text-[#ef7d18]">CORE</span></h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/45">O cérebro operacional da Nutrifit. Pergunte, analise e acompanhe a operação em uma única tela.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#a7b86a]/20 bg-[#a7b86a]/5 px-3 py-1.5 text-[10px] font-black text-[#cbdc92]">VENDAS</span>
              <span className="rounded-full border border-[#a7b86a]/20 bg-[#a7b86a]/5 px-3 py-1.5 text-[10px] font-black text-[#cbdc92]">ESTOQUE</span>
              <span className="rounded-full border border-[#ef7d18]/20 bg-[#ef7d18]/5 px-3 py-1.5 text-[10px] font-black text-[#f4aa67]">PRODUÇÃO</span>
              <span className="rounded-full border border-[#24b8e6]/20 bg-[#24b8e6]/5 px-3 py-1.5 text-[10px] font-black text-[#61ccec]">B2B</span>
            </div>
          </div>

          <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden p-4 sm:min-h-[390px]">
            <div className="absolute h-[290px] w-[290px] sm:h-[330px] sm:w-[330px] rounded-full border border-[#a7b86a]/10"></div>
            <div className="nf-hud-ring absolute h-[235px] w-[235px] sm:h-[275px] sm:w-[275px] rounded-full border border-dashed border-[#a7b86a]/40"></div>
            <div className="nf-hud-ring-rev absolute h-[190px] w-[190px] sm:h-[225px] sm:w-[225px] rounded-full border border-[#ef7d18]/40" style={{borderLeftColor:"transparent",borderBottomColor:"transparent"}}></div>
            <div className="nf-scan absolute h-px w-64 bg-gradient-to-r from-transparent via-[#a7b86a] to-transparent"></div>
            <div className="nf-hud-core relative grid h-28 w-28 sm:h-32 sm:w-32 place-items-center rounded-full border border-[#a7b86a]/70 bg-[#080d08] shadow-[0_0_50px_rgba(167,184,106,.22)]">
              <div className="absolute inset-2 rounded-full border border-[#ef7d18]/40"></div>
              <div className="text-center"><Bot size={34} className="mx-auto text-[#a7b86a]"/><div className="mt-1 text-[9px] font-black tracking-[.25em] text-[#ef7d18]">ONLINE</div></div>
            </div>
            <div className="absolute left-3 top-8 rounded-2xl border border-[#a7b86a]/25 bg-[#071008]/90 px-3 py-2 backdrop-blur"><div className="flex items-center gap-2 text-[10px] font-black text-[#9ee6b1]"><BarChart3 size={14}/> VENDAS</div><div className="mt-0.5 text-[11px] text-white/45">Em análise</div></div>
            <div className="absolute right-3 top-10 rounded-2xl border border-[#ef7d18]/25 bg-[#120c07]/90 px-3 py-2 backdrop-blur"><div className="flex items-center gap-2 text-[10px] font-black text-[#f4aa67]"><Package size={14}/> ESTOQUE</div><div className="mt-0.5 text-[11px] text-white/45">{lowStock.length} alerta(s)</div></div>
            <div className="absolute bottom-8 left-3 rounded-2xl border border-[#24b8e6]/25 bg-[#071014]/90 px-3 py-2 backdrop-blur"><div className="flex items-center gap-2 text-[10px] font-black text-[#61ccec]"><ShoppingBag size={14}/> PEDIDOS</div><div className="mt-0.5 text-[11px] text-white/45">{pending.length} pendentes</div></div>
            <div className="absolute bottom-8 right-3 rounded-2xl border border-[#a7b86a]/25 bg-[#071008]/90 px-3 py-2 backdrop-blur"><div className="flex items-center gap-2 text-[10px] font-black text-[#cbdc92]"><Factory size={14}/> PRODUÇÃO</div><div className="mt-0.5 text-[11px] text-white/45">{prep.length} em preparo</div></div>
          </div>
        </div>

        <div className="border-t border-[#ef7d18]/20 bg-gradient-to-b from-[#100b06]/90 to-black/30 p-4 sm:p-6">
          <div className="mt-4 rounded-2xl border border-[#a7b86a]/25 bg-[#071008]/80 p-4 shadow-[0_0_35px_rgba(167,184,106,.07)]">
            <div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-xl border border-[#a7b86a]/30 bg-[#a7b86a]/10 text-[#a7b86a]"><Bot size={16}/></div><div><div className="text-[9px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Resposta do NF CORE</div><div className="text-[9px] text-white/25">ANÁLISE EM TEMPO REAL</div></div><span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-[#a7b86a]"><span className="h-1.5 w-1.5 rounded-full bg-[#a7b86a]"/> ONLINE</span></div>
            {lastCommand&&<div className="mt-3 rounded-xl border border-white/6 bg-black/20 px-3 py-2"><div className="text-[8px] font-black uppercase tracking-[.18em] text-white/25">Comando recebido</div><div className="mt-1 text-xs text-white/50">“{lastCommand}”</div></div>}
            <div className="mt-3 flex items-start gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#a7b86a] shadow-[0_0_12px_rgba(167,184,106,.7)]"/>
              <p className="text-sm font-medium leading-6 text-white/85">{answer}</p>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 px-1"><Sparkles size={14} className="text-[#ef7d18]"/><span className="text-[10px] font-black uppercase tracking-[.22em] text-[#f4aa67]">Fale com o NF CORE</span><span className="ml-auto text-[9px] text-white/25">COMANDO DIRETO</span></div>
          <div className="flex gap-2">
            <div className={"flex min-h-[58px] min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3 transition-all "+(listening?"border-[#ef7d18]/70 bg-[#1b1008] shadow-[0_0_28px_rgba(239,125,24,.14)]":"border-white/10 bg-white/[.035]")}>
              <Bot size={17} className="shrink-0 text-[#a7b86a]"/>
              <input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")runCommand()}} placeholder={listening?"Estou ouvindo...":"Ex.: Como estão as vendas hoje?"} className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-white/30"/>
              <button type="button" onClick={startVoiceCommand} aria-label={listening?"Comando de voz ativo":"Falar com o NF CORE"} className={"grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all "+(listening?"bg-[#ef7d18] text-black animate-pulse":"bg-[#a7b86a]/10 text-[#a7b86a] hover:bg-[#a7b86a]/20")}>
                <Mic size={19}/>
              </button>
            </div>
            <button onClick={()=>runCommand()} className="min-w-[104px] rounded-2xl bg-[#ef7d18] px-4 py-3 text-sm font-black text-black shadow-[0_0_28px_rgba(239,125,24,.20)]">EXECUTAR</button>
          </div>
          <div className="mt-2 flex items-center gap-2 px-1 text-[10px] leading-4 text-white/30"><Mic size={12} className={listening?"shrink-0 text-[#ef7d18]":"shrink-0 text-[#a7b86a]"}/><span className="min-w-0 flex-1">{voiceStatus|| (listening?"O NF CORE está ouvindo. Fale normalmente.":microphonePermission==="granted"?"Microfone liberado. Toque no microfone e fale.":"Toque no microfone para liberar e iniciar o comando de voz.")}</span><button type="button" onClick={()=>setVoiceReply(v=>!v)} className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white/40">{voiceReply?"Voz ON":"Voz OFF"}</button></div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Faça meu resumo do dia","O que precisa da minha atenção?","Planeje a produção","Prepare um rascunho de compra"].map((x,i)=><button key={x} onClick={()=>runCommand(x)} className="rounded-xl border border-white/8 bg-white/[.025] px-3 py-2.5 text-left text-[10px] font-bold text-white/55 hover:border-[#a7b86a]/30 hover:text-white"><span className="mb-1 block text-[#a7b86a]">{i===0?<Target size={13}/>:i===1?<BarChart3 size={13}/>:i===2?<ShoppingBag size={13}/>:i===3?<Package size={13}/>:<CircleDot size={13}/>}</span>{x}</button>)}
          </div>

        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#ef7d18]/20 bg-[#0d0a07] p-5">
        <div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ef7d18]">Aquisição</div><h2 className="mt-1 text-lg font-black">De onde estão vindo os clientes?</h2><p className="mt-1 text-xs text-white/35">Instagram, Google, Facebook, TikTok e acesso direto.</p></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b border-white/8 text-[9px] uppercase tracking-wider text-white/25"><th className="pb-3">Origem</th><th>Visitas</th><th>Cadastros</th><th>Pedidos</th><th>Vendas</th><th>Conversão</th></tr></thead><tbody>{acquisitionSummary.map(a=>{const conversion=a.visits?((a.orders/a.visits)*100):0;return <tr key={a.source} className="border-b border-white/5"><td className="py-3 font-black uppercase">{a.source}</td><td>{a.visits}</td><td>{a.leads}</td><td>{a.orders}</td><td>{money(a.revenue)}</td><td className="font-black text-[#a7b86a]">{conversion.toFixed(1)}%</td></tr>})}</tbody></table></div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({label,value,icon:Icon},i)=><div key={label} className={"rounded-2xl border p-4 "+(i===0?"border-[#a7b86a]/25 bg-[#071008]":i===1?"border-[#ef7d18]/25 bg-[#120c07]":i===2?"border-red-500/20 bg-red-950/10":"border-[#24b8e6]/20 bg-[#071014]")}>
          <Icon size={18} className={i===0?"text-[#a7b86a]":i===1?"text-[#ef7d18]":i===2?"text-red-400":"text-[#24b8e6]"}/>
          <div className="mt-3 text-xl font-black sm:text-2xl">{value}</div><div className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/35">{label}</div>
        </div>)}
      </section>



      <section className="mt-4 rounded-2xl border border-[#a7b86a]/15 bg-[#080b09] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Super comandos do NF CORE</div><div className="mt-1 text-xs text-white/35">Fale naturalmente ou use /comando para acionar uma habilidade diretamente.</div></div>
          <span className="w-fit rounded-full border border-[#ef7d18]/20 bg-[#ef7d18]/5 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-[#ef7d18]">20 habilidades</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {[
            ["/vendas","Vendas","Analisar faturamento",BarChart3],
            ["/pedidos","Pedidos","Status da operação",ShoppingBag],
            ["/estoque","Estoque","Itens críticos",Package],
            ["/compras","Compras","Preparar compra",Wallet],
            ["/producao","Produção","Planejar produção",Factory],
            ["/b2b","B2B","Leads e empresas",Users],
            ["/whatsapp","WhatsApp","Mensagens",MessageCircle],
            ["/alertas","Alertas","O que exige atenção",Target],
            ["/resumo","Resumo","Visão completa",Activity],
            ["/hoje","Hoje","Prioridades do dia",CircleDot],
            ["/cliente","Cliente","Histórico de pedidos",Users],
            ["/produto","Produto","Análise do item",Package],
            ["/cardapio","Cardápio","Produtos ativos",ShoppingBag],
            ["/marketing","Marketing","Ação comercial",Sparkles],
            ["/conteudo","Conteúdo","Posts e Reels",MessageCircle],
            ["/followup","Follow-up","Retornos pendentes",RefreshCw],
            ["/prioridades","Prioridades","Top ações agora",Target],
            ["/offer","Oferta","Estruturar oferta",Wallet],
            ["/negotiation","Negociação","Argumentos e limites",Users],
            ["/retention","Retenção","Recuperar clientes",RefreshCw]
          ].map(([cmd,label,desc,Icon]:any)=><button key={cmd} onClick={()=>runCommand(String(cmd))} className="group rounded-xl border border-white/7 bg-white/[.025] p-3 text-left transition hover:border-[#a7b86a]/35 hover:bg-[#a7b86a]/5">
            <div className="flex items-center justify-between"><Icon size={15} className="text-[#a7b86a]"/><span className="text-[8px] font-black text-[#ef7d18]">{cmd}</span></div>
            <div className="mt-2 text-[10px] font-black uppercase tracking-wider">{label}</div>
            <div className="mt-1 line-clamp-2 text-[9px] leading-4 text-white/30">{desc}</div>
          </button>)}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#a7b86a]/15 bg-[#080b09] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-white/35"><Factory size={14}/> Planejamento inteligente</div><h2 className="mt-1 text-lg font-black">Produção baseada nos pedidos</h2><p className="mt-1 text-xs leading-5 text-white/40">Cruza pedidos, fichas técnicas e estoque para estimar as necessidades.</p></div>
          <button onClick={()=>{setPlanning(true);setAnswer(productionSummary.orders?"Planejamento atualizado: "+productionSummary.orders+" pedido(s), "+productionSummary.mapped+" unidade(s) mapeadas e "+productionSummary.items+" insumo(s) com falta.":"Não há pedidos elegíveis para planejamento.")}} className="rounded-xl bg-[#a7b86a] px-4 py-2.5 text-xs font-black text-black">{planning?"ATUALIZAR":"CALCULAR PRODUÇÃO"}</button>
        </div>
        {planning&&<div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">{[["Pedidos",productionSummary.orders],["Unidades mapeadas",productionSummary.mapped],["Faltas de insumo",productionSummary.items],["Custo estimado",money(productionSummary.estimated)]].map(([a,b])=><div key={String(a)} className="rounded-xl bg-white/[.025] p-3"><div className="text-lg font-black">{b}</div><div className="text-[10px] text-white/35">{a}</div></div>)}</div>}
        {planning&&plannedNeeds.rows.length>0&&<div className="mt-3 space-y-2">{plannedNeeds.rows.slice(0,8).map(x=><div key={x.item_id} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[.02] p-3"><div><div className="text-xs font-bold">{x.name}</div><div className="text-[10px] text-white/30">Necessário {x.required.toFixed(1)} {x.unit} • disponível {x.current.toFixed(1)} {x.unit}</div></div><b className={"text-xs "+(x.shortage>0?"text-[#ef7d18]":"text-[#a7b86a]")}>{x.shortage>0?"Comprar "+x.shortage.toFixed(1)+" "+x.unit:"OK"}</b></div>)}</div>}
        {planning&&plannedNeeds.mapped===0&&<div className="mt-3 rounded-xl border border-[#ef7d18]/20 bg-[#1b120a] p-3 text-xs text-[#f1b06e]">Nenhum pedido conseguiu ser ligado a uma ficha técnica. Confira os IDs dos produtos nos itens do pedido.</div>}
      </section>

      {lowStock.length>0&&<section className="mt-4 rounded-2xl border border-[#ef7d18]/25 bg-[#120c07] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ef7d18]">Ação assistida</div><h2 className="mt-1 text-lg font-black">NF CORE encontrou {lowStock.length} item(ns) para compra.</h2><p className="mt-1 text-xs text-white/40">Preparar rascunho com as quantidades mínimas. Nada será enviado.</p></div><button onClick={()=>setPurchaseDraft(true)} className="rounded-xl bg-[#ef7d18] px-4 py-2.5 text-xs font-black text-black">PREPARAR COMPRA</button></div>
        {purchaseMessage&&<div className="mt-3 rounded-xl border border-white/8 bg-black/20 p-3 text-xs text-white/60">{purchaseMessage}</div>}
      </section>}

      {purchaseDraft&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl border border-[#a7b86a]/25 bg-[#0b100c] p-6 shadow-[0_0_80px_rgba(167,184,106,.12)]"><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7b86a]">Confirmação necessária</div><h2 className="mt-2 text-2xl font-black">Criar rascunho de compra?</h2><p className="mt-3 text-sm leading-6 text-white/45">O NF CORE registrará a compra como rascunho. Não haverá envio, pagamento ou entrada no estoque.</p><div className="mt-5 flex gap-2"><button onClick={()=>setPurchaseDraft(false)} className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-black">Cancelar</button><button onClick={()=>void createPurchaseDraft()} disabled={busy} className="flex-1 rounded-xl bg-[#ef7d18] px-4 py-3 text-sm font-black text-black">{busy?"Criando...":"Confirmar"}</button></div></div></div>}

      {error&&<div className="mt-4 rounded-xl border border-[#ef7d18]/30 bg-[#1b120a] p-4 text-sm text-[#f1b06e]">{error}</div>}

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#080b09] p-5"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-white/35"><Package size={14}/> Estoque crítico</div><div className="mt-3 space-y-2">{lowStock.slice(0,6).map(i=><div key={i.id} className="flex items-center justify-between rounded-xl bg-white/[.025] p-3"><span className="text-xs font-bold">{i.name}</span><span className="text-[10px] font-black text-[#ef7d18]">{i.current_quantity} {i.unit} / mín. {i.minimum_quantity}</span></div>)}{!lowStock.length&&<p className="text-xs text-white/35">Nenhum alerta de estoque.</p>}</div></div>
        <div className="rounded-2xl border border-white/10 bg-[#080b09] p-5"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-white/35"><ShoppingBag size={14}/> Operação</div><div className="mt-3 space-y-2"><a href="/admin" className="flex items-center justify-between rounded-xl bg-white/[.025] p-3"><span className="text-xs font-bold">Pedidos</span><b className="text-xs">{orders.length}</b></a><a href="/admin" className="flex items-center justify-between rounded-xl bg-white/[.025] p-3"><span className="text-xs font-bold">Entregas em rota</span><b className="text-xs text-[#a7b86a]">{delivery.length}</b></a><a href="/admin" className="flex items-center justify-between rounded-xl bg-white/[.025] p-3"><span className="text-xs font-bold">WhatsApp pendente</span><b className="text-xs text-[#a7b86a]">{messages.filter(m=>!m.processed).length}</b></a></div></div>
      </section>

      <div className="mt-5 flex items-center justify-between text-[9px] uppercase tracking-[.18em] text-white/20"><span>NF CORE v1 • Nutrifit Intelligence</span><span>Secure operational interface</span></div>
    </div>
  </main>;
}