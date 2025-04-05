<template>
  <div
    class="size-full flex gap-20 items-center justify-center p-5"
  >
    <div class="flex flex-col border border-black h-full w-80">
      <pre>
      <div ref="mdTemplate" class="border border-black size-full overflow-y-scroll" contenteditable>
---
page: homepage
actions:
  deleteTodoItem: tap, delete
  addTodoItem: tap, input, addLine("todoItem")
  editTodoItem: tap, input, edit
  sortItem: sortByPrompt("按照重要紧急的四象限排序")
---

# TodoList

## 重要且紧急

[购买后年的机票](agentyui:todoItem)
[准备明天的演讲](agentyui:todoItem)

## 重要但不紧急

[学习Vue框架](agentyui:todoItem)
[更新个人简历](agentyui:todoItem)

## 不重要但紧急

[回复邮件](agentyui:todoItem)
[安排团队会议](agentyui:todoItem)

## 不重要且不紧急

[整理工作空间](agentyui:todoItem)
[浏览行业新闻](agentyui:todoItem)
</div>
     </pre>
      <button
        @click="updateTemplate"
        class="h-20 w-20 bg-red-400"
      >
        更新
      </button>
    </div>
    <div
      class="flex flex-col overflow-hidden border border-black h-full rounded-[2em]"
      style="aspect-ratio: 0.5625"
    >
      <div class="border border-black w-full h-fit">
        <component
          v-for="(node, index) in this.app.nodes"
          :key="index"
          :is="node.type"
          :index="index"
          :ref="node.itemType ? 'item' : null"
          :content="node.content"
          :class="{
            'hover:bg-blue-100': node.itemType !== null,
          }"
          class="size-fit"
        >
          {{ node.content }}
        </component>
      </div>
      <div
        class="flex p-2 gap-2 border border-black w-full h-18"
      >
        <div
          ref="textInput"
          class="border border-black w-full h-full rounded-md"
          :style="{
            backgroundColor: inputActive ? '#fff' : '#999',
          }"
          :contenteditable="inputActive"
        ></div>
        <button
          ref="submitButton"
          :style="{
            backgroundColor: inputActive ? '#fff' : '#999',
          }"
          class="border border-black w-20 h-full rounded-md text-black text-center"
          :disabled="!inputActive"
        >
          发送
        </button>
      </div>
      <div
        class="flex flex-wrap items-center justify-center p-8 gap-4 border border-black w-full h-fit"
      >
        <div
          v-for="userAction in this.app.userActions"
          class="flex flex-col items-center w-20"
        >
          <div
            class="flex border border-black size-14 rounded-xl"
            @click="actionHandler(userAction)"
          ></div>
          <span class="text-xs">{{ userAction.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "./stores/appStore";
import { MdAst, Pipe, Utils } from "./utils/actions";
import * as R from "ramda";

export default {
  data() {
    return {
      inputActive: false,
    };
  },
  components: {
    heading1: {
      props: ["content"],
      template: "<h1>{{ content }}</h1>",
    },
    heading2: {
      props: ["content"],
      template: "<h2>{{ content }}</h2>",
    },
    heading3: {
      props: ["content"],
      template: "<h2>{{ content }}</h2>",
    },
    heading4: {
      props: ["content"],
      template: "<h2>{{ content }}</h2>",
    },
    paragraph: {
      props: ["content"],
      template: "<p>{{ content }}</p>",
    },
    listItem: {
      props: ["content"],
      template: "<li>{{ content }}</li>",
    },
  },
  setup() {
    const app = useAppStore();
    return { app };
  },
  mounted() {
    this.updateTemplate();
  },
  methods: {
    updateTemplate() {
      const [meta, md] = Utils.splitTemplate(
        this.$refs.mdTemplate.textContent,
      );
      this.app.updateMeta(meta);
      this.app.updateMd(md);
    },

    async submitInput() {
      return new Promise((resolve) => {
        this.inputActive = true;

        const submitButton = this.$refs.submitButton;
        const submitHandler = () => {
          const textInput = this.$refs.textInput;
          const inputValue = textInput.innerHTML;
          textInput.innerHTML = "";
          submitButton.removeEventListener(
            "click",
            submitHandler,
          );
          this.inputActive = false;
          resolve(inputValue);
        };
        submitButton.addEventListener("click", submitHandler);
      });
    },

    async actionHandler(_actionObject) {
      const updateMdFromAction = R.pipe(
        R.call,
        R.andThen(this.app.updateMd),
      );

      const selectedIndex = R.includes(
        "tap",
        _actionObject.actionFlow,
      )
        ? await this.tapSelect()
        : undefined;

      const inputValue = R.includes(
        "input",
        _actionObject.actionFlow,
      )
        ? await this.submitInput()
        : undefined;

      const action = R.pipe(
        R.replace("tap", `selectByIndex(${selectedIndex})`),
        R.replace("input", `input("${inputValue}")`),
        Pipe.pipeFunction,
      )(_actionObject.actionFlow);

      updateMdFromAction(action, this.app.md);
    },

    async tapSelect() {
      return new Promise((resolve) => {
        const itemProxies = this.$refs.item;
        const tapListeners = R.map((_itemProxy) =>
          _itemProxy.$el.addEventListener("click", () => {
            R.forEach(
              (_itemProxy) =>
                _itemProxy.$el.removeEventListener(
                  "click",
                  tapListeners,
                ),
              itemProxies,
            );
            resolve(_itemProxy.$attrs.index);
          }),
        )(itemProxies);
      });
    },
  },
};
</script>

<style scoped>
@import "tailwindcss";
</style>
