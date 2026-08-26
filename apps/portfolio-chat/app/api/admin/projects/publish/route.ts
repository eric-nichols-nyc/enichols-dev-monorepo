import {
  ensureLocalPublish,
  PublishNotAllowedError,
} from "@/features/project-publisher/lib/ensure-local-publish";
import { runPublishPipeline } from "@/features/project-publisher/lib/run-publish-pipeline";
import { publishRequestBodySchema } from "@/features/project-publisher/lib/schema";
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

  try {
    ensureLocalPublish();
  } catch (error) {
    if (error instanceof PublishNotAllowedError) {
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

  const parsed = publishRequestBodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await runPublishPipeline(parsed.data);

    if (result.errors.length > 0) {
      const isDuplicate = result.errors.some((message) =>
        message.includes("already exists")
      );

      return Response.json(
        { errors: result.errors },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    return Response.json({ project: result.project });
  } catch (error) {
    console.error("[API Error] /api/admin/projects/publish:", error);
    return Response.json(
      { errors: ["Publish request failed"] },
      { status: 500 }
    );
  }
}
