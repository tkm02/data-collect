// Logique de classification OMS pour le paludisme

export interface OmsClassification {
  isSevere: boolean;
  severityLevel: "mild" | "moderate" | "severe";
  classification: "uncomplicated" | "severe";
  alerts: string[];
}

export function classifyMalaria(data: {
  age: number;
  temperature: number;
  symptoms: string[];
  rdtResult: string;
}): OmsClassification {
  const alerts: string[] = [];
  let isSevere = false;
  let severityLevel: "mild" | "moderate" | "severe" = "mild";
  let classification: "uncomplicated" | "severe" = "uncomplicated";

  // Vérification signes graves OMS
  const severeSymptoms = ["convulsions", "coma", "impaired_consciousness"];
  const hasSevereSymptoms = data.symptoms.some((s) =>
    severeSymptoms.includes(s)
  );

  if (hasSevereSymptoms) {
    isSevere = true;
    severityLevel = "severe";
    classification = "severe";
    alerts.push(
      "⚠️ CONVULSIONS/CONSCIENCE ALTÉRÉE - TRAITEMENT D'URGENCE REQUIS"
    );
  }

  // Température extrême (> 40°C)
  if (data.temperature > 40) {
    isSevere = true;
    if (severityLevel === "mild") severityLevel = "severe";
    alerts.push(
      `⚠️ HYPERTHERMIE CRITIQUE (${data.temperature}°C) - HOSPITALISATION NÉCESSAIRE`
    );
  }

  // Enfant < 5 ans à risque élevé
  if (data.age < 5) {
    if (data.temperature > 39.5) {
      isSevere = true;
      if (severityLevel === "mild") severityLevel = "moderate";
      alerts.push(
        `⚠️ ENFANT < 5 ans avec température élevée - SURVEILLANCE ÉTROITE`
      );
    }
  }

  // Symptômes modérés
  const moderateSymptoms = ["vomiting", "anemia", "headache"];
  const hasModerateSymptoms = data.symptoms.some((s) =>
    moderateSymptoms.includes(s)
  );
  if (hasModerateSymptoms && !isSevere && data.temperature > 39) {
    severityLevel = "moderate";
  }

  // RDT Positif
  if (data.rdtResult === "positive") {
    alerts.push("✓ RDT POSITIF - Paludisme confirmé");
  } else if (data.rdtResult === "inconclusive") {
    alerts.push("⚠️ RDT INCONCLUSIVE - Répéter test ou autres diagnostiques");
  }

  return {
    isSevere,
    severityLevel,
    classification,
    alerts,
  };
}

export function generateTreatmentRecommendation(
  classification: OmsClassification,
  age: number
): string {
  if (classification.classification === "severe") {
    return "RÉFÉRENCE URGENTE À L'HÔPITAL - Parentéral ACT (artésunate IV ou IM)";
  }

  if (age < 5) {
    return "ACT pédiatrique - Artémether IM ou Artésunate IV (dépend de poids)";
  }

  return "ACT adulte - Artésunate IV ou arteméther IM - Suivi patient obligatoire";
}
