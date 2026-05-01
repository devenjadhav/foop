import type {
  MergeRequest,
  MergeRequestStatus,
  GateStatus,
  QueueStats,
  RefineryConfig,
} from "@/types/merge-queue";

const DEFAULT_CONFIG: RefineryConfig = {
  maxConcurrent: 1,
  gateTimeout: 300000,
  retryPolicy: {
    maxRetries: 2,
    backoffMs: 5000,
  },
  gates: ["build", "typecheck", "lint", "test"],
  autoRebase: true,
  bisectOnFailure: true,
};

export class RefineryProcessor {
  private queue: MergeRequest[] = [];
  private config: RefineryConfig;

  constructor(config: Partial<RefineryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getQueue(): MergeRequest[] {
    return [...this.queue];
  }

  getConfig(): RefineryConfig {
    return { ...this.config };
  }

  enqueue(mr: MergeRequest): MergeRequest {
    const position = this.queue.filter(
      (item) => item.status === "pending" || item.status === "validating"
    ).length;

    const enqueued: MergeRequest = {
      ...mr,
      status: "pending",
      position,
      gates: this.config.gates.map((name) => ({
        name,
        status: "pending" as GateStatus,
      })),
      retryCount: 0,
      maxRetries: this.config.retryPolicy.maxRetries,
    };

    this.queue.push(enqueued);
    return enqueued;
  }

  cancel(mrId: string): MergeRequest | null {
    const mr = this.queue.find((item) => item.id === mrId);
    if (!mr) return null;
    if (mr.status === "merged" || mr.status === "cancelled") return mr;

    mr.status = "cancelled";
    mr.updatedAt = new Date();
    this.recomputePositions();
    return mr;
  }

  retry(mrId: string): MergeRequest | null {
    const mr = this.queue.find((item) => item.id === mrId);
    if (!mr) return null;
    if (mr.status !== "failed") return mr;
    if (mr.retryCount >= mr.maxRetries) return mr;

    mr.retryCount++;
    mr.status = "pending";
    mr.errorMessage = undefined;
    mr.updatedAt = new Date();
    mr.gates = this.config.gates.map((name) => ({
      name,
      status: "pending" as GateStatus,
    }));
    this.recomputePositions();
    return mr;
  }

  promote(mrId: string): MergeRequest | null {
    const mr = this.queue.find((item) => item.id === mrId);
    if (!mr || mr.status !== "pending") return mr ?? null;

    const pendingItems = this.queue.filter(
      (item) => item.status === "pending" && item.id !== mrId
    );
    mr.position = 0;
    mr.updatedAt = new Date();
    pendingItems.forEach((item, idx) => {
      item.position = idx + 1;
    });

    return mr;
  }

  processNext(): MergeRequest | null {
    const activeCount = this.queue.filter(
      (item) => item.status === "validating" || item.status === "processing"
    ).length;

    if (activeCount >= this.config.maxConcurrent) return null;

    const next = this.queue
      .filter((item) => item.status === "pending")
      .sort((a, b) => a.position - b.position)[0];

    if (!next) return null;

    next.status = "validating";
    next.updatedAt = new Date();
    return next;
  }

  updateGate(
    mrId: string,
    gateName: string,
    status: GateStatus,
    output?: string
  ): MergeRequest | null {
    const mr = this.queue.find((item) => item.id === mrId);
    if (!mr) return null;

    const gate = mr.gates.find((g) => g.name === gateName);
    if (!gate) return null;

    gate.status = status;
    gate.completedAt = status === "running" ? undefined : new Date();
    gate.startedAt = gate.startedAt ?? new Date();
    if (output) gate.output = output;
    if (status === "failed") gate.errorMessage = output;

    mr.updatedAt = new Date();

    if (status === "failed") {
      mr.status = "failed";
      mr.errorMessage = `Gate "${gateName}" failed: ${output ?? "unknown error"}`;
      this.recomputePositions();
    } else if (mr.gates.every((g) => g.status === "passed" || g.status === "skipped")) {
      mr.status = "processing";
    }

    return mr;
  }

  completeMerge(mrId: string): MergeRequest | null {
    const mr = this.queue.find((item) => item.id === mrId);
    if (!mr || mr.status !== "processing") return mr ?? null;

    mr.status = "merged";
    mr.mergedAt = new Date();
    mr.updatedAt = new Date();
    this.recomputePositions();
    return mr;
  }

  getStats(): QueueStats {
    const now = Date.now();
    const merged = this.queue.filter((item) => item.status === "merged");
    const pending = this.queue.filter((item) => item.status === "pending");
    const processing = this.queue.filter(
      (item) => item.status === "validating" || item.status === "processing"
    );
    const failed = this.queue.filter((item) => item.status === "failed");

    const waitTimes = pending.map((item) => now - item.submittedAt.getTime());
    const processTimes = merged
      .filter((item) => item.mergedAt)
      .map((item) => item.mergedAt!.getTime() - item.submittedAt.getTime());

    const oneHourAgo = now - 3600000;
    const mergedLastHour = merged.filter(
      (item) => item.mergedAt && item.mergedAt.getTime() > oneHourAgo
    ).length;

    return {
      total: this.queue.length,
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

  getByStatus(status: MergeRequestStatus): MergeRequest[] {
    return this.queue
      .filter((item) => item.status === status)
      .sort((a, b) => a.position - b.position);
  }

  getById(id: string): MergeRequest | null {
    return this.queue.find((item) => item.id === id) ?? null;
  }

  private recomputePositions(): void {
    const active = this.queue
      .filter(
        (item) =>
          item.status === "pending" ||
          item.status === "validating" ||
          item.status === "processing"
      )
      .sort((a, b) => a.position - b.position);

    active.forEach((item, idx) => {
      item.position = idx;
    });
  }
}
