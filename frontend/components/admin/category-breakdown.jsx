// Magnitude-per-category -> sequential encoding, one hue, light -> dark by
// proportion. Not categorical identity, so no legend / rainbow needed.
export function CategoryBreakdown({ data }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No category data yet.</p>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((c) => {
        const pct = Math.round((c.count / max) * 100);
        return (
          <div key={c.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground">{c.count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: "#2a78d6" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
