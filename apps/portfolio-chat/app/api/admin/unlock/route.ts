import {
  buildAdminAuthCookieHeader,
  isAdminFeatureEnabled,
} from "@/features/project-publisher/lib/verify-admin-secret";
import { unlockRequestBodySchema } from "@/features/project-publisher/lib/schema";

export async function POST(request: Request) {
  if (!isAdminFeatureEnabled()) {
    return new Response(null, { status: 404 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = unlockRequestBodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (parsed.data.secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": buildAdminAuthCookieHeader(parsed.data.secret),
      },
    }
  );
}
