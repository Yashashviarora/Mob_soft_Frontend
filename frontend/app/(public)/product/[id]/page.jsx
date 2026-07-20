import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicCategories, getPublicProduct } from "@/lib/api";
import { getFieldConfigForCategory } from "@/lib/category-fields";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ApiRequestError } from "@/lib/api";

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

  const specEntries = Object.entries(product.specifications || {});

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to browsing
      </Link>

      <div>
        {category && (
          <Link href={`/category/${category.id}`}>
            <Badge variant="secondary" className="mb-2">
              {category.name}
            </Badge>
          </Link>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        {(product.brand || product.model) && (
          <p className="text-muted-foreground mt-1">
            {[product.brand, product.model].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">
          {formatCurrency(product.selling_price)}
        </span>
        {product.condition && <Badge variant="outline">{product.condition}</Badge>}
        {product.warranty_months ? (
          <Badge variant="outline">{product.warranty_months} month warranty</Badge>
        ) : null}
      </div>

      {product.description && (
        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      )}

      {specEntries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Specifications</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 rounded-lg border p-4">
            {specEntries.map(([key, value]) => {
              const def = fieldConfig?.find((f) => f.key === key);
              const label = def?.label ?? toLabel(key);
              const unit = def?.unit ? ` ${def.unit}` : "";
              const displayValue =
                typeof value === "boolean" ? (value ? "Yes" : "No") : `${value}${unit}`;
              return (
                <div key={key} className="flex justify-between sm:justify-start sm:gap-2 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{displayValue}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </div>
  );
}
