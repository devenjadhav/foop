"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { range: "0-1s", count: 245 },
  { range: "1-2s", count: 312 },
  { range: "2-5s", count: 189 },
  { range: "5-10s", count: 124 },
  { range: "10-30s", count: 78 },
  { range: "30s-1m", count: 34 },
  { range: ">1m", count: 12 },
];

export function ExecutionTimeHistogram() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Execution Time Distribution
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#e4e4e7" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#e4e4e7" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fafafa",
              }}
              formatter={(value) => [`${value} runs`, "Count"]}
            />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
