# ScheduleM → React Native iOS/Android（mobile-app）迁移实施计划

## 0. 目标与硬约束

### 0.1 目标
- 将现有 Web 项目迁移为 iOS App（React Native），并保证后续可无缝扩展为 Android App。
- 保持与网页版完全一致的核心业务逻辑：
  - 课程表数据结构与数据管理（CourseRule/Event/Grid/TimeSlots）
  - 节次时间修改的自动顺延机制
  - LLM 识别进度条实时显示（阶段、文本、进度、错误/重试）
  - 课程核对/编辑冲突策略（时间重叠阻止；同一时间同一地点仅 warning 确认，不强制合并）
  - 离线 HTML/ICS 导出策略（含 logo 内嵌防离线破图）

### 0.2 约束与边界
- Core 必须“纯函数化 + 可序列化 + 可单测”，禁止依赖 DOM/window。
- UI 层重写为 React Native 组件，交互体验对齐移动端（触摸、手势、动画），但业务规则与输出必须一致。
- LLM Key 不进入客户端（生产环境建议统一走 Node 代理 `/api/llm`）。

---

## 1. 仓库策略与分支

- 推荐方案：同一仓库 + 新分支 `mobile-app` 开发，逐步抽取 `packages/core`，让 Web 与 RN 共享。
- 分支：`mobile-app`（你已计划创建）

---

## 2. 现有实现的“权威来源”（需要对齐的代码点）

- 时间与周次工具（已有测试）：`./time_utils.js`、`./tests/time_adjust.test.js`
- Web 主逻辑（课程规则、冲突校验、事件生成、进度条、导出）：`./script.js`
  - 节次时间顺延输入处理：`scheduleLLMHandleTimeInputChange`
  - 冲突校验：`scheduleLLMValidateCourseRules`
  - 规则→事件：`scheduleLLMGenerateEventsFromCourseRules`
  - 月历分组键（避免误合并）：`createMonthCalendarElement` 内 groupedEvents key（含 className）
  - LLM 进度条：`scheduleLLMProgressSet*` 与 `generateSchedule` 中的进度驱动
  - HTML 导出：`btnSaveHtml`（含 logo 内嵌与 onerror 隐藏破图策略）
- LLM 服务：`./llm_parser.js`（parseCourse、parseScheduleImageToGrid）
- Node 代理与 PDF 抽表：`./server_debug.js`、`./pdfplumber-fastapi-service/main.py`

---

## 3. 目标架构（Monorepo 目录规划）

建议目录（最终形态）：

- `packages/core`
  - 纯业务逻辑（TS），可在 Node/Jest/Vitest 运行
- `packages/services`
  - LLM/PDF 等 I/O 服务（跨端可用），但不放 UI
- `packages/adapters`
  - `adapter-web`：浏览器文件/下载/DOM 适配
  - `adapter-rn`：RN 文件/缓存/分享/权限/通知适配
- `apps/web`
  - 现有 Web（逐步改成调用 core）
- `apps/mobile`
  - React Native 工程（iOS 优先，Android 同构）

---

## 4. 里程碑与验收标准（必须可回归）

### M0：基线冻结与一致性“黄金样本”
- 产出：
  - 黄金样本（10–30 个输入文件/文本）+ 预期输出快照（CourseRule[] + Event[]）
  - 关键行为清单（冲突策略/周次解析/顺延/导出/进度条）
- 验收：
  - Web 基线在样本上输出可复现且稳定

### M1：抽取 packages/core（不改行为）
- 产出：
  - core types + time utils + rule normalize + validate + event generator + display grouping
  - core 单测覆盖黄金样本与原 `tests/time_adjust.test.js`
- 验收：
  - core 在 Node 环境通过单测
  - Web 调用 core 后输出与基线一致（快照一致）

### M2：RN 工程搭建 + UI 骨架
- 产出：
  - RN 工程（iOS 可运行）+ React Navigation（原生导航栏 + Tab）
- 验收：
  - iOS 真机/模拟器可启动，能进入四个页面骨架（Import/Calendar/Courses/Settings）

### M3：RN 接入 core（实现主路径）
- 产出：
  - 导入（Excel/PDF/图片至少一种）→ 生成 → 月历展示 → 核对编辑 → 导出（ICS/HTML/分享）
- 验收：
  - 对同一输入样本，RN 输出 CourseRule/Event 与 Web 一致
  - 交互：顺延机制、冲突确认、进度条实时显示对齐 Web

### M4：移动端增强（离线缓存 + 通知 + 手势 + 动画）
- 产出：
  - 离线缓存（CourseRules/TimeSlots/SemesterStart/EditHistory/设置）
  - 本地通知（课程提醒）
  - 月历左右滑动切换月份（手势 + 动画）
- 验收：
  - 杀进程重开数据不丢
  - 通知权限与触发符合 iOS 规范
  - 滑动/动画体验接近原生

### M5：上架准备与交付物
- 产出：
  - Xcode 配置、原生桥接代码、单测、性能优化报告、多端一致性验证文档
- 验收：
  - 满足 Apple Store 审核要求（隐私/权限/稳定性）

---

## 5. 代码级任务单（可直接拆给 Agent）

### 5.1 Repo / Tooling

**T0-1：创建 monorepo 目录与 TS 基础（mobile-app 分支）**
- 内容：
  - 初始化 `packages/core` 的 TS 构建与测试
  - 初始化 `apps/mobile` 的 RN 工程（TS）
- 验收：
  - `packages/core` 能编译并跑单测
  - `apps/mobile` iOS 能跑通

---

### 5.2 Core：Types

**T1-1：定义数据结构 types**
- 目标文件：`packages/core/src/types.ts`
- 包含：
  - `Grid`
  - `TimeSlot`
  - `CourseRule`
  - `Event`
  - `ProgressState`（为进度条状态机准备）
- 验收：Web/RN 均可 import，且字段能完整覆盖现有 `script.js` 数据结构。

---

### 5.3 Core：时间与周次工具（顺延机制核心）

**T1-2：迁移 time_utils.js → packages/core（TS 化）**
- 目标文件：`packages/core/src/time/timeUtils.ts`
- 迁移函数：
  - `isValidTime / parseTimeToMinutes / formatMinutes / addMinutesToTime / diffTimeMinutes`
  - `validateSlots`
  - `computeShiftedSlots`（顺延机制）
  - `sanitizePeriodRange`
  - `getPeriodBounds / getTimeRangeForPeriod`
  - `parseWeekString / formatWeekRanges`
- 验收：
  - 将 `./tests/time_adjust.test.js` 迁移/复刻为 `packages/core` 的单测，断言保持一致
  - 顺延边界一致（0→3、4→7、8→9 三段联动规则由 UI 或 core 参数控制）

---

### 5.4 Core：规则规范化与冲突校验

**T1-3：规则规范化 normalizeRule**
- 目标文件：`packages/core/src/rules/normalizeRule.ts`
- 对齐逻辑：
  - weeksRaw 解析增强（兼容 `第2,4,6,...,16周`）
  - weeks 数组与 weeksRaw 的优先级策略（避免“重算丢课”）
- 验收：
  - 输入同一 rule，输出 weeks/ weeksRaw 与 Web 一致
  - weeks 为空时给出明确错误

**T1-4：冲突校验 validateRules（error vs warnings）**
- 目标文件：`packages/core/src/rules/validateRules.ts`
- 对齐逻辑：
  - 时间重叠：hard error（阻止）
  - 同一时间段 + 同地点（同节次边界一致）：warnings（仅确认，不合并）
- 验收：与 Web 相同输入产生相同 warnings/error。

---

### 5.5 Core：规则→事件生成与显示分组

**T1-5：generateEvents（规则→事件）**
- 目标文件：`packages/core/src/events/generateEvents.ts`
- 对齐逻辑：
  - 用 semesterStart + weekNum + dayOfWeek 推导 date
  - periodRange→startTime/endTime（通过 getTimeRangeForPeriod）
  - timeOfDay 分段规则
- 验收：events 输出字段一致、日期一致。

**T1-6：groupEventsForDisplay（避免误合并）**
- 目标文件：`packages/core/src/events/groupEventsForDisplay.ts`
- 对齐逻辑：
  - key 至少包含：period、location、title、className
- 验收：同日同节次同地点不同班级不合并。

---

### 5.6 Core：进度条状态机（实时显示）

**T3-1：progressModel（纯状态机）**
- 目标文件：`packages/core/src/progress/progressModel.ts`
- 对齐逻辑：
  - 阶段：准备、识别中、慢提示、错误、完成（存在错误/无错误）
  - 数值：processed/total/extractedCourses
- 验收：Web 与 RN 通过同一驱动事件序列得到同一 ProgressState。

---

### 5.7 Services：LLM / PDF / Excel（跨端 I/O）

**T2-1：LLMService TS 化（跨端）**
- 目标：`packages/services/src/llm/LLMService.ts`
- 对齐现有：
  - `parseCourse`
  - `parseScheduleImageToGrid`
  - 代理模式 header（X-Timestamp/X-Nonce）
- 验收：Web/RN 都能请求 `/api/llm`；错误处理与超时一致。

**T2-2：PDF 解析策略（优先服务端）**
- RN 对接：`/api/parse-pdf`
- 兜底：grid 空 → PDF 第 1 页转图 → `parseScheduleImageToGrid`
- 验收：PDF 输入在抽表失败时仍可识别出 grid（至少不崩溃，并给出可重试/提示）。

**T2-3：Excel 解析（RN）**
- 目标：RN 文件读取→ArrayBuffer→xlsx→grid
- 验收：同一 xlsx 在 Web/RN 解析出的 grid 行列文本一致（允许少量空白差异但需记录）。

---

### 5.8 Export：ICS / HTML（含离线 logo）

**T4-1：exportIcs（core）**
- 目标：`packages/core/src/export/exportIcs.ts`
- 验收：相同输入生成的 ICS 内容等价一致。

**T4-2：exportHtml（core）**
- 目标：`packages/core/src/export/exportHtml.ts`
- 对齐策略：
  - HTML 单文件离线打开不破图：优先内嵌 logo 为 data URL；失败则 onerror 隐藏
- 验收：离线打开无破碎图标，内容与 Web 一致。

---

### 5.9 Web 适配（用于回归）

**T5-1：Web 调用 core（逐步替换）**
- 替换点：
  - 时间顺延：UI 仍在 web，但计算调用 core 的 computeShiftedSlots
  - normalize/validate/generate/group：调用 core
- 验收：Web 回归黄金样本快照一致。

---

### 5.10 Mobile：RN UI 与平台特性

**T6-1：导航与 Tab**
- Import / Calendar / Courses / Settings
- 验收：状态保持，返回栈正常。

**T6-2：月历页（手势/动画/响应式）**
- 左右滑动切月、点击日期查看
- 验收：60fps 目标，触控反馈自然。

**T6-3：核对编辑页（冲突策略一致）**
- warnings confirm / hard error 阻止
- 日志时间：Asia/Shanghai
- 验收：行为对齐 Web。

**T6-4：离线缓存**
- 存储：CourseRules/TimeSlots/SemesterStart/EditHistory/设置
- 验收：重启不丢数据，migration 可控。

**T6-5：通知**
- 先本地通知（课程提醒）
- 验收：权限与触发符合 iOS 规范。

---

## 6. 开始执行（执行顺序建议：从“能回归的一致性”开始）

### 6.1 第一批立即执行的任务（建议今天先完成）
1) T0-1：创建 mobile-app 分支与 monorepo 目录骨架  
2) T1-1：types.ts  
3) T1-2：迁移 time_utils.js + 迁移/复刻 time_adjust 单测  
4) T1-3/T1-4/T1-5：normalize/validate/generate 三件套（先让 core 在 Node 跑通）  
5) T5-1：Web 最小替换调用 core（用于确保“完全一致”可验证）

### 6.2 “可并行”的任务（适合多 agent 同时做）
- LLMService TS 化（T2-1）
- RN 工程 + 导航骨架（T6-1）
- 导出模块抽取（T4-1/T4-2）

---

## 7. 输出与交付物清单（最终）
- RN iOS 工程 + Xcode 配置
- 原生桥接模块（文件/通知/分享/权限等）
- 单元测试用例（core + RN）
- 性能优化报告
- 多端一致性验证文档
- 上架审核材料（权限用途、隐私说明等）
