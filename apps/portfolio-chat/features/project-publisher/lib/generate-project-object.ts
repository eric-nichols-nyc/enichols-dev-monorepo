import type { Project } from "@/data/projects";
import type { GeneratePipelineInput } from "@/features/project-publisher/lib/schema";

export type GenerateProjectObjectInput = {
  readme: string;
  markdown: string;
  input: GeneratePipelineInput;
};

export async function generateProjectObject(
  _input: GenerateProjectObjectInput
): Promise<Project> {
  throw new Error("Not implemented");
}
