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
│   │   │   │   ├── saveScenario.ts
│   │   │   │   ├── startRun.ts
│   │   │   │   ├── recordEvidence.ts
│   │   │   │   ├── completeRun.ts
│   │   │   │   ├── getStatus.ts
│   │   │   │   ├── openDashboard.ts      # Dashboard lifecycle
│   │   │   │   ├── closeDashboard.ts     # Dashboard lifecycle
│   │   │   │   └── getDashboardStatus.ts # Dashboard lifecycle
│   │   │   ├── services/
│   │   │   │   ├── FileSystemService.ts
│   │   │   │   ├── dashboard-manager.ts  # Process lifecycle management
│   │   │   │   └── dashboard-worker.ts   # Forked dashboard process
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
│   │   ├── tsup.config.ts            # Bundler config (bundles UX into dist)
│   │   └── tsconfig.json
│   ├── ux/                           # @harshjudge/ux (bundled into mcp-server)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── panels/
│   │   │   │   │   ├── ScenarioListPanel.tsx
│   │   │   │   │   ├── RunHistoryPanel.tsx
│   │   │   │   │   └── RunDetailPanel.tsx
│   │   │   │   ├── detail/
│   │   │   │   │   └── EvidencePanel.tsx
│   │   │   │   ├── viewers/
│   │   │   │   └── common/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── lib/
│   │   │   │   ├── index.ts
│   │   │   │   └── parseEvidence.ts  # Evidence file type parsing
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
│       │   │   ├── config.ts
│       │   │   ├── scenario.ts
│       │   │   ├── run.ts
│       │   │   ├── evidence.ts
│       │   │   ├── status.ts
│       │   │   └── mcp-tools.ts
│       │   ├── utils/
│       │   │   └── result.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── skills/
│   └── harshjudge/                   # Claude skill files (BMAD-like structure)
│       ├── skill.yaml                # Main skill definition (YAML)
│       ├── tasks/                    # Executable task workflows
│       │   ├── setup-project.md
│       │   ├── analyze-project.md
│       │   ├── create-scenario.md
│       │   ├── run-scenario.md
│       │   └── check-status.md
│       ├── templates/                # Output templates
│       │   ├── scenario-tmpl.yaml
│       │   ├── analysis-output-tmpl.md
│       │   └── status-output-tmpl.md
│       ├── checklists/               # Validation checklists
│       │   ├── setup-checklist.md
│       │   ├── scenario-checklist.md
│       │   ├── pre-run-checklist.md
│       │   └── evidence-checklist.md
│       └── data/                     # Reference data
│           ├── evidence-types.md
│           └── error-protocols.md
├── examples/
│   └── sample-project/               # Demo project
│       ├── .harshJudge/
│       ├── src/
│       └── README.md
├── docs/
│   ├── prd.md
│   ├── brief.md
│   └── architecture.md
├── scripts/
│   └── postinstall.js                # Skill installation script
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── package.json                      # Root package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── README.md
```

---
