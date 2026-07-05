# Skill Registry

**Orchestrator use only.** Read this registry once per session to resolve skill paths, then pass pre-resolved paths directly to each sub-agent's launch prompt. Sub-agents receive the path and load the skill directly — they do NOT read this registry.

## User Skills

No non-SDD user skills found.

## Project Conventions

No project convention files found (no CLAUDE.md, AGENTS.md, .cursorrules, GEMINI.md, or copilot-instructions.md).

## Notes

- SDD workflow skills (sdd-*) and _shared are excluded per convention.
- Skills directory: `C:\Users\USER\.config\opencode\skills\` (11 SDD skills + _shared utilities)
- Project spec file: `C:\Users\USER\nodeids\nodeisd.md` (457 lines, full requirements in Spanish)
- Project is not yet scaffolded — no `package.json` or config files exist.
- **Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, React Flow, Zustand, TanStack Query, React Hook Form, Zod, Framer Motion, Lucide React, Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **Deploy target**: Vercel
