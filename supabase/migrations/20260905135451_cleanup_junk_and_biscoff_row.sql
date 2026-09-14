-- Delete 14 confirmed junk/pure-instruction rows (approved by JJ)
DELETE FROM recipe_ingredients WHERE id IN (
  'bdd21732-dc1b-4269-a68c-66b38cc1334a',
  '5422f6ca-119f-40c4-9f34-eb6b288f4223',
  'c0f78e00-034e-4d72-a952-94c9f5c666db',
  'ba9da069-8659-4e51-8489-3f94ff194528',
  '43a008de-5afc-47d8-9948-8b6bddc94be5',
  '0e370b36-d07d-413d-a625-ae96b7c44a93',
  'd110f8e3-e1a4-43e9-a40c-fbb3da98d666',
  'b3fb3537-5eec-4398-9920-be3a21c4db81',
  'ec0b4a5a-9959-4ba5-9bc3-57659f3e2873',
  '7995fc91-37f4-4cee-9266-e797ffda668e',
  '5f974e06-e1f8-41a6-a536-f8dcb4ec7962',
  '20e65a95-57fd-46b0-8be4-7cbbda2aaf45',
  '7653299e-3855-4822-8327-5942f1258676',
  '2c7c3556-cb1c-4e0f-a162-c982721daf75'
);

-- Clean (not delete) the Biscoff French Toast Rolls icing sugar row:
-- it's a real optional ingredient, just phrased as an instruction sentence.
-- Match the existing "Dash vanilla extract" null-qty/unit style in the same recipe.
UPDATE recipe_ingredients
SET name = 'Icing sugar (low calorie), optional'
WHERE id = 'c575f4b2-49fb-4956-8bd7-c50cd510e06c';
