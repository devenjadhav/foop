import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const MENTOR_REQUESTS_KEY = 'mentor:requests';
const ESCALATION_CHECK_INTERVAL_MS = 30_000;
const ESCALATION_TIMEOUT_MS = 10 * 60 * 1000;

export type MentorRequestStatus = 'pending' | 'claimed' | 'resolved' | 'escalated';

export interface MentorRequest {
  id: string;
  studentId: string;
  subject: string;
  skills: string[];
  location: { lat: number; lng: number };
  status: MentorRequestStatus;
  mentorId: string | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  claimedAt: Date | null;
  resolvedAt: Date | null;
  escalatedAt: Date | null;
}

interface CreateRequestInput {
  studentId: string;
  subject: string;
  skills: string[];
  location: { lat: number; lng: number };
}

interface MentorCandidate {
  id: string;
  skills: string[];
  location: { lat: number; lng: number };
}

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function computeSkillMatch(requestSkills: string[], mentorSkills: string[]): number {
  if (requestSkills.length === 0) return 0;
  const mentorSet = new Set(mentorSkills.map((s) => s.toLowerCase()));
  const matches = requestSkills.filter((s) => mentorSet.has(s.toLowerCase()));
  return matches.length / requestSkills.length;
}

function computeProximityScore(distance: number): number {
  // Normalize: 0km = 1.0, 50km+ = 0.0
  return Math.max(0, 1 - distance / 50);
}

export function rankMentors(
  request: { skills: string[]; location: { lat: number; lng: number } },
  candidates: MentorCandidate[]
): MentorCandidate[] {
  const scored = candidates.map((mentor) => {
    const skillMatch = computeSkillMatch(request.skills, mentor.skills);
    const distance = haversineDistance(request.location, mentor.location);
    const proximity = computeProximityScore(distance);
    const score = skillMatch * 2 + proximity;
    return { mentor, score, createdAt: Date.now() };
  });

  // Sort descending by score, tiebreak by age (earlier entry wins)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.createdAt - b.createdAt;
  });

  return scored.map((s) => s.mentor);
}

export async function createRequest(input: CreateRequestInput): Promise<MentorRequest> {
  const now = new Date();

  // Write-through: persist to database
  const request = await prisma.mentorRequest.create({
    data: {
      studentId: input.studentId,
      subject: input.subject,
      skills: input.skills,
      locationLat: input.location.lat,
      locationLng: input.location.lng,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
  });

  const mentorRequest = toMentorRequest(request);

  // Write-through: add to Redis sorted set (score = creation timestamp for age ordering)
  await redis.zadd(MENTOR_REQUESTS_KEY, now.getTime(), request.id);

  return mentorRequest;
}

export async function listRequests(status?: MentorRequestStatus): Promise<MentorRequest[]> {
  const where = status ? { status } : {};
  const rows = await prisma.mentorRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toMentorRequest);
}

export async function getRequest(id: string): Promise<MentorRequest | null> {
  const row = await prisma.mentorRequest.findUnique({ where: { id } });
  return row ? toMentorRequest(row) : null;
}

export async function claimRequest(
  requestId: string,
  mentorId: string
): Promise<MentorRequest> {
  // Optimistic locking: only claim if still pending
  const result = await prisma.mentorRequest.updateMany({
    where: { id: requestId, status: 'pending' },
    data: {
      status: 'claimed',
      mentorId,
      claimedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  if (result.count === 0) {
    const existing = await prisma.mentorRequest.findUnique({ where: { id: requestId } });
    if (!existing) {
      throw new MentorDispatchError('REQUEST_NOT_FOUND', `Request ${requestId} not found`);
    }
    throw new MentorDispatchError(
      'CLAIM_CONFLICT',
      `Request ${requestId} is already ${existing.status}`
    );
  }

  // Remove from pending sorted set
  await redis.zrem(MENTOR_REQUESTS_KEY, requestId);

  const updated = await prisma.mentorRequest.findUniqueOrThrow({ where: { id: requestId } });
  return toMentorRequest(updated);
}

export async function resolveRequest(
  requestId: string,
  resolution: string
): Promise<MentorRequest> {
  const result = await prisma.mentorRequest.updateMany({
    where: { id: requestId, status: 'claimed' },
    data: {
      status: 'resolved',
      resolution,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  if (result.count === 0) {
    const existing = await prisma.mentorRequest.findUnique({ where: { id: requestId } });
    if (!existing) {
      throw new MentorDispatchError('REQUEST_NOT_FOUND', `Request ${requestId} not found`);
    }
    throw new MentorDispatchError(
      'INVALID_STATE',
      `Request ${requestId} must be claimed before resolving (current: ${existing.status})`
    );
  }

  const updated = await prisma.mentorRequest.findUniqueOrThrow({ where: { id: requestId } });
  return toMentorRequest(updated);
}

export class MentorDispatchError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'MentorDispatchError';
  }
}

// --- Escalation timer ---

let escalationInterval: ReturnType<typeof setInterval> | null = null;

async function checkEscalations(): Promise<void> {
  const cutoff = Date.now() - ESCALATION_TIMEOUT_MS;

  // Get request IDs older than 10 minutes from Redis sorted set
  const staleIds = await redis.zrangebyscore(MENTOR_REQUESTS_KEY, 0, cutoff);

  if (staleIds.length === 0) return;

  // Escalate in database
  await prisma.mentorRequest.updateMany({
    where: {
      id: { in: staleIds },
      status: 'pending',
    },
    data: {
      status: 'escalated',
      escalatedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Remove escalated entries from sorted set
  if (staleIds.length > 0) {
    await redis.zrem(MENTOR_REQUESTS_KEY, ...staleIds);
  }
}

export function startEscalationTimer(): void {
  if (escalationInterval) return;
  escalationInterval = setInterval(checkEscalations, ESCALATION_CHECK_INTERVAL_MS);
}

export function stopEscalationTimer(): void {
  if (escalationInterval) {
    clearInterval(escalationInterval);
    escalationInterval = null;
  }
}

// --- Helpers ---

function toMentorRequest(row: {
  id: string;
  studentId: string;
  subject: string;
  skills: string[];
  locationLat: number;
  locationLng: number;
  status: string;
  mentorId: string | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
  claimedAt: Date | null;
  resolvedAt: Date | null;
  escalatedAt: Date | null;
}): MentorRequest {
  return {
    id: row.id,
    studentId: row.studentId,
    subject: row.subject,
    skills: row.skills,
    location: { lat: row.locationLat, lng: row.locationLng },
    status: row.status as MentorRequestStatus,
    mentorId: row.mentorId,
    resolution: row.resolution,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    claimedAt: row.claimedAt,
    resolvedAt: row.resolvedAt,
    escalatedAt: row.escalatedAt,
  };
}
