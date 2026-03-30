# .agent — VBCS Expert Agent Configuration

This folder configures an AI coding agent for Oracle Visual Builder Cloud Service (VBCS) and Oracle JET development using the Redwood design system.

## Folder Structure

```
.agent/
├── README.md                  ← You are here
├── knowledge/                 ← Core reference docs (01–09)
│   ├── 01-project-structure.md
│   ├── 02-action-chains.md
│   ├── 03-notifications-and-adp.md
│   ├── 04-rest-and-data.md
│   ├── 05-jet-components.md
│   ├── 06-best-practices-and-pitfalls.md
│   ├── 07-lifecycle-templates-forms.md
│   ├── 08-debugging-navigation-variables.md
│   └── 09-redwood-layout-adp-patterns-components.md
├── rules/                     ← Always-on guardrails and checklists
│   ├── checklist.md
│   ├── redwood-components-reference-1.md
│   ├── rules.md
│   └── vbcs-best-practices.md
├── skills/                    ← Skill definitions and prompt templates
│   ├── VBCS_Expert/
│   │   └── SKILL.md           ← Main skill definition (start here)
│   ├── VBCS_Prompting_Playbook.md
│   ├── VBCS_Prompt_Templates.md
│   └── VBCS_Validation_Checklist.md
└── workflows/                 ← Step-by-step task templates
    └── service-connection.md
```

## How It Works

- **`knowledge/`** contains the authoritative reference material — production-tested patterns, canonical code, and bug-fix recipes from real VBCS projects. The agent should consult these before generating code.
- **`rules/`** contains always-on validation rules. Code output must pass these checks before delivery.
- **`skills/VBCS_Expert/SKILL.md`** is the entry point. It defines competencies and includes a routing table mapping tasks to the relevant knowledge docs.
- **`skills/`** (other files) provide ready-made prompt templates for common development scenarios.
- **`workflows/`** provides step-by-step procedures for multi-step tasks like creating service connections.

## Quick Start

1. Place this `.agent/` folder in your project root.
2. Your IDE agent (Claude Code, Cursor, Windsurf, etc.) will pick up the rules and skills automatically.
3. When asking the agent to build or modify VBCS code, it will consult the knowledge docs and validate against the checklists.
