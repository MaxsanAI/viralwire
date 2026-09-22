CREATE TABLE IF NOT EXISTS stories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
slug TEXT NOT NULL UNIQUE,
title TEXT NOT NULL,
excerpt TEXT NOT NULL DEFAULT '',
content TEXT NOT NULL DEFAULT '',
category TEXT NOT NULL DEFAULT 'Viral',
tags TEXT NOT NULL DEFAULT '',
cover_image TEXT NOT NULL DEFAULT '',
x_post TEXT NOT NULL DEFAULT '',
status TEXT NOT NULL DEFAULT 'draft',
published_at TEXT NOT NULL,
views INTEGER NOT NULL DEFAULT 0,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stories_status_date ON stories(status,published_at);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_views ON stories(views DESC);

CREATE TABLE IF NOT EXISTS story_translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  x_post TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(story_id,language),
  UNIQUE(language,slug),
  FOREIGN KEY(story_id) REFERENCES stories(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_story_translations_story ON story_translations(story_id);
CREATE INDEX IF NOT EXISTS idx_story_translations_language_status ON story_translations(language,status);
