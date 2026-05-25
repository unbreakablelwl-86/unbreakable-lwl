import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DESSERT_RECIPES = [
  {
    name: "Wet Nelly",
    description:
      "A traditional bread pudding soaked in syrup and baked until golden and sticky. High-protein twist with added egg and Greek yogurt.",
    instructions:
      "1. Preheat oven to 180°C.\n2. Slice day-old bread and arrange a layer in a greased baking dish.\n3. Spread a thin layer of jam (raspberry or blackcurrant) over the bread.\n4. Add another layer of bread on top.\n5. Whisk together eggs, milk, Greek yogurt, golden syrup and vanilla.\n6. Pour the custard mixture over the bread layers, pressing down gently.\n7. Sprinkle with mixed spice and a drizzle of golden syrup.\n8. Bake for 35-40 minutes until set and golden on top.\n9. Rest for 5 minutes, then serve warm.",
    calories_per_serving: 280,
    protein_g: 14,
    carbs_g: 42,
    fat_g: 6,
    prep_time_minutes: 15,
    cook_time_minutes: 40,
    servings: 6,
    dietary_tags: ["high-protein"],
    category: "desserts",
    pack: "High Protein",
    is_public: true,
    ingredients: [
      { name: "Day-Old Wholemeal Bread", quantity: 300, unit: "g" },
      { name: "Eggs", quantity: 3, unit: "large" },
      { name: "Semi-Skimmed Milk", quantity: 200, unit: "ml" },
      { name: "Greek Yogurt (0% fat)", quantity: 100, unit: "g" },
      { name: "Golden Syrup", quantity: 3, unit: "tbsp" },
      { name: "Raspberry Jam", quantity: 3, unit: "tbsp" },
      { name: "Vanilla Extract", quantity: 1, unit: "tsp" },
      { name: "Mixed Spice", quantity: 1, unit: "tsp" },
    ],
    image_prompt:
      "A golden-brown bread pudding (Wet Nelly) in a white ceramic baking dish, sticky syrup glistening on top, rustic kitchen setting, warm lighting, close-up overhead angle, no text or labels",
  },
  {
    name: "Coconut & Jam Tart",
    description:
      "A classic jam and desiccated coconut tart with a shortcrust base. Sweet, chewy and unmistakably British.",
    instructions:
      "1. Preheat oven to 190°C.\n2. Roll out shortcrust pastry and line a 20cm tart tin. Blind bake for 10 minutes.\n3. Spread a generous layer of raspberry jam across the pastry base.\n4. In a bowl, mix desiccated coconut, sugar, beaten eggs and vanilla.\n5. Spread the coconut mixture evenly over the jam layer.\n6. Bake for 25-30 minutes until the coconut topping is golden brown.\n7. Allow to cool before slicing.\n8. Serve at room temperature or slightly warm.",
    calories_per_serving: 310,
    protein_g: 8,
    carbs_g: 38,
    fat_g: 14,
    prep_time_minutes: 20,
    cook_time_minutes: 40,
    servings: 8,
    dietary_tags: [],
    category: "desserts",
    pack: "High Protein",
    is_public: true,
    ingredients: [
      { name: "Shortcrust Pastry", quantity: 250, unit: "g" },
      { name: "Raspberry Jam", quantity: 4, unit: "tbsp" },
      { name: "Desiccated Coconut", quantity: 150, unit: "g" },
      { name: "Caster Sugar", quantity: 80, unit: "g" },
      { name: "Eggs", quantity: 2, unit: "large" },
      { name: "Vanilla Extract", quantity: 1, unit: "tsp" },
    ],
    image_prompt:
      "A whole round jam and coconut tart on a wire cooling rack, golden toasted coconut topping with raspberry jam visible at the edges, one slice cut, rustic wooden table, warm natural light, no text or labels",
  },
  {
    name: "Dark Treacle Fruit Cake",
    description:
      "A rich, dense fruit cake packed with dried fruit, treacle and warming spices. A British teatime tradition.",
    instructions:
      "1. Preheat oven to 160°C. Line a 20cm round cake tin.\n2. In a saucepan, melt butter with brown sugar and treacle over low heat.\n3. Stir in mixed dried fruit, mixed spice, cinnamon and orange zest. Simmer for 5 minutes. Cool slightly.\n4. Beat in eggs one at a time.\n5. Fold in self-raising flour and ground almonds until just combined.\n6. Pour into the prepared tin.\n7. Bake for 60-70 minutes until a skewer comes out clean.\n8. Cool in the tin for 15 minutes, then turn out.\n9. Serve sliced, with or without butter.",
    calories_per_serving: 320,
    protein_g: 7,
    carbs_g: 48,
    fat_g: 12,
    prep_time_minutes: 20,
    cook_time_minutes: 70,
    servings: 10,
    dietary_tags: [],
    category: "desserts",
    pack: "High Protein",
    is_public: true,
    ingredients: [
      { name: "Self-Raising Flour", quantity: 200, unit: "g" },
      { name: "Ground Almonds", quantity: 50, unit: "g" },
      { name: "Butter", quantity: 100, unit: "g" },
      { name: "Dark Brown Sugar", quantity: 100, unit: "g" },
      { name: "Black Treacle", quantity: 2, unit: "tbsp" },
      { name: "Mixed Dried Fruit", quantity: 300, unit: "g" },
      { name: "Eggs", quantity: 2, unit: "large" },
      { name: "Mixed Spice", quantity: 2, unit: "tsp" },
      { name: "Cinnamon", quantity: 1, unit: "tsp" },
      { name: "Orange Zest", quantity: 1, unit: "orange" },
    ],
    image_prompt:
      "A dark rich fruit cake sliced on a wooden board, dense texture with visible dried fruit and dark treacle colour, one slice leaning against the cake, rustic kitchen, warm moody lighting, no text or labels",
  },
];

// Specific prompts for existing recipes that need better images
const IMAGE_FIXES: Record<string, string> = {
  "Corned Beef Hash":
    "A plate of corned beef hash: crispy pan-fried chunks of corned beef mixed with golden diced potatoes and onions, topped with a runny fried egg, served on a white plate, overhead angle, warm kitchen lighting, British comfort food, no text or labels",
  Hotpot:
    "A traditional Lancashire hotpot in a brown ceramic casserole dish: layers of tender lamb and sliced potatoes on top baked golden and crispy, rich gravy visible at the edges, overhead angle, cosy kitchen setting, no text or labels",
  "Eggy Bread":
    "Two slices of golden eggy bread (French toast) on a white plate with crispy lean bacon rashers on top, golden-brown surface, simple British breakfast style, warm natural light, overhead angle, no text or labels",
};

async function generateImage(
  prompt: string,
  apiKey: string
): Promise<string | null> {
  try {
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash-preview-05-20",
          messages: [
            {
              role: "user",
              content: `Generate a photorealistic food photograph. ${prompt}. Professional food photography, shallow depth of field, appetizing, ultra high resolution. IMPORTANT: absolutely NO text, NO labels, NO words, NO titles, NO watermarks on the image.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
  } catch {
    return null;
  }
}

async function uploadImage(
  supabase: any,
  imageDataUrl: string,
  recipeId: string
): Promise<string | null> {
  if (!imageDataUrl?.startsWith("data:image")) return null;
  const base64 = imageDataUrl.split(",")[1];
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const ext =
    imageDataUrl.match(/data:image\/(\w+);/)?.[1] || "png";
  const fileName = `${recipeId}.${ext}`;

  const { error } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, binary, { contentType: `image/${ext}`, upsert: true });
  if (error) return null;

  const { data } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(fileName);
  return data.publicUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!GOOGLE_AI_API_KEY)
      return new Response(
        JSON.stringify({ error: "GOOGLE_AI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const results: string[] = [];

    // 1. Seed the 3 dessert recipes
    for (const recipe of DESSERT_RECIPES) {
      const { image_prompt, ingredients, ...recipeData } = recipe;

      // Check if already exists
      const { data: existing } = await supabase
        .from("recipes")
        .select("id")
        .eq("name", recipeData.name)
        .is("user_id", null)
        .maybeSingle();

      let recipeId: string;

      if (existing) {
        recipeId = existing.id;
        results.push(`SKIP (exists): ${recipeData.name}`);
      } else {
        const { data: newRecipe, error } = await supabase
          .from("recipes")
          .insert({ ...recipeData, user_id: null })
          .select("id")
          .single();
        if (error) {
          results.push(`ERROR: ${recipeData.name} - ${error.message}`);
          continue;
        }
        recipeId = newRecipe.id;

        // Insert ingredients
        if (ingredients.length > 0) {
          await supabase.from("recipe_ingredients").insert(
            ingredients.map((ing, idx) => ({
              recipe_id: recipeId,
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              sort_order: idx,
            }))
          );
        }
        results.push(`SEEDED: ${recipeData.name}`);
      }

      // Generate image
      console.log(`🎨 Generating image for: ${recipeData.name}`);
      const imageUrl = await generateImage(image_prompt, GOOGLE_AI_API_KEY);
      if (imageUrl) {
        const publicUrl = await uploadImage(supabase, imageUrl, recipeId);
        if (publicUrl) {
          await supabase
            .from("recipes")
            .update({ image_url: publicUrl })
            .eq("id", recipeId);
          results.push(`IMAGE OK: ${recipeData.name}`);
        } else {
          results.push(`IMAGE UPLOAD FAIL: ${recipeData.name}`);
        }
      } else {
        results.push(`IMAGE GEN FAIL: ${recipeData.name}`);
      }
    }

    // 2. Fix images for existing recipes with bad images
    for (const [recipeName, prompt] of Object.entries(IMAGE_FIXES)) {
      const { data: recipe } = await supabase
        .from("recipes")
        .select("id")
        .eq("name", recipeName)
        .is("user_id", null)
        .maybeSingle();

      if (!recipe) {
        results.push(`NOT FOUND: ${recipeName}`);
        continue;
      }

      console.log(`🎨 Regenerating image for: ${recipeName}`);
      const imageUrl = await generateImage(prompt, GOOGLE_AI_API_KEY);
      if (imageUrl) {
        const publicUrl = await uploadImage(supabase, imageUrl, recipe.id);
        if (publicUrl) {
          await supabase
            .from("recipes")
            .update({ image_url: publicUrl })
            .eq("id", recipe.id);
          results.push(`IMAGE FIXED: ${recipeName}`);
        } else {
          results.push(`IMAGE UPLOAD FAIL: ${recipeName}`);
        }
      } else {
        results.push(`IMAGE GEN FAIL: ${recipeName}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
