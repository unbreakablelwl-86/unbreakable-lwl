-- ═══════════════════════════════════════════════════════════════
-- UN-TUNES: Dev Unlock + Auction/Trading RPCs + Token System
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- ══════════ PART 1: ADD PLATINUM RARITY ══════════
ALTER TABLE un_tunes_user_cards DROP CONSTRAINT IF EXISTS un_tunes_user_cards_rarity_check;
ALTER TABLE un_tunes_user_cards ADD CONSTRAINT un_tunes_user_cards_rarity_check
  CHECK (rarity IN ('standard', 'gold', 'diamond', 'platinum'));

-- Also allow 0.1 increments in auction tables
ALTER TABLE un_tunes_card_listings
  ALTER COLUMN starting_price TYPE NUMERIC(10,1) USING starting_price::NUMERIC(10,1),
  ALTER COLUMN buy_now_price TYPE NUMERIC(10,1) USING buy_now_price::NUMERIC(10,1),
  ALTER COLUMN current_bid TYPE NUMERIC(10,1) USING current_bid::NUMERIC(10,1);

ALTER TABLE un_tunes_bids
  ALTER COLUMN amount TYPE NUMERIC(10,1) USING amount::NUMERIC(10,1);

ALTER TABLE un_tunes_trades
  ALTER COLUMN tokens_offered TYPE NUMERIC(10,1) USING tokens_offered::NUMERIC(10,1);

ALTER TABLE un_tunes_price_history
  ALTER COLUMN sale_price TYPE NUMERIC(10,1) USING sale_price::NUMERIC(10,1);


-- ══════════ PART 2: DEV UNLOCK — 192 CARDS FOR JJ ══════════
DELETE FROM un_tunes_user_cards WHERE user_id = '3a61bd9e-785b-4512-abab-e61b87496c54';

-- Track cards: 42 tracks × 4 rarities = 168
INSERT INTO un_tunes_user_cards (user_id, track_id, album_id, card_type, rarity, edition_number, is_opened, opened_at, created_at)
VALUES
('3a61bd9e-785b-4512-abab-e61b87496c54', '393591f0-0ba1-4788-b378-36fe2d210595', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '393591f0-0ba1-4788-b378-36fe2d210595', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '393591f0-0ba1-4788-b378-36fe2d210595', NULL, 'track', 'diamond', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '393591f0-0ba1-4788-b378-36fe2d210595', NULL, 'track', 'platinum', 2, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '4a4bbea3-e99f-4e59-8f78-22280da1c404', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '4a4bbea3-e99f-4e59-8f78-22280da1c404', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '4a4bbea3-e99f-4e59-8f78-22280da1c404', NULL, 'track', 'diamond', 3, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '4a4bbea3-e99f-4e59-8f78-22280da1c404', NULL, 'track', 'platinum', 4, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '6d20a78a-3d75-483a-b466-b01f774c5e01', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '6d20a78a-3d75-483a-b466-b01f774c5e01', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '6d20a78a-3d75-483a-b466-b01f774c5e01', NULL, 'track', 'diamond', 5, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '6d20a78a-3d75-483a-b466-b01f774c5e01', NULL, 'track', 'platinum', 6, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e02df91-c8ff-46d6-be4c-e742c91793f7', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e02df91-c8ff-46d6-be4c-e742c91793f7', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e02df91-c8ff-46d6-be4c-e742c91793f7', NULL, 'track', 'diamond', 7, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e02df91-c8ff-46d6-be4c-e742c91793f7', NULL, 'track', 'platinum', 8, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c946ed0b-b55c-408d-8321-232b5dd23d47', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c946ed0b-b55c-408d-8321-232b5dd23d47', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c946ed0b-b55c-408d-8321-232b5dd23d47', NULL, 'track', 'diamond', 9, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c946ed0b-b55c-408d-8321-232b5dd23d47', NULL, 'track', 'platinum', 10, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a70e3555-0347-42ad-95b9-b7de72883f5d', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a70e3555-0347-42ad-95b9-b7de72883f5d', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a70e3555-0347-42ad-95b9-b7de72883f5d', NULL, 'track', 'diamond', 11, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a70e3555-0347-42ad-95b9-b7de72883f5d', NULL, 'track', 'platinum', 12, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '84e685f6-3c76-4d88-8407-95e600010b01', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '84e685f6-3c76-4d88-8407-95e600010b01', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '84e685f6-3c76-4d88-8407-95e600010b01', NULL, 'track', 'diamond', 13, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '84e685f6-3c76-4d88-8407-95e600010b01', NULL, 'track', 'platinum', 14, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '20035ba9-6dca-4d11-b3e2-20939d414cb7', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '20035ba9-6dca-4d11-b3e2-20939d414cb7', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '20035ba9-6dca-4d11-b3e2-20939d414cb7', NULL, 'track', 'diamond', 15, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '20035ba9-6dca-4d11-b3e2-20939d414cb7', NULL, 'track', 'platinum', 16, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a0f79f-4a7b-486c-a8aa-e7918af7c8fb', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a0f79f-4a7b-486c-a8aa-e7918af7c8fb', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a0f79f-4a7b-486c-a8aa-e7918af7c8fb', NULL, 'track', 'diamond', 17, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a0f79f-4a7b-486c-a8aa-e7918af7c8fb', NULL, 'track', 'platinum', 18, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '7d1821a5-1ceb-449b-bd9e-7703638a2778', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '7d1821a5-1ceb-449b-bd9e-7703638a2778', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '7d1821a5-1ceb-449b-bd9e-7703638a2778', NULL, 'track', 'diamond', 19, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '7d1821a5-1ceb-449b-bd9e-7703638a2778', NULL, 'track', 'platinum', 20, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'de197637-73ea-4db0-be48-4d616fab35b5', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'de197637-73ea-4db0-be48-4d616fab35b5', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'de197637-73ea-4db0-be48-4d616fab35b5', NULL, 'track', 'diamond', 21, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'de197637-73ea-4db0-be48-4d616fab35b5', NULL, 'track', 'platinum', 22, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e84e8df-6715-4efe-8d0b-3c64f82be15a', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e84e8df-6715-4efe-8d0b-3c64f82be15a', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e84e8df-6715-4efe-8d0b-3c64f82be15a', NULL, 'track', 'diamond', 23, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '9e84e8df-6715-4efe-8d0b-3c64f82be15a', NULL, 'track', 'platinum', 24, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '991968c5-ed8f-42ff-862a-20ecd6d4bf61', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '991968c5-ed8f-42ff-862a-20ecd6d4bf61', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '991968c5-ed8f-42ff-862a-20ecd6d4bf61', NULL, 'track', 'diamond', 25, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '991968c5-ed8f-42ff-862a-20ecd6d4bf61', NULL, 'track', 'platinum', 26, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '466f7fbc-e4ac-4056-8369-51300bdf8478', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '466f7fbc-e4ac-4056-8369-51300bdf8478', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '466f7fbc-e4ac-4056-8369-51300bdf8478', NULL, 'track', 'diamond', 27, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '466f7fbc-e4ac-4056-8369-51300bdf8478', NULL, 'track', 'platinum', 28, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c656db5b-0ecf-4138-978e-6779ccd81214', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c656db5b-0ecf-4138-978e-6779ccd81214', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c656db5b-0ecf-4138-978e-6779ccd81214', NULL, 'track', 'diamond', 29, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c656db5b-0ecf-4138-978e-6779ccd81214', NULL, 'track', 'platinum', 30, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ed89ac1c-7ca7-42b0-954c-e4372e28cede', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ed89ac1c-7ca7-42b0-954c-e4372e28cede', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ed89ac1c-7ca7-42b0-954c-e4372e28cede', NULL, 'track', 'diamond', 31, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ed89ac1c-7ca7-42b0-954c-e4372e28cede', NULL, 'track', 'platinum', 32, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '73a6c558-00fa-43a6-aee7-f71af7821009', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '73a6c558-00fa-43a6-aee7-f71af7821009', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '73a6c558-00fa-43a6-aee7-f71af7821009', NULL, 'track', 'diamond', 33, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '73a6c558-00fa-43a6-aee7-f71af7821009', NULL, 'track', 'platinum', 34, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e988e56e-5a20-45d0-af3b-a014494a5f4b', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e988e56e-5a20-45d0-af3b-a014494a5f4b', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e988e56e-5a20-45d0-af3b-a014494a5f4b', NULL, 'track', 'diamond', 35, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e988e56e-5a20-45d0-af3b-a014494a5f4b', NULL, 'track', 'platinum', 36, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'bb4c4e29-5433-4bf8-b939-c12206087397', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'bb4c4e29-5433-4bf8-b939-c12206087397', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'bb4c4e29-5433-4bf8-b939-c12206087397', NULL, 'track', 'diamond', 37, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'bb4c4e29-5433-4bf8-b939-c12206087397', NULL, 'track', 'platinum', 38, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '31630fac-9a32-4825-9057-02e7617ce177', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '31630fac-9a32-4825-9057-02e7617ce177', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '31630fac-9a32-4825-9057-02e7617ce177', NULL, 'track', 'diamond', 39, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '31630fac-9a32-4825-9057-02e7617ce177', NULL, 'track', 'platinum', 40, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '293688f0-5ed3-4cb1-b7eb-4949c754f1c3', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '293688f0-5ed3-4cb1-b7eb-4949c754f1c3', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '293688f0-5ed3-4cb1-b7eb-4949c754f1c3', NULL, 'track', 'diamond', 41, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '293688f0-5ed3-4cb1-b7eb-4949c754f1c3', NULL, 'track', 'platinum', 42, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a7f26c99-5236-4273-b8a2-60ddc33a982a', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a7f26c99-5236-4273-b8a2-60ddc33a982a', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a7f26c99-5236-4273-b8a2-60ddc33a982a', NULL, 'track', 'diamond', 43, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'a7f26c99-5236-4273-b8a2-60ddc33a982a', NULL, 'track', 'platinum', 44, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'cd0ef84e-062f-472b-90f3-f85e205a9233', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'cd0ef84e-062f-472b-90f3-f85e205a9233', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'cd0ef84e-062f-472b-90f3-f85e205a9233', NULL, 'track', 'diamond', 45, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'cd0ef84e-062f-472b-90f3-f85e205a9233', NULL, 'track', 'platinum', 46, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'd81035fb-e78b-4550-993b-8bb34b3790d8', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'd81035fb-e78b-4550-993b-8bb34b3790d8', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'd81035fb-e78b-4550-993b-8bb34b3790d8', NULL, 'track', 'diamond', 47, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'd81035fb-e78b-4550-993b-8bb34b3790d8', NULL, 'track', 'platinum', 48, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c03f9b-b788-4ad3-9b7d-a1ca30776b01', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c03f9b-b788-4ad3-9b7d-a1ca30776b01', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c03f9b-b788-4ad3-9b7d-a1ca30776b01', NULL, 'track', 'diamond', 49, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c03f9b-b788-4ad3-9b7d-a1ca30776b01', NULL, 'track', 'platinum', 50, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '77d06142-7ca5-4596-bf1f-ecb22cb5ea79', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '77d06142-7ca5-4596-bf1f-ecb22cb5ea79', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '77d06142-7ca5-4596-bf1f-ecb22cb5ea79', NULL, 'track', 'diamond', 51, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '77d06142-7ca5-4596-bf1f-ecb22cb5ea79', NULL, 'track', 'platinum', 52, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '54e9f13a-077a-4f50-8060-f6bca3a7cc43', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '54e9f13a-077a-4f50-8060-f6bca3a7cc43', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '54e9f13a-077a-4f50-8060-f6bca3a7cc43', NULL, 'track', 'diamond', 53, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '54e9f13a-077a-4f50-8060-f6bca3a7cc43', NULL, 'track', 'platinum', 54, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'fb42170c-2ddd-48f7-8ce7-a818a7c807e6', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'fb42170c-2ddd-48f7-8ce7-a818a7c807e6', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'fb42170c-2ddd-48f7-8ce7-a818a7c807e6', NULL, 'track', 'diamond', 55, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'fb42170c-2ddd-48f7-8ce7-a818a7c807e6', NULL, 'track', 'platinum', 56, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ef5c2572-2bfb-4175-ad65-86540e68dcc3', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ef5c2572-2bfb-4175-ad65-86540e68dcc3', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ef5c2572-2bfb-4175-ad65-86540e68dcc3', NULL, 'track', 'diamond', 57, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ef5c2572-2bfb-4175-ad65-86540e68dcc3', NULL, 'track', 'platinum', 58, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '07797475-9478-484c-912a-926e5b569f0c', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '07797475-9478-484c-912a-926e5b569f0c', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '07797475-9478-484c-912a-926e5b569f0c', NULL, 'track', 'diamond', 59, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '07797475-9478-484c-912a-926e5b569f0c', NULL, 'track', 'platinum', 60, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '842605cc-7f87-4e8b-835f-fb8a1d6e2993', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '842605cc-7f87-4e8b-835f-fb8a1d6e2993', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '842605cc-7f87-4e8b-835f-fb8a1d6e2993', NULL, 'track', 'diamond', 61, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '842605cc-7f87-4e8b-835f-fb8a1d6e2993', NULL, 'track', 'platinum', 62, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '2b6a7ee6-2afe-436b-aaff-35ec31332f3f', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '2b6a7ee6-2afe-436b-aaff-35ec31332f3f', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '2b6a7ee6-2afe-436b-aaff-35ec31332f3f', NULL, 'track', 'diamond', 63, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '2b6a7ee6-2afe-436b-aaff-35ec31332f3f', NULL, 'track', 'platinum', 64, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee5630a3-796d-4fae-b62e-a9e744fe0129', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee5630a3-796d-4fae-b62e-a9e744fe0129', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee5630a3-796d-4fae-b62e-a9e744fe0129', NULL, 'track', 'diamond', 65, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee5630a3-796d-4fae-b62e-a9e744fe0129', NULL, 'track', 'platinum', 66, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '1886961b-85b3-4709-b1a5-1b0437723f4e', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '1886961b-85b3-4709-b1a5-1b0437723f4e', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '1886961b-85b3-4709-b1a5-1b0437723f4e', NULL, 'track', 'diamond', 67, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '1886961b-85b3-4709-b1a5-1b0437723f4e', NULL, 'track', 'platinum', 68, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '50eb6b8a-5011-414e-a303-9e7e7143fbcb', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '50eb6b8a-5011-414e-a303-9e7e7143fbcb', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '50eb6b8a-5011-414e-a303-9e7e7143fbcb', NULL, 'track', 'diamond', 69, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '50eb6b8a-5011-414e-a303-9e7e7143fbcb', NULL, 'track', 'platinum', 70, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a33e30-9949-41a2-939d-03eba3543fcc', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a33e30-9949-41a2-939d-03eba3543fcc', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a33e30-9949-41a2-939d-03eba3543fcc', NULL, 'track', 'diamond', 71, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '40a33e30-9949-41a2-939d-03eba3543fcc', NULL, 'track', 'platinum', 72, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c6b1f0-b48d-43c4-9c6f-bf68588a4619', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c6b1f0-b48d-43c4-9c6f-bf68588a4619', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c6b1f0-b48d-43c4-9c6f-bf68588a4619', NULL, 'track', 'diamond', 73, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'c7c6b1f0-b48d-43c4-9c6f-bf68588a4619', NULL, 'track', 'platinum', 74, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '3ac8e889-bcdc-4b08-9969-a7800215e131', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '3ac8e889-bcdc-4b08-9969-a7800215e131', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '3ac8e889-bcdc-4b08-9969-a7800215e131', NULL, 'track', 'diamond', 75, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '3ac8e889-bcdc-4b08-9969-a7800215e131', NULL, 'track', 'platinum', 76, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'aaf48f95-0f89-45fb-b86e-2c26fce0d716', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'aaf48f95-0f89-45fb-b86e-2c26fce0d716', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'aaf48f95-0f89-45fb-b86e-2c26fce0d716', NULL, 'track', 'diamond', 77, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'aaf48f95-0f89-45fb-b86e-2c26fce0d716', NULL, 'track', 'platinum', 78, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e5eee0a0-c8ba-41dc-8a8e-3ad8f7273900', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e5eee0a0-c8ba-41dc-8a8e-3ad8f7273900', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e5eee0a0-c8ba-41dc-8a8e-3ad8f7273900', NULL, 'track', 'diamond', 79, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'e5eee0a0-c8ba-41dc-8a8e-3ad8f7273900', NULL, 'track', 'platinum', 80, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee08e0d0-dde9-433d-9c23-7ab6e89c28f7', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee08e0d0-dde9-433d-9c23-7ab6e89c28f7', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee08e0d0-dde9-433d-9c23-7ab6e89c28f7', NULL, 'track', 'diamond', 81, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'ee08e0d0-dde9-433d-9c23-7ab6e89c28f7', NULL, 'track', 'platinum', 82, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '8bd09d8f-9e7b-4395-aee2-0a2b794bf676', NULL, 'track', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '8bd09d8f-9e7b-4395-aee2-0a2b794bf676', NULL, 'track', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '8bd09d8f-9e7b-4395-aee2-0a2b794bf676', NULL, 'track', 'diamond', 83, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', '8bd09d8f-9e7b-4395-aee2-0a2b794bf676', NULL, 'track', 'platinum', 84, true, NOW(), NOW());

-- Album cards: 3 albums × 4 rarities = 12
INSERT INTO un_tunes_user_cards (user_id, track_id, album_id, card_type, rarity, edition_number, is_opened, opened_at, created_at)
VALUES
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, '0df544e7-1f95-4223-b04a-2e2a373928fb', 'album', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, '0df544e7-1f95-4223-b04a-2e2a373928fb', 'album', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, '0df544e7-1f95-4223-b04a-2e2a373928fb', 'album', 'diamond', 85, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, '0df544e7-1f95-4223-b04a-2e2a373928fb', 'album', 'platinum', 86, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f404557b-c18f-4cd6-9dad-f08922e1ef50', 'album', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f404557b-c18f-4cd6-9dad-f08922e1ef50', 'album', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f404557b-c18f-4cd6-9dad-f08922e1ef50', 'album', 'diamond', 87, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f404557b-c18f-4cd6-9dad-f08922e1ef50', 'album', 'platinum', 88, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f5997368-06ca-430b-9e3e-1ab50b38bee7', 'album', 'standard', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f5997368-06ca-430b-9e3e-1ab50b38bee7', 'album', 'gold', 0, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f5997368-06ca-430b-9e3e-1ab50b38bee7', 'album', 'diamond', 89, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', NULL, 'f5997368-06ca-430b-9e3e-1ab50b38bee7', 'album', 'platinum', 90, true, NOW(), NOW());

-- Brand cards: 3 brands × 4 rarities = 12
INSERT INTO un_tunes_user_cards (user_id, card_type, brand_card_id, rarity, edition_number, is_opened, opened_at, created_at)
VALUES
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'dcc78475-3781-4d36-ae83-280d9658ce1b', 'standard', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'dcc78475-3781-4d36-ae83-280d9658ce1b', 'gold', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'dcc78475-3781-4d36-ae83-280d9658ce1b', 'diamond', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'dcc78475-3781-4d36-ae83-280d9658ce1b', 'platinum', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', '921498a8-3729-42ec-b752-5923c777af1d', 'standard', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', '921498a8-3729-42ec-b752-5923c777af1d', 'gold', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', '921498a8-3729-42ec-b752-5923c777af1d', 'diamond', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', '921498a8-3729-42ec-b752-5923c777af1d', 'platinum', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'fa43a33b-ea91-46c3-8638-9a52ac6c8fbd', 'standard', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'fa43a33b-ea91-46c3-8638-9a52ac6c8fbd', 'gold', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'fa43a33b-ea91-46c3-8638-9a52ac6c8fbd', 'diamond', 1, true, NOW(), NOW()),
('3a61bd9e-785b-4512-abab-e61b87496c54', 'brand', 'fa43a33b-ea91-46c3-8638-9a52ac6c8fbd', 'platinum', 1, true, NOW(), NOW());


-- ══════════ PART 3: AUCTION / TRADING / DISCARD RPCs ══════════

-- 3a. DISCARD CARD — permanently destroy a card you own
CREATE OR REPLACE FUNCTION public.discard_card(p_card_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_card RECORD;
BEGIN
  SELECT * INTO v_card FROM un_tunes_user_cards WHERE id = p_card_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Card not found or not yours');
  END IF;
  -- Check not listed for auction
  IF EXISTS (SELECT 1 FROM un_tunes_card_listings WHERE card_id = p_card_id AND status = 'active') THEN
    RETURN jsonb_build_object('error', 'Card is listed for auction — cancel listing first');
  END IF;
  DELETE FROM un_tunes_user_cards WHERE id = p_card_id;
  RETURN jsonb_build_object('success', true, 'discarded', p_card_id);
END;
$$;

-- 3b. LIST CARD FOR AUCTION — put a card up for sale
CREATE OR REPLACE FUNCTION public.list_card_for_auction(
  p_card_id UUID,
  p_starting_price NUMERIC DEFAULT 1.0,
  p_buy_now_price NUMERIC DEFAULT NULL,
  p_duration_hours INTEGER DEFAULT 24,
  p_listing_type TEXT DEFAULT 'auction'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_card RECORD;
  v_listing_id UUID;
  v_type TEXT;
BEGIN
  v_type := CASE WHEN p_listing_type = 'fixed' THEN 'fixed' ELSE 'auction' END;

  -- Verify ownership
  SELECT * INTO v_card FROM un_tunes_user_cards WHERE id = p_card_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Card not found or not yours');
  END IF;
  -- Check not already listed
  IF EXISTS (SELECT 1 FROM un_tunes_card_listings WHERE card_id = p_card_id AND status = 'active') THEN
    RETURN jsonb_build_object('error', 'Card already listed');
  END IF;
  -- Validate price (min 0.1)
  IF p_starting_price < 0.1 THEN
    RETURN jsonb_build_object('error', 'Minimum starting price is 0.1 tokens');
  END IF;

  -- For fixed-price listings, set buy_now_price = starting_price so buy-now works
  INSERT INTO un_tunes_card_listings (seller_id, card_id, listing_type, starting_price, buy_now_price, current_bid, ends_at)
  VALUES (
    auth.uid(), p_card_id, v_type, p_starting_price,
    CASE WHEN v_type = 'fixed' THEN p_starting_price ELSE p_buy_now_price END,
    0,
    NOW() + (p_duration_hours || ' hours')::interval
  )
  RETURNING id INTO v_listing_id;

  RETURN jsonb_build_object('success', true, 'listing_id', v_listing_id);
END;
$$;

-- 3c. PLACE BID — bid on an active auction (0.1 token increments)
CREATE OR REPLACE FUNCTION public.place_bid(
  p_listing_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_balance NUMERIC;
  v_min_bid NUMERIC;
BEGIN
  -- Get listing
  SELECT * INTO v_listing FROM un_tunes_card_listings WHERE id = p_listing_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Listing not found or expired');
  END IF;
  -- Can't bid on own listing
  IF v_listing.seller_id = auth.uid() THEN
    RETURN jsonb_build_object('error', 'Cannot bid on your own listing');
  END IF;
  -- Check auction hasn't ended
  IF v_listing.ends_at < NOW() THEN
    RETURN jsonb_build_object('error', 'Auction has ended');
  END IF;
  -- Validate bid amount (must be at least starting_price or current_bid + 0.1)
  v_min_bid := GREATEST(v_listing.starting_price, v_listing.current_bid + 0.1);
  IF p_amount < v_min_bid THEN
    RETURN jsonb_build_object('error', 'Bid too low', 'minimum', v_min_bid);
  END IF;
  -- Validate 0.1 increment
  IF MOD(p_amount * 10, 1) != 0 THEN
    RETURN jsonb_build_object('error', 'Bids must be in 0.1 token increments');
  END IF;
  -- Check bidder has enough tokens
  SELECT balance INTO v_balance FROM token_balances WHERE user_id = auth.uid();
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN jsonb_build_object('error', 'Not enough tokens', 'balance', COALESCE(v_balance, 0));
  END IF;

  -- Refund previous bidder's hold (if any) — we do escrow on completion, not on bid
  -- Record the bid
  INSERT INTO un_tunes_bids (listing_id, bidder_id, amount) VALUES (p_listing_id, auth.uid(), p_amount);
  -- Update listing
  UPDATE un_tunes_card_listings SET current_bid = p_amount, current_bidder_id = auth.uid(), updated_at = NOW()
  WHERE id = p_listing_id;

  RETURN jsonb_build_object('success', true, 'bid', p_amount, 'listing_id', p_listing_id);
END;
$$;

-- 3d. BUY NOW — instant purchase at buy_now_price
CREATE OR REPLACE FUNCTION public.buy_now_card(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_buyer_balance NUMERIC;
  v_new_buyer_balance NUMERIC;
  v_new_seller_balance NUMERIC;
BEGIN
  SELECT * INTO v_listing FROM un_tunes_card_listings WHERE id = p_listing_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Listing not found or expired');
  END IF;
  IF v_listing.buy_now_price IS NULL THEN
    RETURN jsonb_build_object('error', 'No buy-now price set');
  END IF;
  IF v_listing.seller_id = auth.uid() THEN
    RETURN jsonb_build_object('error', 'Cannot buy your own listing');
  END IF;

  -- Check buyer balance
  SELECT balance INTO v_buyer_balance FROM token_balances WHERE user_id = auth.uid();
  IF v_buyer_balance IS NULL OR v_buyer_balance < v_listing.buy_now_price THEN
    RETURN jsonb_build_object('error', 'Not enough tokens');
  END IF;

  -- Deduct from buyer
  UPDATE token_balances SET balance = balance - v_listing.buy_now_price,
    lifetime_spent = lifetime_spent + v_listing.buy_now_price, updated_at = NOW()
  WHERE user_id = auth.uid() RETURNING balance INTO v_new_buyer_balance;
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
  VALUES (auth.uid(), -v_listing.buy_now_price, v_new_buyer_balance, 'card_purchase', 'Buy now: card ' || v_listing.card_id);

  -- Credit seller
  INSERT INTO token_balances (user_id, balance, lifetime_earned) VALUES (v_listing.seller_id, v_listing.buy_now_price, v_listing.buy_now_price)
  ON CONFLICT (user_id) DO UPDATE SET balance = token_balances.balance + v_listing.buy_now_price,
    lifetime_earned = token_balances.lifetime_earned + v_listing.buy_now_price, updated_at = NOW();
  SELECT balance INTO v_new_seller_balance FROM token_balances WHERE user_id = v_listing.seller_id;
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
  VALUES (v_listing.seller_id, v_listing.buy_now_price, v_new_seller_balance, 'card_sale', 'Sold card ' || v_listing.card_id);

  -- Transfer card ownership
  UPDATE un_tunes_user_cards SET user_id = auth.uid() WHERE id = v_listing.card_id;
  -- Mark listing sold
  UPDATE un_tunes_card_listings SET status = 'sold', updated_at = NOW() WHERE id = p_listing_id;
  -- Price history
  INSERT INTO un_tunes_price_history (card_type, reference_id, rarity, sale_price, sale_type)
  SELECT card_type, COALESCE(track_id, album_id, brand_card_id), rarity, v_listing.buy_now_price, 'fixed'
  FROM un_tunes_user_cards WHERE id = v_listing.card_id;

  RETURN jsonb_build_object('success', true, 'price', v_listing.buy_now_price);
END;
$$;

-- 3e. COMPLETE AUCTION — called when auction ends, transfers card + tokens
CREATE OR REPLACE FUNCTION public.complete_auction(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
  v_buyer_balance NUMERIC;
  v_new_buyer_balance NUMERIC;
  v_new_seller_balance NUMERIC;
BEGIN
  SELECT * INTO v_listing FROM un_tunes_card_listings WHERE id = p_listing_id AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Listing not found');
  END IF;
  IF v_listing.ends_at > NOW() THEN
    RETURN jsonb_build_object('error', 'Auction not ended yet');
  END IF;

  -- No bids? Expire it
  IF v_listing.current_bidder_id IS NULL OR v_listing.current_bid <= 0 THEN
    UPDATE un_tunes_card_listings SET status = 'expired', updated_at = NOW() WHERE id = p_listing_id;
    RETURN jsonb_build_object('success', true, 'result', 'expired', 'no_bids', true);
  END IF;

  -- Check winner has enough tokens
  SELECT balance INTO v_buyer_balance FROM token_balances WHERE user_id = v_listing.current_bidder_id;
  IF v_buyer_balance IS NULL OR v_buyer_balance < v_listing.current_bid THEN
    -- Winner can't pay — expire listing, return card
    UPDATE un_tunes_card_listings SET status = 'expired', updated_at = NOW() WHERE id = p_listing_id;
    RETURN jsonb_build_object('error', 'Winner insufficient tokens', 'result', 'expired');
  END IF;

  -- Deduct from winner
  UPDATE token_balances SET balance = balance - v_listing.current_bid,
    lifetime_spent = lifetime_spent + v_listing.current_bid, updated_at = NOW()
  WHERE user_id = v_listing.current_bidder_id RETURNING balance INTO v_new_buyer_balance;
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
  VALUES (v_listing.current_bidder_id, -v_listing.current_bid, v_new_buyer_balance, 'auction_win', 'Won auction ' || p_listing_id);

  -- Credit seller
  INSERT INTO token_balances (user_id, balance, lifetime_earned) VALUES (v_listing.seller_id, v_listing.current_bid, v_listing.current_bid)
  ON CONFLICT (user_id) DO UPDATE SET balance = token_balances.balance + v_listing.current_bid,
    lifetime_earned = token_balances.lifetime_earned + v_listing.current_bid, updated_at = NOW();
  SELECT balance INTO v_new_seller_balance FROM token_balances WHERE user_id = v_listing.seller_id;
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
  VALUES (v_listing.seller_id, v_listing.current_bid, v_new_seller_balance, 'auction_sale', 'Auction sold ' || p_listing_id);

  -- Transfer card
  UPDATE un_tunes_user_cards SET user_id = v_listing.current_bidder_id WHERE id = v_listing.card_id;
  -- Mark sold
  UPDATE un_tunes_card_listings SET status = 'sold', updated_at = NOW() WHERE id = p_listing_id;
  -- Price history
  INSERT INTO un_tunes_price_history (card_type, reference_id, rarity, sale_price, sale_type)
  SELECT card_type, COALESCE(track_id, album_id, brand_card_id), rarity, v_listing.current_bid, 'auction'
  FROM un_tunes_user_cards WHERE id = v_listing.card_id;

  RETURN jsonb_build_object('success', true, 'price', v_listing.current_bid, 'winner', v_listing.current_bidder_id);
END;
$$;

-- 3f. CANCEL LISTING — seller cancels their own active listing
CREATE OR REPLACE FUNCTION public.cancel_listing(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_listing RECORD;
BEGIN
  SELECT * INTO v_listing FROM un_tunes_card_listings WHERE id = p_listing_id AND seller_id = auth.uid() AND status = 'active';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Listing not found or not yours');
  END IF;
  -- Can't cancel if there are bids (to protect bidders)
  IF v_listing.current_bid > 0 AND v_listing.current_bidder_id IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'Cannot cancel — active bids exist. Wait for auction to end.');
  END IF;
  UPDATE un_tunes_card_listings SET status = 'cancelled', updated_at = NOW() WHERE id = p_listing_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 3g. TRANSFER TOKENS — direct token transfer between users
CREATE OR REPLACE FUNCTION public.transfer_tokens(
  p_recipient_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_sender_balance NUMERIC;
  v_new_sender_balance NUMERIC;
  v_new_recipient_balance NUMERIC;
BEGIN
  IF p_amount < 0.1 THEN
    RETURN jsonb_build_object('error', 'Minimum transfer is 0.1 tokens');
  END IF;
  IF MOD(p_amount * 10, 1) != 0 THEN
    RETURN jsonb_build_object('error', 'Transfers must be in 0.1 token increments');
  END IF;
  IF p_recipient_id = auth.uid() THEN
    RETURN jsonb_build_object('error', 'Cannot transfer to yourself');
  END IF;
  -- Check recipient exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_recipient_id) THEN
    RETURN jsonb_build_object('error', 'Recipient not found');
  END IF;

  -- Check sender balance
  SELECT balance INTO v_sender_balance FROM token_balances WHERE user_id = auth.uid();
  IF v_sender_balance IS NULL OR v_sender_balance < p_amount THEN
    RETURN jsonb_build_object('error', 'Not enough tokens');
  END IF;

  -- Deduct from sender
  UPDATE token_balances SET balance = balance - p_amount,
    lifetime_spent = lifetime_spent + p_amount, updated_at = NOW()
  WHERE user_id = auth.uid() RETURNING balance INTO v_new_sender_balance;
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
  VALUES (auth.uid(), -p_amount, v_new_sender_balance, 'transfer_out', 'Transfer to ' || p_recipient_id);

  -- Credit recipient
  INSERT INTO token_balances (user_id, balance, lifetime_earned) VALUES (p_recipient_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET balance = token_balances.balance + p_amount,
    lifetime_earned = token_balances.lifetime_earned + p_amount, updated_at = NOW();
  SELECT balance INTO v_new_recipient_balance FROM token_balances WHERE user_id = p_recipient_id;
  INSERT INTO token_transactions (user_id, amount, balance_after, type, description)
  VALUES (p_recipient_id, p_amount, v_new_recipient_balance, 'transfer_in', 'Transfer from ' || auth.uid());

  RETURN jsonb_build_object('success', true, 'sent', p_amount, 'new_balance', v_new_sender_balance);
END;
$$;

-- ══════════ PART 4: RLS — allow users to delete own cards ══════════
DROP POLICY IF EXISTS "Users can delete own cards" ON un_tunes_user_cards;
CREATE POLICY "Users can delete own cards" ON un_tunes_user_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Allow bidders to update listings (for bid placement via RPC — already SECURITY DEFINER but just in case)
DROP POLICY IF EXISTS "Bidders can update listings" ON un_tunes_card_listings;
CREATE POLICY "Bidders can update listings" ON un_tunes_card_listings
  FOR UPDATE USING (true);

-- ══════════ DONE ══════════
-- Total dev cards: 192 (42 tracks + 3 albums + 3 brand) × 4 rarities
-- RPCs: discard_card, list_card_for_auction, place_bid, buy_now_card,
--        complete_auction, cancel_listing, transfer_tokens
