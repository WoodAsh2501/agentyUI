import { htmlToMarkdown } from "@/utils/textConverter";
import { defineStore } from "pinia";

export const useContentStore = defineStore("content", {
  state: () => ({
    content: `<h1>TodoList</h1>
    <ul>
        <li><a href="agentyui:entry">早晨跑步</a></li>
        <li><a href="agentyui:entry">阅读书籍</a></li>
        <li><a href="agentyui:entry">学习编程</a></li>
        <li><a href="agentyui:entry">参加社团活动</a></li>
        <li><a href="agentyui:entry">写博客</a></li>
        <li><a href="agentyui:entry">听音乐</a></li>
        <li><a href="agentyui:entry">做家务</a></li>
        <li><a href="agentyui:entry">与朋友聚会</a></li>
        <li><a href="agentyui:entry">看电影</a></li>
        <li><a href="agentyui:entry">练习绘画</a></li>
    </ul>`,
    log: `(●'◡'●)\n欢迎使用Agenty UI！`,
    focusedText: "",
    focus: false,
  }),
  getters: {
    markdown: (state) => htmlToMarkdown(state.content),
  },
  actions: {
    updateContent(newContent) {
      this.content = newContent;
    },
    clearContent() {
      this.content = "";
    },
    updateFocusedText(newText) {
      this.focusedText = newText;
    },
    clearFocusedText() {
      this.focusedText = "";
    },
    setContent(newContent) {
      this.content = newContent;
    },
  },
});
