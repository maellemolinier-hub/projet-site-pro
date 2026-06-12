---
description: Run deep research flow and route to best template.
---


This command runs the full research pipeline. Follow the `using_social_media_research` orchestrator skill to execute all steps.

**Pipeline overview** (orchestrator handles the details):

1. **Resolve intent** — determine which analysis type fits the user's question (rank, sentiment, trend, controversy, discovery, or all).
2. **Fetch data** — the orchestrator delegates to `social_media_fetch` to run `sc-research research:deep "ARGUMENTS"` (add `--from=YYYY-MM-DD --to=YYYY-MM-DD` if the user specifies a date range).
3. **Analyze** — the orchestrator delegates to the matched worker skill(s) to produce `classified_*.json` output.
4. **Present results** — display the analysis summary to the user.

Read the `using_social_media_research` skill now and follow its Step 1 through Step 6.
