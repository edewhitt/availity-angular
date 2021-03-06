/*global availity, inject, describe, it, beforeEach, expect, module*/

describe('avValField', function() {

  'use strict';

  beforeEach(function() {
    module('availity', 'availity.ui', 'availity.ui.templates', function(avValProvider) {
      avValProvider.addRules({
        'default': {
          'lastName': {
            'size': {
              'min': 2,
              'max': 10,
              'message': 'Last name must be between 2 and 10 characters.'
            },
            'required': {
              'message': 'Last name is required.'
            }
          },
          'zip': {
            'required': {
              'message': 'Zip is required.'
            }
          },
          'dateFormat': {
            'format': 'MM/DD/YYYY',
            'message': 'Format needs to be MM/DD/YYYY'
          }
        }
      });
    });
  });

  availity.mock.directiveSpecHelper();

  var $el;

  beforeEach(function() {

    availity.mock.$scope.demo = {};
    availity.mock.$scope.demo.rules = 'default';

  });

  beforeEach(inject(function(_$templateCache_) {

    var $templateCache = _$templateCache_;
    var template  = $templateCache.get('ui/validation/tests/field-fixture.html');

    $el = availity.mock.compileDirective(template);

  }));

  it('should be valid and model should updated with new value', function() {
    availity.mock.$scope.myForm.lastName.$setViewValue('lastName');
    availity.mock.$scope.$digest();

    expect(availity.mock.$scope.myForm.lastName.$invalid).toBe(false);
    expect(availity.mock.$scope.demo.lastName).toBe('lastName');
  });

  it('should NOT be valid and model should NOT be updated', function() {
    availity.mock.$scope.myForm.lastName.$setViewValue('1');
    availity.mock.$scope.$digest();

    expect(availity.mock.$scope.myForm.lastName.$invalid).toBe(true);
    expect(availity.mock.$scope.demo.lastName).toBeUndefined();
  });

  it('should NOT be valid and model should be updated', function() {
    availity.mock.$scope.myForm.invalidAllowed.$setViewValue('1');
    availity.mock.$scope.$digest();

    expect(availity.mock.$scope.myForm.invalidAllowed.$invalid).toBe(true);
    expect(availity.mock.$scope.demo.invalidAllowed).toBe('1');
  });

  it('should have .has-error class on form group when options.show === true', function() {
    availity.mock.$scope.$digest();

    var formGroup = $('#showOnLoadFormGroup');
    expect(availity.mock.$scope.myForm.showOnLoad.$invalid).toBe(true);
    expect(formGroup.hasClass('has-error')).toBeTruthy();
  });

  it('should have .has-error class on form-group', function () {
    availity.mock.$scope.myForm.lastName.$setViewValue('1');
    availity.mock.$scope.$digest();

    var formGroup = $('#lastNameFormGroup');
    expect(availity.mock.$scope.myForm.lastName.$invalid).toBe(true);
    expect(formGroup.hasClass('has-error')).toBeTruthy();
  });

  describe('events', function() {

    it('should validate on blur', function() {
      availity.mock.$scope.demo.zip = null;

      $el.find('[name="zip"]').blur();
      availity.mock.$scope.$digest();
      availity.mock.flush();
      expect(availity.mock.$scope.myForm.zip.$invalid).toBe(true);
    });

    it('should reset form', function () {
      availity.mock.$scope.myForm.lastName.$setViewValue('1');
      availity.mock.$scope.$digest();
      availity.mock.$scope.$broadcast('av:val:reset');

      availity.mock.$scope.$digest();
      availity.mock.flush();
      var formGroup = $('#lastNameFormGroup');

      expect(availity.mock.$scope.myForm.lastName.$invalid).toBe(true);
      expect(formGroup.hasClass('has-error')).toBeFalsy();
    });

  });

  describe('with avDatePicker', function() {

    it('should validate model using default format', function() {
      availity.mock.$scope.demo.date = new Date(1986, 0, 22);
      availity.mock.$scope.$digest();

      expect(availity.mock.$scope.myForm.date.$invalid).toBe(false);
      expect(availity.mock.$scope.myForm.date.$viewValue).toBe('01/22/1986');
    });

    it('should validate ISO 8601 string date model using default format', function() {
      availity.mock.$scope.demo.date = '2014-12-31T23:00:00Z';
      angular.mock.TzDate(+1, '2014-12-31T23:00:00Z');
      availity.mock.$scope.$digest();

      expect(availity.mock.$scope.myForm.date.$invalid).toBe(false);
      expect(availity.mock.$scope.myForm.date.$viewValue).toBe('12/31/2014');
    });

  });

});
