import Link from "next/link";
import { prisma } from "@/lib/db";
import { PromiseCard, type PromiseCardData } from "@/components/PromiseCard";
import { statusMeta, STATUS_ORDER, type PromiseStatusKey } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [total, byStatus, featured] = await Promise.all([
    prisma.promise.count({ where: { isPublished: true } }),
    prisma.promise.groupBy({
      by: ["currentStatus"],
      where: { isPublished: true },
      _count: true,
    }),
    prisma.promise.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        slug: true,
        title: true,
        description: true,
        topic: true,
        currentStatus: true,
        currentScore: true,
        party: { select: { shortName: true, name: true } },
      },
    }),
  ]);

  const countFor = (status: PromiseStatusKey) =>
    byStatus.find((s) => s.currentStatus === status)?._count ?? 0;

  const fulfilled = countFor("cumplida");
  const fulfilledPct = total > 0 ? Math.round((fulfilled / total) * 100) : 0;

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="rounded-2xl border border-gray-200 bg-white px-6 py-12 sm:px-12 sm:py-16">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Seguimiento independiente · España
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          ¿Cumplen los partidos lo que prometen?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Seguimos las promesas electorales de los principales partidos de
          España y medimos su grado de cumplimiento con evidencia pública y una
          metodología transparente.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/promesas"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Explorar promesas
          </Link>
          <Link
            href="/partidos"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Comparar partidos
          </Link>
        </div>
      </section>

      {total === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          Aún no hay promesas publicadas. Ejecuta{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5">
            npm run db:seed
          </code>{" "}
          para cargar datos de ejemplo.
        </p>
      ) : (
        <>
          {/* KPIs */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Panorama general
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-3xl font-bold text-gray-900">{total}</div>
                <div className="text-sm text-gray-500">
                  Promesas monitorizadas
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-3xl font-bold text-green-600">
                  {fulfilledPct}%
                </div>
                <div className="text-sm text-gray-500">Cumplidas</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-3xl font-bold text-blue-600">
                  {countFor("en_progreso")}
                </div>
                <div className="text-sm text-gray-500">En progreso</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-3xl font-bold text-red-600">
                  {countFor("incumplida")}
                </div>
                <div className="text-sm text-gray-500">Incumplidas</div>
              </div>
            </div>

            {/* Barra de distribución por estado */}
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex h-3 w-full">
                {STATUS_ORDER.map((status) => {
                  const c = countFor(status);
                  if (c === 0) return null;
                  const pct = (c / total) * 100;
                  return (
                    <div
                      key={status}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: statusMeta(status).color,
                      }}
                      title={`${statusMeta(status).label}: ${c}`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 p-3 text-xs text-gray-600">
                {STATUS_ORDER.map((status) => {
                  const c = countFor(status);
                  if (c === 0) return null;
                  return (
                    <span key={status} className="inline-flex items-center gap-1.5">
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
          </section>

          {/* Promesas destacadas */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Actualizaciones recientes
              </h2>
              <Link
                href="/promesas"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Ver todas →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PromiseCard key={p.slug} promise={p as PromiseCardData} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
