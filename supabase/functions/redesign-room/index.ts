import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, style } = await req.json();
    
    if (!image || !style) {
      return new Response(
        JSON.stringify({ error: "Image and style are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const stylePrompts: Record<string, string> = {
      modern: "Transform this room into a sleek modern style with clean lines, neutral colors, minimalist furniture, contemporary art, and high-end finishes. Keep the same room layout and windows.",
      scandinavian: "Redesign this room in Scandinavian style with light wood tones, white walls, cozy textiles, functional furniture, natural light emphasis, and hygge elements. Keep the same room structure.",
      industrial: "Convert this room to industrial style with exposed brick, metal accents, raw materials, Edison bulbs, concrete elements, and urban loft aesthetic. Maintain the room's basic layout.",
      bohemian: "Transform this room into bohemian style with rich colors, layered textiles, eclectic patterns, plants, global accents, and artistic décor. Keep the same room dimensions.",
      minimalist: "Redesign this room in minimalist style with only essential furniture, monochromatic palette, clean surfaces, hidden storage, and zen-like simplicity. Preserve the room layout.",
      traditional: "Convert this room to traditional style with elegant furniture, classic patterns, rich wood tones, formal arrangements, and timeless décor. Maintain the room structure.",
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
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const aiMessage = data.choices?.[0]?.message?.content || "";
    
    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      // Return the AI's message explaining why it couldn't generate an image
      return new Response(
        JSON.stringify({ 
          error: aiMessage || "No image was generated. Please upload an interior room photo.",
          aiMessage: aiMessage
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
