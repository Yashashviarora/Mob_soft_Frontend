import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublicCategories, getPublicProducts } from "@/lib/api";
import { ProductCard } from "@/components/public/product-card";
import { SearchBar } from "@/components/public/search-bar";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.id}`} className="group relative block">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-orange-400 via-fuchsia-500 to-purple-600 opacity-0 blur-md transition duration-500 group-hover:opacity-70" />
                <div className="relative flex h-full min-h-[160px] flex-col justify-between rounded-2xl bg-muted/60 p-5">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{c.name}</h3>
                    {c.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-medium">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
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
