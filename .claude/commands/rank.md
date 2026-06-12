---
description: Generate ranking report from current raw data.
---


This command produces a ranked analysis. It follows the orchestrated pipeline with rank as the target.

1. **Ensure raw data exists**

   > Check if `reddit_data.json` or `x_data.json` exists. If missing or stale, delegate to the `social_media_fetch` skill to fetch fresh data with deep depth.

2. **Run analysis**

   > Read the `social_media_rank` skill instructions and follow them to generate `classified_rank.json`.

3. **Present results**
   > Display key insights and ranked products from `classified_rank.json`.
