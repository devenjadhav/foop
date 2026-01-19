"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Success", value: 847, color: "#22c55e" },
  { name: "Failed", value: 89, color: "#ef4444" },
  { name: "Pending", value: 34, color: "#f59e0b" },
];

export function SuccessRatePieChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const successRate = ((data[0].value / total) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Success Rate
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fafafa",
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-zinc-600 dark:text-zinc-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <span className="text-3xl font-bold text-green-500">{successRate}%</span>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Overall success rate</p>
      </div>
    </div>
  );
}
