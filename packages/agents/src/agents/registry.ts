import type { AgentRole } from "../types";
import type { BaseAgent } from "./base";
import { CinematicVisualsAgent } from "./cinematicVisuals";
import { ClientFollowupAgent } from "./clientFollowup";
import { DeveloperAgent } from "./developer";
import { PhoneProspectingAgent } from "./phoneProspecting";
import { SeoSocialAgent } from "./seoSocial";

/** Instancie tous les agents et les indexe par rôle. */
export function buildAgentRegistry(): Record<AgentRole, BaseAgent> {
  return {
    developer: new DeveloperAgent(),
    seo_social: new SeoSocialAgent(),
    cinematic_visuals: new CinematicVisualsAgent(),
    phone_prospecting: new PhoneProspectingAgent(),
    client_followup: new ClientFollowupAgent(),
  };
}
