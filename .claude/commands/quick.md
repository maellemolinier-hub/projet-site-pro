---
description: Run quick Reddit-only research flow.
---


1. **Fetch data (Reddit only)**

   > Delegate to the `social_media_fetch` skill with: topic = `"ARGUMENTS"`, depth = `quick`, source = `reddit`.
   > This fetches Reddit data only and skips X for speed. Use `/deep-research` for deeper multi-source analysis.

2. **Read the raw data**

   > Read `reddit_data.json` only. Ignore `x_data.json` even if it exists from a prior run.

3. **Provide a concise answer**
   > Synthesize a 3–5 sentence answer directly from the Reddit data. Mention the community favorite, 1–2 alternatives, and a real user quote. Do NOT generate any classified files.
