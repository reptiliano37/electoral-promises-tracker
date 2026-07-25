import { statusMeta, topicMeta } from "@/lib/ui";

export function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}

export function TopicBadge({ topic }: { topic: string }) {
  const meta = topicMeta(topic);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}
