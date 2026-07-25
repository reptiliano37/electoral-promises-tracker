import Link from "next/link";
import type { Route } from "next";
import { prisma } from "@/lib/db";
import { PromiseCard, type PromiseCardData } from "@/components/PromiseCard";
import {
  statusMeta,
  topicMeta,
  STATUS_ORDER,
  type PromiseStatusKey,
} from "@/lib/ui";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface SearchParams {
  party?: string;
  topic?: string;
  status?: string;
}

function buildQuery(base: SearchParams, patch: Partial<SearchParams>) {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/promesas?${qs}` : "/promesas";
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href as Route}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function PromisesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp: SearchParams = {
    party: searchParams.party,
    topic: searchParams.topic,
    status: searchParams.status,
  };

  const where: Prisma.PromiseWhereInput = {
    isPublished: true,
    ...(sp.topic ? { topic: sp.topic } : {}),
    ...(sp.status
      ? { currentStatus: sp.status as PromiseStatusKey }
      : {}),
    ...(sp.party ? { party: { shortName: sp.party } } : {}),
  };

  const [parties, topics, promises] = await Promise.all([
    prisma.party.findMany({
      orderBy: { shortName: "asc" },
      select: { shortName: true, name: true },
    }),
    prisma.promise.findMany({
      where: { isPublished: true },
      distinct: ["topic"],
      select: { topic: true },
      orderBy: { topic: "asc" },
    }),
    prisma.promise.findMany({
      where,
      orderBy: { updatedAt: "desc" },
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Promesas</h1>
        <p className="text-gray-500">
          {promises.length} promesa{promises.length === 1 ? "" : "s"}{" "}
          {(sp.party || sp.topic || sp.status) && "con los filtros aplicados"}
        </p>
      </header>

      {/* Filtros */}
      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Partido
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip href={buildQuery(sp, { party: undefined })} active={!sp.party}>
              Todos
            </FilterChip>
            {parties.map((p) => (
              <FilterChip
                key={p.shortName}
                href={buildQuery(sp, { party: p.shortName })}
                active={sp.party === p.shortName}
              >
                {p.shortName}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Tema
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip href={buildQuery(sp, { topic: undefined })} active={!sp.topic}>
              Todos
            </FilterChip>
            {topics.map(({ topic }) => (
              <FilterChip
                key={topic}
                href={buildQuery(sp, { topic })}
                active={sp.topic === topic}
              >
                {topicMeta(topic).emoji} {topicMeta(topic).label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Estado
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip href={buildQuery(sp, { status: undefined })} active={!sp.status}>
              Todos
            </FilterChip>
            {STATUS_ORDER.map((status) => (
              <FilterChip
                key={status}
                href={buildQuery(sp, { status })}
                active={sp.status === status}
              >
                {statusMeta(status).label}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {promises.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          No hay promesas que coincidan con los filtros.{" "}
          <Link href="/promesas" className="text-blue-600 hover:underline">
            Limpiar filtros
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((p) => (
            <PromiseCard key={p.slug} promise={p as PromiseCardData} />
          ))}
        </div>
      )}
    </div>
  );
}
