import demo from 'demo';

import '../';
import states from './fixtures/states';
import pokemon from './fixtures/pokemon';

demo.factory('demoDropdownService', ($log) => {

  class DemoDropdownService {

    constructor() {

      // SIMPLE DOM EXAMPLE
      this.selectedNumber = null;

      // ARRAY EXAMPLE
      this.pokemon = pokemon;
      this.selectedPoke = null;

      // ARRAY OF OBJECTS EXAMPLE
      this.states = states;
      this.selectedState1 = null;
      this.selectedState2 = null;
      this.selectedState3 = null;
      this.selectedStates = [{ id: 'WY', name: 'Wyoming' }, { id: 'NM', name: 'New Mexico' }];

    }

    removeState() {

      if (this.states.length > 1) {
        const removed = this.states.pop();
        $log.info(`State ${JSON.stringify(removed)} was removed`);
      }

    }

    setState1() {
      this.selectedState1 = this.states[this.states.length - 1];
    }

    setState2() {
      this.selectedState2 = this.states[this.states.length - 1];
    }

    setState3() {
      this.selectedState3 = this.states[this.states.length - 1];
    }

    resetPoke() {
      this.selectedPoke = null;
    }

    isPokeDisabled() {
      return this.selectedPoke === null;
    }

    resetNumber() {
      this.selectedNumber = null;
    }

    isNumberDisabled() {
      return this.selectedNumber === null;
    }

    resetState1() {
      this.selectedState1 = null;
    }

    resetState2() {
      this.selectedState2 = null;
    }

    resetState3() {
      this.selectedState3 = null;
    }

    resetMultiple() {
      this.selectedStates = null;
    }

    onChange(selected) {

      if (selected) {
        $log.info(`Selected value is ${JSON.stringify(selected)}`);
      }

    }

  }

  return new DemoDropdownService();

});
