"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "Jan 1", runs: 45 },
  { date: "Jan 2", runs: 52 },
  { date: "Jan 3", runs: 38 },
  { date: "Jan 4", runs: 65 },
  { date: "Jan 5", runs: 48 },
  { date: "Jan 6", runs: 72 },
  { date: "Jan 7", runs: 85 },
  { date: "Jan 8", runs: 91 },
  { date: "Jan 9", runs: 78 },
  { date: "Jan 10", runs: 110 },
  { date: "Jan 11", runs: 95 },
  { date: "Jan 12", runs: 88 },
  { date: "Jan 13", runs: 102 },
  { date: "Jan 14", runs: 125 },
];

export function WorkflowRunsChart() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Workflow Runs Over Time
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="date"
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
            />
            <Area
              type="monotone"
              dataKey="runs"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRuns)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
