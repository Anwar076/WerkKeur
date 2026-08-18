import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = "Niet geautoriseerd.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Geen toegang.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = "Niet gevonden.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return badRequest("Validatiefout.", error.flatten());
  }

  if (error instanceof Error) {
    return badRequest(error.message);
  }

  return badRequest("Onbekende fout.");
}
