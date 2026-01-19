import { NextRequest, NextResponse } from "next/server";
import { logApiUsage, getApiUsageStats } from "@/lib/analytics";

/**
 * POST /api/analytics/api-usage
 * Log an API call
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      endpoint,
      method,
      statusCode,
      duration,
      userAgent,
      ipAddress,
      requestSize,
      responseSize,
      metadata,
    } = body;

    if (
      !organizationId ||
      !endpoint ||
      !method ||
      statusCode === undefined ||
      duration === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "organizationId, endpoint, method, statusCode, and duration are required",
        },
        { status: 400 }
      );
    }

    const log = await logApiUsage({
      organizationId,
      endpoint,
      method,
      statusCode,
      duration,
      userAgent,
      ipAddress,
      requestSize,
      responseSize,
      metadata,
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Error logging API usage:", error);
    return NextResponse.json(
      { error: "Failed to log API usage" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/api-usage
 * Get API usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const stats = await getApiUsageStats(organizationId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting API usage stats:", error);
    return NextResponse.json(
      { error: "Failed to get API usage statistics" },
      { status: 500 }
    );
  }
}
