export class PublishNotAllowedError extends Error {
  readonly status = 403;

  constructor(
    message = "Publish only available in local dev with PROJECT_PUBLISHER_ENABLE_WRITES=true"
  ) {
    super(message);
    this.name = "PublishNotAllowedError";
  }
}

export function ensureLocalPublish(): void {
  if (process.env.VERCEL === "1") {
    throw new PublishNotAllowedError();
  }

  if (process.env.PROJECT_PUBLISHER_ENABLE_WRITES !== "true") {
    throw new PublishNotAllowedError();
  }
}
