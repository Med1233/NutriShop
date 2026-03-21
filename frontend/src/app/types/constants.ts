export const CATEGORY_COLORS: Record<string, string> = {
  proteins: '#2563eb',
  vitamins: '#f59e0b',
  supplements: '#8b5cf6',
  superfoods: '#16a34a',
  snacks: '#ef4444',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#16a34a',
  cancelled: '#6b7280',
};

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const PRODUCT_CATEGORIES = [
  'proteins',
  'vitamins',
  'supplements',
  'superfoods',
  'snacks',
] as const;
