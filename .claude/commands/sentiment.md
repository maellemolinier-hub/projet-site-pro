---
description: Generate sentiment report from current raw data.
---


This command produces a sentiment breakdown. It follows the orchestrated pipeline with sentiment as the target.

1. **Ensure raw data exists**

   > Check if `reddit_data.json` or `x_data.json` exists. If missing or stale, delegate to the `social_media_fetch` skill to fetch fresh data with deep depth.

2. **Run analysis**

   > Read the `social_media_sentiment` skill instructions and follow them to generate `classified_sentiment.json`.

3. **Present results**
   > Display overall mood, sentiment distribution, and per-product breakdown from `classified_sentiment.json`.
