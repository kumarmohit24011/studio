
/**
 * Client-side cache invalidation utility
 * Calls the secure server-side API to trigger cache revalidation
 * Uses Firebase authentication to verify admin access
 */

type RevalidationType = 'products' | 'categories' | 'orders' | 'site-content' | 'promotions' | 'coupons';

/**
 * Trigger cache revalidation from client-side by calling secure server endpoint
 * Uses same-origin protection to ensure requests come from admin interface
 */
export async function triggerCacheRevalidation(type: RevalidationType, specificPath?: string) {
  try {
    // Only trigger if we're in admin context (same-origin protection on server)
    if (!window.location.pathname.includes('/admin')) {
      console.warn('Cache revalidation skipped: not in admin context');
      return;
    }

    const response = await fetch('/api/admin/cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        specificPath
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Cache revalidation failed for ${type}:`, error);
      return;
    }

    const result = await response.json();
    console.log(`Cache revalidated successfully for ${type}:`, result.message);
  } catch (error) {
    console.error(`Error triggering cache revalidation for ${type}:`, error);
    // Don't throw - cache revalidation failure shouldn't break the user operation
  }
}

/**
 * Trigger product cache revalidation including specific product page
 */
export async function triggerProductCacheRevalidation(productId?: string) {
  await triggerCacheRevalidation('products', productId ? `/products/${productId}` : undefined);
}

/**
 * Trigger category cache revalidation
 */
export async function triggerCategoryCacheRevalidation() {
  await triggerCacheRevalidation('categories');
}