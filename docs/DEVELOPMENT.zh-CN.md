# 开发指南

[English](DEVELOPMENT.md)

## 环境准备

使用 `npm ci` 安装 Node 依赖。如需 PDF 解析，请在 `pdfplumber-fastapi-service/` 中创建 Python 虚拟环境并安装依赖。

```bash
npm ci
python -m venv pdfplumber-fastapi-service/.venv
pdfplumber-fastapi-service/.venv/Scripts/python -m pip install -r pdfplumber-fastapi-service/requirements.txt
```

macOS 和 Linux 请使用 `.venv/bin/python`。将 `.env.example` 复制为 `.env` 并填写仅供本地开发的配置。`node inject_env.js` 会生成 `config.js`，该文件已被忽略。

## 启动与测试

```bash
npm start
npm test
```

Node 服务负责静态页面和 PDF 解析进程调用，解释器由 `PYTHON_BIN` 指定。启动后可访问 `GET /healthz` 检查服务状态。

## 贡献规则

- 凭据、生成文件、依赖、缓存和构建产物不得进入 Git。
- 修改英文面向读者文档时，必须同步修改对应 `.zh-CN.md`。
- 修改可复用解析或时间工具时，在 `tests/` 添加有针对性的测试。
