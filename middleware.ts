import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect routes - simple protection without auth state
  if (
    ['/dashboard', '/workflows', '/demo', '/audit'].some((path) =>
      pathname.startsWith(path)
    )
  ) {
    // In production, you would validate the session here
    // For now, just allow access - Supabase auth will handle protection client-side
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)',
  ],
};
