const expect = require('chai').expect;
const sinon = require('sinon');

const { capturePromise } = require('../../../lib/patchers/promise_p');
const contextUtils = require('../../../lib/context_utils');

const origThen = Promise.prototype.then;
const origCatch = Promise.prototype.catch;

let getNamespaceStub;
let isAutomaticModeStub;
let getSegmentStub;
let bindStub;

beforeEach(() => {
  sinon.restore();
  getNamespaceStub = sinon.stub(contextUtils, 'getNamespace');
  isAutomaticModeStub = sinon.stub(contextUtils, 'isAutomaticMode');
  getSegmentStub = sinon.stub(contextUtils, 'getSegment');
  bindStub = sinon.stub();
  bindStub.returnsArg(0);
  getNamespaceStub.returns({
    bind: bindStub
  });
});

beforeEach(() => {
  sinon.restore();
  Promise.prototype.then = origThen;
  Promise.prototype.catch = origCatch;
});

after(() => {
  sinon.restore();
  Promise.prototype.then = origThen;
  Promise.prototype.catch = origCatch;
});

function verifyBindings (segment, isAutomaticMode, onFulfilled, onRejected) {
  if (segment && isAutomaticMode) {
    if (onFulfilled) {
      sinon.assert.calledWith(bindStub, onFulfilled);
    }
    if (onRejected) {
      sinon.assert.calledWith(bindStub, onRejected);
    }
  } else {
    sinon.assert.notCalled(bindStub);
  }
}

function testThenOnFulfilled(segment, isAutomaticMode) {
  const onFulfilled = result => {
    expect(result).to.equal('resolved');
    verifyBindings(segment, isAutomaticMode, onFulfilled);
  };
  return new Promise((resolve) => {
    setTimeout(() => resolve('resolved'), 200);
  }).then(onFulfilled);
}

function testThenOnRejected(segment, isAutomaticMode, hasOnFulfilled = true) {
  const onFulfilled = hasOnFulfilled ? () => {
    throw new Error('Not rejected');
  } : undefined;

  const onRejected = error => {
    expect(error.message).to.equal('rejected');
    verifyBindings(segment, isAutomaticMode, onFulfilled, onRejected);
  };
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('rejected')), 200);
  }).then(onFulfilled, onRejected);
}

function testCatch(segment, isAutomaticMode) {
  const onRejected = error => {
    verifyBindings(segment, isAutomaticMode, undefined, onRejected);
    expect(error.message, 'rejected');
  };
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('rejected')), 200);
  }).catch(onRejected);
}

function createTests(segment, isAutomaticMode) {
  it('Promise.prototype.then', async () => {
    capturePromise();
    expect(Promise.prototype.then).not.to.equal(origThen);
    await testThenOnFulfilled(segment, isAutomaticMode);
    await testThenOnRejected(segment, isAutomaticMode);
    await testThenOnRejected(segment, isAutomaticMode, false);
  });

  it('Promise.prototype.catch', async () => {
    capturePromise();
    expect(Promise.prototype.catch).not.to.equal(origCatch);
    await testCatch(segment, isAutomaticMode);
  });
}

describe('capturePromise', () => {
  describe('no segment', () => {
    beforeEach(() => {
      getSegmentStub.throws('No segment');
      isAutomaticModeStub.returns(true);
    });

    createTests(false);
  });

  describe('not automaticMode', () => {
    beforeEach(() => {
      getSegmentStub.returns({});
      isAutomaticModeStub.returns(false);
    });

    createTests(false);
  });

  describe('binds methods', () => {
    beforeEach(() => {
      getSegmentStub.returns({});
      isAutomaticModeStub.returns(true);
    });
    createTests(true);
  });
});

describe('capturePromise.patchThirdPartyPromise', () => {
  class FakePromise {
  }
  function fakeOrigThen () {}
  function fakeOrigCatch () {}

  beforeEach(() => {
    FakePromise.prototype.then = fakeOrigThen;
    FakePromise.prototype.catch = fakeOrigCatch;
  });

  it('wraps the provided Promise lib then function', () => {
    capturePromise.patchThirdPartyPromise(FakePromise);
    expect(Promise.prototype.then).to.equal(origThen);
    expect(FakePromise.prototype.then).not.to.equal(fakeOrigThen);
  });

  it('wraps the provided Promise lib then function', () => {
    capturePromise.patchThirdPartyPromise(FakePromise);
    expect(Promise.prototype.catch).to.equal(origCatch);
    expect(FakePromise.prototype.catch).not.to.equal(fakeOrigCatch);
  });
});
