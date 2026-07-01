const ADMIN_AUTH_HEADER = "authorization";

export const ADMIN_AUTH_COOKIE_NAME = "portfolio-admin-auth";

const ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export class AdminSecretVerificationError extends Error {
  readonly status = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminSecretVerificationError";
  }
}

export function isAdminFeatureEnabled(): boolean {
  return Boolean(process.env.ADMIN_SECRET);
}

function getConfiguredAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET;
}

export function isValidAdminAuthToken(
  token: string | undefined | null
): boolean {
  const configuredSecret = getConfiguredAdminSecret();
  return Boolean(configuredSecret && token && token === configuredSecret);
}

export function getBearerTokenFromRequest(request: Request): string | undefined {
  const header = request.headers.get(ADMIN_AUTH_HEADER);
  const bearerMatch = header?.match(/^Bearer\s+(.+)$/i);
  return bearerMatch?.[1];
}

export function getAdminAuthTokenFromRequest(
  request: Request
): string | undefined {
  const bearerToken = getBearerTokenFromRequest(request);
  if (bearerToken) {
    return bearerToken;
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);

    if (name === ADMIN_AUTH_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }

  return undefined;
}

export function verifyAdminSecret(request: Request): void {
  if (!isAdminFeatureEnabled()) {
    throw new AdminSecretVerificationError("Admin feature is disabled");
  }

  const token = getAdminAuthTokenFromRequest(request);

  if (!isValidAdminAuthToken(token)) {
    throw new AdminSecretVerificationError();
  }
}

export function buildAdminAuthCookieHeader(secret: string): string {
  const encodedSecret = encodeURIComponent(secret);
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${ADMIN_AUTH_COOKIE_NAME}=${encodedSecret}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS}`;
}
