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

const TOOL_SELECTORS = {
  ChatGPT: {
    input: 'textarea[placeholder], #prompt-textarea, div[contenteditable="true"]',
    send: 'button[data-testid="send-button"], button[aria-label="Send"]',
  },
  Claude: {
    input: 'div[contenteditable="true"], textarea',
    send: 'button[aria-label="Send Message"], button:has(svg)',
  },
  "Google Gemini": {
    input: 'div[contenteditable="true"], textarea, .ql-editor',
    send: 'button[aria-label="Send message"], button.send-button',
  },
  Perplexity: {
    input: 'textarea, div[contenteditable="true"]',
    send: 'button[aria-label="Submit"]',
  },
  "Google AI Studio": {
    input: 'div[contenteditable="true"], textarea, .prompt-input',
    send: 'button[aria-label="Run"], button.run-button',
  },
  Lovable: {
    input: 'textarea, div[contenteditable="true"]',
    send: 'button[type="submit"], button:has(svg)',
  },
};

function generateStepsFromContent(guide) {
  const tool = guide.tool || guide.tools?.[0] || "ChatGPT";
  const toolUrl = TOOL_URLS[tool] || "https://chat.openai.com";
  const selectors = TOOL_SELECTORS[tool] || TOOL_SELECTORS.ChatGPT;
  const content = guide.content || {};
  const steps = [];

  steps.push({
    action: "navigate",
    url: toolUrl,
    description: `Abrir ${tool}`,
    pauseAfter: 3000,
  });

  steps.push({
    action: "wait",
    duration: 3000,
    description: `Aguardar ${tool} carregar completamente`,
  });

  const useCases = content.useCases || [];
  const howToSteps = content.howToImplement?.steps || [];

  if (useCases.length > 0 || howToSteps.length > 0) {
    const firstCommand = useCases[0]?.command || `${howToSteps[0]?.description || guide.title}`;

    steps.push({
      action: "click",
      selector: selectors.input,
      description: "Clicar no campo de entrada",
      pauseAfter: 1000,
    });

    steps.push({
      action: "type",
      selector: selectors.input,
      text: firstCommand,
      description: "Digitar contexto inicial do guia",
      pauseAfter: 1500,
    });

    steps.push({
      action: "press",
      key: "Enter",
      description: "Enviar mensagem",
      pauseAfter: 5000,
    });

    steps.push({
      action: "wait",
      duration: 5000,
      description: "Aguardar resposta da IA",
    });

    steps.push({
      action: "scroll",
      distance: 400,
      description: "Rolar para ver a resposta",
      pauseAfter: 2000,
    });
  }

  for (let i = 0; i < Math.min(useCases.length, 3); i++) {
    const uc = useCases[i];
    const commandText = uc.command || uc.description || `Demonstrar: ${uc.title}`;

    steps.push({
      action: "click",
      selector: selectors.input,
      description: `Clicar no campo para caso de uso: ${uc.title}`,
      pauseAfter: 1000,
    });

    steps.push({
      action: "type",
      selector: selectors.input,
      text: commandText,
      description: `Digitar comando: ${uc.title}`,
      pauseAfter: 1500,
    });

    steps.push({
      action: "press",
      key: "Enter",
      description: "Enviar comando",
      pauseAfter: 5000,
    });

    steps.push({
      action: "wait",
      duration: 6000,
      description: `Aguardar resposta para: ${uc.title}`,
    });

    steps.push({
      action: "scroll",
      distance: 500,
      description: `Rolar para ver resultado: ${uc.title}`,
      pauseAfter: 2000,
    });

    steps.push({
      action: "screenshot",
      path: `screenshot-caso-${i + 1}.png`,
      description: `Capturar resultado do caso ${i + 1}`,
      pauseAfter: 1000,
    });
  }

  if (howToSteps.length > 1) {
    for (let i = 1; i < Math.min(howToSteps.length, 4); i++) {
      const step = howToSteps[i];

      steps.push({
        action: "click",
        selector: selectors.input,
        description: `Executar passo ${step.number || i + 1}: ${step.title}`,
        pauseAfter: 1000,
      });

      steps.push({
        action: "type",
        selector: selectors.input,
        text: step.description,
        description: `Digitar instrução do passo ${step.number || i + 1}`,
        pauseAfter: 1500,
      });

      steps.push({
        action: "press",
        key: "Enter",
        description: "Enviar",
        pauseAfter: 5000,
      });

      steps.push({
        action: "wait",
        duration: 5000,
        description: `Aguardar resposta do passo ${step.number || i + 1}`,
      });

      steps.push({
        action: "scroll",
        distance: 400,
        description: "Rolar para ver resposta",
        pauseAfter: 2000,
      });
    }
  }

  steps.push({
    action: "scroll",
    distance: -9999,
    description: "Voltar ao topo para visão geral",
    pauseAfter: 2000,
  });

  steps.push({
    action: "screenshot",
    path: "screenshot-final.png",
    description: "Captura final da demonstração",
    pauseAfter: 1000,
  });

  steps.push({
    action: "wait",
    duration: 3000,
    description: "Pausa final antes de encerrar a gravação",
  });

  return steps;
}

export async function POST(request) {
  try {
    const guide = await request.json();

    if (!guide.title) {
      return Response.json({ error: "Título do guia obrigatório" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && guide.content) {
      const tool = guide.tool || guide.tools?.[0] || "ChatGPT";
      const toolUrl = TOOL_URLS[tool] || "https://chat.openai.com";
      const selectors = TOOL_SELECTORS[tool] || TOOL_SELECTORS.ChatGPT;

      const prompt = `Dado este guia, gere passos de automação Playwright para simular a execução do guia no navegador.

GUIA: ${guide.title}
FERRAMENTA: ${tool}
URL: ${toolUrl}
SELETORES: input=${selectors.input}, send=${selectors.send}

CONTEÚDO:
${JSON.stringify(guide.content, null, 2).slice(0, 2000)}

Gere um array de passos. Cada passo tem: action (navigate/click/type/wait/scroll/press/screenshot), description, e campos específicos (url, selector, text, duration, distance, key, path).

Responda SOMENTE com JSON: { "steps": [...] }`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Gere passos de automação Playwright realistas. Responda em JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
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
            if (parsed.steps?.length > 0) {
              return Response.json({ steps: parsed.steps, source: "ai" });
            }
          } catch { /* fall through to template */ }
        }
      }
    }

    const steps = generateStepsFromContent(guide);
    return Response.json({ steps, source: "template" });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
