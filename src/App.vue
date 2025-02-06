<template>
  <div
    class=" bg-[#fef3f7] justify-between items-center inline-flex overflow-hidden">
    <div
      class="w-full px-0.5 pt-0.5 pb-[23px] bg-gradient-to-b from-[#c2c2c2] to-[#959595] rounded-[66px] justify-start items-center gap-2.5 flex">
      <div
        class="w-[450px] justify-between bg-[#e6e6e6] gap-8 rounded-[64px] shadow-[0px_16px_0px_0px_rgba(155,155,155,1.00)] flex-col items-center inline-flex overflow-hidden">
        <div class="flex px-[16px] pt-[48px] size-full">
          <Display :html="content.content" />
        </div>
        
        <div class="self-stretch h-fit px-[24px] flex-col justify-start items-start gap-2.5 flex">
          <div class="self-stretch h-[238px] flex-col justify-start items-start gap-4 flex">
            <div class="self-stretch justify-between items-start inline-flex gap-4">
              <Terminal />
              <div class="flex h-full flex-col w-full">
                <div id="buttonBoxLeft" class="buttonBox">
                  <Button :text="content.focus ? '编辑' : '整理'"
                  :action="content.focus ? Todo.editTodoItem : Todo.sortTodoList" />
                </div>
                <div id="buttonBoxRight" class="buttonBox">
                <Button :text="content.focus ? '删除' : '添加'"
                  :action="content.focus ? Todo.deleteTodoItem : Todo.addTodoItem" />
                </div>
              </div>
            </div>
            <Input />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- <div class="flex size-full px-140 py-20">
    <div class="flex flex-col text-black border w-full h-full border-black p-20">
      <Display :html="content.content" />
      <div class="flex flex-col border border-black size-full">
        <div class="flex border size-full">
          <Terminal />
          <div class="flex border size-full">
            <Button :text="content.focus ? '编辑' : '整理'"
              :action="content.focus ? Todo.editTodoItem : Todo.sortTodoList" />
            <Button :text="content.focus ? '删除' : '添加'"
              :action="content.focus ? Todo.deleteTodoItem : Todo.addTodoItem" />
          </div>
        </div>
        <Input />
      </div>
    </div>
  </div> -->
</template>

<script>
import Button from './components/button.vue';
import Display from './components/display.vue';
import Input from './components/input.vue';
import Terminal from './components/terminal.vue';

import { useContentStore } from './stores/contentStore';
import { useComponentsStatusStore } from './stores/componentsStatusStore';

import { Actions, Todo } from './utils/actions';

export default {
  data() {
    return {
      Todo,
      Actions,
    }
  },
  setup() {
    const content = useContentStore();
    const components = useComponentsStatusStore();
    return { content, components };
  },
  mounted() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      console.log(target);
      if (target.tagName === 'BUTTON' || target.id === 'textInput') return

      // 删除上一个选中元素的id
      const focusedTarget = document.getElementById('focusedTarget');
      if (focusedTarget && target.id !== 'focusedTarget') {
        focusedTarget.id = '';
        Actions.switchFocus(false);
      }

      if (target.tagName === 'A' && target.href.startsWith('agentyui')) {
        target.id = 'focusedTarget';
        Actions.switchFocus(true);
        // this.components.set("textInput", "status", "focused");
        
      }
    });
  },
  components: {
    Button,
    Terminal,
    Display,
    Input,
  },
  methods: {
    deleteFocusTarget() {
      const focusedTarget = document.getElementById('focusedTarget');
      const parent = focusedTarget?.parentElement;
      if (parent && parent.tagName === 'LI') {
        parent.remove();
      } else if (focusedTarget) {
        focusedTarget.remove();
      }
    }
  },

}
</script>

<style scoped>
@import 'tailwindcss';

#buttonBoxLeft {
  @apply pt-[20px] items-start
}

#buttonBoxRight {
  justify-content: end;
  @apply items-end
}

.buttonBox {
  @apply flex-col inline-flex relative w-full
}
</style>