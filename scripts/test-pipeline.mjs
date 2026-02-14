/**
 * Test script pour vérifier le pipeline complet:
 * 1. POST /api/extract-document (PDF → texte)
 * 2. POST /api/ai-format (texte → Perplexity Sonar → JSON → MongoDB)
 * 
 * Usage: node scripts/test-pipeline.mjs
 */
import { readFileSync } from "fs";

const BASE_URL = "http://localhost:3000";

async function testExtraction() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📄 TEST 1: Extraction PDF → Texte");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const pdfBuffer = readFileSync("test-docs/consultation_cas_simple.pdf");

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([pdfBuffer], { type: "application/pdf" }),
    "consultation_cas_simple.pdf"
  );

  const res = await fetch(`${BASE_URL}/api/extract-document`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (data.success) {
    console.log("✅ Extraction réussie!");
    console.log(`   Pages: ${data.data.pages}`);
    console.log(`   Fichier: ${data.data.fileName}`);
    console.log(`   Taille: ${data.data.fileSize} octets`);
    console.log(`   Texte extrait (${data.data.text.length} caractères):`);
    console.log("   ---");
    console.log(data.data.text.substring(0, 500) + "...");
    console.log("   ---");
    return data.data.text;
  } else {
    console.error("❌ Échec extraction:", data.error);
    return null;
  }
}

async function testAIFormat(text) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🤖 TEST 2: Formatage IA (Perplexity Sonar)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const res = await fetch(`${BASE_URL}/api/ai-format`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();

  if (data.success) {
    console.log("✅ Formatage IA réussi!");
    console.log(`   Modèle: ${data.data.model}`);
    console.log(
      `   Tokens: ${data.data.usage?.prompt_tokens || "?"} prompt + ${data.data.usage?.completion_tokens || "?"} completion`
    );
    console.log("\n   📋 Données extraites par l'IA:");
    console.log(JSON.stringify(data.data.aiExtracted, null, 2));
    console.log("\n   💾 Enregistrement MongoDB (ID):", data.data.consultation?.id);
    console.log("   📌 Consultation ID:", data.data.consultation?.consultationId);
    return data.data;
  } else {
    console.error("❌ Échec formatage IA:", data.error);
    if (data.rawResponse) {
      console.error("   Réponse brute:", data.rawResponse.substring(0, 300));
    }
    return null;
  }
}

async function testPerplexityConnection() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔌 TEST 0: Connexion Perplexity API");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const res = await fetch(`${BASE_URL}/api/test-perplexity`);
  const data = await res.json();

  if (data.success) {
    console.log("✅ Connexion réussie!");
    console.log(`   Modèle: ${data.data.model}`);
    console.log(`   Latence: ${data.data.latencyMs}ms`);
  } else {
    console.error("❌ Connexion échouée:", data.error);
  }
  return data.success;
}

async function main() {
  console.log("🚀 Test du pipeline complet\n");

  // Test 0: Connexion
  const connected = await testPerplexityConnection();
  if (!connected) {
    console.error("\n⛔ Impossible de continuer sans connexion Perplexity.");
    process.exit(1);
  }

  // Test 1: Extraction
  const text = await testExtraction();
  if (!text) {
    console.error("\n⛔ Impossible de continuer sans texte extrait.");
    process.exit(1);
  }

  // Test 2: Formatage IA + Save
  const result = await testAIFormat(text);
  if (!result) {
    process.exit(1);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 PIPELINE COMPLET — TOUS LES TESTS PASSÉS!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((err) => {
  console.error("💥 Erreur fatale:", err.message);
  process.exit(1);
});
