import { intervalBackoff } from '../src/index';
import { take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

/** @test {interval} */
describe('interval', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should emit sequence starting from 0 with exponentially increasing delay', () => {
    testScheduler.run(({ expectObservable }) => {
      const expected = '01-2---3-------4---------------(5|)';
      expectObservable(
        intervalBackoff(1, testScheduler).pipe(take(6))
      ).toBe(expected, [0, 1, 2, 3, 4, 5]);
    });
  });

  it('should emit when relative interval set to zero', () => {
    testScheduler.run(({ expectObservable }) => {
      const expected = '(012345|)';
      expectObservable(
        intervalBackoff(0, testScheduler).pipe(take(6))
      ).toBe(expected, [0, 1, 2, 3, 4, 5]);
    });
  });

  it('should consider negative interval as zero', () => {
    testScheduler.run(({ expectObservable }) => {
      const expected = '(012345|)';
      expectObservable(
        intervalBackoff(-1, testScheduler).pipe(take(6))
      ).toBe(expected, [0, 1, 2, 3, 4, 5]);
    });
  });

  it('should emit values until unsubscribed', done => {
    const values: number[] = [];
    const expected = [0, 1, 2, 3, 4, 5, 6];
    const e1 = intervalBackoff(2);
    const subscription = e1.subscribe(
      (x: number) => {
        values.push(x);
        if (x === 6) {
          subscription.unsubscribe();
          expect(values).toEqual(expected);
          done();
        }
      },
      (err: any) => {
        done(new Error('should not be called'));
      },
      () => {
        done(new Error('should not be called'));
      }
    );
  });

  it('should backoff until maxInterval', () => {
    testScheduler.run(({ expectObservable }) => {
      //        6 frames between 👇 and 👇
      const expected = '01-2---3-----4-----(5|)';
      expectObservable(
        intervalBackoff(
          {
            initialInterval: 1,
            maxInterval: 6,
          },
          testScheduler
        ).pipe(take(6))
      ).toBe(expected, [0, 1, 2, 3, 4, 5]);
    });
  });
});
