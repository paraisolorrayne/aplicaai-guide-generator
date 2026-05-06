const SYSTEM_PROMPT = `Você é um especialista em criar temas de guias práticos sobre IA para a plataforma AplicaAI.
Gere temas em português brasileiro. Sempre responda em JSON válido.`;

const TOOL_URLS = {
  ChatGPT: "https://chat.openai.com",
  Claude: "https://claude.ai",
  "Google Gemini": "https://gemini.google.com",
  "Google AI Studio": "https://aistudio.google.com",
  Perplexity: "https://perplexity.ai",
  Lovable: "https://lovable.dev",
  Manychat: "https://manychat.com",
  "Carrossel Pro": "https://aplicaai.org",
  "Construtor de Carrosséis": "https://aplicaai.org",
  Devin: "https://devin.ai",
};

// Which tools can be recorded without login or Cloudflare issues
const TOOL_RECORDING_STATUS = {
  ChatGPT: { recordable: true, notes: "Funciona sem login para prompts básicos" },
  Claude: { recordable: false, notes: "Requer login obrigatório" },
  "Google Gemini": { recordable: true, notes: "Funciona sem login" },
  "Google AI Studio": { recordable: false, notes: "Requer login Google" },
  Perplexity: { recordable: false, notes: "Bloqueado por Cloudflare" },
  Lovable: { recordable: false, notes: "Requer login" },
  Manychat: { recordable: false, notes: "Requer login" },
  Devin: { recordable: false, notes: "Requer login" },
};

function generateFallbackThemes(filters) {
  const category = filters.category || "";
  const tool = filters.tool || "";

  const themeBank = [
    // === ChatGPT ===
    {
      title: "Como usar o ChatGPT para criar posts para Instagram",
      description: "Aprenda a criar legendas persuasivas, hashtags estratégicas e CTAs que convertem para seus posts no Instagram.",
      tool: "ChatGPT",
      difficulty: "Iniciante",
      categories: ["Marketing & Redes Sociais", "Criação de Conteúdo"],
    },
    {
      title: "Como criar roteiros de Reels e TikTok com ChatGPT",
      description: "Gere roteiros profissionais com gancho, desenvolvimento e CTA para vídeos curtos que viralizam.",
      tool: "ChatGPT",
      difficulty: "Iniciante",
      categories: ["Criação de Conteúdo", "Marketing & Redes Sociais"],
    },
    {
      title: "Como usar os projetos dentro do ChatGPT para organizar seu trabalho",
      description: "Aprenda a usar Projects no ChatGPT para manter contexto e reutilizar prompts entre conversas.",
      tool: "ChatGPT",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação"],
    },
    {
      title: "Como criar um assistente GPT personalizado para seu negócio",
      description: "Configure um GPT customizado que entende e responde sobre seu produto ou serviço automaticamente.",
      tool: "ChatGPT",
      difficulty: "Avançado",
      categories: ["Produtividade & Automação", "Vendas & Atendimento"],
    },
    {
      title: "Como usar o ChatGPT para escrever e-mails profissionais em segundos",
      description: "Crie e-mails persuasivos de vendas, follow-up e atendimento com prompts prontos.",
      tool: "ChatGPT",
      difficulty: "Iniciante",
      categories: ["Vendas & Atendimento", "Produtividade & Automação"],
    },
    {
      title: "Como gerar ideias de conteúdo para 30 dias usando o ChatGPT",
      description: "Monte um calendário editorial completo com temas, formatos e CTAs para um mês inteiro.",
      tool: "ChatGPT",
      difficulty: "Intermediário",
      categories: ["Marketing & Redes Sociais", "Criação de Conteúdo"],
    },
    {
      title: "Como usar o ChatGPT para criar descrições de produtos que vendem",
      description: "Escreva descrições persuasivas para e-commerce e catálogos que aumentam a conversão.",
      tool: "ChatGPT",
      difficulty: "Intermediário",
      categories: ["Vendas & Atendimento", "Criação de Conteúdo"],
    },
    {
      title: "Como criar prompts profissionais para qualquer ferramenta de IA",
      description: "Domine a arte de escrever prompts que geram resultados excepcionais em qualquer IA.",
      tool: "ChatGPT",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação", "Criação de Conteúdo"],
    },
    // === Claude ===
    {
      title: "Como usar o Claude para organizar tarefas e projetos",
      description: "Use o Claude para estruturar e gerenciar suas tarefas diárias com mais eficiência.",
      tool: "Claude",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação"],
    },
    {
      title: "Como usar o Claude para melhorar o SEO do seu negócio",
      description: "Analise concorrentes, encontre palavras-chave e otimize seu site com comandos prontos no Claude.",
      tool: "Claude",
      difficulty: "Intermediário",
      categories: ["Marketing & Redes Sociais", "Análise de Dados"],
    },
    {
      title: "Como criar propostas comerciais profissionais usando o Claude",
      description: "Gere propostas personalizadas com escopo, cronograma e investimento em minutos.",
      tool: "Claude",
      difficulty: "Intermediário",
      categories: ["Vendas & Atendimento", "Produtividade & Automação"],
    },
    {
      title: "Como usar o Claude para escrever e-mails de vendas que convertem",
      description: "Crie sequências de e-mails persuasivos com copy profissional usando o Claude.",
      tool: "Claude",
      difficulty: "Intermediário",
      categories: ["Vendas & Atendimento", "Marketing & Redes Sociais"],
    },
    {
      title: "Como criar e usar SKILLS no Claude para automatizar tarefas",
      description: "Configure skills personalizadas no Claude para repetir processos com qualidade consistente.",
      tool: "Claude",
      difficulty: "Intermediário",
      categories: ["Produtividade & Automação"],
    },
    {
      title: "Como usar o Claude para analisar contratos e documentos jurídicos",
      description: "Extraia cláusulas importantes, riscos e resumos de documentos longos com o Claude.",
      tool: "Claude",
      difficulty: "Avançado",
      categories: ["Análise de Dados", "Produtividade & Automação"],
    },
    {
      title: "Como usar Projects no Claude para turbinar sua rotina",
      description: "Organize projetos com contexto persistente para obter respostas cada vez mais precisas.",
      tool: "Claude",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação"],
    },
    {
      title: "Como criar carrosséis para Instagram usando o Claude",
      description: "Gere textos e estrutura de carrosséis que engajam usando o Claude como assistente.",
      tool: "Claude",
      difficulty: "Intermediário",
      categories: ["Marketing & Redes Sociais", "Criação de Conteúdo"],
    },
    // === Google Gemini ===
    {
      title: "Como usar o Google Gemini para analisar planilhas",
      description: "Transforme dados brutos em insights acionáveis usando o Gemini integrado ao Google Planilhas.",
      tool: "Google Gemini",
      difficulty: "Iniciante",
      categories: ["Análise de Dados", "Produtividade & Automação"],
      workflow: "gemini-sheets",
      requiresLogin: true,
    },
    {
      title: "Como usar o Google Gemini para pesquisar tendências de mercado",
      description: "Faça pesquisas de mercado detalhadas com dados atualizados usando o Gemini.",
      tool: "Google Gemini",
      difficulty: "Intermediário",
      categories: ["Análise de Dados", "Marketing & Redes Sociais"],
    },
    {
      title: "Como analisar feedbacks de clientes com Google Gemini",
      description: "Extraia insights valiosos das avaliações dos seus clientes automaticamente.",
      tool: "Google Gemini",
      difficulty: "Intermediário",
      categories: ["Análise de Dados", "Vendas & Atendimento"],
    },
    {
      title: "Como usar o Gemini para criar planos de conteúdo mensais",
      description: "Gere calendários editoriais completos com sugestões de posts, formatos e horários.",
      tool: "Google Gemini",
      difficulty: "Iniciante",
      categories: ["Marketing & Redes Sociais", "Criação de Conteúdo"],
    },
    {
      title: "Como usar o Google Gemini para resumir e-mails e reuniões",
      description: "Economize tempo extraindo os pontos principais de e-mails longos e notas de reuniões.",
      tool: "Google Gemini",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação"],
      workflow: "gemini-gmail",
      requiresLogin: true,
    },
    {
      title: "Como usar o Gemini integrado ao Google Workspace",
      description: "Aproveite o Gemini dentro do Gmail, Docs e Sheets para automatizar tarefas do dia a dia.",
      tool: "Google Gemini",
      difficulty: "Intermediário",
      categories: ["Produtividade & Automação"],
      workflow: "gemini-workspace",
      requiresLogin: true,
    },
    // === Google AI Studio ===
    {
      title: "Como usar o Google AI Studio para criar prompts avançados",
      description: "Teste e otimize prompts com controle de temperatura, tokens e system instructions.",
      tool: "Google AI Studio",
      difficulty: "Intermediário",
      categories: ["Produtividade & Automação", "Criação de Conteúdo"],
    },
    {
      title: "Como automatizar relatórios com Google AI Studio",
      description: "Configure relatórios automáticos que economizam horas de trabalho manual.",
      tool: "Google AI Studio",
      difficulty: "Avançado",
      categories: ["Análise de Dados", "Produtividade & Automação"],
    },
    {
      title: "Como processar documentos e PDFs com o Google AI Studio",
      description: "Envie PDFs e imagens para extrair dados, resumos e insights automaticamente.",
      tool: "Google AI Studio",
      difficulty: "Intermediário",
      categories: ["Análise de Dados", "Produtividade & Automação"],
    },
    // === Perplexity ===
    {
      title: "Como usar o Perplexity para pesquisa de mercado",
      description: "Faça pesquisas profundas sobre concorrentes e tendências com fontes verificáveis.",
      tool: "Perplexity",
      difficulty: "Intermediário",
      categories: ["Análise de Dados", "Marketing & Redes Sociais"],
    },
    {
      title: "Como usar o Perplexity para análise competitiva",
      description: "Mapeie concorrentes, estratégias e diferenciais usando pesquisa com fontes.",
      tool: "Perplexity",
      difficulty: "Intermediário",
      categories: ["Análise de Dados", "Vendas & Atendimento"],
    },
    {
      title: "Como utilizar o Perplexity e seu navegador para pesquisas avançadas",
      description: "Explore os modos de foco e o navegador integrado para pesquisas especializadas.",
      tool: "Perplexity",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação", "Análise de Dados"],
    },
    // === Lovable ===
    {
      title: "Como criar um site completo em 15 minutos com Lovable",
      description: "Construa um site profissional do zero usando IA sem precisar programar.",
      tool: "Lovable",
      difficulty: "Iniciante",
      categories: ["Desenvolvimento & No-Code", "Marketing & Redes Sociais"],
    },
    {
      title: "Como criar um gerador de carrosséis para Instagram usando Lovable",
      description: "Construa uma ferramenta web que gera carrosséis automaticamente.",
      tool: "Lovable",
      difficulty: "Intermediário",
      categories: ["Desenvolvimento & No-Code", "Marketing & Redes Sociais", "Criação de Conteúdo"],
    },
    {
      title: "Como criar uma calculadora personalizada usando o Lovable",
      description: "Construa ferramentas de cálculo para seu negócio sem escrever código.",
      tool: "Lovable",
      difficulty: "Intermediário",
      categories: ["Desenvolvimento & No-Code"],
    },
    {
      title: "Como criar uma landing page que converte usando Lovable",
      description: "Construa landing pages profissionais com formulários e CTAs otimizados.",
      tool: "Lovable",
      difficulty: "Iniciante",
      categories: ["Desenvolvimento & No-Code", "Marketing & Redes Sociais"],
    },
    // === Manychat ===
    {
      title: "Como criar um chatbot de vendas com Manychat e Claude",
      description: "Monte um atendente virtual que qualifica leads e fecha vendas automaticamente no Instagram e WhatsApp.",
      tool: "Manychat",
      difficulty: "Intermediário",
      categories: ["Vendas & Atendimento", "Marketing & Redes Sociais"],
    },
    {
      title: "Como automatizar respostas no Instagram com Manychat",
      description: "Configure automações para responder comentários, DMs e stories automaticamente.",
      tool: "Manychat",
      difficulty: "Iniciante",
      categories: ["Marketing & Redes Sociais", "Vendas & Atendimento"],
    },
    // === Devin ===
    {
      title: "Como usar o Devin para automatizar tarefas de programação",
      description: "Automatize a criação de código, testes e deploys com o Devin.",
      tool: "Devin",
      difficulty: "Avançado",
      categories: ["Desenvolvimento & No-Code", "Produtividade & Automação"],
    },
  ];

  let filtered = themeBank;
  if (category) {
    filtered = filtered.filter((t) => t.categories.some((c) => c.includes(category)));
  }
  if (tool) {
    filtered = filtered.filter((t) => t.tool.toLowerCase().includes(tool.toLowerCase()));
  }

  if (filtered.length === 0) filtered = themeBank;

  const count = filters.count ? Math.min(parseInt(filters.count) || 5, 15) : 5;
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((t) => {
    const toolStatus = TOOL_RECORDING_STATUS[t.tool] || {};
    const needsLogin = t.requiresLogin || !toolStatus.recordable;
    return {
      ...t,
      toolUrl: TOOL_URLS[t.tool] || "",
      recordable: !needsLogin,
      workflow: t.workflow || "default",
      recordingNotes: needsLogin
        ? (t.requiresLogin ? "Requer login Google (Sheets/Gmail/Docs)" : toolStatus.notes || "Requer login")
        : toolStatus.notes || "Gravável sem login",
    };
  });
}

export async function POST(request) {
  try {
    const filters = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const prompt = `Gere ${filters.count || 5} temas de guias práticos para a plataforma AplicaAI.
${filters.category ? `Categoria: ${filters.category}` : ""}
${filters.tool ? `Ferramenta: ${filters.tool}` : ""}

Cada tema deve ter: title, description, tool (ferramenta principal), difficulty (Iniciante/Intermediário/Avançado), categories (array).
Ferramentas disponíveis: ChatGPT, Claude, Google Gemini, Google AI Studio, Perplexity, Lovable, Manychat, Devin.
Categorias: Marketing & Redes Sociais, Produtividade & Automação, Vendas & Atendimento, Criação de Conteúdo, Análise de Dados, Desenvolvimento & No-Code.

Responda SOMENTE com JSON: { "themes": [...] }`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.9,
          max_tokens: 3000,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const text = result.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.themes?.length > 0) {
              return Response.json({ themes: parsed.themes, source: "ai" });
            }
          } catch { /* fall through to template */ }
        }
      }
    }

    return Response.json({ themes: generateFallbackThemes(filters), source: "template" });
  } catch (err) {
    return Response.json({ themes: generateFallbackThemes({}), source: "fallback", error: err.message });
  }
}
