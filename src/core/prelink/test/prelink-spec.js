/* global it, inject, jasmine, module, spyOn, beforeEach, expect, describe */

import angular from 'angular';
import _ from 'lodash';
// import $ from 'jquery';

import Tester from 'tester';

import ngModule from '../';

describe('avPreLink', () => {

  let avPreLink;

  const tester = new Tester();

  const waitPromise = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
  };

  beforeEach(() => angular.mock.module(ngModule.name));

  beforeEach(inject((_avPreLink_) => {
    avPreLink = _avPreLink_;
  }));

  beforeEach(() => {
    spyOn(window, 'open');
  });

  tester.service();

  // beforeEach(() => {
  //   this.mockEvents = {
  //
  //   };
  // });
  it('should exist', () => {
    expect(avPreLink).toBeDefined();
  });

  const mockLink = {
    href: 'mockHref',
    target: 'mockTarget'
  };
  const newTabEventVals = [
    {
      path: 'ctrlKey',
      val: true
    },
    {
      path: 'shiftKey',
      val: true
    },
    {
      path: 'metakey',
      val: true
    },
    {
      path: 'button',
      val: 1
    },
    {
      path: 'delegateTarget.attributes.target.value',
      val: '_blank'
    }
  ];

  const buildEvent = (linkObj = mockLink) => {
    const output = {
      preventDefault: jasmine.createSpy(),
      stopPropogation: jasmine.createSpy()
    };
    _.forEach(linkObj, (val, key) => {
      _.set(output, ['delegateTarget', 'attributes', key, 'value'], val);
    });
    return output;
  };

  it('should get link info from event', () => {
    const thisEvent = buildEvent();
    const linkObj = avPreLink.getLinkObj(thisEvent);
    expect(linkObj).toEqual(mockLink);
  });

  it('should set link target to blank on opening in new tab', () => {
    _.forEach(newTabEventVals, (checkObj) => {
      const thisEvent = buildEvent();
      _.set(thisEvent, checkObj.path, checkObj.val);
      const linkObj = avPreLink.getLinkObj(thisEvent);
      expect(linkObj).toEqual(_.assign({}, mockLink, { target: '_blank' }));
    });
  });

  it('should call preventDefault and stopPropogation on navigating links on page', () => {
    const thisEvent = buildEvent();
    const linkObj = avPreLink.toWaitEvent(thisEvent);
    expect(linkObj).toEqual(mockLink);
    expect(thisEvent.preventDefault).toHaveBeenCalled();
    expect(thisEvent.stopPropogation).toHaveBeenCalled();
  });

  it('shouldn\'t call preventDefault and stopPropogation on navigating links on new tab', () => {
    _.forEach(newTabEventVals, (checkObj) => {
      const thisEvent = buildEvent();
      _.set(thisEvent, checkObj.path, checkObj.val);
      const linkObj = avPreLink.toWaitEvent(thisEvent);
      expect(linkObj).toBeFalsy();
      expect(thisEvent.preventDefault).not.toHaveBeenCalled();
      expect(thisEvent.stopPropogation).not.toHaveBeenCalled();
    });
  });

  it('should treat variables, functions, and promises as promises', (done) => {
    avPreLink.promiseMaybeFn('hello')
    .then(result => {
      expect(result).toEqual('hello');
      return avPreLink.promiseMaybeFn(() => {
        return 'world';
      });
    })
    .then(result => {
      expect(result).toEqual('world');
      const promiseToReturn = new Promise(resolve => { resolve('promise') });
      return avPreLink.promiseMaybeFn(promiseToReturn);
    })
    .then(result => {
      expect(result).toEqual('promise');
      done();
    }, err => {
      done.fail(err);
    });
  });

  it('should navigate after promise finishes', (done) => {
    const thisEvent = buildEvent();
    const thisFn = () => {
      return waitPromise(100);
    };
    expect(window.open).not.toHaveBeenCalled();
    avPreLink.runPromiseEvent(thisFn, thisEvent)
    .then(() => {
      expect(window.open).toHaveBeenCalledWith(mockLink.href, mockLink.target);
      done();
    }, err => {
      done.fail(err);
    });
  });

  it('should navigate to last promise entered', (done) => {
    const link1 = {
      href: 'link1',
      target: '_self'
    };
    const link2 = {
      href: 'link2',
      target: '_self'
    };
    const event1 = buildEvent(link1);
    const event2 = buildEvent(link2);
    const fn1 = () => {
      return waitPromise(50);
    };
    const fn2 = () => {
      return waitPromise(150);
    };
    expect(window.open).not.toHaveBeenCalled();
    const finish = _.after(2, () => {
      expect(window.open).toHaveBeenCalledWith(link2.href, link2.target);
      done();
    });

    avPreLink.runPromiseEvent(fn1, event1)
    .then(() => {
      finish();
    }, err => {
      done.fail(err);
    });
    avPreLink.runPromiseEvent(fn2, event2)
    .then(() => {
      finish();
    }, err => {
      done.fail(err);
    });
  });

  it('should navigate to last thing entered', (done) => {
    const link1 = {
      href: 'link1',
      target: '_self'
    };
    const link2 = {
      href: 'link2',
      target: '_self'
    };
    const event1 = buildEvent(link1);
    const event2 = buildEvent(link2);
    const fn1 = () => {
      return 'hello';
    };
    const fn2 = () => {
      return waitPromise(150);
    };
    expect(window.open).not.toHaveBeenCalled();
    const finish = _.after(2, () => {
      expect(window.open).toHaveBeenCalledWith(link2.href, link2.target);
      done();
    });

    avPreLink.runPromiseEvent(fn1, event1)
    .then(() => {
      finish();
    }, err => {
      done.fail(err);
    });
    avPreLink.runPromiseEvent(fn2, event2)
    .then(() => {
      finish();
    }, err => {
      done.fail(err);
    });
  });

  it('should skip promises opening a new tab', (done) => {
    const link1 = {
      href: 'link1',
      target: '_self'
    };
    const link2 = {
      href: 'link2',
      target: '_blank'
    };
    const event1 = buildEvent(link1);
    const event2 = buildEvent(link2);

    let fn1Called = false;
    let fn1Done = false;
    const fn1 = () => {
      fn1Called = true;
      return waitPromise(100)
      .then(() => {
        fn1Done = true;
      });
    };
    let fn2Called = false;
    let fn2Done = false;
    const fn2 = () => {
      fn2Called = true;
      return waitPromise(50)
      .then(() => {
        fn2Done = true;
      });
    };

    expect(window.open).not.toHaveBeenCalled();

    const finish = _.after(2, () => {
      expect(fn1Done).toBeTruthy();
      expect(fn2Done).toBeTruthy();
      done();
    });

    avPreLink.runPromiseEvent(fn1, event1)
    .then(() => {
      expect(fn1Called).toBeTruthy();
      expect(fn2Called).toBeTruthy();
      expect(window.open).toHaveBeenCalledWith(link1.href, link1.target);
      finish();
    }, err => {
      done.fail(err);
    });
    avPreLink.runPromiseEvent(fn2, event2)
    .then(() => {
      expect(fn1Called).toBeTruthy();
      expect(fn2Called).toBeTruthy();
      expect(window.open).not.toHaveBeenCalled();
      finish();
    }, err => {
      done.fail(err);
    });
  });
});
