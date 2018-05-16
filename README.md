# backoff-rxjs
A collection of helpful RxJS operators to deal with backoff strategies (like exponential backoff)

## intervalExponential
![Basic interval Exponential](./intervalExponentialBasic.svg)

`intervalExponential` works similiarly to `interval` except that it doubles the delay between emissions every time.


| name        | type          | attirbute  | description |
| ------------- |-------------| -----| ---------------|
| config    | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) \| [IntervalExponentialConfig](https://github.com/alex-okrushko/backoff-rxjs/blob/277fbbbde4b046733070e2ed64e0b765699fb66b/src/observable/intervalExponential.ts#L6)| required |Can take number as initial interval or a config with initial interval and optional max Interval |

`intervalExponential` is especially useful for periodic polls that are reset whenever user activity is detected:
```ts
fromEvent(document, 'mousemove').pipe(

    // There could be many mousemoves, we'd want to sample only
    // with certain frequency
    sampleTime(LOAD_INTERVAL_MS),

    // Start immediately
    startWith(null),

    // Resetting exponential interval
    switchMapTo(intervalExponential({initialInterval: LOAD_INTERVAL_MS, maxInterval: MAX_INTERVAL_MS})),
  );
```


## retryExponentialBackoff
![Retry Backoff Exponential Image](./retryBackoffExponential.svg)

| name        | type          | attirbute  | description |
| ------------- |-------------| -----| ---------------|
| config    | [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) \| [IntervalExponentialConfig](https://github.com/alex-okrushko/backoff-rxjs/blob/277fbbbde4b046733070e2ed64e0b765699fb66b/src/observable/intervalExponential.ts#L6)| required |Can take number as initial interval or a config with initial interval and optional max Interval |
