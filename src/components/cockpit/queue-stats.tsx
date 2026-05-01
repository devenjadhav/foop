"use client";

import type { QueueStats } from "@/types/merge-queue";

function formatDuration(ms: number): string {
  if (ms < 1000) return "<1s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function StatCard({ label, value, subtext, color }: StatCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      {subtext && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{subtext}</p>
      )}
    </div>
  );
}

interface QueueStatsProps {
  stats: QueueStats;
}

export function QueueStatsDisplay({ stats }: QueueStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="In Queue"
        value={stats.pending}
        subtext="waiting to process"
        color="text-zinc-900 dark:text-zinc-100"
      />
      <StatCard
        label="Processing"
        value={stats.processing}
        subtext="running gates"
        color="text-blue-600 dark:text-blue-400"
      />
      <StatCard
        label="Merged"
        value={stats.merged}
        subtext="completed"
        color="text-green-600 dark:text-green-400"
      />
      <StatCard
        label="Failed"
        value={stats.failed}
        subtext="needs attention"
        color="text-red-600 dark:text-red-400"
      />
      <StatCard
        label="Avg Wait"
        value={formatDuration(stats.averageWaitTimeMs)}
        subtext="queue time"
        color="text-zinc-900 dark:text-zinc-100"
      />
      <StatCard
        label="Throughput"
        value={`${stats.throughputPerHour}/hr`}
        subtext="merges per hour"
        color="text-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}
