import { cookies } from "next/headers";
import {
  ADMIN_AUTH_COOKIE_NAME,
  isAdminFeatureEnabled,
  isValidAdminAuthToken,
} from "@/features/project-publisher/lib/verify-admin-secret";

export type AdminNavLink = {
  href: string;
  label: string;
};

export async function isAdminSessionActive(): Promise<boolean> {
  if (!isAdminFeatureEnabled()) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;

  return isValidAdminAuthToken(token);
}

/** Sidebar Admin section — session required in production; dev shows unlock when feature is on. */
export async function getAdminNavLink(): Promise<AdminNavLink | null> {
  if (!isAdminFeatureEnabled()) {
    return null;
  }

  if (await isAdminSessionActive()) {
    return {
      href: "/admin/projects/new",
      label: "New project",
    };
  }

  if (process.env.NODE_ENV === "development") {
    return {
      href: "/admin/unlock",
      label: "Unlock admin",
    };
  }

  return null;
}
