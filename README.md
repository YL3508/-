# 臺中市英語教育資源中心網站專題工作檔案

2026-10-05 將本機專題工作資料夾保存到 GitHub，供另一台電腦接續使用。
這是多版本工作成果的快照，並非已完成或驗收的正式系統。

## 目錄

- `Codex_專題交接摘要_2026-10-01.md`：既有背景與交接紀錄，內容截至 10 月 1 日，接手仍需比對後續成果。
- `demo-review/dev1005-review/`：10 月 5 日檢視資料及 `source/NCHU-11507-TaichungEERC-dev/` 程式快照。
- `demo-review/source/`、`v2-source/`、`demo3-source/`：保留的不同程式與 Demo 版本。
- `demo-review/demo2-erd/`、`demo3-erd/`：資料模型及 SQL 設計成果。
- `demo-review/demo3-review/`、`evidence/`：檢視紀錄與畫面證據。

## 在桌機接續

先安裝 Git，於 PowerShell 執行：

```powershell
git clone --branch codex/project-transfer https://github.com/YL3508/-.git TaichungEERC-workspace
cd TaichungEERC-workspace
```

在 Codex 開啟複製後的資料夾，先閱讀交接摘要、本 README 與要處理的程式版本內的 `AGENTS.md`。
目前沒有指定唯一的正式開發版本；請依接續工作選擇對應快照，避免混用不同版本。

Laravel／Vue 程式需另行安裝 PHP、Composer、Node.js 與所需資料庫，依選定版本的設定安裝套件及初始化環境。
Git 不會搬移安裝在原電腦的工具、執行中的服務、外部資料庫或聊天紀錄。

## 兩台電腦輪流工作

開始工作前先執行 `git pull --ff-only`。完成後檢查要上傳的內容，再提交並上傳：

```powershell
git status
git add .
git commit -m "Describe this update"
git push
```

先完成目前電腦的推送，再換另一台工作；若 pull 報告分支分歧，先處理差異，不要強制覆蓋。

## 搬移範圍

保留專題原始碼、文件、需求 PDF、圖表、截圖與既有 Demo 報告 ZIP。
排除根目錄 `tmp/`、`output/`（包含與專題無關的個人履歷）、機密設定、套件及原有子目錄規則排除的檔案。
被忽略的資料仍留在原電腦；若需要完整本機備份，另外使用 USB 保存。
本次僅檢查檔案、建立版本與上傳，沒有重新執行程式測試或宣告系統功能已驗證。
