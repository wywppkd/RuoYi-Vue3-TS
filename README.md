## 说明

当前项目模板基于 [RuoYi-Vue3@3.8.7](https://github.com/yangzongzhuan/RuoYi-Vue3/tree/v3.8.7) 版本上做了以下几方面的优化

- [x] 支持 TypeScript
- [x] 支持 ESLint + Prettier
- [x] 支持 Git Hooks(提交前校验, 提交前自动格式化)
- [x] 限制 node 版本, 支持 volta 自动切换 node 版本
- [x] 区分不同环境(开发-测试-生产)
- [x] axios 二次封装优化
- [x] 处理了 RuoYi 自带页面的部分 Lint 错误

## 开发环境

- node: v18.x || >=v20.x
  - 建议使用 [volta](https://volta.sh/) 管理 node 版本
- 安装 VSCode 插件 `Vetur`，`ESLint`，`Prettier`

## 前端运行

```bash
# 安装依赖
yarn

# 本地启动
yarn dev

# 构建
yarn build:dev # 开发环境
yarn build:test # 测试环境
yarn build:prod # 生产环境
```

## 下载文件示例

```ts
// api-xx.ts
import request from '@/utils/request';

export function downloadFile(data: any) {
  return request.post('/xxx/download', data, {
    responseType: 'blob',
    getResponse: true,
  });
}

// xx.vue
import { saveFile } from '@/utils/saveFile';

// 点击下载按钮
const handleDownload = async function () {
  const res = await downloadFile({ id: 1 });
  await saveFile(res);
};
```

## 配置 nginx 代理示例

```bash
server{
  # 匹配 /api 开头的请求
  location /api {
      rewrite ^/api/(.*)$ /$1 break; # 把 /api 换成 /
      proxy_pass http://your-server.com; # 代理到后端服务器
  }
}
```
