import {iif, interval, Observable, throwError, timer, zip} from 'rxjs';
import {concatMap, retryWhen} from 'rxjs/operators';

import {getDelay} from '../utils';

export interface RetryBackoffExponentialConfig<E> {
  initialInterval: number;
  maxAttempts?: number;
  maxInterval?: number;
  cancelRetry?: (error: E) => boolean;
}

/**
 * Returns an Observable that mirrors the source Observable with the exception
 * of an error. If the source Observable calls error, rather than propagating
 * the error call this method will resubscribe to the source Observable with
 * exponentially increasing interval and up to a maximum of count
 * resubscriptions (if provided). Retry can be cancelled at any point if
 * cancelRetry condition is met.
 */
export function retryBackoffExponential<E>(
    config: number|RetryBackoffExponentialConfig<E>):
    <T>(source: Observable<T>) => Observable<T> {
  const {
    initialInterval,
    maxAttempts = Infinity,
    maxInterval = Infinity,
    cancelRetry = () => false,
  } = (typeof config === 'number') ? {initialInterval: config} : config;
  return <T>(source: Observable<T>) => source.pipe(
      retryWhen<T>(errors => zip(errors, interval(0)).pipe(
          // [error, i] come from 'errors' observable
          concatMap(([error, i]) => iif(
              () =>
                  i < maxAttempts && !cancelRetry(error),
              timer(getDelay(
                  i, initialInterval, maxInterval)),
              throwError(error),
              ),
          ),
      )),
  );
}