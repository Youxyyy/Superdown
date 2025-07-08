# Superdown

Superdown 是一个强大的 Markdown 编辑器，支持实时预览和幻灯片演示功能。它基于 Electron 构建，提供了一个现代化的写作和演示环境。

![image](https://github.com/user-attachments/assets/ecbb5eb2-8fe0-45c5-9119-c4951c9d61ed)

## ✨ 特性

- 📝 实时 Markdown 编辑和预览
- 🎭 双模式切换：文章模式和幻灯片模式
- 🎨 美观的用户界面和现代化的设计
- 🛠 丰富的格式化工具栏
- 📊 支持幻灯片演示（基于 reveal.js）
- 📤 支持导出 PDF 和 Markdown 文件
- 🎯 支持文件拖放和快捷键操作

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发版本

```bash
npm start
```

### 构建应用程序

```bash
npm run build
```

## 💡 使用指南

### 基本编辑

1. 启动应用后，您可以直接在左侧编辑区域输入 Markdown 文本
2. 右侧区域会实时显示渲染后的效果
3. 使用顶部工具栏快速插入常用的 Markdown 语法

### 幻灯片模式

1. 使用 `---` 分隔不同的幻灯片
2. 点击顶部的"幻灯片模式"切换到演示视图
3. 使用"开始演示"按钮进入全屏演示模式
4. 按 ESC 键或点击右上角按钮退出演示

### 文件操作

- **打开文件**: Ctrl+O
- **保存文件**: Ctrl+S
- **导出 PDF**: Ctrl+P

### 格式化快捷键

- 粗体: Ctrl+B
- 斜体: Ctrl+I
- 链接: Ctrl+K
- 代码块: Ctrl+Shift+C

## 🔧 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Marked](https://marked.js.org/) - Markdown 解析器
- [Reveal.js](https://revealjs.com/) - 演示框架
- [Font Awesome](https://fontawesome.com/) - 图标库

## 📦 项目结构

```
superdown/
├── main.js           # Electron 主进程
├── preload.js        # 预加载脚本
├── renderer.js       # 渲染进程
├── index.html        # 主界面
├── style.css         # 样式表
└── package.json      # 项目配置
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目基于 GPL-3.0 协议开源 - 查看 [LICENSE](LICENSE) 文件了解更多细节

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 提供了强大的跨平台开发框架
- [Marked](https://marked.js.org/) - 优秀的 Markdown 解析器
- [Reveal.js](https://revealjs.com/) - 强大的演示框架
- [Font Awesome](https://fontawesome.com/) - 提供了丰富的图标资源

## 📞 联系方式

如果您有任何问题或建议，欢迎通过以下方式联系我们：

2116157050@qq.com

## 🔄 更新日志

### v1.0.0 (2025-07)

- ✨ 首次发布
- 🎉 支持基础的 Markdown 编辑和预览
- 🎭 支持文章模式和幻灯片模式
- 📤 支持导出 PDF 和 Markdown 文件
- 🛠 添加格式化工具栏
- 🎨 优化用户界面和交互体验 
