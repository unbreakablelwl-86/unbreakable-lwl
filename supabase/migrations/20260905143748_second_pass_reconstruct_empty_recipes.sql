-- ============================================================
-- Second reconstruction pass: recipes that had ZERO or near-zero
-- ingredient rows left (separate breakage from the 111-row pass).
-- Method: same as before -- identity pulled only from the recipe's
-- own instructions text (which still carries fragments of the
-- original ingredient list) or, where explicitly noted, the recipe
-- name/macros/dietary tags when no instruction text survived.
-- Quantities are reasonable simple estimates where the text itself
-- gives no number; explicit textual quantities are preserved as-is.
-- ============================================================

-- 1. Antioxidant Blueberry Protein Smoothie (f96b3521-7c1d-4fb3-b816-7f8ee0b93b07)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('f96b3521-7c1d-4fb3-b816-7f8ee0b93b07','Frozen blueberries',150,'g',0),
('f96b3521-7c1d-4fb3-b816-7f8ee0b93b07','Vanilla protein powder',25,'g',1),
('f96b3521-7c1d-4fb3-b816-7f8ee0b93b07','Coconut milk',125,'ml',2);

-- 2. Beef & Green Beans Pasta In Soy Sauce (655480c7-9a42-450b-9380-33a4da6a8f92)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('655480c7-9a42-450b-9380-33a4da6a8f92','Beef sirloin, thinly sliced',300,'g',0),
('655480c7-9a42-450b-9380-33a4da6a8f92','Spring onions',3,'whole',1),
('655480c7-9a42-450b-9380-33a4da6a8f92','Garlic',2,'cloves',2),
('655480c7-9a42-450b-9380-33a4da6a8f92','Vegetable oil',1,'tbsp',3),
('655480c7-9a42-450b-9380-33a4da6a8f92','Soy sauce',3,'tbsp',4),
('655480c7-9a42-450b-9380-33a4da6a8f92','Beef stock',200,'ml',5),
('655480c7-9a42-450b-9380-33a4da6a8f92','Frozen green beans',200,'g',6),
('655480c7-9a42-450b-9380-33a4da6a8f92','Pasta, dry weight',150,'g',7);

-- 3. Cajun Beef & Veg Rice (a3fae672-1755-4c9f-a672-1cce332ff409)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('a3fae672-1755-4c9f-a672-1cce332ff409','Vegetable oil',1,'tbsp',0),
('a3fae672-1755-4c9f-a672-1cce332ff409','Carrots',2,'whole',1),
('a3fae672-1755-4c9f-a672-1cce332ff409','Peppers',2,'whole',2),
('a3fae672-1755-4c9f-a672-1cce332ff409','Spring onions',4,'whole',3),
('a3fae672-1755-4c9f-a672-1cce332ff409','Minced beef (5% fat)',400,'g',4),
('a3fae672-1755-4c9f-a672-1cce332ff409','Cajun seasoning',2,'tsp',5),
('a3fae672-1755-4c9f-a672-1cce332ff409','Tomato puree',2,'tbsp',6),
('a3fae672-1755-4c9f-a672-1cce332ff409','Cooked rice',300,'g',7),
('a3fae672-1755-4c9f-a672-1cce332ff409','Water',4,'tbsp',8);

-- 4. Cherry Sorbet (fe3b9b81-8451-40f6-bd3f-d11becb01821)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('fe3b9b81-8451-40f6-bd3f-d11becb01821','Frozen cherries',500,'g',0),
('fe3b9b81-8451-40f6-bd3f-d11becb01821','Honey',2,'tbsp',1),
('fe3b9b81-8451-40f6-bd3f-d11becb01821','Lemon juice',1,'tbsp',2),
('fe3b9b81-8451-40f6-bd3f-d11becb01821','Greek yogurt',4,'tbsp',3),
('fe3b9b81-8451-40f6-bd3f-d11becb01821','Water',4,'tbsp',4),
('fe3b9b81-8451-40f6-bd3f-d11becb01821','Mint leaves, to garnish',NULL,NULL,5);

-- 5. Chicken & Mango Stir Fry (aa6e85e0-6907-4826-8c05-b3dc61be1721)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Chicken breast, cut into strips',500,'g',0),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Plain flour',2,'tbsp',1),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Mango',1,'whole',2),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Peppers',2,'whole',3),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Onion',1,'whole',4),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Red chili pepper',1,'whole',5),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Garlic',2,'cloves',6),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Ginger, grated',1,'tsp',7),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Coconut oil',2,'tbsp',8),
('aa6e85e0-6907-4826-8c05-b3dc61be1721','Stir-fry sauce (soy sauce & honey)',3,'tbsp',9);

-- 6. Creamy Chicken, Mushroom & Tomato Pasta (3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Chicken fillet',400,'g',0),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Vegetable oil',1,'tbsp',1),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Dried oregano',1,'tsp',2),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Onion',1,'whole',3),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Garlic',2,'cloves',4),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Mushrooms',200,'g',5),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Chopped tomatoes, canned',400,'g',6),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Plant-based oat cream',125,'ml',7),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Spinach',100,'g',8),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Pasta, dry weight',200,'g',9),
('3cc9ec5d-6dd6-47e7-b442-7d4266d5b2b0','Basil leaves, to garnish',NULL,NULL,10);

-- 7. Honey & Lime Glazed Salmon With Pineapple Rice (81e62be0-dc35-4301-b372-d98212f79ced)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('81e62be0-dc35-4301-b372-d98212f79ced','Salmon fillets',4,'whole',0),
('81e62be0-dc35-4301-b372-d98212f79ced','Honey',3,'tbsp',1),
('81e62be0-dc35-4301-b372-d98212f79ced','Lime juice',2,'whole',2),
('81e62be0-dc35-4301-b372-d98212f79ced','Basmati rice',300,'g',3),
('81e62be0-dc35-4301-b372-d98212f79ced','Sweetcorn',200,'g',4),
('81e62be0-dc35-4301-b372-d98212f79ced','Pineapple',150,'g',5),
('81e62be0-dc35-4301-b372-d98212f79ced','Cucumber',1,'whole',6),
('81e62be0-dc35-4301-b372-d98212f79ced','Coriander leaves',0.5,'cup',7),
('81e62be0-dc35-4301-b372-d98212f79ced','Salt, to taste',NULL,NULL,8);

-- 8. Matcha Chia Pudding (d8a89f30-c1da-4488-af90-0768eb88ce8b)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('d8a89f30-c1da-4488-af90-0768eb88ce8b','Chia seeds',30,'g',0),
('d8a89f30-c1da-4488-af90-0768eb88ce8b','Almond milk',250,'ml',1),
('d8a89f30-c1da-4488-af90-0768eb88ce8b','Matcha powder',1,'tsp',2),
('d8a89f30-c1da-4488-af90-0768eb88ce8b','Maple syrup',1,'tbsp',3),
('d8a89f30-c1da-4488-af90-0768eb88ce8b','Soy protein isolate (or plant protein powder)',20,'g',4),
('d8a89f30-c1da-4488-af90-0768eb88ce8b','Frozen berries, to serve',NULL,NULL,5);

-- 9. Mexican Fried Rice (a763536c-c22d-465f-847d-a1a588eb6bb8)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('a763536c-c22d-465f-847d-a1a588eb6bb8','Chicken breast, cubed',400,'g',0),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Garlic',2,'cloves',1),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Ground cumin',1,'tsp',2),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Vegetable oil',1,'tbsp',3),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Onion',1,'whole',4),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Peppers',2,'whole',5),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Sweetcorn, canned',200,'g',6),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Black beans, canned',200,'g',7),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Cooked rice',300,'g',8),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Avocado',1,'whole',9),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Lime juice',1,'whole',10),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Red chili',1,'whole',11),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Tomato',1,'whole',12),
('a763536c-c22d-465f-847d-a1a588eb6bb8','Coriander, to garnish',NULL,NULL,13);

-- 10. Quick Beef Chow Mein (d051dc31-e5a8-48cb-af08-b14a1b19eeb3)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Egg noodles',160,'g',0),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Leek, sliced',0.5,'whole',1),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Beef, thinly sliced',400,'g',2),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Sesame oil',1,'tbsp',3),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Garlic',2,'cloves',4),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Ginger, grated',1,'tsp',5),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Mushrooms',150,'g',6),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','White pepper, pinch',NULL,NULL,7),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Soy sauce',3,'tbsp',8),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Water',3,'tbsp',9),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Sugar',1,'tsp',10),
('d051dc31-e5a8-48cb-af08-b14a1b19eeb3','Spring onions, to garnish',NULL,NULL,11);

-- 11. Raspberry Protein Smoothie (604c2af9-dafc-47cd-9679-b6d4962f36a2) -- NOTE: zero instruction text survived; generic smoothie fill based on name/macros/tags only
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('604c2af9-dafc-47cd-9679-b6d4962f36a2','Frozen raspberries',150,'g',0),
('604c2af9-dafc-47cd-9679-b6d4962f36a2','Vanilla protein powder',30,'g',1),
('604c2af9-dafc-47cd-9679-b6d4962f36a2','Almond milk',250,'ml',2),
('604c2af9-dafc-47cd-9679-b6d4962f36a2','Almond butter',1,'tbsp',3);

-- 12. Salmon Tartar With Avocado And Mango (31391188-9ddd-4372-a541-e0efc37868fc)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('31391188-9ddd-4372-a541-e0efc37868fc','Salmon, sashimi-grade',150,'g',0),
('31391188-9ddd-4372-a541-e0efc37868fc','Avocado',0.5,'whole',1),
('31391188-9ddd-4372-a541-e0efc37868fc','Mango',0.5,'whole',2),
('31391188-9ddd-4372-a541-e0efc37868fc','Lime juice',1,'tbsp',3),
('31391188-9ddd-4372-a541-e0efc37868fc','Red chili pepper, to taste',NULL,NULL,4),
('31391188-9ddd-4372-a541-e0efc37868fc','Coriander, chopped, handful',NULL,NULL,5),
('31391188-9ddd-4372-a541-e0efc37868fc','Salt & pepper, to taste',NULL,NULL,6);

-- 13. Simple Chili & Sweet Potato Chips (7c267158-8f10-4207-b19b-08e7beb99e7d)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('7c267158-8f10-4207-b19b-08e7beb99e7d','Sweet potatoes',600,'g',0),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Garlic powder',1,'tsp',1),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Onion powder',1,'tsp',2),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Buckwheat flour',2,'tbsp',3),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Olive oil',1,'tbsp',4),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Lean ground beef',400,'g',5),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Chili flakes',1,'tsp',6),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Chopped tomatoes, canned',400,'g',7),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Water',100,'ml',8),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Avocado',1,'whole',9),
('7c267158-8f10-4207-b19b-08e7beb99e7d','Coriander, to garnish',NULL,NULL,10);

-- 14. Sweet And Sour Pork Stir-Fry (8b191d51-1038-44b7-ae70-96463fad685b)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('8b191d51-1038-44b7-ae70-96463fad685b','Basmati rice',200,'g',0),
('8b191d51-1038-44b7-ae70-96463fad685b','Pork tenderloin, sliced',500,'g',1),
('8b191d51-1038-44b7-ae70-96463fad685b','Garlic',2,'cloves',2),
('8b191d51-1038-44b7-ae70-96463fad685b','Ginger syrup',2,'tbsp',3),
('8b191d51-1038-44b7-ae70-96463fad685b','Lime juice',1,'tbsp',4),
('8b191d51-1038-44b7-ae70-96463fad685b','Sugar snap peas',150,'g',5),
('8b191d51-1038-44b7-ae70-96463fad685b','Tomatoes',2,'whole',6),
('8b191d51-1038-44b7-ae70-96463fad685b','Pineapple chunks',200,'g',7),
('8b191d51-1038-44b7-ae70-96463fad685b','Spring onions',3,'whole',8);

-- 15. Vanilla & Coffee Protein Smoothie (ef0077f4-c958-4b9e-9d8e-0845de180d90)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('ef0077f4-c958-4b9e-9d8e-0845de180d90','Espresso, cooled',60,'ml',0),
('ef0077f4-c958-4b9e-9d8e-0845de180d90','Vanilla protein powder',40,'g',1),
('ef0077f4-c958-4b9e-9d8e-0845de180d90','Almond milk',300,'ml',2),
('ef0077f4-c958-4b9e-9d8e-0845de180d90','Ice cubes',NULL,NULL,3);

-- ============================================================
-- Near-empty recipes (1-4 rows, missing key items mentioned in
-- their own instructions text). Appended after existing max sort_order.
-- ============================================================

-- Chicken Orange Stir Fry (32d93ec5-6b0a-4c48-873e-0cbb91d87d70) -- existing: Orange, juice only (sort_order 1)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Carrot, grated',25,'g',2),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Chicken breast',500,'g',3),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Broccoli',200,'g',4),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Peppers',2,'whole',5),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Garlic',2,'cloves',6),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Ginger, grated',1,'tsp',7),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Soy sauce',2,'tbsp',8),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Honey',1,'tbsp',9),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Cornflour',1,'tbsp',10),
('32d93ec5-6b0a-4c48-873e-0cbb91d87d70','Cooked rice',300,'g',11);

-- Chinese Style Shrimps & Veg (e20da00f-7e64-4578-9572-263fd16b9bbe) -- existing: Coconut palm sugar (sort_order 4)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('e20da00f-7e64-4578-9572-263fd16b9bbe','Vegetable oil',2,'tbsp',5),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Carrots',2,'whole',6),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Peppers',2,'whole',7),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Garlic',2,'cloves',8),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Zucchini',1,'whole',9),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Ginger, grated',1,'tsp',10),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Shrimps, raw & peeled',300,'g',11),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Soy sauce',2,'tbsp',12),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Potato flour',1,'tbsp',13),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Water',100,'ml',14),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Cooked rice',300,'g',15),
('e20da00f-7e64-4578-9572-263fd16b9bbe','Salt & chili, to taste',NULL,NULL,16);

-- Sweetcorn Fritters (126184dd-b301-495f-b4dd-8b0f87951eb2) -- existing: Sweetcorn (0), Buckwheat flour (1)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('126184dd-b301-495f-b4dd-8b0f87951eb2','Coriander, chopped',NULL,NULL,2),
('126184dd-b301-495f-b4dd-8b0f87951eb2','Lemon zest',1,'tsp',3),
('126184dd-b301-495f-b4dd-8b0f87951eb2','Coconut oil, for frying',1,'tbsp',4);

-- Green Glow Protein Smoothie (01cbfad6-3e3f-4100-baad-d8727e8bf4f1) -- existing: Water (2), Vanilla protein powder (3)
-- NOTE: lower confidence -- name/macros/tags-based, no explicit greens/fruit mentioned in surviving instructions text
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('01cbfad6-3e3f-4100-baad-d8727e8bf4f1','Spinach',30,'g',4),
('01cbfad6-3e3f-4100-baad-d8727e8bf4f1','Banana',1,'whole',5),
('01cbfad6-3e3f-4100-baad-d8727e8bf4f1','Almond butter',1,'tbsp',6);

-- Simple Chicken Curry With Saffron Rice (ca0c56b2-42a1-4665-8f99-cb64dcd412f8) -- existing rows 0-6 (rice-side ingredients)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('ca0c56b2-42a1-4665-8f99-cb64dcd412f8','Chicken thighs, boneless & skinless',4,'whole',7),
('ca0c56b2-42a1-4665-8f99-cb64dcd412f8','Onion, diced',1,'whole',8),
('ca0c56b2-42a1-4665-8f99-cb64dcd412f8','Garlic',2,'cloves',9),
('ca0c56b2-42a1-4665-8f99-cb64dcd412f8','Ginger, grated',1,'tsp',10),
('ca0c56b2-42a1-4665-8f99-cb64dcd412f8','Ground turmeric',1,'tsp',11),
('ca0c56b2-42a1-4665-8f99-cb64dcd412f8','Chopped tomatoes, canned',400,'g',12),
('ca0c56b2-42a1-4665-8f99-cb64dcd412f8','Salt & pepper, to taste',NULL,NULL,13);

-- Slow Cooker Chicken Fajitas (01b1d720-a59a-4b54-b641-718fed42b6d0) -- existing: garnish rows 0-3 (tortillas, cream, guacamole, coriander)
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES
('01b1d720-a59a-4b54-b641-718fed42b6d0','Chicken breast, boneless & skinless',900,'g',4),
('01b1d720-a59a-4b54-b641-718fed42b6d0','Fajita seasoning (paprika, cumin, chili powder, garlic powder)',2,'tbsp',5),
('01b1d720-a59a-4b54-b641-718fed42b6d0','Peppers, sliced',3,'whole',6),
('01b1d720-a59a-4b54-b641-718fed42b6d0','Onion, sliced',1,'whole',7),
('01b1d720-a59a-4b54-b641-718fed42b6d0','Chicken stock',100,'ml',8);
