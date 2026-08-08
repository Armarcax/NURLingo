/**
 * NUR Lingo TTS Edge Function
 *
 * Generates audio for text using available TTS providers.
 * For Armenian, falls back to browser TTS if server-side generation fails.
 *
 * Endpoints:
 *   POST /tts-generate
 *   Body: { text: string, lang: "hy" | "en" | "ru", id?: string }
 *   Response: audio/mpeg or JSON with fallback instruction
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TTSRequest {
  text: string;
  lang: "hy" | "en" | "ru";
  id?: string;
}

/**
 * Generate TTS using Google Translate's unofficial TTS API
 */
async function googleTranslateTTS(text: string, lang: string): Promise<ArrayBuffer> {
  const encodedText = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=gtx`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`Google TTS failed: ${response.status}`);
  }

  return response.arrayBuffer();
}

/**
 * Generate TTS using Voice RSS (requires API key)
 */
async function voiceRSS_TTS(text: string, lang: string): Promise<ArrayBuffer> {
  const VOICE_RSS_API_KEY = Deno.env.get("VOICE_RSS_API_KEY");

  if (!VOICE_RSS_API_KEY) {
    throw new Error("Voice RSS API key not configured");
  }

  const langMap: Record<string, string> = {
    hy: "hy-AM",
    en: "en-us",
    ru: "ru-ru",
  };

  const url = `https://api.voicerss.org/?key=${VOICE_RSS_API_KEY}&hl=${langMap[lang] || lang}&src=${encodeURIComponent(text)}&r=0&c=mp3&f=8khz_8bit_mono`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Voice RSS failed: ${response.status}`);
  }

  return response.arrayBuffer();
}

/**
 * Main TTS generation for English/Russian (works reliably)
 */
async function generateTTS(text: string, lang: string): Promise<{ audio: ArrayBuffer; provider: string }> {
  const maxLength = 200;
  const truncatedText = text.length > maxLength
    ? text.substring(0, maxLength - 3) + "..."
    : text;

  const errors: string[] = [];

  // Google TTS works for English and Russian
  if (lang === "en" || lang === "ru") {
    try {
      const audio = await googleTranslateTTS(truncatedText, lang);
      if (audio.byteLength > 500) {
        return { audio, provider: "google-translate" };
      }
      errors.push("Google TTS: returned empty audio");
    } catch (e) {
      errors.push(`Google TTS: ${e.message}`);
    }
  }

  // Voice RSS fallback for all languages
  try {
    const audio = await voiceRSS_TTS(truncatedText, lang);
    if (audio.byteLength > 500) {
      return { audio, provider: "voicerss" };
    }
  } catch (e) {
    errors.push(`Voice RSS: ${e.message}`);
  }

  throw new Error(`All TTS providers failed: ${errors.join("; ")}`);
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const body: TTSRequest = await req.json();

    if (!body.text || !body.lang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, lang" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!["hy", "en", "ru"].includes(body.lang)) {
      return new Response(
        JSON.stringify({ error: "Invalid language. Must be hy, en, or ru" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For Armenian, instruct client to use browser TTS
    // (Google TTS 400s on Armenian from server environments)
    if (body.lang === "hy") {
      return new Response(
        JSON.stringify({
          fallback: "browser",
          reason: "Armenian TTS requires browser synthesis",
          text: body.text,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { audio, provider } = await generateTTS(body.text, body.lang);

    return new Response(audio, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "X-TTS-Provider": provider,
        "X-Audio-ID": body.id || "generated",
        "Cache-Control": "public, max-age=31536000",
      },
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return new Response(
      JSON.stringify({ error: error.message, fallback: "browser" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
