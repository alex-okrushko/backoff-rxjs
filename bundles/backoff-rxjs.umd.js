(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("rxjs"), require("rxjs/operators"));
	else if(typeof define === 'function' && define.amd)
		define(["rxjs", "rxjs/operators"], factory);
	else if(typeof exports === 'object')
		exports["backoff-rxjs"] = factory(require("rxjs"), require("rxjs/operators"));
	else
		root["backoff-rxjs"] = factory(root["rxjs"], root["rxjs"]["operators"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_rxjs__, __WEBPACK_EXTERNAL_MODULE_rxjs_operators__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar retryBackoff_1 = __webpack_require__(/*! ./operators/retryBackoff */ \"./src/operators/retryBackoff.ts\");\nexports.retryBackoff = retryBackoff_1.retryBackoff;\nvar intervalBackoff_1 = __webpack_require__(/*! ./observable/intervalBackoff */ \"./src/observable/intervalBackoff.ts\");\nexports.intervalBackoff = intervalBackoff_1.intervalBackoff;\n\n\n//# sourceURL=webpack://backoff-rxjs/./src/index.ts?");

/***/ }),

/***/ "./src/observable/intervalBackoff.ts":
/*!*******************************************!*\
  !*** ./src/observable/intervalBackoff.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar rxjs_1 = __webpack_require__(/*! rxjs */ \"rxjs\");\nvar operators_1 = __webpack_require__(/*! rxjs/operators */ \"rxjs/operators\");\nvar utils_1 = __webpack_require__(/*! ../utils */ \"./src/utils.ts\");\nfunction intervalBackoff(config, scheduler) {\n    if (scheduler === void 0) { scheduler = rxjs_1.asyncScheduler; }\n    var _a = typeof config === 'number' ? { initialInterval: config } : config, initialInterval = _a.initialInterval, _b = _a.maxInterval, maxInterval = _b === void 0 ? Infinity : _b, _c = _a.backoffDelay, backoffDelay = _c === void 0 ? utils_1.exponentialBackoffDelay : _c;\n    initialInterval = (initialInterval < 0) ? 0 : initialInterval;\n    return rxjs_1.of(0, scheduler).pipe(operators_1.expand(function (iteration) {\n        return rxjs_1.timer(utils_1.getDelay(backoffDelay(iteration, initialInterval), maxInterval))\n            .pipe(operators_1.mapTo(iteration + 1));\n    }));\n}\nexports.intervalBackoff = intervalBackoff;\n\n\n//# sourceURL=webpack://backoff-rxjs/./src/observable/intervalBackoff.ts?");

/***/ }),

/***/ "./src/operators/retryBackoff.ts":
/*!***************************************!*\
  !*** ./src/operators/retryBackoff.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar rxjs_1 = __webpack_require__(/*! rxjs */ \"rxjs\");\nvar operators_1 = __webpack_require__(/*! rxjs/operators */ \"rxjs/operators\");\nvar utils_1 = __webpack_require__(/*! ../utils */ \"./src/utils.ts\");\nfunction retryBackoff(config) {\n    var _a = typeof config === 'number' ? { initialInterval: config } : config, initialInterval = _a.initialInterval, _b = _a.maxRetries, maxRetries = _b === void 0 ? Infinity : _b, _c = _a.maxInterval, maxInterval = _c === void 0 ? Infinity : _c, _d = _a.shouldRetry, shouldRetry = _d === void 0 ? function () { return true; } : _d, _e = _a.backoffDelay, backoffDelay = _e === void 0 ? utils_1.exponentialBackoffDelay : _e;\n    return function (source) {\n        return source.pipe(operators_1.retryWhen(function (errors) {\n            return errors.pipe(operators_1.concatMap(function (error, i) {\n                return rxjs_1.iif(function () { return i < maxRetries && shouldRetry(error); }, rxjs_1.timer(utils_1.getDelay(backoffDelay(i, initialInterval), maxInterval)), rxjs_1.throwError(error));\n            }));\n        }));\n    };\n}\nexports.retryBackoff = retryBackoff;\n\n\n//# sourceURL=webpack://backoff-rxjs/./src/operators/retryBackoff.ts?");

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nfunction getDelay(backoffDelay, maxInterval) {\n    return Math.min(backoffDelay, maxInterval);\n}\nexports.getDelay = getDelay;\nfunction exponentialBackoffDelay(iteration, initialInterval) {\n    return Math.pow(2, iteration) * initialInterval;\n}\nexports.exponentialBackoffDelay = exponentialBackoffDelay;\n\n\n//# sourceURL=webpack://backoff-rxjs/./src/utils.ts?");

/***/ }),

/***/ "rxjs":
/*!************************************************************************************!*\
  !*** external {"root":["rxjs"],"commonjs":"rxjs","commonjs2":"rxjs","amd":"rxjs"} ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;\n\n//# sourceURL=webpack://backoff-rxjs/external_%7B%22root%22:%5B%22rxjs%22%5D,%22commonjs%22:%22rxjs%22,%22commonjs2%22:%22rxjs%22,%22amd%22:%22rxjs%22%7D?");

/***/ }),

/***/ "rxjs/operators":
/*!******************************************************************************************************************************!*\
  !*** external {"root":["rxjs","operators"],"commonjs":"rxjs/operators","commonjs2":"rxjs/operators","amd":"rxjs/operators"} ***!
  \******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs_operators__;\n\n//# sourceURL=webpack://backoff-rxjs/external_%7B%22root%22:%5B%22rxjs%22,%22operators%22%5D,%22commonjs%22:%22rxjs/operators%22,%22commonjs2%22:%22rxjs/operators%22,%22amd%22:%22rxjs/operators%22%7D?");

/***/ })

/******/ });
});