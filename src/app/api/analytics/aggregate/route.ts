import { NextRequest, NextResponse } from "next/server";
import {
  aggregateDailyMetrics,
  aggregateAllOrganizationsMetrics,
} from "@/lib/analytics";

/**
 * POST /api/analytics/aggregate
 * Aggregate daily metrics (typically called by a cron job)
 *
 * This endpoint aggregates workflow run and API usage data into daily metrics
 * for faster dashboard queries.
 *
 * Body:
 * - date: ISO date string (defaults to yesterday)
 * - organizationId: (optional) specific organization to aggregate
 *
 * Security: This endpoint should be protected in production
 * (e.g., using a secret header or Vercel Cron authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret in production
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { date, organizationId } = body;

    // Default to yesterday if no date provided
    const targetDate = date ? new Date(date) : new Date();
    if (!date) {
      targetDate.setDate(targetDate.getDate() - 1);
    }

    let results;

    if (organizationId) {
      // Aggregate for a specific organization
      const metrics = await aggregateDailyMetrics(organizationId, targetDate);
      results = [metrics];
    } else {
      // Aggregate for all organizations
      results = await aggregateAllOrganizationsMetrics(targetDate);
    }

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split("T")[0],
      aggregatedCount: results.length,
      results,
    });
  } catch (error) {
    console.error("Error aggregating metrics:", error);
    return NextResponse.json(
      { error: "Failed to aggregate metrics" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/aggregate
 * Health check for the aggregation endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "analytics-aggregate",
    description:
      "POST to this endpoint to aggregate daily metrics. Typically called by a cron job.",
  });
}
