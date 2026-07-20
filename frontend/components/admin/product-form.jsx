"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpecFields } from "@/components/admin/spec-fields";

const CONDITION_OPTIONS = ["New", "Like New", "Excellent", "Good", "Fair", "For Parts"];

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.string().optional(),
  category_id: z.string().optional(),
  purchase_price: z.coerce.number({ invalid_type_error: "Required" }).min(0, "Must be 0 or more"),
  selling_price: z.coerce.number({ invalid_type_error: "Required" }).min(0, "Must be 0 or more"),
  stock_quantity: z.coerce
    .number({ invalid_type_error: "Required" })
    .int("Must be a whole number")
    .min(0, "Must be 0 or more"),
  // z.union tries branches in order and z.coerce.number() happily turns ""
  // into 0, so the empty-string branch must come first or it's dead code.
  warranty_months: z
    .union([z.literal(""), z.coerce.number().int().min(0)])
    .optional(),
});

export function ProductForm({
  categories,
  initialProduct,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Product",
  errorMessage,
}) {
  const [specifications, setSpecifications] = useState(
    initialProduct?.specifications ?? {}
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialProduct?.name ?? "",
      description: initialProduct?.description ?? "",
      brand: initialProduct?.brand ?? "",
      model: initialProduct?.model ?? "",
      condition: initialProduct?.condition ?? "",
      category_id: initialProduct?.category_id ? String(initialProduct.category_id) : "",
      purchase_price: initialProduct?.purchase_price ?? 0,
      selling_price: initialProduct?.selling_price ?? 0,
      stock_quantity: initialProduct?.stock_quantity ?? 0,
      warranty_months: initialProduct?.warranty_months ?? "",
    },
  });

  const categoryIdValue = watch("category_id");
  const selectedCategoryName = useMemo(() => {
    const id = Number(categoryIdValue);
    if (!id) return null;
    return categories.find((c) => c.id === id)?.name ?? null;
  }, [categoryIdValue, categories]);

  const submit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      brand: values.brand || null,
      model: values.model || null,
      condition: values.condition || null,
      purchase_price: values.purchase_price,
      selling_price: values.selling_price,
      stock_quantity: values.stock_quantity,
      warranty_months:
        values.warranty_months === "" || values.warranty_months === undefined
          ? null
          : Number(values.warranty_months),
      category_id: values.category_id ? Number(values.category_id) : null,
      specifications,
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" {...register("brand")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model">Model</Label>
            <Input id="model" {...register("model")} />
          </div>

          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select
              value={watch("condition") || undefined}
              onValueChange={(v) => setValue("condition", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={categoryIdValue || undefined}
              onValueChange={(v) => {
                setValue("category_id", v);
                setSpecifications({});
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; Stock</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="purchase_price">Purchase Price *</Label>
            <Input
              id="purchase_price"
              type="number"
              step="0.01"
              {...register("purchase_price")}
            />
            {errors.purchase_price && (
              <p className="text-sm text-destructive">{errors.purchase_price.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="selling_price">Selling Price *</Label>
            <Input
              id="selling_price"
              type="number"
              step="0.01"
              {...register("selling_price")}
            />
            {errors.selling_price && (
              <p className="text-sm text-destructive">{errors.selling_price.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stock_quantity">Stock Quantity *</Label>
            <Input id="stock_quantity" type="number" {...register("stock_quantity")} />
            {errors.stock_quantity && (
              <p className="text-sm text-destructive">{errors.stock_quantity.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="warranty_months">Warranty (months)</Label>
            <Input
              id="warranty_months"
              type="number"
              {...register("warranty_months")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <SpecFields
            categoryName={selectedCategoryName}
            value={specifications}
            onChange={setSpecifications}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
