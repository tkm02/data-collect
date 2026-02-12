import {
  classifyMalaria,
  generateTreatmentRecommendation,
} from "@/lib/oms-classification";
import { PatientWithConsultationSchema } from "@/lib/schemas";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const validated = PatientWithConsultationSchema.parse(body);

    // Vérifier si patient existe
    let patient = await prisma.patient.findUnique({
      where: { patientId: validated.patientId },
    });

    // Créer si n'existe pas
    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          patientId: validated.patientId,
          age: validated.age,
          gender: validated.gender,
        },
      });
    }

    // Classification OMS
    const classification = classifyMalaria({
      age: validated.age,
      temperature: validated.consultation.temperature,
      symptoms: validated.consultation.symptoms,
      rdtResult: validated.consultation.rdtResult,
    });

    // Créer consultation
    const consultation = await prisma.consultation.create({
      data: {
        patientId: validated.patientId,
        temperature: validated.consultation.temperature,
        symptoms: JSON.stringify(validated.consultation.symptoms),
        rdtResult: validated.consultation.rdtResult,
        isSevere: classification.isSevere,
        severityLevel: classification.severityLevel,
        classification: classification.classification,
        source: validated.consultation.source,
        notes: validated.consultation.notes,
      },
      include: { patient: true },
    });

    return NextResponse.json(
      {
        success: true,
        consultation,
        classification,
        treatment: generateTreatmentRecommendation(
          classification,
          validated.age
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
      const consultations = await prisma.consultation.findMany({
        where: { patientId },
        include: { patient: true },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        count: consultations.length,
        data: consultations,
      });
    }

    // Tous les patients
    const patients = await prisma.patient.findMany({
      include: {
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
