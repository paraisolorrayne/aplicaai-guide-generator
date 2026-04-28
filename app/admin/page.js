"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guias")
      .then((r) => r.json())
      .then(setGuides)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalGuides = guides.length;
  const withRecording = guides.filter((g) => g.recording?.videoUrl).length;
  const categories = [...new Set(guides.flatMap((g) => g.categories || []))].length;
  const newGuides = guides.filter((g) => g.isNew).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>
          Visão geral dos guias e operações
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total de Guias</div>
              <div className={`${styles.statValue} ${styles.statAccent}`}>
                {totalGuides}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Com Gravação</div>
              <div className={styles.statValue}>{withRecording}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Categorias</div>
              <div className={styles.statValue}>{categories}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Novos</div>
              <div className={styles.statValue}>{newGuides}</div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16 }}>
              Ações Rápidas
            </h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/admin/guias/novo" className={styles.btnPrimary}>
                + Novo Guia
              </Link>
              <Link href="/admin/guias" className={styles.btnSecondary}>
                Ver Todos os Guias
              </Link>
              <Link href="/guias" className={styles.btnSecondary} target="_blank">
                Ver Página Pública
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
