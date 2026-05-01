/**
 * Single incident API routes
 *
 * GET   /api/incidents/:id  — Get incident details
 * PATCH /api/incidents/:id  — Update incident (status, severity, assignee, followupOwner)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getIncidentService,
  IncidentServiceError,
  type IncidentSeverity,
  type IncidentStatus,
} from '@/services/incident-service';

const VALID_SEVERITIES: IncidentSeverity[] = ['critical', 'high', 'medium', 'low'];
const VALID_STATUSES: IncidentStatus[] = ['open', 'investigating', 'mitigated', 'resolved'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const service = getIncidentService();

  try {
    const incident = await service.get(id);
    return NextResponse.json(incident);
  } catch (err) {
    if (err instanceof IncidentServiceError && err.code === 'NOT_FOUND') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { status, severity, assigneeId, followupOwner, minorInvolved } = body;

  if (status && !VALID_STATUSES.includes(status as IncidentStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }
  if (severity && !VALID_SEVERITIES.includes(severity as IncidentSeverity)) {
    return NextResponse.json(
      { error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}` },
      { status: 400 },
    );
  }

  const service = getIncidentService();

  try {
    const incident = await service.update(id, {
      status: status as IncidentStatus | undefined,
      severity: severity as IncidentSeverity | undefined,
      assigneeId: assigneeId as string | null | undefined,
      followupOwner: followupOwner as string | null | undefined,
      minorInvolved: minorInvolved as boolean | undefined,
    });
    return NextResponse.json(incident);
  } catch (err) {
    if (err instanceof IncidentServiceError) {
      if (err.code === 'NOT_FOUND') {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      if (err.code === 'FOLLOWUP_OWNER_REQUIRED') {
        return NextResponse.json({ error: err.message }, { status: 422 });
      }
    }
    throw err;
  }
}
