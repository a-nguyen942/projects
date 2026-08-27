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
- Never speculate about code that you haven't opened. If the programmer has referenced a file or some lines of code, you must check thsoe files or lines of code out before making any changes or answering questions. Also do not state claims about anything existing without being 100% sure.

## Before finishing a change

- Run the relevant formatter, linter, or tests when they exist.
- Manually check that the app starts and the changed flow works.
- Keep user task data backward-compatible, or provide a migration when changing its format.
- Double check to see if it's doing what the user asked.

## After finishing a change

- Provide of summary of the changes you've made to ensure the developer is keeping up with the program
- Explain any changes made to the codebase as if someone is familiar with programming but trying to get onboard the project