import { prisma } from "@/lib/db";
import { ok, handleError } from "@/lib/api";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/v1/promises — endpoint público de lectura con filtros.
// Filtros: ?party=&candidate=&topic=&status=&election=&from=&to=&page=&pageSize=
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? 20)));

    const where = {
      isPublished: true,
      ...(sp.get("party") ? { partyId: sp.get("party")! } : {}),
      ...(sp.get("candidate") ? { candidateId: sp.get("candidate")! } : {}),
      ...(sp.get("topic") ? { topic: sp.get("topic")! } : {}),
      ...(sp.get("election") ? { electionId: sp.get("election")! } : {}),
      ...(sp.get("status")
        ? { currentStatus: sp.get("status") as never }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.promise.count({ where }),
      prisma.promise.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          topic: true,
          currentStatus: true,
          currentScore: true,
          party: { select: { shortName: true } },
        },
      }),
    ]);

    return ok({ items, page, pageSize, total });
  } catch (err) {
    return handleError(err);
  }
}
