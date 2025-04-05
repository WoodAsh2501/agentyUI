import { defineStore } from "pinia";
import { Pipe, MdAst } from "@/utils/actions";
import * as R from "ramda";

export const useAppStore = defineStore("app", {
  state: () => ({
    md: "",
    meta: null,
    inputValue: "",
  }),
  getters: {
    userActions() {
      return R.ifElse(
        R.isNil,
        R.always(null),
        R.pipe(
          R.prop("actions"),
          R.toPairs,
          R.map(([_name, _actionFlow]) => {
            if (R.isNil(_actionFlow))
              console.error(`Action invalid: ${_name}`);
            return {
              name: _name,
              actionFlow: _actionFlow,
              userInput: {
                tap: R.includes("tap", _actionFlow),
                input: R.includes("input", _actionFlow),
              },
            };
          }),
        ),
      )(this.meta);
    },
    nodes() {
      return R.ifElse(
        R.isEmpty,
        R.always(null),
        MdAst.buildFlatNodesList,
      )(this.md);
    },
  },
  actions: {
    updateMeta(_meta) {
      this.meta = _meta;
    },
    updateMd(_md) {
      this.md = _md;
    },
    updateInputValue(_inputValue) {
      this.inputValue = _inputValue;
    },
  },
});
