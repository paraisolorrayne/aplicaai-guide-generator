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

// --- Workflow system: each guide theme maps to a specific browser workflow ---

const WORKFLOW_KEYWORDS = [
  {
    id: "gemini-sheets",
    tool: "Google Gemini",
    keywords: ["planilha", "spreadsheet", "sheets", "dados em planilha", "analisar planilha"],
    titlePatterns: [/planilha/i, /spreadsheet/i, /sheets/i],
  },
  {
    id: "gemini-gmail",
    tool: "Google Gemini",
    keywords: ["e-mail", "email", "gmail", "resumir e-mail"],
    titlePatterns: [/e-?mail/i, /gmail/i],
  },
  {
    id: "gemini-docs",
    tool: "Google Gemini",
    keywords: ["documento", "docs", "google docs", "redação"],
    titlePatterns: [/documento/i, /google docs/i],
  },
  {
    id: "gemini-workspace",
    tool: "Google Gemini",
    keywords: ["workspace", "integrado", "gmail, docs e sheets"],
    titlePatterns: [/workspace/i, /integrado/i],
  },
];

function detectWorkflow(guide) {
  const tool = guide.tool || guide.tools?.[0] || "";
  const title = (guide.title || "").toLowerCase();
  const description = (guide.description || "").toLowerCase();
  const text = title + " " + description;

  for (const wf of WORKFLOW_KEYWORDS) {
    if (wf.tool !== tool) continue;
    for (const pattern of wf.titlePatterns) {
      if (pattern.test(title) || pattern.test(description)) return wf.id;
    }
    for (const kw of wf.keywords) {
      if (text.includes(kw.toLowerCase())) return wf.id;
    }
  }

  return "default";
}

// Sample data for spreadsheet demonstrations
const SAMPLE_SPREADSHEET_DATA = [
  ["Mês", "Receita", "Despesas", "Lucro", "Clientes Novos"],
  ["Janeiro", "45000", "32000", "13000", "28"],
  ["Fevereiro", "52000", "35000", "17000", "34"],
  ["Março", "48000", "30000", "18000", "31"],
  ["Abril", "61000", "38000", "23000", "42"],
  ["Maio", "55000", "36000", "19000", "37"],
  ["Junho", "67000", "41000", "26000", "48"],
];

function generateSheetsGeminiSteps(guide) {
  const content = guide.content || {};
  const useCases = content.useCases || [];
  const steps = [];

  // 1. Navigate to Google Sheets
  steps.push({
    action: "navigate",
    url: "https://sheets.google.com",
    description: "Abrir Google Planilhas",
    pauseAfter: 4000,
  });

  steps.push({
    action: "wait",
    duration: 3000,
    description: "Aguardar Google Planilhas carregar",
  });

  // 2. Create a new spreadsheet
  steps.push({
    action: "click",
    selector: '[aria-label="Em branco"], .docs-homescreen-templates-templateview-preview:first-child, a[href*="create"], .action-button-wrapper button',
    description: "Criar nova planilha em branco",
    pauseAfter: 4000,
  });

  steps.push({
    action: "wait",
    duration: 4000,
    description: "Aguardar nova planilha abrir",
  });

  // 3. Rename the spreadsheet
  steps.push({
    action: "click",
    selector: 'input.docs-title-input, .docs-title-widget input, [aria-label="Rename"]',
    description: "Clicar no título da planilha para renomear",
    pauseAfter: 1000,
  });

  steps.push({
    action: "keyboard_shortcut",
    keys: ["Control", "a"],
    description: "Selecionar título atual",
    pauseAfter: 500,
  });

  steps.push({
    action: "type",
    text: "Análise de Dados - Demonstração AplicaAI",
    description: "Digitar novo título da planilha",
    pauseAfter: 1500,
  });

  steps.push({
    action: "press",
    key: "Enter",
    description: "Confirmar título",
    pauseAfter: 1000,
  });

  // 4. Fill the spreadsheet with sample data
  steps.push({
    action: "click",
    selector: 'td.cell:first-child, [data-row="0"][data-col="0"], .cell-input',
    description: "Clicar na célula A1",
    fallbackAction: "click_coordinates",
    fallbackX: 100,
    fallbackY: 250,
    pauseAfter: 500,
  });

  // Fill cells with sample data
  for (let row = 0; row < SAMPLE_SPREADSHEET_DATA.length; row++) {
    for (let col = 0; col < SAMPLE_SPREADSHEET_DATA[row].length; col++) {
      const cellValue = SAMPLE_SPREADSHEET_DATA[row][col];
      steps.push({
        action: "type",
        text: cellValue,
        description: `Preencher célula ${String.fromCharCode(65 + col)}${row + 1}: ${cellValue}`,
        pauseAfter: 200,
      });
      steps.push({
        action: "press",
        key: "Tab",
        description: "Mover para próxima célula",
        pauseAfter: 150,
      });
    }
    // After each row, press Enter to go to next row start
    if (row < SAMPLE_SPREADSHEET_DATA.length - 1) {
      steps.push({
        action: "press",
        key: "Enter",
        description: "Mover para próxima linha",
        pauseAfter: 150,
      });
      // Go back to column A
      steps.push({
        action: "press",
        key: "Home",
        description: "Voltar para coluna A",
        pauseAfter: 150,
      });
    }
  }

  steps.push({
    action: "wait",
    duration: 2000,
    description: "Dados inseridos na planilha",
  });

  steps.push({
    action: "screenshot",
    path: "screenshot-dados-planilha.png",
    description: "Capturar planilha com dados de exemplo",
    pauseAfter: 1000,
  });

  // 5. Open the Gemini sidebar
  steps.push({
    action: "click",
    selector: 'button[aria-label*="Gemini"], [data-tooltip*="Gemini"], .docs-gemini-button, button[aria-label*="Ask Gemini"], #gemini-button',
    description: "Abrir painel lateral do Gemini no Sheets",
    pauseAfter: 3000,
  });

  steps.push({
    action: "wait",
    duration: 3000,
    description: "Aguardar painel do Gemini abrir",
  });

  steps.push({
    action: "screenshot",
    path: "screenshot-gemini-sidebar.png",
    description: "Capturar painel Gemini aberto",
    pauseAfter: 1000,
  });

  // 6. Interact with Gemini sidebar using guide content
  const geminiSidebarInput = 'div[contenteditable="true"], textarea, [aria-label*="Ask Gemini"], .gemini-input textarea';

  // First prompt: analyze the data
  const firstPrompt = useCases[0]?.command ||
    "Analise os dados desta planilha e me diga: quais são as tendências principais, anomalias e os 3 principais insights acionáveis?";

  steps.push({
    action: "click",
    selector: geminiSidebarInput,
    description: "Clicar no campo de entrada do Gemini",
    pauseAfter: 1000,
  });

  steps.push({
    action: "type",
    selector: geminiSidebarInput,
    text: firstPrompt,
    description: "Pedir ao Gemini para analisar os dados da planilha",
    pauseAfter: 2000,
  });

  steps.push({
    action: "press",
    key: "Enter",
    description: "Enviar pergunta ao Gemini",
    pauseAfter: 8000,
  });

  steps.push({
    action: "wait",
    duration: 8000,
    description: "Aguardar análise do Gemini",
  });

  steps.push({
    action: "screenshot",
    path: "screenshot-gemini-analise-1.png",
    description: "Capturar primeira análise do Gemini",
    pauseAfter: 1500,
  });

  // Additional use case prompts (use cases 1 and 2)
  const additionalPrompts = [
    useCases[1]?.command || "Qual mês teve o melhor desempenho e por quê? Sugira ações para replicar esse resultado.",
    useCases[2]?.command || "Crie um resumo executivo desses dados em formato de bullet points para apresentar à diretoria.",
  ];

  for (let i = 0; i < additionalPrompts.length; i++) {
    steps.push({
      action: "click",
      selector: geminiSidebarInput,
      description: `Clicar no campo para próxima pergunta`,
      pauseAfter: 1000,
    });

    steps.push({
      action: "type",
      selector: geminiSidebarInput,
      text: additionalPrompts[i],
      description: `Fazer pergunta ${i + 2} ao Gemini sobre os dados`,
      pauseAfter: 2000,
    });

    steps.push({
      action: "press",
      key: "Enter",
      description: "Enviar pergunta",
      pauseAfter: 8000,
    });

    steps.push({
      action: "wait",
      duration: 8000,
      description: `Aguardar resposta ${i + 2} do Gemini`,
    });

    steps.push({
      action: "scroll",
      distance: 300,
      selector: ".gemini-panel, .companion-panel, [role='complementary']",
      description: "Rolar painel do Gemini para ver resposta completa",
      pauseAfter: 1500,
    });

    steps.push({
      action: "screenshot",
      path: `screenshot-gemini-analise-${i + 2}.png`,
      description: `Capturar análise ${i + 2} do Gemini`,
      pauseAfter: 1000,
    });
  }

  // 7. Final overview
  steps.push({
    action: "scroll",
    distance: -9999,
    description: "Voltar ao topo",
    pauseAfter: 2000,
  });

  steps.push({
    action: "screenshot",
    path: "screenshot-final.png",
    description: "Captura final: planilha com dados + painel Gemini",
    pauseAfter: 1000,
  });

  steps.push({
    action: "wait",
    duration: 3000,
    description: "Pausa final antes de encerrar a gravação",
  });

  return steps;
}

function generateDefaultChatSteps(guide) {
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
  const firstCommand = useCases[0]?.command || howToSteps[0]?.description || guide.title;
  const usedFirstUseCase = useCases.length > 0 && firstCommand === useCases[0]?.command;

  if (useCases.length > 0 || howToSteps.length > 0) {
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

  const useCaseStart = usedFirstUseCase ? 1 : 0;
  for (let i = useCaseStart; i < Math.min(useCases.length, 3 + useCaseStart); i++) {
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

function generateStepsFromContent(guide) {
  const workflow = detectWorkflow(guide);

  switch (workflow) {
    case "gemini-sheets":
      return generateSheetsGeminiSteps(guide);
    case "gemini-gmail":
    case "gemini-docs":
    case "gemini-workspace":
      // Future: implement Gmail/Docs/Workspace-specific workflows
      // For now, fall through to default chat with appropriate URL
      return generateDefaultChatSteps(guide);
    default:
      return generateDefaultChatSteps(guide);
  }
}

export async function POST(request) {
  try {
    const guide = await request.json();

    if (!guide.title) {
      return Response.json({ error: "Título do guia obrigatório" }, { status: 400 });
    }

    const workflow = detectWorkflow(guide);
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && guide.content) {
      const tool = guide.tool || guide.tools?.[0] || "ChatGPT";
      const toolUrl = TOOL_URLS[tool] || "https://chat.openai.com";
      const selectors = TOOL_SELECTORS[tool] || TOOL_SELECTORS.ChatGPT;

      const workflowContext = workflow !== "default"
        ? `\nWORKFLOW ESPECÍFICO: ${workflow} — gere passos que reflitam o uso real da ferramenta no contexto do guia (ex: para "gemini-sheets", navegue ao Google Sheets, insira dados, use o painel Gemini dentro do Sheets).`
        : "";

      const prompt = `Dado este guia, gere passos de automação Playwright para simular a execução do guia no navegador.

GUIA: ${guide.title}
FERRAMENTA: ${tool}
URL: ${toolUrl}
SELETORES: input=${selectors.input}, send=${selectors.send}${workflowContext}

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
              return Response.json({ steps: parsed.steps, source: "ai", workflow });
            }
          } catch { /* fall through to template */ }
        }
      }
    }

    const steps = generateStepsFromContent(guide);
    return Response.json({ steps, source: "template", workflow });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
