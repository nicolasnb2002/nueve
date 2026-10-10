import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMounted } from "@/lib/use-mounted";

const tip = {
  contentStyle: {
    background: "var(--color-elevated)",
    border: "1px solid var(--color-line)",
    borderRadius: 8,
    color: "var(--color-fg)",
  },
  labelStyle: { color: "var(--color-muted)" },
};

export function LinePanel({
  series,
}: {
  series: { name: string; values: number[]; tone: "fg" | "mark" }[];
}) {
  const mounted = useMounted();
  if (!mounted || series.length === 0 || series[0].values.length === 0) {
    return <div className="chart-slot" />;
  }
  const data = series[0].values.map((_, index) => {
    const row: Record<string, number> = { i: index + 1 };
    for (const item of series) row[item.name] = item.values[index] ?? 0;
    return row;
  });
  return (
    <div className="chart-slot">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="i"
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            stroke="var(--color-line)"
          />
          <YAxis
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            stroke="var(--color-line)"
            width={48}
          />
          <Tooltip {...tip} />
          {series.map((item) => (
            <Line
              key={item.name}
              type="monotone"
              dataKey={item.name}
              dot={false}
              strokeWidth={1.75}
              isAnimationActive={false}
              stroke={item.tone === "fg" ? "var(--color-fg)" : "var(--color-mark)"}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HistPanel({
  rows,
}: {
  rows: { name: string; y: number; hot: boolean }[];
}) {
  const mounted = useMounted();
  if (!mounted) return <div className="chart-slot" />;
  return (
    <div className="chart-slot">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            stroke="var(--color-line)"
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--color-faint)", fontSize: 11 }}
            stroke="var(--color-line)"
            width={32}
            allowDecimals={false}
          />
          <Tooltip {...tip} />
          <Bar dataKey="y" isAnimationActive={false} name="Cantidad">
            {rows.map((row) => (
              <Cell key={row.name} fill={row.hot ? "var(--color-fg)" : "var(--color-mark)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function histogram(
  values: number[],
  count: number,
  digits: number,
  hotAt?: number,
): { name: string; y: number; hot: boolean }[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = span / count;
  const rows = Array.from({ length: count }, (_, index) => ({
    name: (min + (index + 0.5) * width).toFixed(digits).replace(".", ","),
    y: 0,
    hot: false,
    lo: min + index * width,
  }));
  for (const value of values) {
    let index = Math.floor((value - min) / width);
    if (index >= count) index = count - 1;
    if (index < 0) index = 0;
    rows[index].y += 1;
  }
  if (hotAt !== undefined) {
    let index = Math.floor((hotAt - min) / width);
    if (index >= count) index = count - 1;
    if (index < 0) index = 0;
    rows[index].hot = true;
  }
  return rows.map(({ name, y, hot }) => ({ name, y, hot }));
}
