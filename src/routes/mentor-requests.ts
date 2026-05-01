/**
 * Mentor request routes
 *
 * GET  /               - List mentor requests (optional ?status= filter)
 * POST /               - Create a new mentor request
 * POST /:id/claim      - Claim a pending request for a mentor
 * POST /:id/resolve    - Resolve a claimed request
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  MentorDispatchService,
  MentorDispatchError,
  type MentorRequestStatus,
  type CreateMentorRequestInput,
} from '@/services/mentor-dispatch';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

// ---------------------------------------------------------------------------
// Shared instances (module-scoped singletons)
// ---------------------------------------------------------------------------

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
const service = new MentorDispatchService(prisma, redis);

// Start the escalation background timer on module load
service.startEscalationTimer();

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------

function handleError(err: unknown): NextResponse {
  if (err instanceof MentorDispatchError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: err.statusCode }
    );
  }
  console.error('Unhandled error in mentor-requests:', err);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_STATUSES: MentorRequestStatus[] = [
  'pending',
  'claimed',
  'resolved',
  'escalated',
];

function isValidStatus(s: string): s is MentorRequestStatus {
  return (VALID_STATUSES as string[]).includes(s);
}

function validateCreateInput(
  body: unknown
): { ok: true; data: CreateMentorRequestInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.menteeId !== 'string' || b.menteeId.length === 0) {
    return { ok: false, error: '"menteeId" is required and must be a non-empty string' };
  }

  if (!Array.isArray(b.skills) || b.skills.length === 0) {
    return { ok: false, error: '"skills" is required and must be a non-empty array of strings' };
  }
  if (!b.skills.every((s: unknown) => typeof s === 'string')) {
    return { ok: false, error: '"skills" must contain only strings' };
  }

  if (
    !b.location ||
    typeof b.location !== 'object' ||
    typeof (b.location as Record<string, unknown>).lat !== 'number' ||
    typeof (b.location as Record<string, unknown>).lng !== 'number'
  ) {
    return {
      ok: false,
      error: '"location" is required and must be an object with numeric "lat" and "lng"',
    };
  }

  const loc = b.location as { lat: number; lng: number };
  return {
    ok: true,
    data: {
      menteeId: b.menteeId,
      skills: b.skills as string[],
      location: { lat: loc.lat, lng: loc.lng },
    },
  };
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * GET / — list mentor requests
 * Optional query param: ?status=pending|claimed|resolved|escalated
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const statusParam = request.nextUrl.searchParams.get('status');

    if (statusParam && !isValidStatus(statusParam)) {
      return NextResponse.json(
        {
          error: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const requests = await service.listRequests(
      statusParam ? (statusParam as MentorRequestStatus) : undefined
    );

    return NextResponse.json({ data: requests });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST / — create a new mentor request
 *
 * Body: { menteeId: string, skills: string[], location: { lat: number, lng: number } }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const validation = validateCreateInput(body);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const created = await service.createRequest(validation.data);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /:id/claim — claim a pending request
 *
 * Body: { mentorId: string }
 */
export async function claimHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.mentorId !== 'string' || body.mentorId.length === 0) {
      return NextResponse.json(
        { error: '"mentorId" is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const updated = await service.claimRequest(params.id, body.mentorId);
    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /:id/resolve — resolve a claimed request
 */
export async function resolveHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const updated = await service.resolveRequest(params.id);
    return NextResponse.json({ data: updated });
  } catch (err) {
    return handleError(err);
  }
}
