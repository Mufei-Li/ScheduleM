# 析课（Xike）

[English](README.md) | [开发文档](docs/DEVELOPMENT.zh-CN.md) | [部署文档](docs/DEPLOYMENT.zh-CN.md) | [样例说明](samples/README.zh-CN.md)

析课将密集的高校课程表导出文件转为可编辑日历。它支持 Excel、PDF 与图片输入，可将循环课程展开为月历，并导出 ICS 日历或离线 HTML。

## 功能

- 本地解析 Excel，并可选用 PDF 表格提取和多模态 LLM 辅助。
- 在导出前核对、新增、修改或删除课程事件。
- 检查时间冲突，支持灵活设置节次时间。
- 导出 ICS 与离线 HTML，并提供适合打印的月历视图。
- 生产环境将 LLM 凭据保留在服务端代理中。

## 架构

浏览器端由 `index.html`、`script.js`、`llm_parser.js` 与 `time_utils.js` 构成。`server_debug.js` 是可选的 Node.js 代理，负责认证、LLM 请求与 PDF 解析；`pdfplumber-fastapi-service/` 中的 Python 服务负责 PDF 表格提取，既可作为 CLI 使用，也可启动为 FastAPI 服务。

## 快速开始

前置条件：Node.js 18+ 和 Python 3.10+。

```bash
npm ci
python -m pip install -r pdfplumber-fastapi-service/requirements.txt
copy .env.example .env
npm start
```

打开 `http://127.0.0.1:3001`。本地冒烟测试可在 `.env` 中设置 `REQUIRE_AUTH=false` 跳过登录；生产环境不得使用此配置。

`LLM_API_KEY`、`AUTH_PASS` 与 `JWT_SECRET` 应通过环境变量或本地 `.env` 提供。不要提交 `.env` 或自动生成的 `config.js`。

## 项目结构

```text
.
├── docs/                         # 中英文项目文档
├── pdfplumber-fastapi-service/   # 可选的 Python PDF 解析服务
├── samples/                      # 样例策略与候选文件
├── tests/                        # Node.js 测试
├── server_debug.js               # 可选的 Node.js 代理
└── index.html                    # 浏览器入口
```

## 文档机制

每份面向读者的英文 Markdown 文档都必须有同名 `.zh-CN.md` 中文镜像，并在同一提交中更新。中文参考 PDF 存放于 `docs/reference/`。

## 安全

请将 API Key 和密码视为敏感信息。如密钥曾存于本地副本或 Git 历史，请在公开仓库前完成轮换。

## 许可证

项目尚未选定许可证。在添加许可证前，请勿假定允许复用或再分发。
