## Context

Stage 2 introduced `LocalStorageAdapter` behind the core `StoragePort`, and the panel
depends on the port. Stage 3 adds Google-account roaming for the full model.
`chrome.storage.sync` roams to the signed-in Chrome profile automatically but caps at
~8 KB/item, ~100 KB total, 512 items — a full résumé (work bullets) easily exceeds
8 KB/item as a single value. Constraint (`AGENTS.md`): storage adapters live at the edge;
`src/core` stays browser-free.

## Goals / Non-Goals

**Goals:**
- Roam the entire `ApplicantData` (contact, links, skills, extra, work, education) across
  devices via the Google account.
- Keep a local mirror for offline/fallback reads and to guarantee no data loss on quota.
- Transparent swap behind `StoragePort`; predictable load; quota-safe.

**Non-Goals:**
- Live cross-device refresh (`storage.onChanged`); OAuth; timestamp/CRDT conflict
  resolution; unbounded data beyond sync's ~100 KB total quota.

## Decisions

**Chunk the full model across sync items.** Serialize `ApplicantData` to JSON and split
into fixed-size character chunks (`CHUNK_SIZE` well under 8 KB) written as
`applicant_0..N` with an `applicant_meta` `{ count }`. Load reads the count, fetches the
chunks, concatenates, and parses. This handles arbitrarily shaped résumés up to sync's
total quota without imposing a per-field size assumption. Alternative (one item per
top-level field) still risks a single large `work` array blowing 8 KB — rejected as less
robust.

**Sync authoritative, local mirror.** `save()` writes the local mirror first (so data is
never lost if sync fails), then the sync chunks. `load()` prefers sync (reassembled) and
falls back to local when sync is empty (offline, or a fresh install before first sync
propagates). Simpler and more predictable than a field-ownership merge now that
everything roams. The earlier subset/ownership approach is replaced.

**Stale-tail cleanup.** A later, smaller save leaves fewer chunks than a previous larger
one. Before writing, read the old count and `remove()` the now-unused
`applicant_<newCount..oldCount-1>` keys, so reassembly never picks up stale tail data.

**Quota-safe save.** A sync write can reject (`QUOTA_BYTES`/`QUOTA_BYTES_PER_ITEM`).
The local mirror already succeeded, so `save()` returns normally and calls `onWarning`
(kept off the `StoragePort` signature) so the panel can show a non-fatal notice.

## Risks / Trade-offs

- [Data exceeds sync's ~100 KB total] → Quota fallback keeps the full local mirror and
  warns; the device still works, it just doesn't roam that save. Future: prune/compress.
- [Partial/corrupt chunk state] → Load parses defensively; on JSON failure it falls back
  to the local mirror rather than surfacing a broken object.
- [Chunk size vs multibyte chars] → `CHUNK_SIZE` is chosen conservatively (chars, not
  bytes); worst-case multibyte inflation is caught by the quota fallback.

## Open Questions

- Whether to compress (e.g. LZ) the JSON before chunking to raise the effective ceiling —
  revisit only if real résumés approach the quota.
