import { z } from "zod";

export const PatientSchema = z.object({
  patientId: z.string().min(1, "ID patient requis"),
  age: z.number().int().min(0).max(150),
  gender: z.enum(["M", "F"]),
});

export const ConsultationSchema = z.object({
  patientId: z.string().min(1),
  temperature: z.number().min(35).max(45),
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

export type Patient = z.infer<typeof PatientSchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type PatientWithConsultation = z.infer<
  typeof PatientWithConsultationSchema
>;
