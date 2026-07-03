import { runGeneratePipeline } from "@/features/project-publisher/lib/run-generate-pipeline";
import { generateRequestBodySchema } from "@/features/project-publisher/lib/schema";
import {
  AdminSecretVerificationError,
  isAdminFeatureEnabled,
  verifyAdminSecret,
} from "@/features/project-publisher/lib/verify-admin-secret";

export async function POST(request: Request) {
  if (!isAdminFeatureEnabled()) {
    return new Response(null, { status: 404 });
  }

  try {
    verifyAdminSecret(request);
  } catch (error) {
    if (error instanceof AdminSecretVerificationError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    throw error;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generateRequestBodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { repoUrl, image, gallery, liveUrl, position, published } = parsed.data;

  try {
    const result = await runGeneratePipeline({
      repoUrl,
      image,
      gallery,
      liveUrl,
      position,
      published,
    });

    return Response.json(result);
  } catch (error) {
    console.error("[API Error] /api/admin/projects/generate:", error);
    return Response.json({ errors: ["Generate request failed"] }, { status: 500 });
  }
}
