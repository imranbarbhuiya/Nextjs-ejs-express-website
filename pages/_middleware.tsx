import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { pathname } = req.nextUrl;
  if (pathname == "/test") {
    return NextResponse.redirect("/blog");
  }
  return NextResponse.next();
}
