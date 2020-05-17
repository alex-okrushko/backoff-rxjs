/** Calculates the actual delay which can be limited by maxInterval */
export function getDelay(backoffDelay: number, maxInterval: number) {
  return Math.min(backoffDelay, maxInterval);
}

/** Exponential backoff delay */
export function exponentialBackoffDelay(
  iteration: number,
  initialInterval: number
) {
  return Math.pow(2, iteration) * initialInterval;
}
