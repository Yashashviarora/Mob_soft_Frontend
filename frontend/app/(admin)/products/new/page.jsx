"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { createProduct, getCategories } from "@/lib/api";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(token),
    enabled: Boolean(token),
  });

  async function handleSubmit(data) {
    setIsSubmitting(true);
    setError(null);
    try {
      await createProduct(data, token);
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
        <p className="text-muted-foreground mt-1">
          Create a new product in your inventory.
        </p>
      </div>

      <ProductForm
        categories={categories ?? []}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Product"
        errorMessage={error}
      />
    </div>
  );
}
