-- Allow users to update their own achievement cards (image/video upload, custom media)
CREATE POLICY "Users can update own achievement cards"
  ON achievement_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own achievement cards (pack opening, PB creation)
CREATE POLICY "Users can insert own achievement cards"
  ON achievement_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);
