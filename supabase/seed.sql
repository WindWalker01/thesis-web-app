-- Seeds the genres table with the artwork classifier's class labels.
-- The id matches the classifier's label index so art_genres rows align with model output.
--
-- Note: genres.id is GENERATED ALWAYS AS IDENTITY, so OVERRIDING SYSTEM VALUE is
-- required to insert explicit ids. The ON CONFLICT clause keeps this script idempotent.

INSERT INTO public.genres (id, name)
OVERRIDING SYSTEM VALUE
VALUES
  (1,  'Anime'),
  (2,  'Manga'),
  (3,  'Cartoon'),
  (4,  'Semi-Realism'),
  (5,  'Realism'),
  (6,  'Hyperrealism'),
  (7,  'Abstract'),
  (8,  'Minimalist'),
  (9,  'Impressionism'),
  (10, 'Surrealism'),
  (11, 'Pop Art'),
  (12, 'Pixel Art'),
  (13, 'Low Poly'),
  (14, 'Vector Art'),
  (15, 'Line Art'),
  (16, 'Sketch Art'),
  (17, 'Flat Design'),
  (18, '3D Render'),
  (19, 'Isometric')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Keep the identity sequence ahead of the seeded ids so future inserts don't collide.
SELECT setval('public.genres_id_seq', (SELECT MAX(id) FROM public.genres));
