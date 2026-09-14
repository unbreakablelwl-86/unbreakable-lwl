UPDATE recipe_ingredients AS ri
SET quantity = v.quantity, unit = v.unit, name = v.name
FROM (VALUES
('3a7ce14e-6750-450e-890f-61ebb4befd06', 2.0::numeric, 'cm', 'Ginger'),
('f62a69e9-d99b-46ab-ae67-dbc5eba3120b', 8.0::numeric, 'whole', 'Skinless chicken thighs'),
('9017b8d4-0fe6-4197-bc06-92f17aa5db7a', 2.0::numeric, 'whole', 'Chicken breast fillets (around 150g each)'),
('67320e4a-a5ca-4668-a5d7-71dd0581941a', 1.0::numeric, 'tsp', 'Cumin'),
('a9985b08-67f1-4a11-b3f4-ea48538fe32c', 1.0::numeric, 'tsp', 'Sweet pepper'),
('1d250698-2493-4c4a-b938-191f159b6f95', 0.75::numeric, 'cup', 'Egg whites (around 3 eggs)'),
('12a0f22e-74c8-4fcc-9ae8-43dedfa88d27', 1.0::numeric, 'bunch', 'Spring onions, trimmed and sliced'),
('ef86ff66-5efb-4cbd-bda8-ccefe76e767e', 230.0::numeric, 'g', 'Cashews, soaked for 4 hours or overnight'),
('fe99dff9-f696-43d0-9bc7-89511e90833e', 1.0::numeric, 'pinch', 'Salt'),
('c6b54eea-4914-4093-a78d-923ac31c6d4c', 600.0::numeric, 'g', 'Whitefish fillets (such as cod), coarsely chopped')
) AS v(id, quantity, unit, name)
WHERE ri.id = v.id::uuid;

UPDATE recipe_ingredients
SET name = 'Salt and pepper'
WHERE id = 'f6bef552-fa4e-4f08-b360-84959f2a1d05';
