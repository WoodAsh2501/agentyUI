// import { useContentStore } from "@/stores/contentStore";
// import { useComponentsStatusStore } from "@/stores/componentsStatusStore";

// // const content = useContentStore();
// // const components = useComponentsStatusStore();

import LLM from "./llm.js";
import * as R from "ramda";
// import { htmlToMarkdown, markdownToHtml } from "./textConverter";

// export class actions {
//   static deleteItem(target) {
//     if (!(target instanceof HTMLElement)) {
//       throw new Error("Target must be an HTML element");
//     }
//     target.remove();
//   }

//   static createItem(position, content) {}

//   // static updateItem(target, content) {
//   //   const content = useContentStore();

//   // }

//   static switchPage() {}

//   static changeState() {}
//   /**
//    * @param {'buttonA' | 'buttonB' | 'textInput'} target
//    * @param {'text' | 'status' | 'action'} attrs
//    */
//   static getComponentAttrs(target, attrs) {
//     const components = useComponentsStatusStore();
//     return components.get(target, attrs);
//   }

//   /**
//    * @param {'buttonA' | 'buttonB' | 'textInput'} target
//    * @param {'text' | 'status' | 'action'} attrs
//    * @param {string | Function} value
//    */
//   static setComponentAttrs(target, attrs, value) {
//     const components = useComponentsStatusStore();
//     components.set(target, attrs, value);
//   }

//   static switchFocus(bool) {
//     const content = useContentStore();
//     content.focus = bool;
//   }

//   static updateContent(newContent) {
//     const content = useContentStore();
//     content.content = newContent;
//   }

//   static updateLog(newLog) {
//     const content = useContentStore();
//     content.log = newLog;
//   }

//   static refreshContent() {
//     const content = useContentStore();
//     const displayElement = document.getElementById("display");
//     if (displayElement) {
//       const htmlContent = displayElement.innerHTML;
//       content.content = htmlContent;
//     }
//   }

//   static getContent() {
//     const content = useContentStore();
//     return content.content;
//   }
// }

// export class Todo {
//   static sortTodoList() {
//     const systemPrompt = `你是一个生成Markdown的大模型，请始终输出markdown的纯文本内容，忽略“\`\`\`markdown"之类的语言标记“。保持以agentui开头的链接一致。你不应该输出markdown以外的内容，并忽略回复消息的代码标记（对markdown的注释）。你应该将markdown部分和补充性的说明分开输出，空行并用 ///// 分割开来。`;

//     const sortPrompt = `请根据以下Markdown内容，将列表中的事项重新排序，分为重要且紧急、重要但不紧急、不重要但紧急、不重要且不紧急四个象限。请确保每个事项都被正确分类，并在每个象限下列出。请确保不要丢失事项。示例格式如下：

//   # TodoList
//   ## 重要且紧急
//   - [事项1](agentyui:entry)
//   - [事项2](agentyui:entry)

//   ## 重要但不紧急
//   - [事项3](agentyui:entry)
//   - [事项4](agentyui:entry)

//   ## 不重要但紧急
//   - [事项5](agentyui:entry)
//   - [事项6](agentyui:entry)

//   ## 不重要且不紧急
//   - [事项7](agentyui:entry)
//   - [事项8](agentyui:entry)

//   /////

//   （你排序的标准）

//   示例结束，接下来是原始的markdown文件，请依据上述规则进行处理。忽略“\`\`\`markdown"之类的语言标记“，输出纯文本内容。
//   `;

//     LLM.executePrompt(systemPrompt, sortPrompt, htmlToMarkdown(actions.getContent())).then(
//       (response) => {
//         const [content, log] = response.split("/////");
//         const trimmedLog = log.trim();
//         actions.updateLog(trimmedLog);

//         const html = markdownToHtml(content);
//         actions.updateContent(html);
//         console.log("Receive response:", {
//           msg: content
//         });
//       }
//     );
//   }

//   static deleteTodoItem() {
//     const focusedTodoItem = document.getElementById("focusedTarget");
//     const parent = focusedTodoItem?.parentElement;
//     if (parent && parent.tagName === "LI") {
//       parent.remove();
//     }
//     actions.refreshContent();
//     actions.switchFocus(false);
//   }

//   static editTodoItem() {
//     actions.switchFocus(true);
//     actions.setComponentAttrs("textInput", "status", "focused");
//   }

//   static addTodoItem() {
//     const displayElement = document.getElementById("display");
//     if (displayElement) {
//       const ulElement = displayElement.querySelector("ul");
//       if (ulElement) {
//         const newItem = document.createElement("li");
//         const newLink = document.createElement("a");
//         newLink.href = "agentyui:entry";
//         newLink.textContent = "新建事项";
//         newLink.id = "focusedTarget";
//         newItem.appendChild(newLink);
//         ulElement.insertBefore(newItem, ulElement.firstChild);
//       }
//       actions.switchFocus(true);
//       actions.setComponentAttrs("textInput", "status", "focused");
//       actions.refreshContent();
//     }
//   }
// }

const md = `# 111
222
333
## 444
555 {#158}
### 111
222
# 333
444
555 {#158}
## 111
222
### 333
444
555 {#158}`;

const regExp = {
  nodeId: /\{#(\w+)\}/,
  startingSelectedSign: /%%SELECTED%%/g,
  startingHashTag: /#+ /g,
  startingListMark: /- /g,
};

class Utils {
  // static debug = R.tap((value) => console.dir(value));
  static debug = R.tap((value) =>
    console.log(JSON.stringify(value, null, 2)),
  );

  static getResponse = R.pipe(JSON.parse, R.prop("response"));

  static makeTree = (lineArray) => {
    const node = { type };
  };

  static process = R.curry((mainFn, content) =>
    R.pipe(R.split("\n"), mainFn, R.join("\n"))(content),
  );

  static addSelectedSign = R.curry((conditionFn, line) =>
    R.when(
      R.both(
        conditionFn,
        (line) => !R.startsWith("%%SELECTED%%")(line),
      ),
      R.concat("%%SELECTED%%"),
    )(line),
  );

  static asyncPipe = (...fns) =>
    R.pipeWith(R.andThen, [
      // 保证所有输出都是promise
      (value) => Promise.resolve(value),
      ...fns,
    ]);
}

class MdAst {
  static nodeify = (_text) => ({
    type: R.pipe(
      R.replace(regExp.startingSelectedSign, ""),
      R.cond([
        [R.startsWith("#### "), R.always("h4")],
        [R.startsWith("### "), R.always("h3")],
        [R.startsWith("## "), R.always("h2")],
        [R.startsWith("# "), R.always("h1")],
        [R.startsWith("- "), R.always("listItem")],
        [R.T, R.always("paragraph")],
      ]),
    )(_text),
    content: R.pipe(
      R.replace(regExp.nodeId, ""),
      R.replace(regExp.startingSelectedSign, ""),
      R.replace(regExp.startingHashTag, ""),
      R.replace(regExp.startingListMark, ""),
      R.trim,
    )(_text),
    children: [],
    selected: R.startsWith("%%SELECTED%%")(_text),
    id: R.pipe(
      R.match(regExp.nodeId),
      R.nth(1),
      R.defaultTo("nullId"),
      Utils.debug,
    )(_text),
  });

  static generateIdForAllNodes = (_list) => {
    const makeIdUniqueChecker = () => {
      const usedId = [];
      return (id) => {
        const isIdUnique = R.not(R.includes(id, usedId));
        usedId.push(id);
        return isIdUnique;
      };
    };
    const isIdUnique = makeIdUniqueChecker();
    const randomId = () =>
      Math.random().toString(36).substring(2, 11);

    const generateId = (node) =>
      R.when(
        R.propEq('nullId', 'id'),
      R.pipe(
        randomId,
        R.concat("__"), //标识符
        R.until(isIdUnique, randomId),
        (id) => R.assoc("id", id, node),
        ),
      )(node);
    return R.map(generateId)(_list);
  };

  static moveToParentForAllNodes = (_list) => {
    const headingHierarchy = {
      root: 0,
      h1: 1,
      h2: 2,
      h3: 3,
      h4: 4,
      paragraph: 5,
    };
    
    const getParentNodeIndex = (node, index, list) => {
      const isHigherHeading = R.curry((thisNode, node) => {
        const getNodeHierarchy = (node) =>
          R.prop(R.prop("type", node))(headingHierarchy);

        return R.gt(
          getNodeHierarchy(thisNode),
          getNodeHierarchy(node),
        );
      });

      return R.defaultTo(
        0,
        R.findLastIndex(
          isHigherHeading(node),
          R.slice(0, index, list),
        ),
      );
    };

    const childrenLens = (node, index, list) =>
      R.lensPath([
        getParentNodeIndex(node, index, list),
        "children",
      ]);

    const moveToParent = (node, index, list) => {
      return R.pipe(
        R.over(
          childrenLens(node, index, list),
          R.prepend(node),
        ),
        R.identity,
        R.when(() => {
          return index > 0;
        }, R.reject(R.propEq(node.id, "id"))),
      )(list);
    };

    const modifyList = (index, list) => {
      const node = list[index];
      const modified = moveToParent(node, index, list);
      if (index === 0) return modified;
      return modifyList(index - 1, modified);
    };

    return modifyList(_list.length - 1, _list);
  };

  static buildTree = R.pipe(
    R.split("\n"),
    R.map(this.nodeify),
    R.prepend({
      type: "root",
      content: "",
      children: [],
      selected: false,
      id: null,
    }),
    this.generateIdForAllNodes,
    this.moveToParentForAllNodes,
    R.prop(0),
    Utils.debug,
  );
}

const tree = MdAst.buildTree(md);

class Actions {
  static selectByPrompt = R.curry(async (selectPrompt, md) => {
    const prompt = `
  你是一个Markdown处理助手，你的任务是根据给定的筛选条件处理Markdown文件。以下是必须严格遵守的规则：

  核心任务：

  逐行分析输入的Markdown内容。
  如果某一行满足筛选条件，则在该行前面加上字符串%%SELECTED%%。
  输出完整的Markdown内容，包括未选中的行，不得删除任何内容。
  输入格式：

  筛选条件：${selectPrompt}
  Markdown内容：${md}
  输出要求：

  只输出处理后的Markdown内容，以JSON格式呈现，格式为{"response": "markdown"}。
  禁止输出任何额外信息，包括但不限于以下内容：
  对筛选条件的解释或总结。
  对输出内容的说明或描述。
  任何形式的标题、注释或提示。
  禁止修改Markdown内容，除了添加%%SELECTED%%标记外，不得对原内容进行任何增删改操作。
  错误处理：

  如果输入的Markdown内容为空或不合法，直接输出原始内容，不做任何修改。
  如果筛选条件为空或不合法，直接输出原始Markdown内容，不做任何修改。
  严格约束：

  任何情况下都不得输出与处理后的Markdown无关的内容，即使筛选条件或Markdown内容有特殊情况（如未选中任何行）。
  示例：

  输入：

  筛选条件：包含"重要"  
  Markdown内容：  
  这是一个普通的段落。  
  这是一个重要的段落。  
  这是另一个普通的段落。
  输出：

  {"response": "这是一个普通的段落。\\n%%SELECTED%%这是一个重要的段落。\\n这是另一个普通的段落。"}
  `;
    return R.andThen(
      Utils.getResponse,
      LLM.executePrompt(prompt),
    );
  });

  static selectById = (id) =>
    Utils.process(
      R.map(Utils.addSelectedSign(R.endsWith(`{#${id}}`))),
    );

  static selectParent = (md) => {
    const tree = remark().parse(md);
    const deepMap = R.curry((fn, list) => {
      const children = R.prop("children")(list);
      return R.when(
        R.isNotEmpty(children),
        R.map(deepMap(fn)),
      )(list);
    });
    const addSelectedSignWhenChildren = (node) => {
      const chldren = R.prop("children")(node);
      const isSelected = R.propSatisfies(
        R.startsWith("%%SELECTED%%"),
        "value",
      );
      const hasSelectedChildren = R.find(isSelected);
      return R.when(hasSelectedChildren, R.assoc);
    };

    return deepMap(addSelectedSignWhenChildren, list);
  };

  // static selectAllChildren =

  static selectAll = Utils.process(
    R.map(R.concat("%%SELECTED%%")),
  );

  static selectHead = (count = 1) =>
    Utils.process(
      R.addIndex(R.map)((line, index) =>
        Utils.addSelectedSign(() => index < count)(line),
      ),
    );

  static selectTail = (count = 1) =>
    Utils.process((lines) =>
      R.addIndex(R.map)((line, index) =>
        Utils.addSelectedSign(
          () => index >= lines.length - count,
        )(line),
      )(lines),
    );

  static extendSelectedLine = (extendCount) =>
    Utils.process((md) => {
      const firstSelectedIndex = R.findIndex(
        R.startsWith("%%SELECTED%%"),
        md,
      );
      return R.addIndex(R.map)((line, index) =>
        Utils.addSelectedSign(
          () =>
            index >= firstSelectedIndex &&
            index <= firstSelectedIndex + extendCount,
        )(line),
      )(md);
    });

  static delete = Utils.process(
    R.reject(R.startsWith("%%SELECTED%%")),
  );

  static edit = (content) =>
    Utils.process(
      R.map(
        R.when(
          R.startsWith("%%SELECTED%%"),
          R.always("%%SELECTED%%" + content),
        ),
      ),
    );

  static clean = Utils.process(
    R.map(R.replace(regExp.startingSelectedSign, "")),
  );

  static sortByPrompt = R.curry(async (sortPrompt, md) => {
    const prompt = `
  你是一个Markdown处理助手，你的任务是根据给定的排序条件处理Markdown文件。以下是必须严格遵守的规则：

  核心任务：

  逐行分析输入的Markdown内容。
  根据排序条件对以%%SELECTED%%开头的内容进行排序。
  输出完整的Markdown内容，包括未排序的行，不得删除任何内容。
  输入格式：

  排序条件：${sortPrompt}
  Markdown内容：${md}
  输出要求：

  只输出处理后的Markdown内容，以普通字符串形式呈现，并以JSON格式输出，格式为{"response": "markdown"}。
  禁止输出任何额外信息，包括但不限于以下内容：
  对排序条件的解释或总结。
  对输出内容的说明或描述。
  任何形式的标题、注释或提示。
  禁止修改Markdown内容，除了排序外，不得对原内容进行任何增删改操作。
  错误处理：

  如果输入的Markdown内容为空或不合法，直接输出原始内容，不做任何修改。
  如果排序条件为空或不合法，直接输出原始Markdown内容，不做任何修改。
  严格约束：

  任何情况下都不得输出与处理后的Markdown无关的内容，即使排序条件或Markdown内容有特殊情况（如未排序任何行）。
  示例：

  输入：

  排序条件：按照从大到小的顺序排序  
  Markdown内容：  
  000
  %%SELECTED%%100 
  %%SELECTED%%124
  %%SELECTED%%167

  输出：

  {"response": "000\\n%%SELECTED%%167\\n%%SELECTED%%124\\n%%SELECTED%%100"}
`;

    return R.andThen(
      Utils.getResponse,
      LLM.executePrompt(prompt),
    );
  });
}

class Pipe {
  /**
   * 解析带有参数的函数字符串
   * @param {String} 函数字符串
   * @returns {Function} 函数对象
   */
  static parseParamsFunc = R.when(
    R.test(/(\w+)\(".*"\)/),
    R.pipe(
      R.match(/(\w+)\("([^"]*)"\)/),
      R.slice(1, Infinity),
      ([fnName, arg]) => Actions[fnName](arg),
    ),
  );

  /**
   * 解析工作流字符串，转换为函数数组
   * @param {String} 工作流字符串
   * @returns {Array<Function>} 函数数组
   */
  static parseFlow = R.pipe(
    R.split(","),
    R.map(
      R.pipe(
        R.trim,
        R.when(R.has(R.__, Actions), R.prop(R.__, Actions)),
        Pipe.parseParamsFunc,
      ),
    ),
  );

  /**
   * 将工作流应用到Markdown
   * @param {String} flowString 工作流字符串，例如 "selectEven, delete, sortByPrompt("从小到大排序"), clean"
   * @param {String} md Markdown数据
   * @returns {Promise<any>} 工作流处理结果
   */
  static pipeFunction = R.curry((flowString, md) => {
    const flow = this.parseFlow(flowString);
    return Utils.asyncPipe(...flow)(md);
  });
}

const flowString1 = `selectByPrompt("选择奇数项"), delete, sortByPrompt("从小到大排序"), selectEven`;
const flowString2 = `selectTail("1"), selectParent`;

// Pipe.pipeFunction(flowString2, md).then((res) =>
//   console.log(res),
// );

// Actions.selectParent(md);
