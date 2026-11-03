import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { AuditLogModel } from '@/models/AuditLog';
import { dataStore, StoredAuditLog } from '../storage/dataStore';

export async function logAuditEventServer(
  action: string,
  actor: { id: string; name: string; role: string },
  targetResource: string,
  targetId?: string,
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  try {
    await connectToDatabase();
    if (isDatabaseConnected()) {
      await AuditLogModel.create({
        action,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        targetResource,
        targetId,
        details,
        ipAddress,
        timestamp: new Date(),
      });
    } else {
      const entry: StoredAuditLog = {
        id: `audit-${Date.now()}`,
        action,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        targetResource,
        targetId,
        details,
        ipAddress,
        timestamp: new Date().toISOString(),
      };
      dataStore.auditLogs.unshift(entry);
    }
  } catch (err) {
    console.error('[AuditLog] Failed to log event:', err);
  }
}
