import { NextRequest, NextResponse } from "next/server";
// Next's declarative redirect matcher is case insensitive; an exact path check
// preserves the archived URL without redirecting the lowercase route to itself.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/Schedule")
    return NextResponse.redirect(new URL("/schedule", request.url), 308);
  return NextResponse.next();
}
