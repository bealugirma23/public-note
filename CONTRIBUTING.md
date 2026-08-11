# Contributing to Public Notes

First off, thank you for considering contributing to Public Notes! It's people like you that make this community tool better.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please open an issue and include:
- A clear description of the issue.
- Steps to reproduce the behavior.
- Expected vs. actual behavior.
- Screenshots if applicable.

### Suggesting Enhancements
Have an idea for a new feature? We'd love to hear it! Open an issue describing:
- What the feature is.
- Why it would be useful.
- How it should work conceptually.

### Code Contributions
1. **Fork the repo** and create a branch from `main` (e.g., `feature/amazing-feature` or `fix/overlapping-notes`).
2. **Review the architecture:** Read the `docs/` folder (`ARCHITECTURE.md`, `DESIGN.md`) to understand the structure.
3. **Follow the style:** This project uses Tailwind CSS, Shadcn UI, and React Server/Client Components. Adhere to the existing code style.
4. **Write tests:** For any new logic, add Jest tests (in `__tests__/`). For user flows, add Playwright tests (in `e2e/`).
5. **Lint and format:** Run `npm run lint` and ensure there are no warnings or errors.
6. **Submit a PR:** Provide a clear description of your changes, the motivation behind them, and link to any relevant issues.

## Development Setup
Please refer to the `README.md` for instructions on setting up your local environment, configuring Supabase, and running the application.

## Pull Request Process
1. Ensure your code builds locally and all tests pass (`npm run test` and `npm run test:e2e`).
2. Update the `README.md` or `docs/` with details of changes to the interface or architecture, if applicable.
3. Wait for code review. Maintainers may request changes before merging.

Thank you for contributing!
