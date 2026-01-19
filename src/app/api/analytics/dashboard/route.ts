import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics, getDailyTrends } from "@/lib/analytics";

/**
 * GET /api/analytics/dashboard
 * Get complete dashboard metrics including workflow stats, API usage, recent runs, and trends
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const days = parseInt(searchParams.get("days") || "30", 10);

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const metrics = await getDashboardMetrics(organizationId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      days,
    });

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return NextResponse.json(
      { error: "Failed to get dashboard metrics" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/dashboard/trends
 * Get daily trends for charting
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, days = 30 } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const trends = await getDailyTrends(organizationId, days);

    return NextResponse.json({
      success: true,
      trends,
    });
  } catch (error) {
    console.error("Error getting daily trends:", error);
    return NextResponse.json(
      { error: "Failed to get daily trends" },
      { status: 500 }
    );
  }
}
