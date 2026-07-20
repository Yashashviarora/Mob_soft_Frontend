"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  ApiRequestError,
  deleteProduct,
  getCategories,
  getProducts,
  sellProduct,
} from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const { token, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("in_stock");
  const [categoryId, setCategoryId] = useState("all");
  const [skip, setSkip] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [sellTarget, setSellTarget] = useState(null);
  const [sellQuantity, setSellQuantity] = useState("1");
  const [sellAmount, setSellAmount] = useState("");
  const [sellError, setSellError] = useState(null);
  const [listError, setListError] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(token),
    enabled: Boolean(token),
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", status, categoryId, skip, debouncedSearch],
    queryFn: () =>
      getProducts(
        {
          status,
          skip,
          limit: PAGE_SIZE,
          category_id: categoryId !== "all" ? Number(categoryId) : undefined,
          search: debouncedSearch || undefined,
        },
        token
      ),
    enabled: Boolean(token),
  });

  function switchTab(next) {
    setStatus(next);
    setSkip(0);
  }

  function changeCategory(next) {
    setCategoryId(next);
    setSkip(0);
  }

  function changeSearch(next) {
    setSearchInput(next);
    setSkip(0);
  }

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setListError(null);
    },
    onError: (err) => {
      setListError(
        err instanceof ApiRequestError ? err.message : "Could not delete product"
      );
    },
  });

  const sellMutation = useMutation({
    mutationFn: () =>
      sellProduct(
        sellTarget.id,
        { quantity: Number(sellQuantity), sale_amount: Number(sellAmount) },
        token
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSellTarget(null);
    },
    onError: (err) => {
      setSellError(err instanceof Error ? err.message : "Could not record sale");
    },
  });

  function openSellDialog(product) {
    setSellTarget(product);
    setSellQuantity("1");
    setSellAmount(String(product.selling_price));
    setSellError(null);
  }

  function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(product.id);
  }

  const categoryName = (id) =>
    categories?.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory.
          </p>
        </div>
        {isSuperAdmin ? (
          <Button asChild>
            <Link href="/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>View only</TooltipContent>
          </Tooltip>
        )}
      </div>

      {listError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <Tabs value={status} onValueChange={switchTab}>
          <TabsList>
            <TabsTrigger value="in_stock">In Stock</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Search by name, brand, model..."
              className="pl-8"
            />
          </div>

          <Select value={categoryId} onValueChange={changeCategory}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {status === "in_stock" ? "In Stock" : "Sold"} Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !products || products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {(product.brand || product.model) && (
                        <div className="text-xs text-muted-foreground">
                          {[product.brand, product.model].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{categoryName(product.category_id)}</TableCell>
                    <TableCell>{formatCurrency(product.selling_price)}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>{product.sold_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "in_stock" ? "success" : "secondary"}>
                        {product.status === "in_stock" ? "In Stock" : "Sold"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isSuperAdmin ? (
                        <div className="flex justify-end gap-1">
                          {product.status === "in_stock" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Mark Sold"
                              onClick={() => openSellDialog(product)}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/products/${product.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          {product.sold_quantity > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button variant="ghost" size="icon" disabled>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Has sale history — can&apos;t be deleted, set stock to 0 instead
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground">
                              View only
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Only super admins can modify products
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {products?.length ? skip + 1 : 0}
              {products?.length ? `–${skip + products.length}` : ""}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!products || products.length < PAGE_SIZE}
                onClick={() => setSkip(skip + PAGE_SIZE)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(sellTarget)}
        onOpenChange={(open) => !open && setSellTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Sold</DialogTitle>
          </DialogHeader>
          {sellTarget && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSellError(null);
                sellMutation.mutate();
              }}
            >
              <p className="text-sm text-muted-foreground">
                {sellTarget.name} &middot; {sellTarget.stock_quantity} in stock
              </p>
              {sellError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {sellError}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="sell-quantity">Quantity</Label>
                <Input
                  id="sell-quantity"
                  type="number"
                  min={1}
                  max={sellTarget.stock_quantity}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sell-amount">Sale Amount (total)</Label>
                <Input
                  id="sell-amount"
                  type="number"
                  step="0.01"
                  min={0}
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={sellMutation.isPending}>
                  {sellMutation.isPending ? "Recording..." : "Confirm Sale"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
