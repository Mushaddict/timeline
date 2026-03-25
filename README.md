# Timeline - 时光轴

基于 Vue3 + TypeScript 的动态时光轴网页应用，可部署到 GitHub Pages。

## 功能特点

- **垂直时间轴展示** - 支持滚动动画效果，左右交替布局
- **时间节点类型** - 支持"时间点"和"时间段"两种类型
- **内容框架** - 每个节点可包含多个人物的文字和图片记录
- **人物管理** - 自动根据生日计算星座和年龄
- **筛选功能** - 按人物筛选时间轴事件
- **响应式设计** - 适配桌面和移动设备
- **纯静态部署** - 可直接托管在 GitHub Pages

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router + Pinia
- GSAP (动画效果)
- date-fns (日期处理)

## 快速开始

### 本地开发

```bash
# 安装依赖（需要 express, cors, concurrently）
npm install

# 方式1: 仅启动前端（数据不保存到文件）
npm run dev

# 方式2: 同时启动前端 + 后端 API（推荐，支持保存到文件）
npm run dev:full

# 单独启动后端 API
npm run server

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 本地编辑并保存到文件

在本地开发模式下 (`npm run dev:full`)，你可以在网页上直接编辑人物信息并保存到 JSON 文件：

1. 启动完整开发环境：`npm run dev:full`
2. 打开 http://localhost:5173/timeline/
3. 进入"人物"页面，点击"添加人物"或编辑现有人物
4. 点击"💾 保存到文件"按钮，数据将写入 `public/data/people.json`
5. 每次保存前会自动创建备份到 `backups/` 目录

**注意**：生产环境（GitHub Pages）下无法保存到文件，数据仅保存在浏览器内存中。

### 部署到 GitHub Pages

1. 在 GitHub 创建仓库，推送代码
2. 进入 Settings → Pages
3. Source 选择 "GitHub Actions"
4. 推送代码到 `main` 分支，自动触发部署

访问地址：`https://<username>.github.io/timeline/`

## 数据管理

数据以 JSON 文件形式存储在 `public/data/` 目录下：

### people.json - 人物数据

```json
{
  "people": [
    {
      "id": "p001",
      "name": "张三",
      "birthday": "1995-06-15",
      "avatar": "/timeline/uploads/avatar1.jpg",
      "meetDate": "2020-03-10",
      "memo": "大学同学"
    }
  ]
}
```

### timeline.json - 时间节点

```json
{
  "nodes": [
    {
      "id": "t001",
      "date": "2024-03-25",
      "type": "point",
      "title": "事件标题",
      "frames": [
        {
          "id": "f001",
          "personId": "p001",
          "content": "事件描述",
          "images": ["/timeline/uploads/img1.jpg"]
        }
      ]
    },
    {
      "id": "t002",
      "date": "2024-03-20",
      "endDate": "2024-03-25",
      "type": "range",
      "title": "时间段事件",
      "frames": [...]
    }
  ]
}
```

### 图片管理

将图片放入 `public/uploads/` 目录，提交后重新部署即可。

## 项目结构

```
├── public/
│   ├── data/              # JSON 数据文件
│   └── uploads/           # 图片资源
├── src/
│   ├── components/        # Vue 组件
│   ├── composables/       # 组合式函数
│   ├── router/            # 路由配置
│   ├── views/             # 页面视图
│   ├── App.vue
│   └── main.ts
├── .github/workflows/     # GitHub Actions 配置
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 自定义配置

编辑 `vite.config.ts` 修改 `base` 路径以匹配你的仓库名称：

```ts
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

同时更新 `src/router/index.ts` 中的 `createWebHistory` 参数。

## License

MIT

> 我希望写一套可以直接配置在github.io的网页项目。要求：前段有动态实时效果，可以用vue3去搞，配套一些有意思的带有数据属性的库。
> 我主要想实现的功能是生成一个timeline，时间具体到年月日，可以选择时间的节点。
> 然后用户可以在某一个时间节点或时间区间建立一个框架，框架里包含文字、图片，都是非必选项。
> 建立一套后台配套数据库，每一套数据包含数据：名称、生日、图片、（根据生日生成的星座）、认识时间、备忘、与主页面相关联的时间节点或区间。