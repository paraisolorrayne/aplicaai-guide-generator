"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import g from "./guias.module.css";

export default function AdminGuias() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [recording, setRecording] = useState(null);

  useEffect(() => { fetchGuides(); }, []);

  async function fetchGuides() {
    try {
      const res = await fetch("/api/guias");
      setGuides(await res.json());
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Excluir este guia?")) return;
    await fetch(`/api/guias/${id}`, { method: "DELETE" });
    fetchGuides();
  }

  async function handleRecord(guide) {
    if (!guide.recording?.steps?.length) {
      alert("Adicione passos de gravação antes.");
      return;
    }
    setRecording(guide.id);
    try {
      const res = await fetch("/api/guias/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: guide.id }),
      });
      const data = await res.json();
      alert(data.success ? "Gravação concluída!" : `Erro: ${data.error}`);
      fetchGuides();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
    setRecording(null);
  }

  const filtered = filter === "all"
    ? guides
    : guides.filter((gu) => gu.categories?.includes(filter));

  const categories = [...new Set(guides.flatMap((gu) => gu.categories || []))];

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={g.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Guias</h1>
            <p className={styles.pageSubtitle}>Crie e gerencie guias da AplicaAI</p>
          </div>
          <Link href="/admin/guias/novo" className={styles.btnPrimary}>+ Novo Guia</Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total</div>
          <div className={`${styles.statValue} ${styles.statAccent}`}>{guides.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Com Gravação</div>
          <div className={styles.statValue}>{guides.filter((gu) => gu.recording?.videoUrl).length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Categorias</div>
          <div className={styles.statValue}>{categories.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Novos</div>
          <div className={styles.statValue}>{guides.filter((gu) => gu.isNew).length}</div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className={g.filterBar}>
          <button className={`${g.filterBtn} ${filter === "all" ? g.filterBtnActive : ""}`} onClick={() => setFilter("all")}>Todos</button>
          {categories.map((cat) => (
            <button key={cat} className={`${g.filterBtn} ${filter === cat ? g.filterBtnActive : ""}`} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <div className={styles.emptyText}>Nenhum guia encontrado</div>
          <Link href="/admin/guias/novo" className={styles.btnPrimary}>Criar Primeiro Guia</Link>
        </div>
      ) : (
        <div className={g.guideGrid}>
          {filtered.map((guide) => (
            <div key={guide.id} className={g.guideCard}>
              <div className={g.guideCardHeader}>
                <div className={g.guideBadges}>
                  {guide.isNew && <span className={g.badgeNew}>NOVO</span>}
                  <span className={g.badgeDifficulty}>{guide.difficulty}</span>
                </div>
                <span className={g.statusDot} data-status={guide.recording?.status || "pending"} title={guide.recording?.status || "pending"} />
              </div>
              <h3 className={g.guideCardTitle}>{guide.title}</h3>
              <p className={g.guideCardDesc}>{guide.description?.slice(0, 120)}{guide.description?.length > 120 ? "..." : ""}</p>
              <div className={g.guideCardTools}>
                {guide.tools?.map((t) => <span key={t} className={g.toolTag}>{t}</span>)}
              </div>
              <div className={g.guideCardCategories}>
                {guide.categories?.map((c) => <span key={c} className={g.categoryTag}>{c}</span>)}
              </div>
              <div className={g.guideCardActions}>
                <Link href={`/admin/guias/${guide.id}`} className={styles.btnSecondary} style={{ fontSize: "0.8rem", padding: "6px 12px" }}>Editar</Link>
                <Link href={`/guias/${guide.slug}`} className={styles.btnSecondary} style={{ fontSize: "0.8rem", padding: "6px 12px" }} target="_blank">Ver</Link>
                <button onClick={() => handleRecord(guide)} className={styles.btnAccent} style={{ fontSize: "0.8rem", padding: "6px 12px" }} disabled={recording === guide.id}>
                  {recording === guide.id ? "Gravando..." : "Gravar"}
                </button>
                <button onClick={() => handleDelete(guide.id)} className={styles.btnDanger} style={{ fontSize: "0.8rem", padding: "6px 12px" }}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
