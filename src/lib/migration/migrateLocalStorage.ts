/**
 * LocalStorage Migration Utility
 * Safely exports existing demo state from LocalStorage and syncs it to MongoDB.
 */

export interface MigrationPayload {
  products?: any[];
  customers?: any[];
  orders?: any[];
  suppliers?: any[];
  purchases?: any[];
  settings?: any;
  coupons?: any[];
}

export function inspectLocalStorage(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  const keys = [
    'avani_grocers_products',
    'avani_grocers_customers',
    'avani_grocers_orders',
    'avani_grocers_suppliers',
    'avani_grocers_purchases',
    'avani_grocers_settings',
    'avani_grocers_coupons',
    'avani_grocers_stock_adjustments',
  ];

  const report: Record<string, number> = {};
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        report[k] = Array.isArray(parsed) ? parsed.length : 1;
      } catch {
        report[k] = 0;
      }
    }
  }

  return report;
}

export function exportLocalStorageData(): MigrationPayload {
  if (typeof window === 'undefined') return {};

  const payload: MigrationPayload = {};

  try {
    const prods = localStorage.getItem('avani_grocers_products');
    if (prods) payload.products = JSON.parse(prods);

    const custs = localStorage.getItem('avani_grocers_customers');
    if (custs) payload.customers = JSON.parse(custs);

    const ords = localStorage.getItem('avani_grocers_orders');
    if (ords) payload.orders = JSON.parse(ords);

    const supps = localStorage.getItem('avani_grocers_suppliers');
    if (supps) payload.suppliers = JSON.parse(supps);

    const setts = localStorage.getItem('avani_grocers_settings');
    if (setts) payload.settings = JSON.parse(setts);
  } catch (err) {
    console.error('Failed to export local data:', err);
  }

  return payload;
}

export async function uploadLocalStorageToBackend(): Promise<{ success: boolean; message: string }> {
  const payload = exportLocalStorageData();

  try {
    const res = await fetch('/api/migration/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return {
      success: data.success,
      message: data.message || (data.success ? 'Migration succeeded' : 'Migration failed'),
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error during migration' };
  }
}
