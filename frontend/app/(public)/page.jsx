import { Suspense } from "react";
import Link from "next/link";
import { getPublicCategories, getPublicProducts } from "@/lib/api";
import { ProductCard } from "@/components/public/product-card";
import { SearchBar } from "@/components/public/search-bar";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage({ searchParams }) {
  const search = searchParams.search?.trim() || undefined;
  let products = [];
  let categories = [];

  try {
    [products, categories] = await Promise.all([
      getPublicProducts({ limit: 12, search }),
      getPublicCategories(),
    ]);
  } catch {
    // backend unreachable -- render an empty-state page instead of crashing
  }

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Find what you need
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse our current in-stock inventory.
          </p>
        </div>
        <Suspense>
          <SearchBar />
        </Suspense>
      </section>

      {!search && categories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Shop by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5 text-center font-medium">
                    {c.name}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">
          {search ? `Results for "${search}"` : "Recently added"}
        </h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {search
              ? "No in-stock items match your search."
              : "No products available right now. Check back soon."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
