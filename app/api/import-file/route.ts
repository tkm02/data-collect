
import { v4Fallback } from "@/app/api/ai-format/utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";


// Helper pour mapper les symptômes (string -> booleans)
function mapSymptoms(symptomsStr: string) {
  const s = symptomsStr ? symptomsStr.toLowerCase() : "";
  return {
    fievre: s.includes("fievre") || s.includes("fièvre"),
    cephalees: s.includes("cephalees") || s.includes("céphalées"),
    nauseesVomissements: s.includes("nausees") || s.includes("nausées") || s.includes("vomissements"),
    fatigue: s.includes("fatigue"),
    douleursArticulaires: s.includes("douleurs") || s.includes("articulaire"),
    frissons: s.includes("frissons"),
    diarhee: s.includes("diarhee") || s.includes("diarrhée"),
    troublesConscience: s.includes("conscience") || s.includes("coma"),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { success: false, message: "Fichier vide ou illisible" },
        { status: 400 }
      );
    }

    const savedRecords = [];
    let errors = 0;

    for (const row of jsonData) {
      try {
        // Mapping des colonnes Excel/CSV vers le schéma Prisma
        const symptomsMap = mapSymptoms(row.symptoms || row.symptomes || "");
        
        // Générer un ID unique si absent
        const consultId = `IMPORT_${v4Fallback()}`;

        const consultation = await prisma.consultationPaludismeCI.create({
          data: {
            consultationId: consultId,
            patientId: row.patientId || `PAT_${v4Fallback().substring(0, 8)}`,
            ageYears: typeof row.age === 'number' ? row.age : parseInt(row.age) || null,
            gender: row.gender || row.sexe || "I",
            
            // Signes & Symptômes
            temperatureC: typeof row.temperature === 'number' ? row.temperature : parseFloat(row.temperature) || null,
            ...symptomsMap,

            // TDR / Labo
            tdrPaludisme: row.rdtResult || row.resultat_tdr || "inconnu",
            resultat_palu: (row.rdtResult === "positif" || row.resultat_tdr === "positif"),

            // Contexte & Traitement
            traitementPrimaryName: row.traitement || null,
            outcomeStatus: row.outcome || null,
            dateConsultation: row.dateConsultation ? new Date(row.dateConsultation) : new Date(),

            // Source
            sourceType: "batch_import", // Indique que ça vient d'un import fichier
            dataQualityStatus: "valide", 
          },
        });
        savedRecords.push(consultation.id);
      } catch (err) {
        console.error("Erreur import ligne:", err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedRecords.length} lignes importées avec succès. ${errors} erreurs.`,
      count: savedRecords.length,
      errors: errors
    });

  } catch (error: any) {
    console.error("Erreur globale import:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Erreur serveur lors de l'import" },
      { status: 500 }
    );
  }
}
