<template>
  <div class="h-16 p-2 rounded-[32px] w-full border-2 border-[#b7b7b7] justify-start items-start gap-2.5 inline-flex">
    <div id="textInput" contenteditable='true' @input="edit"
      class="grow shrink text-black basis-0 self-stretch p-2.5 rounded-3xl justify-start items-center gap-2.5 flex overflow-hidden">
      <!-- <div id="textInput" contenteditable='true' @input="edit"  class="text-black text-xl font-normal font-['Inter']">输入文字……</div> -->
    </div>
    <div class="flex-col justify-center items-center gap-2.5 inline-flex">
      <button @click="submit"
        class="w-12 h-12 p-2.5 bg-gradient-to-br from-[#242424] to-[#3d3d3d] rounded-3xl shadow-[1px_1px_1.399999976158142px_0px_rgba(0,0,0,0.30)] border border-[#494949] justify-center items-center gap-2.5 inline-flex overflow-hidden">
        <div class="text-white/40 text-[15px] font-black font-['Noto Sans SC']">GO</div>
      </button>
    </div>
  </div>


  <!-- <div class="flex w-full border border-black">
    <div id="textInput" contenteditable='true' @input="edit" class="flex-grow p-2 border-r border-black">
    </div>
    <button @click="submit" class="bg-red-100 h-full w-20 hover:bg-red-200">Submit</button>
  </div> -->
</template>


<script>
import { Actions } from '@/utils/actions';
import { useComponentsStatusStore } from '@/stores/componentsStatusStore';
export default {
  props: {
    element: Object,
  },
  data() {
    return {
      editing: false,
      editingText: '',
    }
  },
  computed: {
    focused() {
      return this.components.textInput.status === "focused"
    }
  },
  setup() {
    const components = useComponentsStatusStore();
    return { components };
  },
  watch: {
    focused(newFocused) {
      const textInput = document.getElementById("textInput");
      if (newFocused) {
        const focusedTarget = document.getElementById("focusedTarget");
        textInput.innerText = focusedTarget.innerText;
        this.editing = true;
      } else {
        textInput.innerText = '';
        this.editing = false;
      }
    }
  },
  methods: {
    edit() {
      const textInput = document.getElementById("textInput");
      // const focusedTarget = document.getElementById("focusedTarget");
      if (this.editing) {
        this.editingText = textInput.innerText
      }
    },
    submit() {
      this.editing = false;

      const textInput = document.getElementById("textInput");
      textInput.innerText = '';

      const focusedTarget = document.getElementById("focusedTarget");
      focusedTarget.innerText = this.editingText;
      this.editingText = '';
      
      Actions.refreshContent();
      Actions.setComponentAttrs("textInput", "status", "default");
    }
  }
}
</script>

<style scoped></style>