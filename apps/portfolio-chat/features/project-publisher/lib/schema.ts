import type { Project, ProjectMetric } from "@/data/projects";
import { z } from "zod";

const projectIdSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "id must be lowercase alphanumeric with optional hyphens"
  );

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

export const projectMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
}) satisfies z.ZodType<ProjectMetric>;

export type ValidatedProjectMetric = z.infer<typeof projectMetricSchema>;

export const projectSchema = z
  .object({
    id: projectIdSchema,
    position: z.number().int().nonnegative(),
    title: z.string().min(1),
    tags: z.array(z.string().min(1)),
    categories: z.array(z.string().min(1)),
    description: z.string().min(1),
    shortDescription: z.string().min(1),
    date: isoDateSchema,
    url: z.string().url(),
    published: z.boolean(),
    image: z.string().min(1),
    gallery: z.array(z.string()),
    subtitle: z.string().min(1).optional(),
    problem: z.string().min(1).optional(),
    solution: z.string().min(1).optional(),
    tech: z.array(z.string().min(1)).optional(),
    features: z.array(z.string().min(1)).optional(),
    metrics: z.array(projectMetricSchema).optional(),
    githubUrl: z.string().url().optional(),
    badges: z.array(z.string().min(1)).optional(),
    highlights: z.array(z.string().min(1)).optional(),
  })
  .strict() satisfies z.ZodType<Project>;

export type ValidatedProject = z.infer<typeof projectSchema>;

export type GeneratePipelineInput = {
  repoUrl: string;
  image: string;
  gallery: string[];
  liveUrl?: string;
  position?: number;
  published?: boolean;
};

export type GeneratePipelineResult = {
  readme?: string;
  markdown?: string;
  project?: Project;
  errors: string[];
};

export type PublishDraft = {
  markdown: string;
  project: Project;
};

export const generateRequestBodySchema = z.object({
  repoUrl: z.string().min(1),
  image: z.string().min(1),
  gallery: z.array(z.string()).default([]),
  liveUrl: z.string().optional(),
  position: z.number().int().optional(),
  published: z.boolean().optional(),
});

export type GenerateRequestBody = z.infer<typeof generateRequestBodySchema>;

export const publishRequestBodySchema = z.object({
  markdown: z.string().min(1),
  project: projectSchema,
});

export type PublishRequestBody = z.infer<typeof publishRequestBodySchema>;

export const unlockRequestBodySchema = z.object({
  secret: z.string().min(1),
});

export type UnlockRequestBody = z.infer<typeof unlockRequestBodySchema>;
