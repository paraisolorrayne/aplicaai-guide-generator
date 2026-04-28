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
              {TOOLS.map((tool) => <div key={tool} className={`${g.checkboxItem} ${form.tools?.includes(tool) ? g.checkboxItemActive : ""}`} onClick={() => toggle("tools", tool)}><input type="checkbox" checked={form.tools?.includes(tool) || false} readOnly /> {tool}</div>)}
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
                <div className={g.formSectionTitle}>Conclusão</div>
                <textarea className={styles.formTextarea} value={form.content.conclusion || ""} onChange={(e) => set("content", { ...form.content, conclusion: e.target.value })} rows={4} style={{ minHeight: 120 }} />
              </div>
            </>
          )}
        </>
      )}

      {tab === "recording" && (
        <div className={g.formSection}>
          <div className={g.formSectionTitle}>Passos de Gravação</div>
          {form.recording?.videoUrl && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--color-success)", fontWeight: 600, marginBottom: 8 }}>Gravação disponível</p>
              <video src={form.recording.videoUrl} controls style={{ width: "100%", maxWidth: 640, borderRadius: 8 }} />
            </div>
          )}
          <div className={g.stepsList}>
            {(form.recording?.steps || []).map((step, idx) => (
              <div key={idx} className={g.stepItem}>
                <div className={g.stepNumber}>{idx + 1}</div>
                <select className={styles.formSelect} value={step.action} onChange={(e) => updateStep(idx, "action", e.target.value)}>
                  {STEP_ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                {stepFields(step, idx)}
                <button className={g.stepRemove} onClick={() => removeStep(idx)}>✕</button>
              </div>
            ))}
          </div>
          <button className={g.addStepBtn} onClick={addStep}>+ Adicionar Passo</button>
        </div>
      )}

      <div className={styles.formActions}>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        <button className={styles.btnSecondary} onClick={() => router.push("/admin/guias")}>Voltar</button>
      </div>
    </>
  );
}
