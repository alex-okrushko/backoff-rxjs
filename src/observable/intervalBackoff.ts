import { Observable, of, timer, SchedulerLike, asyncScheduler } from "rxjs";
import { expand, mapTo } from "rxjs/operators";

import { exponentialBackoffDelay, getDelay } from "../utils";

export interface IntervalBackoffConfig {
  initialInterval: number;
  maxInterval?: number;
  backoffDelay?: (iteration: number, initialInterval: number) => number;
}
/**
 * Creates an Observable that emits sequential numbers with by default
 * exponentially increasing interval of time.
 */
export function intervalBackoff(
  config: number | IntervalBackoffConfig,
  scheduler: SchedulerLike = asyncScheduler,
): Observable<number> {
  let {
    initialInterval,
    maxInterval = Infinity,
    backoffDelay = exponentialBackoffDelay
  } =
    typeof config === "number" ? { initialInterval: config } : config;
  initialInterval = (initialInterval < 0) ? 0 : initialInterval; 
  return of(0, scheduler).pipe(
    // Expend starts with number 1 and then recursively
    // projects each value to new Observable and puts it back in.
    expand(iteration =>
      timer(getDelay(backoffDelay(iteration, initialInterval), maxInterval))
        // Once timer is complete, iteration is increased
        .pipe(mapTo(iteration + 1))
    )
  );
}
