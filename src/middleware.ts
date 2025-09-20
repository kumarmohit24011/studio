
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from './lib/firebase-admin';

// This middleware is now much simpler. It only handles route protection.
// CORS handling might be needed depending on your API usage, but we remove it for now to simplify.

export async function middleware(request: NextRequest) {

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
      const sessionCookie = cookies().get('__session')?.value;
      if (!sessionCookie) {
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
          return NextResponse.redirect(redirectUrl);
      }

      try {
          if(!adminAuth) {
             throw new Error("Auth is not initialized");
          }
          // Verify session cookie with the initialized Firebase Admin SDK
          await adminAuth.verifySessionCookie(sessionCookie, true);
          return NextResponse.next();
      } catch (error) {
          console.warn("Admin route protection: Session cookie verification failed:", error);
          const response = NextResponse.redirect(new URL('/login', request.url));
          // Clear the invalid session cookie
          response.cookies.delete('__session');
          return response;
      }
  }

  return NextResponse.next();
}

export const config = {
  // We only match the admin routes now.
  // API routes using server actions don't need to be matched here.
  matcher: ['/admin/:path*'],
};
