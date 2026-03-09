-- Soru & Cevap (Q&A) tablosu
CREATE TABLE IF NOT EXISTS qa_questions (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_qa_questions_created_at ON qa_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_questions_active ON qa_questions(is_active);

