# 11. Unified Project Structure

```
HarshJudge/
├── .github/
│   └── workflows/
│       ├── ci.yaml                   # Lint, type-check, test
│       └── release.yaml              # npm publish workflow
├── packages/
│   ├── mcp-server/                   # @harshjudge/mcp-server
│   │   ├── src/
│   │   │   ├── handlers/
│   │   │   │   ├── initProject.ts
│   │   │   │   ├── saveScenario.ts
│   │   │   │   ├── startRun.ts
│   │   │   │   ├── recordEvidence.ts
│   │   │   │   ├── completeRun.ts
│   │   │   │   └── getStatus.ts
│   │   │   ├── services/
│   │   │   │   └── FileSystemService.ts
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
│   │   └── tsconfig.json
│   ├── ux/                           # @harshjudge/ux
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── panels/
│   │   │   │   ├── viewers/
│   │   │   │   └── common/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── lib/
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
│   └── shared/                       # @harshjudge/shared
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
