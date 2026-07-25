import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Envoltura estándar de respuesta API (versionada).
export const API_VERSION = "v1";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ apiVersion: API_VERSION, data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    { apiVersion: API_VERSION, error: { code, message, details } },
    { status }
  );
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return errorResponse(422, "validation_error", "Payload inválido", err.flatten());
  }
  console.error(JSON.stringify({ level: "error", err: String(err) }));
  return errorResponse(500, "internal_error", "Error interno");
}
