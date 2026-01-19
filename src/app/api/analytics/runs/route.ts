import { NextRequest, NextResponse } from "next/server";
import {
  startWorkflowRun,
  completeWorkflowRun,
  logWorkflowRun,
  getWorkflowStats,
  getRecentRuns,
} from "@/lib/analytics";

/**
 * POST /api/analytics/runs
 * Log a workflow run (start, complete, or full)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "start") {
      // Start a new workflow run
      const { workflowId, organizationId, userId, inputData, metadata } = body;

      if (!workflowId || !organizationId) {
        return NextResponse.json(
          { error: "workflowId and organizationId are required" },
          { status: 400 }
        );
      }

      const run = await startWorkflowRun({
        workflowId,
        organizationId,
        userId,
        inputData,
        metadata,
      });

      return NextResponse.json({ success: true, run });
    }

    if (action === "complete") {
      // Complete an existing workflow run
      const { runId, status, outputData, errorMessage, errorCode } = body;

      if (!runId || !status) {
        return NextResponse.json(
          { error: "runId and status are required" },
          { status: 400 }
        );
      }

      if (!["SUCCESS", "FAILURE", "TIMEOUT", "CANCELLED"].includes(status)) {
        return NextResponse.json(
          {
            error:
              "status must be one of: SUCCESS, FAILURE, TIMEOUT, CANCELLED",
          },
          { status: 400 }
        );
      }

      const run = await completeWorkflowRun({
        runId,
        status,
        outputData,
        errorMessage,
        errorCode,
      });

      return NextResponse.json({ success: true, run });
    }

    if (action === "log") {
      // Log a complete workflow run in one call
      const {
        workflowId,
        organizationId,
        userId,
        status,
        duration,
        inputData,
        outputData,
        errorMessage,
        errorCode,
        metadata,
      } = body;

      if (!workflowId || !organizationId || !status || duration === undefined) {
        return NextResponse.json(
          {
            error:
              "workflowId, organizationId, status, and duration are required",
          },
          { status: 400 }
        );
      }

      const run = await logWorkflowRun({
        workflowId,
        organizationId,
        userId,
        status,
        duration,
        inputData,
        outputData,
        errorMessage,
        errorCode,
        metadata,
      });

      return NextResponse.json({ success: true, run });
    }

    return NextResponse.json(
      { error: "Invalid action. Must be one of: start, complete, log" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error logging workflow run:", error);
    return NextResponse.json(
      { error: "Failed to log workflow run" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/runs
 * Get workflow run statistics and recent runs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const workflowId = searchParams.get("workflowId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const [stats, recentRuns] = await Promise.all([
      getWorkflowStats(organizationId, {
        workflowId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }),
      getRecentRuns(organizationId, limit),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      recentRuns,
    });
  } catch (error) {
    console.error("Error getting workflow stats:", error);
    return NextResponse.json(
      { error: "Failed to get workflow statistics" },
      { status: 500 }
    );
  }
}
