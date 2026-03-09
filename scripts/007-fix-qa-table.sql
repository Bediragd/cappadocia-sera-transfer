-- qa_questions tablosu eski şemayla oluşturulduysa eksik sütunları ekle

DO $$
BEGIN
  -- rating kolonu yoksa ekle
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'qa_questions'
      AND column_name = 'rating'
  ) THEN
    ALTER TABLE qa_questions
      ADD COLUMN rating INTEGER CHECK (rating BETWEEN 1 AND 5);
  END IF;

  -- answered_at kolonu yoksa ekle
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'qa_questions'
      AND column_name = 'answered_at'
  ) THEN
    ALTER TABLE qa_questions
      ADD COLUMN answered_at TIMESTAMPTZ;
  END IF;

  -- is_active kolonu yoksa ekle
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'qa_questions'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE qa_questions
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END
$$;

