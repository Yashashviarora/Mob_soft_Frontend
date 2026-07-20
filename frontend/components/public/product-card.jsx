import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug line-clamp-2">
              {product.name}
            </CardTitle>
          </div>
          {(product.brand || product.model) && (
            <p className="text-xs text-muted-foreground">
              {[product.brand, product.model].filter(Boolean).join(" · ")}
            </p>
          )}
        </CardHeader>
        <CardContent className="pb-2">
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.condition && (
              <Badge variant="secondary">{product.condition}</Badge>
            )}
            {product.warranty_months ? (
              <Badge variant="outline">
                {product.warranty_months} mo warranty
              </Badge>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <span className="text-lg font-semibold">
            {formatCurrency(product.selling_price)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
