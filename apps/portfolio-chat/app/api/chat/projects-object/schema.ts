import { z } from "zod";

export const projectObjectSchema = z.object({
  projects: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      shortDescription: z.string(),
      tags: z.array(z.string()),
      url: z.string().url(),
      image: z.string(),
    })
  ),
});

export const projectsObjectRequestSchema = z.object({
  prompt: z.string().min(1).max(500).optional(),
  limit: z.number().int().min(1).max(12).optional(),
});

export const projectsObjectEnvelopeSchema = z.object({
  input: z.union([z.string(), projectsObjectRequestSchema]).optional(),
});

export type ProjectsObjectRequest = z.infer<typeof projectsObjectRequestSchema>;
