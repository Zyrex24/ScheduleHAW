import { NextRequest, NextResponse } from "next/server";
import { pulseIdentity, pulseVote } from "@/lib/pulse/contracts";
import { pulseConfigured, pulseRead, pulseMutate } from "@/lib/pulse/server";
import { curriculum, termCatalog } from "@/lib/data/loaders";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const response = (value: unknown, status = 200) =>
  NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
function listed(courseId: string, termId: string) {
  return (
    curriculum.modules.some((m) => m.id === courseId) &&
    termCatalog.some((t) => t.id === termId && t.status === "published")
  );
}
function clientIP(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown"
  );
}
export async function GET(request: NextRequest) {
  if (!pulseConfigured()) return response({ code: "UNAVAILABLE" }, 503);
  const term = request.nextUrl.searchParams.get("termId");
  if (
    !term ||
    [...request.nextUrl.searchParams.keys()].some((k) => k !== "termId") ||
    !termCatalog.some((t) => t.id === term && t.status === "published")
  )
    return response({ code: "INVALID_REQUEST" }, 400);
  try {
    return response(await pulseRead(term, clientIP(request)));
  } catch (e) {
    return failure(e);
  }
}
function failure(e: unknown) {
  const code = e instanceof Error ? e.message : "";
  return code === "RATE_LIMIT"
    ? NextResponse.json(
        { code: "RATE_LIMIT" },
        {
          status: 429,
          headers: { "Retry-After": "3600", "Cache-Control": "no-store" },
        },
      )
    : code === "VOTING_CLOSED"
      ? response({ code: "VOTING_CLOSED" }, 409)
      : response({ code: "UNAVAILABLE" }, 503);
}
async function mutate(request: NextRequest, remove: boolean) {
  if (!pulseConfigured()) return response({ code: "UNAVAILABLE" }, 503);
  if (
    request.headers.get("origin") !== request.nextUrl.origin ||
    !request.headers.get("content-type")?.startsWith("application/json")
  )
    return response({ code: "INVALID_ORIGIN" }, 403);
  if (Number(request.headers.get("content-length") || 0) > 1024)
    return response({ code: "BODY_LIMIT" }, 413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return response({ code: "INVALID_REQUEST" }, 400);
    const chunks: Uint8Array[] = [],
      decoder = new TextDecoder();
    let bytes = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > 1024) {
        await reader.cancel();
        return response({ code: "BODY_LIMIT" }, 413);
      }
      chunks.push(value);
    }
    const raw = JSON.parse(
        chunks.map((c) => decoder.decode(c, { stream: true })).join("") +
          decoder.decode(),
      ),
      parsed = (remove ? pulseIdentity : pulseVote).safeParse(raw);
    if (!parsed.success || !listed(parsed.data.courseId, parsed.data.termId))
      return response({ code: "INVALID_REQUEST" }, 400);
    return response(await pulseMutate(parsed.data, clientIP(request), remove));
  } catch (e) {
    if (e instanceof SyntaxError)
      return response({ code: "INVALID_REQUEST" }, 400);
    return failure(e);
  }
}
export const POST = (request: NextRequest) => mutate(request, false);
export const DELETE = (request: NextRequest) => mutate(request, true);
