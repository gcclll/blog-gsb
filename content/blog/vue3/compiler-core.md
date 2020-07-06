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

#### simple text

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

用例的基本功能，验证 baseParse 解析出来的文本节点对象是否满足基本要求。	

baseParse 的基本实现：

`function baseParse(content, options /* ParserOptions */) {}`

参数：

1. content，文本内容
2. options，解析选项，是个 [ParserOptions](#td-parser-options) 类型



# 类型声明

该模块所有类型声明统一归类到此，顺序按照用例解析遇到的顺序为主。

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