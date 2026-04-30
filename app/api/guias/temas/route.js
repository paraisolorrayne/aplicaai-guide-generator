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

function generateFallbackThemes(filters) {
  const category = filters.category || "";
  const tool = filters.tool || "";

  const themeBank = [
    {
      title: "Como usar o ChatGPT para criar posts para Instagram",
      description: "Aprenda a criar conteúdo profissional para Instagram usando o ChatGPT como assistente de criação.",
      tool: "ChatGPT",
      difficulty: "Intermediário",
      categories: ["Marketing & Redes Sociais", "Criação de Conteúdo"],
    },
    {
      title: "Como usar o Claude para organizar tarefas e projetos",
      description: "Use o Claude para estruturar e gerenciar suas tarefas diárias com mais eficiência.",
      tool: "Claude",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação"],
    },
    {
      title: "Como criar um chatbot de vendas com Manychat e Claude",
      description: "Monte um atendente virtual que qualifica leads e fecha vendas automaticamente.",
      tool: "Manychat",
      difficulty: "Intermediário",
      categories: ["Vendas & Atendimento", "Marketing & Redes Sociais"],
    },
    {
      title: "Como usar o Google Gemini para analisar planilhas",
      description: "Transforme dados brutos em insights acionáveis usando o Google Gemini.",
      tool: "Google Gemini",
      difficulty: "Iniciante",
      categories: ["Análise de Dados", "Produtividade & Automação"],
    },
    {
      title: "Como criar um site completo em 15 minutos com Lovable",
      description: "Construa um site profissional do zero usando IA, sem precisar programar.",
      tool: "Lovable",
      difficulty: "Iniciante",
      categories: ["Desenvolvimento & No-Code", "Marketing & Redes Sociais"],
    },
    {
      title: "Como usar o Perplexity para pesquisa de mercado",
      description: "Faça pesquisas profundas sobre concorrentes e tendências usando o Perplexity.",
      tool: "Perplexity",
      difficulty: "Intermediário",
      categories: ["Análise de Dados", "Marketing & Redes Sociais"],
    },
    {
      title: "Como criar roteiros de vídeo com ChatGPT",
      description: "Gere roteiros profissionais para Reels, TikTok e YouTube usando IA.",
      tool: "ChatGPT",
      difficulty: "Iniciante",
      categories: ["Criação de Conteúdo", "Marketing & Redes Sociais"],
    },
    {
      title: "Como usar o Claude para escrever e-mails de vendas",
      description: "Crie sequências de e-mails persuasivos que convertem usando o Claude.",
      tool: "Claude",
      difficulty: "Intermediário",
      categories: ["Vendas & Atendimento", "Marketing & Redes Sociais"],
    },
    {
      title: "Como automatizar relatórios com Google AI Studio",
      description: "Configure relatórios automáticos que economizam horas de trabalho manual.",
      tool: "Google AI Studio",
      difficulty: "Avançado",
      categories: ["Análise de Dados", "Produtividade & Automação"],
    },
    {
      title: "Como criar prompts profissionais para qualquer ferramenta de IA",
      description: "Domine a arte de escrever prompts que geram resultados excepcionais.",
      tool: "ChatGPT",
      difficulty: "Iniciante",
      categories: ["Produtividade & Automação", "Criação de Conteúdo"],
    },
    {
      title: "Como usar IA para criar propostas comerciais automaticamente",
      description: "Gere propostas comerciais personalizadas em minutos usando Claude.",
      tool: "Claude",
      difficulty: "Intermediário",
      categories: ["Vendas & Atendimento", "Produtividade & Automação"],
    },
    {
      title: "Como criar carrosséis virais para Instagram com IA",
      description: "Use inteligência artificial para criar carrosséis que geram engajamento.",
      tool: "ChatGPT",
      difficulty: "Intermediário",
      categories: ["Marketing & Redes Sociais", "Criação de Conteúdo"],
    },
    {
      title: "Como usar o Devin para automatizar tarefas de programação",
      description: "Automatize a criação de código, testes e deploys com o Devin.",
      tool: "Devin",
      difficulty: "Avançado",
      categories: ["Desenvolvimento & No-Code", "Produtividade & Automação"],
    },
    {
      title: "Como analisar feedbacks de clientes com Google Gemini",
      description: "Extraia insights valiosos das avaliações dos seus clientes automaticamente.",
      tool: "Google Gemini",
      difficulty: "Intermediário",
      categories: ["Análise de Dados", "Vendas & Atendimento"],
    },
    {
      title: "Como criar um assistente GPT personalizado para seu negócio",
      description: "Configure um GPT customizado que entende e responde sobre seu produto.",
      tool: "ChatGPT",
      difficulty: "Avançado",
      categories: ["Produtividade & Automação", "Vendas & Atendimento"],
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
  return shuffled.slice(0, count).map((t) => ({
    ...t,
    toolUrl: TOOL_URLS[t.tool] || "",
  }));
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
          const parsed = JSON.parse(jsonMatch[0]);
          return Response.json({ themes: parsed.themes || [], source: "ai" });
        }
      }
    }

    return Response.json({ themes: generateFallbackThemes(filters), source: "template" });
  } catch (err) {
    return Response.json({ themes: generateFallbackThemes({}), source: "fallback", error: err.message });
  }
}
