# 析课 - 智能课表生成工具

**析课** 是一个混合架构的课表解析与生成工具：前端静态页 + Node.js 轻量代理 + Python（pdfplumber）解析。支持 Excel / PDF / 图片课表输入、LLM（Qwen）视觉识别与语义解析、ICS 导出与打印。适用于高校学生与教师，将复杂课表“解压缩”为直观月历。

## 🌟 开发背景

高校教务系统导出的课程表通常是以“一周”为循环单元的静态表格。然而在实际教学中，情况远比“一格一课”复杂：同一个时间单元格内可能堆叠了多门不同周次的课程，这些课程可能存在单双周轮换、各周次授课地点不固定等复杂情况。这意味着，一张看似清爽的 Excel 表格，实际上在每个细小的单元格中都高度“压缩”了多维度的、动态的教学时空信息。

对于广大师生而言，每次提取并解读课表信息的过程，实质上都是一次非常耗费精力的“大脑解压缩”过程。由于信息密度巨大，传统的手动解读方式不仅效率低下，而且极其容易出错（例如记错周次、走错教室等）。因此，开发一个能够对“压缩课表”进行自动解析（解压缩）并还原为直观日程的程序工具，不仅能极大程度上解放大脑逻辑，更是提升校园生活和工作效率的一项刚需。

## ✨ 主要功能
- 双阶段解析：先把课表还原为表格 grid，再对单元格做 正则 + LLM 语义解析。
- Excel/PDF/图片输入：Excel 表格上传；PDF 优先 pdfplumber 抽表；图片/扫描件走 Qwen-VL 视觉识别输出 grid。
- 扫描 PDF 兜底：若 pdfplumber 未抽到表格，自动将 PDF 第 1 页渲染成图片并调用 LLM 生成 grid。
- 月历视图：按月展示、颜色区分时段、周次提示。
- 导出与打印：ICS 导出、离线 HTML、A4 打印优化。
- 个性化节次：分段联动的时间微调（1-4、5-8、9-10）。

## 🏗️ 系统架构

```mermaid
flowchart LR
  Browser["前端静态页"] -->|上传 Excel/PDF| Node["Node.js 轻量代理"]
  Browser -->|图片/扫描PDF(第1页渲染)| Node
  Node -->|/api/llm| LLM["LLM 平台 (Qwen-VL)"]
  Node -->|/api/parse-pdf| Py["Python pdfplumber 解析 (CLI/可选FastAPI)"]
  Node -. /pdf.min.js .-> Browser
```

- 前端：HTML/CSS/JS 负责 UI、文件预览（PDF.js）、解析流程与导出。
- Node 代理：[server_debug.js](file:///Users/angli/Library/CloudStorage/OneDrive-个人/软著/ScheduleM/server_debug.js) 提供认证、限流、LLM 转发与 PDF 解析入口。
- Python：[main.py](file:///Users/angli/Library/CloudStorage/OneDrive-个人/软著/ScheduleM/pdfplumber-fastapi-service/main.py) 仅负责 pdfplumber 表格抽取（已移除 PaddleOCR）。

## 🧩 模块说明
- 前端入口：index.html、script.js、llm_parser.js、time_utils.js、style.css。
- Node 服务：server_debug.js，提供 /api/llm、/api/parse-pdf、/api/auth/login/logout、/healthz。
- Python 服务：pdfplumber-fastapi-service/ 目录，FastAPI + pdfplumber。

## 🔄 数据流
1. 用户上传 Excel / PDF / 图片。
2. Excel：直接读表格 grid，进入前端解析管线（正则 + LLM）。
3. PDF：调用 `/api/parse-pdf`（pdfplumber）抽表为 grid；若 grid 为空则将 PDF 第 1 页渲染成图片并调用 `/api/llm`（Qwen-VL）生成 grid。
4. 图片：前端压缩后直接调用 `/api/llm`（Qwen-VL）输出 grid。
5. grid 进入前端解析与生成：按节次/星期映射为日历事件，支持导出与打印。

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

   # 允许 /api/llm 接收 base64 图片（上传图片/扫描PDF兜底会用到）
   MAX_LLM_BODY_BYTES=12582912

   ALLOWED_ORIGINS=http://localhost:3001
   ```
3. 安装依赖并启动 Node：
   ```bash
   npm i
   npm run start
   ```
4. 安装 Python 依赖（Node 会通过 CLI 调用 pdfplumber 解析，无需单独启动 Python 服务）：
   ```bash
   cd pdfplumber-fastapi-service
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
5. 打开 `http://localhost:3001/`。

如果使用 Nginx 反代，需确保 `/api/llm` 的 `client_max_body_size` 足够大（否则可能 413）。另外建议对 `script.js/llm_parser.js` 禁用强缓存，避免更新后浏览器仍加载旧代码。

### 方式三：仅前端模式
直接打开 `index.html`，可使用正则解析与本地编辑；LLM 需直连配置 API Key，PDF 解析不可用。

---

## ⚙️ 配置说明

### 前端配置（可选）
使用 `inject_env.js` 生成 `config.js`（已加入 .gitignore），用于给前端填充默认的 LLM 接口地址与模型：
```bash
LLM_API_URL=/api/llm LLM_MODEL=qwen-flash node inject_env.js
```
提示词已内置在 [llm_parser.js](file:///Users/angli/Library/CloudStorage/OneDrive-个人/软著/ScheduleM/llm_parser.js) 的 `parseScheduleImageToGrid` 中，可直接在代码里调整。

### Node 代理环境变量
- PORT：服务端口，默认 3001。
- REQUIRE_AUTH / REQUIRE_SAME_ORIGIN：是否开启鉴权/同源校验。
- AUTH_USER / AUTH_PASS / JWT_SECRET / JWT_TTL_SECONDS：登录与 Cookie 鉴权配置。
- LLM_BASE_URL / LLM_API_KEY / LLM_MODEL：LLM 转发配置。
- MAX_BODY_BYTES：普通 JSON 请求体上限。
- MAX_LLM_BODY_BYTES：`/api/llm` 请求体上限（用于 base64 图片）。
- ALLOWED_ORIGINS / RATE_LIMIT_RPM：跨域与限流。
- PDF_PARSER_PY / PYTHON_BIN / PDF_PARSE_TIMEOUT_MS：PDF 解析脚本与超时配置。

### Python 服务配置
见 pdfplumber-fastapi-service/.env.example。

---

## 🔌 API 文档
- `POST /api/auth/login`：请求体 `{ username, password }`，登录成功后以 Cookie 方式下发令牌。
- `POST /api/auth/logout`：清除认证 Cookie。
- `POST /api/llm`：LLM 转发（支持多模态 `messages[].content` 为数组，包含 `type=image_url`）。
- `POST /api/parse-pdf`：表单上传 `file=*.pdf`，返回结构化表格 `{ grid, pages, ... }`。
- `GET /healthz`：健康检查。
- `GET /pdf.min.js` 与 `GET /pdf.worker.min.js`：PDF.js 资源（离线/内网场景）。

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
- 前端：HTML5 / CSS3 / Vanilla JS + PDF.js
- 表格抽取：SheetJS (xlsx)、pdfplumber
- 视觉/语义：通义千问 Qwen（DashScope 兼容接口，Qwen-VL 用于图片/扫描件）
- 后端：Node.js（LLM 转发与 PDF 解析入口） + Python（pdfplumber，CLI/可选 FastAPI）

## 📄 许可证
本项目开源，仅供学习交流使用。
