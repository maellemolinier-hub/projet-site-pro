import "dotenv/config";
import { runInteractiveAuthorization } from "../tools/mail/auth.js";

runInteractiveAuthorization().catch((error) => {
  console.error(
    "Erreur d'autorisation Gmail:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
