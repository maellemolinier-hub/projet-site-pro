import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

/**
 * Programmatic render entry point, usable from a backend job:
 *   pnpm --filter @immoexpert/video render RapportVideo props.json out/rapport.mp4
 */
async function main() {
  const [compositionId, propsPath, outputPath] = process.argv.slice(2);

  if (!compositionId || !propsPath || !outputPath) {
    console.error(
      "Usage: render <compositionId> <props.json> <output.mp4>"
    );
    process.exit(1);
  }

  const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf-8"));

  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, "../src/remotion-entry.ts"),
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  });

  const absoluteOutputPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: absoluteOutputPath,
    inputProps,
  });

  console.log(`Vidéo rendue : ${absoluteOutputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
