const SYSTEM_PROMPT = `Você é um especialista em criar guias práticos sobre IA para a plataforma AplicaAI.
Gere conteúdo em português brasileiro, acessível e prático. Sempre responda em JSON válido.`;

function buildPrompt(data) {
  const tool = data.tool || data.tools?.[0] || "IA";
  return `Crie um guia completo no formato AplicaAI:

TÍTULO: ${data.title || "Novo Guia"}
FERRAMENTA: ${tool}
DIFICULDADE: ${data.difficulty || "Iniciante"}
CATEGORIAS: ${(data.categories || []).join(", ")}
CONTEXTO: ${data.description || ""}

Responda SOMENTE com JSON nesta estrutura:
{
  "whatIsIt": "texto markdown explicando a solução (2-3 parágrafos + lista de benefícios)",
  "whyUseIt": [
    { "title": "Motivo 1", "description": "explicação" },
    { "title": "Motivo 2", "description": "explicação" },
    { "title": "Motivo 3", "description": "explicação" }
  ],
  "howToImplement": {
    "prerequisites": ["ferramenta 1", "ferramenta 2"],
    "steps": [
      { "number": 1, "title": "passo", "description": "detalhes" }
    ]
  },
  "useCases": [
    { "title": "caso", "description": "explicação", "command": "prompt/comando para copiar", "result": "resultado esperado" }
  ],
  "advancedTips": ["dica 1", "dica 2", "dica 3", "dica 4"],
  "commonMistakes": ["erro 1", "erro 2", "erro 3", "erro 4"],
  "conclusion": "texto markdown de conclusão (2-3 parágrafos)"
}`;
}

const TOOL_SPECIFIC_CONTENT = {
  ChatGPT: {
    url: "https://chat.openai.com",
    useCases: [
      { title: "Criar posts para redes sociais", command: "Crie 5 posts para Instagram sobre [seu tema]. Cada post deve ter: legenda persuasiva com até 150 palavras, 5 hashtags relevantes e uma CTA clara.", result: "5 posts prontos com legendas, hashtags e CTAs." },
      { title: "Gerar roteiros de vídeo", command: "Crie um roteiro de Reels de 60 segundos sobre [seu tema]. Estrutura: gancho nos 3 primeiros segundos, 3 pontos principais, CTA no final.", result: "Roteiro completo pronto para gravar." },
      { title: "Escrever e-mails de vendas", command: "Escreva uma sequência de 3 e-mails de vendas para [produto/serviço]. E-mail 1: apresentação. E-mail 2: prova social. E-mail 3: oferta com urgência.", result: "Sequência de e-mails pronta para usar." },
    ],
    tips: [
      "Use Custom Instructions para definir seu tom de voz e contexto do negócio permanentemente.",
      "Peça ao ChatGPT para assumir um papel específico: 'Aja como um especialista em marketing digital'.",
      "Use o comando 'Continue' quando a resposta for cortada por limite de caracteres.",
      "Salve prompts que funcionam bem em Projetos para reusar depois.",
    ],
  },
  Claude: {
    url: "https://claude.ai",
    useCases: [
      { title: "Analisar documentos longos", command: "Analise este documento e extraia: 1) Resumo executivo em 3 parágrafos, 2) Pontos-chave, 3) Ações recomendadas, 4) Riscos identificados.", result: "Análise estruturada do documento com insights acionáveis." },
      { title: "Criar propostas comerciais", command: "Crie uma proposta comercial para [serviço] destinada a [cliente]. Inclua: visão geral, escopo, cronograma, investimento e diferenciais.", result: "Proposta profissional pronta para personalizar e enviar." },
      { title: "Melhorar textos existentes", command: "Reescreva este texto mantendo a mensagem original mas melhorando: clareza, persuasão e escaneabilidade. Use parágrafos curtos e bullets.", result: "Texto otimizado mantendo a essência original." },
    ],
    tips: [
      "Use Projects para manter contexto entre conversas sobre o mesmo tema.",
      "O Claude é excelente para textos longos — envie documentos inteiros para análise.",
      "Peça para formatar como Markdown quando precisar de estrutura visual.",
      "Use 'Artifacts' para código, documentos e conteúdo que você quer iterar.",
    ],
  },
  "Google Gemini": {
    url: "https://gemini.google.com",
    useCases: [
      { title: "Pesquisar tendências de mercado", command: "Quais são as 5 principais tendências de [seu setor] no Brasil em 2025? Para cada uma, inclua: descrição, impacto esperado e como aproveitar.", result: "Mapeamento de tendências com ações práticas." },
      { title: "Criar conteúdo integrado com Google", command: "Crie um plano de conteúdo mensal para [negócio] com 12 posts. Para cada post: tema, formato (carrossel/vídeo/texto), legenda e melhor dia para publicar.", result: "Plano de conteúdo completo para 30 dias." },
      { title: "Resumir e organizar informações", command: "Resuma as principais informações sobre [tema] em formato de bullet points, organizadas por prioridade de implementação.", result: "Resumo estruturado e priorizado pronto para ação." },
    ],
    tips: [
      "Use a integração com Google Drive para analisar planilhas diretamente do Sheets.",
      "Ative as extensões do Gemini para acessar dados do Google Maps, YouTube e mais.",
      "Peça para criar gráficos e visualizações dos dados analisados.",
      "Use o Gemini para cruzar dados de múltiplas fontes Google automaticamente.",
    ],
  },
  "Google Gemini Sheets": {
    url: "https://sheets.google.com",
    useCases: [
      { title: "Identificar tendências nos dados", command: "Analise os dados desta planilha e identifique: 1) Tendências de crescimento, 2) Meses com melhor desempenho, 3) Correlações entre receita e número de clientes.", result: "Relatório com tendências e correlações identificadas nos dados da planilha." },
      { title: "Encontrar anomalias e oportunidades", command: "Qual mês teve o melhor desempenho e por quê? Identifique anomalias nos dados e sugira ações para replicar os melhores resultados.", result: "Análise de anomalias com recomendações acionáveis baseadas nos dados reais." },
      { title: "Gerar resumo executivo", command: "Crie um resumo executivo desses dados em formato de bullet points para apresentar à diretoria. Inclua métricas-chave, variações e recomendações.", result: "Resumo executivo profissional pronto para apresentação." },
    ],
    tips: [
      "Abra o painel do Gemini diretamente no Google Sheets para analisar seus dados sem sair da planilha.",
      "O Gemini consegue ler e interpretar os dados das suas células automaticamente.",
      "Peça para o Gemini criar fórmulas complexas baseadas nos padrões que encontrou.",
      "Use o Gemini para gerar gráficos e visualizações sugeridas a partir dos seus dados.",
    ],
  },
  "Google AI Studio": {
    url: "https://aistudio.google.com",
    useCases: [
      { title: "Criar prompts estruturados", command: "Analise o mercado de [setor] no Brasil. Estruture a resposta em: 1) Panorama geral, 2) Principais players, 3) Tendências, 4) Oportunidades para novos entrantes.", result: "Análise de mercado detalhada e estruturada." },
      { title: "Processar dados em lote", command: "Para cada item desta lista, gere: título SEO, meta description e 3 palavras-chave. Formate como tabela.", result: "Dados processados em formato tabular pronto para usar." },
      { title: "Testar e iterar prompts", command: "Compare estas duas abordagens de prompt e me diga qual gera melhores resultados para [objetivo]. Teste com 3 exemplos diferentes.", result: "Análise comparativa de prompts com recomendação." },
    ],
    tips: [
      "Use System Instructions para definir contexto permanente sem gastar tokens no prompt.",
      "Teste diferentes temperaturas: 0.3 para dados precisos, 0.9 para criatividade.",
      "O AI Studio permite enviar arquivos — use para análise de PDFs e imagens.",
      "Salve prompts que funcionam como 'Saved Prompts' para reusar em projetos futuros.",
    ],
  },
  Perplexity: {
    url: "https://perplexity.ai",
    useCases: [
      { title: "Pesquisa de mercado com fontes", command: "Quais são os principais concorrentes no mercado de [setor] no Brasil? Liste os 5 maiores, seus diferenciais e pontos fracos, com fontes.", result: "Mapeamento competitivo com dados verificáveis." },
      { title: "Análise de tendências atuais", command: "Quais são as tendências mais recentes em [tema]? Foque em dados de 2024-2025 e inclua estatísticas quando disponíveis.", result: "Relatório de tendências com dados atualizados e fontes." },
      { title: "Due diligence de ferramentas", command: "Compare [ferramenta A] vs [ferramenta B] vs [ferramenta C] para [caso de uso]. Analise: preço, funcionalidades, reviews e melhor para cada perfil.", result: "Tabela comparativa com recomendação por perfil de usuário." },
    ],
    tips: [
      "Use o modo 'Focus' para filtrar resultados: Academic para pesquisas científicas, Reddit para opinião popular.",
      "Faça perguntas de follow-up para aprofundar pontos específicos da pesquisa.",
      "Sempre verifique as fontes citadas — clique nos links para confirmar os dados.",
      "Salve pesquisas em Collections para criar um repositório de inteligência.",
    ],
  },
  Lovable: {
    url: "https://lovable.dev",
    useCases: [
      { title: "Criar landing page profissional", command: "Crie uma landing page para [produto/serviço] com: hero section, benefícios, depoimentos, FAQ e CTA. Design moderno e responsivo.", result: "Landing page completa pronta para publicar." },
      { title: "Construir dashboard de dados", command: "Crie um dashboard para visualizar [tipo de dados] com: gráficos, filtros e cards de métricas. Use cores profissionais.", result: "Dashboard interativo com visualização de dados." },
      { title: "Prototipar MVP rapidamente", command: "Crie um MVP de [ideia de app] com: tela de login, dashboard principal, e 2 funcionalidades core. Design limpo e intuitivo.", result: "Protótipo funcional para validar com usuários." },
    ],
    tips: [
      "Descreva o visual que você quer com referências: 'estilo Notion', 'como o Stripe'.",
      "Use iterações: comece simples e vá adicionando funcionalidades uma por uma.",
      "Peça responsividade explicitamente: 'funcione bem em mobile e desktop'.",
      "Exporte o código gerado para personalizar em seu próprio ambiente.",
    ],
  },
};

function detectContentVariant(data) {
  const tool = data.tool || data.tools?.[0] || "";
  const title = (data.title || "").toLowerCase();
  const description = (data.description || "").toLowerCase();
  const text = title + " " + description;

  if (tool === "Google Gemini") {
    if (/planilha|spreadsheet|sheets|dados em planilha/i.test(text)) {
      return "Google Gemini Sheets";
    }
  }
  return tool;
}

function generateFallbackContent(data) {
  const tool = data.tool || data.tools?.[0] || "IA";
  const title = data.title || "Novo Guia";
  const topic = title.toLowerCase().replace(/^como\s+(usar\s+)?/i, "").replace(/^o\s+/i, "");
  const contentVariant = detectContentVariant(data);
  const toolContent = TOOL_SPECIFIC_CONTENT[contentVariant] || TOOL_SPECIFIC_CONTENT[tool];

  const useCases = toolContent
    ? toolContent.useCases.map((uc) => ({ ...uc, result: uc.result }))
    : [
        { title: "Análise e melhoria", description: `Use o ${tool} para analisar e melhorar seu trabalho.`, command: `Analise [seu contexto] e me dê 5 sugestões práticas de melhoria com prioridade de implementação.`, result: "Lista de ações priorizadas para aplicar." },
        { title: "Geração de conteúdo", description: `Use o ${tool} para gerar conteúdo otimizado.`, command: `Crie [tipo de conteúdo] sobre [tema] focando em [objetivo]. Formato: introdução, 3 pontos principais, conclusão com CTA.`, result: "Conteúdo pronto para revisar e publicar." },
        { title: "Automação de tarefas", description: `Use o ${tool} para automatizar tarefas repetitivas.`, command: `Crie um checklist automatizado para [tarefa] que eu possa usar diariamente. Inclua: passos, tempo estimado e dicas.`, result: "Fluxo de trabalho otimizado e replicável." },
      ];

  const tips = toolContent
    ? toolContent.tips
    : [
        "Seja direto no que você quer: quanto mais claro for o pedido, melhor será a resposta.",
        "Use sempre contexto real: inclua dados específicos do seu negócio.",
        "Peça melhorias nas respostas: 'deixe mais simples', 'foco em resultados'.",
        `Use o ${tool} como apoio, não como decisão final.`,
      ];

  return {
    whatIsIt: `O ${tool} é uma ferramenta poderosa para ${topic}.\n\nNa prática, você vai usar o ${tool} como seu assistente especializado, capaz de processar informações complexas e entregar resultados prontos para aplicar.\n\nCom este guia você vai aprender:\n\n- Como configurar o ${tool} para obter os melhores resultados\n- Comandos prontos para copiar, adaptar e usar imediatamente\n- Técnicas avançadas para ir além do básico\n- Como evitar erros comuns que prejudicam os resultados`,
    whyUseIt: [
      {
        title: "Resultados em minutos",
        description: `O que normalmente levaria horas de pesquisa e trabalho manual, o ${tool} entrega em minutos com qualidade profissional.`,
      },
      {
        title: "Comandos prontos para usar",
        description: "Você não precisa saber criar prompts do zero. Cada caso de uso inclui comandos testados que você só precisa adaptar.",
      },
      {
        title: "Processo replicável",
        description: "Aprenda uma vez, use sempre. Os métodos deste guia funcionam para qualquer variação do mesmo tipo de tarefa.",
      },
    ],
    howToImplement: {
      prerequisites: contentVariant === "Google Gemini Sheets"
        ? [
            "Conta Google com acesso ao Google Planilhas (sheets.google.com)",
            "Gemini ativado no Google Workspace (painel lateral)",
            "Navegador web atualizado",
          ]
        : [
            `${tool} (conta ativa${toolContent ? ` em ${toolContent.url}` : ""})`,
            "Navegador web atualizado",
          ],
      steps: contentVariant === "Google Gemini Sheets"
        ? [
            { number: 1, title: "Abrir o Google Planilhas", description: "Acesse sheets.google.com e faça login na sua conta Google. Crie uma nova planilha ou abra uma existente com seus dados." },
            { number: 2, title: "Inserir ou organizar seus dados", description: "Insira seus dados na planilha com cabeçalhos claros na primeira linha (ex: Mês, Receita, Despesas, Lucro). Quanto mais organizados, melhores os insights." },
            { number: 3, title: "Abrir o painel do Gemini", description: "Clique no ícone do Gemini no canto superior direito da planilha para abrir o painel lateral de IA integrado." },
            { number: 4, title: "Pedir análises ao Gemini", description: "No painel do Gemini, faça perguntas sobre seus dados. Use os comandos dos casos de uso abaixo, adaptando para os dados da sua planilha." },
            { number: 5, title: "Aplicar as recomendações", description: "Use os insights do Gemini para tomar decisões. Peça para criar gráficos, fórmulas ou resumos executivos baseados na análise." },
          ]
        : [
            { number: 1, title: `Acessar o ${tool}`, description: `Abra ${toolContent ? toolContent.url : "a ferramenta"} e faça login na sua conta. Crie uma nova conversa.` },
            { number: 2, title: "Definir o contexto", description: `Na primeira mensagem, defina o contexto: seu negócio, objetivo e público-alvo. Isso melhora todas as respostas seguintes.` },
            { number: 3, title: "Executar os comandos", description: "Copie os comandos dos casos de uso abaixo, substitua os campos entre [colchetes] com suas informações e envie." },
            { number: 4, title: "Iterar e refinar", description: "Peça ajustes nas respostas: 'simplifique', 'adicione mais detalhes no ponto 2', 'formate como tabela'. Cada iteração melhora o resultado." },
          ],
    },
    useCases,
    advancedTips: tips,
    commonMistakes: [
      "Não fornecer contexto suficiente — sem dados específicos do seu negócio, os resultados ficam genéricos e inutilizáveis.",
      "Querer aplicar tudo de uma vez — comece com 1 caso de uso, domine e depois expanda.",
      "Aceitar a primeira resposta — sempre peça pelo menos uma iteração de melhoria.",
      "Não adaptar os comandos — os campos entre [colchetes] PRECISAM ser substituídos pelas suas informações reais.",
    ],
    conclusion: `O ${tool} é uma ferramenta transformadora para ${topic} quando usado com os comandos certos.\n\nCom os casos de uso deste guia, você tem um ponto de partida testado. Adapte com suas informações, execute e itere até chegar no resultado ideal.\n\nComece agora: escolha o caso de uso mais relevante para você, copie o comando, adapte e envie. Em poucos minutos você terá seu primeiro resultado concreto.`,
  };
}

export async function POST(request) {
  try {
    const data = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const prompt = buildPrompt(data);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const text = result.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return Response.json({ content: JSON.parse(jsonMatch[0]), source: "ai" });
          } catch { /* fall through to template */ }
        }
      }
    }

    return Response.json({ content: generateFallbackContent(data), source: "template" });
  } catch (err) {
    return Response.json({ content: generateFallbackContent({}), source: "fallback", error: err.message });
  }
}
