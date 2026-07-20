import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ShoppingBag, Smartphone, Tv, Zap } from "lucide-react";
import { getPublicCategories, getPublicProduct } from "@/lib/api";
import { getFieldConfigForCategory } from "@/lib/category-fields";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ApiRequestError } from "@/lib/api";

const CATEGORY_ICONS = {
  phones: Smartphone,
  televisions: Tv,
  electronics: Zap,
  accessories: ShoppingBag,
};

function toLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function ProductDetailPage({ params }) {
  const productId = Number(params.id);
  if (Number.isNaN(productId)) notFound();

  let product;
  try {
    product = await getPublicProduct(productId);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) notFound();
    throw err;
  }

  const categories = await getPublicCategories().catch(() => []);
  const category = categories.find((c) => c.id === product.category_id);
  const fieldConfig = category ? getFieldConfigForCategory(category.name) : null;
  const CategoryIcon = CATEGORY_ICONS[category?.name?.toLowerCase()] ?? Package;

  const specEntries = Object.entries(product.specifications || {});

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to browsing
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-fuchsia-500/10 to-purple-500/10 md:aspect-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]" />
          <CategoryIcon
            className="relative h-28 w-28 text-primary/40 md:h-36 md:w-36"
            strokeWidth={1}
          />
        </div>

        <div className="space-y-6">
          <div>
            {category && (
              <Link href={`/category/${category.id}`}>
                <Badge variant="secondary" className="mb-3">
                  {category.name}
                </Badge>
              </Link>
            )}
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
            {(product.brand || product.model) && (
              <p className="text-muted-foreground mt-2">
                {[product.brand, product.model].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-muted/40 p-5">
            <span className="text-4xl font-bold tracking-tight">
              {formatCurrency(product.selling_price)}
            </span>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.condition && <Badge variant="outline">{product.condition}</Badge>}
              {product.warranty_months ? (
                <Badge variant="outline">{product.warranty_months} month warranty</Badge>
              ) : null}
            </div>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>

      {specEntries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Specifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specEntries.map(([key, value]) => {
              const def = fieldConfig?.find((f) => f.key === key);
              const label = def?.label ?? toLabel(key);
              const unit = def?.unit ? ` ${def.unit}` : "";
              const displayValue =
                typeof value === "boolean" ? (value ? "Yes" : "No") : `${value}${unit}`;
              return (
                <div key={key} className="rounded-xl border bg-muted/30 p-4">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                    {label}
                  </dt>
                  <dd className="mt-1 font-semibold">{displayValue}</dd>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
