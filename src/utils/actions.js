import LLM from "./llm.js";
import * as R from "ramda";
import * as jsyaml from "js-yaml";
// import { useAppStore } from "@/stores/appStore.js";

const md = `
# TodoList
## 重要且紧急
- [事项1](agentyui:item)
- [事项2](agentyui:item)
## 重要但不紧急
- [事项3](agentyui:item)
- [事项4](agentyui:item)
## 不重要但紧急
- [事项5](agentyui:item)
- [事项6](agentyui:item)
## 不重要且不紧急
- [事项7](agentyui:item)
- [事项8](agentyui:item)
`;

const regExp = {
  nodeId: /\{#(\w+)\}/,
  startingSelectedSign: /%%SELECTED%%/g,
  startingHashTag: /#+ /g,
  startingListMark: /- /g,
  itemType: /\[(.*?)\]\(([^)]*)\)/,
};

export class Utils {
  static debug = (value) => {
    console.dir(value);
    console.dir("\n");
    return value;
  };

  static stepDebug = (_fnName) => (_value) => {
    console.dir({ [_fnName]: _value });
    return _value;
  };

  static getResponse = R.pipe(JSON.parse, R.prop("response"));

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

  static splitTemplate = R.pipe(
    R.split("---"),
    R.slice(1, Infinity),
    R.over(R.lensIndex(0), (_str) => jsyaml.load(_str)),
    R.over(R.lensIndex(1), R.trim),
  );

  static asyncPipe = (...fns) =>
    R.pipeWith(R.andThen, [
      // 保证所有输出都是promise
      (value) => Promise.resolve(value),
      ...fns,
    ]);

  static indexedMap = R.addIndex(R.map);
}

export class MdAst {
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
    itemType: R.pipe(
      R.match(regExp.itemType),
      R.prop(2),
      R.defaultTo(null),
    )(_text),
    content: R.pipe(
      R.replace(regExp.nodeId, ""),
      R.replace(regExp.startingSelectedSign, ""),
      R.replace(regExp.startingHashTag, ""),
      R.replace(regExp.startingListMark, ""),
      R.when(
        R.test(regExp.itemType),
        R.pipe(R.match(regExp.itemType), R.prop(1)),
      ),
      R.trim,
    )(_text),
    children: [],
    selected: R.startsWith("%%SELECTED%%")(_text),
    id: R.pipe(
      R.match(regExp.nodeId),
      R.nth(1),
      R.defaultTo("nullId"),
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
        R.propEq("nullId", "id"),
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
    R.trim,
    R.split("\n"),
    R.filter(R.isNotEmpty),
    R.map(this.nodeify),
    R.prepend({
      type: "root",
      content: "",
      children: [],
      selected: false,
      id: "__root",
    }),
    this.generateIdForAllNodes,
    this.moveToParentForAllNodes,
    R.prop(0),
  );

  static buildFlatNodesList = R.pipe(
    R.trim,
    R.split("\n"),
    // R.filter(R.isNotEmpty),
    R.map(this.nodeify),
    this.generateIdForAllNodes,
  );

  static findPath = (_predicate, _tree) => {
    const deepFind = (_currentNode, _index = 0) => {
      if (_predicate(_currentNode)) return [_index];

      if (R.isEmpty(R.prop("children", _currentNode)))
        return null;

      const satisfiedPathList = R.pipe(
        Utils.indexedMap(deepFind),
        R.filter(R.complement(R.isNil)),
      )(_currentNode.children);

      if (R.isEmpty(satisfiedPathList)) return null;

      return R.concat([_index], satisfiedPathList);
    };

    const flattenNestedPath = (_nestedPath) => {
      const concatPath = (_node, _pathList) => {
        const head = R.head(_node);
        const restList = R.slice(1, Infinity, _node);

        if (R.isEmpty(restList)) {
          return R.append(head, _pathList);
        }

        return R.map((node) =>
          concatPath(node, R.append(head, _pathList)),
        )(restList);
      };

      const flattenBitNestedPathList = (
        _nestedList,
        _pathList,
      ) => {
        const isPath = (_list) => {
          return (
            R.is(Array, _list) && R.all(R.is(Number), _list)
          );
        };

        if (isPath(_nestedList)) {
          return R.append(_nestedList, _pathList);
        }

        return R.reduce(
          (acc, _subList) =>
            flattenBitNestedPathList(_subList, acc),
          _pathList,
          _nestedList,
        );
      };

      const insertChildrenPath = R.map(
        R.chain((_index) => ["children", _index]),
      );

      return R.pipe(
        (_path) => concatPath(_path, []),
        (_path) => flattenBitNestedPathList(_path, []),
        R.map(R.slice(1, Infinity)),
        insertChildrenPath,
      )(_nestedPath);
    };

    return R.pipe(deepFind, flattenNestedPath)(_tree);
  };

  static convertToMd = (_tree) => {
    const getMd = (_accMd, _node) => {
      const typeDict = {
        h1: "# ",
        h2: "## ",
        h3: "### ",
        h4: "#### ",
        listItem: "- ",
      };
      const content = R.pipe(
        R.prop("content"),
        R.concat(
          R.defaultTo(
            "",
            R.prop(R.prop("type", _node), typeDict),
          ),
          R.__,
        ),
        R.when(
          () =>
            R.pipe(
              R.prop("id"),
              R.complement(R.startsWith("__")),
            )(_node),
          R.concat(R.__, ` {#${_node.id}}`),
        ),
        R.when(
          () => R.prop("selected", _node),
          R.concat("%%SELECTED%%", R.__),
        ),
      )(_node);

      const childrenList = R.prop("children", _node);
      if (R.isEmpty(childrenList))
        return R.append(content, _accMd);

      const childrenMd = R.reduce(getMd, [], childrenList);
      return R.concat(_accMd, [content, ...childrenMd]);
    };

    return R.pipe(getMd, R.join("\n"), R.trim)([], _tree);
  };
}

class Actions {
  static input = R.curry((_inputValue, _md) => [
    _inputValue,
    _md,
  ]);

  static selectByType = (_type) =>
    Utils.process(
      R.map(
        Utils.addSelectedSign(R.includes(`agentyui:${_type}`)),
      ),
    );

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

  static selectByIndex = (_selectedIndex) =>
    Utils.process(
      Utils.indexedMap((_line, _index) =>
        Utils.addSelectedSign(() => _index === _selectedIndex)(
          _line,
        ),
      ),
    );

  static selectById = (id) =>
    Utils.process(
      R.map(Utils.addSelectedSign(R.endsWith(`{#${id}}`))),
    );

  static selectParent = (md) => {
    const tree = MdAst.buildTree(md);
    const pathList = MdAst.findPath(
      R.propEq(true, "selected"),
      tree,
    );

    const parentLensPathList = R.map(
      R.pipe(R.slice(0, -2), (_path) => R.lensPath(_path)),
      pathList,
    );

    const selectNode = R.when(
      (_node) => !R.propEq("root", "type", _node),
      R.assoc("selected", true),
    );

    const selectMatchingNodes = (_tree, _lensPathList) =>
      R.reduce(
        (_accTree, _lensPath) =>
          R.over(_lensPath, selectNode, _accTree),
        _tree,
        _lensPathList,
      );

    return R.pipe(selectMatchingNodes, MdAst.convertToMd)(
      tree,
      parentLensPathList,
    );
  };

  static selectChildren = (md) => {
    const tree = MdAst.buildTree(md);
    const pathList = MdAst.findPath(
      R.propEq(true, "selected"),
      tree,
    );

    const childrenLensPathList = R.pipe(
      R.map((_parentPath) => {
        const children = R.prop(
          "children",
          R.view(R.lensPath(_parentPath), tree),
        );
        return R.pipe(
          R.map((_childrenIndex) =>
            R.concat(_parentPath, ["children", _childrenIndex]),
          ),
          R.map((_path) => R.lensPath(_path)),
        )(R.range(0, children.length));
      }),
      R.unnest,
    )(pathList);

    const selectNode = R.when(
      (_node) => !R.propEq("root", "type", _node),
      R.assoc("selected", true),
    );

    const selectMatchingNodes = (_tree, _lensPathList) =>
      R.reduce(
        (_accTree, _lensPath) =>
          R.over(_lensPath, selectNode, _accTree),
        _tree,
        _lensPathList,
      );

    return R.pipe(selectMatchingNodes, MdAst.convertToMd)(
      tree,
      childrenLensPathList,
    );
  };

  static selectAll = Utils.process(
    R.map(R.concat("%%SELECTED%%")),
  );

  static selectHead = (count = 1) =>
    Utils.process(
      Utils.indexedMap((line, index) =>
        Utils.addSelectedSign(() => index < count)(line),
      ),
    );

  static selectTail = (count = 1) =>
    Utils.process((lines) =>
      Utils.indexedMap((line, index) =>
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
      return Utils.indexedMap((line, index) =>
        Utils.addSelectedSign(
          () =>
            index >= firstSelectedIndex &&
            index <= firstSelectedIndex + extendCount,
        )(line),
      )(md);
    });

  static addLine = R.curry((_itemType, _content, _md) =>
    Utils.process(
      (_lines) =>
        R.insert(
          R.findIndex(R.startsWith("%%SELECTED%%"), _lines) + 1,
          _itemType !== "text"
            ? `[${_content}](agentyui:${_itemType})`
            : _content,
          _lines,
        ),
      _md,
    ),
  );

  static addLineAfterIndex = (_content, _lineIndex = -1) =>
    Utils.process(R.insert(_lineIndex, _content));

  static delete = Utils.process(
    R.reject(R.startsWith("%%SELECTED%%")),
  );

  static edit = R.curry((content, md) =>
    Utils.process(
      R.map(
        R.when(
          R.startsWith("%%SELECTED%%"),
          R.always("%%SELECTED%%" + content),
        ),
      ),
    )(md),
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

export class Pipe {
  static makeFuncStringParser = () => {
    let __previousFuncString = ""; //Impure

    return (_funcString) => {
      if (R.has(_funcString, Actions)) {
        if (R.startsWith("input", __previousFuncString)) {
          __previousFuncString = _funcString;
          return Utils.asyncPipe(
            R.apply(R.prop(_funcString, Actions)),
            Utils.stepDebug(_funcString),
          );
        }

        __previousFuncString = _funcString;
        return Utils.asyncPipe(
          R.prop(_funcString, Actions),
          Utils.stepDebug(_funcString),
        );
      }

      if (R.test(/(\w+)\(.*\)/, _funcString)) {
        const [fnName, argString] = R.pipe(
          R.match(/(\w+)\(([^)]*)\)/),
          R.slice(1, Infinity),
        )(_funcString);

        const args = R.pipe(
          R.split(","),
          R.map(
            R.ifElse(
              // 检测是否为字符串
              R.test(/['"]/),
              R.replace(/['"]/g, ""),
              (_arg) => +_arg,
            ),
          ),
        )(argString);

        if (R.startsWith("input", __previousFuncString)) {
          __previousFuncString = _funcString;
          return Utils.asyncPipe(
            R.apply(R.apply(Actions[fnName], args)),
            Utils.stepDebug(_funcString),
          );
        }

        __previousFuncString = _funcString;
        return Utils.asyncPipe(
          R.apply(Actions[fnName], args),
          Utils.stepDebug(_funcString),
        );
      }

      console.error("Function not exist:", _funcString);
      __previousFuncString = _funcString;
      return _funcString;
    };
  };

  /**
   * 解析函数字符串
   * @param {String} 函数字符串
   * @returns {[Function, Function]} 目标函数与debug函数组成的数组
   */
  static parseFuncString = Pipe.makeFuncStringParser();

  /**
   * 解析工作流字符串，转换为函数数组
   * @param {String} 工作流字符串
   * @returns {Array<Function>} 函数数组
   */
  static parseFlow = R.ifElse(
    R.isNil,
    R.always(null),
    R.pipe(
      R.split(/,(?![^(]*\))/),
      R.map(R.pipe(R.trim, Pipe.parseFuncString)),
    ),
  );

  /**
   * 解析工作流字符串，转换为单一函数
   * @param {String} flowString 工作流字符串，例如 "selectEven, delete, sortByPrompt("从小到大排序"), clean"
   * @param {String} md Markdown数据
   * @returns {Promise<any>} 工作流处理结果
   */
  static pipeFunction = R.curry((flowString, md) => {
    const flow = this.parseFlow(flowString);
    return Utils.asyncPipe(
      R.trim,
      Utils.stepDebug("source"),
      ...flow,
      Actions.clean,
      Utils.debug("Action complete."),
    )(md);
  });
}

const flowString1 = `selectByPrompt("选择奇数项"), delete, sortByPrompt("从小到大排序"), selectEven`;
const flowString2 = `selectTail("1"), selectParent`;

Pipe.pipeFunction(flowString2, md).then((result) =>
  console.log(result),
);

// console.log(Actions.selectParent(md));
