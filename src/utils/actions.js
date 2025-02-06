import { useContentStore } from "@/stores/contentStore";
import { useComponentsStatusStore } from "@/stores/componentsStatusStore";

// const content = useContentStore();
// const components = useComponentsStatusStore();

import LLM from "./llm";
import { htmlToMarkdown, markdownToHtml } from "./textConverter";

export class Actions {
  static deleteItem(target) {
    if (!(target instanceof HTMLElement)) {
      throw new Error("Target must be an HTML element");
    }
    target.remove();
  }

  static createItem(position, content) {}

  // static updateItem(target, content) {
  //   const content = useContentStore();

  // }


  static switchPage() {}

  static changeState() {}
  /**
   * @param {'buttonA' | 'buttonB' | 'textInput'} target
   * @param {'text' | 'status' | 'action'} attrs
   */
  static getComponentAttrs(target, attrs) {
    const components = useComponentsStatusStore();
    return components.get(target, attrs);
  }

  /**
   * @param {'buttonA' | 'buttonB' | 'textInput'} target
   * @param {'text' | 'status' | 'action'} attrs
   * @param {string | Function} value
   */
  static setComponentAttrs(target, attrs, value) {
    const components = useComponentsStatusStore();
    components.set(target, attrs, value);
  }

  static switchFocus(bool) {
    const content = useContentStore();
    content.focus = bool;
  }

  static updateContent(newContent) {
    const content = useContentStore();
    content.content = newContent;
  }

  static updateLog(newLog) {
    const content = useContentStore();
    content.log = newLog;
  }

  static refreshContent() {
    const content = useContentStore();
    const displayElement = document.getElementById("display");
    if (displayElement) {
      const htmlContent = displayElement.innerHTML;
      content.content = htmlContent;
    }
  }

  static getContent() {
    const content = useContentStore();
    return content.content;
  }
}

export class Todo {
  static sortTodoList() {
    const systemPrompt = `你是一个生成Markdown的大模型，请始终输出markdown的纯文本内容，忽略“\`\`\`markdown"之类的语言标记“。保持以agentui开头的链接一致。你不应该输出markdown以外的内容，并忽略回复消息的代码标记（对markdown的注释）。你应该将markdown部分和补充性的说明分开输出，空行并用 ///// 分割开来。`;

    const sortPrompt = `请根据以下Markdown内容，将列表中的事项重新排序，分为重要且紧急、重要但不紧急、不重要但紧急、不重要且不紧急四个象限。请确保每个事项都被正确分类，并在每个象限下列出。请确保不要丢失事项。示例格式如下：
  
  # TodoList
  ## 重要且紧急
  - [事项1](agentyui:entry)
  - [事项2](agentyui:entry)

  ## 重要但不紧急
  - [事项3](agentyui:entry)
  - [事项4](agentyui:entry)

  ## 不重要但紧急
  - [事项5](agentyui:entry)
  - [事项6](agentyui:entry)

  ## 不重要且不紧急
  - [事项7](agentyui:entry)
  - [事项8](agentyui:entry)

  /////

  （你排序的标准）

  示例结束，接下来是原始的markdown文件，请依据上述规则进行处理。忽略“\`\`\`markdown"之类的语言标记“，输出纯文本内容。
  `;

    LLM.executePrompt(systemPrompt, sortPrompt, htmlToMarkdown(Actions.getContent())).then(
      (response) => {
        const [content, log] = response.split("/////");
        const trimmedLog = log.trim();
        Actions.updateLog(trimmedLog);
        
        const html = markdownToHtml(content);
        Actions.updateContent(html);
        console.log("Receive response:", {
          msg: content
        });
      }
    );
  }

  static deleteTodoItem() {
    const focusedTodoItem = document.getElementById("focusedTarget");
    const parent = focusedTodoItem?.parentElement;
    if (parent && parent.tagName === "LI") {
      parent.remove();
    }
    Actions.refreshContent();
    Actions.switchFocus(false);
  }

  static editTodoItem() {
    Actions.switchFocus(true);
    Actions.setComponentAttrs("textInput", "status", "focused");
  }

  static addTodoItem() {
    const displayElement = document.getElementById("display");
    if (displayElement) {
      const ulElement = displayElement.querySelector("ul");
      if (ulElement) {
        const newItem = document.createElement("li");
        const newLink = document.createElement("a");
        newLink.href = "agentyui:entry";
        newLink.textContent = "新建事项";
        newLink.id = "focusedTarget";
        newItem.appendChild(newLink);
        ulElement.insertBefore(newItem, ulElement.firstChild);
      }
      Actions.switchFocus(true);
      Actions.setComponentAttrs("textInput", "status", "focused");
      Actions.refreshContent();
    }
  }
}
