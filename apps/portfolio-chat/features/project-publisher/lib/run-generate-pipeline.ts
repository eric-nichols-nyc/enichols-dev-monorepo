import type {
  GeneratePipelineInput,
  GeneratePipelineResult,
} from "@/features/project-publisher/lib/schema";

export async function runGeneratePipeline(
  _input: GeneratePipelineInput
): Promise<GeneratePipelineResult> {
  return { errors: ["Not implemented"] };
}
