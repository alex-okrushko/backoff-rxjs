import { expect } from 'chai';
import {intervalBackoff} from '../src/index';
import * as sinon from 'sinon';
import { NEVER, interval, asapScheduler, Observable, animationFrameScheduler, queueScheduler } from 'rxjs';
import {take} from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

/** @test {interval} */
describe('interval', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).to.deep.equal(expected);
    });
  });


  it('should emit sequence starting from 0 with exponentially increasing delay', () => {
    testScheduler.run(({expectObservable}) => {
      const expected = '01-2---3-------4---------------(5|)';
      expectObservable(intervalBackoff(1, testScheduler).pipe(take(6))).toBe(expected, [0, 1, 2, 3, 4, 5]);
    });
  });

  it('should emit when relative interval set to zero', () => {
    testScheduler.run(({expectObservable}) => {
      const expected = '(012345|)';
      expectObservable(intervalBackoff(0, testScheduler).pipe(take(6))).toBe(expected, [0, 1, 2, 3, 4, 5]);
    });
  });

  it('should consider negative interval as zero', () => {
    testScheduler.run(({expectObservable}) => {
      const expected = '(012345|)';
      expectObservable(intervalBackoff(-1, testScheduler).pipe(take(6))).toBe(expected, [0, 1, 2, 3, 4, 5]);
    });
  });

  it('should emit values until unsubscribed', (done: MochaDone) => {
    const values: number[] = [];
    const expected = [0, 1, 2, 3, 4, 5, 6];
    const e1 = intervalBackoff(2);
    const subscription = e1.subscribe((x: number) => {
      values.push(x);
      if (x === 6) {
        subscription.unsubscribe();
        expect(values).to.deep.equal(expected);
        done();
      }
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should create an observable emitting periodically with the AsapScheduler', (done: MochaDone) => {
    console.log(sinon);
    const sandbox = sinon.createSandbox();
    // const fakeTimer = sandbox.useFakeTimers();
    // const period = 1;
    // const events = [0, 1, 2, 3, 4, 5];
    // const source = intervalBackoff(period, asapScheduler).pipe(take(6));
    // source.subscribe({
    //   next(x) {
    //     expect(x).to.equal(events.shift());
    //   },
    //   error(e) {
    //     sandbox.restore();
    //     done(e);
    //   },
    //   complete() {
    //     expect(asapScheduler.actions.length).to.equal(0);
    //     expect(asapScheduler.scheduled).to.equal(undefined);
    //     sandbox.restore();
    //     done();
    //   }
    // });
    // let i = -1, n = events.length;
    // while (++i < n) {
    //   fakeTimer.tick(period);
    // }
  });

  // it('should create an observable emitting periodically with the QueueScheduler', (done: MochaDone) => {
  //   const sandbox = sinon.sandbox.create();
  //   const fakeTimer = sandbox.useFakeTimers();
  //   const period = 10;
  //   const events = [0, 1, 2, 3, 4, 5];
  //   const source = interval(period, queueScheduler).take(6);
  //   source.subscribe({
  //     next(x) {
  //       expect(x).to.equal(events.shift());
  //     },
  //     error(e) {
  //       sandbox.restore();
  //       done(e);
  //     },
  //     complete() {
  //       expect(queueScheduler.actions.length).to.equal(0);
  //       expect(queueScheduler.scheduled).to.equal(undefined);
  //       sandbox.restore();
  //       done();
  //     }
  //   });
  //   let i = -1, n = events.length;
  //   while (++i < n) {
  //     fakeTimer.tick(period);
  //   }
  // });

  // it('should create an observable emitting periodically with the AnimationFrameScheduler', (done: MochaDone) => {
  //   const sandbox = sinon.sandbox.create();
  //   const fakeTimer = sandbox.useFakeTimers();
  //   const period = 10;
  //   const events = [0, 1, 2, 3, 4, 5];
  //   const source = interval(period, animationFrameScheduler).take(6);
  //   source.subscribe({
  //     next(x) {
  //       expect(x).to.equal(events.shift());
  //     },
  //     error(e) {
  //       sandbox.restore();
  //       done(e);
  //     },
  //     complete() {
  //       expect(animationFrameScheduler.actions.length).to.equal(0);
  //       expect(animationFrameScheduler.scheduled).to.equal(undefined);
  //       sandbox.restore();
  //       done();
  //     }
  //   });
  //   let i = -1, n = events.length;
  //   while (++i < n) {
  //     fakeTimer.tick(period);
  //   }
  // });
});