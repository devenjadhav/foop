/**
 * Audit Service — write-once audit log with restricted field redaction.
 *
 * Writes audit entries to a separate Airtable base (configured via env vars).
 * Before/After snapshots have restricted fields redacted automatically.
 */

// Fields that must be redacted in before/after snapshots
const RESTRICTED_FIELDS = new Set([
  'passwordHash',
  'password',
  'secret',
  'credentials',
  'accessToken',
  'refreshToken',
  'apiKey',
  'ssn',
  'socialSecurityNumber',
  'creditCard',
  'cardNumber',
  'cvv',
  'bankAccount',
]);

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  actorEmail: string;
  organizationId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export type CreateAuditEntryInput = Omit<AuditEntry, 'id' | 'timestamp'>;

/**
 * Redact restricted fields from a before/after snapshot.
 * Returns a new object with sensitive values replaced by '[REDACTED]'.
 */
export function redactRestrictedFields(
  snapshot: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!snapshot) return null;

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(snapshot)) {
    if (RESTRICTED_FIELDS.has(key)) {
      redacted[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      redacted[key] = redactRestrictedFields(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export class AuditServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'AuditServiceError';
  }
}

export class AuditService {
  private apiKey: string;
  private baseId: string;
  private tableName: string;

  constructor(options?: {
    apiKey?: string;
    baseId?: string;
    tableName?: string;
  }) {
    this.apiKey = options?.apiKey ?? process.env.AIRTABLE_AUDIT_API_KEY ?? '';
    this.baseId = options?.baseId ?? process.env.AIRTABLE_AUDIT_BASE_ID ?? '';
    this.tableName = options?.tableName ?? process.env.AIRTABLE_AUDIT_TABLE ?? 'AuditLog';

    if (!this.apiKey || !this.baseId) {
      throw new AuditServiceError(
        'AIRTABLE_AUDIT_API_KEY and AIRTABLE_AUDIT_BASE_ID must be configured'
      );
    }
  }

  /**
   * Write an audit entry. This is write-once — entries cannot be updated or deleted.
   */
  async writeEntry(input: CreateAuditEntryInput): Promise<AuditEntry> {
    const entry: Omit<AuditEntry, 'id'> = {
      ...input,
      before: redactRestrictedFields(input.before),
      after: redactRestrictedFields(input.after),
      timestamp: new Date().toISOString(),
    };

    const url = `${AIRTABLE_API_BASE}/${this.baseId}/${encodeURIComponent(this.tableName)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Action: entry.action,
          EntityType: entry.entityType,
          EntityId: entry.entityId,
          ActorId: entry.actorId,
          ActorEmail: entry.actorEmail,
          OrganizationId: entry.organizationId,
          Before: entry.before ? JSON.stringify(entry.before) : '',
          After: entry.after ? JSON.stringify(entry.after) : '',
          Metadata: JSON.stringify(entry.metadata),
          IpAddress: entry.ipAddress ?? '',
          UserAgent: entry.userAgent ?? '',
          Timestamp: entry.timestamp,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'unknown error');
      throw new AuditServiceError(
        `Failed to write audit entry: ${errorBody}`,
        response.status
      );
    }

    const data = await response.json();
    return {
      id: data.id,
      ...entry,
    };
  }

  /**
   * List audit entries for an organization (read-only query).
   */
  async listEntries(options: {
    organizationId: string;
    entityType?: string;
    entityId?: string;
    limit?: number;
    offset?: string;
  }): Promise<{ entries: AuditEntry[]; offset?: string }> {
    const filterParts = [
      `{OrganizationId} = '${options.organizationId}'`,
    ];
    if (options.entityType) {
      filterParts.push(`{EntityType} = '${options.entityType}'`);
    }
    if (options.entityId) {
      filterParts.push(`{EntityId} = '${options.entityId}'`);
    }

    const filterFormula = filterParts.length > 1
      ? `AND(${filterParts.join(', ')})`
      : filterParts[0];

    const params = new URLSearchParams({
      filterByFormula: filterFormula,
      sort: JSON.stringify([{ field: 'Timestamp', direction: 'desc' }]),
      pageSize: String(options.limit ?? 50),
    });
    if (options.offset) {
      params.set('offset', options.offset);
    }

    const url = `${AIRTABLE_API_BASE}/${this.baseId}/${encodeURIComponent(this.tableName)}?${params}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new AuditServiceError(
        `Failed to list audit entries`,
        response.status
      );
    }

    const data = await response.json();
    const entries: AuditEntry[] = data.records.map(
      (record: { id: string; fields: Record<string, string> }) => ({
        id: record.id,
        action: record.fields.Action,
        entityType: record.fields.EntityType,
        entityId: record.fields.EntityId,
        actorId: record.fields.ActorId,
        actorEmail: record.fields.ActorEmail,
        organizationId: record.fields.OrganizationId,
        before: record.fields.Before ? JSON.parse(record.fields.Before) : null,
        after: record.fields.After ? JSON.parse(record.fields.After) : null,
        metadata: record.fields.Metadata ? JSON.parse(record.fields.Metadata) : {},
        ipAddress: record.fields.IpAddress || null,
        userAgent: record.fields.UserAgent || null,
        timestamp: record.fields.Timestamp,
      })
    );

    return {
      entries,
      offset: data.offset,
    };
  }
}

/**
 * Create an audit service instance from environment variables.
 */
export function createAuditService(): AuditService {
  return new AuditService();
}
