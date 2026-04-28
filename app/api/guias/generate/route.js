const SYSTEM_PROMPT = `Você é um especialista em criar guias práticos sobre IA para a plataforma AplicaAI.
Gere conteúdo em português brasileiro, acessível e prático. Sempre responda em JSON válido.`;

function buildPrompt(data) {
  const tool = data.tools?.[0] || "IA";
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

function generateFallbackContent(data) {
  const tool = data.tools?.[0] || "IA";
  const title = data.title || "Novo Guia";
  const topic = title.toLowerCase().replace(/^como\s+/i, "");

  return {
    whatIsIt: `Essa é uma forma prática de usar o ${tool} para ${topic}.\n\nNa prática, você vai aprender a usar o ${tool} como seu assistente para automatizar tarefas e obter resultados profissionais de forma rápida.\n\nEm vez de depender de tentativa e erro, você terá um processo claro e replicável:\n\n- Clareza sobre o que fazer em cada etapa\n- Comandos prontos para copiar e usar\n- Resultados práticos e aplicáveis`,
    whyUseIt: [
      {
        title: "Mais clareza nas decisões",
        description: `Você deixa de adivinhar o que fazer e começa a agir com base em resultados reais usando o ${tool}.`,
      },
      {
        title: "Mais velocidade",
        description: `O que normalmente levaria horas de trabalho manual, o ${tool} organiza em poucos minutos.`,
      },
      {
        title: "Resultados concretos",
        description: "Você foca em ações que geram impacto real, não apenas teoria.",
      },
    ],
    howToImplement: {
      prerequisites: [
        `${tool} (conta ativa)`,
        "Navegador web atualizado",
      ],
      steps: [
        { number: 1, title: "Configurar o ambiente", description: `Acesse o ${tool} e crie um novo projeto ou conversa.` },
        { number: 2, title: "Definir seus dados", description: "Prepare as informações específicas do seu negócio/projeto." },
        { number: 3, title: "Executar os comandos", description: "Copie e adapte cada comando com suas informações específicas." },
        { number: 4, title: "Analisar e aplicar", description: "Revise as respostas e aplique as melhorias sugeridas." },
      ],
    },
    useCases: [
      { title: "Análise e melhoria", description: `Use o ${tool} para analisar e melhorar seu trabalho.`, command: "Analise [seu contexto] e me dê 5 sugestões práticas de melhoria.", result: "Lista de ações priorizadas para aplicar." },
      { title: "Geração de conteúdo", description: `Use o ${tool} para gerar conteúdo otimizado.`, command: "Crie [tipo de conteúdo] sobre [tema] focando em [objetivo].", result: "Conteúdo pronto para revisar e publicar." },
      { title: "Automação de tarefas", description: `Use o ${tool} para automatizar tarefas repetitivas.`, command: "Crie um processo para [tarefa] que eu possa usar diariamente.", result: "Fluxo de trabalho otimizado e replicável." },
    ],
    advancedTips: [
      "Seja direto no que você quer: quanto mais claro for o pedido, melhor será a resposta.",
      "Use sempre contexto real: inclua dados específicos do seu negócio.",
      "Peça melhorias nas respostas: \"deixe mais simples\", \"foco em resultados\".",
      `Use o ${tool} como apoio, não como decisão final.`,
    ],
    commonMistakes: [
      "Não fornecer contexto suficiente — sem dados específicos, os resultados ficam genéricos.",
      "Querer aplicar tudo de uma vez — comece pelo básico e evolua.",
      "Não revisar as respostas — sempre valide antes de aplicar.",
      "Ignorar a iteração — peça ajustes nas respostas iniciais.",
    ],
    conclusion: `Usar o ${tool} para ${topic} é uma forma simples de obter resultados profissionais de maneira mais rápida.\n\nVocê não precisa mais depender de suposições. Com poucos comandos, você entende o que fazer e onde melhorar.\n\nComece com o primeiro passo, execute os comandos iniciais e aplique as melhorias. Com consistência, seus resultados vão evoluir rapidamente.`,
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
          return Response.json({ content: JSON.parse(jsonMatch[0]), source: "ai" });
        }
      }
    }

    return Response.json({ content: generateFallbackContent(data), source: "template" });
  } catch (err) {
    return Response.json({ content: generateFallbackContent({}), source: "fallback", error: err.message });
  }
}
