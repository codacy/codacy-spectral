# Codacy Spectral

This is an integration created so that Codacy can run the [spectral](https://github.com/stoplightio/spectral)
tool in its infrastructure, or using its [CLI](https://github.com/codacy/codacy-analysis-cli).

## Generating documentation

```bash
cd doc-generator
npm install
npm run compile && node dist/index.js
```

## Build docker image

```bash
docker build -t codacy-spectral .
```

## Test changes to codacy-seed locally
You may need to test changes that comes from our [codacy-engine-typescript-seed](https://github.com/codacy/codacy-engine-typescript-seed).

1. Create a package with your changes on the seed:
    * Don't forget to update the dependencies: `npm install`
    * Compile the library: `npm run compile`
    * Package the library: `npm pack`
        > This should generate a codacy-seed-0.0.1.tgz on your codacy-seed repository

2.  Copy the `codacy-seed-0.0.1.tgz` into the root of this repository

3.  Install the package: `npm install codacy-seed-0.0.1.tgz`

4.  Update Dockerfile and `.dockerignore` so you copy the `codacy-seed-0.0.1.tgz` inside the docker you will be building
    *  Add `!codacy-seed-0.0.1.tgz` to your `.dockerignore`
    *  Add the package to the docker before `RUN npm install`: `COPY codacy-seed-0.0.1.tgz ./`
    *  Remove multi-stage docker steps
        *  Lines from `FROM node:$NODE_IMAGE_VERSION` to `RUN rm -rf /package.json /package-lock.json`
        > This way you skip copying the files to the other docker, and another `npm install`

5.  Publish your docker locally as normal: `docker build -t codacy-spectral .`

## Agent Playbook: Updating This Repository End-to-End

This section is written for an AI coding agent (or a human) tasked with updating this repo — most commonly bumping the wrapped [Spectral](https://github.com/stoplightio/spectral) version, but also Node base image / CircleCI orb / other dependency bumps. Follow it top to bottom; it tells you what to change, how to regenerate derived files, how to test locally, and how to interpret CI so you can iterate on failures without guessing.

### 1. What this repository is

This is a **Codacy engine**: a Node.js/TypeScript wrapper (`src/`, built on the `codacy-seed` library) that packages [Spectral](https://github.com/stoplightio/spectral) — Stoplight's OpenAPI/AsyncAPI/JSON/YAML linter — as a Docker image Codacy's platform can run against a customer's source code. The `docs/` directory is not just documentation — it is **machine-consumed configuration**:

- `docs/patterns.json` — the full list of Spectral rules ("patterns") Codacy knows about, their category/level/enabled defaults. Generated file, do not hand-edit.
- `docs/description/description.json` + `docs/description/*.md` — human-readable titles/descriptions per pattern, used in the Codacy UI. Generated file, do not hand-edit.
- `docs/multiple-tests/*` — fixtures used by `codacy-plugins-test` (`run_multiple_tests: true` in CI) to validate the engine actually produces the results it claims to for real code samples.
- `docs/tool-description.md` — short blurb about the tool, hand-maintained.

Both generated artifacts above come from **`doc-generator/index.ts`** (a separate, standalone npm package in `doc-generator/`, with its own `package.json`/`package-lock.json`, built in its own Docker stage). It reads the exact installed `@stoplight/spectral-rulesets` version from `doc-generator/package-lock.json`, instantiates the real Spectral `oas`+`asyncapi` rulesets in-process to enumerate rules/severities/categories, and separately fetches `openapi-rules.md` / `asyncapi-rules.md` from the `stoplightio/spectral` GitHub repo at tag `%40stoplight/spectral-rulesets-<version>` to scrape human-readable rule descriptions. This means the generator needs **network access** and a matching upstream tag to exist.

### 2. Files that encode versions — check all of these on every update

| File | What it controls | What to check |
|---|---|---|
| `package.json` → `@stoplight/spectral-core`, `@stoplight/spectral-parsers`, `@stoplight/spectral-ruleset-migrator`, `@stoplight/spectral-rulesets`, `@stoplight/types` | The Spectral version actually run by the engine | Bump all `@stoplight/*` deps together to matching compatible versions; regenerate `package-lock.json` (`npm install`). |
| `doc-generator/package.json` → same `@stoplight/*` deps | The Spectral version used to *generate* docs — must match `package.json` | Bump in lockstep with the root `package.json`; regenerate `doc-generator/package-lock.json`. |
| `Dockerfile` → `NODE_IMAGE_VERSION` build arg | Node base image for all three build stages | Only bump if required/desired; confirm the tag exists on Docker Hub (`node:<version>-alpine<...>`). |
| `.circleci/config.yml` → `codacy/base`, `codacy/plugins-test`, `circleci/node` orbs | Shared CircleCI steps (checkout/version, Node test job, plugins-test run, docker publish, tag) | Check the latest published version of each orb before bumping. |

Other, non-version-pinned dependencies (`axios`, `eslint`, `typescript`, `mocha`, etc., in both `package.json` files) are bumped opportunistically via Dependabot-style commits (see git history: many prior commits are titled "Bump `<dep>` from `X` to `Y`") — same regeneration/verification steps apply.

### 3. Step-by-step update procedure

1. **Bump the version(s)** as scoped by the task, in `package.json` and `doc-generator/package.json` together if it's a Spectral bump.
2. **Reinstall dependencies** in both the root and `doc-generator/` (`npm install` in each) so `package-lock.json` / `doc-generator/package-lock.json` are regenerated and consistent.
3. **Regenerate the docs**: `cd doc-generator && npm install && npm run compile && node dist/index.js`. This overwrites `docs/patterns.json` and `docs/description/*`. Review the diff for new/removed/renamed patterns and stale fixture references under `docs/multiple-tests/*`.
4. **Compile** the main project: `npm run compile` (root `tsc`).
5. **Run the local test suite**: `npm test` (mocha, over `src/test/**/*.spec.ts`).
6. **Build the Docker image**: `npm run dockerBuild` (i.e. `docker build -t codacy-spectral .`).
7. **Run `codacy-plugins-test` locally** before pushing — clone https://github.com/codacy/codacy-plugins-test and run its Docker-based test commands (matching what CI's `codacy_plugins_test/run` orb job with `run_multiple_tests: true` does) against your local `codacy-spectral` image.
8. **Iterate on failures**, re-running only the relevant command after each fix.
9. **Commit** the version bump(s) together with the regenerated `package-lock.json` files and regenerated docs files in one change.
10. **Push and open a PR.**
11. **Poll the PR's real CI checks until they all pass — local validation is NOT the finish line.** After every push, run `gh pr checks <pr-url>` and keep re-polling (short sleep while any check is `pending`) until all checks finish. If a check fails, fetch its actual log (don't guess), find the true root cause, fix it, push again (never `--no-verify`, never force-push), and re-poll. Repeat until every check is green. **The CI environment's toolchain can differ from your local one**, so a clean local run does not guarantee CI passes. Only stop iterating when every check passes, or you hit a genuine product/infra decision that needs a human.

### 4. Common failure modes and fixes

- **`doc-generator` fails to fetch rule docs**: it depends on a specific tag (`%40stoplight/spectral-rulesets-<version>`) existing in the `stoplightio/spectral` GitHub repo. If the version bumped in `package.json`/`doc-generator/package.json` doesn't correspond to a real published `@stoplight/spectral-rulesets` release, the fetch will fail or produce stale descriptions — double check the exact version string against npm.
- **Root and `doc-generator` versions drift**: since the generator computes rules from the version pinned in its own `package-lock.json`, forgetting to bump `doc-generator/package.json` in lockstep with the root `package.json` produces `docs/patterns.json` that doesn't match what the shipped engine actually runs.
- **Stale `docs/multiple-tests/*` fixtures**: if a rule's default enabled/level state changes upstream, existing fixture expectations may need updating to match the regenerated `docs/patterns.json`.

### 5. Definition of done

- Version bump(s) reflected in both `package.json` and `doc-generator/package.json` (kept in lockstep), plus `Dockerfile`/`.circleci/config.yml` if those were in scope.
- `package-lock.json` and `doc-generator/package-lock.json` regenerated and committed.
- `docs/patterns.json` and `docs/description/*` regenerated and committed, with any fixture inconsistencies in `docs/multiple-tests/*` resolved.
- `npm run compile` and `npm test` pass locally in the root project.
- Docker image builds successfully (`npm run dockerBuild`).
- `codacy-plugins-test` passes locally against the freshly built image.
- **After pushing and opening/updating the PR, every CI check on it is green.** Poll `gh pr checks <pr-url>` and iterate on any failure until all pass.

## What is Codacy

[Codacy](https://www.codacy.com/) is an Automated Code Review Tool that monitors your technical debt, helps you improve your code quality, teaches best practices to your developers, and helps you save time in Code Reviews.

### Among Codacy’s features

- Identify new Static Analysis issues
- Commit and Pull Request Analysis with GitHub, BitBucket/Stash, GitLab (and also direct git repositories)
- Auto-comments on Commits and Pull Requests
- Integrations with Slack, HipChat, Jira, YouTrack
- Track issues in Code Style, Security, Error Proneness, Performance, Unused Code and other categories

Codacy also helps keep track of Code Coverage, Code Duplication, and Code Complexity.

Codacy supports PHP, Python, Ruby, Java, JavaScript, and Scala, among others.

### Free for Open Source

Codacy is free for Open Source projects.
