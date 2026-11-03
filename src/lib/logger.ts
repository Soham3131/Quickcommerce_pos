import { env } from './env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogMeta {
  action?: string;
  actorId?: string;
  actorRole?: string;
  resourceId?: string;
  resourceType?: string;
  status?: string;
  ip?: string;
  durationMs?: number;
  [key: string]: any;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Filter out sensitive fields (passwords, tokens, secrets, card numbers).
 */
function sanitizeMeta(meta?: StructuredLogMeta): Record<string, any> {
  if (!meta) return {};
  const sanitized: Record<string, any> = {};

  const SENSITIVE_KEYS = [
    'password',
    'passwordPlain',
    'passwordHash',
    'token',
    'jwt',
    'secret',
    'keySecret',
    'razorpayKeySecret',
    'razorpayWebhookSecret',
    'cloudinaryApiSecret',
    'cardNumber',
    'cvv',
    'authSecret',
  ];

  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMeta(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

class StructuredLogger {
  private currentLevel: number;

  constructor() {
    this.currentLevel = LOG_LEVELS[env.LOG_LEVEL] ?? LOG_LEVELS.info;
  }

  private log(level: LogLevel, message: string, meta?: StructuredLogMeta) {
    if (LOG_LEVELS[level] < this.currentLevel) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      env: env.APP_ENV,
      message,
      ...sanitizeMeta(meta),
    };

    const formatted = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(formatted);
        // Error monitoring integration point (e.g. Sentry.captureException)
        this.notifyMonitoringService(message, meta);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
        break;
    }
  }

  private notifyMonitoringService(message: string, meta?: StructuredLogMeta) {
    // Sentry / Datadog / CloudWatch integration hook
    if (env.NODE_ENV === 'production') {
      // Plug into Sentry or custom monitoring collector if configured
    }
  }

  public debug(message: string, meta?: StructuredLogMeta) {
    this.log('debug', message, meta);
  }

  public info(message: string, meta?: StructuredLogMeta) {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: StructuredLogMeta) {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: StructuredLogMeta) {
    this.log('error', message, meta);
  }

  // --- Specialized Enterprise Audit Loggers ---

  public logLoginAttempt(email: string, role: string, success: boolean, ip?: string, error?: string) {
    this.info(`[Auth] User login attempt: ${email}`, {
      action: 'AUTH_LOGIN',
      email,
      role,
      success,
      ip,
      error,
    });
  }

  public logFailedAuthorization(path: string, userRole: string, requiredRoles: string[], ip?: string) {
    this.warn(`[RBAC] Access denied for role '${userRole}' on '${path}'`, {
      action: 'RBAC_ACCESS_DENIED',
      path,
      userRole,
      requiredRoles,
      ip,
    });
  }

  public logOrderCreated(invoiceNumber: string, grandTotal: number, customerId: string, orderType: string) {
    this.info(`[Order] New order created: ${invoiceNumber}`, {
      action: 'ORDER_CREATED',
      invoiceNumber,
      grandTotal,
      customerId,
      orderType,
    });
  }

  public logInventoryMutation(sku: string, previousStock: number, newStock: number, reason: string, actor: string) {
    this.info(`[Inventory] Stock mutation for ${sku}: ${previousStock} -> ${newStock}`, {
      action: 'INVENTORY_MUTATION',
      sku,
      previousStock,
      newStock,
      quantityChange: newStock - previousStock,
      reason,
      actor,
    });
  }

  public logStockReversal(invoiceNumber: string, itemsCount: number, actor: string) {
    this.info(`[Inventory] Order cancelled; stock restored for invoice ${invoiceNumber}`, {
      action: 'STOCK_RESTORED',
      invoiceNumber,
      itemsCount,
      actor,
    });
  }

  public logPurchaseReceived(purchaseNumber: string, supplierName: string, itemsCount: number, actor: string) {
    this.info(`[Purchases] Purchase order received: ${purchaseNumber}`, {
      action: 'PURCHASE_RECEIVED',
      purchaseNumber,
      supplierName,
      itemsCount,
      actor,
    });
  }

  public logSettingsChanged(section: string, actor: string) {
    this.info(`[Settings] Store settings modified: ${section}`, {
      action: 'SETTINGS_MODIFIED',
      section,
      actor,
    });
  }
}

export const logger = new StructuredLogger();
