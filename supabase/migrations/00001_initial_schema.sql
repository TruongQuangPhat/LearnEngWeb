-- ============================================================
-- LearEngWeb - Phase 2: Complete Database Schema
-- Migration: 00001_initial_schema
-- 
-- Execution order respects FK dependencies.
-- Run this in Supabase SQL Editor or via `supabase db push`.
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUID generation
CREATE EXTENSION IF NOT EXISTS vector;            -- pgvector for RAG embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;           -- Trigram fuzzy search for vocabulary
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;  -- Auto-update updated_at


-- ============================================================
-- 2. CUSTOM TYPES (ENUMS)
-- ============================================================

-- Proficiency / CEFR levels
CREATE TYPE proficiency_level AS ENUM (
  'beginner',            -- A1
  'elementary',          -- A2
  'intermediate',        -- B1
  'upper_intermediate',  -- B2
  'advanced',            -- C1
  'mastery'              -- C2
);

-- Supported exam types
CREATE TYPE exam_type AS ENUM (
  'ielts',
  'toeic',
  'vstep',
  'general'
);

-- Parts of speech
CREATE TYPE part_of_speech AS ENUM (
  'noun', 'verb', 'adjective', 'adverb',
  'pronoun', 'preposition', 'conjunction',
  'interjection', 'determiner', 'other'
);

-- Mock test question types
CREATE TYPE question_type AS ENUM (
  'multiple_choice',
  'fill_in_blank',
  'true_false',
  'matching',
  'ordering',
  'short_answer',
  'essay',
  'listening_mcq',
  'reading_mcq'
);


-- ============================================================
-- 3. USER PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username              TEXT UNIQUE,
  display_name          TEXT,
  avatar_url            TEXT,
  bio                   TEXT,
  native_language       TEXT DEFAULT 'vi',                -- ISO 639-1 code
  target_level          proficiency_level DEFAULT 'beginner',
  current_level         proficiency_level DEFAULT 'beginner',
  target_exam           exam_type DEFAULT 'general',
  timezone              TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_profiles_username ON public.profiles(username);

-- Auto-update updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Auto-create profile on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 4. USER PROGRESS (streaks, EXP, words learned)
-- ============================================================

CREATE TABLE public.user_progress (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Streak tracking
  current_streak            INTEGER DEFAULT 0 NOT NULL,
  longest_streak            INTEGER DEFAULT 0 NOT NULL,
  last_activity_date        DATE,

  -- Cumulative stats
  total_exp                 INTEGER DEFAULT 0 NOT NULL,
  total_words_learned       INTEGER DEFAULT 0 NOT NULL,
  total_reviews             INTEGER DEFAULT 0 NOT NULL,
  total_study_time_minutes  INTEGER DEFAULT 0 NOT NULL,

  -- Gamification level
  current_level             INTEGER DEFAULT 1 NOT NULL,
  exp_to_next_level         INTEGER DEFAULT 100 NOT NULL,

  -- Best exam scores
  best_ielts_score          NUMERIC(3,1),    -- e.g. 7.5
  best_toeic_score          INTEGER,         -- e.g. 850
  best_vstep_score          NUMERIC(3,1),

  created_at                TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at                TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_progress_exp ON public.user_progress(total_exp DESC);
CREATE INDEX idx_user_progress_streak ON public.user_progress(current_streak DESC);

CREATE TRIGGER handle_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Auto-create user_progress when a profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_progress
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_progress();

-- RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public progress visible for leaderboards"
  ON public.user_progress FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- 5. USER DAILY STATS (granular daily metrics for Dashboard)
-- ============================================================

CREATE TABLE public.user_daily_stats (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stat_date             DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Daily totals
  exp_earned            INTEGER DEFAULT 0 NOT NULL,
  words_reviewed        INTEGER DEFAULT 0 NOT NULL,
  words_learned         INTEGER DEFAULT 0 NOT NULL,
  study_time_minutes    INTEGER DEFAULT 0 NOT NULL,
  reviews_completed     INTEGER DEFAULT 0 NOT NULL,
  correct_answers       INTEGER DEFAULT 0 NOT NULL,
  total_answers         INTEGER DEFAULT 0 NOT NULL,

  -- Skill-specific time (minutes)
  listening_time        INTEGER DEFAULT 0,
  speaking_time         INTEGER DEFAULT 0,
  reading_time          INTEGER DEFAULT 0,
  writing_time          INTEGER DEFAULT 0,
  grammar_time          INTEGER DEFAULT 0,
  vocabulary_time       INTEGER DEFAULT 0,

  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- One row per user per day
CREATE UNIQUE INDEX idx_user_daily_stats_unique
  ON public.user_daily_stats(user_id, stat_date);

CREATE INDEX idx_user_daily_stats_date
  ON public.user_daily_stats(user_id, stat_date DESC);

-- RLS
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily stats"
  ON public.user_daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
  ON public.user_daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
  ON public.user_daily_stats FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- 6. VOCABULARY DECKS
-- ============================================================

CREATE TABLE public.vocabulary_decks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT,
  cover_image_url   TEXT,
  difficulty        proficiency_level DEFAULT 'beginner',
  category          TEXT,                    -- e.g. 'IELTS', 'Business', 'Daily Life'
  tags              TEXT[] DEFAULT '{}',
  is_public         BOOLEAN DEFAULT TRUE,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  word_count        INTEGER DEFAULT 0 NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_vocabulary_decks_category ON public.vocabulary_decks(category);
CREATE INDEX idx_vocabulary_decks_difficulty ON public.vocabulary_decks(difficulty);

CREATE TRIGGER handle_vocabulary_decks_updated_at
  BEFORE UPDATE ON public.vocabulary_decks
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.vocabulary_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public decks are viewable by everyone"
  ON public.vocabulary_decks FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Deck creators can manage their decks"
  ON public.vocabulary_decks FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);


-- ============================================================
-- 7. VOCABULARY ITEMS
-- ============================================================

CREATE TABLE public.vocabulary_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id             UUID REFERENCES public.vocabulary_decks(id) ON DELETE CASCADE,

  -- Core word data
  word                TEXT NOT NULL,
  phonetic_us         TEXT,                    -- e.g. /ˈwɜːrd/
  phonetic_uk         TEXT,
  audio_us_url        TEXT,
  audio_uk_url        TEXT,
  part_of_speech      part_of_speech DEFAULT 'other',

  -- Definitions & usage
  definition          TEXT NOT NULL,
  definition_vi       TEXT,                    -- Vietnamese translation
  example_sentence    TEXT,
  example_sentence_vi TEXT,
  synonyms            TEXT[] DEFAULT '{}',
  antonyms            TEXT[] DEFAULT '{}',
  collocations        TEXT[] DEFAULT '{}',
  word_family         TEXT[] DEFAULT '{}',

  -- Metadata
  difficulty          proficiency_level DEFAULT 'beginner',
  frequency_rank      INTEGER,
  tags                TEXT[] DEFAULT '{}',
  image_url           TEXT,

  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_vocabulary_items_word ON public.vocabulary_items(word);
CREATE INDEX idx_vocabulary_items_deck ON public.vocabulary_items(deck_id);
CREATE INDEX idx_vocabulary_items_difficulty ON public.vocabulary_items(difficulty);

-- Trigram index for fuzzy / autocomplete search
CREATE INDEX idx_vocabulary_items_word_trgm
  ON public.vocabulary_items USING gin (word gin_trgm_ops);

CREATE TRIGGER handle_vocabulary_items_updated_at
  BEFORE UPDATE ON public.vocabulary_items
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vocabulary items in public decks are viewable"
  ON public.vocabulary_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vocabulary_decks
      WHERE vocabulary_decks.id = vocabulary_items.deck_id
        AND vocabulary_decks.is_public = TRUE
    )
  );


-- ============================================================
-- 8. USER FLASHCARD REVIEWS (SM-2 SRS)
-- ============================================================

CREATE TABLE public.user_flashcard_reviews (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vocabulary_item_id    UUID NOT NULL REFERENCES public.vocabulary_items(id) ON DELETE CASCADE,

  -- SM-2 State
  repetitions           INTEGER DEFAULT 0 NOT NULL,       -- n: consecutive correct recalls
  easiness_factor       REAL DEFAULT 2.5 NOT NULL,        -- EF: min 1.3, starts 2.5
  interval_days         INTEGER DEFAULT 0 NOT NULL,       -- I: days until next review
  next_review_date      DATE DEFAULT CURRENT_DATE NOT NULL,
  last_quality          SMALLINT,                         -- Last response quality (0-5)

  -- Learning state
  status                TEXT DEFAULT 'new'
                        CHECK (status IN ('new', 'learning', 'review', 'mastered')),

  -- Review stats
  total_reviews         INTEGER DEFAULT 0 NOT NULL,
  correct_count         INTEGER DEFAULT 0 NOT NULL,
  incorrect_count       INTEGER DEFAULT 0 NOT NULL,
  last_reviewed_at      TIMESTAMPTZ,

  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(user_id, vocabulary_item_id)
);

-- Cards due for review today (critical performance query)
CREATE INDEX idx_flashcard_reviews_due
  ON public.user_flashcard_reviews(user_id, next_review_date)
  WHERE status != 'mastered';

CREATE INDEX idx_flashcard_reviews_status
  ON public.user_flashcard_reviews(user_id, status);

CREATE TRIGGER handle_flashcard_reviews_updated_at
  BEFORE UPDATE ON public.user_flashcard_reviews
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.user_flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own flashcard reviews"
  ON public.user_flashcard_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 9. SM-2 REVIEW PROCESSING FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_sm2_review(
  p_user_id UUID,
  p_vocabulary_item_id UUID,
  p_quality SMALLINT  -- 0-5 quality rating
)
RETURNS public.user_flashcard_reviews
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_review public.user_flashcard_reviews;
  v_new_ef REAL;
  v_new_interval INTEGER;
  v_new_reps INTEGER;
  v_new_status TEXT;
BEGIN
  -- Validate quality input
  IF p_quality < 0 OR p_quality > 5 THEN
    RAISE EXCEPTION 'Quality must be between 0 and 5, got %', p_quality;
  END IF;

  -- Get or create the review record
  INSERT INTO public.user_flashcard_reviews (user_id, vocabulary_item_id)
  VALUES (p_user_id, p_vocabulary_item_id)
  ON CONFLICT (user_id, vocabulary_item_id) DO NOTHING;

  SELECT * INTO v_review
  FROM public.user_flashcard_reviews
  WHERE user_id = p_user_id AND vocabulary_item_id = p_vocabulary_item_id;

  -- 1. Calculate new Easiness Factor
  --    EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  v_new_ef := v_review.easiness_factor
              + (0.1 - (5.0 - p_quality) * (0.08 + (5.0 - p_quality) * 0.02));
  IF v_new_ef < 1.3 THEN
    v_new_ef := 1.3;
  END IF;

  -- 2. Calculate repetitions and interval
  IF p_quality < 3 THEN
    -- Failed recall: reset
    v_new_reps := 0;
    v_new_interval := 1;
  ELSE
    -- Successful recall
    v_new_reps := v_review.repetitions + 1;

    IF v_new_reps = 1 THEN
      v_new_interval := 1;
    ELSIF v_new_reps = 2 THEN
      v_new_interval := 6;
    ELSE
      v_new_interval := CEIL(v_review.interval_days * v_new_ef)::INTEGER;
    END IF;
  END IF;

  -- 3. Determine card status
  IF v_new_reps = 0 THEN
    v_new_status := 'learning';
  ELSIF v_new_interval >= 21 THEN
    v_new_status := 'mastered';
  ELSE
    v_new_status := 'review';
  END IF;

  -- 4. Persist updated state
  UPDATE public.user_flashcard_reviews SET
    repetitions      = v_new_reps,
    easiness_factor  = v_new_ef,
    interval_days    = v_new_interval,
    next_review_date = CURRENT_DATE + v_new_interval,
    last_quality     = p_quality,
    status           = v_new_status,
    total_reviews    = total_reviews + 1,
    correct_count    = correct_count + CASE WHEN p_quality >= 3 THEN 1 ELSE 0 END,
    incorrect_count  = incorrect_count + CASE WHEN p_quality < 3 THEN 1 ELSE 0 END,
    last_reviewed_at = now()
  WHERE user_id = p_user_id AND vocabulary_item_id = p_vocabulary_item_id
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;


-- ============================================================
-- 10. MOCK TESTS (JSONB structures)
-- ============================================================

CREATE TABLE public.mock_tests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  description           TEXT,
  exam_type             exam_type NOT NULL,
  difficulty            proficiency_level DEFAULT 'intermediate',

  -- Flexible JSONB test structure
  -- {
  --   "sections": [{
  --     "name": "Listening",
  --     "time_limit_minutes": 30,
  --     "questions": [{
  --       "id": "q1", "type": "multiple_choice",
  --       "audio_url": "...", "question_text": "...",
  --       "options": ["A","B","C","D"],
  --       "correct_answer": "B", "points": 1, "explanation": "..."
  --     }]
  --   }]
  -- }
  test_structure        JSONB NOT NULL DEFAULT '{"sections": []}',

  total_questions       INTEGER DEFAULT 0 NOT NULL,
  total_points          INTEGER DEFAULT 0 NOT NULL,
  time_limit_minutes    INTEGER NOT NULL DEFAULT 60,
  is_published          BOOLEAN DEFAULT FALSE,
  tags                  TEXT[] DEFAULT '{}',
  created_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_mock_tests_structure ON public.mock_tests USING gin (test_structure);
CREATE INDEX idx_mock_tests_exam_type ON public.mock_tests(exam_type);
CREATE INDEX idx_mock_tests_published ON public.mock_tests(is_published) WHERE is_published = TRUE;

CREATE TRIGGER handle_mock_tests_updated_at
  BEFORE UPDATE ON public.mock_tests
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published tests are viewable by everyone"
  ON public.mock_tests FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Test creators can manage their tests"
  ON public.mock_tests FOR ALL
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);


-- ============================================================
-- 11. MOCK TEST ATTEMPTS
-- ============================================================

CREATE TABLE public.mock_test_attempts (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mock_test_id          UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,

  -- Attempt lifecycle
  status                TEXT DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at          TIMESTAMPTZ,
  time_spent_seconds    INTEGER DEFAULT 0,

  -- JSONB answers
  -- {
  --   "sections": [{
  --     "name": "Listening",
  --     "answers": [
  --       {"question_id":"q1","user_answer":"B","is_correct":true,"points_earned":1}
  --     ],
  --     "section_score": 1, "section_total": 2
  --   }]
  -- }
  user_answers          JSONB DEFAULT '{"sections": []}',

  -- Denormalized score summary
  total_score           INTEGER DEFAULT 0,
  total_possible        INTEGER DEFAULT 0,
  percentage            NUMERIC(5,2) DEFAULT 0,

  -- Band / exam scores
  band_score            NUMERIC(3,1),          -- e.g. 7.0
  section_scores        JSONB DEFAULT '{}',    -- {"listening": 7.5, "reading": 6.5}

  -- AI feedback (filled async by AI service in Phase 5+)
  ai_feedback           JSONB DEFAULT '{}',

  created_at            TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_mock_test_attempts_user ON public.mock_test_attempts(user_id, created_at DESC);
CREATE INDEX idx_mock_test_attempts_test ON public.mock_test_attempts(mock_test_id);
CREATE INDEX idx_mock_test_attempts_answers ON public.mock_test_attempts USING gin (user_answers);
CREATE INDEX idx_mock_test_attempts_status ON public.mock_test_attempts(user_id, status);

CREATE TRIGGER handle_mock_test_attempts_updated_at
  BEFORE UPDATE ON public.mock_test_attempts
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.mock_test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own test attempts"
  ON public.mock_test_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 12. GRAMMAR TOPICS
-- ============================================================

CREATE TABLE public.grammar_topics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  difficulty      proficiency_level DEFAULT 'beginner',
  category        TEXT,                    -- e.g. 'Tenses', 'Conditionals', 'Passive Voice'
  content_md      TEXT,                    -- Full markdown lesson content (source for chunking)
  tags            TEXT[] DEFAULT '{}',
  sort_order      INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_grammar_topics_slug ON public.grammar_topics(slug);
CREATE INDEX idx_grammar_topics_category ON public.grammar_topics(category);

CREATE TRIGGER handle_grammar_topics_updated_at
  BEFORE UPDATE ON public.grammar_topics
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.grammar_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published grammar topics are viewable"
  ON public.grammar_topics FOR SELECT
  USING (is_published = TRUE);


-- ============================================================
-- 13. GRAMMAR CHUNKS (pgvector embeddings for RAG)
-- ============================================================

CREATE TABLE public.grammar_chunks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id        UUID NOT NULL REFERENCES public.grammar_topics(id) ON DELETE CASCADE,
  chunk_text      TEXT NOT NULL,
  chunk_index     INTEGER NOT NULL,        -- Order within the topic
  token_count     INTEGER,
  metadata        JSONB DEFAULT '{}',      -- Section headers, etc.

  -- Vector embedding: 1536 dims (OpenAI text-embedding-3-small)
  embedding       vector(1536),

  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- HNSW index for fast approximate nearest neighbor search
CREATE INDEX idx_grammar_chunks_embedding
  ON public.grammar_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_grammar_chunks_topic
  ON public.grammar_chunks(topic_id, chunk_index);

-- RLS
ALTER TABLE public.grammar_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Grammar chunks are viewable by authenticated users"
  ON public.grammar_chunks FOR SELECT
  USING (auth.role() = 'authenticated');


-- ============================================================
-- 14. RAG SIMILARITY SEARCH FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_grammar_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  topic_id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    gc.id,
    gc.topic_id,
    gc.chunk_text,
    gc.chunk_index,
    gc.metadata,
    1 - (gc.embedding <=> query_embedding) AS similarity
  FROM public.grammar_chunks gc
  WHERE 1 - (gc.embedding <=> query_embedding) > match_threshold
  ORDER BY gc.embedding <=> query_embedding
  LIMIT match_count;
$$;


-- ============================================================
-- 15. LEARNING ROADMAPS
-- ============================================================

CREATE TABLE public.learning_roadmaps (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT,
  exam_type         exam_type NOT NULL,
  target_level      proficiency_level NOT NULL,
  estimated_weeks   INTEGER NOT NULL DEFAULT 12,
  cover_image_url   TEXT,
  graph_layout      JSONB DEFAULT '{}',    -- Node positions, edges for visual roadmap
  is_published      BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_learning_roadmaps_exam ON public.learning_roadmaps(exam_type);

CREATE TRIGGER handle_learning_roadmaps_updated_at
  BEFORE UPDATE ON public.learning_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published roadmaps are viewable"
  ON public.learning_roadmaps FOR SELECT
  USING (is_published = TRUE);


-- ============================================================
-- 16. ROADMAP NODES
-- ============================================================

CREATE TABLE public.roadmap_nodes (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id              UUID NOT NULL REFERENCES public.learning_roadmaps(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  node_type               TEXT NOT NULL
                          CHECK (node_type IN ('lesson', 'quiz', 'milestone', 'review')),
  content_type            TEXT
                          CHECK (content_type IN ('grammar', 'vocabulary', 'mock_test', 'listening', 'speaking', 'writing')),
  content_id              UUID,            -- FK to relevant content table (polymorphic)
  sort_order              INTEGER DEFAULT 0,
  prerequisite_node_ids   UUID[] DEFAULT '{}',
  exp_reward              INTEGER DEFAULT 10,
  created_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_roadmap_nodes_roadmap ON public.roadmap_nodes(roadmap_id, sort_order);

-- RLS
ALTER TABLE public.roadmap_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roadmap nodes are viewable via parent roadmap"
  ON public.roadmap_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_roadmaps
      WHERE learning_roadmaps.id = roadmap_nodes.roadmap_id
        AND learning_roadmaps.is_published = TRUE
    )
  );


-- ============================================================
-- 17. USER ROADMAP PROGRESS
-- ============================================================

CREATE TABLE public.user_roadmap_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id      UUID NOT NULL REFERENCES public.learning_roadmaps(id) ON DELETE CASCADE,
  node_id         UUID NOT NULL REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,

  status          TEXT DEFAULT 'locked'
                  CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  score           NUMERIC(5,2),
  completed_at    TIMESTAMPTZ,
  attempts        INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(user_id, node_id)
);

CREATE INDEX idx_user_roadmap_progress_user
  ON public.user_roadmap_progress(user_id, roadmap_id);

CREATE TRIGGER handle_user_roadmap_progress_updated_at
  BEFORE UPDATE ON public.user_roadmap_progress
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- RLS
ALTER TABLE public.user_roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own roadmap progress"
  ON public.user_roadmap_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- DONE. Phase 2 schema complete.
-- ============================================================
