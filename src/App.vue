<template>
  <div
    class="size-full flex gap-10 items-center bg-gray-100 justify-center p-5"
  >
    <div class="flex flex-col gap-4 h-full w-160">
      <div
        ref="mdTemplate"
        class="p-2 size-full overflow-y-scroll"
      >
        <pre class="whitespace-pre-wrap">
函数文档

`tap` 通过点击选择元素

`input` 接收用户输入的值，传递给下一个函数（如addLine和edit）
`addLine(type, content)` 在已选择行后添加一行，type 为元素类型字符串，content 为内容字符串
`edit(content)` 编辑已选择的行，content 为新的内容字符串

`selectByType(type)` 通过类型选择元素，type 为字符串
`selectByPrompt(prompt)` 通过 prompt 选择元素，prompt 为字符串
`selectByIndex(index)` 通过索引选择元素，index 为数字
`selectById(id)` 通过 ID 选择元素，id 为字符串
`selectParent` 选择当前已选中元素的父元素
`selectChildren` 选择当前已选中元素的所有子元素
`selectAll` 选择所有元素
`selectHead(count)` 选择开头的 count 个元素，count 为数字，默认为 1
`selectTail(count)` 选择末尾的 count 个元素，count 为数字，默认为 1
`extendSelectedLine(count)` 从已选择的行开始，向下扩展选择 count 个元素，count 为数字

`delete` 删除所有已选择的行
`sortByPrompt(prompt)` 根据 prompt 对已选择的行进行排序，prompt 为排序条件字符串
      </pre
        >
      </div>
    </div>
    <div class="flex flex-col gap-4 h-full w-120">
      <div class="text-sm text-gray-500">
        <p>在下方输入框中编辑 Markdown 模板</p>
        <p>点击更新按钮以应用更改</p>
      </div>
      <div
        ref="mdTemplate"
        class="border p-2 border-black size-full overflow-y-scroll"
        contenteditable="plaintext-only"
      >
        <pre>
---
page: homepage
actions:
  删除: tap, delete
  添加: tap, input, addLine("todoItem")
  编辑: tap, input, edit
  排序: sortByPrompt("按照重要紧急的四象限排序")
---

# TodoList

## 重要且紧急

[购买机票](agentyui:todoItem)
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

<!-- ---
page: homepage
actions:
  记账: input, judgeByPrompt("判断用户的记账条目属于什么类型，如果是饮食则返回dining；如果是交通则返回transport；如果是医疗则返回healthcare；如果是娱乐则返回entertainment；如果是社交则返回social；如果都不满足则返回misc"), selectById, numberAdd(1)
---

# 记账
## 饮食
0  {#dining}
## 交通 
0 {#transport}
## 医疗
0 {#healthcare}
## 娱乐
0 {#entertainment}
## 社交
0 {#social}
## 杂项
0 {#misc} -->
        </pre>
      </div>
      <button
        @click="updateTemplate"
        class="h-10 w-20 bg-blue-300 rounded-2xl hover:bg-blue-500"
      >
        更新
      </button>
    </div>
    <div
      class="flex flex-col overflow-hidden border-6 border-gray-300 h-full rounded-[2em]"
      style="aspect-ratio: 0.5"
    >
      <div class="w-full h-full p-4 text-xl bg-white">
        <component
          v-for="(node, index) in this.app.nodes"
          :key="index"
          :is="node.type"
          :index="index"
          :ref="node.itemType ? 'item' : null"
          :content="node.content"
          :class="{
            'hover:bg-blue-100': node.itemType !== null,
            'underline underline-offset-4':
              node.itemType !== null,
          }"
          class="size-fit"
        >
          {{ node.content }}
        </component>
      </div>
      <div class="flex p-2 gap-2 w-full h-18">
        <div
          ref="textInput"
          class="w-full h-full rounded-md border border-gray-400"
          :class="{
            'bg-gray-200': !inputActive,
            'bg-white': inputActive,
          }"
          :contenteditable="inputActive"
        ></div>
        <button
          ref="submitButton"
          class="w-20 h-full rounded-md text-black text-center border border-gray-400"
          :class="{
            'bg-gray-200': !inputActive,
            'bg-white': inputActive,
          }"
          :disabled="!inputActive"
        >
          提交
        </button>
      </div>
      <div class="w-full text-center text-sm text-gray-500">
        {{
          this.tapActive
            ? "在上方界面中选择元素"
            : this.inputActive
            ? "在上方输入框中输入文字并提交"
            : "在下方按钮中选择你要执行的操作"
        }}
      </div>
      <div
        class="flex flex-wrap items-center justify-center px-6 pb-6 pt-3 gap-4 w-full h-fit"
      >
        <div
          v-for="userAction in this.app.userActions"
          class="flex flex-col gap-2 items-center w-20"
        >
          <div
            class="flex bg-white size-14 rounded-xl hover:bg-blue-100"
            @click="actionHandler(userAction)"
          ></div>
          <span class="text-sm text-gray-600 text-center">{{
            userAction.name
          }}</span>
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
      tapActive: false,
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
        this.tapActive = true;
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
            this.tapActive = false;
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
