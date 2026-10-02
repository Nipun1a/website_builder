# Buildify Major Features — Implementation Tasks and Context

## Goal

Implement the requirements in `requiremnets.md` in a sequence that keeps the deployed HTML builder usable. The three headline deliverables are user-owned model providers, MERN project generation, and a terminal CLI.

The source study was based on the current GitHub `main` tree, especially the project controllers, Gemini/OpenRouter configuration, Prisma schema, React editor/preview, and deployment files. The current GitHub `main` commit reviewed was `c6a23a8ed68f3dc8b38c60a604516cb8d691affc`.

## Important baseline context

- `Arya/server/controllers/userController.ts` creates a project, deducts 5 credits, then starts Gemini generation without waiting for it in the request handler. Generation failures are recorded in the conversation and credits are refunded.
- `Arya/server/controllers/projectController.ts` generates revisions through Gemini and stores the result as `current_code` plus a `Version.code` string. It also supports save, rollback, preview, publish, and delete routes.
- `Arya/server/configs/gemini.ts` directly calls Gemini using `GEMINI_API_KEY` from the server environment. `Arya/server/configs/openai.ts` creates an OpenAI-compatible client pointed at OpenRouter, but the generation controllers do not use it.
- `Arya/server/prisma/schema.prisma` stores Buildify users/projects in PostgreSQL. Keep this platform database in place for now; use MongoDB in the generated applications.
- `Arya/client/src/pages/Projects.tsx` provides the editor shell, save/download/publish actions, and coordinates the sidebar, iframe preview, and element editor.
- `Arya/client/src/components/ProjectPreview.tsx` renders saved HTML in an iframe and injects selection code for the visual editor.
- `Arya/client/src/components/Sidebar.tsx` contains the chat-like prompt/revision flow and version rollback UI.
- The current download is an `index.html`; a MERN project needs a full directory/ZIP export and a file-aware editor/preview flow.
- The backend is deployed with Vercel entry points. Long-running code generation, dependency installation, and preview execution cannot safely depend on an Express request staying alive.

## Phase 0 — Confirm contracts and safety boundaries

- [ ] Confirm initial supported providers/models and whether keys persist across sessions.
- [ ] Choose encrypted credential storage for the web app and the encryption key-management/rotation plan.
- [ ] Define the provider adapter contract: generate, revise, stream/cancel, normalize errors, report usage.
- [ ] Define project manifest/file-tree schema, project-kind versioning, and migration strategy for existing HTML projects.
- [ ] Decide preview milestone: frontend-only isolated preview first, or isolated execution of both frontend and backend.
- [ ] Define long-running job lifecycle, persistence, retries, timeouts, and credit/refund rules.
- [ ] Decide CLI distribution name/package, local versus cloud generation behavior, and token-based sign-in flow.

**Exit condition:** API contracts and threat boundaries are written down before persistent key storage or generated code execution is introduced.

## Phase 1 — Provider registry and BYOK MVP

- [ ] Implement server-side provider interface and adapter registry.
- [ ] Move Gemini and OpenRouter calls behind adapters without changing current HTML generation behavior.
- [ ] Add provider/model capability listing and server-side validation.
- [ ] Add a credential data model linked to the authenticated user; persist encrypted key material only if persistence is selected.
- [ ] Add authenticated endpoints to list safe credential metadata, add/replace, test, set default, and delete credentials.
- [ ] Ensure secrets are not returned in API responses and are redacted from error/log paths.
- [ ] Add account settings UI for provider/model selection and key management.
- [ ] Pass provider/model choice through initial generation and revision requests.
- [ ] Define how BYOK requests interact with current 5-credit project/revision charges; align Stripe copy and product UI with actual billing.
- [ ] Add provider-specific errors for invalid credentials, quota/rate limits, unsupported model, timeouts, and outages.

**Exit condition:** A signed-in user can configure a key, test it, generate and revise a current HTML project with that provider, and remove the key.

## Phase 2 — Durable generation jobs

- [ ] Replace untracked fire-and-forget generation with a persisted job state and status endpoint.
- [ ] Move provider requests to a durable worker/runtime suitable for the deployment architecture.
- [ ] Add idempotency, cancellation/timeouts, retry policy for transient provider failures, and safe user-visible progress.
- [ ] Make credit deduction and refunds idempotent and transactional with job status changes.
- [ ] Update the client to poll or subscribe to job status instead of relying on fixed project polling alone.
- [ ] Keep failures and provider/model usage metadata attached to the project/job without storing keys.

**Exit condition:** Requests can survive serverless function termination and report one consistent final outcome without double charging/refunding.

## Phase 3 — Multi-file project model with legacy compatibility

- [ ] Add a project kind/stack metadata field and versioned project manifest.
- [ ] Store files as validated relative paths and text contents; set per-file, per-project, and request size limits.
- [ ] Add a data migration or compatibility adapter that presents existing HTML code as a legacy single-file project.
- [ ] Change version snapshots and rollback to cover the full file manifest.
- [ ] Update save/revision APIs to accept structured file changes and reject traversal paths, unsafe paths, and malformed payloads.
- [ ] Add a file browser/editor UI; preserve existing element selection editing for legacy HTML projects.
- [ ] Add full-project ZIP export with package scripts, `.env.example`, and MongoDB setup instructions.
- [ ] Exclude credentials, `.env` files, dependency folders, caches, and build outputs from exports.

**Exit condition:** Old projects still load, save, and roll back; a multi-file sample project can be edited, versioned, and exported.

## Phase 4 — MERN generation and isolated preview

- [ ] Add a MERN project template contract: React client, Express API, Node scripts, MongoDB connection/model example, validation, and README.
- [ ] Add prompts that request structured files/change sets rather than one complete HTML response.
- [ ] Validate model output against the manifest schema and run safe static checks before accepting it.
- [ ] Support natural-language revisions that update selected files without replacing unrelated files.
- [ ] Build an isolated preview/build service with CPU, memory, time, storage, and network restrictions; generated code must never execute in the main API process.
- [ ] If full API execution is outside the first preview milestone, provide a working frontend preview with a clearly stated mock/backend limitation.
- [ ] Update the editor to select project type, browse files, preview, save, version, rollback, and export.
- [ ] Test generation and revision using all supported provider adapters.

**Exit condition:** A user can produce and export a useful MERN app, inspect/revise its files, and safely preview the supported scope.

## Phase 5 — Buildify CLI MVP

- [ ] Create a separate CLI package with `buildify --help`, version output, and documented installation.
- [ ] Implement `buildify create` for prompt-driven local project creation using the shared manifest/provider contract.
- [ ] Implement provider selection and local key configuration with secret redaction.
- [ ] Implement `buildify login` using scoped revocable CLI credentials, not browser session cookies.
- [ ] Implement cloud list/download/sync commands only after stable cloud APIs exist.
- [ ] Add non-interactive flags, progress output, clear exit codes, and readable provider/build errors.
- [ ] Never auto-run generated code as a side effect of generation.
- [ ] Document MongoDB environment setup and local run/build/export commands.

**Exit condition:** A new user can install the CLI, authenticate or use a local key, create a MERN project, and follow its printed instructions to run it.

## Phase 6 — Release readiness

- [ ] Update README, architecture notes, `.env.example` files, deployment settings, and support/error documentation.
- [ ] Add explicit privacy and billing explanations for BYOK, Buildify credits, and provider charges.
- [ ] Add quota/rate limiting and abuse controls for user keys, generation, builds, and previews.
- [ ] Add operational monitoring that excludes prompts/secrets from logs unless explicitly needed and safely redacted.
- [ ] Verify migrations against a copy of existing project data and verify rollback/restore behavior.
- [ ] Run a staged rollout with legacy HTML projects before enabling MERN generation by default.

## Dependencies and ordering

```text
Phase 0 contracts
      ↓
Phase 1 provider/BYOK ──→ Phase 2 durable jobs
                                  ↓
                    Phase 3 multi-file project format
                                  ↓
                    Phase 4 MERN generation/preview
                                  ↓
                    Phase 5 CLI
                                  ↓
                    Phase 6 release readiness
```

The CLI depends on the stable provider and project-format contracts. MERN generation depends on the multi-file model. Durable jobs should precede production MERN builds because dependency installs and builds take longer and need isolated workers.

## Decisions still needed before coding

1. Which initial providers/models should launch first?
2. Should web-entered keys persist encrypted in the account, or be supplied for each session/request?
3. Should BYOK remove AI credit charges, or keep a separate Buildify usage charge?
4. Is frontend-only isolated preview acceptable for the first MERN milestone?
5. Should the CLI support local generation from day one, cloud generation, or both?

## Branch and source context

Feature work should live on a branch created from the current GitHub `main`, not from a stale local `main`. The reviewed GitHub `main` ref was `c6a23a8ed68f3dc8b38c60a604516cb8d691affc`. The local checkout at the start of this planning task was `fee7d07e561909431a716d31fa773fd19df62ba4`, so it needs to be synchronized to the feature branch before implementation begins.


