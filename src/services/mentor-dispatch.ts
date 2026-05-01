/**
 * Mentor dispatch service
 *
 * Handles mentor request lifecycle: create, rank, claim, resolve.
 * Uses write-through persistence with a Redis sorted set for ranking.
 * Includes a 10-minute escalation timer with 30-second background checks.
 */

import { PrismaClient, MentorRequestStatus as PrismaStatus } from '@prisma/client';
import { Redis } from 'ioredis';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MentorRequest {
  id: string;
  menteeId: string;
  skills: string[];
  location: { lat: number; lng: number };
  status: MentorRequestStatus;
  mentorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  escalatedAt: Date | null;
}

export type MentorRequestStatus = 'pending' | 'claimed' | 'resolved' | 'escalated';

const STATUS_TO_PRISMA: Record<MentorRequestStatus, PrismaStatus> = {
  pending: 'PENDING' as PrismaStatus,
  claimed: 'CLAIMED' as PrismaStatus,
  resolved: 'RESOLVED' as PrismaStatus,
  escalated: 'ESCALATED' as PrismaStatus,
};

const PRISMA_TO_STATUS: Record<string, MentorRequestStatus> = {
  PENDING: 'pending',
  CLAIMED: 'claimed',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
};

export interface MentorProfile {
  id: string;
  skills: string[];
  location: { lat: number; lng: number };
  available: boolean;
}

export interface RankedMentor {
  mentorId: string;
  score: number;
}

export interface CreateMentorRequestInput {
  menteeId: string;
  skills: string[];
  location: { lat: number; lng: number };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REDIS_KEY_PREFIX = 'mentor:requests';
const ESCALATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const ESCALATION_CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class MentorDispatchError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'ALREADY_CLAIMED' | 'INVALID_STATE' | 'CONFLICT',
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'MentorDispatchError';
  }
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Score = skillMatch * 2 + proximity, tiebreak by age (lower ID = older).
 *
 * `skillMatch` is the count of overlapping skills between request and mentor.
 * `proximity` is 1 / (1 + distance_km) so closer mentors score higher.
 */
export function scoreMentor(
  request: { skills: string[]; location: { lat: number; lng: number } },
  mentor: MentorProfile
): number {
  const skillMatch = mentor.skills.filter((s) =>
    request.skills.includes(s)
  ).length;
  const distance = haversineDistance(request.location, mentor.location);
  const proximity = 1 / (1 + distance);
  return skillMatch * 2 + proximity;
}

export function rankMentors(
  request: { skills: string[]; location: { lat: number; lng: number } },
  mentors: MentorProfile[]
): RankedMentor[] {
  return mentors
    .filter((m) => m.available)
    .map((m) => ({ mentorId: m.id, score: scoreMentor(request, m) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreak by age: lower ID (lexicographically earlier) is older
      return a.mentorId.localeCompare(b.mentorId);
    });
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class MentorDispatchService {
  private escalationTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private prisma: PrismaClient,
    private redis: Redis
  ) {}

  // ---- sorted set helpers -------------------------------------------------

  private sortedSetKey(): string {
    return `${REDIS_KEY_PREFIX}:pending`;
  }

  private async addToSortedSet(requestId: string, createdAt: Date): Promise<void> {
    await this.redis.zadd(this.sortedSetKey(), createdAt.getTime(), requestId);
  }

  private async removeFromSortedSet(requestId: string): Promise<void> {
    await this.redis.zrem(this.sortedSetKey(), requestId);
  }

  // ---- CRUD ---------------------------------------------------------------

  /**
   * Create a mentor request. Write-through: persists to DB then adds to Redis
   * sorted set keyed by creation time for escalation polling.
   */
  async createRequest(input: CreateMentorRequestInput): Promise<MentorRequest> {
    const now = new Date();

    // Write to database (source of truth)
    const row = await this.prisma.mentorRequest.create({
      data: {
        menteeId: input.menteeId,
        skills: input.skills,
        locationLat: input.location.lat,
        locationLng: input.location.lng,
        status: STATUS_TO_PRISMA.pending,
        createdAt: now,
        updatedAt: now,
      },
    });

    const request = this.toMentorRequest(row);

    // Write-through to Redis sorted set (score = createdAt timestamp)
    await this.addToSortedSet(request.id, request.createdAt);

    return request;
  }

  /**
   * List mentor requests, optionally filtered by status.
   */
  async listRequests(status?: MentorRequestStatus): Promise<MentorRequest[]> {
    const rows = await this.prisma.mentorRequest.findMany({
      where: status ? { status: STATUS_TO_PRISMA[status] } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toMentorRequest);
  }

  /**
   * Claim a request for a specific mentor. Uses optimistic concurrency:
   * only succeeds if status is still 'pending'.
   */
  async claimRequest(requestId: string, mentorId: string): Promise<MentorRequest> {
    const updated = await this.prisma.mentorRequest.updateMany({
      where: { id: requestId, status: STATUS_TO_PRISMA.pending },
      data: { mentorId, status: STATUS_TO_PRISMA.claimed, updatedAt: new Date() },
    });

    if (updated.count === 0) {
      // Determine why: not found vs already claimed
      const existing = await this.prisma.mentorRequest.findUnique({
        where: { id: requestId },
      });
      if (!existing) {
        throw new MentorDispatchError(
          `Mentor request ${requestId} not found`,
          'NOT_FOUND',
          404
        );
      }
      throw new MentorDispatchError(
        `Mentor request ${requestId} is already ${PRISMA_TO_STATUS[existing.status] ?? existing.status}`,
        'ALREADY_CLAIMED',
        409
      );
    }

    // Remove from pending sorted set
    await this.removeFromSortedSet(requestId);

    const row = await this.prisma.mentorRequest.findUniqueOrThrow({
      where: { id: requestId },
    });
    return this.toMentorRequest(row);
  }

  /**
   * Resolve a claimed request.
   */
  async resolveRequest(requestId: string): Promise<MentorRequest> {
    const existing = await this.prisma.mentorRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      throw new MentorDispatchError(
        `Mentor request ${requestId} not found`,
        'NOT_FOUND',
        404
      );
    }

    if (existing.status !== STATUS_TO_PRISMA.claimed) {
      throw new MentorDispatchError(
        `Cannot resolve request in status "${PRISMA_TO_STATUS[existing.status] ?? existing.status}", must be "claimed"`,
        'INVALID_STATE',
        400
      );
    }

    const row = await this.prisma.mentorRequest.update({
      where: { id: requestId },
      data: { status: STATUS_TO_PRISMA.resolved, updatedAt: new Date() },
    });

    return this.toMentorRequest(row);
  }

  // ---- Escalation ---------------------------------------------------------

  /**
   * Start the escalation background loop. Checks every 30 seconds for
   * pending requests older than 10 minutes.
   */
  startEscalationTimer(): void {
    if (this.escalationTimer) return;

    this.escalationTimer = setInterval(async () => {
      await this.escalateStalePending();
    }, ESCALATION_CHECK_INTERVAL_MS);
  }

  stopEscalationTimer(): void {
    if (this.escalationTimer) {
      clearInterval(this.escalationTimer);
      this.escalationTimer = null;
    }
  }

  /**
   * Find pending requests older than 10 minutes using the Redis sorted set
   * and escalate them.
   */
  async escalateStalePending(): Promise<string[]> {
    const cutoff = Date.now() - ESCALATION_TIMEOUT_MS;

    // Range by score: all entries with timestamp <= cutoff
    const staleIds = await this.redis.zrangebyscore(
      this.sortedSetKey(),
      0,
      cutoff
    );

    if (staleIds.length === 0) return [];

    const escalatedIds: string[] = [];

    for (const id of staleIds) {
      const updated = await this.prisma.mentorRequest.updateMany({
        where: { id, status: STATUS_TO_PRISMA.pending },
        data: {
          status: STATUS_TO_PRISMA.escalated,
          escalatedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      if (updated.count > 0) {
        await this.removeFromSortedSet(id);
        escalatedIds.push(id);
      }
    }

    return escalatedIds;
  }

  // ---- helpers ------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toMentorRequest(row: any): MentorRequest {
    return {
      id: row.id,
      menteeId: row.menteeId,
      skills: row.skills as string[],
      location: { lat: row.locationLat, lng: row.locationLng },
      status: (PRISMA_TO_STATUS[row.status] ?? row.status) as MentorRequestStatus,
      mentorId: row.mentorId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      escalatedAt: row.escalatedAt ?? null,
    };
  }
}
