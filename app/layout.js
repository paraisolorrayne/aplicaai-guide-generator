import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata = {
  title: {
    default: "AplicaAI — Gerador de Guias",
    template: "%s | AplicaAI",
  },
  description:
    "Plataforma para gerar guias práticos sobre IA de forma automatizada, com agente de gravação end-to-end.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${rajdhani.variable}`}>
      <body>{children}</body>
    </html>
  );
}
