"use client";

import { useState } from "react";
import Link from "next/link";
import { mockMergeRequests, mockRefineryConfig } from "@/lib/refinery";
import { QueueStatsDisplay } from "@/components/cockpit/queue-stats";
import { MergeQueueTable } from "@/components/cockpit/merge-queue-table";
import { MergeRequestDetail } from "@/components/cockpit/merge-request-detail";
import { RefineryConfigPanel } from "@/components/cockpit/refinery-config-panel";
import type { MergeRequest, QueueStats } from "@/types/merge-queue";

type FilterTab = "active" | "merged" | "failed" | "all";

function computeStats(mergeRequests: MergeRequest[]): QueueStats {
  const now = Date.now();
  const pending = mergeRequests.filter((mr) => mr.status === "pending");
  const processing = mergeRequests.filter(
    (mr) => mr.status === "validating" || mr.status === "processing"
  );
  const merged = mergeRequests.filter((mr) => mr.status === "merged");
  const failed = mergeRequests.filter((mr) => mr.status === "failed");

  const waitTimes = pending.map((mr) => now - mr.submittedAt.getTime());
  const processTimes = merged
    .filter((mr) => mr.mergedAt)
    .map((mr) => mr.mergedAt!.getTime() - mr.submittedAt.getTime());

  const oneHourAgo = now - 3600000;
  const mergedLastHour = merged.filter(
    (mr) => mr.mergedAt && mr.mergedAt.getTime() > oneHourAgo
  ).length;

  return {
    total: mergeRequests.length,
    pending: pending.length,
    processing: processing.length,
    merged: merged.length,
    failed: failed.length,
    averageWaitTimeMs:
      waitTimes.length > 0
        ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
        : 0,
    averageProcessTimeMs:
      processTimes.length > 0
        ? processTimes.reduce((a, b) => a + b, 0) / processTimes.length
        : 0,
    throughputPerHour: mergedLastHour,
  };
}

function filterMergeRequests(
  mergeRequests: MergeRequest[],
  tab: FilterTab
): MergeRequest[] {
  switch (tab) {
    case "active":
      return mergeRequests.filter(
        (mr) =>
          mr.status === "pending" ||
          mr.status === "validating" ||
          mr.status === "processing"
      );
    case "merged":
      return mergeRequests.filter((mr) => mr.status === "merged");
    case "failed":
      return mergeRequests.filter((mr) => mr.status === "failed");
    case "all":
      return mergeRequests;
  }
}

const tabs: { key: FilterTab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "merged", label: "Merged" },
  { key: "failed", label: "Failed" },
  { key: "all", label: "All" },
];

export default function CockpitPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("active");
  const [selectedMr, setSelectedMr] = useState<MergeRequest | null>(null);

  const stats = computeStats(mockMergeRequests);
  const filteredRequests = filterMergeRequests(mockMergeRequests, activeTab);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold">
                Foop
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/workflows"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Workflows
                </Link>
                <Link
                  href="/cockpit"
                  className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                >
                  Cockpit
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Refinery Online
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Merge Queue
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Refinery processes merge requests through validation gates before
            merging to main.
          </p>
        </div>

        <div className="mb-8">
          <QueueStatsDisplay stats={stats} />
        </div>

        <div className="mb-6 flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
          {tabs.map((tab) => {
            const count =
              tab.key === "all"
                ? mockMergeRequests.length
                : filterMergeRequests(mockMergeRequests, tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedMr(null);
                }}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                    {count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100" />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className={selectedMr ? "lg:col-span-2" : "lg:col-span-3"}>
            <MergeQueueTable
              mergeRequests={filteredRequests}
              onSelect={setSelectedMr}
              selectedId={selectedMr?.id}
            />
          </div>

          {selectedMr && (
            <div className="space-y-6">
              <MergeRequestDetail mergeRequest={selectedMr} />
              <RefineryConfigPanel config={mockRefineryConfig} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
