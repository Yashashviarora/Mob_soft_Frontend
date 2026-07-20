"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getCategories, getProduct, updateProduct } from "@/lib/api";
import { ProductForm } from "@/components/admin/product-form";

export default function EditProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(token),
    enabled: Boolean(token),
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId, token),
    enabled: Boolean(token) && !Number.isNaN(productId),
  });

  async function handleSubmit(data) {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProduct(productId, data, token);
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update product");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground mt-1">
          Update product details and specifications.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !product ? (
        <p className="text-sm text-muted-foreground">Product not found.</p>
      ) : (
        <ProductForm
          categories={categories ?? []}
          initialProduct={product}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          errorMessage={error}
        />
      )}
    </div>
  );
}
