import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ORANGE: [number, number, number] = [249, 115, 22];
const DARK: [number, number, number] = [24, 24, 27];
const WHITE: [number, number, number] = [255, 255, 255];
const GREY: [number, number, number] = [161, 161, 170];
const LIGHT_ORANGE: [number, number, number] = [255, 247, 237];

const CATEGORY_ORDER = ["Breakfast", "Lunch", "Main", "Snacks", "Desserts", "Shakes", "Other"];
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

interface Recipe {
  id: string; name: string; description?: string; instructions?: string;
  prep_time_minutes?: number; cook_time_minutes?: number; servings: number;
  calories_per_serving?: number; protein_g?: number; carbs_g?: number; fat_g?: number;
  dietary_tags?: string[]; pack?: string; category?: string; image_url?: string;
}

interface Ingredient {
  recipe_id: string; name: string; quantity?: number; unit?: string; sort_order?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch recipes
    const { data: recipes, error: recipeErr } = await supabase
      .from("recipes").select("*").eq("is_public", true)
      .order("category", { ascending: true }).order("name", { ascending: true });
    if (recipeErr) throw recipeErr;
    if (!recipes || recipes.length === 0) {
      return new Response(JSON.stringify({ error: "No public recipes found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch ingredients in batches
    const recipeIds = recipes.map((r: Recipe) => r.id);
    const allIngredients: Ingredient[] = [];
    for (let i = 0; i < recipeIds.length; i += 100) {
      const batch = recipeIds.slice(i, i + 100);
      const { data: ings, error: ingErr } = await supabase
        .from("recipe_ingredients").select("*").in("recipe_id", batch)
        .order("sort_order", { ascending: true });
      if (ingErr) throw ingErr;
      if (ings) allIngredients.push(...ings);
    }

    const ingredientMap = new Map<string, Ingredient[]>();
    for (const ing of allIngredients) {
      if (!ingredientMap.has(ing.recipe_id)) ingredientMap.set(ing.recipe_id, []);
      ingredientMap.get(ing.recipe_id)!.push(ing);
    }

    // Group by category
    const categoryMap = new Map<string, Recipe[]>();
    for (const recipe of recipes) {
      const cat = recipe.category || "Other";
      const normCat = CATEGORY_ORDER.find(c => c.toLowerCase() === cat.toLowerCase()) || "Other";
      if (!categoryMap.has(normCat)) categoryMap.set(normCat, []);
      categoryMap.get(normCat)!.push(recipe);
    }

    // ========== BUILD PDF ==========
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const addFooter = (dark: boolean) => {
      doc.setFontSize(7);
      doc.setTextColor(...GREY);
      doc.text("UNBREAKABLE \u2014 Live Without Limits  \u2022  Fuel Your Results", PAGE_W / 2, PAGE_H - 10, { align: "center" });
      if (!dark) doc.text(`${doc.getNumberOfPages()}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
    };

    // ==================== COVER ====================
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, PAGE_W, 4, "F");

    doc.setFontSize(56);
    doc.setTextColor(...ORANGE);
    doc.text("UNBREAKABLE", PAGE_W / 2, 100, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...GREY);
    doc.text("\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014\u2014", PAGE_W / 2, 110, { align: "center" });

    doc.setFontSize(28);
    doc.setTextColor(...WHITE);
    doc.text("RECIPE BOOK", PAGE_W / 2, 125, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(...ORANGE);
    doc.text("FUEL YOUR RESULTS", PAGE_W / 2, 148, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(...GREY);
    doc.text(`${recipes.length} High-Protein Recipes  \u2022  7 Categories  \u2022  Full Macro Breakdowns`, PAGE_W / 2, 165, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    ["All calorie and macro values are reference estimates for guidance.",
     "For bespoke tracking, scan your ingredients via the Store Cupboard",
     "in Fuel Planning for personalised accuracy."].forEach((line, i) => {
      doc.text(line, PAGE_W / 2, 195 + i * 5, { align: "center" });
    });

    doc.setFontSize(16);
    doc.setTextColor(...ORANGE);
    doc.text("KEEP SHOWING UP.", PAGE_W / 2, 235, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text("LIVE WITHOUT LIMITS", PAGE_W / 2, 244, { align: "center" });

    doc.setFillColor(...ORANGE);
    doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");
    addFooter(true);

    // ==================== TOC ====================
    doc.addPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, PAGE_W, 4, "F");

    doc.setFontSize(32);
    doc.setTextColor(...ORANGE);
    doc.text("CONTENTS", PAGE_W / 2, 40, { align: "center" });
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 30, 47, PAGE_W - MARGIN - 30, 47);

    let tocY = 65;
    for (const cat of CATEGORY_ORDER) {
      const cr = categoryMap.get(cat);
      if (!cr || cr.length === 0) continue;
      doc.setFontSize(18);
      doc.setTextColor(...WHITE);
      doc.text(cat.toUpperCase(), MARGIN + 10, tocY);
      doc.setFontSize(13);
      doc.setTextColor(...ORANGE);
      doc.text(`${cr.length} recipes`, PAGE_W - MARGIN - 10, tocY, { align: "right" });
      tocY += 18;
    }
    addFooter(true);

    // ==================== RECIPES ====================
    for (const cat of CATEGORY_ORDER) {
      const catRecipes = categoryMap.get(cat);
      if (!catRecipes || catRecipes.length === 0) continue;

      // Category divider (dark)
      doc.addPage();
      doc.setFillColor(...DARK);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      doc.setFillColor(...ORANGE);
      doc.rect(0, 0, PAGE_W, 4, "F");
      doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");
      doc.rect(MARGIN, PAGE_H / 2 - 28, CONTENT_W, 1.5, "F");
      doc.rect(MARGIN, PAGE_H / 2 + 18, CONTENT_W, 1.5, "F");

      doc.setFontSize(48);
      doc.setTextColor(...ORANGE);
      doc.text(cat.toUpperCase(), PAGE_W / 2, PAGE_H / 2 - 5, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(...GREY);
      doc.text(`${catRecipes.length} RECIPES`, PAGE_W / 2, PAGE_H / 2 + 10, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 105);
      doc.text("FUEL YOUR RESULTS", PAGE_W / 2, PAGE_H / 2 + 35, { align: "center" });
      addFooter(true);

      // Individual recipes (white pages, 1 per page)
      for (const recipe of catRecipes) {
        doc.addPage();
        const ingredients = ingredientMap.get(recipe.id) || [];
        const methodSteps = recipe.instructions
          ? recipe.instructions.split(/\n+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0)
          : [];

        // Top accent
        doc.setFillColor(...ORANGE);
        doc.rect(0, 0, PAGE_W, 3, "F");

        let y = 14;

        // Recipe name
        doc.setFontSize(20);
        doc.setTextColor(...DARK);
        const nameLines = doc.splitTextToSize(recipe.name.toUpperCase(), CONTENT_W);
        doc.text(nameLines, MARGIN, y);
        y += nameLines.length * 8 + 3;

        // Pack + tags
        let badgeLine = "";
        if (recipe.pack) badgeLine = recipe.pack.toUpperCase();
        if (recipe.dietary_tags && recipe.dietary_tags.length > 0) {
          const tags = recipe.dietary_tags.map((t: string) => t.toUpperCase()).join("  \u2022  ");
          badgeLine = badgeLine ? `${badgeLine}  |  ${tags}` : tags;
        }
        if (badgeLine) {
          doc.setFontSize(8);
          doc.setTextColor(...ORANGE);
          doc.text(badgeLine, MARGIN, y);
          y += 5;
        }

        // Info line
        const info: string[] = [];
        if (recipe.prep_time_minutes) info.push(`Prep: ${recipe.prep_time_minutes} min`);
        if (recipe.cook_time_minutes) info.push(`Cook: ${recipe.cook_time_minutes} min`);
        if (recipe.servings) info.push(`Serves: ${recipe.servings}`);
        if (info.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(...GREY);
          doc.text(info.join("   |   "), MARGIN, y);
          y += 7;
        }

        // Macro card
        doc.setFillColor(...LIGHT_ORANGE);
        doc.roundedRect(MARGIN, y, CONTENT_W, 12, 2, 2, "F");
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.3);
        doc.roundedRect(MARGIN, y, CONTENT_W, 12, 2, 2, "S");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        const macros = [
          recipe.calories_per_serving ? `${recipe.calories_per_serving} kcal` : null,
          recipe.protein_g ? `Protein: ${recipe.protein_g}g` : null,
          recipe.carbs_g ? `Carbs: ${recipe.carbs_g}g` : null,
          recipe.fat_g ? `Fat: ${recipe.fat_g}g` : null,
        ].filter(Boolean).join("     \u2022     ");
        doc.text(macros, MARGIN + 4, y + 8);
        y += 18;

        // Two columns: ingredients left, method right
        const colGap = 8;
        const leftW = (CONTENT_W - colGap) * 0.40;
        const rightW = (CONTENT_W - colGap) * 0.60;
        const rightX = MARGIN + leftW + colGap;
        const colStartY = y;

        // INGREDIENTS
        let leftY = colStartY;
        doc.setFontSize(11);
        doc.setTextColor(...ORANGE);
        doc.text("INGREDIENTS", MARGIN, leftY);
        leftY += 2;
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.4);
        doc.line(MARGIN, leftY, MARGIN + leftW, leftY);
        leftY += 5;
        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        for (const ing of ingredients) {
          if (leftY > PAGE_H - 18) break;
          let t = ing.name;
          if (ing.quantity) { t += `, ${ing.quantity}`; if (ing.unit) t += ` ${ing.unit}`; }
          const lines = doc.splitTextToSize(`\u2022  ${t}`, leftW - 2);
          doc.text(lines, MARGIN + 1, leftY);
          leftY += lines.length * 4;
        }

        // METHOD
        let rightY = colStartY;
        doc.setFontSize(11);
        doc.setTextColor(...ORANGE);
        doc.text("METHOD", rightX, rightY);
        rightY += 2;
        doc.setDrawColor(...ORANGE);
        doc.setLineWidth(0.4);
        doc.line(rightX, rightY, rightX + rightW, rightY);
        rightY += 5;
        doc.setFontSize(8);
        doc.setTextColor(...DARK);
        methodSteps.forEach((step: string, idx: number) => {
          if (rightY > PAGE_H - 18) return;
          const lines = doc.splitTextToSize(`${idx + 1}. ${step}`, rightW - 2);
          doc.text(lines, rightX + 1, rightY);
          rightY += lines.length * 4 + 1.5;
        });

        // Bottom accent
        doc.setFillColor(...ORANGE);
        doc.rect(0, PAGE_H - 3, PAGE_W, 3, "F");
        addFooter(false);
      }
    }

    // ==================== BACK COVER ====================
    doc.addPage();
    doc.setFillColor(...DARK);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    doc.setFillColor(...ORANGE);
    doc.rect(0, 0, PAGE_W, 4, "F");
    doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");
    doc.rect(MARGIN, PAGE_H / 2 - 32, CONTENT_W, 1.5, "F");
    doc.rect(MARGIN, PAGE_H / 2 + 30, CONTENT_W, 1.5, "F");

    doc.setFontSize(40);
    doc.setTextColor(...ORANGE);
    doc.text("KEEP SHOWING UP.", PAGE_W / 2, PAGE_H / 2 - 8, { align: "center" });
    doc.setFontSize(16);
    doc.setTextColor(...WHITE);
    doc.text("UNBREAKABLE", PAGE_W / 2, PAGE_H / 2 + 8, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(...GREY);
    doc.text("Live Without Limits", PAGE_W / 2, PAGE_H / 2 + 18, { align: "center" });
    addFooter(true);

    // ========== Upload ==========
    const pdfOutput = doc.output("arraybuffer");
    const pdfUint8 = new Uint8Array(pdfOutput);
    const fileName = "unbreakable-recipe-book.pdf";

    const { error: uploadError } = await supabase.storage
      .from("university-downloads")
      .upload(fileName, pdfUint8, { contentType: "application/pdf", upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("university-downloads").getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ success: true, url: urlData.publicUrl, recipe_count: recipes.length, pages: doc.getNumberOfPages() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating recipe ebook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate ebook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
