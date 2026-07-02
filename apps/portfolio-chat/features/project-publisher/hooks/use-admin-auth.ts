"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

export type UseAdminAuthResult = {
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  unlock: (secret: string) => Promise<void>;
  getAuthHeaders: () => HeadersInit;
};

export function useAdminAuth(): UseAdminAuthResult {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const secretRef = useRef<string | null>(null);

  const unlock = useCallback(async (secret: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/unlock", {
        body: JSON.stringify({ secret }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (response.status === 404) {
        throw new Error("Admin feature is disabled");
      }

      if (response.status === 401) {
        throw new Error("Invalid admin secret");
      }

      if (!response.ok) {
        throw new Error("Unlock failed");
      }

      secretRef.current = secret;
      setIsUnlocked(true);
      router.refresh();
    } catch (caught) {
      secretRef.current = null;
      setError(caught instanceof Error ? caught.message : "Unlock failed");
      setIsUnlocked(false);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const secret = secretRef.current;

    if (!secret) {
      return {};
    }

    return {
      Authorization: `Bearer ${secret}`,
    };
  }, []);

  return {
    isUnlocked,
    isLoading,
    error,
    unlock,
    getAuthHeaders,
  };
}
