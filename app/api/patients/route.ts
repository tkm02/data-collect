import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET tous les patients
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get("severity");
    const limit = parseInt(searchParams.get("limit") || "100");

    let whereClause: any = {};

    if (severity === "severe") {
      whereClause = {
        consultations: {
          some: {
            isSevere: true,
          },
        },
      };
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      take: limit,
    });

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

// POST créer un patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Vérifier si patient existe déjà
    const exists = await prisma.patient.findUnique({
      where: { patientId: body.patientId },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, error: "Patient existe déjà" },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        patientId: body.patientId,
        age: body.age,
        gender: body.gender,
      },
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
