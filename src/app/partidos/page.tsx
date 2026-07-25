import Link from "next/link";
import type { Route } from "next";
import { prisma } from "@/lib/db";
import { statusMeta, STATUS_ORDER, type PromiseStatusKey } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function PartiesPage() {
  const parties = await prisma.party.findMany({
    orderBy: { shortName: "asc" },
    select: {
      id: true,
      name: true,
      shortName: true,
      promises: {
        where: { isPublished: true },
        select: { currentStatus: true, currentScore: true },
      },
    },
  });

  const rows = parties
    .map((p) => {
      const total = p.promises.length;
      const counts = {} as Record<PromiseStatusKey, number>;
      let scoreSum = 0;
      let scored = 0;
      for (const pr of p.promises) {
        const st = pr.currentStatus as PromiseStatusKey;
        counts[st] = (counts[st] ?? 0) + 1;
        if (pr.currentScore != null) {
          scoreSum += pr.currentScore;
          scored += 1;
        }
      }
      const avgScore = scored > 0 ? Math.round(scoreSum / scored) : null;
      const fulfilled = counts["cumplida"] ?? 0;
      const fulfilledPct = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
      return { ...p, total, counts, avgScore, fulfilledPct };
    })
    .sort((a, b) => (b.avgScore ?? -1) - (a.avgScore ?? -1));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Comparativa por partido
        </h1>
        <p className="text-gray-500">
          Grado medio de cumplimiento y distribución de estados por formación.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          No hay partidos con promesas publicadas todavía.
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/promesas?party=${encodeURIComponent(p.shortName)}` as Route}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-700"
                  >
                    {p.name}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      ({p.shortName})
                    </span>
                  </Link>
                  <div className="text-sm text-gray-500">
                    {p.total} promesa{p.total === 1 ? "" : "s"} monitorizada
                    {p.total === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {p.avgScore ?? "—"}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    Score medio
                  </div>
                </div>
              </div>

              {/* Barra apilada de estados */}
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                {STATUS_ORDER.map((status) => {
                  const c = p.counts[status] ?? 0;
                  if (c === 0 || p.total === 0) return null;
                  return (
                    <div
                      key={status}
                      style={{
                        width: `${(c / p.total) * 100}%`,
                        backgroundColor: statusMeta(status).color,
                      }}
                      title={`${statusMeta(status).label}: ${c}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {STATUS_ORDER.map((status) => {
                  const c = p.counts[status] ?? 0;
                  if (c === 0) return null;
                  return (
                    <span
                      key={status}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: statusMeta(status).color }}
                      />
                      {statusMeta(status).label} ({c})
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
