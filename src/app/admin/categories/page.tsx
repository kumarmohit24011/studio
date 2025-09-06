
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCategories } from "@/services/categoryService";
import { CategoryActions } from "./_components/actions";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

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
