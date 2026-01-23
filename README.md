# 析课 - 智能课表生成工具

**析课** 是一个混合架构的课表解析与生成工具：前端静态页 + Node.js 轻量代理 + Python PDF 解析微服务。支持 Excel/PDF 输入、LLM 智能识别、ICS 导出与打印。适用于高校学生与教师，将复杂课表“解压缩”为直观月历。

## 🌟 开发背景

高校教务系统导出的课程表通常是以“一周”为循环单元的静态表格。然而在实际教学中，情况远比“一格一课”复杂：同一个时间单元格内可能堆叠了多门不同周次的课程，这些课程可能存在单双周轮换、各周次授课地点不固定等复杂情况。这意味着，一张看似清爽的 Excel 表格，实际上在每个细小的单元格中都高度“压缩”了多维度的、动态的教学时空信息。

对于广大师生而言，每次提取并解读课表信息的过程，实质上都是一次非常耗费精力的“大脑解压缩”过程。由于信息密度巨大，传统的手动解读方式不仅效率低下，而且极其容易出错（例如记错周次、走错教室等）。因此，开发一个能够对“压缩课表”进行自动解析（解压缩）并还原为直观日程的程序工具，不仅能极大程度上解放大脑逻辑，更是提升校园生活和工作效率的一项刚需。

## ✨ 主要功能
- 双模式解析：正则规则 + LLM 智能识别，支持乱序/非标准文本。
- Excel/PDF 输入：Excel 表格上传；PDF 通过后端解析为结构化数据。
- 月历视图：按月展示、颜色区分时段、周次提示。
- 编辑与修正：在月历上直接修改课程信息。
- 导出与打印：ICS 导出、离线 HTML、A4 打印优化。
- 个性化节次：分段联动的时间微调（1-4、5-8、9-10）。

## 🏗️ 系统架构

```mermaid
flowchart LR
  Browser["前端静态页"] -->|上传 Excel/PDF| Node["Node.js 轻量代理"]
  Browser -->|直连可选| LLM["LLM 平台"]
  Node -->|/api/llm| LLM
  Node -->|/api/parse-pdf| Py["Python PDF 解析"]
  Node -. /pdf.min.js .-> Browser
```

- 前端：HTML/CSS/JS 负责 UI、解析流程与导出。
- Node 代理：[server_debug.js](file:///Users/angli/Library/CloudStorage/OneDrive-个人/软著/ScheduleM/server_debug.js) 提供认证、限流、LLM 转发、PDF 解析与 PDF.js 资源托管。
- Python 微服务：[main.py](file:///Users/angli/Library/CloudStorage/OneDrive-个人/软著/ScheduleM/pdfplumber-fastapi-service/main.py) 使用 pdfplumber 解析 PDF 表格，也支持 CLI 模式被 Node 调用。

## 🧩 模块说明
- 前端入口：index.html、script.js、llm_parser.js、time_utils.js、style.css。
- Node 服务：server_debug.js，提供 /api/llm、/api/parse-pdf、/api/auth/login/logout、/healthz。
- Python 服务：pdfplumber-fastapi-service/ 目录，FastAPI + pdfplumber。

## 🔄 数据流
1. 用户上传 Excel 或 PDF。
2. PDF 上传时由 Node 接收并调用 Python 解析。
3. Excel/解析结果进入前端解析管线（规则 + LLM）。
4. 前端生成课程日历与导出文件。

---

## 🚀 快速开始

### 方式一：直接使用
如果已部署到静态站点（如 GitHub Pages），直接访问链接即可使用。但无法使用LLM调用。

### 方式二：本地运行（全功能）
1. 安装 Node.js 20+ 与 Python 3.10+。
2. 在根目录创建 `.env`：
   ```env
   PORT=3001
   REQUIRE_AUTH=true
   AUTH_USER=admin
   AUTH_PASS=请填入密码
   JWT_SECRET=请填入随机密钥
   LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   LLM_API_KEY=sk-你的真实密钥
   LLM_MODEL=qwen-flash
   ALLOWED_ORIGINS=http://localhost:3001
   ```
3. 安装依赖并启动 Node：
   ```bash
   npm i
   npm run start
   ```
4. （可选）独立启动 Python：
   ```bash
   cd pdfplumber-fastapi-service
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```
5. 打开 `http://localhost:3001/`。

### 方式三：仅前端模式
直接打开 `index.html`，可使用正则解析与本地编辑；LLM 需直连配置 API Key，PDF 解析不可用。

---

## ⚙️ 配置说明

### 前端配置（可选）
使用 `inject_env.js` 生成 `config.js`（已加入 .gitignore）：
```bash
LLM_API_URL=/api/llm LLM_MODEL=qwen-flash node inject_env.js
```
前端会读取 `window.AppConfig.llmApiUrl` 与 `model` 自动填充。

### Node 代理环境变量
- PORT：服务端口，默认 3001。
- REQUIRE_AUTH / REQUIRE_SAME_ORIGIN：是否开启鉴权/同源校验。
- AUTH_USER / AUTH_PASS / JWT_SECRET / JWT_TTL_SECONDS：登录与 Cookie 鉴权配置。
- LLM_BASE_URL / LLM_API_KEY / LLM_MODEL：LLM 转发配置。
- ALLOWED_ORIGINS / RATE_LIMIT_RPM / MAX_BODY_BYTES：跨域与限流。
- PDF_PARSER_PY / PYTHON_BIN / PDF_PARSE_TIMEOUT_MS：PDF 解析脚本与超时配置。

### Python 服务配置
见 pdfplumber-fastapi-service/.env.example。

---

## 🔌 API 文档
- `POST /api/auth/login`：`{ username, password }` 登录，返回 Cookie。
- `POST /api/auth/logout`：清除认证 Cookie。
- `POST /api/llm`：转发 LLM 请求，参数 `{ model, messages, temperature }`。
- `POST /api/parse-pdf`：表单上传 `file=*.pdf`，返回解析 JSON。
- `GET /healthz`：健康检查。
- `GET /pdf.min.js`、`/pdf.worker.min.js`：PDF.js 资源。

## 🔌 API 文档
- `POST /api/auth/login`：请求体 `{ username, password }`，登录成功后以 Cookie 方式下发令牌。
- `POST /api/auth/logout`：清除认证 Cookie。
- `POST /api/llm`：转发到 LLM 平台，参数 `{ model, messages, temperature }`。
- `POST /api/parse-pdf`：表单上传 `file=*.pdf`，返回解析结果 JSON。
- `GET /healthz`：健康检查。
- `GET /pdf.min.js` 与 `GET /pdf.worker.min.js`：提供 PDF.js 资源（离线/内网场景）。

## 📖 使用指南
1. 上传课表（Excel 或 PDF）。
2. 设置开学日期与节次时间。
3. 点击生成日程，查看月历与课程列表。
4. 导出 ICS、打印或保存 HTML。

## ✅ 测试
```bash
npm test
```

## 🛠️ 技术栈
- 前端：HTML5 / CSS3 / Vanilla JS
- 解析：SheetJS (xlsx)、pdfplumber
- LLM：通义千问 Qwen（DashScope 兼容接口）
- 后端：Node.js + FastAPI

## 📄 许可证
本项目开源，仅供学习交流使用。
