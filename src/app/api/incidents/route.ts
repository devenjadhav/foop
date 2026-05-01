/**
 * Incidents API routes
 *
 * POST /api/incidents       — Create a new incident
 * GET  /api/incidents       — List incidents for an organization
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getIncidentService,
  type CreateIncidentInput,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/services/incident-service';

const VALID_SEVERITIES: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];
const VALID_STATUSES: IncidentStatus[] = ['open', 'investigating', 'mitigated', 'resolved'];

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, severity, initialNarrative, assigneeId, minorInvolved, metadata } = body;

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (!severity || !VALID_SEVERITIES.includes(severity as IncidentSeverity)) {
    return NextResponse.json(
      { error: `severity must be one of: ${VALID_SEVERITIES.join(', ')}` },
      { status: 400 },
    );
  }
  if (!initialNarrative || typeof initialNarrative !== 'string') {
    return NextResponse.json({ error: 'initialNarrative is required' }, { status: 400 });
  }

  // In production these come from auth middleware; using headers for now
  const actorId = request.headers.get('x-user-id') ?? '';
  const actorEmail = request.headers.get('x-user-email') ?? '';
  const organizationId = request.headers.get('x-organization-id') ?? '';

  if (!organizationId) {
    return NextResponse.json({ error: 'Organization context required' }, { status: 403 });
  }

  const input: CreateIncidentInput = {
    title: title as string,
    severity: severity as IncidentSeverity,
    organizationId,
    reportedById: actorId,
    reportedByEmail: actorEmail,
    initialNarrative: initialNarrative as string,
    assigneeId: assigneeId as string | undefined,
    minorInvolved: minorInvolved === true,
    metadata: (metadata as Record<string, unknown>) ?? {},
  };

  const service = getIncidentService();
  const incident = await service.create(input);

  return NextResponse.json(incident, { status: 201 });
}

export async function GET(request: NextRequest) {
  const organizationId = request.headers.get('x-organization-id') ?? '';
  if (!organizationId) {
    return NextResponse.json({ error: 'Organization context required' }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const status = params.get('status') as IncidentStatus | null;
  const severity = params.get('severity') as IncidentSeverity | null;
  const limit = params.get('limit') ? parseInt(params.get('limit')!, 10) : undefined;
  const offset = params.get('offset') ? parseInt(params.get('offset')!, 10) : undefined;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    return NextResponse.json(
      { error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}` },
      { status: 400 },
    );
  }

  const service = getIncidentService();
  const result = await service.list({
    organizationId,
    status: status ?? undefined,
    severity: severity ?? undefined,
    limit,
    offset,
  });

  return NextResponse.json(result);
}
