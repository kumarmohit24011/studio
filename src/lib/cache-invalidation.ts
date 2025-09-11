// Helper function to trigger cache invalidation after admin operations
export const invalidateCache = async (type?: 'products' | 'categories' | 'orders' | 'all') => {
  if (typeof window === 'undefined') {
    // Only run on client-side
    return;
  }
  
  try {
    const baseUrl = window.location.origin;
    const token = process.env.NEXT_PUBLIC_REVALIDATE_TOKEN || 'your-secret-token';
    
    let pathsToInvalidate: string[] = [];
    
    switch (type) {
      case 'products':
        pathsToInvalidate = ['/', '/products'];
        break;
      case 'categories':
        pathsToInvalidate = ['/', '/products']; // Categories affect home and products pages
        break;
      case 'orders':
        pathsToInvalidate = ['/admin'];
        break;
      case 'all':
      default:
        pathsToInvalidate = ['/', '/products', '/admin'];
        break;
    }
    
    // Call cache invalidation for each path
    for (const path of pathsToInvalidate) {
      await fetch(`${baseUrl}/api/cache?secret=${token}&path=${encodeURIComponent(path)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    
    console.log(`Cache invalidated for: ${pathsToInvalidate.join(', ')}`);
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    // Don't throw error to avoid breaking admin operations
  }
};