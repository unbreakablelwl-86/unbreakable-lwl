-- Reconstruction of 111 previously-unparsed recipe_ingredients rows across 63 recipes.
-- Every value here is drawn directly from: (a) the numeric quantity/unit already
-- present in the row's own text (parenthetical metric conversions), or (b) the
-- recipe's own instructions field / other ingredient rows, which in many cases
-- literally name the missing ingredient. No quantities or foods were invented
-- from nothing. A handful of purely descriptive words (e.g. "cut into chunks")
-- are reasonable filler with no nutrition impact, called out separately to JJ.

-- ===== Almond & Peach Cake =====
UPDATE recipe_ingredients SET name = 'Almond milk', quantity = 120, unit = 'ml' WHERE id = 'f05851ab-d2e8-40bc-a4fd-765bae4a4611';
UPDATE recipe_ingredients SET name = 'Maple syrup (plus 2 tbsp. reserved for glaze)', quantity = 120, unit = 'ml' WHERE id = 'a9a6bdee-eec6-414c-b0fe-a557857a78ac';
UPDATE recipe_ingredients SET name = 'Peaches, cut into 8 segments', quantity = 2, unit = 'whole' WHERE id = 'a7d6f4d0-a805-42ac-98d3-ee4fd520c2d6';
UPDATE recipe_ingredients SET name = 'All-purpose flour', quantity = 240, unit = 'g' WHERE id = '1de04bd4-3570-44f0-b9ba-27899ac2cbaf';
UPDATE recipe_ingredients SET name = 'Ground almonds', quantity = 80, unit = 'g' WHERE id = '4c7c6686-f8b0-48d4-bae5-4a71d1cf74b2';

-- ===== Aubergine & Tomato Pasta =====
UPDATE recipe_ingredients SET name = 'Aubergines, cut into chunks', quantity = 2, unit = 'whole' WHERE id = '3709fd2b-d518-49d6-9f02-414ae73420f1';
UPDATE recipe_ingredients SET name = 'Oil from sundried tomatoes', quantity = 1, unit = 'tbsp' WHERE id = '1ee0a681-c19d-400f-8c6f-70d1f72cac98';
UPDATE recipe_ingredients SET name = 'Chopped tomatoes, canned', quantity = 400, unit = 'g' WHERE id = 'd6d5a384-c94d-421d-a853-8298f7268434';

-- ===== Baked Salmon Tray With Rice & Tomatoes =====
UPDATE recipe_ingredients SET name = 'Lemon, sliced', quantity = 4, unit = 'slices' WHERE id = '07826bc5-ccff-418e-a44f-e9821187f16f';
UPDATE recipe_ingredients SET name = 'Lemon juice', quantity = 2, unit = 'tbsp' WHERE id = 'a866b820-5b5f-408e-8b32-c5fa61d02cf0';
UPDATE recipe_ingredients SET name = 'Cherry tomatoes', quantity = 150, unit = 'g' WHERE id = '07d2f47d-b771-4a21-934f-cf5ace5bf41c';
UPDATE recipe_ingredients SET name = 'Basil leaves', quantity = 1, unit = 'handful' WHERE id = 'a51f6bfd-cdcd-4dc6-83ec-875a508d7d0f';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('923f109f-c30f-49c0-80d7-1e29fdf730c7', 'Natural yogurt, 0% fat', 4, 'tbsp', 9);

-- ===== Banana & Almond Muffins =====
UPDATE recipe_ingredients SET name = 'Maple syrup', quantity = 60, unit = 'ml' WHERE id = 'cc947f4b-6613-4a9c-9c73-c9166914ae9f';
UPDATE recipe_ingredients SET name = 'Almond butter', quantity = 60, unit = 'ml' WHERE id = 'ac8a7a41-d872-4da3-82c1-5e81a426667d';

-- ===== Banana & Strawberry Pancakes =====
UPDATE recipe_ingredients SET name = 'Almond milk', quantity = 180, unit = 'ml' WHERE id = 'dad09c38-2898-4dc4-964b-4000b6d30551';
UPDATE recipe_ingredients SET name = 'Strawberries, sliced', quantity = 150, unit = 'g' WHERE id = '334cca47-da3b-4cf7-8d2b-006d82a15ddb';

-- ===== Banana Chocolate Bites =====
UPDATE recipe_ingredients SET name = 'Natural peanut butter', quantity = 85, unit = 'g' WHERE id = '47142c63-fbc4-40f9-b037-ab02b4c910d0';

-- ===== Black Bean Hummus =====
UPDATE recipe_ingredients SET name = 'Black beans, canned, drained', quantity = 400, unit = 'g' WHERE id = '49f7c6fa-e49a-49ae-ac9a-ff2cc7b97ef0';
UPDATE recipe_ingredients SET name = 'Lime juice, or more to taste', quantity = 2, unit = 'tbsp' WHERE id = '99f8bc71-0b07-4db6-a59a-da767f8e3953';

-- ===== Breakfast Oat Cookies =====
UPDATE recipe_ingredients SET name = 'Almond meal', quantity = 30, unit = 'g' WHERE id = 'af744cd1-3716-41a1-9648-b6ecbc3fbbe2';
UPDATE recipe_ingredients SET name = 'Desiccated coconut', quantity = 3, unit = 'tbsp' WHERE id = '9fdc1586-64aa-425b-95b5-d413b90d921a';

-- ===== Carrot Pancakes With Almond Caramel =====
UPDATE recipe_ingredients SET name = 'Spelt flour', quantity = 140, unit = 'g' WHERE id = 'ae4b3a18-b1fc-484e-a6ba-855e35d6e9e3';
UPDATE recipe_ingredients SET name = 'Maple syrup', quantity = 60, unit = 'ml' WHERE id = 'dc103ddb-5c00-49d7-b360-be2f2659cb30';

-- ===== Chicken Thighs With Hoisin Rice =====
UPDATE recipe_ingredients SET name = 'Jasmine rice', quantity = 200, unit = 'g' WHERE id = 'b5b6b61a-795a-4cf0-924b-d8432dc94cd8';
UPDATE recipe_ingredients SET name = 'Spring onions, chopped', quantity = 4, unit = 'whole' WHERE id = 'af98640c-74fa-4fac-a4a9-7741cf4294c3';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('60cc3ca4-1a48-4289-8803-c8cc7fca777f', 'Garlic, sliced', 4, 'cloves', 3);

-- ===== Chinese Pork Stir-Fry With Pineapple =====
UPDATE recipe_ingredients SET name = 'Pork tenderloin', quantity = 400, unit = 'g' WHERE id = 'b2b1ac2c-f702-4ce9-88d0-99b12f8fe4b9';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('dd93dca3-10fc-478f-ac23-5bdbcf8aba7e', 'Potato starch', 1, 'tbsp', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('dd93dca3-10fc-478f-ac23-5bdbcf8aba7e', 'White rice', 100, 'g', 4);

-- ===== Cinnamon Roll Protein Smoothie =====
UPDATE recipe_ingredients SET name = 'Banana', quantity = 1, unit = 'whole' WHERE id = '6d18de75-8f90-4836-a229-5e1617dac57d';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('8092a6f3-c1ea-4a48-bc15-f0e3e469c7bf', 'Vanilla protein powder', 50, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('8092a6f3-c1ea-4a48-bc15-f0e3e469c7bf', 'Cinnamon', 1, 'tsp', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('8092a6f3-c1ea-4a48-bc15-f0e3e469c7bf', 'Almond milk', 240, 'ml', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('8092a6f3-c1ea-4a48-bc15-f0e3e469c7bf', 'Ice cubes', 1, 'cup', 4);

-- ===== Cod With Creamy Zoodles =====
UPDATE recipe_ingredients SET name = 'Vegetable stock', quantity = 60, unit = 'ml' WHERE id = '070575d6-b93d-4991-9371-24a306b4d9ab';
UPDATE recipe_ingredients SET name = 'Cream (dairy or plant-based)', quantity = 80, unit = 'ml' WHERE id = '55d0e576-3b2f-4e03-bd46-56cd64771829';

-- ===== Easy Greek Zoodle Salad =====
UPDATE recipe_ingredients SET name = 'Cherry tomatoes', quantity = 250, unit = 'g' WHERE id = 'c5df3361-b158-4acf-a5eb-390193847613';

-- ===== Eggs Fried On Tomatoes With Tuna =====
UPDATE recipe_ingredients SET name = 'Large tomato', quantity = 1, unit = 'whole' WHERE id = '58add05b-5e59-4268-9138-bd27c589e91c';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('15ce8fc9-3e5b-4bf0-8ac0-8a9e5d5226ac', 'Coconut oil', 1, 'tsp', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('15ce8fc9-3e5b-4bf0-8ac0-8a9e5d5226ac', 'Eggs', 2, 'whole', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('15ce8fc9-3e5b-4bf0-8ac0-8a9e5d5226ac', 'Tuna in brine', 80, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('15ce8fc9-3e5b-4bf0-8ac0-8a9e5d5226ac', 'Oregano', NULL, 'pinch', 4);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('15ce8fc9-3e5b-4bf0-8ac0-8a9e5d5226ac', 'Chili flakes', NULL, 'pinch', 5);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('15ce8fc9-3e5b-4bf0-8ac0-8a9e5d5226ac', 'Parsley, chopped, to serve', NULL, NULL, 6);

-- ===== Energy Balls =====
UPDATE recipe_ingredients SET name = 'Almonds', quantity = 60, unit = 'g' WHERE id = '0ae0617b-fdee-46f6-963b-2e0549a9e25b';
UPDATE recipe_ingredients SET name = 'Desiccated coconut', quantity = 30, unit = 'g' WHERE id = 'e4d27af0-8b22-4bb9-ac3c-67ed1eb06439';

-- ===== Fit Almond Energy Balls =====
UPDATE recipe_ingredients SET name = 'Honey (or maple syrup)', quantity = 2, unit = 'tbsp' WHERE id = '9e478a20-d5ea-49bb-a98d-4e25b8738679';
UPDATE recipe_ingredients SET name = 'Desiccated coconut', quantity = 2, unit = 'tbsp' WHERE id = '6116d5f5-9341-42a4-8e35-d9276f1cb5ba';

-- ===== Green Beans & Cherry Tomato Salad =====
UPDATE recipe_ingredients SET name = 'Cherry tomatoes', quantity = 150, unit = 'g' WHERE id = 'c85f9c61-3f73-49b1-ad67-71fe80fada71';

-- ===== Green Glow Protein Smoothie =====
UPDATE recipe_ingredients SET name = 'Water', quantity = NULL, unit = NULL WHERE id = 'b7a6952a-f705-45b4-892e-a526f538610b';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('01cbfad6-3e3f-4100-baad-d8727e8bf4f1', 'Vanilla protein powder, optional', 25, 'g', 3);

-- ===== Grilled Lemon Chicken Salad =====
UPDATE recipe_ingredients SET name = 'Skinless, boneless chicken breasts', quantity = 4, unit = 'whole' WHERE id = '6d406aa8-3c14-4e8e-8a65-1da50e155177';
UPDATE recipe_ingredients SET name = 'Rocket', quantity = 120, unit = 'g' WHERE id = '422fd4d8-b2a8-4fdc-a353-b32e2788cd1b';

-- ===== Grilled Vegetable Salad With Tuna =====
UPDATE recipe_ingredients SET name = 'Tuna pieces in olive oil', quantity = 160, unit = 'g' WHERE id = '397cc8ee-8949-415f-ae7d-d7a3ae4d485c';

-- ===== Healthy Coronation Chicken Salad =====
UPDATE recipe_ingredients SET name = 'Curry powder (or paste)', quantity = 1, unit = 'tsp' WHERE id = '87b00789-9f8f-41bb-91d1-3570938ef5e0';

-- ===== Homemade Quinoa Chicken Nuggets =====
UPDATE recipe_ingredients SET name = 'Cooked quinoa', quantity = 185, unit = 'g' WHERE id = '16cc395f-c81f-4289-9930-c9fab0567f4a';
UPDATE recipe_ingredients SET name = 'Parmesan, grated', quantity = 30, unit = 'g' WHERE id = '189d79fe-38db-456b-9f8c-029a67840776';
UPDATE recipe_ingredients SET name = 'Dried herbs, of choice', quantity = 1, unit = 'tbsp' WHERE id = 'ab026d0f-245a-4a01-8f3a-df69078a6825';

-- ===== Lemon & Berry Cheesecake =====
UPDATE recipe_ingredients SET name = 'Desiccated coconut', quantity = 40, unit = 'g' WHERE id = '4988d47a-88eb-482d-bb47-ed8da52da00b';
UPDATE recipe_ingredients SET name = 'Coconut cream', quantity = 240, unit = 'ml' WHERE id = '13f8ced2-a436-4c7c-b37f-3593dbbaba17';
UPDATE recipe_ingredients SET name = 'Maple syrup', quantity = 120, unit = 'ml' WHERE id = '9e416a1c-10f3-4437-8e25-2ff0446bce72';

-- ===== Low Carb Banana & Strawberry Cake =====
UPDATE recipe_ingredients SET name = 'Almond flour', quantity = 60, unit = 'g' WHERE id = 'ab8ed58e-eee1-4c0b-8ba7-304ff232c3a9';

-- ===== Matcha Energy Balls =====
UPDATE recipe_ingredients SET name = 'Desiccated coconut', quantity = 80, unit = 'g' WHERE id = '6f197a38-8d77-4afd-892e-978c6f97056d';

-- ===== Miso Salmon With Zucchini Noodles =====
UPDATE recipe_ingredients SET name = 'Salmon fillets, 130g each', quantity = 2, unit = 'whole' WHERE id = '41187dd0-d8f3-44b2-a8d7-ee239afe4d80';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Miso paste', 2, 'tbsp', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Honey', 2, 'tbsp', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Tamari, or soy sauce', 60, 'ml', 4);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Ginger, grated', 2, 'tbsp', 5);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Apple cider vinegar', 2, 'tbsp', 6);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Sesame oil', 1, 'tbsp', 7);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Sesame seeds', 2, 'tsp', 8);
UPDATE recipe_ingredients SET name = 'Zucchini noodles', quantity = 400, unit = 'g' WHERE id = '1071a478-b524-4c57-866c-8fb8b35df1be';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Radishes, sliced', 6, 'whole', 9);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Sesame oil', 2, 'tsp', 10);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Ginger, grated', 2, 'tsp', 11);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Honey', 1, 'tsp', 12);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Soy sauce', 2, 'tbsp', 13);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('0ab99c30-1d60-4ac1-b75f-bb8ab540a9dd', 'Lime, juiced', 1, 'whole', 14);

-- ===== Omelet With Cottage Cheese & Basil =====
UPDATE recipe_ingredients SET name = 'Cottage cheese', quantity = 200, unit = 'g' WHERE id = '0974ae07-1610-4e4f-bfeb-be5f92b480d5';

-- ===== One Pot Turkey Chili With Rice =====
UPDATE recipe_ingredients SET name = 'Hot pepper', quantity = 0.5, unit = 'tsp' WHERE id = '4c47ccd5-fb76-4b5a-b111-0ac356e56f61';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('f3bd9a9a-e180-46a3-8b79-0fb12f7e5b5b', 'Salt', 0.5, 'tsp', 3);

-- ===== Peanut Butter Protein Fluff =====
UPDATE recipe_ingredients SET name = 'Full-fat Greek yogurt', quantity = 250, unit = 'g' WHERE id = 'b39ae81d-c03e-4eb7-8331-36696062f97c';
UPDATE recipe_ingredients SET name = 'Peanut butter', quantity = 2, unit = 'tbsp' WHERE id = '229cc452-71db-4115-9b43-a4ec4bd56cc4';

-- ===== Pear, Cured Ham & Walnut Salad =====
UPDATE recipe_ingredients SET name = 'Cured ham, cut into strips', quantity = 4, unit = 'slices' WHERE id = '381e12cf-8fd6-4aea-b920-0f09e6bf8167';

-- ===== Pepper Steak =====
UPDATE recipe_ingredients SET name = 'Round beef, trimmed', quantity = 340, unit = 'g' WHERE id = '087f9bf1-322f-4b4f-9bd4-5bed81bff845';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Soy sauce (for marinating beef)', 4, 'tsp', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Soy sauce (for the sauce)', 3, 'tbsp', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Rice wine', 1, 'tbsp', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Buckwheat flour', 3, 'tsp', 4);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Coconut oil', 2, 'tsp', 5);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Large onion, sliced into strips', 1, 'whole', 6);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Red bell pepper, sliced into strips', 1, 'whole', 7);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Black pepper', 0.5, 'tsp', 8);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ea373e81-906b-414d-8ce9-d6439bbc353f', 'Crushed red pepper flakes, to taste', NULL, NULL, 9);

-- ===== Pesto Pasta With Tuna & Almonds =====
UPDATE recipe_ingredients SET name = 'Gluten-free fusilli', quantity = 300, unit = 'g' WHERE id = '55627e19-809f-4730-99dc-074a5c7e773d';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('eac3c57f-aaf6-45ea-afc6-1dcdeb90aa71', 'Green beans', 400, 'g', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('eac3c57f-aaf6-45ea-afc6-1dcdeb90aa71', 'Tuna in water, drained (2 tins)', 240, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('eac3c57f-aaf6-45ea-afc6-1dcdeb90aa71', 'Roasted almonds, chopped', 30, 'g', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('eac3c57f-aaf6-45ea-afc6-1dcdeb90aa71', 'Green pesto', 130, 'g', 4);

-- ===== Post-Workout Potato Pancakes With Cottage Cheese =====
UPDATE recipe_ingredients SET name = 'Natural yogurt', quantity = 1, unit = 'tbsp' WHERE id = '79b6008c-b540-467c-b3a7-781e9e7ceec7';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('03a00cd6-ed0f-4032-9f20-f459220ff157', 'Radishes, chopped', 2, 'whole', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('03a00cd6-ed0f-4032-9f20-f459220ff157', 'Dill, chopped', 1, 'tbsp', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('03a00cd6-ed0f-4032-9f20-f459220ff157', 'Shallot, chopped', 0.5, 'whole', 3);

-- ===== Potato & Sundried Tomato Salad =====
UPDATE recipe_ingredients SET name = 'Baby potatoes', quantity = 450, unit = 'g' WHERE id = '4313e29b-a12b-4398-97d3-2e82322fb304';
UPDATE recipe_ingredients SET name = 'Oil from sundried tomatoes', quantity = 1, unit = 'tbsp' WHERE id = '140ccbae-79e9-4c85-ae2c-d69d04c5bbe4';
UPDATE recipe_ingredients SET name = 'Wholegrain mustard', quantity = 1, unit = 'tbsp' WHERE id = 'fbc75cc6-eb56-4f04-86d9-035a0b8274bb';

-- ===== Protein Berry Smoothie Bowl =====
UPDATE recipe_ingredients SET name = 'Coconut milk', quantity = 60, unit = 'ml' WHERE id = '64f52b5b-0098-4be5-8448-82485c989bc5';

-- ===== Protein Fruit Bowls =====
UPDATE recipe_ingredients SET name = 'Natural quark', quantity = 200, unit = 'g' WHERE id = '061bc782-75b4-4af1-846d-d0592f118859';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('e5ef0d72-db9d-42a8-bef1-ebd91c5d5cfb', 'Mango, chopped', 0.25, 'whole', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('e5ef0d72-db9d-42a8-bef1-ebd91c5d5cfb', 'Granola', 1, 'tbsp', 2);

-- ===== Quick & Easy Meatballs =====
UPDATE recipe_ingredients SET name = 'Lean ground beef', quantity = 500, unit = 'g' WHERE id = '96bc1915-e4d3-4a15-850a-8d1d1d4b11c4';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Small onion, finely diced', 1, 'whole', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Garlic cloves, minced', 2, 'cloves', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Red pepper, diced', 1, 'whole', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Egg', 1, 'whole', 4);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Buckwheat flour', 30, 'g', 5);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Coriander, chopped', 0.25, 'cup', 6);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Oregano', 1, 'tsp', 7);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('5365ab8b-b69c-46d7-92a2-01316172b741', 'Streaky bacon', 12, 'slices', 8);

-- ===== Red Sweet Potato Curry =====
UPDATE recipe_ingredients SET name = 'Chopped tomatoes, canned', quantity = 400, unit = 'g' WHERE id = '6bd97b5e-9c4a-460c-8b24-0d869e01fd71';
UPDATE recipe_ingredients SET name = 'Vegetable broth', quantity = 240, unit = 'ml' WHERE id = 'fdf64018-45c5-4b93-a017-54aa9c35e78d';
UPDATE recipe_ingredients SET name = 'Coconut milk, light, canned', quantity = 120, unit = 'ml' WHERE id = '731879a3-54df-4fe3-81a8-9743dd44f96f';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ffbefa10-4f21-43aa-b07c-b79603ec6b75', 'Lime, juiced', 1, 'whole', 12);
UPDATE recipe_ingredients SET name = 'Cooked rice', quantity = 480, unit = 'g' WHERE id = '6ebd0494-7b40-41b0-8a07-382245501648';

-- ===== Roasted Aubergine And Tomato Stew =====
UPDATE recipe_ingredients SET name = 'Cherry tomatoes', quantity = 330, unit = 'g' WHERE id = 'd3fff590-fc52-45cf-b2b5-d6f36281418f';
UPDATE recipe_ingredients SET name = 'Chopped tomatoes, canned', quantity = 400, unit = 'g' WHERE id = '96fe419a-24bd-4275-bd12-23fd4507d942';
UPDATE recipe_ingredients SET name = 'Chopped tomatoes, canned', quantity = 400, unit = 'g' WHERE id = '46c4814c-828f-44d4-90a0-f1df985d8c40';

-- ===== Roasted Sweet Potato, Kale & Quinoa Salad =====
UPDATE recipe_ingredients SET name = 'Sweet potatoes, medium', quantity = 2, unit = 'whole' WHERE id = 'a06f81c5-88c3-4a02-bc01-1d19faa7aa0b';
UPDATE recipe_ingredients SET name = 'Red onion, cut into wedges', quantity = 1, unit = 'whole' WHERE id = 'f0180319-3acb-490d-92c8-fa6f4b2ae1a2';

-- ===== Salmon Spring Rolls =====
UPDATE recipe_ingredients SET name = 'Salmon, cut into strips', quantity = 200, unit = 'g' WHERE id = '7a6dc7c7-7073-44b6-8eb8-72fb132dd9f2';
UPDATE recipe_ingredients SET name = 'Soy sauce or tamari (GF), to taste', quantity = NULL, unit = NULL WHERE id = '3b96bd6a-157e-4dda-af16-7ada4b5889d4';

-- ===== Salmon Teriyaki With Green Beans & Sweetcorn =====
UPDATE recipe_ingredients SET name = 'Soy sauce', quantity = 8, unit = 'tbsp' WHERE id = '5ec87fd1-da2c-418b-872c-921f44bdd153';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('d4a56ee5-af8d-46c5-bf04-9792fd5abdd9', 'Maple syrup', 3, 'tbsp', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('d4a56ee5-af8d-46c5-bf04-9792fd5abdd9', 'Lime juice', 1, 'tbsp', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('d4a56ee5-af8d-46c5-bf04-9792fd5abdd9', 'Ginger, grated', 4, 'tbsp', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('d4a56ee5-af8d-46c5-bf04-9792fd5abdd9', 'Garlic cloves, grated', 2, 'cloves', 4);

-- ===== Sesame & Ginger Beef With Zucchini Noodles =====
UPDATE recipe_ingredients SET name = 'Xylitol (or other sweetener)', quantity = 1, unit = 'tbsp' WHERE id = 'd740ac23-b21c-4940-9ee5-3ef5b2a9e043';

-- ===== Sesame Tempeh Stir-Fry =====
UPDATE recipe_ingredients SET name = 'Tamari (or soy sauce)', quantity = 3, unit = 'tbsp' WHERE id = '80a91ec9-89f7-4484-b73e-1d0d3a768606';
UPDATE recipe_ingredients SET name = 'Sesame seeds, to serve', quantity = 1, unit = 'tbsp' WHERE id = '30195f85-4b4b-417e-b03a-2bd7cef7ff95';
UPDATE recipe_ingredients SET name = 'Spring onion or chives, to serve', quantity = NULL, unit = NULL WHERE id = '38bbb87f-94a2-4ead-b4a6-eb316526ff4a';
UPDATE recipe_ingredients SET name = 'Brown rice, cooked', quantity = 585, unit = 'g' WHERE id = '251ed38a-fc42-4e8a-8baa-e4c5d298f4e7';

-- ===== Simple Chicken Curry With Saffron Rice =====
UPDATE recipe_ingredients SET name = 'Boiling water', quantity = 60, unit = 'ml' WHERE id = '103aebf2-3344-42bd-b0d1-0ab99d05b994';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ca0c56b2-42a1-4665-8f99-cb64dcd412f8', 'Saffron threads', 0.125, 'tsp', 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ca0c56b2-42a1-4665-8f99-cb64dcd412f8', 'Basmati rice', 225, 'g', 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ca0c56b2-42a1-4665-8f99-cb64dcd412f8', 'Coconut oil', 1, 'tsp', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ca0c56b2-42a1-4665-8f99-cb64dcd412f8', 'Onion powder', 0.5, 'tsp', 4);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ca0c56b2-42a1-4665-8f99-cb64dcd412f8', 'Salt', 0.25, 'tsp', 5);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('ca0c56b2-42a1-4665-8f99-cb64dcd412f8', 'Vegetable stock', 1.75, 'cup', 6);

-- ===== Simple Vegan Oat Cookies =====
UPDATE recipe_ingredients SET name = 'Almond meal', quantity = 70, unit = 'g' WHERE id = 'c457c96f-bd16-4eeb-893e-8cc7a7f91788';

-- ===== Slow Cooker Chicken Fajitas =====
UPDATE recipe_ingredients SET name = 'Tortillas, to serve', quantity = NULL, unit = NULL WHERE id = 'cd7d468b-b532-4989-8cf2-87b91912c8f8';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('01b1d720-a59a-4b54-b641-718fed42b6d0', 'Cream, to serve', NULL, NULL, 1);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('01b1d720-a59a-4b54-b641-718fed42b6d0', 'Guacamole, to serve', NULL, NULL, 2);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('01b1d720-a59a-4b54-b641-718fed42b6d0', 'Coriander, to serve', NULL, NULL, 3);

-- ===== Smoked Salmon & Strawberry Salad =====
UPDATE recipe_ingredients SET name = 'Lamb''s lettuce (or mixed salad leaves)', quantity = 4, unit = 'handful' WHERE id = '666e705f-e6c6-47f7-81e5-e43967af199a';
UPDATE recipe_ingredients SET name = 'Smoked salmon', quantity = 100, unit = 'g' WHERE id = '60ecdf42-8289-47d5-9e2b-69adbce9f756';

-- ===== Spicy Cauliflower & Chickpea Rice Bowl =====
UPDATE recipe_ingredients SET name = 'Chickpeas, canned, drained', quantity = 400, unit = 'g' WHERE id = 'd9466efc-2fa8-454a-aebe-811c536cea43';

-- ===== Spinach Risotto =====
UPDATE recipe_ingredients SET name = 'Vegetable stock', quantity = 1200, unit = 'ml' WHERE id = 'd7828882-138e-4194-9d98-74c5c6d58751';

-- ===== Strawberry Protein Muffins =====
UPDATE recipe_ingredients SET name = 'Unsweetened applesauce', quantity = 2, unit = 'tbsp' WHERE id = '59927505-1a1c-4c52-9cbc-5c5d82ea4234';
UPDATE recipe_ingredients SET name = 'Non-fat Greek yogurt', quantity = 125, unit = 'g' WHERE id = '29f07b0e-b52f-432e-80c8-0ee28b6f0365';
UPDATE recipe_ingredients SET name = 'Strawberries, chopped', quantity = 100, unit = 'g' WHERE id = 'c9662cfd-e693-44e7-8f29-81b4020fa112';

-- ===== Sundried Tomato Hummus =====
UPDATE recipe_ingredients SET name = 'Chickpeas, canned, drained', quantity = 250, unit = 'g' WHERE id = 'd53cee07-be4e-4993-837f-5f5f8ef88d27';
UPDATE recipe_ingredients SET name = 'Sundried tomatoes', quantity = 45, unit = 'g' WHERE id = '41551000-bff0-4a60-867b-c140c63118a1';

-- ===== Sweet Potato & Bean Bake =====
UPDATE recipe_ingredients SET name = 'Mixed herbs, more to season layers', quantity = 1, unit = 'tsp' WHERE id = '99b3fae0-fc91-481b-826e-6112d60b79ba';
UPDATE recipe_ingredients SET name = 'Chopped tomatoes, canned', quantity = 400, unit = 'g' WHERE id = '8f69a0ce-b72a-4a49-99f0-38e1d9fdbd0b';

-- ===== Tempeh Bolognese =====
UPDATE recipe_ingredients SET name = 'Chopped tomatoes, canned', quantity = 400, unit = 'g' WHERE id = 'dc89aebf-e279-44b9-9962-78692fd390cc';

-- ===== Tom Yum Soup With Shrimps =====
UPDATE recipe_ingredients SET name = 'Vegetable stock', quantity = 1000, unit = 'ml' WHERE id = '81a8526b-0155-402b-8533-c22712faaa44';
UPDATE recipe_ingredients SET name = 'Coconut milk', quantity = 100, unit = 'ml' WHERE id = '6ca08be2-61ea-46a9-9912-4203d5f3dfb7';

-- ===== Vegan 'Tuna' Salad =====
UPDATE recipe_ingredients SET name = 'Chickpeas, canned, drained', quantity = 400, unit = 'g' WHERE id = '58294770-4629-4f90-9431-673a30c68177';
UPDATE recipe_ingredients SET name = 'Vegan mayo (or plain vegan yogurt)', quantity = 2, unit = 'tbsp' WHERE id = '994e0937-1cf9-4b71-811f-aa46b3ca576a';

-- ===== Vegan Chocolate Brownies =====
UPDATE recipe_ingredients SET name = '70%+ dark chocolate, chopped', quantity = 220, unit = 'g' WHERE id = '7cc86e4a-e99a-4582-9490-94d4760dbe19';
UPDATE recipe_ingredients SET name = 'Unsweetened cocoa powder', quantity = 30, unit = 'g' WHERE id = '084f6166-74d6-4393-b97b-22294f7727ce';

-- ===== Vegan Crème Brulee =====
UPDATE recipe_ingredients SET name = 'Canned coconut milk', quantity = 200, unit = 'ml' WHERE id = '2c6b4e7a-9964-483c-8c23-c549683215e6';
UPDATE recipe_ingredients SET name = 'Almond milk', quantity = 400, unit = 'ml' WHERE id = 'b97ca0d8-ce34-4b83-a5f7-a12c42d98c15';

-- ===== Vegan Nutella =====
UPDATE recipe_ingredients SET name = 'Roasted hazelnuts', quantity = 240, unit = 'g' WHERE id = '6b28ea07-fa0e-43a8-bb94-82dc125ec595';

-- ===== Warm Salmon & Quinoa Salad =====
UPDATE recipe_ingredients SET name = 'Boiling water', quantity = 1000, unit = 'ml' WHERE id = 'ac73fe42-785d-4758-a4fe-da409ce3e43a';
UPDATE recipe_ingredients SET name = 'Cooked quinoa', quantity = 250, unit = 'g' WHERE id = 'a7edc292-c716-4a42-b4a0-77ac63553e0d';

-- ===== Zesty Turkey Meatballs With Couscous Salad =====
UPDATE recipe_ingredients SET name = 'Coconut oil', quantity = 2, unit = 'tbsp' WHERE id = '897a144f-86cd-4632-81cb-ee0935d5871c';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Onion, chopped', 1, 'whole', 3);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Chili flakes', 0.25, 'tsp', 4);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Garlic cloves, chopped', 2, 'cloves', 5);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Turkey thigh mince', 500, 'g', 6);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Mint leaves, finely chopped', 2, 'handful', 7);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Lemon, zested and juiced', 1, 'whole', 8);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Greek yogurt, 0% fat', 200, 'g', 9);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Garlic clove, minced', 1, 'cloves', 10);
UPDATE recipe_ingredients SET name = 'Couscous', quantity = 200, unit = 'g' WHERE id = 'da2fe5d4-47a4-4aa3-907e-f2c6148ed4ec';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Couscous, extra for binding meatballs', 1, 'tbsp', 11);
UPDATE recipe_ingredients SET name = 'Vegetable stock (from cube)', quantity = 250, unit = 'ml' WHERE id = 'd7dbd0cc-91bb-4b13-b205-c80d904fa6d6';
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Frozen peas', 200, 'g', 12);
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order) VALUES ('36b5bb1c-7a8f-4235-91ef-4ba8e1f51e4d', 'Radishes, finely sliced', 8, 'whole', 13);
