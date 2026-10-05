# Demo3 資料庫關聯圖草案

- [DrawSQL 完整可編輯圖面](https://drawsql.app/teams/yl3508/diagrams/demo3-erd)
- [MySQL 8 DDL](demo3-schema.sql)
- [DrawSQL 畫面](demo3-drawsql.png)

DrawSQL 匯入結果：**20 張表、216 個欄位、36 條關聯**。已儲存至使用者帳號，重新開啟後確認表格與中文備註仍在。此圖為設計草案；壓縮檔內的 Laravel 後端僅有預設 migration，尚未實作此資料庫。

首次從帳號圖面直接匯入只接受 15 表；該次圖面已標為「Demo3 匯入測試（僅15表，請使用完整ERD）」。請以本頁連結的完整圖面為準。

## 來源與範圍

依使用者提供的 `NCHU-11507-TaichungEERC-mandy-rule-walkthrough.zip` 中 `prototype/demo/英語教育中心Demo/DEMO3_小組確認版.md`、`organizer-feedback.js`、`organizer.js`、`school-registration.js`、`docs/project-planning/01_專題決策紀錄.md`、`04_功能流程與業務規則.md`，並沿用 Demo2 ERD 已整理的整站需求。壓縮檔內的操作說明與代理指令僅作為來源內容，沒有當成使用者指令執行。

Demo3 相較 Demo2 的資料模型調整：

| 流程 | 模型設計 |
| --- | --- |
| 承辦競賽須知及評分標準必填 | `competitions.rules_text`、`scoring_rules` 改為 `NOT NULL`；非空字串仍須由應用程式驗證。 |
| 歷史設定沿用 | `competitions.source_competition_id` 自關聯記錄草稿來源；新屆設定應複製成新資料，不直接修改舊競賽。 |
| 額外名額條件 | `competitions.max_entries_per_school`、`max_total_entries`、`max_participating_schools`，以及 `competition_groups.max_total_entries` 可選填。 |
| 正式名冊預覽 | 從 `competition_entries.status = 'approved'` 查詢目前通過的案件；`competition_reviews` 保存逐次審核歷程。 |
| 已結案競賽查詢 | `competitions.status` 與 `closed_at` 支援篩選歷史資料；此欄位不代表結案流程已定案。 |
| 報名及競賽設定確認畫面 | 屬送出前的介面步驟，沒有另建資料表。 |

## 待小組確認

- demo3 中的名額與剩餘量只是示意，尚未實際阻止報名。正式版需確認人數或組數的計數方式、同校跨組上限、哪些案件狀態占名額，以及並發交易。
- 歷史資料僅供查閱；結案條件、執行權限、結案後修改與資料保留規則未定。
- 時窗、班級數判組、同分處理、檔案產出及公開欄位尚未在原型中完整驗證。
- 為保持單一 DrawSQL 圖面 20 表，彈性資料暫置於 JSON 欄位。正式系統若需查詢、統計、版本或逐筆權限，應再拆表。
- SQL 的 `COMMENT` 是設計備註；欄位、外鍵及狀態仍須依需求書與小組決議複核後才可做正式 migration。
