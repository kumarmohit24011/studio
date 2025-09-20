
'use server';

import { getAllProducts } from '@/services/server/productQueries';
import { getAllCategories } from '@/services/server/categoryQueries';
import type { Product, Category } from '@/lib/types';


export async function searchProducts(searchTerm: string): Promise<Product[]> {
    try {
        if (!searchTerm.trim()) {
            return [];
        }

        const allProducts = await getAllProducts();
        const publishedProducts = allProducts.filter(p => p.isPublished);

        const searchTermLower = searchTerm.toLowerCase().trim();
        
        const filteredProducts = publishedProducts.filter(product => {
            const nameMatch = product.name?.toLowerCase().includes(searchTermLower);
            const descriptionMatch = product.description?.toLowerCase().includes(searchTermLower);
            const categoryMatch = product.category?.toLowerCase().includes(searchTermLower);
            const skuMatch = product.sku?.toLowerCase().includes(searchTermLower);
            const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchTermLower));
            
            return nameMatch || descriptionMatch || categoryMatch || skuMatch || tagsMatch;
        });

        return filteredProducts.sort((a, b) => {
            const aNameMatch = a.name?.toLowerCase().includes(searchTermLower) ? 1 : 0;
            const bNameMatch = b.name?.toLowerCase().includes(searchTermLower) ? 1 : 0;
            
            if (aNameMatch !== bNameMatch) {
                return bNameMatch - aNameMatch;
            }
            
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
        });
    } catch (error) {
        console.error("Error searching products:", error);
        return [];
    }
};

export async function searchCategories(searchTerm: string): Promise<Category[]> {
    try {
        if (!searchTerm.trim()) {
            return [];
        }
        const categories = await getAllCategories();
        const searchTermLower = searchTerm.toLowerCase().trim();
        
        const filteredCategories = categories.filter(category => {
            const nameMatch = category.name?.toLowerCase().includes(searchTermLower);
            const descriptionMatch = category.description?.toLowerCase().includes(searchTermLower);
            
            return nameMatch || descriptionMatch;
        });

        return filteredCategories.sort((a, b) => {
            const aNameMatch = a.name?.toLowerCase().includes(searchTermLower) ? 1 : 0;
            const bNameMatch = b.name?.toLowerCase().includes(searchTermLower) ? 1 : 0;
            
            if (aNameMatch !== bNameMatch) {
                return bNameMatch - aNameMatch;
            }
            
            return (a.order ?? 0) - (b.order ?? 0);
        });
    } catch (error) {
        console.error("Error searching categories:", error);
        return [];
    }
};


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
    return { products: [], categories: [] };
  }
}
