---
title: Vue3.0 源码之 Compiler-core【DOING】
slug: vue-compiler-core
date: 2020-06-18
cover: ./cover.jpg
generate-card: true
description: vue3.0 source code of compiler-core module.
language: en
tags: 
    - programming
    - javascript
    - vue3.0
---



# 阶段代码记录

1. <span id="link-01"></span>[test01: some text 的代码备份](https://github.com/gcclll/vue-next-code-read/tree/master/bakups/compiler-core/test-01-some-text)

2. <span id="link-02"></span>[test02: some text \<div> 01 代码备份](https://github.com/gcclll/vue-next-code-read/tree/master/bakups/compiler-core/test-02-some-text-div-01)

3. <span id="link-03"></span>[test02: some text \<div> 02 代码备份](https://github.com/gcclll/vue-next-code-read/tree/master/bakups/compiler-core/test-02-some-text-div-02)

4. <span id="link-04"></span>[test03: some {{ foo + bar }} text 代码备份](https://github.com/gcclll/vue-next-code-read/tree/master/bakups/compiler-core/test-03-interpolation)

   

# 测试用例分析

原本是想直接根据源码去了解这部分的实现原理的，但是发现纯粹的代码分析有点困难，这部分不像 reactivity 模块那么直观，并且感觉这块比 reactivity 复杂的多，因此先探究如何使用，从如何使用到怎么实现去逐步实现，分析源代码。



compiler-core 模块的测试用例包含以下部分，将依次进行分析：

1. parse.spec.ts
2. compile.spec.ts
3. codegen.spec.ts
4. scopeId.spec.ts
5. transform.spec.ts
6. transforms/
   1. hoistStatic.spec.ts
   2. noopDirectiveTransform.spec.ts
   3. transformElement.spec.ts
   4. transformExpressions.spec.ts
   5. transformSlotOutlet.spec.ts
   6. transformText.spec.ts
   7. vBind.spec.ts
   8. vFor.spec.ts
   9. vIf.spec.ts
   10. vModel.spec.ts
   11. vOn.spec.ts
   12. vOnce.spec.ts
   13. vSlot.spec.ts
7. utils.spec.ts
8. testUtils.ts

## parse.spec.ts

测试用例结构：compiler: parse

### Text 文本解析

#### <span id="test-text-03"></span>03-text with interpolation

[该用例代码链接 ->](#link-04)

该用例检验的差值的处理。

```ts
test("text with interpolation", () => {
  const ast = baseParse("some {{ foo + bar }} text");
  const text1 = ast.children[0],
        text2 = ast.children[2];

  expect(text1).toStrictEqual({
    type: NodeTypes.TEXT,
    content: "some ",
    loc: {
      start: { offset: 0, line: 1, column: 1 },
      source: "some ",
      end: { offset: 5, line: 1, column: 6 },
    },
  });

  expect(text2).toStrictEqual({
    type: NodeTypes.TEXT,
    content: " text",
    loc: {
      start: { offset: 20, line: 1, column: 21 },
      source: " text",
      end: { offset: 25, line: 1, column: 26 },
    },
  });
}
```

差值的处理分支在 parseChildren 的 

```ts
if (!context.inVPre && startsWith(s, context.options.delimiters[0])) {
  // '{{'
  node = parseInterpolation(context, mode)
}
```

完成，因为需要 [parseInterpolation()](#parse-parseInterpolation) 的支持。

用例结果(<font color="green">OK</font>)：

```
➜  vue-next-code-read git:(master) ✗ jest parse.spec
 PASS  packages/compiler-core/__tests__/parse.spec.js
  compiler: parse
    Text
      ✓ simple text (4 ms)
      ✓ simple text with invalid end tag (2 ms)
      ✓ text with interpolation (47 ms)

  console.log
    { column: 18, line: 1, offset: 17 } { column: 9, line: 1, offset: 8 } 1

      at parseInterpolation (packages/compiler-core/parse.js:262:11)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        8.776 s
Ran all test suites matching /parse.spec/i.
➜  vue-next-code-read git:(master) ✗
```



#### <span id="test-text-02"></span>02-simple text\<div>

[该用例代码链接->](#link-03)

在跑这个用例的时候出现内存溢出了，查了下原因是因为只是[增加了 while 里面的各种 if 分支](#link-02)，但是实际并没有实现，这个用例会走到 

```js
else if (mode === TextModes.DATA && s[0] === "<") {
  // ... 标签开头 <...
  if (s.length === 1) {
    emitError(context, ErrorCodes.EOF_BEFORE_TAG_NAME, 1);
  } else if (s[1] === "!") {
    // TODO 注释处理，<!-- ...
  } else if (s[1] === "/") {
    // </...
    if (s.length === 2) {
      emitError(context, ErrorCodes.EOF_BEFORE_TAG_NAME, 2);
    } else if (s[2] === ">") {
      // ...
    } else if (/[a-z]/i.test(s[2])) {
      // 会走到这个分支里面，但是由于下面的 parseTag 未实现，因此一直在这个分支里面循环
      // 加上用例里面重写了 onError 不会 throw err 终止，因此会出现死循环
      emitError(context, ErrorCodes.X_INVALID_END_TAG);
      // 但是上面都报错了，为什么这里还要加个 parseTag??? 正常理解应该是走不到这里啊
      // 除非有重写 onError 报错机制???
      // parseTag(context, TagType.End, parent);
      continue;
    } else {
      // ...
    }
```

因此要通过这个用例，就必须得实现 `parseTag(context, TagType.End, parent)` 函数解析标签。

```js

test("simple text with invalid end tag", () => {
  const onError = jest.fn();
  const ast = baseParse("some text</div>", {
    onError,
  });
  const text = ast.children[0];

  expect(onError).toBeCalled();
  expect(text).toStrictEqual({
    type: NodeTypes.TEXT,
    content: "some text",
    loc: {
      start: { offset: 0, line: 1, column: 1 },
      end: { offset: 9, line: 1, column: 10 },
      source: "some text",
    },
  });
}
```

因为 baseparse 调用的时候有传递 onError 覆盖报错代码，会进入到 parseTag 进行解析标签，如果不实现会导致死循环。因此这里要通过这个用例就必须实现 [parseTag()](#parse-parsetag):

```js

function parseTag(context, type, parent) {
  // 获取当前解析的起始位置，此时值应该是 some text 的长度
  const start = getCursor(context);
  // 匹配 </div 过滤掉空格字符，但是为什么要把 > 给忽略掉???
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source);
  const tag = match[1];
  const ns = context.options.getNamespace(tag, parent);
  // log1: 改变位移，将 offset 定位到 </div> 的最有一个 > 上
  // 在这里 context.offset = 10, context.line = 1
  advanceBy(context, match[0].length);
  // 过滤掉空格
  advanceSpaces(context);
	// log2: 经过 advance之后 context.offset = 15, context.line = 1
  // 正好过滤 </div 5个字符
  const cursor = getCursor(context);
  const currSource = context.source;
}
```

parseTag 实现到这里就可以满足通过测试用例的条件了，这里面会去匹配 `</div` 然后将其过滤掉(通过advanceBy和 advanceSpaces 来改变 context 里面的 offset 和 line 值)，输出结果(log1 和 log2 位置 context 的输出)：

![](http://qiniu.ii6g.com/1595444610.png?imageMogr2/thumbnail/!100p)

#### <span id="test-text-01">01-simple text

这里用到的就一个 baseParse 函数，需要我们来实现其基本的功能以通过该用例。

用例源码：

```ts
test('simple text', () => {
  const ast = baseParse('some text')
  const text = ast.children[0] as TextNode

  expect(text).toStrictEqual({
    type: NodeTypes.TEXT,
    content: 'some text',
    loc: {
      start: { offset: 0, line: 1, column: 1 },
      end: { offset: 9, line: 1, column: 10 },
      source: 'some text'
    }
  })
})
```

[用例的基本功能，验证 baseParse 解析出来的文本节点对象是否满足基本要求](https://github.com/gcclll/vue-next-code-read/tree/master/bakups/compiler-core/test-01-some-text)。	

支持该用例的重要部分代码：

1. createParseContext 构建被解析的内容的对象结构

   ```js
   
   function createParserContext(context, options) /*ParserContext*/ {
     return {
       options: {
         ...defaultParserOptions,
         ...options,
       },
       // 初始化以下内容
       column: 1,
       line: 1,
       offset: 0,
       originalSource: context,
       source: context,
       inPref: false,
       inVPref: false,
     };
   }
   ```

   

2. parseChildren

   ```js
   function parseChildren(
     context /* ParserContext*/,
     mode /*TextModes*/,
     ancesotrs /*ElementNode[]*/
   ) {
     // ...
     const nodes /*TemplateChildNode[]*/ = [];
   
     while (!isEnd(context, mode, ancesotrs)) {
       // do sth
   
       const s = context.source;
       let node = undefined;
   
       // 由于 baseparse里面传过来的是个 DATA 类型，因此会走到这个 if 里
       // 面去解析
       if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
         // 过略掉非文本的
         if (!context.inVPre && s.startsWith(context.options.delimiters[0])) {
           // ... 插值处理{{}}
         } else if (mode === TextModes.DATA && s[0] === "<") {
           // ... 标签开头 <...
         }
   
         // ... 到这里也就是说文本节点不会被这个 if 处理，而是直接到
         // !node 给 parseText 解析
       }
   
       if (!node) {
         // 纯文本重点在这里面处理，截取字符直到遇到 <, {{, ]]> 标志结束
         // 然后传入到 parseTextData() 判断是否是数据绑定的变量，在 
         // context.options.decodeEntities() 中处理
         node = parseText(context, mode);
       }
   
       if (Array.isArray(node)) {
         for (let i = 0; i < node.length; i++) {
           pushNode(nodes, node[i]);
         }
       } else {
         pushNode(nodes, node);
       }
     }
   
     let removedWhitespace = false;
   
     return removedWhitespace ? nodes.filter(Boolean) : nodes;
   }
   ```

3. parseText

   ```js
   function parseText(context, mode) {
     // 字符串解析直到遇到 <, {{, ]]> 为止
     const endTokens = ["<", context.options.delimiters[0]];
     if (mode === TextModes.CDATA) {
       endTokens.push("]]>");
     }
   
     let endIndex = context.source.length;
     for (let i = 0; i < endTokens.length; i++) {
       const index = context.source.indexOf(endTokens[i], 1);
       if (index !== -1 && endIndex > index) {
         endIndex = index;
       }
     }
   
     const start = getCursor(context);
     // 解析 & 开头的html语义的符号(>,<,&,',")
     const content = parseTextData(context, endIndex, mode);
     return {
       type: NodeTypes.TEXT,
       content,
       // loc:{ start, end, source}
       // start,end: { line, column, offset }
       loc: getSelection(context, start),
     };
   }
   ```

4. parseTextData

   ```js
   // 解析文本数据，纯文本内容
   function parseTextData(context, length, mode) {
     const rawText = context.source.slice(0, length);
     // 解析换行，更新 line, column, offset，返回换行之后的的 source
     advanceBy(context, length);
     if (
       mode === TextModes.RAWTEXT ||
       mode === TextModes.CDATA ||
       rawText.indexOf("&") === -1
     ) {
       return rawText;
     }
   
     return context.options.decodeEntities(
       rawText,
       mode === TextModes.ATTRIBUTE_VALUE
     );
   }
   ```

5. advancedBy 解析多个字符之后更新start,end(line,column,offset)，尤其是换行符的特殊处理。

   ```js
   function advanceBy(context, numberOfCharacters) {
     const { source } = context;
     advancePositionWithMutation(context, source, numberOfCharacters);
     context.source = source.slice(numberOfCharacters);
   }
   ```

6. advancePositionWithMutation

   ```js
   export function advancePositionWithMutation(
     pos,
     source,
     numberOfCharacters = source.length
   ) {
     let linesCount = 0;
     let lastNewLinePos = -1;
     for (let i = 0; i < numberOfCharacters; i++) {
       if (source.charCodeAt(i) === 10 /* newline char code */) {
         linesCount++;
         lastNewLinePos = i;
       }
     }
   
     pos.offset += numberOfCharacters;
     pos.line += linesCount;
     pos.column =
       lastNewLinePos === -1
         ? pos.column + numberOfCharacters
         : numberOfCharacters - lastNewLinePos;
   
     return pos;
   }
   
   ```

   



# <span id="file-parse"></span>parse.ts

## baseParse(context, options)

```js
function baseParse(content, options /* ParserOptions */) /*RootNode*/ {
  const context = createParserContext(content, options);
  const start = getCursor(context);
  return createRoot(
    parseChildren(context, TextModes.DATA, []),
    getSelection(context, start)
  );
}
```

baseParse 内部实现基本就是调用其他方法，所以接下来我们得针对它使用的几个方法去逐一实现：

1. createParserContext，创建节点解析对象，包含解析过程中需要或需要保存的数据
2. getCursor，获取 context 中的 offset, line, column, start, end 等信息
3. [createRoot](#file-ast-createroot)，创建根节点
4. [parseChildren](#parse-parsechildren)，解析子节点
5. [getSelection](#parse-getselection)，获取选中的未解析的内容

<span id="pic-baseparse"></span>baseParse 函数大体结构和代码调用图示：

![](http://qiniu.ii6g.com/parse-ts-baseparse-0.png?imageMogr2/thumbnail/!100p)

## createParseContext(context, options)，

函数作用：**创建解析器上下文对象(包含解析过程中的一些记录信息)**

函数声明：

`function createParserContext(context, options) /*ParserContext*/ {}`

参数没什么好讲的了，从 baseParse 继承而来，返回的是一个 [ParserContext](#td-parser-context) 类型。具体实现其实就是返回一个 ParserContext 类型的对象，里面包含了源码字符串被解析是的一些信息存储，比如：解析时指针的位置 offset，当前行列(line, column)，及其他信息。

```ts
function createParserContext(
  content: string,
  options: ParserOptions
): ParserContext {
  return {
    options: {
      // 解析器的默认选项给了些默认值，比如：isVoidTag: No, isPreTag: NO， 等等
      ...defaultParserOptions, 
      ...options
    },
    column: 1,
    line: 1,
    offset: 0,
    originalSource: content,
    source: content,
    inPre: false,
    inVPre: false
  }
}
```

## 

## <span id="parse-parsechildren"></span>parseChildren(context, mode, ancestors)

```js
function parseChildren(
  context /* ParserContext*/,
  mode /*TextModes*/,
  ancesotrs /*ElementNode[]*/
) /* TemplateChildNode[] */{}
```

参数列表：

1. context，待解析的模板对象([ParserContext](#td-parser-context))
2. mode，文本模式([TextModes](#td-vars-textmodes))
3. ancestors，祖先元素([ElementNode[]](#td-ast-elementnode))

返回结果： [TemplateChildNode[]](#td-ast-tcn)

### 阶段一([test01 some text](test-01-sometext))

实现 [parseText()](#parse-parsetext) 之后的 [parseChildren()](#parse-parsechildren)代码：

```js
function parseChildren(
  context /* ParserContext*/,
  mode /*TextModes*/,
  ancesotrs /*ElementNode[]*/
) {
  // ...
  const nodes /*TemplateChildNode[]*/ = [];

  while (!isEnd(context, mode, ancesotrs)) {
    // do sth

    const s = context.source;
    let node = undefined;

    // 由于 baseparse里面传过来的是个 DATA 类型，因此会走到这个 if 里
    // 面去解析
    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      // 过略掉非文本的
      if (!context.inVPre && s.startsWith(context.options.delimiters[0])) {
        // ... 插值处理{{}}
      } else if (mode === TextModes.DATA && s[0] === "<") {
        // ... 标签开头 <...
      }

      // ... 到这里也就是说文本节点不会被这个 if 处理，而是直接到
      // !node 给 parseText 解析
    }

    if (!node) {
      node = parseText(context, mode);
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        pushNode(nodes, node[i]);
      }
    } else {
      pushNode(nodes, node);
    }
    console.log(context, "parse children");
  }

  let removedWhitespace = false;

  return removedWhitespace ? nodes.filter(Boolean) : nodes;
}
```

最后处理完之后文本节点对象内容如下：

```js
{
  options: {
    delimiters: [ '{{', '}}' ],
    getNamespace: [Function: getNamespace],
    getTextMode: [Function: getTextMode],
    isVoidTag: false,
    isPreTag: false,
    isCustomElement: false,
    decodeEntities: [Function: decodeEntities],
    onError: null
  },
  // 这里发生了变换
  // column: 定位到了字符串最后即 'simple text' 的长度 + 1，即结束位置
  // line: 因为只有一行，所以 line 并未发生改变，如果发生了改变会在 advancedBy 里面进行处理更新
  // offset: 类似文件处理时的指针偏移量，即字符串长度
  column: 12,
  line: 1,
  offset: 11,
  // 会发现处理完成之后，originalSource 维持原样
  originalSource: 'simple text',
  // source 变成了空字符串，因为处理完了
  source: '',
  inPref: false,
  inVPref: false
} // parse children
```

baseParse 之后的 ast 结构：

```js
// 这个结构的形成是经过 createRoot 处理之后的结果
// 经过 parseChildren 之后的结果会被存放到 root 的children 中，如下
{
  type: 0,
  children: [
    {
      type: 2,
      content: '\nsimple text 1\n simple text 2\n',
      loc: [Object]
    }
  ],
  loc: {
    start: { column: 1, line: 1, offset: 0 },
    end: { column: 1, line: 4, offset: 30 },
    source: '\nsimple text 1\n simple text 2\n'
  },
  helpers: [],
  components: [],
  directives: [],
  hoists: [],
  imports: [],
  cached: 0,
  temps: 0,
  codegenNode: undefined
} //// ast

// 第一个 children 结构：
{
  type: 2,
  content: '\nsimple text 1\n simple text 2\n',
  loc: {
    start: { column: 1, line: 1, offset: 0 },
    end: { column: 1, line: 4, offset: 30 },
    source: '\nsimple text 1\n simple text 2\n'
  }
} //// ast
```

阶段代码：[test-01-some-text 测试用例通过](#link-01)

图示：文本解析

![parseChildren-支持纯文本解析](http://qiniu.ii6g.com/parse-ts-parsechildren-text-part.png?imageMogr2/thumbnail/!100p)

## <span id="parse-parseInterpolation"></span>parseInterpolation(context, mode)

函数声明：

```ts
function parseInterpolation(
  context: ParserContext,
  mode: TextModes
): InterpolationNode | undefined {}
```

**context**: 将被解析的上下文，此时这里的 source 应该是以差值 (`{{`)开始的字符串。

**mode**: 文本模式。

```js

function parseInterpolation(context, mode) {
  // 找出插值模板的开始和结束符号，默认是 {{ 和 }}
  const [open, close] = context.options.delimiters;
  const closeIndex = context.source.indexOf(close, open.length);
  if (closeIndex === -1) {
    emitError(context, ErrorCodes.X_MISSING_INTERPOLATION_END);
    return undefined;
  }

  const start = getCursor(context);
  advanceBy(context, open.length);

  // 下面是从 {{ 之后的字符串开始解析
  const innerStart = getCursor(context),
    innerEnd = getCursor(context),
    // 插值里面的字符串长度
    rawContentLength = closeIndex - open.length,
    // 插值里面的字符串内容
    rawContent = context.source.slice(0, rawContentLength),
    preTrimContent = parseTextData(context, rawContentLength, mode),
    content = preTrimContent.trim(),
    startOffset = preTrimContent.indexOf(content);
  if (startOffset > 0) {
    advancePositionWithMutation(innerStart, rawContent, startOffset);
  }

  // {{ foo + bar }} ->
  // res = (' foo + bar '.length - 'foo + bar'.length - ' '.length)
  // 插值里面字符串的长度 - 去掉空格后的长度 - 起始空格的长度，得到的
  // 就是结束位置的 offset
  const endOffset =
    rawContentLength - (preTrimContent.length - content.length - startOffset);
  advancePositionWithMutation(innerEnd, rawContent, endOffset);
  // 定位到 }} 位置
  advanceBy(context, close.length);

  console.log(innerEnd, innerStart, "1");
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      isConstant: false,
      content,
      loc: getSelection(context, innerStart, innerEnd),
    },
    loc: getSelection(context, start),
  };
}
```

![](http://qiniu.ii6g.com/1595570127.png?imageMogr2/thumbnail/!100p)

图中我们看到在经过解析之后 innerStart 和 innerEnd 都数据都正确定位到了相应位置，innerStart 是解析后插值字符串的开始位置(第一个 `{` offset = 8(<font color="purple">'some {{ '的长度</font>))，innerEnd是解析后插值字符串的结束位置(最后一个 `}` offset = 17(<font color="purple">'some {{ foo + bar '的长度))</font>。

解析之后得到的 `ast.children` 将会有三个节点：

```json
(3) [{…}, {…}, {…}]
0: {type: 2, content: "some ", loc: {…}} // 左侧文本
1: {type: 5, content: {…}, loc: {…}} // 插值部分
2: {type: 2, content: " text", loc: {…}} // 右侧文本
length: 3
__proto__: Array(0)
```

解析回顾(分别解析出了三个节点对象)：

1. `0: {type: 2, content: "some ", loc: {…}}`
   详细结构<span id="x-1"></span>：

   ```json
   0:
     content: "some " // 解析出的文本内容
     loc: // 位置信息
     	end: {column: 6, line: 1, offset: 5} // 该节点在模板中的位置信息
     	source: "some " // 文本源内容
     	start: {column: 1, line: 1, offset: 0} // 该节点在模板中的结束信息
     __proto__: Object
   	type: 2 // 节点类型
   	__proto__: Object
   ```

   那么是如何得到上面的结果的呢？？？那得从 [parseChildren](#parse-parsechildren) 说起了，模板：

   --->> "some {{ foo + bar }} text"

   `(!context.inVPre && s.startsWith(context.options.delimiters[0]))` <font color="red">检测失败</font>

   `mode === TextModes.DATA && s[0] === "<"` <font color="red">检测失败</font>

   即一开始并不会进入插值和标签解析代码，而是直接进入 [parseText(context, mode)](#parse-parsetext) 中解析文本，解析时候直到遇到 `{{` 之前都一直会当做文本解析，而之前的文本中又不包含 `decodeMap` 中的字符，因此知道遇到 `{` 之前会一直执行 while 里面的：

   ```js
   if (!node) {
     node = parseText(context, mode);
   }
   
   if (Array.isArray(node)) {
     for (let i = 0; i < node.length; i++) {
       pushNode(nodes, node[i]);
     }
   } else {
     pushNode(nodes, node);
   }
   ```

   这段代码，而由于 "some " 都是普通字符，每个字符串会对应一个 node ，然后又都是普通文本节点，会经过 [pushNode(nodes, node[i])](#parse-pushnode) 处理掉，进行合并最后成为上面的一个完整的 "some " 对应[文本节点结构](#x-1)。

2. `1: {type: 5, content: {…}, loc: {…}}`

   节点结构<span id="x-2"></span>：

   ```json
   1:
     content: // 这里的数据是经过插值解析之后的模板对象
       content: "foo + bar" // trim 之后的插值字符串，没有 }} ???
       isConstant: false // 非常量类型
       isStatic: false // 非静态节点
       loc:  // 解析之后的该节点在整个模板中的位置信息
   			// 17 -> r 所在的位置
         end: {column: 18, line: 1, offset: 17}
         source: "foo + bar"
   			// 8 -> f 所在的位置，即 start -> end => 'f <-> r'
         start: {column: 9, line: 1, offset: 8}
       __proto__: Object
       type: 4 // 插值表达式类型
       __proto__: Object
   	loc: // 这里是没经过去尾部空格的位置信息
   		// 20 -> 'some {{ foo + bar ' 最后一个空格位置
       end: {column: 21, line: 1, offset: 20} 
       source: "{{ foo + bar }}"
   		// 5 -> 'some ' 第一个 { 位置
       start: {column: 6, line: 1, offset: 5} 
       __proto__: Object
     type: 5 // 插值类型
     __proto__: Object
   ```

   ​	如上所注释的，第一级的 loc 是通过解析 "{{ foo + bar}}" 在整个模板中的位置信息，content 里面包含的是插值内部的信息，即真正的表达式结构信息。

3. `{type: 2, content: " text", loc: {…}}`
   和第一步中一样，只会经过 parseText(context, mode) 解析出纯文本内容：" text"，最后的结构：

   ```json
   {
     type: 2,
     content: " text",
     loc: {
       // 从 text 前面的空格开始记录，"some {{ foo + bar }}" 长度为 20
       start: { column: 21, line: 1, offset: 20 },
       source: " text",
       end: { column: 26, line: 1, offset: 25}
     }
   }
   ```

三步分析完之后，到现在我们应该具备脱离代码就可以直接根据模板得到解析后对应的 children 结构。分析的重点是要得到一个 `{ type, content, loc: { start, source, end }}` 结构的对象。

```json
// start/end: 
{ 
  column/*该节点起始结束的列，从1开始计数的值*/, 
  line/*该节点模板所在的行，从1开始计数的值*/, 
  offset/*该节点起始结束的索引，从0开始计数的值*/ 
}
```



<font color="blue">PS: 对于 foo 和 bar 变量数据解析执行结果这块暂时不讨论，也不知道如何做到的，现阶段只关心模板的解析。</font>

## <span id="parse-parsetag"></span>parseTag(context, type, parent)

### 问题

1. 为什么只匹配 `</div` 而忽略掉最后一个 `>`???

参数: 

```ts
function parseTag(
  context: ParserContext, // 要继续解析的模板对象 simple text</div> 里面的 </div> 
  type: TagType, // Start(<div>), End(</div>)开始结束标签
  parent: ElementNode | undefined // 该标签的父级
): ElementNode
```

具体实现：

```js

function parseTag(context, type, parent) {
  // 获取当前解析的起始位置，此时值应该是 simple text 的长度
  const start = getCursor(context);
  // 匹配 </div 过滤掉空格字符，但是为什么要把 > 给忽略掉???
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source);
  const tag = match[1];
  const ns = context.options.getNamespace(tag, parent);
  // 改变位移，将 offset 定位到 </div> 的最有一个 > 上
  advanceBy(context, match[0].length);
  // 过滤掉空格
  advanceSpaces(context);

  const cursor = getCursor(context);
  const currSource = context.source;
}
```



## <span id="parse-parsetext"></span>parseText(context, mode)

解析文本节点，直到遇到结束标记(`<`,`{{`,`]]>`)。

```ts

function parseText(context: ParserContext, mode: TextModes): TextNode {
  __TEST__ && assert(context.source.length > 0)

  const endTokens = ['<', context.options.delimiters[0]]
  if (mode === TextModes.CDATA) {
    endTokens.push(']]>')
  }

  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  __TEST__ && assert(endIndex > 0)

  const start = getCursor(context)
  // 文本内容可能包含 &gt; &lt; &amp; &apos; &quot; 等html符号，需要
  // 将他们替换成对应 >    <    &     '      "
  const content = parseTextData(context, endIndex, mode)

  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start)
  }
}
```

导图：

![parse-text-导图](http://qiniu.ii6g.com/parse-ts-parsetext.png?imageMogr2/thumbnail/!100p)

## parseTextData(context, length, mode)

文本节点可能包含数据，通过 *context.options.decodeEntities(???)* 来解析。

一些字符的html书写格式，有 `/&(gt|lt|amp|apos|quot);/`，最终会被对应的字符替换掉。

`decodeEntities: (rawText: string): string => rawText.replace(decodeRE, (_, p1) => decodeMap[p1])`

字符集：

```ts
const decodeMap: Record<string, string> = {
  gt: '>',
  lt: '<',
  amp: '&',
  apos: "'",
  quot: '"'
}
```

代码：

```ts

/**
 * Get text data with a given length from the current location.
 * This translates HTML entities in the text data.
 */
function parseTextData(
  context: ParserContext,
  length: number,
  mode: TextModes
): string {
  const rawText = context.source.slice(0, length)
  advanceBy(context, length)
  if (
    mode === TextModes.RAWTEXT ||
    mode === TextModes.CDATA ||
    rawText.indexOf('&') === -1
  ) {
    return rawText // 如果不包含 &gt; &lt; 等html标记
  } else {
    // DATA or RCDATA containing "&"". Entity decoding required.
    // 如果字符串中包含这些字符，得去将他们替换成对应的明文字符。
    return context.options.decodeEntities(
      rawText,
      mode === TextModes.ATTRIBUTE_VALUE
    )
  }
}
```

导图：![parse-textd-ata](http://qiniu.ii6g.com/parse-ts-parsetextdata.png?imageMogr2/thumbnail/!100p)

## <span id="parse-pushnode"></span>pushNode(nodes, node)

1. 注释节点不处理
2. 合并文本节点(前提是prev, node 两个节点是紧挨着的，由 loc.end.offset 和 loc.start.offset判断)
3. 返回新增 node 的 nodes 节点数组

```ts

function pushNode(nodes: TemplateChildNode[], node: TemplateChildNode): void {
  // ignore comments in production
  /* istanbul ignore next */
  if (!__DEV__ && node.type === NodeTypes.COMMENT) {
    return
  }

  if (node.type === NodeTypes.TEXT) { // 两个连着的文本节点，拼凑到一起去
    const prev = last(nodes)
    // Merge if both this and the previous node are text and those are
    // consecutive. This happens for cases like "a < b".
    if (
      prev &&
      prev.type === NodeTypes.TEXT &&
      prev.loc.end.offset === node.loc.start.offset
    ) {
      prev.content += node.content
      prev.loc.end = node.loc.end
      prev.loc.source += node.loc.source
      return
    }
  }

  nodes.push(node)
}
```



## <span id="parse-isend"></span>isEnd(context, mode, ancestors)

```ts

function isEnd(
  context: ParserContext,
  mode: TextModes,
  ancestors: ElementNode[]
): boolean {
  const s = context.source

  switch (mode) {
    case TextModes.DATA:
      if (startsWith(s, '</')) {
        //TODO: probably bad performance
        for (let i = ancestors.length - 1; i >= 0; --i) {
          if (startsWithEndTagOpen(s, ancestors[i].tag)) {
            return true
          }
        }
      }
      break

    case TextModes.RCDATA:
    case TextModes.RAWTEXT: {
      const parent = last(ancestors)
      if (parent && startsWithEndTagOpen(s, parent.tag)) {
        return true
      }
      break
    }

    case TextModes.CDATA:
      if (startsWith(s, ']]>')) {
        return true
      }
      break
  }

  return !s
}
```

## getCursor(context)

```ts

function getCursor(context: ParserContext): Position {
  const { column, line, offset } = context
  return { column, line, offset }
}
```



## <span id="parse-getselection"></span>getSelection(context, start, end?: Postion)

取实时解析后的 source，start，end的值。

```ts
function getSelection(
  context: ParserContext,
  start: Position,
  end?: Position
): SourceLocation {
  end = end || getCursor(context)
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset)
  }
}
```



# ast.ts

## <span id="file-ast-createroot"></span>createRoot(children, loc = locStub)

创建根节点对象，返回一个 [RootNode](#td-ast-rootnode) 类型对象。

参数：

1. children 节点子孙节点，类型：[TemplateChildNode[]](#td-ast-tcn)

   ```ts
   export type TemplateChildNode =
     | ElementNode // 节元素点类型
     | InterpolationNode // 插值节点
     | CompoundExpressionNode // 混合表达式节点
     | TextNode // 文本节点
     | CommentNode // 注释节点
     | IfNode // v-if 节点
     | IfBranchNode // v-else, v-else-if 分支节点
     | ForNode // v-ofr 节点
     | TextCallNode // ???
   
   
   ```

   

2. loc 一个 SourceLoation 类型的结构，默认值为 `locStub`

   ```ts
   export const locStub: SourceLocation = {
     source: '',
     start: { line: 1, column: 1, offset: 0 },
     end: { line: 1, column: 1, offset: 0 }
   }
   ```

代码：

```ts

export function createRoot(
  children: TemplateChildNode[],
  loc = locStub
): RootNode {
  return {
    type: NodeTypes.ROOT,
    children,
    helpers: [],
    components: [],
    directives: [],
    hoists: [],
    imports: [],
    cached: 0,
    temps: 0,
    codegenNode: undefined,
    loc
  }
}
```

# utils.ts

## advancePositionWithMutation(pos,source, numberOfCharacters)

更新context的 line，column，offset的值

```ts

// advance by mutation without cloning (for performance reasons), since this
// gets called a lot in the parser
export function advancePositionWithMutation(
  pos: Position,
  source: string,
  numberOfCharacters: number = source.length
): Position {
  let linesCount = 0
  let lastNewLinePos = -1
  for (let i = 0; i < numberOfCharacters; i++) {
    if (source.charCodeAt(i) === 10 /* newline char code */) {
      linesCount++
      lastNewLinePos = i
    }
  }

  pos.offset += numberOfCharacters
  pos.line += linesCount
  pos.column =
    lastNewLinePos === -1
      ? pos.column + numberOfCharacters
      : numberOfCharacters - lastNewLinePos

  return pos
}
```



# 变量声明

该模块相关的一些全局变量信息。

## 枚举类型

### <span id="td-vars-textmodes"></span>TextModes

```ts

export const enum TextModes {
  //          | Elements | Entities | End sign              | Inside of
  DATA, //    | ✔        | ✔        | End tags of ancestors |
  RCDATA, //  | ✘        | ✔        | End tag of the parent | <textarea>
  RAWTEXT, // | ✘        | ✘        | End tag of the parent | <style>,<script>
  CDATA,
  ATTRIBUTE_VALUE
}
```

转换成 javascript：

```js
export const TextModes = {
  //             | Elements | Entities | End sign              | Inside of
  DATA: 0, //    | ✔        | ✔        | End tags of ancestors |
  RCDATA: 1, //  | ✘        | ✔        | End tag of the parent | <textarea>
  RAWTEXT: 2, // | ✘        | ✘        | End tag of the parent | <style>,<script>
  CDATA: 3,
  ATTRIBUTE_VALUE: 4,
}
```



## parser

### defaultParserOptions

```ts
// 默认的解析器选项
export const defaultParserOptions: MergedParserOptions = {
  delimiters: [`{{`, `}}`],
  getNamespace: () => Namespaces.HTML, // 命名空间
  getTextMode: () => TextModes.DATA, // 文本类型
  isVoidTag: NO, // 自关闭标签???，如：<img>, <hr> ...
  isPreTag: NO, // <pre> 代码标签???，需要保留空格保证缩进的
  isCustomElement: NO, // 自定义标签，如：Transition
  decodeEntities: (rawText: string): string => 
  	// 解码实例，一些特殊符号表示，如：&gt;, &lt;, &amp;, &apos; &quot;
    rawText.replace(decodeRE, (_, p1) => decodeMap[p1]),
  onError: defaultOnError
}
```

使用到的其他全局变量：

```ts
const decodeRE = /&(gt|lt|amp|apos|quot);/g
const decodeMap: Record<string, string> = {
  gt: '>',
  lt: '<',
  amp: '&',
  apos: "'",
  quot: '"'
}
```



# 类型声明

该模块所有类型声明统一归类到此，顺序按照用例解析遇到的顺序为主。

## ast.ts

### <span id="td-ast-elementnode"></span>ElementNode

```ts
export type ElementNode =
  | PlainElementNode
  | ComponentNode
  | SlotOutletNode
  | TemplateNode


```



### <span id="td-ast-tcn"></span>TemplateChildNode

模板子孙节点的可能类型组合：

```ts
export type TemplateChildNode =
  | ElementNode // 节元素点类型
  | InterpolationNode // 插值节点
  | CompoundExpressionNode // 混合表达式节点
  | TextNode // 文本节点
  | CommentNode // 注释节点
  | IfNode // v-if 节点
  | IfBranchNode // v-else, v-else-if 分支节点
  | ForNode // v-ofr 节点
  | TextCallNode // ???

```



### <span id="td-ast-rootnode"></span>RootNode

```ts

export interface RootNode extends Node {
  type: NodeTypes.ROOT
  children: TemplateChildNode[]
  helpers: symbol[]
  components: string[]
  directives: string[]
  hoists: (JSChildNode | null)[]
  imports: ImportItem[]
  cached: number
  temps: number
  ssrHelpers?: symbol[]
  codegenNode?: TemplateChildNode | JSChildNode | BlockStatement | undefined
}
```



## <span id="td-parser-options"></span>ParserOptions

定义位置：*<font color="purple"> src/options.ts</font>*

接口内容：

```ts

export interface ParserOptions {
  /**
   * e.g. platform native elements, e.g. <div> for browsers
   */
  isNativeTag?: (tag: string) => boolean
  /**
   * e.g. native elements that can self-close, e.g. <img>, <br>, <hr>
   */
  isVoidTag?: (tag: string) => boolean
  /**
   * e.g. elements that should preserve whitespace inside, e.g. <pre>
   */
  isPreTag?: (tag: string) => boolean
  /**
   * Platform-specific built-in components e.g. <Transition>
   */
  isBuiltInComponent?: (tag: string) => symbol | void
  /**
   * Separate option for end users to extend the native elements list
   */
  isCustomElement?: (tag: string) => boolean
  /**
   * Get tag namespace
   */
  getNamespace?: (tag: string, parent: ElementNode | undefined) => Namespace
  /**
   * Get text parsing mode for this element
   */
  getTextMode?: (
    node: ElementNode,
    parent: ElementNode | undefined
  ) => TextModes
  /**
   * @default ['{{', '}}']
   */
  delimiters?: [string, string]
  /**
   * Only needed for DOM compilers
   */
  decodeEntities?: (rawText: string, asAttr: boolean) => string
  onError?: (error: CompilerError) => void
}
```

字段说明：

1. `isNativeTag?: (tag: string) => boolean` 一个函数，判断标签是否是原生标签(如：li, div)
2. `isVoidTag?: (tag: string) => boolean`,自关闭标签，如：img, br, hr
3. `isPreTag?: (tag: string) => boolean`，代码标签，需要空格缩进的，如：pre
4. `isBuiltInComponent?: (tag: string) => symbol | void`，平台相关的内置组件，如：Transition
5. `isCoustomElement?: (tag: string) => boolean`，用户自定的标签
6. `getNamespace?: (tag: string, parent: ElementNode | undefined) => N⁄amespace` ，获取标签命名空间
7. `getTextMode?: (node: ElementNode, parent: ElementNode|undefined) => TextModes`获取文本解析模式
8. `delimiters?: [string, string]`，插值分隔符，默认：`['{{', '}}']`
9. `decodeEntities?: (rawText: string, asAttr: boolean) => string`，仅用于 DOM compilers
10. `onError?: (error: CompilerError) => void `

## <span id="td-parser-context"></span>ParserContext

定义位置：*<font color="purple"> src/parse.ts</font>*

接口内容：

```ts

export interface ParserContext {
  options: MergedParserOptions // 解析器选项，即合并之后的参数对象
  readonly originalSource: string // 最初的源码，即解析之前的最原始的字符串，只读版本
  source: string // 解析中的源码字符串，会发生变化的字符串
  offset: number // 解析的指针位置，类似文件读取是的指针偏移量
  line: number // 解析位置在源码中的当前行
  column: number // 解析位置在源码中的当前列
  inPre: boolean // 标识是不是 <pre> 标签，如果是需要保留空格保证缩进
  inVPre: boolean // v-pre 指令，不处理指令和插值(v-xxx, {{...}})
}
```

