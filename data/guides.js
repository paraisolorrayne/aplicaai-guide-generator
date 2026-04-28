import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data/guides.json");

function readGuides() {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeGuides(guides) {
  writeFileSync(DATA_PATH, JSON.stringify(guides, null, 2), "utf-8");
}

export function getAllGuides(filters = {}) {
  let guides = readGuides();

  if (filters.category) {
    guides = guides.filter((g) => g.categories.includes(filters.category));
  }
  if (filters.difficulty) {
    guides = guides.filter((g) => g.difficulty === filters.difficulty);
  }
  if (filters.tool) {
    guides = guides.filter((g) => g.tools.includes(filters.tool));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    guides = guides.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.description || "").toLowerCase().includes(q)
    );
  }
  return guides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getGuideById(id) {
  return readGuides().find((g) => g.id === id) || null;
}

export function getGuideBySlug(slug) {
  return readGuides().find((g) => g.slug === slug) || null;
}

export function createGuide(data) {
  const guides = readGuides();
  const now = new Date().toISOString();
  const guide = {
    id: crypto.randomUUID(),
    slug: generateSlug(data.title),
    isNew: true,
    createdAt: now,
    updatedAt: now,
    recording: { videoUrl: null, steps: [], status: "pending" },
    ...data,
  };
  guides.push(guide);
  writeGuides(guides);
  return guide;
}

export function updateGuide(id, data) {
  const guides = readGuides();
  const idx = guides.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  guides[idx] = {
    ...guides[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeGuides(guides);
  return guides[idx];
}

export function deleteGuide(id) {
  const guides = readGuides();
  const filtered = guides.filter((g) => g.id !== id);
  if (filtered.length === guides.length) return false;
  writeGuides(filtered);
  return true;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export const CATEGORIES = [
  "Marketing & Redes Sociais",
  "Produtividade & Automação",
  "Vendas & Atendimento",
  "Criação de Conteúdo",
  "Análise de Dados",
  "Desenvolvimento & No-Code",
];

export const DIFFICULTIES = ["Iniciante", "Intermediário", "Avançado"];

export const TOOLS = [
  "ChatGPT",
  "Claude",
  "Google Gemini",
  "Google AI Studio",
  "Perplexity",
  "Lovable",
  "Manychat",
  "Carrossel Pro",
  "Construtor de Carrosséis",
  "Criador de Assistentes no ChatGPT (GPTs)",
  "Devin",
];
