import _ from 'lodash';

import ngModule from '../module';

const AvPreLinkFactory = () => {

  class AvPreLink {

    constructor() {
      this.navigators = [];
    }

    runNavigator(newNav) {
      if (newNav) {
        this.navigators.push(newNav);
      }
      if (!this.navigatePromise) {
        this.startNavigator();
      }
      return this.navigatePromise();
    }
    startNavigator() {
      this.navigatePromise = Promise.resolve()
      .then(() => {
        function runNext(linkObj) {
          const thisObj = _.head(this.navigators);
          if (thisObj) {
            return this.promiseMaybeFn(thisObj.fn)
            .then(() => {
              this.navigators = _.tail(this.nalodavigators);
              return runNext(thisObj.linkObj);
            });
          }
          if (linkObj) {
            window.open(linkObj.href, linkObj.target);
          }
          return Promise.resolve();
        }
        return runNext();
      })
      .then(() => {
        this.navigatePromise = undefined;
      });
    }

    promiseMaybeFn(fn) {
      return Promise.resolve(_.isFunction(fn) ? fn() : fn);
    }

    // call funciton, if its determined that we should wait, navigate after
    runPromiseEvent(fn, event) {
      const linkObj = this.toWaitEvent(event);
      // if shouldn't wait, just call function
      if (!linkObj) {
        return this.promiseMaybeFn(fn);
      }
      return this.runNavigator({
        fn,
        linkObj
      });
    }
    runPromiseLink(fn, href, target){
      const linkObj = {
        href,
        target
      };
      if (!this.toWaitLink(linkObj)) {
        return this.promiseMaybeFn(fn);
      }
      return this.runNavigator({
        fn,
        linkObj
      });
    }

    // if should wait, preventDefault and stopPropogation, return the link info, if shouldn't wait, sets link info to properly skip
    toWaitEvent(event) {
      const linkObj = this.getLinkObj(event);
      const output = this.toWaitLink(linkObj);
      if (output) {
        event.preventDefault();
        event.stopPropogation();
      }
      return output ? linkObj : output;
    }
    // return true/false if the link info should wait before navigating
    toWaitLink(linkObj) {
      return linkObj && _.result(linkObj, 'href') && _.result(linkObj, 'target') !== '_blank';
    }

    getLinkObj(event) {
      const output = {};
      output.href = _.result(event, 'delegateTarget.attributes.href.value');
      if (
        event.ctrlKey ||
        event.shiftKey ||
        event.metakey ||
        (event.button && event.button === 1)
      ) {
        output.target = '_blank';
      } else {
        output.target = _.result(event, 'delegateTarget.attributes.target.value');
      }
      return output;
    }

  }

  return new AvPreLink();

};

ngModule.factory('avPreLink', AvPreLinkFactory);

export default ngModule;
