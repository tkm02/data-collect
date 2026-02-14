import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET tous les patients (simulé via aggrégation des consultations)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // severity n'est plus directement applicable sans jointure complexe ou filtrage post-query
    // car "isSevere" n'est plus dans le schéma (c'est calculé/dans les notes ?)
    // Ah si, "classification" ou "severityLevel" n'y sont pas.
    // On va ignorer le filtre severity pour l'instant ou le baser sur un champ existant.
    
    const limit = parseInt(searchParams.get("limit") || "100");

    // Récupérer les consultations récentes
    const consultations = await prisma.consultationPaludismeCI.findMany({
      orderBy: { createdAt: "desc" },
      take: 500, // On prend large pour avoir assez de patients uniques
    });

    // Grouper par patientId pour n'avoir que le dernier état
    const uniquePatientsMap = new Map();
    
    for (const c of consultations) {
      if (!uniquePatientsMap.has(c.patientId)) {
        uniquePatientsMap.set(c.patientId, {
          patientId: c.patientId,
          age: c.ageYears,
          gender: c.gender,
          consultations: [c] // On attache la plus récente
        });
      }
      if (uniquePatientsMap.size >= limit) break;
    }

    const patients = Array.from(uniquePatientsMap.values());

    return NextResponse.json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST créer un patient (Inutile dans le nouveau modèle flux, mais on garde pour compatibilité)
// Dans le nouveau modèle, on crée une consultation qui contient les infos patient.
// Si le frontend appelle ça, on ne fait rien ou on crée une consultation vide ?
// Mieux vaut retourner succès si le patient "n'existe pas" (conceptuellement), mais on ne peut pas créer de patient seul.
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: true, message: "Endpoint déprécié. Utilisez POST /api/consultations" },
    { status: 200 }
  );
}
