-- Fix Strong Foundations: 
-- 1. Remove the programme trophy card for Strong Foundations from achievement_cards
-- 2. Ensure platinum album cards exist for JJ in Un-Tunes

-- Remove Strong Foundations programme trophy from PB hub
DELETE FROM achievement_cards 
WHERE user_id = '3a61bd9e-785b-4512-abab-e61b87496c54'
  AND card_type = 'programme_trophy'
  AND programme_name = 'Strong Foundations';

-- Ensure both albums have platinum cards for JJ (idempotent — skip if exists)
INSERT INTO un_tunes_user_cards (user_id, album_id, card_type, rarity, edition_number, is_opened, opened_at, created_at)
SELECT 
  '3a61bd9e-785b-4512-abab-e61b87496c54',
  a.id,
  'album',
  'platinum',
  COALESCE((SELECT MAX(edition_number) + 1 FROM un_tunes_user_cards WHERE album_id = a.id AND rarity = 'platinum'), 1),
  true,
  NOW(),
  NOW()
FROM un_tunes_albums a
WHERE NOT EXISTS (
  SELECT 1 FROM un_tunes_user_cards 
  WHERE user_id = '3a61bd9e-785b-4512-abab-e61b87496c54' 
    AND album_id = a.id 
    AND rarity = 'platinum'
);
