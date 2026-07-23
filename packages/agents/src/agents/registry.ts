import type { AgentRole } from "../types";
import type { BaseAgent } from "./base";
import { BusinessDiagnosisAgent } from "./businessDiagnosis";
import { CinematicVisualsAgent } from "./cinematicVisuals";
import { ClientFollowupAgent } from "./clientFollowup";
import { DeveloperAgent } from "./developer";
import { LeadProspectingAgent } from "./leadProspecting";
import { PhoneProspectingAgent } from "./phoneProspecting";
import { SeoSocialAgent } from "./seoSocial";
import { VoiceAppointmentAgent } from "./voiceAppointment";

/** Instancie tous les agents et les indexe par rôle. */
export function buildAgentRegistry(): Record<AgentRole, BaseAgent> {
  return {
    business_diagnosis: new BusinessDiagnosisAgent(),
    developer: new DeveloperAgent(),
    seo_social: new SeoSocialAgent(),
    cinematic_visuals: new CinematicVisualsAgent(),
    lead_prospecting: new LeadProspectingAgent(),
    voice_appointment: new VoiceAppointmentAgent(),
    phone_prospecting: new PhoneProspectingAgent(),
    client_followup: new ClientFollowupAgent(),
  };
}
