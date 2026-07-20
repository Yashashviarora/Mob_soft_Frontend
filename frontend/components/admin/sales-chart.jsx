"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

// Single series -> one categorical slot (blue), no legend needed.
// Grid/axis ink stays recessive; only the bars carry color.
const BAR_COLOR = "#2a78d6";
const GRID_COLOR = "#e1e0d9";
const AXIS_COLOR = "#898781";

export function SalesChart({ sales }) {
  const data = [...sales]
    .sort((a, b) => new Date(a.sold_at).getTime() - new Date(b.sold_at).getTime())
    .map((s) => ({
      label: formatDate(s.sold_at),
      amount: s.sale_amount,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No sales recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={{ stroke: AXIS_COLOR }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <Tooltip
          cursor={{ fill: "rgba(42,120,214,0.08)" }}
          formatter={(value) => [formatCurrency(value), "Sale amount"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e1e0d9",
            fontSize: 13,
          }}
        />
        <Bar dataKey="amount" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
