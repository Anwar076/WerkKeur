import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Vul een geldig e-mailadres in."),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn."),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Voornaam is verplicht."),
    lastName: z.string().min(2, "Achternaam is verplicht."),
    email: z.email("Vul een geldig zakelijk e-mailadres in."),
    organizationName: z.string().min(2, "Bedrijfsnaam is verplicht."),
    password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn."),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen.",
    path: ["confirmPassword"],
  });

export const onboardingStepOneSchema = z.object({
  organizationName: z.string().min(2),
});

export const onboardingStepTwoSchema = z.object({
  subcontractorRange: z.enum(["1-10", "11-25", "26-75", "76-250", "250+"]),
});

export const onboardingStepThreeSchema = z.object({
  documentTypeIds: z.array(z.string()).min(1, "Selecteer minimaal één documenttype."),
});

export const subcontractorSchema = z.object({
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht."),
  kvkNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  requirementDocumentTypeIds: z.array(z.string()),
});

export const documentTypeSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  requiresExpirationDate: z.boolean().default(true),
  defaultValidityMonths: z.number().int().positive().max(120).optional(),
  reminderDays: z.number().int().min(1).max(365).default(30),
});

export const organizationSettingsSchema = z.object({
  name: z.string().min(2),
  kvkNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const requestCreationSchema = z.object({
  subcontractorId: z.string().min(1),
  documentTypeIds: z.array(z.string()).min(1),
});

export const notificationReadSchema = z.object({
  notificationId: z.string().min(1),
});

export const passwordResetRequestSchema = z.object({
  email: z.email(),
});
