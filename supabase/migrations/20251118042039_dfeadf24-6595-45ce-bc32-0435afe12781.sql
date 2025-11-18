-- Fix security issue: Set search_path for extract_hashtags function
CREATE OR REPLACE FUNCTION public.extract_hashtags(content TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hashtag_array TEXT[];
BEGIN
  SELECT array_agg(DISTINCT lower(substring(word from 2)))
  INTO hashtag_array
  FROM regexp_split_to_table(content, '\s+') AS word
  WHERE word ~ '^#[a-zA-Z0-9_]+$';
  
  RETURN COALESCE(hashtag_array, ARRAY[]::TEXT[]);
END;
$$;