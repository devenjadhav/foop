import { NextRequest, NextResponse } from 'next/server';
import {
  createRequest,
  listRequests,
  claimRequest,
  resolveRequest,
  MentorDispatchError,
  type MentorRequestStatus,
} from '@/services/mentor-dispatch';

// GET / - List mentor requests, optionally filtered by status
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') as MentorRequestStatus | null;

  const requests = await listRequests(status ?? undefined);
  return NextResponse.json({ data: requests });
}

// POST / - Create a new mentor request
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { studentId, subject, skills, location } = body;

  if (!studentId || typeof studentId !== 'string') {
    return NextResponse.json(
      { error: 'studentId is required' },
      { status: 400 }
    );
  }

  if (!subject || typeof subject !== 'string') {
    return NextResponse.json(
      { error: 'subject is required' },
      { status: 400 }
    );
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return NextResponse.json(
      { error: 'skills must be a non-empty array' },
      { status: 400 }
    );
  }

  if (
    !location ||
    typeof location.lat !== 'number' ||
    typeof location.lng !== 'number'
  ) {
    return NextResponse.json(
      { error: 'location must have numeric lat and lng' },
      { status: 400 }
    );
  }

  const mentorRequest = await createRequest({
    studentId,
    subject,
    skills,
    location: { lat: location.lat, lng: location.lng },
  });

  return NextResponse.json({ data: mentorRequest }, { status: 201 });
}

// POST /:id/claim - Claim a mentor request
export async function claimHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { mentorId } = body;

  if (!mentorId || typeof mentorId !== 'string') {
    return NextResponse.json(
      { error: 'mentorId is required' },
      { status: 400 }
    );
  }

  try {
    const mentorRequest = await claimRequest(params.id, mentorId);
    return NextResponse.json({ data: mentorRequest });
  } catch (err) {
    if (err instanceof MentorDispatchError) {
      const status = err.code === 'REQUEST_NOT_FOUND' ? 404 : 409;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    throw err;
  }
}

// POST /:id/resolve - Resolve a mentor request
export async function resolveHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { resolution } = body;

  if (!resolution || typeof resolution !== 'string') {
    return NextResponse.json(
      { error: 'resolution is required' },
      { status: 400 }
    );
  }

  try {
    const mentorRequest = await resolveRequest(params.id, resolution);
    return NextResponse.json({ data: mentorRequest });
  } catch (err) {
    if (err instanceof MentorDispatchError) {
      const status = err.code === 'REQUEST_NOT_FOUND' ? 404 : 409;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    throw err;
  }
}
