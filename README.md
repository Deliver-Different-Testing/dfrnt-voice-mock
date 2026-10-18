# DFRNT Voice mock

Click-through mock of the DFRNT Voice agent for stakeholders. Scripted data only, no backend.

Live: https://deliver-different-testing.github.io/dfrnt-voice-mock/

- `#/` what this is, and what is built vs proposed
- `#/voice-agent/{settings|prompts|activity|telephony|usage}` Integration Manager > 3CX > Voice agent tab
- `#/simulator/{scenario}` step through scripted calls against the real tool API shape

Spec: `docs/specs/2026-10-18-dfrnt-voice-agent-spec.md` on dfrnt-ops branch `docs/dfrnt-voice-agent-spec`.
The tool API and settings already exist in Integration Manager (GitLab `develop`, MR !150). Everything else is proposed.

Vite + React + TypeScript, HashRouter, deployed by `.github/workflows/pages.yml` on push to `main`.
