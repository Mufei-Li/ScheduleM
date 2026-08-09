# 部署指南

[English](DEPLOYMENT.md)

## 生产配置

请在 HTTPS 反向代理之后运行 Node 代理，并在仓库外配置以下环境变量：

```text
REQUIRE_AUTH=true
REQUIRE_SAME_ORIGIN=true
AUTH_USER=<管理员名称>
AUTH_PASS=<高强度密码>
JWT_SECRET=<足够长的随机密钥>
LLM_API_KEY=<服务商密钥>
COOKIE_SECURE=true
ALLOWED_ORIGINS=https://your-domain.example
```

部署时安装 Node 和 Python 依赖，再通过进程管理器启动 `node server_debug.js`。确认 `PYTHON_BIN` 指向已安装 `pdfplumber` 的 Python 环境。

## 运维检查

- 在引流前确认 `GET /healthz` 正常返回。
- 验证已认证的 PDF 和 LLM 接口会拒绝不同来源的请求。
- 根据部署环境设置上传大小限制；`MAX_PDF_BODY_BYTES` 默认 50 MB。
- 如 `LLM_API_KEY`、`AUTH_PASS` 或 `JWT_SECRET` 曾出现在复制的 `.env` 文件中，请立即轮换。

不要部署本地恢复归档、`.env`、`config.js` 或依赖目录。
