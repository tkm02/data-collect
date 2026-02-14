import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v4Fallback } from "./utils";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

const SYSTEM_PROMPT = `Tu es un assistant médical spécialisé dans l'extraction structurée de données de consultations paludisme en Côte d'Ivoire.

À partir du texte brut d'un document médical, tu dois extraire les informations et les formater en un objet JSON strict correspondant exactement au schéma suivant.

SCHÉMA DE SORTIE (tous les champs sont facultatifs sauf indication contraire):

{
  "patientId": "string — ID du patient tel qu'il apparaît dans le document",
  "ageYears": "number — âge en années",
  "ageMonths": "number — mois supplémentaires",
  "gender": "string — 'M' ou 'F'",
  "centreId": "string — code du centre de santé",
  "centreNom": "string — nom du centre",
  "region": "string",
  "district": "string",
  "commune": "string",
  "gpsLatitude": "number ou null",
  "gpsLongitude": "number ou null",
  "dateConsultation": "string ISO 8601 — ex: 2025-01-15T00:00:00.000Z",
  "heureConsultation": "string HH:mm",
  
  "fievre": "boolean",
  "fievreTempC": "number — température associée à la fièvre",
  "fievreJours": "number — nombre de jours de fièvre",
  "cephalees": "boolean",
  "nauseesVomissements": "boolean",
  "fatigue": "boolean",
  "douleursArticulaires": "boolean",
  "frissons": "boolean",
  "diarhee": "boolean",
  "troublesConscience": "boolean",
  
  "temperatureC": "number — température mesurée en °C",
  "fcBpm": "number — fréquence cardiaque en bpm",
  "frPm": "number — fréquence respiratoire par minute",
  "paSystolique": "number",
  "paDiastolique": "number",
  "spo2Pct": "number — SpO2 en %",
  
  "tdrPaludisme": "string — 'positif', 'négatif' ou 'inconcluant'",
  "resultat_palu": "boolean — true si TDR positif",
  "tdrDate": "string ISO 8601",
  "parasitemiaPct": "number",
  "especePaludisme": "string — ex: 'P. falciparum'",
  "hemoglobineGDl": "number",
  "hematocritePct": "number",
  
  "saison": "string — 'pluies' ou 'sèche'",
  "incidenceRegion": "number — pour 1000 hab",
  "positiviteTdr": "number — pourcentage",
  "antecedentsPalustres30j": "number",
  "antecedentsCommunautaires": "boolean",
  
  "comorbidites": "string[] — liste des comorbidités",
  "patientVulnerable": "boolean",
  "patient05Ans": "boolean — enfant de moins de 5 ans",
  
  "traitementPrimaryName": "string — nom du traitement",
  "traitementPrimaryDose": "string — posologie",
  "traitementPrimaryDuree": "number — durée en jours",
  "traitementPrimaryAdherence": "boolean",
  
  "outcomeStatus": "string — 'en traitement', 'guéris', 'décès', 'perdu de vue'",
  "outcomeDeces": "boolean",
  "suiviDate": "string ISO 8601",
  "suiviResultat": "string — 'amélioration', 'détérioration', 'résistant'"
}

RÈGLES IMPORTANTES:
1. Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou après.
2. Si une information n'est pas disponible dans le texte, utilise null.
3. Convertis les dates au format ISO 8601 (yyyy-mm-ddT00:00:00.000Z).
4. "OUI" → true, "NON" → false pour les booléens.
5. "POSITIF" → "positif", "NÉGATIF" → "négatif" pour le TDR.
6. Extrais la parasitémie comme un nombre (ex: "2.5%" → 2.5).
7. Pour les comorbidités, retourne un tableau de chaînes.
8. Si l'enfant a moins de 5 ans, mets patient05Ans à true.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "Le champ 'text' est requis et doit être une chaîne de caractères." },
        { status: 400 }
      );
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "PERPLEXITY_API_KEY non configurée. Ajoutez-la dans .env.local",
        },
        { status: 500 }
      );
    }

    // Appeler Perplexity Sonar
    const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
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
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Voici le texte brut extrait d'un document de consultation paludisme. Extrais et formate les données en JSON selon le schéma demandé :\n\n---\n${text}\n---`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorBody = await perplexityResponse.text();
      console.error("Perplexity API error:", perplexityResponse.status, errorBody);
      return NextResponse.json(
        {
          success: false,
          error: `Erreur Perplexity API (${perplexityResponse.status}): ${errorBody}`,
        },
        { status: 502 }
      );
    }

    const aiResult = await perplexityResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { success: false, error: "Pas de réponse de l'IA" },
        { status: 502 }
      );
    }

    // Parser le JSON de la réponse IA
    let parsedData: Record<string, unknown>;
    try {
      // Nettoyer la réponse (enlever les backticks markdown si présents)
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      parsedData = JSON.parse(cleanContent.trim());
    } catch {
      console.error("Failed to parse AI response:", aiContent);
      return NextResponse.json(
        {
          success: false,
          error: "L'IA n'a pas retourné un JSON valide",
          rawResponse: aiContent,
        },
        { status: 422 }
      );
    }

    // Générer un consultationId unique
    const consultationId = `CONS_${v4Fallback()}`;

    // Préparer les données pour Prisma
    const consultationData = {
      consultationId,
      patientId: (parsedData.patientId as string) || `PAT_IMPORT_${Date.now()}`,
      ageYears: parsedData.ageYears as number | undefined,
      ageMonths: parsedData.ageMonths as number | undefined,
      gender: parsedData.gender as string | undefined,
      centreId: parsedData.centreId as string | undefined,
      centreNom: parsedData.centreNom as string | undefined,
      region: parsedData.region as string | undefined,
      district: parsedData.district as string | undefined,
      commune: parsedData.commune as string | undefined,
      gpsLatitude: parsedData.gpsLatitude as number | undefined,
      gpsLongitude: parsedData.gpsLongitude as number | undefined,
      dateConsultation: parsedData.dateConsultation
        ? new Date(parsedData.dateConsultation as string)
        : undefined,
      heureConsultation: parsedData.heureConsultation as string | undefined,

      // Symptômes
      fievre: parsedData.fievre as boolean | undefined,
      fievreTempC: parsedData.fievreTempC as number | undefined,
      fievreJours: parsedData.fievreJours as number | undefined,
      cephalees: parsedData.cephalees as boolean | undefined,
      nauseesVomissements: parsedData.nauseesVomissements as boolean | undefined,
      fatigue: parsedData.fatigue as boolean | undefined,
      douleursArticulaires: parsedData.douleursArticulaires as boolean | undefined,
      frissons: parsedData.frissons as boolean | undefined,
      diarhee: parsedData.diarhee as boolean | undefined,
      troublesConscience: parsedData.troublesConscience as boolean | undefined,

      // Signes vitaux
      temperatureC: parsedData.temperatureC as number | undefined,
      fcBpm: parsedData.fcBpm as number | undefined,
      frPm: parsedData.frPm as number | undefined,
      paSystolique: parsedData.paSystolique as number | undefined,
      paDiastolique: parsedData.paDiastolique as number | undefined,
      spo2Pct: parsedData.spo2Pct as number | undefined,

      // Laboratoire
      tdrPaludisme: parsedData.tdrPaludisme as string | undefined,
      resultat_palu: parsedData.resultat_palu as boolean | undefined,
      tdrDate: parsedData.tdrDate
        ? new Date(parsedData.tdrDate as string)
        : undefined,
      parasitemiaPct: parsedData.parasitemiaPct as number | undefined,
      especePaludisme: parsedData.especePaludisme as string | undefined,
      hemoglobineGDl: parsedData.hemoglobineGDl as number | undefined,
      hematocritePct: parsedData.hematocritePct as number | undefined,

      // Contexte
      saison: parsedData.saison as string | undefined,
      incidenceRegion: parsedData.incidenceRegion as number | undefined,
      positiviteTdr: parsedData.positiviteTdr as number | undefined,
      antecedentsPalustres30j: parsedData.antecedentsPalustres30j as number | undefined,
      antecedentsCommunautaires: parsedData.antecedentsCommunautaires as boolean | undefined,

      // Comorbidités
      comorbidites: (parsedData.comorbidites as string[]) || [],
      patientVulnerable: parsedData.patientVulnerable as boolean | undefined,
      patient05Ans: parsedData.patient05Ans as boolean | undefined,

      // Traitement
      traitementPrimaryName: parsedData.traitementPrimaryName as string | undefined,
      traitementPrimaryDose: parsedData.traitementPrimaryDose as string | undefined,
      traitementPrimaryDuree: parsedData.traitementPrimaryDuree as number | undefined,
      traitementPrimaryAdherence: parsedData.traitementPrimaryAdherence as boolean | undefined,

      // Outcome
      outcomeStatus: parsedData.outcomeStatus as string | undefined,
      outcomeDeces: parsedData.outcomeDeces as boolean | undefined,
      suiviDate: parsedData.suiviDate
        ? new Date(parsedData.suiviDate as string)
        : undefined,
      suiviResultat: parsedData.suiviResultat as string | undefined,

      // Métadonnées
      sourceType: "pdf",
      dataQualityStatus: "en revue",
      anonymized: true,
    };

    // Sauvegarder en base
    const saved = await prisma.consultationPaludismeCI.create({
      data: consultationData,
    });

    return NextResponse.json({
      success: true,
      data: {
        consultation: saved,
        aiExtracted: parsedData,
        model: aiResult.model,
        usage: aiResult.usage,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur ai-format:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
