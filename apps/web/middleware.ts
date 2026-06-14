import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard"];
const PUBLIC = ["/", "/connexion", "/inscription", "/experts", "/verifier", "/contact-entreprise", "/api/webhooks", "/api/auth"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected && !req.auth) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|webmanifest)).*)"],
};
