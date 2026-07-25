import Link from "next/link";
import type { Route } from "next";
import { StatusBadge, TopicBadge } from "@/components/Badges";
import { ScoreBar } from "@/components/ScoreBar";

export interface PromiseCardData {
  slug: string;
  title: string;
  description?: string;
  topic: string;
  currentStatus: string;
  currentScore?: number | null;
  party: { shortName: string; name?: string };
}

export function PromiseCard({ promise }: { promise: PromiseCardData }) {
  return (
    <Link
      href={`/promesas/${promise.slug}` as Route}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TopicBadge topic={promise.topic} />
        <StatusBadge status={promise.currentStatus} />
      </div>

      <h3 className="mb-1 line-clamp-2 font-semibold leading-snug text-gray-900 group-hover:text-blue-700">
        {promise.title}
      </h3>

      {promise.description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-500">
          {promise.description}
        </p>
      )}

      <div className="mt-auto space-y-2 pt-2">
        <ScoreBar value={promise.currentScore} status={promise.currentStatus} />
        <div className="flex items-center justify-between text-xs">
          <span
            className="inline-flex items-center gap-1.5 font-medium text-gray-700"
            title={promise.party.name}
          >
            <span className="h-2 w-2 rounded-full bg-gray-400" aria-hidden />
            {promise.party.shortName}
          </span>
          <span className="text-blue-600 opacity-0 transition group-hover:opacity-100">
            Ver seguimiento →
          </span>
        </div>
      </div>
    </Link>
  );
}
