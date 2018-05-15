export function getDelay(
    iteration: number, initialInterval: number, maxInterval: number) {
  const currentDelay = Math.pow(2, iteration) * initialInterval;
  return Math.min(currentDelay, maxInterval);
}