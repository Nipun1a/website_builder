# Buildify Major Feature Requirements

## Purpose

Plan the next major Buildify release around three capabilities:

1. Let users connect their own model provider API keys and choose the model used for generation and revisions.
2. Generate complete MERN applications instead of only standalone HTML pages.
3. Provide a Buildify CLI so users can create and work with projects from a terminal.

This document records the agreed product direction and the architectural requirements discovered by reviewing the current repository. It is a planning baseline; it does not claim that these features have been implemented.

## Current project baseline

- The product UI is React with Vite and TypeScript under `Arya/client`.
- The API is Node.js and Express under `Arya/server`.
- Buildify itself uses PostgreSQL and Prisma, Better Auth, Stripe, and Vercel deployment entry points.
- New website generation and prompt-based revisions currently call Gemini directly and return one HTML document using Tailwind CDN.
- Project code and version code are stored as strings. The editor previews HTML in an iframe, saves HTML, and downloads `index.html`.
- Projects already have prompts, conversations, versions, rollback, publish state, user credits, and Stripe credit purchases.
- An OpenAI-compatible OpenRouter client exists, but the inspected generation flow uses the Gemini helper directly.
- Generation currently continues asynchronously after the create-project request returns. Longer builds and full app previews need a durable job/runtime design before production use.
- No CLI package currently exists in the repository.

Relevant code: `Arya/server/controllers/userController.ts`, `Arya/server/controllers/projectController.ts`, `Arya/server/configs/gemini.ts`, `Arya/server/configs/openai.ts`, `Arya/server/prisma/schema.prisma`, `Arya/client/src/pages/Projects.tsx`, `Arya/client/src/components/ProjectPreview.tsx`, and `Arya/client/src/components/Sidebar.tsx`.

## Product scope and assumptions

- “MERN generation” means the **websites Buildify creates** should be full-stack MongoDB, Express, React, and Node applications.
- Keep Buildify’s own PostgreSQL/Prisma data store for this initiative. Migrating Buildify itself to MongoDB is out of scope unless explicitly decided later.
- Existing HTML projects remain readable and usable while the new project type is introduced.
- BYOK (bring your own key) means the user’s model provider bills them for inference. Buildify credits may remain for Buildify-hosted services or product features, but must not misrepresent model inference charges.
- Use a provider registry so the editor, API, and CLI do not each implement vendor-specific logic.
- Start with a small, maintainable provider set (for example OpenAI, Gemini, Anthropic, and OpenRouter); add more through adapters after the contract is stable.

## Feature 1: Bring your own model key

### User requirements

- A signed-in user can select a supported provider and model, add or replace a key, test it, choose a default, and remove it.
- The project generation and revision interfaces use the selected provider/model and show actionable errors for invalid keys, rate limits, unavailable models, and provider failures.
- A user can understand that their provider account pays for requests and can see which provider/model a project or generation used.

### Security and privacy requirements

- Send keys to the backend over HTTPS; do not expose a saved key back to the browser.
- Never store keys in generated source, project history, prompts, logs, analytics, or client-side persistent storage.
- If keys persist between sessions, encrypt them at rest with a managed/envelope encryption design. Store only non-secret provider metadata and a masked suffix for display.
- Allow users to replace and delete credentials; deletion must prevent future use.
- Keep provider calls server-side for the web app. The CLI may read a user’s local secret/environment configuration and must never print it.
- Limit and validate provider/model identifiers; do not accept arbitrary upstream URLs from a user-supplied provider configuration in the first release.

### Architecture requirements

- Define a common provider interface for generation, revision, streaming if supported, error normalization, and usage/cost metadata.
- Keep provider implementations behind server-side adapters; expose a safe list of supported providers/models to the client.
- Provide one credential resolution path for web projects and CLI requests, with per-user ownership checks.
- Add request timeouts, cancellation where possible, rate limits, request size limits, and safe logging.

## Feature 2: Generate MERN applications

### User requirements

- Users can create a new MERN project from a prompt and request revisions in natural language.
- Generated projects include a React client, Express/Node API, MongoDB connection/model examples, package scripts, and setup documentation.
- Users can inspect and edit project files, preview the frontend, save, roll back, and download/export the complete project.
- MongoDB credentials are supplied by the project owner through local environment variables; Buildify must not invent or embed secrets.

### Architecture requirements

- Replace the one-string-only project representation with a versioned project manifest and a path-to-file-content representation.
- Record stack/template metadata and generation provider/model metadata without storing the provider key.
- Revisions should apply structured file changes while preserving files the model did not change. Validate paths and payload size before saving.
- Keep old HTML projects supported, either as a legacy project kind or through a safe import/compatibility adapter.
- Export a complete ZIP or equivalent folder structure with `.env.example` and setup instructions; exclude secrets and generated build artifacts.
- A complete MERN app cannot run in the current HTML iframe. Preview/build execution must be isolated from the API host and have CPU, memory, time, network, and storage limits. Start with a frontend preview if backend execution cannot be safely supported in the first milestone, and make that limitation clear.
- Never execute model-generated code in the main Buildify API process.

## Feature 3: Buildify CLI

### User requirements

- Install and run a documented `buildify` command from a terminal.
- Create a local MERN project from a prompt, configure a provider/model key, and generate files locally or through the authenticated Buildify API.
- Sign in to Buildify when the user wants to list, download, or synchronize cloud projects.
- Work locally with normal development tools, build/export the application, and receive clear setup instructions for MongoDB.
- Provide useful help, validation, progress, readable errors, and non-interactive options for automation.

### Architecture requirements

- Publish the CLI as a separate package/workspace, sharing provider and project-format contracts with the web app.
- Support local provider credentials through environment variables and/or an OS-backed secret store; redact secrets from logs and diagnostics.
- Use scoped, revocable authentication for cloud operations. Do not reuse or store a user's web session cookie as a CLI credential.
- Keep local generation possible where provider SDK/license/API terms permit; cloud sync requires authentication.
- Do not have the CLI execute generated project code automatically as part of generation.

## Cross-cutting requirements

- Preserve user ownership checks on every project and credential operation.
- Make project creation, model requests, and build status observable with clear pending/succeeded/failed states.
- Move long-running generation/build work to durable jobs rather than relying on a serverless request process staying alive.
- Handle credit/accounting changes transactionally and define refund behavior for failed provider/build jobs.
- Add migrations with backwards compatibility, structured validation, and explicit file/path limits.
- Update documentation, deployment configuration, environment examples, and user-facing billing/privacy explanations.
- Build and verify incrementally at each milestone; keep the currently deployed HTML builder working during rollout.

## Success criteria

- A user can securely configure a supported provider key and successfully generate and revise a project without using Buildify’s shared model key.
- A user can create, edit, version, preview (within the supported isolation scope), and export a multi-file MERN project; old HTML projects still work.
- A user can create a project and use supported cloud/local workflows from the CLI without leaking credentials.
- Failed or timed-out work has a visible status and predictable credit/accounting outcome.


