# Demo2 資料庫關聯圖草案

- [DrawSQL 可編輯圖面（已加入中文備註）](https://drawsql.app/teams/yl3508/diagrams/2)
- [最初圖面快照](https://drawsql.app/draw?t=1945f011-a4bf-42a9-b303-ae66966e2e63&view=1)
- [MySQL DDL](demo2-schema.sql)
- [圖面截圖](demo2-drawsql.png)
- [中文備註畫面](demo2-中文備註.png)

DrawSQL 匯入結果：20 張表、210 個欄位、35 條關聯。可編輯圖面中的 20 張表皆已加入中文備註並儲存；MySQL DDL 同步加入相同的 `COMMENT`。最初圖面快照是產出當下的固定版本，不含後續中文備註。

## 依據與範圍

依 `demo-review/v2-source/NCHU-11507-TaichungEERC-mandy-demo-v2/` 的獨立原型、`docs/project-planning/01_專題決策紀錄.md`、`02_帳號角色與權限規則.md`、`04_功能流程與業務規則.md`、`05_後續產出指引.md`，以及需求書 PDF 第 2–6 頁相關條款（REQ-011–012、014–026、029–035、037–060）整理。正式後端目前只有 Laravel 基礎 migration；本 SQL 是待團隊核對的資料模型，尚未執行遷移或驗收。

| 模組 | 主要資料表 |
| --- | --- |
| 學校、登入與授權 | `schools`、`users`、`role_grants` |
| 公開內容與附件 | `contents`、`content_attachments` |
| 指定學校調查 | `surveys`、`survey_questions`、`survey_responses` |
| 教學資源與成果照片 | `resources` |
| 競賽設定、報名、補件與成績 | `competitions`、`competition_groups`、`competition_entries`、`competition_entry_files`、`competition_reviews`、`competition_results` |
| 計畫與兩階段審查 | `plans`、`plan_submissions` |
| 營隊場次與免登入報名 | `camp_events`、`camp_sessions`、`camp_registrations` |

## 正式實作前須確認

DrawSQL 免登入畫布的 20 表限制使變動欄位暫以 JSON 表示，例如班級數、競賽自訂欄位與評審成績、問卷答案、經費細項及營隊額外欄位。這些欄位在正式資料庫可能需要拆表，尤其是需要篩選、統計、版本追蹤或逐筆授權的資料。

- 競賽一人／一組一筆報名、教師名額、三段時窗、同校／同人自審與同分處理仍待確認。
- 調查的一校多人填答與送出後修正、資源公開時點、計畫兩階段進入與修正流程仍待確認。
- 營隊重複報名識別、正備取併發、場次紀錄刪除與個資留存規則仍待確認。
- 網站瀏覽人數、熱門搜尋與系統稽核沒有在這份 20 表草案中獨立建表；正式設計須補上資料來源、統計口徑與保存方式。
- `contents` 暫容納消息、輪播、FAQ、好站連結、中心成員及人才資料；正式設計須依查詢、公開欄位與個資需求評估拆分。

此圖只表示資料關聯；權限判斷、期限、名額與刪除流程仍須由後端交易、驗證及測試實作。
