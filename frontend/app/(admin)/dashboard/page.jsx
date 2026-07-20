"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle2, Boxes, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDashboard } from "@/lib/api";
import { StatCard } from "@/components/admin/stat-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { CategoryBreakdown } from "@/components/admin/category-breakdown";
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
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(token),
    enabled: Boolean(token),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          A snapshot of inventory and sales activity.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load dashboard data.
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Products"
              value={data.total_products}
              icon={Package}
            />
            <StatCard
              label="In Stock"
              value={data.in_stock_items}
              icon={Boxes}
            />
            <StatCard
              label="Sold Items"
              value={data.sold_items}
              icon={CheckCircle2}
            />
            <StatCard
              label="Sales This Month"
              value={formatCurrency(data.monthly_sales)}
              icon={DollarSign}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart sales={data.recent_sales} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBreakdown data={data.category_summary} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales Detail</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recent_sales.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sales recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sale ID</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recent_sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>#{sale.id}</TableCell>
                        <TableCell>#{sale.product_id}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{formatCurrency(sale.sale_amount)}</TableCell>
                        <TableCell>{formatDateTime(sale.sold_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
