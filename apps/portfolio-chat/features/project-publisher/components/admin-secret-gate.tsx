"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { useState } from "react";

type AdminSecretGateProps = {
  onUnlock: (secret: string) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
};

export function AdminSecretGate({
  onUnlock,
  error = null,
  isLoading = false,
}: AdminSecretGateProps) {
  const [secret, setSecret] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onUnlock(secret);
  }

  return (
    <form className="flex w-full max-w-md flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-secret">Admin secret</Label>
        <Input
          autoComplete="off"
          disabled={isLoading}
          id="admin-secret"
          onChange={(event) => setSecret(event.target.value)}
          placeholder="Enter admin secret"
          type="password"
          value={secret}
        />
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button disabled={isLoading || secret.length === 0} type="submit">
        {isLoading ? "Unlocking…" : "Unlock"}
      </Button>
    </form>
  );
}
