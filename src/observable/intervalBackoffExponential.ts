import {Observable, of, timer} from 'rxjs';
import {expand, mapTo} from 'rxjs/operators';

import {getDelay} from '../utils';

export interface IntervalBackoffExponentialConfig {
  initialInterval: number;
  maxInterval?: number;
}
/**
 * Creates an Observable that emits sequential numbers with exponentially
 * increasing interval of time.
 */
export function intervalBackoffExponential(config: number|IntervalBackoffExponentialConfig):
    Observable<number> {
  const {initialInterval, maxInterval = Infinity} =
      (typeof config === 'number') ? {initialInterval: config} : config;
  return of (0).pipe(
      // Expend starts with number 1 and then recursively
      // projects each value to new Observable and puts it back in.
      expand(
          iteration => timer(getDelay(iteration, initialInterval, maxInterval))
                           // Once timer is complete, iteration is increased
                           .pipe(mapTo(iteration + 1))),
  );
}
