---
name: Object Storage auth failure in dev
description: Why Object Storage was replaced with PostgreSQL + local filesystem for JSON/file persistence.
---

## Rule
Do NOT use `@google-cloud/storage` or `@replit/object-storage` for application data persistence in this project. Use PostgreSQL (`kv_store` table) for JSON documents and local filesystem (`artifacts/api-server/uploads/`) for binary files.

**Why:** The Replit sidecar at `http://127.0.0.1:1106` returns a dummy JWT in the development workspace. When `@google-cloud/storage` exchanges this via Google STS, it resolves to `heimdall-production@replit-user-deployments.iam.gserviceaccount.com`, which does not have write access to the Object Storage bucket in development. Reads also silently fail (return empty).

**How to apply:** Any route that previously called `readJSON`/`writeJSON` from `lib/gcs.ts` continues to work unchanged — the functions now use Drizzle ORM against the `kv_store` table. File uploads go to `UPLOADS_DIR` (`{cwd}/uploads/`) and are served via `/api/files/:folder/:filename`.

`setupObjectStorage()` reports `alreadySetUp: true` but this only reflects the env var, not actual sidecar/bucket connectivity.
