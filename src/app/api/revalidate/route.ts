import { NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const tag = request.nextUrl.searchParams.get('tag');
  const path = request.nextUrl.searchParams.get('path');
  
  // Check for secret token to prevent unauthorized revalidation
  if (secret !== process.env.REVALIDATE_TOKEN) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }
  
  try {
    if (tag) {
      revalidateTag(tag); // Revalidate all pages using this tag
    }
    
    if (path) {
      revalidatePath(path); // Revalidate specific path
    } else {
      // If no specific path, revalidate main pages
      revalidatePath('/');
      revalidatePath('/products');
      revalidatePath('/admin');
    }
    
    return Response.json({ 
      revalidated: true, 
      now: Date.now(),
      message: `Successfully revalidated ${tag ? `tag: ${tag}` : `path: ${path || 'main pages'}`}`
    });
  } catch (err) {
    return Response.json({ message: 'Error revalidating' }, { status: 500 });
  }
}