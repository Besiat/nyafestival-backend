# Dependency Update Analysis

Date: 2026-06-07
Branch: `chore/check-backend-dependency-updates`
Runtime assumption: Node 22

## Summary

The project should keep the current safe-range dependency updates and defer most major upgrades until there is better automated coverage. `yarn build` passes, but `yarn test --runInBand` currently fails because there are no `*.spec.ts` tests under `src`, and ESLint now runs but exposes existing lint issues. That means major framework/runtime upgrades would be validated mostly by manual smoke testing unless tests are added first.

Recommended next steps:

1. Keep Nest 10, TypeORM 0.3, Jest 29, TypeScript 5.9, ESLint 9, bcryptjs 2, and nodemailer 6 for now.
2. Add basic unit/e2e coverage for auth, application submission, file upload, voting, and TypeORM migrations before large major upgrades.
3. Treat Nest 11 as the first worthwhile major migration later, because it is the main framework and has a clear Node 22 path.
4. Do not prioritize nodemailer 8 unless the project starts using `@nestjs-modules/mailer`; current email sending uses Brevo through Axios, not nodemailer.

## Current State

- Backend framework: NestJS 10.4.x.
- Database layer: TypeORM 0.3.30 with Postgres through `pg`.
- Email path: `EmailService` sends directly to Brevo API through Axios.
- Password hashing: `bcryptjs` is used directly in `AuthService`.
- Test setup: Jest config exists in `package.json`, but no matching tests are present.
- Lint setup: migrated to ESLint flat config for ESLint 9; linting reports existing code issues.
- Local Node: `v22.19.0`, which satisfies the engine requirements for the listed major versions.

## Package Decisions

### Nest 11

Recommendation: defer, but it is the most reasonable future major upgrade.

Why:

- Nest is central to controllers, modules, guards, DI, throttling, Swagger, and TypeORM integration.
- Nest 11 requires Node >=20; Node 22 satisfies this.
- The project must upgrade Nest packages together: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/testing`, `@nestjs/cli`, `@nestjs/schematics`, `@nestjs/swagger`, `@nestjs/jwt`, `@nestjs/passport`, and likely `@nestjs/typeorm`.

Implications:

- Review `@nestjs/swagger` 8 to 11 migration impact because Swagger decorators are used across DTOs, entities, and controllers.
- Validate `@nestjs/throttler` global guard behavior after upgrade.
- Validate file upload paths and `MulterModule` registration.
- Run full smoke tests for auth, registration, admin CRUD, voting, schedule, quest, tickets, and uploads.

Verdict: worth doing after adding minimum tests.

### Jest 30

Recommendation: defer until tests exist, then upgrade as a tooling follow-up.

Why:

- There are currently no `*.spec.ts` tests under `src`, so Jest 30 provides no immediate project value.
- `ts-jest@29.4.11` supports Jest 30 and TypeScript `<7`, so the upgrade is technically feasible.

Implications:

- Upgrade `jest`, `@types/jest`, and keep/verify `ts-jest`.
- Confirm test discovery still matches the intended layout or move Jest config out of `package.json` if needed.

Verdict: low priority until there are tests to run.

### TypeScript 6

Recommendation: defer.

Why:

- The project already builds on TypeScript 5.9.3.
- TypeScript 6 is a compiler-level risk across decorators, Nest metadata emit, TypeORM entities, and implicit `any` patterns.
- `ts-jest@29.4.11` declares TypeScript `>=4.3 <7`, so it is likely installable, but compiler behavior changes may expose many code issues.

Implications:

- Re-run `yarn build`, migration commands, and Jest after the bump.
- Expect stricter or changed type diagnostics around decorators, entity imports, Express/Multer types, and implicit `any`.

Verdict: not worth prioritizing until Nest 11 and tests are stable.

### ESLint 10

Recommendation: do not upgrade now.

Why:

- ESLint 9 already required a flat config migration, which is done.
- ESLint 10 requires Node `^20.19.0 || ^22.13.0 || >=24`; Node 22 satisfies this, but the project still has unresolved ESLint 9 findings.
- Upgrading before fixing current lint issues would add churn without making code quality better.

Implications:

- Fix existing lint findings first: unused imports, missing semicolons, `any`, `require()` imports, unawaited promises, and Express globals.
- After lint is clean under ESLint 9, ESLint 10 should be a smaller tooling-only migration.

Verdict: defer until ESLint 9 is clean.

### TypeORM 1

Recommendation: do not upgrade now.

Why:

- TypeORM is central to entities, repositories, migrations, and CLI scripts.
- TypeORM 1 requires Node `^20.19.0 || ^22.13.0 || >=24.11.0`; Node 22 satisfies this.
- `@nestjs/typeorm@11.0.1` allows `typeorm ^0.3.0 || ^1.0.0-dev`, but TypeORM 1 is still a high-risk ORM migration for this codebase.

Implications:

- Validate all migrations and database connection config.
- Validate repository methods, relation loading, query builders, decorators, and CLI scripts.
- Require a real database smoke test, not just `yarn build`.

Verdict: postpone until after Nest 11 and database smoke tests are in place.

### bcryptjs 3

Recommendation: optional low-value upgrade; defer unless removing `@types/bcryptjs`.

Why:

- The project only uses `hash` and `compare`.
- `bcryptjs@3.0.3` ships its own types, so `@types/bcryptjs` should likely be removed if upgrading.
- Password hash compatibility must be verified against existing stored hashes.

Implications:

- Upgrade `bcryptjs`, remove `@types/bcryptjs`, run auth registration/login smoke tests.
- Confirm old hashes still compare successfully.

Verdict: feasible, but not urgent.

### nodemailer 8

Recommendation: do not upgrade unless the mailer module is actually introduced into the email path.

Why:

- Current `EmailService` sends mail through Brevo API using Axios.
- `nodemailer` and `@nestjs-modules/mailer` are effectively unused by current source code.
- `@nestjs-modules/mailer@2.3.5+` requires `nodemailer >=8.0.5`; the current safe pin at `2.3.4` avoids that peer mismatch.

Implications:

- If the project keeps Brevo API direct calls, consider removing unused `nodemailer`, `@types/nodemailer`, and `@nestjs-modules/mailer` in a separate cleanup.
- If the project switches to SMTP/Nest mailer, upgrade `nodemailer` and `@nestjs-modules/mailer` together and add email integration testing.

Verdict: no upgrade now; either remove as unused or migrate intentionally later.

## Suggested Roadmap

1. Stabilize current branch:
   - Keep safe-range dependency updates.
   - Keep `@nestjs-modules/mailer@2.3.4` with `nodemailer@6.10.1`.
   - Decide whether to fix current ESLint findings before merging.

2. Add validation coverage:
   - Add a small Jest suite for auth hashing/login, application creation/update, and voting.
   - Add at least one e2e or smoke test that boots the Nest app.
   - Add database-backed migration/run smoke testing for TypeORM changes.

3. Future major batches:
   - Batch 1: Nest 11 package family plus Swagger and Nest integrations.
   - Batch 2: Jest 30 after tests exist.
   - Batch 3: bcryptjs 3 if auth smoke tests are in place.
   - Batch 4: ESLint 10 after ESLint 9 is clean.
   - Batch 5: TypeScript 6 after Nest/Jest are stable.
   - Batch 6: TypeORM 1 only with database smoke tests and rollback plan.
   - Batch 7: nodemailer 8 only if SMTP/Nest mailer becomes part of the app.

## Acceptance Criteria For Any Major Upgrade

- `yarn install --frozen-lockfile` passes.
- `yarn build` passes.
- Jest test suite passes with at least auth and core app smoke coverage.
- ESLint either passes or has explicitly documented pre-existing findings.
- TypeORM migration commands are verified against a disposable Postgres database.
- Manual smoke testing covers registration, login, confirmation email request, application CRUD, file upload, voting, schedule, tickets, and quests.
