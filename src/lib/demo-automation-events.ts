export interface DemoAutomationEvent {
  id: string;
  type: string;
  source: string;
  message: string;
  orderId?: number;
  payload?: unknown;
  createdAt: string;
}

const globalForDemoEvents = globalThis as typeof globalThis & {
  demoAutomationEvents?: DemoAutomationEvent[];
};

if (!globalForDemoEvents.demoAutomationEvents) {
  globalForDemoEvents.demoAutomationEvents = [];
}

export function addDemoAutomationEvent(
  event: Omit<DemoAutomationEvent, "id" | "createdAt">,
): DemoAutomationEvent {
  const nextEvent: DemoAutomationEvent = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  globalForDemoEvents.demoAutomationEvents?.unshift(nextEvent);
  globalForDemoEvents.demoAutomationEvents =
    globalForDemoEvents.demoAutomationEvents?.slice(0, 50) ?? [];

  return nextEvent;
}

export function listDemoAutomationEvents(): DemoAutomationEvent[] {
  return globalForDemoEvents.demoAutomationEvents ?? [];
}
