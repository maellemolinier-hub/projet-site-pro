---
description: Generate discovery clusters from current raw data.
---


This command produces a discovery analysis. It follows the orchestrated pipeline with discovery as the target.

1. **Ensure raw data exists**

   > Check if `reddit_data.json` or `x_data.json` exists. If missing or stale, delegate to the `social_media_fetch` skill to fetch data with `--mode=discovery`:
   >
   > - Broad weekly feed: topic = `DISCOVERY_WEEKLY`
   > - Topic-focused: topic = user's query

2. **Run analysis**

   > Read the `social_media_discovery` skill instructions and follow them to generate `classified_discovery.json`.

3. **Present results**
   > Display discovered topics with engagement scores, sentiment, and top posts from `classified_discovery.json`.
