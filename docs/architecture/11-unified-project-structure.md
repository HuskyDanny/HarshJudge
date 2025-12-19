# 11. Unified Project Structure

```
HarshJudge/
├── .github/
│   └── workflows/
│       ├── ci.yaml                   # Lint, type-check, test
│       └── release.yaml              # npm publish workflow
├── packages/
│   ├── mcp-server/                   # @allenpan/harshjudge-mcp (published to npm)
│   │   ├── src/
│   │   │   ├── handlers/
│   │   │   │   ├── initProject.ts
│   │   │   │   ├── createScenario.ts    # NEW: replaces saveScenario
│   │   │   │   ├── saveScenario.ts      # DEPRECATED: kept for backward compat
│   │   │   │   ├── toggleStar.ts        # NEW: star/unstar scenarios
│   │   │   │   ├── startRun.ts
│   │   │   │   ├── recordEvidence.ts    # UPDATED: stepId parameter
│   │   │   │   ├── completeStep.ts      # NEW: per-step completion
│   │   │   │   ├── completeRun.ts
│   │   │   │   ├── getStatus.ts         # UPDATED: starredOnly filter
│   │   │   │   ├── openDashboard.ts
│   │   │   │   ├── closeDashboard.ts
│   │   │   │   └── getDashboardStatus.ts
│   │   │   ├── services/
│   │   │   │   ├── FileSystemService.ts # UPDATED: new directory structure
│   │   │   │   ├── dashboard-manager.ts
│   │   │   │   └── dashboard-worker.ts
│   │   │   ├── utils/
│   │   │   │   ├── slugify.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── paths.ts
│   │   │   ├── server.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   ├── handlers/
│   │   │   └── services/
│   │   ├── package.json
│   │   ├── tsup.config.ts
│   │   └── tsconfig.json
│   ├── ux/                           # @harshjudge/ux (bundled into mcp-server)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── panels/
│   │   │   │   │   ├── ScenarioListPanel.tsx  # UPDATED: star icon, step count
│   │   │   │   │   ├── RunHistoryPanel.tsx
│   │   │   │   │   └── RunDetailPanel.tsx     # UPDATED: per-step view
│   │   │   │   ├── detail/
│   │   │   │   │   ├── EvidencePanel.tsx      # UPDATED: step navigation
│   │   │   │   │   └── StepTimeline.tsx       # NEW: step status timeline
│   │   │   │   ├── viewers/
│   │   │   │   └── common/
│   │   │   │       └── StarButton.tsx         # NEW: star toggle component
│   │   │   ├── hooks/
│   │   │   │   ├── useScenarios.ts            # UPDATED: starred filter
│   │   │   │   └── useSteps.ts                # NEW: step data hooks
│   │   │   ├── services/
│   │   │   ├── lib/
│   │   │   │   ├── index.ts
│   │   │   │   └── parseEvidence.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── tests/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                       # @harshjudge/shared (bundled into mcp-server)
│       ├── src/
│       │   ├── types/
│       │   │   ├── config.ts              # UPDATED: ProjectPRD type
│       │   │   ├── scenario.ts            # UPDATED: Step, StepReference types
│       │   │   ├── run.ts                 # UPDATED: StepResult, RunResult types
│       │   │   ├── evidence.ts            # UPDATED: stepId field
│       │   │   ├── status.ts              # UPDATED: starred, stepCount fields
│       │   │   └── mcp-tools.ts           # UPDATED: new tool schemas
│       │   ├── utils/
│       │   │   └── result.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── skills/
│   └── harshjudge/                   # Claude skill files (CONSOLIDATED)
│       ├── SKILL.md                  # Main entry (includes agent patterns)
│       ├── assets/
│       │   └── prd.md                # PRD template for initProject
│       └── references/
│           ├── setup.md              # Project initialization
│           ├── create.md             # Scenario creation (uses createScenario)
│           ├── run.md                # Step execution (includes Playwright tools)
│           ├── status.md             # Status checking
│           └── iterate.md            # Scenario editing
├── examples/
│   └── sample-project/               # Demo project (UPDATED structure)
│       ├── .harshJudge/
│       │   ├── config.yaml
│       │   ├── prd.md
│       │   └── scenarios/
│       │       └── login-flow/
│       │           ├── meta.yaml
│       │           ├── steps/
│       │           │   ├── 01-navigate-to-login.md
│       │           │   ├── 02-enter-credentials.md
│       │           │   └── 03-submit-form.md
│       │           └── runs/
│       ├── src/
│       └── README.md
├── docs/
│   ├── prd/                          # Sharded PRD
│   ├── architecture/                 # Sharded architecture
│   ├── stories/                      # User stories
│   └── proposals/                    # Change proposals
├── scripts/
│   └── postinstall.js
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── CLAUDE.md
└── README.md
```

## Key Changes in Epic 6

### New Files
| File | Purpose |
|------|---------|
| `handlers/createScenario.ts` | Create scenarios with granular steps |
| `handlers/toggleStar.ts` | Toggle scenario starred status |
| `handlers/completeStep.ts` | Mark individual steps as complete |
| `components/detail/StepTimeline.tsx` | Visual step status timeline |
| `components/common/StarButton.tsx` | Star toggle component |
| `hooks/useSteps.ts` | Step data management hooks |

### Removed Files
| File | Reason |
|------|--------|
| `skills/harshjudge/references/agent-pattern.md` | Embedded in SKILL.md |
| `skills/harshjudge/references/playwright-tools.md` | Embedded in run.md |
| `skills/harshjudge/assets/iterations.md` | No longer needed |

### Updated Files
| File | Changes |
|------|---------|
| `handlers/saveScenario.ts` | Deprecated, redirects to createScenario |
| `handlers/recordEvidence.ts` | stepId parameter, per-step directories |
| `handlers/getStatus.ts` | starredOnly filter |
| `services/FileSystemService.ts` | New directory structure support |
| `types/scenario.ts` | Step, StepReference, starred field |
| `types/run.ts` | StepResult, per-step tracking |
| `SKILL.md` | Agent spawning patterns included |
| `references/run.md` | Playwright tools included |

---
