"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import s from "./guias.module.css";

const CATEGORIES = [
  "Marketing & Redes Sociais", "Produtividade & Automação",
  "Vendas & Atendimento", "Criação de Conteúdo",
  "Análise de Dados", "Desenvolvimento & No-Code",
];

export default function GuiasPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/guias").then((r) => r.json()).then(setGuides).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const counts = {};
  CATEGORIES.forEach((c) => { counts[c] = guides.filter((gu) => gu.categories?.includes(c)).length; });

  const filtered = guides.filter((gu) => {
    const matchCat = cat === "all" || gu.categories?.includes(cat);
    const matchSearch = !search || gu.title.toLowerCase().includes(search.toLowerCase()) || (gu.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className={s.wrapper}>
      <header className={s.header}>
        <div className={s.headerContent}>
          <div className={s.headerNav}>
            <Link href="/" className={s.backBtn}>← Início</Link>
            <Link href="/admin" className={s.adminBtn}>Admin</Link>
          </div>
          <h1 className={s.headerTitle}>Guias</h1>
          <p className={s.headerSubtitle}>{guides.length} guias disponíveis</p>
        </div>
      </header>

      <div className={s.container}>
        <aside className={s.sidebar}>
          <input className={s.searchInput} placeholder="Buscar guias..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <nav className={s.categoryNav}>
            <button className={`${s.categoryBtn} ${cat === "all" ? s.categoryBtnActive : ""}`} onClick={() => setCat("all")}>Todos</button>
            {CATEGORIES.map((c) => (
              <button key={c} className={`${s.categoryBtn} ${cat === c ? s.categoryBtnActive : ""}`} onClick={() => setCat(c)}>
                {c} <span className={s.categoryCount}>({counts[c] || 0})</span>
              </button>
            ))}
          </nav>
        </aside>

        <main>
          {loading ? <div className={s.loadingState}>Carregando...</div> : filtered.length === 0 ? <div className={s.emptyState}>Nenhum guia encontrado.</div> : (
            <div className={s.guideGrid}>
              {filtered.map((guide) => (
                <Link key={guide.id} href={`/guias/${guide.slug}`} className={s.guideCard}>
                  <div className={s.guideCardTop}>
                    {guide.isNew && <span className={s.badgeNew}>NOVO</span>}
                    <span className={s.badgeDifficulty}>{guide.difficulty}</span>
                  </div>
                  <div className={s.guideCardCategories}>
                    {guide.categories?.map((c) => <span key={c} className={s.catTag}>{c}</span>)}
                  </div>
                  <h3 className={s.guideCardTitle}>{guide.title}</h3>
                  <div className={s.guideCardTools}>
                    {guide.tools?.map((t) => <span key={t} className={s.toolBadge}>{t}</span>)}
                  </div>
                  {guide.recording?.videoUrl && <div className={s.videoIndicator}>🎬 Vídeo disponível</div>}
                  <div className={s.guideCardAuthor}>
                    <div className={s.authorAvatar}>{guide.author?.initials || "?"}</div>
                    <span className={s.authorName}>{guide.author?.name || "Anônimo"}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
