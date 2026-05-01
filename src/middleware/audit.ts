/**
 * Audit middleware — auto-logging on mutations.
 *
 * Captures before/after state for any mutation (POST, PUT, PATCH, DELETE)
 * and writes a write-once audit entry via the AuditService.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditService, type CreateAuditEntryInput } from '@/services/audit-service';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export interface AuditContext {
  actorId: string;
  actorEmail: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
}

/**
 * Extract the entity type and ID from the request URL path.
 * Pattern: /api/<entityType>/<entityId>
 */
function parseEntityFromPath(pathname: string): { entityType: string; entityId: string } {
  const segments = pathname.replace(/^\/api\//, '').split('/').filter(Boolean);
  return {
    entityType: segments[0] ?? 'unknown',
    entityId: segments[1] ?? '',
  };
}

/**
 * Extract IP address from the request.
 */
function getIpAddress(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null
  );
}

/**
 * Create an audit-logging wrapper for a mutation handler.
 *
 * Usage:
 *   export const POST = withAuditLog(async (request, auditCtx) => {
 *     auditCtx.before = await getExistingRecord();
 *     const result = await doMutation();
 *     return NextResponse.json(result);
 *   });
 */
export function withAuditLog(
  handler: (
    request: NextRequest,
    auditCtx: AuditContext
  ) => Promise<NextResponse>,
  options?: {
    entityType?: string;
  }
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const auditCtx: AuditContext = {
      actorId: '',
      actorEmail: '',
      organizationId: '',
      entityType: options?.entityType ?? '',
      entityId: '',
      before: null,
    };

    // Parse entity from path if not provided
    if (!auditCtx.entityType) {
      const parsed = parseEntityFromPath(request.nextUrl.pathname);
      auditCtx.entityType = parsed.entityType;
      auditCtx.entityId = parsed.entityId;
    }

    // Extract actor from headers (set by auth middleware upstream)
    auditCtx.actorId = request.headers.get('x-user-id') ?? '';
    auditCtx.actorEmail = request.headers.get('x-user-email') ?? '';
    auditCtx.organizationId = request.headers.get('x-organization-id') ?? '';

    const response = await handler(request, auditCtx);

    // Only log mutations
    if (!MUTATION_METHODS.has(request.method)) {
      return response;
    }

    // Fire-and-forget: don't block the response on audit logging
    logAuditEntry(request, response, auditCtx).catch((err) => {
      console.error('[audit] Failed to write audit entry:', err);
    });

    return response;
  };
}

async function logAuditEntry(
  request: NextRequest,
  response: NextResponse,
  ctx: AuditContext
): Promise<void> {
  let after: Record<string, unknown> | null = null;

  // Try to parse the response body as the "after" state
  try {
    const cloned = response.clone();
    const body = await cloned.json();
    if (body && typeof body === 'object') {
      after = body as Record<string, unknown>;
    }
  } catch {
    // Response may not be JSON — that's fine
  }

  const action = mapMethodToAction(request.method, ctx.entityType);

  const input: CreateAuditEntryInput = {
    action,
    entityType: ctx.entityType,
    entityId: ctx.entityId,
    actorId: ctx.actorId,
    actorEmail: ctx.actorEmail,
    organizationId: ctx.organizationId,
    before: ctx.before,
    after,
    metadata: {
      method: request.method,
      path: request.nextUrl.pathname,
      statusCode: response.status,
    },
    ipAddress: getIpAddress(request),
    userAgent: request.headers.get('user-agent'),
  };

  try {
    const auditService = new AuditService();
    await auditService.writeEntry(input);
  } catch (err) {
    // Audit failures must not break the application
    console.error('[audit] AuditService.writeEntry failed:', err);
  }
}

function mapMethodToAction(method: string, entityType: string): string {
  switch (method) {
    case 'POST':
      return `${entityType}.create`;
    case 'PUT':
    case 'PATCH':
      return `${entityType}.update`;
    case 'DELETE':
      return `${entityType}.delete`;
    default:
      return `${entityType}.${method.toLowerCase()}`;
  }
}
