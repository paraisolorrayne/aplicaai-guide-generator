import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Plataforma de Guias</span>
          <h1 className={styles.title}>
            AplicaAI<br />
            <span className={styles.titleAccent}>Gerador de Guias</span>
          </h1>
          <p className={styles.subtitle}>
            Crie guias práticos sobre IA de forma automatizada, com geração de conteúdo inteligente e gravação de execução end-to-end.
          </p>
          <div className={styles.ctas}>
            <Link href="/admin/guias/novo" className={styles.btnPrimary}>
              Criar Novo Guia
            </Link>
            <Link href="/guias" className={styles.btnSecondary}>
              Ver Guias
            </Link>
            <Link href="/admin" className={styles.btnOutline}>
              Painel Admin
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🤖</div>
          <h3>Geração com IA</h3>
          <p>Gere conteúdo completo seguindo o formato AplicaAI automaticamente com IA.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎬</div>
          <h3>Gravação Automatizada</h3>
          <p>Agente end-to-end grava a execução do guia via Playwright automaticamente.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📚</div>
          <h3>Formato AplicaAI</h3>
          <p>Estrutura padronizada: solução, motivos, passo a passo, casos de uso, dicas e conclusão.</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📂</div>
          <h3>Categorias e Filtros</h3>
          <p>Organize guias por categoria, dificuldade, ferramenta e autor.</p>
        </div>
      </div>
    </div>
  );
}
