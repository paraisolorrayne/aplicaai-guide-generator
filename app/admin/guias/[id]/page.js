"use client";

import { useState, useEffect, use } from "react";
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
  { value: "navigate", label: "Navegar" }, { value: "click", label: "Clicar" },
  { value: "type", label: "Digitar" }, { value: "wait", label: "Aguardar" },
  { value: "scroll", label: "Rolar" }, { value: "press", label: "Tecla" },
  { value: "screenshot", label: "Captura" },
];

export default function EditGuia({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingSteps, setGeneratingSteps] = useState(false);
  const [recording, setRecording] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`/api/guias/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.error) { router.push("/admin/guias"); return; } setForm(data); })
      .catch(() => router.push("/admin/guias"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !form) return <div className={styles.loading}>Carregando...</div>;

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const toggle = (field, item) => setForm((p) => {
    const arr = p[field] || [];
    return { ...p, [field]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] };
  });

  async function handleGenerate() {
    if (!form.title) return alert("Informe o título.");
    setGenerating(true);
    try {
      const res = await fetch("/api/guias/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      set("content", data.content);
      setTab("content");
    } catch (err) { alert(`Erro: ${err.message}`); }
    setGenerating(false);
  }

  async function handleGenerateSteps() {
    if (!form.content) return alert("Gere o conteúdo antes.");
    setGeneratingSteps(true);
    try {
      const res = await fetch("/api/guias/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.steps) {
        setForm((p) => ({ ...p, recording: { ...p.recording, steps: data.steps } }));
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err) { alert(`Erro: ${err.message}`); }
    setGeneratingSteps(false);
  }

  async function handleRecord() {
    if ((form.recording?.steps || []).length === 0) return alert("Adicione passos de gravação.");
    setRecording(true);
    try {
      const saveRes = await fetch(`/api/guias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!saveRes.ok) {
        alert("Erro ao salvar guia antes de gravar.");
        setRecording(false);
        return;
      }

      const res = await fetch("/api/guias/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Gravação concluída!");
        setForm((p) => ({ ...p, recording: { ...p.recording, videoUrl: data.videoUrl, status: "completed" } }));
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err) { alert(`Erro: ${err.message}`); }
    setRecording(false);
  }

  function addStep() {
    setForm((p) => ({ ...p, recording: { ...p.recording, steps: [...(p.recording?.steps || []), { action: "navigate", url: "", description: "" }] } }));
  }
  function updateStep(idx, field, value) {
    setForm((p) => { const steps = [...(p.recording?.steps || [])]; steps[idx] = { ...steps[idx], [field]: value }; return { ...p, recording: { ...p.recording, steps } }; });
  }
  function removeStep(idx) {
    setForm((p) => ({ ...p, recording: { ...p.recording, steps: (p.recording?.steps || []).filter((_, i) => i !== idx) } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/guias/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) router.push("/admin/guias");
      else alert(`Erro: ${(await res.json()).error}`);
    } catch (err) { alert(`Erro: ${err.message}`); }
    setSaving(false);
  }

  function stepFields(step, idx) {
    switch (step.action) {
      case "navigate": return <input className={styles.formInput} placeholder="URL" value={step.url || ""} onChange={(e) => updateStep(idx, "url", e.target.value)} />;
      case "click": return <input className={styles.formInput} placeholder="Seletor" value={step.selector || ""} onChange={(e) => updateStep(idx, "selector", e.target.value)} />;
      case "type": return (<div style={{ display: "flex", flexDirection: "column", gap: 6 }}><input className={styles.formInput} placeholder="Seletor" value={step.selector || ""} onChange={(e) => updateStep(idx, "selector", e.target.value)} /><textarea className={styles.formTextarea} placeholder="Texto" value={step.text || ""} onChange={(e) => updateStep(idx, "text", e.target.value)} rows={2} style={{ minHeight: 60 }} /></div>);
      case "wait": return <input className={styles.formInput} type="number" value={step.duration || 2000} onChange={(e) => updateStep(idx, "duration", parseInt(e.target.value) || 2000)} />;
      case "scroll": return <input className={styles.formInput} type="number" placeholder="Pixels" value={step.distance || 300} onChange={(e) => updateStep(idx, "distance", parseInt(e.target.value) || 300)} />;
      case "press": return <input className={styles.formInput} placeholder="Tecla" value={step.key || ""} onChange={(e) => updateStep(idx, "key", e.target.value)} />;
      default: return <input className={styles.formInput} placeholder="Valor" value={step.description || step.key || ""} onChange={(e) => updateStep(idx, "description", e.target.value)} />;
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Editar Guia</h1>
        <p className={styles.pageSubtitle}>{form.title}</p>
      </div>

      <div className={g.tabs}>
        {[{ id: "info", label: "Informações" }, { id: "content", label: "Conteúdo" }, { id: "recording", label: "Gravação" }].map((t) => (
          <button key={t.id} className={`${g.tab} ${tab === t.id ? g.tabActive : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "info" && (
        <>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}>Informações Básicas</div>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Título</label>
                <input className={styles.formInput} value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Descrição</label>
                <textarea className={styles.formTextarea} value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} />
              </div>
            </div>
          </div>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}>Dificuldade</div>
            <div className={g.difficultyOptions}>
              {DIFFICULTIES.map((d) => <button key={d} type="button" className={`${g.difficultyBtn} ${form.difficulty === d ? g.difficultyBtnActive : ""}`} onClick={() => set("difficulty", d)}>{d}</button>)}
            </div>
          </div>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}>Categorias</div>
            <div className={g.checkboxGrid}>
              {CATEGORIES.map((cat) => <div key={cat} className={`${g.checkboxItem} ${form.categories?.includes(cat) ? g.checkboxItemActive : ""}`} onClick={() => toggle("categories", cat)}><input type="checkbox" checked={form.categories?.includes(cat) || false} readOnly /> {cat}</div>)}
            </div>
          </div>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}>Ferramentas</div>
            <div className={g.checkboxGrid}>
              {TOOLS.map((t) => <div key={t} className={`${g.checkboxItem} ${form.tools?.includes(t) ? g.checkboxItemActive : ""}`} onClick={() => { toggle("tools", t); const newTools = form.tools?.includes(t) ? form.tools.filter((x) => x !== t) : [...(form.tools || []), t]; set("tool", newTools[0] || ""); }}><input type="checkbox" checked={form.tools?.includes(t) || false} readOnly /> {t}</div>)}
            </div>
          </div>
          <div className={g.formSection}>
            <label className={styles.formCheckbox}><input type="checkbox" checked={form.isNew || false} onChange={(e) => set("isNew", e.target.checked)} /> Marcar como NOVO</label>
          </div>
        </>
      )}

      {tab === "content" && (
        <>
          <div className={g.formSection}>
            <button className={g.generateBtn} onClick={handleGenerate} disabled={generating}>
              {generating ? "Gerando..." : "⚡ Regenerar com IA"}
            </button>
          </div>
          {form.content && (
            <>
              <div className={g.formSection}>
                <div className={g.formSectionTitle}>O que é essa Solução?</div>
                <textarea className={styles.formTextarea} value={form.content.whatIsIt || ""} onChange={(e) => set("content", { ...form.content, whatIsIt: e.target.value })} rows={6} style={{ minHeight: 150 }} />
              </div>
              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Por que usar?</div>
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
                    <input className={styles.formInput} value={uc.result || ""} placeholder="Resultado" onChange={(e) => { const c = [...form.content.useCases]; c[idx] = { ...c[idx], result: e.target.value }; set("content", { ...form.content, useCases: c }); }} />
                  </div>
                ))}
              </div>
              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Dicas Avançadas</div>
                <textarea className={styles.formTextarea} value={form.content.advancedTips?.join("\n\n") || ""} onChange={(e) => set("content", { ...form.content, advancedTips: e.target.value.split("\n\n").filter(Boolean) })} rows={6} style={{ minHeight: 150 }} />
              </div>
              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Erros Comuns</div>
                <textarea className={styles.formTextarea} value={form.content.commonMistakes?.join("\n\n") || ""} onChange={(e) => set("content", { ...form.content, commonMistakes: e.target.value.split("\n\n").filter(Boolean) })} rows={6} style={{ minHeight: 150 }} />
              </div>
              <div className={g.formSection}>
                <div className={g.formSectionTitle}>Conclusão</div>
                <textarea className={styles.formTextarea} value={form.content.conclusion || ""} onChange={(e) => set("content", { ...form.content, conclusion: e.target.value })} rows={4} style={{ minHeight: 120 }} />
              </div>
            </>
          )}
        </>
      )}

      {tab === "recording" && (
        <>
          <div className={g.formSection}>
            <div className={g.formSectionTitle}>Gravação do Guia</div>

            {form.recording?.videoUrl && (
              <div className={g.videoSection}>
                <p style={{ fontWeight: 600, color: "var(--color-success)", marginBottom: 8 }}>Gravação disponível</p>
                <video src={form.recording.videoUrl} controls style={{ width: "100%", maxWidth: 640, borderRadius: 8 }} />
                <div style={{ marginTop: 12 }}>
                  <a href={`/api/guias/${id}/video`} className={g.downloadBtn} download>
                    ⬇ Baixar Vídeo
                  </a>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <button className={g.generateStepsBtn} onClick={handleGenerateSteps} disabled={generatingSteps || !form.content}>
                {generatingSteps ? "Gerando..." : "🤖 Gerar Passos Automaticamente"}
              </button>
              {(form.recording?.steps || []).length > 0 && (
                <button className={g.generateBtn} onClick={handleRecord} disabled={recording} style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  {recording ? "Gravando..." : "🎬 Gravar Agora"}
                </button>
              )}
            </div>

            <div className={g.stepsList}>
              {(form.recording?.steps || []).map((step, idx) => (
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

            {(form.recording?.steps || []).length > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: "var(--bg-secondary)", borderRadius: 8, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <strong>{form.recording.steps.length}</strong> passo(s) configurado(s)
              </div>
            )}
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
