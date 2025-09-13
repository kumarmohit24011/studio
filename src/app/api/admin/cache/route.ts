import { NextRequest } from 'next/server';
import { revalidateDataCache } from '@/lib/cache-revalidation';

type RevalidationType = 'products' | 'categories' | 'orders' | 'site-content' | 'promotions' | 'coupons';

export async function POST(request: NextRequest) {
  try {
    // Same-origin protection: ensure request comes from admin interface
  const referer = request.headers.get('referer');
  const requestOrigin = new URL(request.url).origin;
  console.log('[Cache Revalidation] Incoming request');
  console.log('[Cache Revalidation] request.url:', request.url);
  console.log('[Cache Revalidation] requestOrigin:', requestOrigin);
  console.log('[Cache Revalidation] referer:', referer);
    
    // Verify request originates from admin interface using Referer header
    if (!referer) {
      console.error('Cache revalidation blocked: missing referer header');
      return Response.json({ error: 'Invalid request: missing referer' }, { status: 403 });
    }
    
    let refUrl;
    try {
      refUrl = new URL(referer);
      console.log('[Cache Revalidation] refUrl.origin:', refUrl.origin);
      console.log('[Cache Revalidation] refUrl.pathname:', refUrl.pathname);
    } catch (error) {
      console.error('Cache revalidation blocked: invalid referer URL:', referer);
      return Response.json({ error: 'Invalid request: invalid referer URL' }, { status: 403 });
    }
    
    // Ensure request comes from same origin and admin path
    // Allow both localhost and 0.0.0.0 for development environment, plus Replit domains
    const isDevelopment = process.env.NODE_ENV === 'development';
    const replitDomain = process.env.REPLIT_DEV_DOMAIN;
    const allowedOrigins = isDevelopment 
      ? [
          requestOrigin, 
          'http://localhost:5000', 
          'http://0.0.0.0:5000',
          ...(replitDomain ? [`https://${replitDomain}`, `http://${replitDomain}`] : [])
        ] 
      : [
          requestOrigin,
          'https://studio--redbow-24723.asia-east1.hosted.app/'
        ];
    console.log('[Cache Revalidation] allowedOrigins:', allowedOrigins);
    if (!allowedOrigins.includes(refUrl.origin)) {
      console.error(`[Cache Revalidation] referer origin mismatch. Expected one of [${allowedOrigins.join(', ')}], got ${refUrl.origin}`);
      return Response.json({ error: 'Invalid request: origin mismatch' }, { status: 403 });
    }
    
    if (!refUrl.pathname.startsWith('/admin')) {
      console.error(`Cache revalidation blocked: not from admin path. Path: ${refUrl.pathname}`);
      return Response.json({ error: 'Invalid request: not from admin interface' }, { status: 403 });
    }

    // Ensure proper content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return Response.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const { type, specificPath }: { type: RevalidationType; specificPath?: string } = await request.json();
    
    if (!type) {
      return Response.json({ error: 'Revalidation type is required' }, { status: 400 });
    }

    await revalidateDataCache(type, specificPath);
    
    console.log(`Cache revalidated for ${type}${specificPath ? ` and path: ${specificPath}` : ''}`);
    
    return Response.json({ 
      success: true,
      message: `Cache revalidated for ${type}${specificPath ? ` and path: ${specificPath}` : ''}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin cache revalidation error:', error);
    return Response.json(
      { error: 'Failed to revalidate cache', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}