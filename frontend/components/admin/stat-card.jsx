import { Card, CardContent } from "@/components/ui/card";

// Icon tile is intentionally neutral (not a rotating rainbow of accent
// colors) -- these are independent KPIs, not members of one categorical
// series, so color shouldn't be doing identity work here. Values stay in
// the default text ink; nothing here is a "good/bad" status signal.
export function StatCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
