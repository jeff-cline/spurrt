import { z } from "zod";

export const TalentSchema = z.object({
  role: z.literal("talent"),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  primarySkill: z.string().min(2).max(200),
  availability: z.string().max(500).optional(),
});

export const BenefactorSchema = z.object({
  role: z.literal("benefactor"),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  organization: z.string().min(2).max(200),
  contribution: z.string().max(500).optional(),
});

export const SupplierSchema = z.object({
  role: z.literal("supplier"),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  product: z.string().min(2).max(200),
  feeModel: z.enum(["monthly", "success", "hybrid"]).optional(),
});

export const WaitlistSchema = z.discriminatedUnion("role", [
  TalentSchema,
  BenefactorSchema,
  SupplierSchema,
]);

export type WaitlistSubmission = z.infer<typeof WaitlistSchema>;
export type WaitlistRole = WaitlistSubmission["role"];
