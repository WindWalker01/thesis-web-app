# QR Certificate Verification Hardening

## Problem

The current QR flow encodes a URL with only the certificate UUID path:

- `/certificate/verify/{id}`

Because this value is static and not signed, a valid QR image can be copied to a fake certificate and still return a valid verification response.

## Current Implementation Status (This Repository)

### Already Implemented

1. Backend verification endpoint exists (`app/api/certificate/verify/[id]/route.ts`).
2. UUID input validation exists (`z.string().uuid()` in verify service).
3. Live database lookup is performed in `registered_arts`.
4. Basic status logic exists (`active` + non-empty `tx_hash` => valid).
5. Verification UI displays trust indicators (status, chain, tx, issued date).

### Partially Implemented

1. Claim binding in public view is limited:
   - It shows status and blockchain details.
   - It does not strongly expose immutable identity/fingerprint claims that make QR cloning obvious at first glance.
2. Lifecycle handling is basic:
   - Non-active is treated as not valid/pending.
   - Explicit revocation/reissue semantics are not yet modeled in the verification contract.

### Not Yet Implemented (Security Gaps)

1. Signed QR payload (signature/HMAC/JWT-style integrity proof).
2. Expiry/nonce replay controls embedded in QR verification protocol.
3. Dynamic verification challenge (short-lived session proof after scan).
4. Explicit revocation + reissue workflow with linked history.
5. Duplicate scan risk telemetry and anomaly signals.

## What Is Needed (Implementation Checklist)

## 1) Cryptographic QR Integrity (Must Have)

Replace plain UUID-only QR with a signed token payload.

Suggested payload:

- `cert_id`
- `issued_at`
- `expires_at` (optional but recommended)
- `nonce` (unique issuance value)
- `version`
- `sig` (server-generated signature)

Verification requirements:

1. Parse payload safely.
2. Verify signature with server-held key.
3. Reject altered/expired payload.
4. Reject unsupported token version.

## 2) Strong Server Trust Decision (Must Have)

Final validity must come from backend state, not QR content alone.

Required checks:

1. Certificate exists.
2. Certificate status is currently verifiable (`active` only).
3. Certificate not revoked/replaced/expired.
4. Ownership and registration records are internally consistent.
5. Optional: confirm chain anchor/tx hash still maps to expected record.

## 3) Strong Claim Binding on Verification Result (Must Have)

Public verification page should include immutable, server-trusted claims:

1. Certificate ID.
2. Artwork fingerprint/hash.
3. Issuer.
4. Issue timestamp.
5. Current lifecycle status.

This makes copied QR placement on a different document easy to detect visually.

## 4) Revocation and Reissue Lifecycle (High Value)

Add explicit certificate lifecycle model:

1. `active`
2. `revoked`
3. `reissued` (old certificate superseded by new certificate)
4. `expired` (if expiry policy is adopted)

Verification page must clearly show non-active reasons and replacement linkage.

## 5) Dynamic Challenge (High Value)

After QR scan, backend issues a short-lived verification challenge/token and renders final trusted state only after challenge validation.

Benefit:

- Reduces replay confidence from static screenshots or stale copied outputs.

## 6) Risk Monitoring (Recommended)

Capture lightweight scan telemetry for abuse detection:

1. timestamp
2. cert_id
3. IP/UA fingerprint (privacy-safe hashed form if needed)
4. outcome (valid/invalid/revoked/etc.)

Use for anomaly flags (e.g., unusually high geographic/device diversity in a short window).

## Suggested Rollout Plan

### Phase 1 (Immediate, Highest Impact)

1. Signed QR payload.
2. Backend verification hard-fail on signature/state mismatch.
3. Public claim binding (certificate id + artwork hash + issuer + issue time + status).

### Phase 2

1. Revocation/reissue status model and UI.
2. Scan telemetry and anomaly signals.

### Phase 3

1. Dynamic challenge token.
2. Optional blockchain anchoring enhancements.

## Minimum Baseline for Trustworthiness

The system should not claim strong anti-clone trust until all three are present:

1. Signed QR payload integrity.
2. Live backend state validation.
3. Public claim binding that exposes immutable server-trusted details.
