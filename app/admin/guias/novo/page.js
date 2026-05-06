"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";
import g from "../guias.module.css";

const CATEGORIES = [
  "Marketing & Redes Sociais", "Produtividade & Automação",
  "Vendas & Atendimento", "Criação de Conteúdo",
  "Análise de Dados", "Desenvolvimento & No-Code",
];
const DIFFICULTIES = ["Iniciante", "Intermediário", "Avançado"];
const TOOLS = [
  "ChatGPT", "Claude", "Google Gemini", "Google AI Studio",
  "Perplexity", "Lovable", "Manychat", "Carrossel Pro",
  "Construtor de Carrosséis", "Devin",
];
const STEP_ACTIONS = [
  { value: "navigate", label: "Navegar para URL" },
  { value: "click", label: "Clicar em elemento" },
  { value: "type", label: "Digitar texto" },
  { value: "wait", label: "Aguardar" },
  { value: "scroll", label: "Rolar página" },
  { value: "press", label: "Pressionar tecla" },
  { value: "screenshot", label: "Capturar tela" },
];

export default function NovoGuia() {
  const router = useRouter();
  const [tab, setTab] = useState("themes");
  const [generating, setGenerating] = useState(false);
  const [generatingSteps, setGeneratingSteps] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const savedIdRef = useRef(null);

  const [themes, setThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [themeCategory, setThemeCategory] = useState("");
  const [themeTool, setThemeTool] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", difficulty: "Iniciante",
    categories: [], tools: [],
    author: { name: "Lorrayne Paraiso", initials: "LP" },
    content: null,
    recording: { steps: [], status: "pending", videoUrl: null },
  });

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const toggle = (field, item) => setForm((p) => {
    const arr = p[field] || [];
    return { ...p, [field]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] };
  });

  const pipelineStep = !form.title ? 0
    : !form.content ? 1
    : form.recording.steps.length === 0 ? 2
    : form.recording.videoUrl ? 4
    : 3;

  async function handleGenerateThemes() {
    setThemesLoading(true);
    try {
      const res = await fetch("/api/guias/temas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: themeCategory, tool: themeTool, count: 6 }),
      });
      const data = await res.json();
      setThemes(data.themes || []);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
    setThemesLoading(false);
  }

  function selectTheme(theme) {
    setForm((p) => ({
      ...p,
      title: theme.title,
      description: theme.description,
      difficulty: theme.difficulty || p.difficulty,
      categories: theme.categories || p.categories,
      tool: theme.tool || "",
      tools: theme.tool ? [theme.tool] : p.tools,
    }));
    setTab("info");
  }

  async function handleGenerate() {
    if (!form.title) return alert("Informe o título primeiro.");
    setGenerating(true);
    try {
      const res = await fetch("/api/guias/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      set("content", data.content);
      if (data.source === "template") alert("Conteúdo gerado via template (sem API de IA). Edite manualmente se quiser.");
      setTab("content");
    } catch (err) { alert(`Erro: ${err.message}`); }
    setGenerating(false);
  }

  async function handleGenerateSteps() {
    if (!form.content) return alert("Gere o conteúdo antes de gerar os passos de gravação.");
    setGeneratingSteps(true);
    try {
      const res = await fetch("/api/guias/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.steps) {
        setForm((p) => ({
          ...p,
          recording: { ...p.recording, steps: data.steps },
        }));
        if (data.source === "template") alert("Passos gerados via template. Ajuste conforme necessário.");
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err) { alert(`Erro: ${err.message}`); }
    setGeneratingSteps(false);
  }

  async function saveGuide() {
    if (savedIdRef.current) {
      const res = await fetch(`/api/guias/${savedIdRef.current}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) return null;
      return { id: savedIdRef.current };
    }
    const res = await fetch("/api/guias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return null;
    const saved = await res.json();
    savedIdRef.current = saved.id;
    return saved;
  }

  async function handleRecord() {
    if (form.recording.steps.length === 0) return alert("Adicione passos de gravação primeiro.");
    if (!form.title) return alert("Salve o guia antes de gravar.");
    setRecording(true);
    try {
      const savedGuide = await saveGuide();
      if (!savedGuide) {
        alert("Erro ao salvar guia.");
        setRecording(false);
        return;
      }

      const res = await fetch("/api/guias/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: savedGuide.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Gravação concluída! O vídeo foi anexado ao guia.");
        router.push("/admin/guias");
      } else {
        alert(`Erro na gravação: ${data.error}`);
      }
    } catch (err) { alert(`Erro: ${err.message}`); }
    setRecording(false);
  }

  function addStep() {
    setForm((p) => ({
      ...p,
      recording: { ...p.recording, steps: [...p.recording.steps, { action: "navigate", url: "", description: "" }] },
    }));
  }
  function updateStep(idx, field, value) {
    setForm((p) => {
      const steps = [...p.recording.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...p, recording: { ...p.recording, steps } };
    });
  }
  function removeStep(idx) {
    setForm((p) => ({ ...p, recording: { ...p.recording, steps: p.recording.steps.filter((_, i) => i !== idx) } }));
  }

  async function handleSave() {
    if (!form.title) return alert("Informe o título.");
    setSaving(true);
    try {
      const saved = await saveGuide();
      if (saved) router.push("/admin/guias");
      else alert("Erro ao salvar guia.");
    } catch (err) { alert(`Erro: ${err.message}`); }
    setSaving(false);
  }

  function stepFields(step, idx) {
    switch (step.action) {
      case "navigate":
        return <input className={styles.formInput} placeholder="URL (ex: https://claude.ai)" value={step.url || ""} onChange={(e) => updateStep(idx, "url", e.target.value)} />;
      case "click":
        return <input className={styles.formInput} placeholder="Seletor CSS" value={step.selector || ""} onChange={(e) => updateStep(idx, "selector", e.target.value)} />;
      case "type":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input className={styles.formInput} placeholder="Seletor (opcional)" value={step.selector || ""} onChange={(e) => updateStep(idx, "selector", e.target.value)} />
            <textarea className={styles.formTextarea} placeholder="Texto para digitar" value={step.text || ""} onChange={(e) => updateStep(idx, "text", e.target.value)} rows={2} style={{ minHeight: 60 }} />
          </div>
        );
      case "wait":
        return <input className={styles.formInput} type="number" placeholder="Duração (ms)" value={step.duration || 2000} onChange={(e) => updateStep(idx, "duration", parseInt(e.target.value) || 2000)} />;
      case "scroll":
        return <input className={styles.formInput} type="number" placeholder="Pixels" value={step.distance || 300} onChange={(e) => updateStep(idx, "distance", parseInt(e.target.value) || 300)} />;
      case "press":
        return <input className={styles.formInput} placeholder="Tecla (Enter, Tab...)" value={step.key || ""} onChange={(e) => updateStep(idx, "key", e.target.value)} />;
      default:
        return <input className={styles.formInput} placeholder="Descrição" value={step.description || ""} onChange={(e) => updateStep(idx, "description", e.target.value)} />;
    }
  }

  const PIPELINE = [
    { label: "Tema", done: !!form.title },
    { label: "Conteúdo", done: !!form.content },
    { label: "Passos", done: form.recording.steps.length > 0 },
    { label: "Gravação", done: !!form.recording.videoUrl },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Novo Guia</h1>
        <p className={styles.pageSubtitle}>Pipeline completo: Tema &rarr; Conteúdo &rarr; Gravação</p>
      </div>

      <div className={g.pipelineSteps}>
        {PIPELINE.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && <span className={g.pipelineArrow}>&rarr;</span>}
            <div className={g.pipelineStep} data-active={String(pipelineStep === i)} data-done={String(p.done && pipelineStep > i)}>
              <span className={g.pipelineStepNumber}>{p.done && pipelineStep > i ? "\u2713" : i + 1}</span>
              {p.label}
            </div>
          </div>
        ))}
      </div>

      <div className={g.tabs}>
        {[
          { id: "themes", label: "Temas" },
          { id: "info", label: "Informações" },
          { id: "content", label: "Conteúdo" },
          { id: "recording", label: "Gravação" },
        ].map((t) => (
          <button key={t.id} className={`${g.tab} ${tab === t.id ? g.tabActive : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "themes" && (
        <>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>💡</span> Gerador de Temas</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
              Gere sugestões de temas para guias automaticamente. Clique em um tema para preencher o formulário.
            </p>
            <div className={g.themeFilters}>
              <select className={styles.formSelect} value={themeCategory} onChange={(e) => setThemeCategory(e.target.value)} style={{ minWidth: 180 }}>
                <option value="">Todas as categorias</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className={styles.formSelect} value={themeTool} onChange={(e) => setThemeTool(e.target.value)} style={{ minWidth: 140 }}>
                <option value="">Todas as ferramentas</option>
                {TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button className={g.generateBtn} onClick={handleGenerateThemes} disabled={themesLoading} style={{ padding: "8px 20px", fontSize: "0.8rem" }}>
                {themesLoading ? <><span className={g.generateBtnSpin}>💡</span> Gerando...</> : <>💡 Gerar Temas</>}
              </button>
            </div>

            {themes.length > 0 && (
              <div className={g.themeGrid}>
                {themes.map((theme, idx) => (
                  <div key={idx} className={g.themeCard} onClick={() => selectTheme(theme)}>
                    <div className={g.themeCardTitle}>{theme.title}</div>
                    <div className={g.themeCardDesc}>{theme.description}</div>
                    <div className={g.themeCardMeta}>
                      <span className={g.themeCardTag}>{theme.tool}</span>
                      <span className={g.themeCardTag}>{theme.difficulty}</span>
                      {theme.recordable !== undefined && (
                        <span className={g.themeCardTag} style={{ background: theme.recordable ? "#dcfce7" : "#fef9c3", color: theme.recordable ? "#166534" : "#854d0e" }}>
                          {theme.recordable ? "Gravável" : "Requer login"}
                        </span>
                      )}
                      {theme.categories?.map((c) => <span key={c} className={g.themeCardTag}>{c}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "info" && (
        <>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>📝</span> Informações Básicas</div>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Título do Guia</label>
                <input className={styles.formInput} placeholder="Ex: Como usar o Claude para melhorar o SEO" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Descrição</label>
                <textarea className={styles.formTextarea} placeholder="Breve descrição..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
              </div>
            </div>
          </div>

          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>🎯</span> Dificuldade</div>
            <div className={g.difficultyOptions}>
              {DIFFICULTIES.map((d) => (
                <button key={d} type="button" className={`${g.difficultyBtn} ${form.difficulty === d ? g.difficultyBtnActive : ""}`} onClick={() => set("difficulty", d)}>{d}</button>
              ))}
            </div>
          </div>

          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>📂</span> Categorias</div>
            <div className={g.checkboxGrid}>
              {CATEGORIES.map((cat) => (
                <div key={cat} className={`${g.checkboxItem} ${form.categories.includes(cat) ? g.checkboxItemActive : ""}`} onClick={() => toggle("categories", cat)}>
                  <input type="checkbox" checked={form.categories.includes(cat)} readOnly /> {cat}
                </div>
              ))}
            </div>
          </div>

          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>🛠</span> Ferramentas</div>
            <div className={g.checkboxGrid}>
              {TOOLS.map((t) => (
                <div key={t} className={`${g.checkboxItem} ${form.tools.includes(t) ? g.checkboxItemActive : ""}`} onClick={() => {
                  toggle("tools", t);
                  if (!form.tools.includes(t)) set("tool", t);
                  else if (form.tool === t) set("tool", form.tools.filter((x) => x !== t)[0] || "");
                }}>
                  <input type="checkbox" checked={form.tools.includes(t)} readOnly /> {t}
                </div>
              ))}
            </div>
          </div>

          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>👤</span> Autor</div>
            <div className={g.authorRow}>
              <div className={g.authorInitials}>{form.author.initials}</div>
              <div style={{ display: "flex", gap: 10, flex: 1 }}>
                <input className={styles.formInput} placeholder="Nome" value={form.author.name} onChange={(e) => set("author", { ...form.author, name: e.target.value })} style={{ flex: 1 }} />
                <input className={styles.formInput} placeholder="Iniciais" value={form.author.initials} onChange={(e) => set("author", { ...form.author, initials: e.target.value.toUpperCase() })} maxLength={3} style={{ width: 80 }} />
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "content" && (
        <>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>🤖</span> Gerar Conteúdo com IA</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
              Preencha as informações na aba anterior, depois clique para gerar o conteúdo automaticamente.
            </p>
            <button className={g.generateBtn} onClick={handleGenerate} disabled={generating}>
              {generating ? <><span className={g.generateBtnSpin}>⚡</span> Gerando...</> : <>⚡ Gerar Conteúdo</>}
            </button>
          </div>

          {form.content && (
            <>
              <div className={g.formSection}>
                <div className={g.formSectionTitle}>O que é essa Solução?</div>
                <textarea className={styles.formTextarea} value={form.content.whatIsIt || ""} onChange={(e) => set("content", { ...form.content, whatIsIt: e.target.value })} rows={6} style={{ minHeight: 150 }} />
              </div>

              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Por que usar essa ferramenta?</div>
                {form.content.whyUseIt?.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <input className={styles.formInput} value={item.title || ""} placeholder="Título" onChange={(e) => {
                      const items = [...form.content.whyUseIt]; items[idx] = { ...items[idx], title: e.target.value };
                      set("content", { ...form.content, whyUseIt: items });
                    }} style={{ marginBottom: 6 }} />
                    <textarea className={styles.formTextarea} value={item.description || ""} placeholder="Descrição" onChange={(e) => {
                      const items = [...form.content.whyUseIt]; items[idx] = { ...items[idx], description: e.target.value };
                      set("content", { ...form.content, whyUseIt: items });
                    }} rows={2} style={{ minHeight: 60 }} />
                  </div>
                ))}
              </div>

              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Passo a Passo</div>
                <label className={styles.formLabel} style={{ marginBottom: 6 }}>Pré-requisitos</label>
                <textarea className={styles.formTextarea} value={form.content.howToImplement?.prerequisites?.join("\n") || ""} placeholder="Um por linha" onChange={(e) => set("content", { ...form.content, howToImplement: { ...form.content.howToImplement, prerequisites: e.target.value.split("\n").filter(Boolean) } })} rows={3} style={{ minHeight: 80, marginBottom: 16 }} />
                {form.content.howToImplement?.steps?.map((step, idx) => (
                  <div key={idx} style={{ marginBottom: 12, padding: 12, background: "var(--bg-secondary)", borderRadius: 8 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>{step.number || idx + 1}.</span>
                      <input className={styles.formInput} value={step.title || ""} placeholder="Título" onChange={(e) => {
                        const steps = [...form.content.howToImplement.steps]; steps[idx] = { ...steps[idx], title: e.target.value };
                        set("content", { ...form.content, howToImplement: { ...form.content.howToImplement, steps } });
                      }} style={{ flex: 1 }} />
                    </div>
                    <textarea className={styles.formTextarea} value={step.description || ""} placeholder="Detalhes" onChange={(e) => {
                      const steps = [...form.content.howToImplement.steps]; steps[idx] = { ...steps[idx], description: e.target.value };
                      set("content", { ...form.content, howToImplement: { ...form.content.howToImplement, steps } });
                    }} rows={2} style={{ minHeight: 60 }} />
                  </div>
                ))}
              </div>

              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Casos de Uso</div>
                {form.content.useCases?.map((uc, idx) => (
                  <div key={idx} style={{ marginBottom: 16, padding: 12, background: "var(--bg-secondary)", borderRadius: 8 }}>
                    <input className={styles.formInput} value={uc.title || ""} placeholder="Título" onChange={(e) => { const c = [...form.content.useCases]; c[idx] = { ...c[idx], title: e.target.value }; set("content", { ...form.content, useCases: c }); }} style={{ marginBottom: 6 }} />
                    <textarea className={styles.formTextarea} value={uc.description || ""} placeholder="Descrição" onChange={(e) => { const c = [...form.content.useCases]; c[idx] = { ...c[idx], description: e.target.value }; set("content", { ...form.content, useCases: c }); }} rows={2} style={{ minHeight: 60, marginBottom: 6 }} />
                    <textarea className={styles.formTextarea} value={uc.command || ""} placeholder="Comando/prompt" onChange={(e) => { const c = [...form.content.useCases]; c[idx] = { ...c[idx], command: e.target.value }; set("content", { ...form.content, useCases: c }); }} rows={2} style={{ minHeight: 60, marginBottom: 6, fontFamily: "monospace" }} />
                    <input className={styles.formInput} value={uc.result || ""} placeholder="Resultado esperado" onChange={(e) => { const c = [...form.content.useCases]; c[idx] = { ...c[idx], result: e.target.value }; set("content", { ...form.content, useCases: c }); }} />
                  </div>
                ))}
              </div>

              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Dicas Avançadas</div>
                <textarea className={styles.formTextarea} value={form.content.advancedTips?.join("\n\n") || ""} placeholder="Uma dica por parágrafo" onChange={(e) => set("content", { ...form.content, advancedTips: e.target.value.split("\n\n").filter(Boolean) })} rows={6} style={{ minHeight: 150 }} />
              </div>

              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Erros Comuns</div>
                <textarea className={styles.formTextarea} value={form.content.commonMistakes?.join("\n\n") || ""} placeholder="Um erro por parágrafo" onChange={(e) => set("content", { ...form.content, commonMistakes: e.target.value.split("\n\n").filter(Boolean) })} rows={6} style={{ minHeight: 150 }} />
              </div>

              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Conclusão</div>
                <textarea className={styles.formTextarea} value={form.content.conclusion || ""} placeholder="Conclusão" onChange={(e) => set("content", { ...form.content, conclusion: e.target.value })} rows={4} style={{ minHeight: 120 }} />
              </div>
            </>
          )}
        </>
      )}

      {tab === "recording" && (
        <>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>🎬</span> Passos de Gravação (Agente Automatizado)</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 16 }}>
              Configure os passos que o agente deve executar para gravar o guia. Gere automaticamente a partir do conteúdo ou adicione manualmente.
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <button className={g.generateStepsBtn} onClick={handleGenerateSteps} disabled={generatingSteps || !form.content}>
                {generatingSteps ? <><span className={g.generateBtnSpin}>🤖</span> Gerando Passos...</> : <>🤖 Gerar Passos Automaticamente</>}
              </button>
              {form.recording.steps.length > 0 && (
                <button className={g.generateBtn} onClick={handleRecord} disabled={recording} style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  {recording ? <><span className={g.generateBtnSpin}>🎬</span> Gravando...</> : <>🎬 Salvar e Gravar</>}
                </button>
              )}
            </div>

            <div className={g.stepsList}>
              {form.recording.steps.map((step, idx) => (
                <div key={idx} className={g.stepItem}>
                  <div className={g.stepNumber}>{idx + 1}</div>
                  <select className={styles.formSelect} value={step.action} onChange={(e) => updateStep(idx, "action", e.target.value)}>
                    {STEP_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                  {stepFields(step, idx)}
                  <button className={g.stepRemove} onClick={() => removeStep(idx)}>&#x2715;</button>
                </div>
              ))}
            </div>
            <button className={g.addStepBtn} onClick={addStep}>+ Adicionar Passo</button>

            {form.recording.steps.length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: "var(--bg-secondary)", borderRadius: 8, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <strong>{form.recording.steps.length}</strong> passo(s) configurado(s).
                {form.recording.steps.filter((s) => s.description).map((s, i) => (
                  <div key={i} style={{ marginTop: 4 }}>&#x2022; {s.description}</div>
                ))}
              </div>
            )}
          </div>

          <div className={g.formSection}>
            <div className={g.formSectionTitle}><span className={g.formSectionIcon}>ℹ️</span> Como funciona o Pipeline</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}><strong>1. Gerar Temas</strong> — A IA sugere temas de guias baseados em categorias e ferramentas</p>
              <p style={{ marginBottom: 8 }}><strong>2. Gerar Conteúdo</strong> — O conteúdo do guia é gerado automaticamente (7 seções padrão)</p>
              <p style={{ marginBottom: 8 }}><strong>3. Gerar Passos</strong> — Os passos de gravação são criados a partir do conteúdo do guia</p>
              <p style={{ marginBottom: 8 }}><strong>4. Gravar</strong> — O Playwright executa os passos e grava a tela automaticamente</p>
              <p><strong>5. Download</strong> — O vídeo fica disponível para download e publicação</p>
            </div>
          </div>
        </>
      )}

      <div className={styles.formActions}>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Guia"}
        </button>
        <button className={styles.btnSecondary} onClick={() => router.push("/admin/guias")}>Cancelar</button>
      </div>
    </>
  );
}
