import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;

  // Check if we are on a protected path
  const protectedPaths = ['/generate', '/edit', '/api/extract-menu'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // If path is protected and no valid auth token, redirect to login
  if (isProtectedPath && authToken !== 'authenticated') {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If path is /login and we ARE authenticated, redirect to /
  if (request.nextUrl.pathname === '/login' && authToken === 'authenticated') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If path is / and NOT authenticated, redirect to /login
  if (request.nextUrl.pathname === '/' && authToken !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
