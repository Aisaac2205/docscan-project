import { NextRequest, NextResponse } from 'next/server';

// Protect routes under /dashboard, /documents, /scan and /features (server-side middleware)
const PROTECTED_PATHS = ['/dashboard', '/documents', '/scan', '/features', '/app'];

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // If the path is not protected, continue
  if (!PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Try to read token from cookies (docscan_token)
  const token = req.cookies.get('docscan_token')?.value || null;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/documents/:path*', '/scan/:path*', '/features/:path*'],
};
