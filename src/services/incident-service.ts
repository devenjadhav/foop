/**
 * Incident Service — create incidents with append-only narratives and
 * severity-based escalation (hardcoded paths for v0.1).
 */

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'mitigated' | 'resolved';

export interface NarrativeEntry {
  timestamp: string;
  authorId: string;
  authorEmail: string;
  content: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  organizationId: string;
  reportedById: string;
  reportedByEmail: string;
  assigneeId: string | null;
  followupOwner: string | null;
  minorInvolved: boolean;
  narrative: NarrativeEntry[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface CreateIncidentInput {
  title: string;
  severity: IncidentSeverity;
  organizationId: string;
  reportedById: string;
  reportedByEmail: string;
  initialNarrative: string;
  assigneeId?: string;
  minorInvolved?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateIncidentInput {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  assigneeId?: string | null;
  followupOwner?: string | null;
  minorInvolved?: boolean;
}

// Hardcoded escalation paths for v0.1
const ESCALATION_PATHS: Record<IncidentSeverity, string[]> = {
  critical: ['on-call-lead', 'engineering-director', 'cto'],
  high: ['on-call-lead', 'engineering-manager'],
  medium: ['team-lead'],
  low: [],
};

export class IncidentServiceError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'IncidentServiceError';
  }
}

// In-memory store for v0.1 — swap for database in production
const incidents = new Map<string, Incident>();
let nextId = 1;

function generateId(): string {
  return `INC-${String(nextId++).padStart(6, '0')}`;
}

export class IncidentService {
  /**
   * Create a new incident with an initial narrative entry.
   * Triggers severity-based escalation.
   */
  async create(input: CreateIncidentInput): Promise<Incident> {
    const id = generateId();
    const now = new Date().toISOString();

    const incident: Incident = {
      id,
      title: input.title,
      severity: input.severity,
      status: 'open',
      organizationId: input.organizationId,
      reportedById: input.reportedById,
      reportedByEmail: input.reportedByEmail,
      assigneeId: input.assigneeId ?? null,
      followupOwner: null,
      minorInvolved: input.minorInvolved ?? false,
      narrative: [
        {
          timestamp: now,
          authorId: input.reportedById,
          authorEmail: input.reportedByEmail,
          content: input.initialNarrative,
        },
      ],
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    incidents.set(id, incident);

    // Trigger escalation based on severity
    await this.escalate(incident);

    return incident;
  }

  /**
   * Append a narrative entry to an incident. Narratives are append-only —
   * existing entries cannot be modified or deleted.
   */
  async appendNarrative(
    incidentId: string,
    authorId: string,
    authorEmail: string,
    content: string,
  ): Promise<Incident> {
    const incident = incidents.get(incidentId);
    if (!incident) {
      throw new IncidentServiceError(
        `Incident ${incidentId} not found`,
        'NOT_FOUND',
      );
    }

    incident.narrative.push({
      timestamp: new Date().toISOString(),
      authorId,
      authorEmail,
      content,
    });
    incident.updatedAt = new Date().toISOString();

    return incident;
  }

  /**
   * Update incident fields (status, severity, assignee, etc.).
   * Enforces: minor-involved incidents require followupOwner before resolving.
   */
  async update(
    incidentId: string,
    input: UpdateIncidentInput,
  ): Promise<Incident> {
    const incident = incidents.get(incidentId);
    if (!incident) {
      throw new IncidentServiceError(
        `Incident ${incidentId} not found`,
        'NOT_FOUND',
      );
    }

    // Enforce: minor-involved check — require followupOwner before resolving
    const isResolving = input.status === 'resolved';
    const isMinorInvolved = input.minorInvolved ?? incident.minorInvolved;
    const willHaveFollowupOwner = input.followupOwner ?? incident.followupOwner;

    if (isResolving && isMinorInvolved && !willHaveFollowupOwner) {
      throw new IncidentServiceError(
        'Cannot resolve a minor-involved incident without setting a followupOwner',
        'FOLLOWUP_OWNER_REQUIRED',
      );
    }

    if (input.status !== undefined) incident.status = input.status;
    if (input.severity !== undefined) {
      const previousSeverity = incident.severity;
      incident.severity = input.severity;
      // Re-escalate if severity increased
      if (severityRank(input.severity) > severityRank(previousSeverity)) {
        await this.escalate(incident);
      }
    }
    if (input.assigneeId !== undefined) incident.assigneeId = input.assigneeId;
    if (input.followupOwner !== undefined) incident.followupOwner = input.followupOwner;
    if (input.minorInvolved !== undefined) incident.minorInvolved = input.minorInvolved;

    incident.updatedAt = new Date().toISOString();
    if (input.status === 'resolved') {
      incident.resolvedAt = incident.updatedAt;
    }

    return incident;
  }

  /**
   * Get a single incident by ID.
   */
  async get(incidentId: string): Promise<Incident> {
    const incident = incidents.get(incidentId);
    if (!incident) {
      throw new IncidentServiceError(
        `Incident ${incidentId} not found`,
        'NOT_FOUND',
      );
    }
    return incident;
  }

  /**
   * List incidents for an organization.
   */
  async list(options: {
    organizationId: string;
    status?: IncidentStatus;
    severity?: IncidentSeverity;
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: Incident[]; total: number }> {
    let results = Array.from(incidents.values()).filter(
      (i) => i.organizationId === options.organizationId,
    );

    if (options.status) {
      results = results.filter((i) => i.status === options.status);
    }
    if (options.severity) {
      results = results.filter((i) => i.severity === options.severity);
    }

    // Sort by creation date descending
    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const total = results.length;
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 50;

    return {
      incidents: results.slice(offset, offset + limit),
      total,
    };
  }

  /**
   * Escalation based on severity — hardcoded paths for v0.1.
   * Logs the escalation path; actual notification delivery is TODO.
   */
  private async escalate(incident: Incident): Promise<void> {
    const path = ESCALATION_PATHS[incident.severity];
    if (path.length === 0) return;

    console.log(
      `[incident] Escalating ${incident.id} (${incident.severity}):`,
      path.join(' -> '),
    );

    // v0.1: log only — notification integrations (Slack, PagerDuty, etc.)
    // will be wired in a future phase.
    incident.metadata = {
      ...incident.metadata,
      escalationPath: path,
      escalatedAt: new Date().toISOString(),
    };
  }
}

function severityRank(severity: IncidentSeverity): number {
  const ranks: Record<IncidentSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return ranks[severity];
}

/**
 * Singleton instance for convenience.
 */
let _instance: IncidentService | null = null;

export function getIncidentService(): IncidentService {
  if (!_instance) {
    _instance = new IncidentService();
  }
  return _instance;
}
