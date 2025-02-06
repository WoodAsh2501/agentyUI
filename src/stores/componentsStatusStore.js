import { defineStore } from "pinia";

class Component {
  constructor() {
    this.status = "default";
    this.text = "Default";
  }

  action() {
    console.log("No action");
  }

  /**
   * @param {'default' | 'disable' | 'hovering' | 'pressed' | 'focused'} newStatus
   */
  setStatus(newStatus) {
    if (
      ["default", "disable", "hovering", "pressed", "focused"].includes(
        newStatus
      )
    ) {
      this.status = newStatus;
    } else {
      throw new Error("Invalid status");
    }
  }
}

export const useComponentsStatusStore = defineStore("components", {
  state: () => ({
    buttonA: new Component(),
    buttonB: new Component(),
    textInput: new Component(),
  }),
  getters: {
    get(target, attrs) {
      return this[target][attrs]
    }
  },
  actions: {
    /**
     * @param {'buttonA' | 'buttonB' | 'textInput'} target
     * @param {'text' | 'status' | 'action'} attrs
     * @param {string | function} value
     */
    set(target, attrs, value) {
      if (["buttonA", "buttonB", "textInput"].includes(target)) {
        this[target][attrs] = value;
      } else {
        throw new Error("Invalid parameter");
      }
    },
  },
});
