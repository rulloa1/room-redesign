import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for base64 encoded image
    const ALLOWED_STYLES = [
      'modern', 'modern-spa', 'scandinavian', 'industrial', 'bohemian',
      'minimalist', 'traditional', 'mid-century', 'coastal', 'farmhouse',
      'art-deco', 'japanese', 'mediterranean'
    ];

    const { image, style } = await req.json();
    
    // Validate image exists and is string
    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid image data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate style exists and is in allowed list
    if (!style || typeof style !== 'string' || !ALLOWED_STYLES.includes(style)) {
      return new Response(
        JSON.stringify({ error: "Invalid style selection" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image size
    if (image.length > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum 10MB allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image format (data URL)
    if (!image.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ error: "Invalid image format. Please upload a valid image." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get auth header and verify user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Please sign in to use redesign credits" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Please sign in to use redesign credits" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // Use the database function to check and deduct credit
    const { data: creditUsed, error: creditError } = await supabase.rpc("use_credit", {
      p_user_id: user.id,
    });

    if (creditError) {
      console.error("Credit error:", creditError);
      return new Response(
        JSON.stringify({ error: "Failed to process credits. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!creditUsed) {
      return new Response(
        JSON.stringify({ error: "You've used all your credits. Upgrade to continue redesigning!" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Credit deducted for user:", user.id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const stylePrompts: Record<string, string> = {
      modern: "Transform this room into a sleek modern style with clean lines, neutral colors, minimalist furniture, contemporary art, and high-end finishes. Keep the same room layout and windows.",
      "modern-spa": "Redesign this room as a serene modern spa retreat with zen elements, natural materials like bamboo and stone, soft neutral tones, ambient lighting, plants, and calming water features. Keep the same room structure.",
      scandinavian: "Redesign this room in Scandinavian style with light wood tones, white walls, cozy textiles, functional furniture, natural light emphasis, and hygge elements. Keep the same room structure.",
      industrial: "Convert this room to industrial style with exposed brick, metal accents, raw materials, Edison bulbs, concrete elements, and urban loft aesthetic. Maintain the room's basic layout.",
      bohemian: "Transform this room into bohemian style with rich colors, layered textiles, eclectic patterns, plants, global accents, and artistic décor. Keep the same room dimensions.",
      minimalist: "Redesign this room in minimalist style with only essential furniture, monochromatic palette, clean surfaces, hidden storage, and zen-like simplicity. Preserve the room layout.",
      traditional: "Convert this room to traditional style with elegant furniture, classic patterns, rich wood tones, formal arrangements, and timeless décor. Maintain the room structure.",
      "mid-century": "Transform this room into mid-century modern style with organic curves, retro furniture, warm wood tones, iconic design pieces, and 1950s-60s aesthetic. Keep the same room layout.",
      coastal: "Redesign this room in coastal style with ocean-inspired blues and whites, natural textures, driftwood accents, nautical elements, and breezy beach house vibes. Maintain the room structure.",
      farmhouse: "Convert this room to farmhouse style with rustic wood beams, shiplap walls, vintage accents, cozy textiles, warm neutrals, and country charm. Keep the same room dimensions.",
      "art-deco": "Transform this room into art deco style with bold geometric patterns, luxurious materials, gold accents, velvet upholstery, and 1920s glamour. Preserve the room layout.",
      japanese: "Redesign this room in Japanese style with minimalist zen aesthetic, natural materials, shoji screens, low furniture, tatami elements, and wabi-sabi philosophy. Keep the same room structure.",
      mediterranean: "Convert this room to Mediterranean style with terracotta tones, wrought iron details, arched doorways, mosaic tiles, and warm sunny European villa aesthetic. Maintain the room layout.",
    };

    const prompt = stylePrompts[style] || stylePrompts.modern;

    console.log("Sending request to Lovable AI for room redesign with style:", style);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      // Refund credit on AI error - we don't want to charge for failed attempts
      await supabase.from("user_credits").update({
        credits_remaining: supabase.rpc("get_credits", { p_user_id: user.id }),
      });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully for user:", user.id);

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const aiMessage = data.choices?.[0]?.message?.content || "";
    
    if (!generatedImage) {
      console.log("No image in response for user:", user.id);
      
      // Check if AI gave a positive response but no image (API issue)
      if (aiMessage.toLowerCase().includes("here's") || aiMessage.toLowerCase().includes("transformed")) {
        return new Response(
          JSON.stringify({ 
            error: "Image generation temporarily unavailable. Please try again.",
            details: "The AI processed your image but couldn't generate the result. This is usually temporary."
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // AI is rejecting the image (not a room, etc.)
      return new Response(
        JSON.stringify({ 
          error: "Please upload an interior room photo. The AI needs to see the inside of a room to redesign it.",
          details: aiMessage
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Redesign successful for user:", user.id);

    return new Response(
      JSON.stringify({ 
        redesignedImage: generatedImage,
        message: aiMessage || "Room redesigned successfully!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in redesign-room function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
