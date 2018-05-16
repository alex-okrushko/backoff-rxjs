import {iif, interval, Observable, throwError, timer, zip} from 'rxjs';
import {concatMap, retryWhen} from 'rxjs/operators';

import {getDelay, defaultBackoffDelay} from '../utils';

export interface RetryBackoffConfig<E> {
  initialInterval: number;
  maxAttempts?: number;
  maxInterval?: number;
  cancelRetry?: (error: E) => boolean;
  backoffDelay: (iteration: number, initialInterval: number) => number;
}

/**
 * Returns an Observable that mirrors the source Observable with the exception
 * of an error. If the source Observable calls error, rather than propagating
 * the error call this method will resubscribe to the source Observable with
 * exponentially increasing interval and up to a maximum of count
 * resubscriptions (if provided). Retry can be cancelled at any point if
 * cancelRetry condition is met.
 */
export function retryBackoff<E>(
    config: number|RetryBackoffConfig<E>):
    <T>(source: Observable<T>) => Observable<T> {
  const {
    initialInterval,
    maxAttempts = Infinity,
    maxInterval = Infinity,
    cancelRetry = () => false,
    backoffDelay = defaultBackoffDelay,
  } = (typeof config === 'number') ? {initialInterval: config} : config;
  return <T>(source: Observable<T>) => source.pipe(
      retryWhen<T>(errors => zip(errors, interval(0)).pipe(
          // [error, i] come from 'errors' observable
          concatMap(([error, i]) => iif(
              () => i < maxAttempts && !cancelRetry(error),
              timer(getDelay(backoffDelay(i, initialInterval), maxInterval)),
              throwError(error),
              ),
          ),
      )),
  );
}