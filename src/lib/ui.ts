// Etiquetas y paletas compartidas para la capa visual.
// Server- y client-safe (sin dependencias de Node ni de Prisma).

export type PromiseStatusKey =
  | "no_iniciada"
  | "en_progreso"
  | "parcialmente_cumplida"
  | "cumplida"
  | "incumplida"
  | "no_verificable";

export interface StatusMeta {
  label: string;
  /** clases Tailwind para el badge (fondo + texto + borde) */
  badge: string;
  /** color sólido para barras/indicadores */
  color: string;
}

export const STATUS_META: Record<PromiseStatusKey, StatusMeta> = {
  no_iniciada: {
    label: "No iniciada",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    color: "#6b7280",
  },
  en_progreso: {
    label: "En progreso",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    color: "#2563eb",
  },
  parcialmente_cumplida: {
    label: "Parcialmente cumplida",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    color: "#d97706",
  },
  cumplida: {
    label: "Cumplida",
    badge: "bg-green-50 text-green-700 border-green-200",
    color: "#16a34a",
  },
  incumplida: {
    label: "Incumplida",
    badge: "bg-red-50 text-red-700 border-red-200",
    color: "#dc2626",
  },
  no_verificable: {
    label: "No verificable",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    color: "#7c3aed",
  },
};

export const STATUS_ORDER: PromiseStatusKey[] = [
  "cumplida",
  "parcialmente_cumplida",
  "en_progreso",
  "no_iniciada",
  "incumplida",
  "no_verificable",
];

export function statusMeta(status: string): StatusMeta {
  return (
    STATUS_META[status as PromiseStatusKey] ?? {
      label: status,
      badge: "bg-gray-100 text-gray-700 border-gray-200",
      color: "#6b7280",
    }
  );
}

// ─────────────────────────────────────────────────────────────
// TEMAS / ÁREAS DE POLÍTICA
// ─────────────────────────────────────────────────────────────

export interface TopicMeta {
  label: string;
  emoji: string;
  badge: string;
}

export const TOPIC_META: Record<string, TopicMeta> = {
  sanidad: { label: "Sanidad", emoji: "🏥", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  economia: { label: "Economía", emoji: "📈", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  empleo: { label: "Empleo", emoji: "💼", badge: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  vivienda: { label: "Vivienda", emoji: "🏠", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  educacion: { label: "Educación", emoji: "🎓", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  transporte: { label: "Transporte", emoji: "🚆", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  medioambiente: { label: "Medio ambiente", emoji: "🌱", badge: "bg-lime-50 text-lime-700 border-lime-200" },
  justicia: { label: "Justicia", emoji: "⚖️", badge: "bg-stone-100 text-stone-700 border-stone-200" },
  derechos: { label: "Derechos", emoji: "🤝", badge: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  pensiones: { label: "Pensiones", emoji: "👵", badge: "bg-teal-50 text-teal-700 border-teal-200" },
};

export function topicMeta(topic: string): TopicMeta {
  return (
    TOPIC_META[topic] ?? {
      label: topic.charAt(0).toUpperCase() + topic.slice(1),
      emoji: "🏛️",
      badge: "bg-gray-100 text-gray-700 border-gray-200",
    }
  );
}
