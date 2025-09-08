
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCategories } from "@/services/categoryService";
import { CategoryActions } from "./_components/actions";
import type { Category } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const categoriesData = await getAllCategories();

  // Convert Firestore Timestamps to serializable format
  const categories: Category[] = categoriesData.map(cat => ({
    ...cat,
    createdAt: cat.createdAt?.seconds ? new Date(cat.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
  }));


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Categories</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Add, edit, or delete your product categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <CategoryActions categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
