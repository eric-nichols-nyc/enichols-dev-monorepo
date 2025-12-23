"use client";

import { createAuthClient } from "@neondatabase/neon-js/auth/next";

export const authClient: ReturnType<typeof createAuthClient> =
  createAuthClient();
