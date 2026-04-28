"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/guias", label: "Guias", icon: "📚" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logoLink}>
            <span className={styles.logoText}>AplicaAI</span>
          </Link>
          <span className={styles.logoSub}>Gerador de Guias</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/guias" className={styles.backLink}>
            Ver Guias Publicados →
          </Link>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
