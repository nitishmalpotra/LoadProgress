# Contributing to LoadProgress

LoadProgress is a Vite, React, TypeScript, Dexie, Zustand, and Recharts PWA. Keep changes focused,
small, and aligned with the existing local-first architecture.

## Workflow

1. Fork the repository and create a feature branch from `main`.

   ```bash
   git checkout -b feature/short-description
   ```

2. Install dependencies and run the app locally.

   ```bash
   npm install
   npm run dev
   ```

3. Make the smallest change that solves the issue. Reuse existing models, store actions, CSS module
   patterns, and Liquid Glass tokens before adding new abstractions.

4. Run all checks before submitting a pull request.

   ```bash
   npm run test
   npm run lint
   npm run format
   npm run build
   ```

## Code Style

- Use TypeScript for app code and tests.
- Keep React components accessible and responsive across mobile bottom-tab and desktop-sidebar
  layouts.
- Format code with Prettier through `npm run format`.
- Fix ESLint findings from `npm run lint` instead of disabling rules.
- Do not add Tailwind or other utility CSS frameworks; the project uses vanilla CSS modules and
  shared Liquid Glass tokens.

## Branches and Commits

Use descriptive branch prefixes:

- `feature/add-rest-presets`
- `fix/pr-volume-record`
- `docs/update-setup`
- `chore/refresh-tooling`

Use Conventional Commits:

```text
feat(workout): add rest timer presets
fix(store): prevent future workout dates
docs(readme): clarify local setup
chore(lint): add prettier verification
```

## Pull Requests

- Explain the user-facing change and any data model impact.
- Include screenshots for UI changes.
- Mention the commands you ran and their results.
- Keep unrelated refactors out of the PR.
