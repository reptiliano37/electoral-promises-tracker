import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge, TopicBadge } from "@/components/Badges";
import { ScoreBar } from "@/components/ScoreBar";
import { statusMeta } from "@/lib/ui";
import { DEFAULT_DIMENSIONS, type DimensionKey } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const SOURCE_TYPE_LABEL: Record<string, string> = {
  official: "Oficial",
  press: "Prensa",
  ngo: "ONG",
  academic: "Académica",
  other: "Otra",
};

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default async function PromiseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const promise = await prisma.promise.findFirst({
    where: { slug: params.slug, isPublished: true },
    include: {
      party: true,
      election: true,
      candidate: true,
      evidenceItems: {
        include: { source: true },
        orderBy: { createdAt: "desc" },
      },
      scores: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!promise) notFound();

  const latestScore = promise.scores[0];
  const breakdown = (latestScore?.breakdown ?? {}) as Partial<
    Record<DimensionKey, number>
  >;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-gray-500">
        <Link href="/promesas" className="hover:text-gray-900">
          ← Volver a promesas
        </Link>
      </nav>

      {/* Cabecera */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <TopicBadge topic={promise.topic} />
          <StatusBadge status={promise.currentStatus} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {promise.title}
        </h1>
        <p className="text-lg text-gray-600">{promise.description}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>
            <span className="font-medium text-gray-700">Partido:</span>{" "}
            {promise.party.name} ({promise.party.shortName})
          </span>
          {promise.candidate && (
            <span>
              <span className="font-medium text-gray-700">Candidatura:</span>{" "}
              {promise.candidate.fullName}
            </span>
          )}
          <span>
            <span className="font-medium text-gray-700">Elección:</span>{" "}
            {promise.election.name}
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-8 lg:col-span-2">
          {/* Scoring */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Puntuación de cumplimiento</h2>
              {latestScore && (
                <span className="text-xs text-gray-400">
                  {latestScore.algoVersion} · confianza{" "}
                  {Math.round(latestScore.confidence * 100)}%
                </span>
              )}
            </div>

            <div className="mb-6 flex items-end gap-3">
              <div
                className="text-5xl font-bold"
                style={{ color: statusMeta(promise.currentStatus).color }}
              >
                {promise.currentScore ?? "—"}
              </div>
              <div className="pb-1 text-sm text-gray-500">/ 100</div>
            </div>

            <div className="space-y-4">
              {DEFAULT_DIMENSIONS.map((dim) => {
                const value = breakdown[dim.key] ?? 0;
                return (
                  <div key={dim.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {dim.label}
                        <span className="ml-1.5 text-xs text-gray-400">
                          peso {Math.round(dim.weight * 100)}%
                        </span>
                      </span>
                      <span className="text-gray-500">{value}/100</span>
                    </div>
                    <ScoreBar
                      value={value}
                      status={promise.currentStatus}
                      showLabel={false}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Evidencias */}
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Evidencias ({promise.evidenceItems.length})
            </h2>
            {promise.evidenceItems.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay evidencias registradas todavía.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {promise.evidenceItems.map((ev) => (
                  <li key={ev.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {ev.title}
                        </a>
                        {ev.excerpt && (
                          <p className="mt-0.5 text-sm text-gray-500">
                            {ev.excerpt}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                          <span>{ev.source.name}</span>
                          <span>
                            {SOURCE_TYPE_LABEL[ev.source.type] ?? ev.source.type}
                          </span>
                          {ev.publishedAt && (
                            <span>{formatDate(ev.publishedAt)}</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                          ev.supportsProgress
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {ev.supportsProgress ? "A favor" : "En contra"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Columna lateral: historial */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Historial de estado</h2>
            {promise.statusHistory.length === 0 ? (
              <p className="text-sm text-gray-500">Sin cambios registrados.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-gray-200 pl-4">
                {promise.statusHistory.map((h) => (
                  <li key={h.id} className="relative">
                    <span
                      className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: statusMeta(h.toStatus).color }}
                    />
                    <div className="text-sm font-medium text-gray-800">
                      {statusMeta(h.toStatus).label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(h.createdAt)}
                    </div>
                    {h.reason && (
                      <p className="mt-0.5 text-sm text-gray-500">{h.reason}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            <h2 className="mb-2 text-base font-semibold text-gray-900">
              ¿Cómo se calcula?
            </h2>
            <p>
              La puntuación combina cuatro dimensiones ponderadas a partir de
              evidencia pública verificada.{" "}
              <Link
                href="/metodologia"
                className="text-blue-600 hover:underline"
              >
                Ver metodología
              </Link>
              .
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
