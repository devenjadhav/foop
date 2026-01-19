import { prisma } from "./db";
import { RunStatus } from "@prisma/client";

// ============================================
// Types
// ============================================

export interface WorkflowRunInput {
  workflowId: string;
  organizationId: string;
  userId?: string;
  inputData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface WorkflowRunCompletion {
  runId: string;
  status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "CANCELLED";
  outputData?: Record<string, unknown>;
  errorMessage?: string;
  errorCode?: string;
}

export interface ApiUsageInput {
  organizationId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ipAddress?: string;
  requestSize?: number;
  responseSize?: number;
  metadata?: Record<string, unknown>;
}

export interface WorkflowStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  avgDuration: number;
  minDuration: number | null;
  maxDuration: number | null;
}

export interface ApiUsageStats {
  totalCalls: number;
  avgLatency: number;
  errorRate: number;
  endpointBreakdown: { endpoint: string; count: number }[];
}

export interface DashboardMetrics {
  workflowStats: WorkflowStats;
  apiUsageStats: ApiUsageStats;
  recentRuns: Array<{
    id: string;
    workflowId: string;
    workflowName: string;
    status: RunStatus;
    duration: number | null;
    startedAt: Date;
  }>;
  dailyTrends: Array<{
    date: Date;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    avgDuration: number;
  }>;
}

// ============================================
// Workflow Run Tracking
// ============================================

/**
 * Start tracking a new workflow run
 */
export async function startWorkflowRun(input: WorkflowRunInput) {
  const run = await prisma.workflowRun.create({
    data: {
      workflowId: input.workflowId,
      organizationId: input.organizationId,
      userId: input.userId,
      status: "RUNNING",
      inputData: input.inputData ?? {},
      metadata: input.metadata ?? {},
    },
  });

  return run;
}

/**
 * Complete a workflow run with success or failure
 */
export async function completeWorkflowRun(input: WorkflowRunCompletion) {
  const run = await prisma.workflowRun.findUnique({
    where: { id: input.runId },
  });

  if (!run) {
    throw new Error(`Workflow run not found: ${input.runId}`);
  }

  const completedAt = new Date();
  const duration = completedAt.getTime() - run.startedAt.getTime();

  const updatedRun = await prisma.workflowRun.update({
    where: { id: input.runId },
    data: {
      status: input.status,
      completedAt,
      duration,
      outputData: input.outputData ?? {},
      errorMessage: input.errorMessage,
      errorCode: input.errorCode,
    },
  });

  return updatedRun;
}

/**
 * Log a complete workflow run in one call (for simpler use cases)
 */
export async function logWorkflowRun(
  input: WorkflowRunInput & {
    status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "CANCELLED";
    duration: number;
    outputData?: Record<string, unknown>;
    errorMessage?: string;
    errorCode?: string;
  }
) {
  const startedAt = new Date(Date.now() - input.duration);

  const run = await prisma.workflowRun.create({
    data: {
      workflowId: input.workflowId,
      organizationId: input.organizationId,
      userId: input.userId,
      status: input.status,
      startedAt,
      completedAt: new Date(),
      duration: input.duration,
      inputData: input.inputData ?? {},
      outputData: input.outputData ?? {},
      errorMessage: input.errorMessage,
      errorCode: input.errorCode,
      metadata: input.metadata ?? {},
    },
  });

  return run;
}

// ============================================
// API Usage Tracking
// ============================================

/**
 * Log an API call
 */
export async function logApiUsage(input: ApiUsageInput) {
  const log = await prisma.apiUsageLog.create({
    data: {
      organizationId: input.organizationId,
      endpoint: input.endpoint,
      method: input.method,
      statusCode: input.statusCode,
      duration: input.duration,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      requestSize: input.requestSize,
      responseSize: input.responseSize,
      metadata: input.metadata ?? {},
    },
  });

  return log;
}

// ============================================
// Analytics Queries
// ============================================

/**
 * Get workflow run statistics for an organization
 */
export async function getWorkflowStats(
  organizationId: string,
  options?: {
    workflowId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<WorkflowStats> {
  const where = {
    organizationId,
    ...(options?.workflowId && { workflowId: options.workflowId }),
    ...(options?.startDate && {
      startedAt: {
        gte: options.startDate,
        ...(options?.endDate && { lte: options.endDate }),
      },
    }),
  };

  const [counts, durations] = await Promise.all([
    prisma.workflowRun.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
    }),
    prisma.workflowRun.aggregate({
      where: {
        ...where,
        duration: { not: null },
      },
      _avg: { duration: true },
      _min: { duration: true },
      _max: { duration: true },
    }),
  ]);

  const statusCounts = counts.reduce(
    (acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalRuns = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const successfulRuns = statusCounts["SUCCESS"] || 0;
  const failedRuns =
    (statusCounts["FAILURE"] || 0) + (statusCounts["TIMEOUT"] || 0);

  return {
    totalRuns,
    successfulRuns,
    failedRuns,
    successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
    avgDuration: Math.round(durations._avg.duration || 0),
    minDuration: durations._min.duration,
    maxDuration: durations._max.duration,
  };
}

/**
 * Get API usage statistics for an organization
 */
export async function getApiUsageStats(
  organizationId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ApiUsageStats> {
  const where = {
    organizationId,
    ...(options?.startDate && {
      createdAt: {
        gte: options.startDate,
        ...(options?.endDate && { lte: options.endDate }),
      },
    }),
  };

  const [totals, errors, endpoints] = await Promise.all([
    prisma.apiUsageLog.aggregate({
      where,
      _count: { id: true },
      _avg: { duration: true },
    }),
    prisma.apiUsageLog.count({
      where: {
        ...where,
        statusCode: { gte: 400 },
      },
    }),
    prisma.apiUsageLog.groupBy({
      by: ["endpoint"],
      where,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const totalCalls = totals._count.id;

  return {
    totalCalls,
    avgLatency: Math.round(totals._avg.duration || 0),
    errorRate: totalCalls > 0 ? (errors / totalCalls) * 100 : 0,
    endpointBreakdown: endpoints.map((e) => ({
      endpoint: e.endpoint,
      count: e._count.id,
    })),
  };
}

/**
 * Get recent workflow runs
 */
export async function getRecentRuns(
  organizationId: string,
  limit: number = 10
) {
  const runs = await prisma.workflowRun.findMany({
    where: { organizationId },
    orderBy: { startedAt: "desc" },
    take: limit,
    include: {
      workflow: {
        select: { name: true },
      },
    },
  });

  return runs.map((run) => ({
    id: run.id,
    workflowId: run.workflowId,
    workflowName: run.workflow.name,
    status: run.status,
    duration: run.duration,
    startedAt: run.startedAt,
  }));
}

/**
 * Get daily trends for the last N days
 */
export async function getDailyTrends(
  organizationId: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const metrics = await prisma.dailyMetrics.findMany({
    where: {
      organizationId,
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  return metrics.map((m) => ({
    date: m.date,
    totalRuns: m.totalRuns,
    successfulRuns: m.successfulRuns,
    failedRuns: m.failedRuns,
    avgDuration: m.avgDuration,
  }));
}

/**
 * Get complete dashboard metrics
 */
export async function getDashboardMetrics(
  organizationId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    days?: number;
  }
): Promise<DashboardMetrics> {
  const [workflowStats, apiUsageStats, recentRuns, dailyTrends] =
    await Promise.all([
      getWorkflowStats(organizationId, {
        startDate: options?.startDate,
        endDate: options?.endDate,
      }),
      getApiUsageStats(organizationId, {
        startDate: options?.startDate,
        endDate: options?.endDate,
      }),
      getRecentRuns(organizationId, 10),
      getDailyTrends(organizationId, options?.days ?? 30),
    ]);

  return {
    workflowStats,
    apiUsageStats,
    recentRuns,
    dailyTrends,
  };
}

// ============================================
// Aggregation (for cron jobs)
// ============================================

/**
 * Aggregate daily metrics for a specific date
 */
export async function aggregateDailyMetrics(
  organizationId: string,
  date: Date
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get workflow run metrics
  const [runCounts, runDurations] = await Promise.all([
    prisma.workflowRun.groupBy({
      by: ["status"],
      where: {
        organizationId,
        startedAt: { gte: startOfDay, lte: endOfDay },
      },
      _count: { id: true },
    }),
    prisma.workflowRun.aggregate({
      where: {
        organizationId,
        startedAt: { gte: startOfDay, lte: endOfDay },
        duration: { not: null },
      },
      _sum: { duration: true },
      _avg: { duration: true },
      _min: { duration: true },
      _max: { duration: true },
    }),
  ]);

  // Get API usage metrics
  const apiMetrics = await prisma.apiUsageLog.aggregate({
    where: {
      organizationId,
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    _count: { id: true },
    _avg: { duration: true },
  });

  const statusCounts = runCounts.reduce(
    (acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  // Upsert daily metrics
  const metrics = await prisma.dailyMetrics.upsert({
    where: {
      organizationId_date: {
        organizationId,
        date: startOfDay,
      },
    },
    create: {
      organizationId,
      date: startOfDay,
      totalRuns: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      successfulRuns: statusCounts["SUCCESS"] || 0,
      failedRuns:
        (statusCounts["FAILURE"] || 0) + (statusCounts["TIMEOUT"] || 0),
      pendingRuns:
        (statusCounts["PENDING"] || 0) + (statusCounts["RUNNING"] || 0),
      totalDuration: BigInt(runDurations._sum.duration || 0),
      avgDuration: Math.round(runDurations._avg.duration || 0),
      minDuration: runDurations._min.duration,
      maxDuration: runDurations._max.duration,
      totalApiCalls: apiMetrics._count.id,
      avgApiLatency: Math.round(apiMetrics._avg.duration || 0),
    },
    update: {
      totalRuns: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      successfulRuns: statusCounts["SUCCESS"] || 0,
      failedRuns:
        (statusCounts["FAILURE"] || 0) + (statusCounts["TIMEOUT"] || 0),
      pendingRuns:
        (statusCounts["PENDING"] || 0) + (statusCounts["RUNNING"] || 0),
      totalDuration: BigInt(runDurations._sum.duration || 0),
      avgDuration: Math.round(runDurations._avg.duration || 0),
      minDuration: runDurations._min.duration,
      maxDuration: runDurations._max.duration,
      totalApiCalls: apiMetrics._count.id,
      avgApiLatency: Math.round(apiMetrics._avg.duration || 0),
    },
  });

  return metrics;
}

/**
 * Aggregate metrics for all organizations for a specific date
 */
export async function aggregateAllOrganizationsMetrics(date: Date) {
  const organizations = await prisma.organization.findMany({
    select: { id: true },
  });

  const results = await Promise.all(
    organizations.map((org) => aggregateDailyMetrics(org.id, date))
  );

  return results;
}
