import { statusMeta } from "@/lib/ui";

// Barra de progreso 0-100 coloreada según el estado de la promesa.
export function ScoreBar({
  value,
  status,
  showLabel = true,
}: {
  value: number | null | undefined;
  status?: string;
  showLabel?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const color = status ? statusMeta(status).color : "#2563eb";
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${v}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs font-medium text-gray-500">
          {value == null ? "Sin puntuar" : `${v}/100`}
        </div>
      )}
    </div>
  );
}
