---
description: Generate trend timeline report from current raw data.
---


This command produces a trend analysis. It follows the orchestrated pipeline with trend as the target.

1. **Ensure raw data exists**

   > Check if `reddit_data.json` or `x_data.json` exists. If missing or stale, delegate to the `social_media_fetch` skill to fetch fresh data with deep depth.

2. **Run analysis**

   > Read the `social_media_trend` skill instructions and follow them to generate `classified_trend.json`.

3. **Present results**
   > Display timeline activity, engagement trends, and key moments from `classified_trend.json`.
