import { expect } from 'chai';
import { retryBackoff } from '../src/index';
import { of, Observable, Observer, throwError, Subject } from 'rxjs';
import { map, mergeMap, concat, multicast, refCount } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

describe('retryBackoff operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).to.deep.equal(expected);
    });
  });

  it('should handle a basic source that emits next then errors, maxAttempts 4', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const subs = [
        '                  ^-------!',
        '                  ---------^-------!',
        '                  -------------------^-------!',
        '                  -------------------------------^-------!'
      ];
      const expected = '   --1-2-3----1-2-3-----1-2-3-------1-2-3-#';

      expectObservable(
        source.pipe(
          retryBackoff({
            initialInterval: 1,
            maxAttempts: 4
          })
        )
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should retry a number of times, without error, then complete', (done: MochaDone) => {
    let errors = 0;
    const retries = 2;
    Observable.create((observer: Observer<number>) => {
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
        retryBackoff({ initialInterval: 1, maxAttempts: retries })
      )
      .subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect('this was called').to.be.true;
        },
        done
      );
  });

  it('should retry a number of times, then call error handler', (done: MochaDone) => {
    let errors = 0;
    const retries = 2;
    Observable.create((observer: Observer<number>) => {
      observer.next(42);
      observer.complete();
    })
      .pipe(
        map((x: any) => {
          errors += 1;
          throw 'bad';
        }),
        retryBackoff({ initialInterval: 1, maxAttempts: retries })
      )
      .subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect(errors).to.equal(2);
          done();
        },
        () => {
          expect('this was called').to.be.true;
        }
      );
  });

  it('should retry until successful completion', (done: MochaDone) => {
    let errors = 0;
    const retries = 10;
    Observable.create((observer: Observer<number>) => {
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
      .subscribe(
        (x: number) => {
          expect(x).to.equal(42);
        },
        (err: any) => {
          expect('this was called').to.be.true;
        },
        done
      );
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

  it('should handle a basic source that emits next then errors, no count', () => {
    testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
      const source = cold('--1-2-3-#');
      const unsub = '      -------------------------------------!';
      const subs = [
        '                  ^-------!                             ',
        '                  ---------^-------!                    ',
        '                  -------------------^-------!          ',
        '                  -------------------------------^-----!'
      ];
      const expected = '   --1-2-3----1-2-3-----1-2-3-------1-2--';

      const result = source.pipe(retryBackoff(1));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it(
    'should handle a source which eventually throws, count=3, and result is ' +
      'unsubscribed early',
    () => {
      testScheduler.run(({ expectObservable, cold, expectSubscriptions }) => {
        const source = cold('--1-2-3-#');
        const unsub = '      -------------!';
        const subs = [
          '                  ^-------!                ',
          '                  ---------^---!           '
        ];
        const expected = '   --1-2-3----1--';

        const result = source.pipe(
          retryBackoff({ initialInterval: 1, maxAttempts: 3 })
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
        '                  ---------^---!           '
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

  it('should retry a synchronous source (multicasted and refCounted) multiple times', (done: MochaDone) => {
    const expected = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

    of(1, 2, 3)
      .pipe(
        concat(throwError('bad!')),
        multicast(() => new Subject()),
        refCount(),
        retryBackoff({ initialInterval: 1, maxAttempts: 5 })
      )
      .subscribe(
        (x: number) => {
          expect(x).to.equal(expected.shift());
        },
        (err: any) => {
          expect(err).to.equal('bad!');
          expect(expected.length).to.equal(0);
          done();
        },
        () => {
          done(new Error('should not be called'));
        }
      );
  });
});
