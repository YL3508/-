@AGENTS.md

# 專案說明（backend）

臺中市英語教育資源中心網站的 **純 API 後端**，學生專案。回覆一律使用繁體中文。

## 定位與邊界

- 本目錄只提供 JSON API，**沒有任何 Blade 頁面、Vite 或 Tailwind 資產**。AGENTS.md 中提到 `npm run build`、`npm run dev`、Vite manifest 的段落不適用於本專案，請忽略。
- 前端是獨立的 Vue 3 SPA，位於 `../frontend`，透過 HTTP 呼叫本後端。
- 例外回應已在 `bootstrap/app.php` 設定為 `api/*` 一律回 JSON。

## 技術棧

- Laravel 13、PHP 8.3
- 驗證：Laravel Sanctum
- 測試：Pest 4
- 格式化：Laravel Pint

## 開發慣例

- API 路由放在 `routes/api.php`，`routes/web.php` 只保留最小回應。
- 回傳資料使用 Eloquent API Resource，不直接回傳 Model。
- 驗證邏輯使用 Form Request。
- 新增 Model 時一併建立 Factory 與 Migration。
- 提交前執行 `vendor/bin/pint --dirty` 與相關 Pest 測試。

## 常用指令

```sh
composer run setup        # 初次安裝
php artisan serve         # 啟動開發伺服器
php artisan test --compact
vendor/bin/pint --dirty
```
