/**
 * Incident narrative API route
 *
 * POST /api/incidents/:id/narrative — Append a narrative entry (append-only)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getIncidentService,
  IncidentServiceError,
} from '@/services/incident-service';

export async function POST(
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

  const { content } = body;
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const actorId = request.headers.get('x-user-id') ?? '';
  const actorEmail = request.headers.get('x-user-email') ?? '';

  const service = getIncidentService();

  try {
    const incident = await service.appendNarrative(id, actorId, actorEmail, content);
    return NextResponse.json(incident);
  } catch (err) {
    if (err instanceof IncidentServiceError && err.code === 'NOT_FOUND') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
