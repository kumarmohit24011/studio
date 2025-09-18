
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin } from './lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

async function handleApiCors(request: NextRequest) {
    const origin = request.headers.get('origin');
    const allowedOrigins = process.env.NODE_ENV === 'development' 
      ? ['http://localhost:5000', 'https://replit.dev', 'https://repl.co'] 
      : (process.env.ALLOWED_ORIGINS?.split(',') || [
          'https://redbow-24723.web.app', 
          'https://redbow-24723.firebaseapp.com'
        ]);

    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 }); // Use 204 No Content for preflight
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }

    const response = NextResponse.next();
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return response;
}

export async function middleware(request: NextRequest) {
  // Handle CORS for all API routes, including the new server actions
  if (request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/admin/')) {
    // This is a simplified CORS setup; production apps might need more complex logic
    return handleApiCors(request);
  }

  // Session cookie logic for protecting admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
      const sessionCookie = cookies().get('__session')?.value;
      if (!sessionCookie) {
          return NextResponse.redirect(new URL('/login', request.url));
      }

      try {
          // Verify session cookie with Firebase Admin SDK
          await initAdmin();
          const auth = getAuth(admin.app('adminApp')); // Use existing app
          await auth.verifySessionCookie(sessionCookie, true);

          // If verification is successful, allow the request to proceed
          return NextResponse.next();
      } catch (error) {
          // If verification fails, redirect to login
          console.error("Session cookie verification failed:", error);
          const response = NextResponse.redirect(new URL('/login', request.url));
          // Clear the invalid cookie
          response.cookies.delete('__session');
          return response;
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
