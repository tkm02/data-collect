import { NextResponse } from "next/server";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * GET /api/test-perplexity
 * 
 * Test la connexion à l'API Perplexity Sonar.
 * Envoie un message simple et vérifie la réponse.
 */
export async function GET() {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  // 1. Vérifier que la clé est configurée
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        status: "NO_API_KEY",
        error:
          "PERPLEXITY_API_KEY non configurée. Ajoutez PERPLEXITY_API_KEY=pplx-xxxx dans votre fichier .env.local",
      },
      { status: 500 }
    );
  }

  try {
    // 2. Appeler l'API avec un message de test
    const startTime = Date.now();

    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "Réponds uniquement par le JSON suivant: {\"status\": \"ok\", \"message\": \"Connexion réussie\"}",
          },
          {
            role: "user",
            content: "Test de connexion API. Confirme que tu fonctionnes.",
          },
        ],
        temperature: 0,
        max_tokens: 100,
      }),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        {
          success: false,
          status: "API_ERROR",
          httpStatus: response.status,
          error: errorBody,
          latencyMs: latency,
        },
        { status: 502 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      status: "CONNECTED",
      data: {
        model: result.model,
        response: result.choices?.[0]?.message?.content,
        usage: result.usage,
        latencyMs: latency,
      },
      message: `✅ Connexion Perplexity Sonar réussie (${latency}ms)`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      {
        success: false,
        status: "CONNECTION_FAILED",
        error: message,
      },
      { status: 500 }
    );
  }
}
