---
description: Research a topic using the Quick Answer flow.
---


1. **Fetch data**

   > Delegate to the `social_media_fetch` skill with **quick** depth:
   > Topic = `"ARGUMENTS"`, depth = `quick`.
   > Optionally add `--from=YYYY-MM-DD --to=YYYY-MM-DD` if user specifies a date range.

2. **Analyze the results**

   > Read the generated `reddit_data.json` and `x_data.json`.

3. **Provide an answer**
   > Based on the data, provide a concise answer including the Community Favorite, decent alternatives, and a representative quote. Do not produce any `classified_*.json` file.
