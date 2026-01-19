import { NextResponse } from 'next/server';
import { getHealthStatus, HealthStatus } from '@/services/health';

export async function GET(): Promise<NextResponse<HealthStatus>> {
  return NextResponse.json(getHealthStatus());
}
