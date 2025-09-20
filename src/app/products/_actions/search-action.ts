
'use server';

import { searchProducts } from '@/services/productService';
import { searchCategories } from '@/services/categoryService';

export async function searchProductsAndCategories(term: string) {
  if (!term.trim()) {
    return { products: [], categories: [] };
  }

  try {
    const [productResults, categoryResults] = await Promise.all([
      searchProducts(term),
      searchCategories(term),
    ]);

    return { products: productResults, categories: categoryResults };
  } catch (error) {
    console.error("Error in search server action:", error);
    // In a real app, you might want to log this error to a monitoring service
    return { products: [], categories: [] };
  }
}
