/**
 * Small artificial delay so mock service calls feel like network requests
 * (loading states actually get exercised). Remove/shorten once real
 * Supabase calls replace these — this is the only place latency is faked.
 */
export function simulateLatency(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Occasionally reject, so "Try again" error states are real code paths
 * rather than dead UI. Off by default — pages opt in per the plan.
 */
export function maybeSimulateFailure(rate = 0) {
  if (rate <= 0) return;
  if (Math.random() < rate) {
    throw new Error("Something went wrong. Please try again.");
  }
}
