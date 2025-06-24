# 🖼️ TransPic - 多功能图片处理工具

TransPic 是一个基于 Next.js 15 构建的现代化图片处理 Web 应用，提供图片压缩、尺寸调整、格式转换和 SVG 编辑等功能。

## ✨ 功能特性

### 🗜️ 图片压缩
- **智能压缩算法**：使用 browser-image-compression 库进行高质量压缩
- **用户控制**：可调节压缩质量（10%-100%）
- **实时预览**：支持质量调整后的实时重新压缩
- **批量处理**：支持多张图片同时压缩
- **格式支持**：JPEG、PNG、WebP
- **文件大小限制**：最大 10MB

### 📏 图片尺寸调整
- **灵活调整**：支持按像素或百分比调整尺寸
- **保持比例**：可选择保持原始宽高比
- **预设尺寸**：提供常用尺寸快速选择
- **批量处理**：支持多张图片统一调整

### 🔄 格式转换
- **多格式支持**：JPEG ↔ PNG ↔ WebP 互转
- **质量控制**：转换时可调节输出质量
- **批量转换**：支持多文件格式转换

### 🎨 SVG 编辑器
- **在线编辑**：内置 SVG 代码编辑器
- **实时预览**：编辑时实时显示效果
- **语法高亮**：支持 SVG 代码语法高亮

## 🛠️ 技术栈

- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **UI组件**：shadcn/ui
- **国际化**：next-intl
- **图片处理**：browser-image-compression
- **图标**：Lucide React

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm/yarn/pnpm

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
npm start
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国际化路由
│   │   ├── compress/      # 图片压缩页面
│   │   ├── resize/        # 尺寸调整页面
│   │   ├── convert/       # 格式转换页面
│   │   └── svg-editor/    # SVG编辑器页面
│   ├── globals.css        # 全局样式
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── features/         # 功能组件
│   ├── layout/           # 布局组件
│   └── ui/               # UI 基础组件
├── lib/                  # 工具函数
├── messages/             # 国际化文件
└── types/                # TypeScript 类型定义
```

## 🌍 国际化支持

应用支持多语言：
- 🇺🇸 English (en)
- 🇨🇳 简体中文 (zh)

语言文件位于 `src/messages/` 目录。

## 🎯 使用指南

### 图片压缩
1. 上传图片文件（支持拖拽）
2. 调整压缩质量滑块（10%-100%）
3. 点击"Start Compression"开始压缩
4. 压缩完成后可继续调整质量实时重新压缩
5. 下载压缩后的图片

### 尺寸调整
1. 上传图片文件
2. 选择调整方式（像素/百分比）
3. 设置目标尺寸
4. 选择是否保持宽高比
5. 应用调整并下载

### 格式转换
1. 上传图片文件
2. 选择目标格式
3. 调整输出质量（如适用）
4. 转换并下载

### SVG 编辑
1. 上传 SVG 文件或创建新文件
2. 在编辑器中修改 SVG 代码
3. 实时预览效果
4. 保存或下载编辑后的文件

## 🔧 开发说明

### 添加新功能
1. 在 `src/components/features/` 创建功能组件
2. 在 `src/app/[locale]/` 添加对应页面
3. 更新导航和国际化文件

### 样式定制
- 使用 Tailwind CSS 进行样式开发
- 主题配置在 `tailwind.config.js`
- 全局样式在 `src/app/globals.css`

### 类型安全
- 所有组件使用 TypeScript
- 类型定义在 `src/types/`
- 严格的类型检查确保代码质量

## 🐛 已知问题

- ✅ 修复了图片压缩的无限重渲染循环问题
- ✅ 修复了质量滑块控制问题
- ✅ 修复了 favicon.ico 构建错误

## 📚 Lessons Learned

### 主题切换问题 (2025-06-24)
**问题**：首页功能卡片在主题切换时颜色不正确 - 浅色模式显示深色，深色模式显示浅色。

**根本原因**：Tailwind CSS v4 中 `dark:` 前缀类在某些情况下无法正确应用。

**解决方案**：使用内联样式直接引用CSS变量：
```tsx
style={{
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: 'hsl(var(--foreground))'
}}
```

**关键教训**：
- CSS变量比Tailwind类更可靠用于主题切换
- 内联样式可以绕过框架限制
- 直接使用设计系统的CSS变量确保一致性

## 📝 更新日志

### v1.0.0 (2024-06-24)
- ✨ 实现图片压缩功能
- ✨ 添加用户控制的压缩质量
- ✨ 支持批量图片处理
- ✨ 实现实时质量调整
- 🐛 修复无限重渲染问题
- 🐛 修复构建错误

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**TransPic** - 让图片处理变得简单高效 🚀
