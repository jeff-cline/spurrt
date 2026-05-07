import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthed = !!req.auth?.user?.email;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!isAuthed) {
      const url = new URL("/login", nextUrl.origin);
      url.searchParams.set("next", nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    const user = req.auth?.user as any;
    if (!user?.isGod && !user?.isAdmin) {
      const url = new URL("/", nextUrl.origin);
      url.searchParams.set("error", "admin_only");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
