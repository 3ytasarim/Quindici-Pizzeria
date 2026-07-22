---
name: Object Storage auth failure in dev
description: Why and how file/JSON storage is split between GCS, PostgreSQL, and local filesystem.
---

## Rule
Use a hybrid approach in `artifacts/api-server/src/lib/gcs.ts`:

### File uploads (uploadFile / streamFile / deleteFile)
- **Upload:** Try GCS first (`@replit/object-storage` Client with explicit `bucketId`). If GCS returns an error (dev env 403), fall back to local filesystem at `{cwd}/uploads/`.
- **Serve:** Try local filesystem first, then GCS fallback. This covers dev-only uploads AND pre-migration GCS files.
- **URL format stays identical** (`/api/files/folder/uuid.ext`) regardless of storage backend.

### JSON data (readJSON / writeJSON)
- **Write:** PostgreSQL `kv_store` table (works everywhere, no GCS needed).
- **Read:** kv_store first; if missing, fall back to GCS `quindici/data/{key}.json`. On successful GCS read, promote to kv_store so future reads skip GCS.

**Why:** The Replit sidecar at `http://127.0.0.1:1106` returns a dummy JWT in dev. GCS exchanges it for `heimdall-production@replit-user-deployments.iam.gserviceaccount.com` which has NO access in dev (403), but DOES have access in the deployed production environment. GCS uploads are preferred in production because the deployed container's local filesystem is wiped on each redeploy.

**How to apply:** The `@replit/object-storage` Client must receive an explicit `bucketId` from `process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID`; the sidecar's `/object-storage/default-bucket` endpoint returns `{"bucketId":""}` in dev. All GCS calls must be wrapped in try/catch since they throw or return `{ ok: false }` in dev.
