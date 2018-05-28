import {iif, Observable, throwError, timer} from 'rxjs';
import {concatMap, retryWhen} from 'rxjs/operators';

import {getDelay, exponentialBackoffDelay} from '../utils';

export interface RetryBackoffConfig {
  initialInterval: number;
  maxAttempts?: number;
  maxInterval?: number;
  shouldRetry?: (error: any) => boolean;
  backoffDelay?: (iteration: number, initialInterval: number) => number;
}

/**
 * Returns an Observable that mirrors the source Observable with the exception
 * of an error. If the source Observable calls error, rather than propagating
 * the error call this method will resubscribe to the source Observable with
 * exponentially increasing interval and up to a maximum of count
 * resubscriptions (if provided). Retrying can be cancelled at any point if
 * shouldRetry returns false.
 */
export function retryBackoff(
    config: number|RetryBackoffConfig):
    <T>(source: Observable<T>) => Observable<T> {
  const {
    initialInterval,
    maxAttempts = Infinity,
    maxInterval = Infinity,
    shouldRetry = () => true,
    backoffDelay = exponentialBackoffDelay,
  } = (typeof config === 'number') ? {initialInterval: config} : config;
  return <T>(source: Observable<T>) => source.pipe(
      retryWhen<T>(errors => errors.pipe(
          concatMap((error, i) => iif(
              () => i < maxAttempts && shouldRetry(error),
              timer(getDelay(backoffDelay(i, initialInterval), maxInterval)),
              throwError(error),
              ),
          ),
      )),
  );
}