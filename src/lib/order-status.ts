export const ORDER_STATUS_LABELS = {
  pending: "Pendiente",
  paid: "Pagada",
  ready_for_fulfillment: "Lista para preparar",
  manual_review: "Requiere revision manual",
  cancelled: "Cancelada",
  completed: "Completada",
} as const;

export const ORDER_STATUS_STYLES = {
  pending: "text-yellow-600",
  paid: "text-blue-600",
  ready_for_fulfillment: "text-green-600",
  manual_review: "text-orange-600",
  cancelled: "text-red-600",
  completed: "text-green-600",
} as const;

export function getOrderStatusLabel(status?: string | null): string {
  if (!status) {
    return ORDER_STATUS_LABELS.pending;
  }

  return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] ?? status;
}

export function getOrderStatusStyle(status?: string | null): string {
  if (!status) {
    return ORDER_STATUS_STYLES.pending;
  }

  return ORDER_STATUS_STYLES[status as keyof typeof ORDER_STATUS_STYLES] ?? "text-gray-600";
}

export function isOrderAutomated(status?: string | null): boolean {
  return status === "ready_for_fulfillment" || status === "manual_review";
}
