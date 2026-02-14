import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET un patient spécifique (via ses consultations)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // On cherche la dernière consultation de ce patient pour avoir ses infos à jour
    const latestConsultation = await prisma.consultationPaludismeCI.findFirst({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!latestConsultation) {
      return NextResponse.json(
        { success: false, error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    // On récupère tout l'historique
    const history = await prisma.consultationPaludismeCI.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "desc" },
    });

    // On construit un objet "Patient" simulé
    const patientData = {
      patientId: latestConsultation.patientId,
      age: latestConsultation.ageYears,
      gender: latestConsultation.gender,
      consultations: history
    };

    return NextResponse.json({ success: true, data: patientData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT Mettre à jour patient (met à jour toutes ses consultations ?)
// Dans un modèle événementiel/log, on ne met généralement pas à jour le passé.
// Mais pour le besoin de l'UI, on va mettre à jour les infos démo sur la dernière entrée ?
// Ou toutes ? Disons toutes pour la cohérence.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.consultationPaludismeCI.updateMany({
      where: { patientId: id },
      data: {
        ageYears: body.age,
        gender: body.gender,
      },
    });

    return NextResponse.json({ success: true, data: { count: updated.count } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE un patient (toutes ses consultations)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.consultationPaludismeCI.deleteMany({
      where: { patientId: id },
    });

    return NextResponse.json({
      success: true,
      message: "Dossier patient supprimé (toutes consultations)",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
