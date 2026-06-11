export type AuditEvent = {
  actorUserId: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
}

export function createAuditRecord(event: AuditEvent) {
  return {
    id: crypto.randomUUID(),
    actorUserId: event.actorUserId,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    metadata: event.metadata,
  }
}
