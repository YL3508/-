-- 臺中市英語教育資源中心 Demo3 ERD 草案（MySQL 8）
-- 依 demo3 原型及需求文件整理；後端目前只有 Laravel 預設 migration，這不是已實作的資料庫。
-- 沿用 Demo2 的 20 表基底，增補 Demo3 競賽設定、歷史沿用、名額及已結案查詢。
-- JSON 欄位為圖面草案折衷，正式實作前須確認資料粒度。
-- 範圍：REQ-011–012、014–026、029–035、037–059、060（需求書 PDF 第 2–6 頁）。

CREATE TABLE schools (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  school_code VARCHAR(32) NOT NULL UNIQUE,
  name_zh VARCHAR(200) NOT NULL,
  education_stage VARCHAR(40) NOT NULL,
  organizer_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  class_count_year SMALLINT UNSIGNED NULL,
  class_count_json JSON NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) COMMENT='學校基本資料及承辦資格。班級數由管理員匯入，供競賽組別判定；班級數資料粒度仍待確認。';

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  school_id BIGINT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NULL,
  auth_provider VARCHAR(30) NOT NULL,
  provider_subject VARCHAR(255) NULL,
  password_hash VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_users_provider (auth_provider, provider_subject)
) COMMENT='使用者帳號與所屬學校。學校人員使用教育局 Open ID；無 Open ID 的指定人員保留帳密登入路徑。';

CREATE TABLE role_grants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  school_id BIGINT UNSIGNED NULL,
  role_code VARCHAR(40) NOT NULL,
  granted_by_user_id BIGINT UNSIGNED NULL,
  granted_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  KEY ix_role_grants_user (user_id),
  KEY ix_role_grants_school (school_id)
) COMMENT='個別人員的角色授權紀錄。管理員先指定承辦學校，再逐一授權該校人員；撤權時間保留供稽核。';

CREATE TABLE contents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  content_type VARCHAR(40) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  category VARCHAR(100) NULL,
  title_zh VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NULL,
  body_zh LONGTEXT NULL,
  body_en LONGTEXT NULL,
  keywords VARCHAR(500) NULL,
  extra_json JSON NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  publish_from DATETIME NULL,
  publish_until DATETIME NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  KEY ix_contents_public (content_type, status, publish_from, publish_until)
) COMMENT='公開網站內容草案，涵蓋最新消息、輪播、下載、FAQ、好站連結、中心成員及人才資料；以類型區分，公開欄位須再核對。';

CREATE TABLE content_attachments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  content_id BIGINT UNSIGNED NOT NULL,
  attachment_type VARCHAR(20) NOT NULL,
  label_zh VARCHAR(255) NULL,
  label_en VARCHAR(255) NULL,
  file_path VARCHAR(500) NULL,
  external_url VARCHAR(1000) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  KEY ix_content_attachments_content (content_id)
) COMMENT='公開內容所附的圖片、檔案與外部連結；同一則內容可有多筆附件並設定顯示順序。';

CREATE TABLE surveys (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NULL,
  description_zh TEXT NULL,
  opens_at DATETIME NOT NULL,
  closes_at DATETIME NOT NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL
) COMMENT='管理員建立的調查表，記錄填報主題與開放期間；可填學校另由調查回覆表指定。';

CREATE TABLE survey_questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  survey_id BIGINT UNSIGNED NOT NULL,
  prompt_zh TEXT NOT NULL,
  prompt_en TEXT NULL,
  answer_type VARCHAR(30) NOT NULL,
  options_json JSON NULL,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT UNSIGNED NOT NULL,
  KEY ix_survey_questions_survey (survey_id)
) COMMENT='調查表題目及題型、選項、必填與排序設定；題型與統計方式仍待確認。';

CREATE TABLE survey_responses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  survey_id BIGINT UNSIGNED NOT NULL,
  school_id BIGINT UNSIGNED NOT NULL,
  submitted_by_user_id BIGINT UNSIGNED NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'assigned',
  answers_json JSON NULL,
  submitted_at DATETIME NULL,
  UNIQUE KEY uq_survey_school (survey_id, school_id)
) COMMENT='每校受指定的調查填答紀錄；未填、已送出狀態與答案集中於此，一校多人填答規則待確認。';

CREATE TABLE resources (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  resource_type VARCHAR(30) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100) NULL,
  owner_school_id BIGINT UNSIGNED NULL,
  uploaded_by_user_id BIGINT UNSIGNED NOT NULL,
  title_zh VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NULL,
  description_zh TEXT NULL,
  description_en TEXT NULL,
  keywords VARCHAR(500) NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  visibility_status VARCHAR(30) NOT NULL DEFAULT 'private',
  created_at DATETIME NOT NULL,
  KEY ix_resources_type_category (resource_type, category)
) COMMENT='教學資源與成果照片共用上傳流程，保留資料類型、分類、學校與上傳者；公開時點及審核規則待確認。';

CREATE TABLE competitions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organizer_school_id BIGINT UNSIGNED NOT NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  source_competition_id BIGINT UNSIGNED NULL,
  title_zh VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NULL,
  event_at DATETIME NOT NULL,
  venue VARCHAR(255) NULL,
  rules_text TEXT NOT NULL,
  scoring_rules TEXT NOT NULL,
  max_entries_per_school INT UNSIGNED NULL,
  max_total_entries INT UNSIGNED NULL,
  max_participating_schools INT UNSIGNED NULL,
  registration_opens_at DATETIME NOT NULL,
  registration_closes_at DATETIME NOT NULL,
  correction_opens_at DATETIME NULL,
  correction_closes_at DATETIME NULL,
  upload_opens_at DATETIME NULL,
  upload_closes_at DATETIME NULL,
  registration_fields_json JSON NULL,
  teacher_limits_json JSON NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  closed_at DATETIME NULL,
  created_at DATETIME NOT NULL
) COMMENT='承辦學校競賽與歷史競賽。須知、評分標準為必填；額外名額上限可不設。歷史設定可複製到新草稿；結案條件尚待確認。';

CREATE TABLE competition_groups (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  competition_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  min_class_count INT UNSIGNED NULL,
  max_class_count INT UNSIGNED NULL,
  max_entries_per_school INT UNSIGNED NULL,
  max_total_entries INT UNSIGNED NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  KEY ix_competition_groups_competition (competition_id)
) COMMENT='競賽組別及本組名額上限。班級數區間供系統判組；上限計數、邊界與缺漏資料處理待確認。';

CREATE TABLE competition_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  competition_id BIGINT UNSIGNED NOT NULL,
  competition_group_id BIGINT UNSIGNED NOT NULL,
  school_id BIGINT UNSIGNED NOT NULL,
  submitted_by_user_id BIGINT UNSIGNED NOT NULL,
  participant_name VARCHAR(150) NOT NULL,
  participants_json JSON NULL,
  music_title VARCHAR(255) NULL,
  expected_duration_seconds INT UNSIGNED NULL,
  teacher_data_json JSON NULL,
  special_requests_json JSON NULL,
  extra_answers_json JSON NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  submitted_at DATETIME NULL,
  updated_at DATETIME NOT NULL,
  KEY ix_entries_competition_status (competition_id, status),
  KEY ix_entries_school (school_id)
) COMMENT='每位參賽者或每組隊伍的一筆報名草案。正式名冊由目前審核通過的案件即時篩選，不另存快照；人數及團隊粒度待確認。';

CREATE TABLE competition_entry_files (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entry_id BIGINT UNSIGNED NOT NULL,
  uploaded_by_user_id BIGINT UNSIGNED NOT NULL,
  file_kind VARCHAR(40) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at DATETIME NOT NULL,
  KEY ix_entry_files_entry (entry_id)
) COMMENT='競賽報名、補件及純上傳時窗所附檔案；每次上傳保留上傳者與時間供歷程追查。';

CREATE TABLE competition_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entry_id BIGINT UNSIGNED NOT NULL,
  reviewer_user_id BIGINT UNSIGNED NOT NULL,
  decision VARCHAR(30) NOT NULL,
  review_comment TEXT NULL,
  reviewed_at DATETIME NOT NULL,
  KEY ix_reviews_entry_time (entry_id, reviewed_at)
) COMMENT='承辦人員對報名案件的逐次審核紀錄，保存通過或需補件結果及意見；補件後回待審。';

CREATE TABLE competition_results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  entry_id BIGINT UNSIGNED NOT NULL UNIQUE,
  draw_order INT UNSIGNED NULL,
  judge_scores_json JSON NULL,
  rank_sum DECIMAL(8,2) NULL,
  award_rank VARCHAR(100) NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at DATETIME NULL
) COMMENT='報名案件的抽籤場序、評審成績與獎項發布資料；各評審計分粒度、同分與重抽規則待確認。';

CREATE TABLE plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NULL,
  opens_at DATETIME NOT NULL,
  closes_at DATETIME NOT NULL,
  form_fields_json JSON NULL,
  public_fields_json JSON NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL
) COMMENT='管理員開立的計畫專案，設定填報期間、欄位及可公開內容；實際公開時點待確認。';

CREATE TABLE plan_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_id BIGINT UNSIGNED NOT NULL,
  school_id BIGINT UNSIGNED NOT NULL,
  submitted_by_user_id BIGINT UNSIGNED NOT NULL,
  form_data_json JSON NULL,
  budget_items_json JSON NULL,
  budget_total DECIMAL(14,2) NULL,
  stage_one_result VARCHAR(30) NULL,
  stage_one_comment TEXT NULL,
  stage_one_reviewer_id BIGINT UNSIGNED NULL,
  stage_one_reviewed_at DATETIME NULL,
  stage_two_result VARCHAR(30) NULL,
  stage_two_comment TEXT NULL,
  stage_two_reviewer_id BIGINT UNSIGNED NULL,
  stage_two_reviewed_at DATETIME NULL,
  submitted_at DATETIME NULL,
  UNIQUE KEY uq_plan_school (plan_id, school_id)
) COMMENT='各校的計畫資料與經費概算，並記錄管理員第一、第二階段審查結果及意見；修正流程待確認。';

CREATE TABLE camp_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title_zh VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NULL,
  camp_type VARCHAR(60) NULL,
  description_zh TEXT NULL,
  location VARCHAR(255) NULL,
  fee_description VARCHAR(120) NULL,
  precautions TEXT NULL,
  registration_opens_at DATETIME NOT NULL,
  registration_closes_at DATETIME NOT NULL,
  extra_fields_json JSON NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL
) COMMENT='免登入報名的營隊活動基本資訊、報名期間與額外調查欄位；一項活動可有多個場次。';

CREATE TABLE camp_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  camp_event_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  regular_capacity INT UNSIGNED NOT NULL,
  waiting_capacity INT UNSIGNED NOT NULL DEFAULT 0,
  registration_opens_at DATETIME NULL,
  registration_closes_at DATETIME NULL,
  KEY ix_camp_sessions_event (camp_event_id)
) COMMENT='營隊梯次與活動日期、正取及備取名額；報名時須依場次檢查期限與剩餘名額。';

CREATE TABLE camp_registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  camp_session_id BIGINT UNSIGNED NOT NULL,
  school_id BIGINT UNSIGNED NOT NULL,
  student_identifier VARCHAR(80) NOT NULL,
  child_name VARCHAR(120) NOT NULL,
  grade VARCHAR(40) NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(40) NOT NULL,
  extra_answers_json JSON NULL,
  admission_status VARCHAR(30) NOT NULL,
  idempotency_token VARCHAR(100) NOT NULL UNIQUE,
  registered_at DATETIME NOT NULL,
  UNIQUE KEY uq_camp_student_session (camp_session_id, school_id, student_identifier)
) COMMENT='訪客填寫的單一場次報名紀錄，保存學生、聯絡人與正備取狀態；重複判定及活動後刪除規則待確認。';

ALTER TABLE users ADD CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE role_grants ADD CONSTRAINT fk_role_grants_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE role_grants ADD CONSTRAINT fk_role_grants_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE role_grants ADD CONSTRAINT fk_role_grants_granter FOREIGN KEY (granted_by_user_id) REFERENCES users(id);
ALTER TABLE contents ADD CONSTRAINT fk_contents_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id);
ALTER TABLE content_attachments ADD CONSTRAINT fk_content_attachments_content FOREIGN KEY (content_id) REFERENCES contents(id);
ALTER TABLE surveys ADD CONSTRAINT fk_surveys_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id);
ALTER TABLE survey_questions ADD CONSTRAINT fk_survey_questions_survey FOREIGN KEY (survey_id) REFERENCES surveys(id);
ALTER TABLE survey_responses ADD CONSTRAINT fk_survey_responses_survey FOREIGN KEY (survey_id) REFERENCES surveys(id);
ALTER TABLE survey_responses ADD CONSTRAINT fk_survey_responses_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE survey_responses ADD CONSTRAINT fk_survey_responses_submitter FOREIGN KEY (submitted_by_user_id) REFERENCES users(id);
ALTER TABLE resources ADD CONSTRAINT fk_resources_school FOREIGN KEY (owner_school_id) REFERENCES schools(id);
ALTER TABLE resources ADD CONSTRAINT fk_resources_uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id);
ALTER TABLE competitions ADD CONSTRAINT fk_competitions_school FOREIGN KEY (organizer_school_id) REFERENCES schools(id);
ALTER TABLE competitions ADD CONSTRAINT fk_competitions_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id);
ALTER TABLE competitions ADD CONSTRAINT fk_competitions_source FOREIGN KEY (source_competition_id) REFERENCES competitions(id);
ALTER TABLE competition_groups ADD CONSTRAINT fk_competition_groups_competition FOREIGN KEY (competition_id) REFERENCES competitions(id);
ALTER TABLE competition_entries ADD CONSTRAINT fk_entries_competition FOREIGN KEY (competition_id) REFERENCES competitions(id);
ALTER TABLE competition_entries ADD CONSTRAINT fk_entries_group FOREIGN KEY (competition_group_id) REFERENCES competition_groups(id);
ALTER TABLE competition_entries ADD CONSTRAINT fk_entries_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE competition_entries ADD CONSTRAINT fk_entries_submitter FOREIGN KEY (submitted_by_user_id) REFERENCES users(id);
ALTER TABLE competition_entry_files ADD CONSTRAINT fk_entry_files_entry FOREIGN KEY (entry_id) REFERENCES competition_entries(id);
ALTER TABLE competition_entry_files ADD CONSTRAINT fk_entry_files_uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id);
ALTER TABLE competition_reviews ADD CONSTRAINT fk_reviews_entry FOREIGN KEY (entry_id) REFERENCES competition_entries(id);
ALTER TABLE competition_reviews ADD CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES users(id);
ALTER TABLE competition_results ADD CONSTRAINT fk_results_entry FOREIGN KEY (entry_id) REFERENCES competition_entries(id);
ALTER TABLE plans ADD CONSTRAINT fk_plans_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id);
ALTER TABLE plan_submissions ADD CONSTRAINT fk_plan_submissions_plan FOREIGN KEY (plan_id) REFERENCES plans(id);
ALTER TABLE plan_submissions ADD CONSTRAINT fk_plan_submissions_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE plan_submissions ADD CONSTRAINT fk_plan_submissions_submitter FOREIGN KEY (submitted_by_user_id) REFERENCES users(id);
ALTER TABLE plan_submissions ADD CONSTRAINT fk_plan_stage_one_reviewer FOREIGN KEY (stage_one_reviewer_id) REFERENCES users(id);
ALTER TABLE plan_submissions ADD CONSTRAINT fk_plan_stage_two_reviewer FOREIGN KEY (stage_two_reviewer_id) REFERENCES users(id);
ALTER TABLE camp_events ADD CONSTRAINT fk_camp_events_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id);
ALTER TABLE camp_sessions ADD CONSTRAINT fk_camp_sessions_event FOREIGN KEY (camp_event_id) REFERENCES camp_events(id);
ALTER TABLE camp_registrations ADD CONSTRAINT fk_camp_registrations_session FOREIGN KEY (camp_session_id) REFERENCES camp_sessions(id);
ALTER TABLE camp_registrations ADD CONSTRAINT fk_camp_registrations_school FOREIGN KEY (school_id) REFERENCES schools(id);
