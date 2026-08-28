import "dotenv/config";
import { runMailBridgeLoop } from "../tools/mail/bridge.js";

const intervalMs = Number(process.env.MAIL_BRIDGE_INTERVAL_MS ?? 30_000);

runMailBridgeLoop(intervalMs).catch((error) => {
  console.error(
    "Erreur fatale du pont mail:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
