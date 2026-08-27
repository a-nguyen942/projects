# Todo List App

## Project direction

- Build a downloadable desktop application, not a hosted website.
- Prefer Electron with vanilla HTML, CSS, and JavaScript.
- Keep the app offline-first and store user data locally by default.
- Keep the interface calm, simple, and student-friendly.

## Development guidelines

- Favor small, understandable changes over adding unnecessary frameworks.
- Do not add a backend, account system, or cloud sync unless explicitly requested.
- Keep desktop-only code separate from renderer/UI code.
- Do not expose unrestricted Node.js or file-system access to the renderer.
- Use clear names and short comments only where they improve understanding.

## Before finishing a change

- Run the relevant formatter, linter, or tests when they exist.
- Manually check that the app starts and the changed flow works.
- Keep user task data backward-compatible, or provide a migration when changing its format.
- Double check to see if it's doing what the user asked.
