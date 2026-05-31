import { showAboutTool } from "./about";
import { showExperienceTool } from "./show-experience";
import { showProjectsTool } from "./show-projects";
import { showTechStackTool } from "./show-tech-stack";

/** Portfolio chat tools registered with streamText */
export const portfolioChatTools = {
  show_about: showAboutTool,
  show_projects: showProjectsTool,
  show_experience: showExperienceTool,
  show_tech_stack: showTechStackTool,
};
