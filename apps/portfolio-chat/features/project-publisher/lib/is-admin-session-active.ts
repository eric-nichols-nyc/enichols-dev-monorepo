import { cookies } from "next/headers";
import {
  ADMIN_AUTH_COOKIE_NAME,
  isAdminFeatureEnabled,
  isValidAdminAuthToken,
} from "@/features/project-publisher/lib/verify-admin-secret";

export async function isAdminSessionActive(): Promise<boolean> {
  if (!isAdminFeatureEnabled()) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;

  return isValidAdminAuthToken(token);
}
