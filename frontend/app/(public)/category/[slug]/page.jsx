import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicCategories, getPublicProducts } from "@/lib/api";
import { ProductCard } from "@/components/public/product-card";
import { SearchBar } from "@/components/public/search-bar";

export default async function CategoryPage({ params, searchParams }) {
  const categoryId = Number(params.slug);
  if (Number.isNaN(categoryId)) notFound();
  const search = searchParams.search?.trim() || undefined;

  const [categories, products] = await Promise.all([
    getPublicCategories().catch(() => []),
    getPublicProducts({ category_id: categoryId, limit: 100, search }).catch(() => []),
  ]);

  const category = categories.find((c) => c.id === categoryId);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-1">
            {products.length} item{products.length === 1 ? "" : "s"} in stock
          </p>
        </div>
        <Suspense>
          <SearchBar placeholder={`Search within ${category.name}...`} />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {search
            ? "No in-stock items match your search in this category."
            : "No items currently in stock in this category."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
