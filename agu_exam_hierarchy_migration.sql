-- AGULIBRARY Examination Hierarchy + Per-Examination Country Prices
-- Safe migration: adds only the new examination hierarchy fields and
-- connects country prices to a specific examination.

ALTER TABLE public.agu_examinations
  ADD COLUMN IF NOT EXISTS examination_board text,
  ADD COLUMN IF NOT EXISTS examination_type text;

-- The live price table already requires examination_id in some AGULIBRARY
-- installations. Add it only when it is missing.
ALTER TABLE public.agu_exam_country_prices
  ADD COLUMN IF NOT EXISTS examination_id uuid;

-- Add the examination foreign key only if it is not already present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.agu_exam_country_prices'::regclass
      AND conname = 'agu_exam_country_prices_examination_id_fkey'
  ) THEN
    ALTER TABLE public.agu_exam_country_prices
      ADD CONSTRAINT agu_exam_country_prices_examination_id_fkey
      FOREIGN KEY (examination_id)
      REFERENCES public.agu_examinations(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Country prices are per examination, so the old country-only uniqueness
-- must not prevent Nigeria (or another country) from having a different
-- price for another examination.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute a
      ON a.attrelid = con.conrelid
     AND a.attnum = ANY(con.conkey)
    WHERE con.conrelid = 'public.agu_exam_country_prices'::regclass
      AND con.contype = 'u'
    GROUP BY con.oid, con.conname
    HAVING array_agg(a.attname ORDER BY a.attnum) = ARRAY['country_code']::name[]
  LOOP
    EXECUTE format(
      'ALTER TABLE public.agu_exam_country_prices DROP CONSTRAINT IF EXISTS %I',
      c.conname
    );
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS agu_exam_country_prices_exam_country_uq
  ON public.agu_exam_country_prices (examination_id, country_code)
  WHERE examination_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS agu_exam_country_prices_examination_id_idx
  ON public.agu_exam_country_prices (examination_id);

CREATE INDEX IF NOT EXISTS agu_examinations_hierarchy_idx
  ON public.agu_examinations (education_level, examination_board, examination_type, class_level, subject);

-- NOTE:
-- If your existing price table contains legacy rows with NULL examination_id,
-- leave them until you assign each row to an examination. New AGULIBRARY
-- admin price records will always include examination_id.
