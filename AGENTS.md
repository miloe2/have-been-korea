## MVP-first Development
This project is currently focused on shipping an MVP.

Optimize for speed, simplicity, and correctness over long-term architecture.

Guidelines:
- Implement only what is needed for the current task.
- Keep code simple and direct.
- Do not add abstractions, reusable frameworks, or generalized helpers unless they are clearly necessary.
- Do not refactor unrelated code.
- Do not optimize for future use cases.
- Prefer local, task-specific solutions over broad reusable patterns.
- Leave refactoring and cleanup for later unless explicitly requested.

When in doubt, choose the smallest working change.
Do not run build, lint, test, or dev server. Only modify the code and list manual verification commands.

## Design
For any UI/UX, layout, styling, or component changes, read `DESIGN.md` first and follow it.

