---
description: Generate controversy map from current raw data.
---


This command produces a controversy analysis. It follows the orchestrated pipeline with controversy as the target.

1. **Ensure raw data exists**

   > Check if `reddit_data.json` or `x_data.json` exists. If missing or stale, delegate to the `social_media_fetch` skill to fetch fresh data with deep depth.

2. **Run analysis**

   > Read the `social_media_controversy` skill instructions and follow them to generate `classified_controversy.json`.

3. **Present results**
   > Display controversies with side-by-side opposing views and heat scores from `classified_controversy.json`.
