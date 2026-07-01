"use client";

import Link from "next/link";
import { AdminSecretGate } from "@/features/project-publisher/components/admin-secret-gate";
import { useAdminAuth } from "@/features/project-publisher/hooks/use-admin-auth";
import { Button } from "@repo/design-system/components/ui/button";

export function AdminUnlockPage() {
  const { unlock, error, isLoading, isUnlocked } = useAdminAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Project Publisher</h1>
        <p className="text-muted-foreground text-sm">
          Enter the admin secret to unlock publishing tools.
        </p>
      </div>
      {isUnlocked ? (
        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
          <p className="font-medium">Unlocked</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Admin auth is active for this browser session.
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/projects/new">Publish a new project</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8">
          <AdminSecretGate
            error={error}
            isLoading={isLoading}
            onUnlock={unlock}
          />
        </div>
      )}
    </main>
  );
}
