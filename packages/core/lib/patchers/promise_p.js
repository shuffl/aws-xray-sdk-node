/**
 * @module promise_p
 */

/**
 * This module patches native Promise libraries provided by V8 engine
 * so all subsegments generated within Promise are attached to the correct parent.
 */

const contextUtils = require('../context_utils');

function patchPromise(Promise) {
  const then = Promise.prototype.then;
  Promise.prototype.then = function(onFulfilled, onRejected) {
    if (contextUtils.isAutomaticMode()
      && tryGetCurrentSegment()
    ) {
      const ns = contextUtils.getNamespace();

      onFulfilled = onFulfilled && ns.bind(onFulfilled);
      onRejected = onRejected && ns.bind(onRejected);
    }

    return then.call(this, onFulfilled, onRejected);
  };

  const origCatch = Promise.prototype.catch;
  if (origCatch) {
    Promise.prototype.catch = function (onRejected) {
      if (contextUtils.isAutomaticMode()
        && tryGetCurrentSegment()
      ) {
        const ns = contextUtils.getNamespace();

        onRejected = onRejected && ns.bind(onRejected);
      }

      return origCatch.call(this, onRejected);
    };
  }
}

function tryGetCurrentSegment() {
  try {
    return contextUtils.getSegment();
  } catch(e) {
    return undefined;
  }
}

function capturePromise() {
  patchPromise(Promise);
}

capturePromise.patchThirdPartyPromise = patchPromise;

module.exports.capturePromise = capturePromise;
