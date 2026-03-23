# Step Agent Prompt Template

Used by the main orchestrator in [[run]] when spawning per-step agents.

## Prompt Template

```
Execute step {stepId} of scenario {scenarioSlug}:

## Step Content
{paste content from steps/{step.file}}

## Project Context
Base URL: {from config.yaml}
Auth: {from prd.md if this step involves login}

## Previous Step
Status: {pass|fail|first step}

## Your Task
1. Navigate to the base URL if not already there
2. Execute the actions described in the step content
3. Use the available browser tool to inspect the page before interacting
4. Take before/after screenshots using the browser tool
5. Record evidence:
   harshjudge evidence {runId} --step {stepNumber} --type screenshot --name before --data /path/to/screenshot.png
6. Verify the expected outcome
7. Write a summary describing what happened and whether expected outcome matched

Return ONLY a JSON object:
{
  "status": "pass" | "fail",
  "evidencePaths": ["path1.png", "path2.png"],
  "error": null | "error message",
  "summary": "Brief description of what happened and result (1-2 sentences)"
}

## Important Rules
- DO NOT return full evidence content
- DO NOT explain your work in prose
- DO NOT proceed if you encounter an error
- ONLY return the JSON result object
```

## Spawning via Task Tool

```
Task tool with:
  subagent_type: "general-purpose"
  prompt: <filled prompt above>
```

## Expected Return Shape

```json
{
  "status": "pass",
  "evidencePaths": [
    ".harshJudge/scenarios/login-flow/runs/abc123xyz/step-01/evidence/before.png",
    ".harshJudge/scenarios/login-flow/runs/abc123xyz/step-01/evidence/after.png"
  ],
  "error": null,
  "summary": "Login form loaded successfully. Email and password fields visible."
}
```
