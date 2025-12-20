import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RoomAnalysis {
  roomType: string;
  currentStyle: string;
  colorPalette: {
    dominant: string;
    accent: string[];
    suggested: string[];
  };
  furniture: {
    detected: string[];
    suggestions: string[];
  };
  lighting: string;
  recommendations: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

    const { image } = await req.json();
    
    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: "Invalid image data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (image.length > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum 10MB allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!image.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ error: "Invalid image format. Please upload a valid image." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Please sign in to analyze rooms" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Please sign in to analyze rooms" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated for room analysis:", user.id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const analysisPrompt = `Analyze this room image and provide a detailed JSON response with the following structure. Be specific and accurate:

{
  "roomType": "living room" | "bedroom" | "kitchen" | "bathroom" | "dining room" | "home office" | "nursery" | "other",
  "currentStyle": "modern" | "traditional" | "industrial" | "bohemian" | "minimalist" | "scandinavian" | "mid-century" | "coastal" | "farmhouse" | "eclectic" | "unknown",
  "colorPalette": {
    "dominant": "the main color you see (e.g., 'warm beige', 'soft gray', 'white')",
    "accent": ["2-3 accent colors present"],
    "suggested": ["3-4 colors that would complement this space"]
  },
  "furniture": {
    "detected": ["list of furniture items you can see in the room"],
    "suggestions": ["4-6 furniture pieces that would enhance this space based on the room type and style"]
  },
  "lighting": "description of lighting quality (e.g., 'natural light from large windows', 'warm artificial lighting', 'dim and needs improvement')",
  "recommendations": ["5-7 specific actionable design recommendations to improve this space"]
}

Respond ONLY with valid JSON, no additional text or markdown formatting.`;

    console.log("Sending request to Lovable AI for room analysis");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt,
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
    console.log("AI analysis response received for user:", user.id);

    const aiContent = data.choices?.[0]?.message?.content || "";
    
    if (!aiContent) {
      return new Response(
        JSON.stringify({ error: "Failed to analyze room. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from the AI
    let analysis: RoomAnalysis;
    try {
      // Clean the response in case it has markdown code blocks
      let cleanedContent = aiContent.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();
      
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Content:", aiContent);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse room analysis. Please try again.",
          rawResponse: aiContent
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Room analysis successful for user:", user.id);

    return new Response(
      JSON.stringify({ 
        analysis,
        message: "Room analyzed successfully!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-room function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
