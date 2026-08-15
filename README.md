# yt-ui

---

## 引入方法

在 `pages.json` 中配置 easycom：

```json
{
  "easycom": {
    "custom": {
      "autoscan": true,
      "^yt-(.*)": "yt-ui/src/components/yt-$1/yt-$1.vue"
    }
  }
}
```

---

## 组件库文档

[阅读文档](https://zjyt.cqytxy.edu.cn/yt-ui/docs/)

---

## 运行 examples 报错问题

UniApp Workspaces 编译报错：Invalid pattern ... for "output.chunkFileNames", patterns can be neither absolute nor relative paths. If you want your files to be stored in a subdirectory, write its name without a leading slash like this: subdirectory/pattern.

解决办法：

UniApp 编译工具没有正确处理 Workspaces 引入依赖时带有的相对路径 ../。可以直接修改utils内的对应函数，将相对路径替换成空。

文件位于：

```bash
node_modules/@dcloudio/uni-cli-shared/dist/utils.js
```

找到 normalizeNodeModules 函数，修改：

【修改前】

```javascript
function normalizeNodeModules(str) {
  // ... 原有代码
  return str
}
```

【修改后】

```javascript
function normalizeNodeModules(str) {
  // ... 原有代码

  // 匹配删除路径中的所有相对路径标识符 '../'
  str = str.replace(/\.\.\//g, '')

  return str
}
```

重启编译即可解决。

---
