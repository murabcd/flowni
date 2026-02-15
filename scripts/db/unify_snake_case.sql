-- WARNING: Destructive migration for dev only.
-- Drops unused tables and converts camelCase columns to snake_case.

-- 1) Drop unused tables (safe list based on codebase scan)
drop table if exists "portal_status_mapping" cascade;
drop table if exists "portal_status" cascade;
drop table if exists "portal_feature_vote" cascade;
drop table if exists "portal_feature_status_change" cascade;
drop table if exists "portal_feature" cascade;
drop table if exists "portal" cascade;
drop table if exists "widget_item" cascade;
drop table if exists "widget" cascade;
drop table if exists "canny_import_job" cascade;
drop table if exists "canny_import" cascade;
drop table if exists "productboard_import_job" cascade;
drop table if exists "productboard_import" cascade;
drop table if exists "github_installation" cascade;
drop table if exists "intercom_installation" cascade;
drop table if exists "linear_installation" cascade;
drop table if exists "slack_installation" cascade;

-- 2) Normalize join table names to snake_case (lowercase)
do $$
begin
  if to_regclass('public."_ChangelogToChangelogTag"') is not null then
    execute 'alter table "public"."_ChangelogToChangelogTag" rename to "_changelog_to_changelog_tag"';
  end if;

  if to_regclass('public."_FeatureToInitiative"') is not null then
    execute 'alter table "public"."_FeatureToInitiative" rename to "_feature_to_initiative"';
  end if;

  if to_regclass('public."_FeatureToTag"') is not null then
    execute 'alter table "public"."_FeatureToTag" rename to "_feature_to_tag"';
  end if;

  if to_regclass('public."_FeedbackToTag"') is not null then
    execute 'alter table "public"."_FeedbackToTag" rename to "_feedback_to_tag"';
  end if;

  if to_regclass('public."_GroupToInitiative"') is not null then
    execute 'alter table "public"."_GroupToInitiative" rename to "_group_to_initiative"';
  end if;

  if to_regclass('public."_InitiativeToProduct"') is not null then
    execute 'alter table "public"."_InitiativeToProduct" rename to "_initiative_to_product"';
  end if;
end $$;

-- 3) Rename all camelCase columns to snake_case across public schema
do $$
declare r record;
declare new_name text;
begin
  for r in
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name ~ '[A-Z]'
  loop
    new_name := lower(regexp_replace(r.column_name, '([A-Z])', '_\1', 'g'));
    if new_name <> r.column_name then
      execute format(
        'alter table %I.%I rename column %I to %I',
        'public',
        r.table_name,
        r.column_name,
        new_name
      );
    end if;
  end loop;
end $$;
