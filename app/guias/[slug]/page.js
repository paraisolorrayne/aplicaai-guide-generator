"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import s from "./guia-view.module.css";

export default function GuiaView({ params }) {
  const { slug } = use(params);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guias")
      .then((r) => r.json())
      .then((guides) => {
        const found = guides.find((g) => g.slug === slug);
        setGuide(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className={s.loading}>Carregando...</div>;
  if (!guide) return <div className={s.notFound}><h1>Guia não encontrado</h1><Link href="/guias">← Voltar aos guias</Link></div>;

  const c = guide.content;

  return (
    <div className={s.wrapper}>
      <header className={s.header}>
        <div className={s.headerContent}>
          <Link href="/guias" className={s.backBtn}>← Voltar aos guias</Link>
          <div className={s.badges}>
            {guide.isNew && <span className={s.badgeNew}>NOVO</span>}
            <span className={s.badgeDifficulty}>{guide.difficulty}</span>
            {guide.categories?.map((cat) => <span key={cat} className={s.badgeCat}>{cat}</span>)}
          </div>
          <h1 className={s.title}>{guide.title}</h1>
          <div className={s.meta}>
            <div className={s.toolsRow}>
              {guide.tools?.map((t) => <span key={t} className={s.toolBadge}>{t}</span>)}
            </div>
            <div className={s.author}>
              <div className={s.authorAvatar}>{guide.author?.initials || "?"}</div>
              <span>{guide.author?.name || "Anônimo"}</span>
            </div>
          </div>
        </div>
      </header>

      <article className={s.article}>
        {guide.recording?.videoUrl && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>🎬 Vídeo do Guia</h2>
            <video src={guide.recording.videoUrl} controls className={s.video} />
          </section>
        )}

        {c?.whatIsIt && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>O que é essa Solução?</h2>
            <div className={s.prose}>{c.whatIsIt.split("\n").map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}</div>
          </section>
        )}

        {c?.whyUseIt?.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Por que usar {guide.tools?.[0] || "essa ferramenta"}?</h2>
            <div className={s.reasonsGrid}>
              {c.whyUseIt.map((item, i) => (
                <div key={i} className={s.reasonCard}>
                  <h3 className={s.reasonTitle}>{item.title}</h3>
                  <p className={s.reasonDesc}>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {c?.howToImplement && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Como Implementar: Passo a Passo Detalhado</h2>
            {c.howToImplement.prerequisites?.length > 0 && (
              <div className={s.prereqBox}>
                <h3 className={s.prereqTitle}>Pré-requisitos:</h3>
                <ul className={s.prereqList}>
                  {c.howToImplement.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
            <div className={s.stepsList}>
              {c.howToImplement.steps?.map((step, i) => (
                <div key={i} className={s.stepCard}>
                  <div className={s.stepNum}>{step.number || i + 1}</div>
                  <div>
                    <h3 className={s.stepTitle}>{step.title}</h3>
                    <p className={s.stepDesc}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {c?.useCases?.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Casos de Uso Práticos</h2>
            {c.useCases.map((uc, i) => (
              <div key={i} className={s.useCaseCard}>
                <h3 className={s.useCaseTitle}>{i + 1}. {uc.title}</h3>
                <p className={s.useCaseDesc}>{uc.description}</p>
                {uc.command && (
                  <div className={s.commandBox}>
                    <code>{uc.command}</code>
                  </div>
                )}
                {uc.result && <p className={s.useCaseResult}><strong>Resultado:</strong> {uc.result}</p>}
              </div>
            ))}
          </section>
        )}

        {c?.advancedTips?.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Dicas Avançadas</h2>
            <ul className={s.tipsList}>
              {c.advancedTips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </section>
        )}

        {c?.commonMistakes?.length > 0 && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Erros Comuns para Evitar</h2>
            <ul className={s.mistakesList}>
              {c.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </section>
        )}

        {c?.conclusion && (
          <section className={s.section}>
            <h2 className={s.sectionTitle}>Conclusão</h2>
            <div className={s.prose}>{c.conclusion.split("\n").map((p, i) => p.trim() ? <p key={i}>{p}</p> : null)}</div>
          </section>
        )}
      </article>
    </div>
  );
}
