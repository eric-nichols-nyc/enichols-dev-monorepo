export class DuplicateProjectIdError extends Error {
  constructor(projectId: string) {
    super(`Project ID "${projectId}" already exists`);
    this.name = "DuplicateProjectIdError";
  }
}

export class WriteKnowledgeFileError extends Error {
  constructor(message = "Failed to write knowledge file") {
    super(message);
    this.name = "WriteKnowledgeFileError";
  }
}

export class UpdateProjectsFileError extends Error {
  constructor(message = "Failed to update projects.ts") {
    super(message);
    this.name = "UpdateProjectsFileError";
  }
}
