import { z } from 'zod';

/**
 * Normalized, website-agnostic applicant data model.
 *
 * This is the single shared shape every layer speaks. It intentionally contains
 * NO password or payment fields — storing those is structurally impossible.
 * Name, date of birth, and contact info are permitted (AGENTS.md rule 4).
 *
 * Start minimal; grow the schema per development stage rather than speculatively.
 */

export const ContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
});

export const WorkItemSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  startDate: z.string(), // ISO-ish string; refined in later stages
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const EduItemSchema = z.object({
  school: z.string().min(1),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const LinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

export const ApplicantDataSchema = z.object({
  contact: ContactSchema,
  work: z.array(WorkItemSchema).default([]),
  education: z.array(EduItemSchema).default([]),
  skills: z.array(z.string()).default([]),
  links: z.array(LinkSchema).default([]),
  /**
   * Learned, non-resume values (e.g. a site-specific field the user filled for
   * one company that should be remembered for others). String→string only.
   */
  extra: z.record(z.string(), z.string()).default({}),
});

export type Contact = z.infer<typeof ContactSchema>;
export type WorkItem = z.infer<typeof WorkItemSchema>;
export type EduItem = z.infer<typeof EduItemSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type ApplicantData = z.infer<typeof ApplicantDataSchema>;
