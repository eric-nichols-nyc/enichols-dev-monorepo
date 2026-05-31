export type LoadedKnowledgeSection = {
  name: string;
  content: string;
};

export type LoadedKnowledgeFile = {
  path: string;
  title: string;
  sections: LoadedKnowledgeSection[];
  rawContent: string;
};

export type LoadedKnowledgeContext = {
  files: LoadedKnowledgeFile[];
  truncated: boolean;
  missingPaths: string[];
};
