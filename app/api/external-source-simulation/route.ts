import { NextResponse } from "next/server";

export async function GET() {
  const mockData = {
    patients: [
      {
        id: "PAT001",
        age: 25,
        symptoms: ["fever", "headache"],
        rdtResult: "positive",
      },
      {
        id: "PAT002",
        age: 10,
        symptoms: ["fever"],
        rdtResult: "negative",
      },
      {
        id: "PAT003",
        age: 45,
        symptoms: ["fatigue", "muscle_pain"],
        rdtResult: "negative",
      },
      {
        id: "PAT004",
        age: 4,
        symptoms: ["fever", "vomiting", "convulsions"],
        rdtResult: "positive",
      },
    ],
  };

  return NextResponse.json(mockData);
}
