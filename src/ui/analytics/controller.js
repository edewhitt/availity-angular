import angular from 'angular';
import ngModule from '../module';
import Base from '../base';

import '../../core/analytics/utils';

class AvAnalyticsController extends Base {

  static $inject = ['avAnalyticsUtils', 'avAnalytics', 'avPreLink'];

  constructor(...args){
    super(...args);
  }

  onEvent(event, element, options) {

    const properties = angular.extend(
      {
        level: 'info',
        label: element.text()
      },
      {
        event: event.type
      },
      options
    );

    this.av.avPreLink.runPromiseEvent(() => {
      return this.av.avAnalytics.trackEvent(properties);
    }, event);

  }

}

ngModule.controller('AvAnalyticsController', AvAnalyticsController);
