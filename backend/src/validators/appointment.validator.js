import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Le médecin est obligatoire"),
  startAt: z.string().datetime("La date de début est invalide"),
  endAt: z.string().datetime("La date de fin est invalide"),
  reason: z.string().optional()
});
