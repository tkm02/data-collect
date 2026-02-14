import {
    classifyMalaria,
    generateTreatmentRecommendation,
} from "@/lib/oms-classification";
import { ConsultationKiosqueSchema } from "@/lib/schemas";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4Fallback } from "../ai-format/utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données (Nouveau schéma plat)
    const validated = ConsultationKiosqueSchema.parse(body);

    // Reconstruire le tableau de symptômes pour la classification OMS
    const symptomsList: string[] = [];
    if (validated.fievre) symptomsList.push("fievre");
    if (validated.cephalees) symptomsList.push("headache"); // OMS attend 'headache'
    if (validated.nauseesVomissements) symptomsList.push("vomiting"); // OMS attend 'vomiting'
    if (validated.fatigue) symptomsList.push("fatigue");
    if (validated.troublesConscience) symptomsList.push("impaired_consciousness"); // OMS
    if (validated.douleursArticulaires) symptomsList.push("douleurs");
    
    // Classification OMS
    const classification = classifyMalaria({
      age: validated.ageYears || 0,
      temperature: validated.temperatureC || 37,
      symptoms: symptomsList,
      rdtResult: validated.tdrPaludisme === "positif" ? "positive" : validated.tdrPaludisme === "négatif" ? "negative" : "inconclusive",
    });

    // Créer consultation (Modèle plat ConsultationPaludismeCI)
    const consultation = await prisma.consultationPaludismeCI.create({
      data: {
        consultationId: validated.consultationId || `CONS_${v4Fallback()}`,
        patientId: validated.patientId,
        ageYears: validated.ageYears,
        ageMonths: validated.ageMonths,
        gender: validated.gender || "F",
        
        region: validated.region,
        district: validated.district,
        commune: validated.commune,
        gpsLatitude: validated.gpsLatitude,
        gpsLongitude: validated.gpsLongitude,
        
        dateConsultation: validated.dateConsultation ? new Date(validated.dateConsultation) : new Date(),
        heureConsultation: validated.heureConsultation,

        // Signes
        temperatureC: validated.temperatureC,
        fcBpm: validated.fcBpm,
        frPm: validated.frPm,
        paSystolique: validated.paSystolique,
        paDiastolique: validated.paDiastolique,
        spo2Pct: validated.spo2Pct,

        // Symptômes
        fievre: validated.fievre,
        fievreTempC: validated.fievreTempC,
        fievreJours: validated.fievreJours,
        cephalees: validated.cephalees,
        nauseesVomissements: validated.nauseesVomissements,
        fatigue: validated.fatigue,
        douleursArticulaires: validated.douleursArticulaires,
        frissons: validated.frissons,
        diarhee: validated.diarhee,
        troublesConscience: validated.troublesConscience,

        // Labo
        tdrPaludisme: validated.tdrPaludisme,
        resultat_palu: validated.tdrPaludisme === "positif",
        parasitemiaPct: validated.parasitemiaPct,
        especePaludisme: validated.especePaludisme,
        hemoglobineGDl: validated.hemoglobineGDl,
        
        // Contexte
        saison: validated.saison,
        incidenceRegion: null, // Pas dans le form ?
        positiviteTdr: null,
        antecedentsPalustres30j: validated.antecedentsPalustres30j,
        antecedentsCommunautaires: validated.antecedentsCommunautaires,
        patientVulnerable: validated.patientVulnerable,
        comorbidites: validated.comorbidites || [],

        // Traitement
        traitementPrimaryName: validated.traitementPrimaryName,
        traitementPrimaryDose: validated.traitementPrimaryDose,
        traitementPrimaryDuree: validated.traitementPrimaryDuree,
        traitementPrimaryAdherence: validated.traitementPrimaryAdherence,

        // Outcome
        outcomeStatus: validated.outcomeStatus,
        outcomeDeces: validated.outcomeStatus === "décès",

        sourceType: validated.sourceType,
      },
    });

    return NextResponse.json(
      {
        success: true,
        consultation,
        classification,
        treatment: generateTreatmentRecommendation(
          classification,
          validated.ageYears || 5
        ),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating consultation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");

    if (patientId) {
      const consultations = await prisma.consultationPaludismeCI.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        count: consultations.length,
        data: consultations,
      });
    }

    // Tous les patients (pour dashboard/liste)
    const consultations = await prisma.consultationPaludismeCI.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Aggrégation pour simuler une liste de "patients" uniques
    const uniquePatients = Array.from(
      new Map(consultations.map((c) => [c.patientId, c])).values()
    ).map(c => ({
        patientId: c.patientId,
        age: c.ageYears,
        gender: c.gender,
        district: c.district,
        lastConsultationDate: c.dateConsultation,
        consultations: [c]
    }));

    return NextResponse.json({
      success: true,
      count: uniquePatients.length,
      data: uniquePatients,
    });
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
