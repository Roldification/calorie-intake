import { defineStore, acceptHMRUpdate } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    counter: 0,
    uoms: <{value: string, label: string}[]>[
      {value: 'g', label: 'g'},
      {value: 'oz', label: 'oz'},
    ],
    intakes: <{
      food: string,
      amount: number,
      uom: string,
      calories: number,
    }[]>[],
  }),

  getters: {
    doubleCount: (state) => state.counter * 2,
  },

  actions: {
    increment() {
      this.counter++;
    },

    addUOM(uom: {value: string, label: string}) {
      this.uoms.push(uom);  
    },

    addIntake(intake: {food: string, amount: number, uom: string, calories: number}) {
      this.intakes.push(intake);
    },

    removeIntake(index: number) {
      this.intakes.splice(index, 1);
    },

    resetIntakes() {
      this.intakes = [];
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot));
}
