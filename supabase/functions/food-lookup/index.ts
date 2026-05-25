import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
    proteins_100g?: number;
    proteins_serving?: number;
    carbohydrates_100g?: number;
    carbohydrates_serving?: number;
    fat_100g?: number;
    fat_serving?: number;
    fiber_100g?: number;
    fiber_serving?: number;
    sugars_100g?: number;
    sugars_serving?: number;
    sodium_100g?: number;
    sodium_serving?: number;
  };
  image_front_small_url?: string;
  image_url?: string;
}

interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface FoodResult {
  barcode?: string;
  name: string;
  brand?: string;
  servingSize: string;
  servingQuantityG?: number; // serving size in grams if available
  hasServingData: boolean; // whether per-serving data is available
  per100g: NutritionValues;
  perServing: NutritionValues;
  // Legacy fields for backward compatibility
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  imageUrl?: string;
  source: 'api' | 'user_library';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to use this feature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { type, query, barcode, userId } = body as {
      type: 'barcode' | 'search';
      query?: string;
      barcode?: string;
      userId?: string;
    };

    // Input validation
    if (!type || !['barcode', 'search'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid lookup type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (type === 'barcode' && (!barcode || typeof barcode !== 'string' || barcode.length > 50 || !/^[a-zA-Z0-9-]+$/.test(barcode))) {
      return new Response(JSON.stringify({ error: 'Invalid barcode format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (type === 'search' && (!query || typeof query !== 'string' || query.length > 200)) {
      return new Response(JSON.stringify({ error: 'Invalid search query (max 200 chars)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Barcode lookup
    if (type === 'barcode' && barcode) {
      // First check user's saved foods
      if (userId) {
        const { data: savedFood } = await supabase
          .from('saved_foods')
          .select('*')
          .eq('user_id', userId)
          .eq('barcode', barcode)
          .maybeSingle();

        if (savedFood) {
          const per100g: NutritionValues = {
            calories: savedFood.calories,
            protein: savedFood.protein_g || 0,
            carbs: savedFood.carbs_g || 0,
            fat: savedFood.fat_g || 0,
            fiber: savedFood.fiber_g,
            sugar: savedFood.sugar_g,
            sodium: savedFood.sodium_mg,
          };
          
          return new Response(JSON.stringify({
            found: true,
            result: {
              barcode: savedFood.barcode,
              name: savedFood.food_name,
              brand: savedFood.brand,
              servingSize: savedFood.serving_size || '100g',
              hasServingData: false, // User library items don't have separate serving data
              per100g,
              perServing: per100g, // Same as per100g for user items
              // Legacy fields
              calories: savedFood.calories,
              protein: savedFood.protein_g || 0,
              carbs: savedFood.carbs_g || 0,
              fat: savedFood.fat_g || 0,
              fiber: savedFood.fiber_g,
              sugar: savedFood.sugar_g,
              sodium: savedFood.sodium_mg,
              source: 'user_library',
            } as FoodResult,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Query Open Food Facts API
      const offResponse = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
        {
          headers: {
            'User-Agent': 'UnbreakableApp/1.0 - training nutrition app',
          },
        }
      );

      if (!offResponse.ok) {
        return new Response(JSON.stringify({ found: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const offData = await offResponse.json();
      
      if (offData.status !== 1 || !offData.product) {
        return new Response(JSON.stringify({ found: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const product: OpenFoodFactsProduct = offData.product;
      const nutriments = product.nutriments || {};

      // Build per-100g values
      const per100g: NutritionValues = {
        calories: Math.round(nutriments['energy-kcal_100g'] || 0),
        protein: Math.round(nutriments.proteins_100g || 0),
        carbs: Math.round(nutriments.carbohydrates_100g || 0),
        fat: Math.round(nutriments.fat_100g || 0),
        fiber: nutriments.fiber_100g ? Math.round(nutriments.fiber_100g) : undefined,
        sugar: nutriments.sugars_100g ? Math.round(nutriments.sugars_100g) : undefined,
        sodium: nutriments.sodium_100g ? Math.round(nutriments.sodium_100g * 1000) : undefined,
      };

      // Build per-serving values (if available)
      const hasServingData = nutriments['energy-kcal_serving'] !== undefined;
      const perServing: NutritionValues = hasServingData ? {
        calories: Math.round(nutriments['energy-kcal_serving'] || 0),
        protein: Math.round(nutriments.proteins_serving || 0),
        carbs: Math.round(nutriments.carbohydrates_serving || 0),
        fat: Math.round(nutriments.fat_serving || 0),
        fiber: nutriments.fiber_serving ? Math.round(nutriments.fiber_serving) : per100g.fiber,
        sugar: nutriments.sugars_serving ? Math.round(nutriments.sugars_serving) : per100g.sugar,
        sodium: nutriments.sodium_serving ? Math.round(nutriments.sodium_serving * 1000) : per100g.sodium,
      } : per100g;

      // Parse serving quantity if available
      let servingQuantityG: number | undefined;
      if (product.serving_quantity) {
        servingQuantityG = product.serving_quantity;
      } else if (product.serving_size) {
        // Try to extract grams from serving size string like "30g" or "250ml"
        const match = product.serving_size.match(/(\d+(?:\.\d+)?)\s*g/i);
        if (match) {
          servingQuantityG = parseFloat(match[1]);
        }
      }

      const result: FoodResult = {
        barcode: product.code,
        name: product.product_name || 'Unknown Product',
        brand: product.brands?.split(',')[0],
        servingSize: product.serving_size || '100g',
        servingQuantityG,
        hasServingData,
        per100g,
        perServing,
        // Legacy fields - default to per-serving for backward compatibility
        calories: perServing.calories,
        protein: perServing.protein,
        carbs: perServing.carbs,
        fat: perServing.fat,
        fiber: perServing.fiber,
        sugar: perServing.sugar,
        sodium: perServing.sodium,
        imageUrl: product.image_front_small_url || product.image_url,
        source: 'api',
      };

      return new Response(JSON.stringify({ found: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Text search
    if (type === 'search' && query) {
      const results: FoodResult[] = [];

      // First search user's saved foods
      if (userId) {
        const { data: savedFoods } = await supabase
          .from('saved_foods')
          .select('*')
          .eq('user_id', userId)
          .ilike('food_name', `%${query}%`)
          .limit(10);

        if (savedFoods) {
          for (const food of savedFoods) {
            const per100g: NutritionValues = {
              calories: food.calories,
              protein: food.protein_g || 0,
              carbs: food.carbs_g || 0,
              fat: food.fat_g || 0,
              fiber: food.fiber_g,
              sugar: food.sugar_g,
              sodium: food.sodium_mg,
            };
            results.push({
              barcode: food.barcode,
              name: food.food_name,
              brand: food.brand,
              servingSize: food.serving_size || '100g',
              hasServingData: false,
              per100g,
              perServing: per100g,
              calories: food.calories,
              protein: food.protein_g || 0,
              carbs: food.carbs_g || 0,
              fat: food.fat_g || 0,
              fiber: food.fiber_g,
              sugar: food.sugar_g,
              sodium: food.sodium_mg,
              source: 'user_library',
            });
          }
        }
      }

      // Search Open Food Facts
      const searchQuery = encodeURIComponent(query);
      const offResponse = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1&page_size=20`,
        {
          headers: {
            'User-Agent': 'UnbreakableApp/1.0 - training nutrition app',
          },
        }
      );

      if (offResponse.ok) {
        const offData = await offResponse.json();
        const products: OpenFoodFactsProduct[] = offData.products || [];

        for (const product of products) {
          if (!product.product_name || !product.nutriments) continue;
          
          const nutriments = product.nutriments;
          const hasServing = nutriments['energy-kcal_serving'] !== undefined;

          // Skip products without calorie data
          if (!nutriments['energy-kcal_100g'] && !nutriments['energy-kcal_serving']) continue;

          const per100g: NutritionValues = {
            calories: Math.round(nutriments['energy-kcal_100g'] || 0),
            protein: Math.round(nutriments.proteins_100g || 0),
            carbs: Math.round(nutriments.carbohydrates_100g || 0),
            fat: Math.round(nutriments.fat_100g || 0),
            fiber: nutriments.fiber_100g ? Math.round(nutriments.fiber_100g) : undefined,
            sugar: nutriments.sugars_100g ? Math.round(nutriments.sugars_100g) : undefined,
            sodium: nutriments.sodium_100g ? Math.round(nutriments.sodium_100g * 1000) : undefined,
          };

          const hasServingData = hasServing;
          const perServing: NutritionValues = hasServing ? {
            calories: Math.round(nutriments['energy-kcal_serving'] || 0),
            protein: Math.round(nutriments.proteins_serving || 0),
            carbs: Math.round(nutriments.carbohydrates_serving || 0),
            fat: Math.round(nutriments.fat_serving || 0),
            fiber: nutriments.fiber_serving ? Math.round(nutriments.fiber_serving) : per100g.fiber,
            sugar: nutriments.sugars_serving ? Math.round(nutriments.sugars_serving) : per100g.sugar,
            sodium: nutriments.sodium_serving ? Math.round(nutriments.sodium_serving * 1000) : per100g.sodium,
          } : per100g;

          results.push({
            barcode: product.code,
            name: product.product_name,
            brand: product.brands?.split(',')[0],
            servingSize: product.serving_size || '100g',
            hasServingData,
            per100g,
            perServing,
            calories: perServing.calories,
            protein: perServing.protein,
            carbs: perServing.carbs,
            fat: perServing.fat,
            fiber: perServing.fiber,
            sugar: perServing.sugar,
            sodium: perServing.sodium,
            imageUrl: product.image_front_small_url,
            source: 'api',
          });
        }
      }

      return new Response(JSON.stringify({ 
        results,
        total: results.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid request type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("food-lookup error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Lookup failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
