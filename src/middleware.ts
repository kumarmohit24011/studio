
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from './lib/firebase-admin'; // Import directly

async function handleApiCors(request: NextRequest) {
    const origin = request.headers.get('origin');
    const allowedOrigins = process.env.NODE_ENV === 'development' 
      ? ['http://localhost:5000', 'https://replit.dev', 'https://repl.co'] 
      : (process.env.ALLOWED_ORIGINS?.split(',') || [
          'https://redbow-24723.web.app', 
          'https://redbow-24723.firebaseapp.com'
        ]);

    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (origin && allowedOrigins.some(allowed => origin.includes(allowed))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }

    const response = NextResponse.next();
    if (origin && allowedOrigins.some(allowed => origin.includes(allowed))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return response;
}

export async function middleware(request: NextRequest) {
  // CORS handling can be simplified or removed depending on whether you call APIs from external origins
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return handleApiCors(request);
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
      const sessionCookie = cookies().get('__session')?.value;
      if (!sessionCookie) {
          const redirectUrl = new URL('/login', request.url);
          redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
          return NextResponse.redirect(redirectUrl);
      }

      try {
          // Verify session cookie with the initialized Firebase Admin SDK
          await adminAuth.verifySessionCookie(sessionCookie, true);
          return NextResponse.next();
      } catch (error) {
          console.error("Session cookie verification failed:", error);
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete('__session');
          return response;
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
