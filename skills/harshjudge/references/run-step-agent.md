# Step Agent Prompt Template

Used by the main orchestrator in [[run]] when spawning per-step agents.

## Prompt Template

```
Execute step {stepId} of scenario {scenarioSlug}:

## Step Content
{paste content from steps/{step.file}}

## Step Type
{type from step frontmatter, or infer from content: frontend|backend|cli}

## Project Context
Base URL: {from config.yaml}
Services: {from prd.md — list of services under test}

## Previous Step
Status: {pass|fail|first step}

## Your Task
Based on step type:

**frontend:**
1. Use the available browser tool to navigate and interact
2. Inspect the page before clicking or typing
3. Take before/after screenshots
4. Record evidence: harshjudge evidence {runId} --step {stepNumber} --type screenshot --name before --data /path/to/screenshot.png

**backend:**
1. Execute HTTP requests using curl or httpie via Bash
2. Capture the full response (status, headers, body)
3. Record evidence: harshjudge evidence {runId} --step {stepNumber} --type api_response --name response --data /path/to/response.json

**cli:**
1. Run the specified commands via Bash
2. Capture stdout and stderr
3. Record evidence: harshjudge evidence {runId} --step {stepNumber} --type stdout --name output --data /path/to/output.txt

Then verify the expected outcome and return ONLY a JSON object:
{
  "status": "pass" | "fail",
  "evidencePaths": ["path1", "path2"],
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
    ".harshJudge/scenarios/login-flow/runs/abc123xyz/step-01/evidence/response.json"
  ],
  "error": null,
  "summary": "Login form loaded successfully. Email and password fields visible."
}
```
