import { AGENT_CATALOG } from "@immoexpert/agents";
import { CapLanding } from "@/components/cap/CapLanding";

export default function HomePage() {
  return <CapLanding catalog={AGENT_CATALOG} />;
}
