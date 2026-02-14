import { z } from "zod";

// Ancien schéma (pour compatibilité si nécessaire, mais on va privilégier le plat)
export const PatientSchema = z.object({
  patientId: z.string().min(1, "ID patient requis"),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.enum(["M", "F"]).optional(),
});

export const ConsultationSchema = z.object({
  patientId: z.string().min(1).optional(),
  temperature: z.number().min(35).max(45).optional(),
  symptoms: z.array(z.string()).default([]),
  rdtResult: z
    .enum(["positive", "negative", "inconclusive"])
    .default("negative"),
  notes: z.string().optional(),
  source: z
    .enum(["kiosque", "import", "ocr", "markdown", "api", "patient"])
    .default("kiosque"),
});

export const PatientWithConsultationSchema = PatientSchema.extend({
  consultation: ConsultationSchema,
});

// NOUVEAU SCHÉMA PLAT (Correspondant à ConsultationPaludismeCI et au formulaire Kiosque)
export const ConsultationKiosqueSchema = z.object({
  consultationId: z.string().optional(),
  patientId: z.string().min(1),
  ageYears: z.number().nullable().optional(),
  ageMonths: z.number().nullable().optional(),
  gender: z.string().nullable().optional(),
  
  // Localisation
  region: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  commune: z.string().nullable().optional(),
  gpsLatitude: z.number().nullable().optional(),
  gpsLongitude: z.number().nullable().optional(),

  dateConsultation: z.string().nullable().optional(),
  heureConsultation: z.string().nullable().optional(),

  // Symptômes (Booléens)
  fievre: z.boolean().optional(),
  fievreTempC: z.number().nullable().optional(),
  fievreJours: z.number().nullable().optional(),
  cephalees: z.boolean().optional(),
  nauseesVomissements: z.boolean().optional(),
  fatigue: z.boolean().optional(),
  douleursArticulaires: z.boolean().optional(),
  frissons: z.boolean().optional(),
  diarhee: z.boolean().optional(),
  troublesConscience: z.boolean().optional(),

  // Signes vitaux
  temperatureC: z.number().nullable().optional(),
  fcBpm: z.number().nullable().optional(),
  frPm: z.number().nullable().optional(),
  paSystolique: z.number().nullable().optional(),
  paDiastolique: z.number().nullable().optional(),
  spo2Pct: z.number().nullable().optional(),

  // Labo
  tdrPaludisme: z.string().nullable().optional(),
  resultat_palu: z.boolean().optional(),
  parasitemiaPct: z.number().nullable().optional(),
  especePaludisme: z.string().nullable().optional(),
  hemoglobineGDl: z.number().nullable().optional(),
  
  // Contexte
  saison: z.string().nullable().optional(),
  antecedentsPalustres30j: z.number().nullable().optional(), // String dans formulaire converti en number ? Check API
  antecedentsCommunautaires: z.boolean().optional(),
  patientVulnerable: z.boolean().optional(),
  comorbidites: z.array(z.string()).optional(),

  // Traitement
  traitementPrimaryName: z.string().nullable().optional(),
  traitementPrimaryDose: z.string().nullable().optional(),
  traitementPrimaryDuree: z.number().nullable().optional(),
  traitementPrimaryAdherence: z.boolean().optional(),
  
  // Issue
  outcomeStatus: z.string().nullable().optional(),
  outcomeDeces: z.boolean().optional(),

  sourceType: z.string().default("kiosque"),
});

export type Patient = z.infer<typeof PatientSchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type PatientWithConsultation = z.infer<
  typeof PatientWithConsultationSchema
>;
export type ConsultationKiosque = z.infer<typeof ConsultationKiosqueSchema>;
