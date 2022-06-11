import {
  Observable,
  Observer,
  of,
  Subject,
  throwError,
  concat,
  map,
  mergeMap,
  share,
  from,
  concatWith,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { retryBackoff } from '../src';

describe('retryBackoff operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should handle a basic source that emits next then errors, maxRetries 3', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const subs = [
        '                  ^-------!',
        '                  ---------^-------!',
        '                  -------------------^-------!',
        '                  -------------------------------^-------!',
      ];
      const expected = '   --1-2-3----1-2-3-----1-2-3-------1-2-3-#';

      expectObservable(
        source.pipe(
          retryBackoff({
            initialInterval: 1,
            maxRetries: 3,
          })
        )
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should retry a number of times, without error, then complete', done => {
    let errors = 0;
    const retries = 2;
    new Observable((observer: Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .pipe(
        map((x: any) => {
          if (++errors < retries) {
            throw 'bad';
          }
          errors = 0;
          return x;
        }),
        retryBackoff({ initialInterval: 1, maxRetries: retries })
      )
      .subscribe({
        next: (x: number) => {
          expect(x).toEqual(42);
        },
        error: () => {
          expect('this was called').toBeTruthy();
        },
        complete: done
  });
  });

  it('should retry a number of times, then call error handler', done => {
    let errors = 0;
    const retries = 2;
    new Observable((observer: Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .pipe(
        map(() => {
          errors += 1;
          throw 'bad';
        }),
        retryBackoff({ initialInterval: 1, maxRetries: retries - 1 })
      )
      .subscribe({
        next: (x: number) => {
          expect(x).toEqual(42);
        },
        error: () => {
          expect(errors).toEqual(2);
          done();
        },
        complete: () => {
          expect('this was called').toBeTruthy();
        }
  });
  });

  it('should retry until successful completion', done => {
    let errors = 0;
    const retries = 10;
    new Observable((observer: Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .pipe(
        map((x: any) => {
          if (++errors < retries) {
            throw 'bad';
          }
          errors = 0;
          return x;
        }),
        retryBackoff({ initialInterval: 1 })
      )
      .subscribe({
        next: (x: number) => {
          expect(x).toEqual(42);
        },
        error: () => {
          expect('this was called').toBeTruthy();
        },
        complete:done
  });
  });

  it('should handle an empty source', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('|');
      const subs = '      (^!)';
      const expected = '  |';

      const result = source.pipe(retryBackoff(1));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should handle a never source', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('-');
      const subs = '       ^';
      const expected = '   -';

      const result = source.pipe(retryBackoff(1));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should return a never observable given an async just-throw source and no count', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const source = cold('-#'); // important that it's not a sync error
      const unsub = '      -------------------------------------!';
      const expected = '   --------------------------------------';

      const result = source.pipe(retryBackoff(1));

      expectObservable(result, unsub).toBe(expected);
    });
  });

  it('should handle a basic source that emits next then completes', () => {
    testScheduler.run(({ expectObservable, hot, expectSubscriptions }) => {
      const source = hot('--1--2--^--3--4--5---|');
      const subs = '      ^------------!';
      const expected = '  ---3--4--5---|';

      const result = source.pipe(retryBackoff(1));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should handle a basic source that emits next but does not complete', () => {
    testScheduler.run(({ expectObservable, hot, expectSubscriptions }) => {
      const source = hot('--1--2--^--3--4--5---');
      const subs = '              ^------------';
      const expected = '          ---3--4--5---';

      const result = source.pipe(retryBackoff(1));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should handle a basic source that emits next then errors, no maxRetries', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const unsub = '      -------------------------------------!';
      const subs = [
        '                  ^-------!                             ',
        '                  ---------^-------!                    ',
        '                  -------------------^-------!          ',
        '                  -------------------------------^-----!',
      ];
      const expected = '   --1-2-3----1-2-3-----1-2-3-------1-2--';

      const result = source.pipe(retryBackoff(1));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it(
    'should handle a source which eventually throws, maxRetries=3, and result is ' +
      'unsubscribed early',
    () => {
      testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
        const source = cold('--1-2-3-#');
        const unsub = '      -------------!';
        const subs = [
          '                  ^-------!                ',
          '                  ---------^---!           ',
        ];
        const expected = '   --1-2-3----1--';

        const result = source.pipe(
          retryBackoff({ initialInterval: 1, maxRetries: 3 })
        );

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
      });
    }
  );

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const subs = [
        '                  ^-------!                ',
        '                  ---------^---!           ',
      ];
      const expected = '   --1-2-3----1--';
      const unsub = '      -------------!           ';

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        retryBackoff(1),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should retry a synchronous source (multicasted) multiple times', done => {
    const expected = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

    const ERR = new Error('bad!');

    from([1, 2, 3])
      .pipe(
        concatWith(throwError(() => ERR)),
        share({
          connector: () => new Subject(),
        }),
        retryBackoff({ initialInterval: 1, maxRetries: 4 })
      )
      .subscribe({
        next: (x: number) => {
          expect(x).toEqual(expected.shift());
        },
        error: (err: unknown) => {
          expect(err).toEqual(ERR);
          expect(expected.length).toEqual(0);
          done();
        },
        complete: () => {
          done(new Error('should not be called'));
        },
      });
  });

  it('should increase the intervals exponentially up to maxInterval', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const subs = [
        '                  ^-------!',
        '                  ---------^-------!',
        '                  -------------------^-------!',
        '                  -----------------------------^-------!',
        //                      interval maxed out at 2 ^
      ];
      const unsub = '      -------------------------------------!';
      const expected = '   --1-2-3----1-2-3-----1-2-3-----1-2-3--';

      expectObservable(
        source.pipe(
          retryBackoff({
            initialInterval: 1,
            maxInterval: 2,
          })
        ),
        unsub
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should retry until shouldRetry is true', done => {
    let errors = 0;
    const isNotSoBad = (error: any) => error === 'not so bad';
    new Observable((observer: Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .pipe(
        map(() => {
          errors += 1;
          throw errors < 2 ? 'not so bad' : 'really bad';
        }),
        retryBackoff({ initialInterval: 1, shouldRetry: isNotSoBad })
      )
      .subscribe({
        next:() => {},
        error:(err: unknown) => {
          expect(errors).toEqual(2);
          expect(err).toEqual('really bad');
          done();
        }
  });
  });

  it('should increase the intervals calculated by backoffDelay function', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const constantDelay = (iteration: number, initialInterval: number) =>
        initialInterval;
      const source = cold('-1-#');
      const subs = [
        '                  ^--!',
        '                  ----^--!',
        '                  --------^--!',
        '                  ------------^--!',
        '                  ----------------^--!',
      ];
      const unsub = '      -------------------!';
      const expected = '   -1---1---1---1---1--';

      expectObservable(
        source.pipe(
          retryBackoff({
            initialInterval: 1,
            backoffDelay: constantDelay,
          })
        ),
        unsub
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should be referentially transparent', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source1 = cold('--#');
      const source2 = cold('--#');
      const unsub = '      ---------!';
      const subs = [
        '                  ^-!       ',
        '                  ---^-!    ',
        '                  -------^-!',
      ];
      const expected = '   ----------';

      const op = retryBackoff({
        initialInterval: 1,
      });

      expectObservable(source1.pipe(op), unsub).toBe(expected);
      expectSubscriptions(source1.subscriptions).toBe(subs);

      expectObservable(source2.pipe(op), unsub).toBe(expected);
      expectSubscriptions(source2.subscriptions).toBe(subs);
    });
  });

  it('should ensure interval state is per-subscription', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--#');
      const sub1 = '      ^--------!';
      const sub2 = '      ----------^--------!';
      const subs = [
        '                  ^-!       ',
        '                  ---^-!    ',
        '                  -------^-!',
        '                  ----------^-!       ',
        '                  -------------^-!    ',
        '                  -----------------^-!',
      ];
      const expected = '   ----------';

      const result = source.pipe(
        retryBackoff({
          initialInterval: 1,
        })
      );

      expectObservable(result, sub1).toBe(expected);
      expectObservable(result, sub2).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should reset the delay when resetOnSuccess is true', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const subs = [
        '                  ^-------!',
        '                  ---------^-------!',
        '                  ------------------^-------!',
        '                  ---------------------------^-------!',
        //                 interval always reset to 1 ^
      ];
      const unsub = '      -----------------------------------!';
      const expected = '   --1-2-3----1-2-3----1-2-3----1-2-3--';

      expectObservable(
        source.pipe(
          retryBackoff({
            initialInterval: 1,
            resetOnSuccess: true,
          })
        ),
        unsub
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should not reset the delay on consecutive errors when resetOnSuccess is true', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--------#');
      const unsub = '      -------------------------------------!';
      const subs = [
        '                  ^-------!                             ',
        '                  ---------^-------!                    ',
        '                  -------------------^-------!          ',
        '                  -------------------------------^-----!',
      ];
      const expected = '   --------------------------------------';

      const result = source.pipe(
        retryBackoff({
          initialInterval: 1,
          resetOnSuccess: true,
        })
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
});
