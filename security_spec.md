# TEKSCOdle Firestore Security Specification

## 1. Data Invariants
1. **Strict Ownership on Private Profiles (`/users/{userId}`)**: A user profile document can only be read, created, or updated by the verified authenticated user whose `request.auth.uid == userId`. No `list` queries are allowed on `/users`.
2. **Identity Integrity on Leaderboard (`/leaderboard/{userId}`)**: A player can only create or update their own leaderboard document (`userId == request.auth.uid` and `incoming().uid == request.auth.uid`). Score values are strictly bounded (`0 <= totalScore <= 3750`, `0 <= roundXScore <= 1250`, `totalScore == round1Score + round2Score + round3Score`).
3. **Immutable Daily Submissions (`/dailyLeaderboard/{entryId}`)**: Daily leaderboard entries are keyed deterministically as `YYYY-MM-DD_uid` (`entryId == incoming().dailyDate + '_' + request.auth.uid`), can only be created once per player per day, and can NEVER be updated or deleted after creation.
4. **No PII in Public Collections**: Neither `/leaderboard` nor `/dailyLeaderboard` stores `email`, `phone`, or `address`. Strict `hasOnly(...)` key allowlists reject any shadow or PII fields.
5. **Temporal Integrity**: All `createdAt` and `updatedAt` fields must strictly equal `request.time`. On updates, `createdAt` and `uid` are immutable.
6. **Bounded Public Queries**: `allow list` rules on `/leaderboard` and `/dailyLeaderboard` strictly validate `resource.data` fields (`totalScore` range / `dailyDate` range) and cap `request.query.limit <= 50`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Identity Spoofing (Profile)**: User A attempts to create `/users/userB` with `uid: "userB"`. -> MUST BE `PERMISSION_DENIED`.
2. **Identity Spoofing (Leaderboard)**: User A creates `/leaderboard/userA` with `uid: "userB"`. -> MUST BE `PERMISSION_DENIED`.
3. **Score Inflation Attack**: User A submits `totalScore: 999999` on `/leaderboard/userA`. -> MUST BE `PERMISSION_DENIED`.
4. **Round Sum Mismatch**: User A submits `round1Score: 500, round2Score: 500, round3Score: 500, totalScore: 3000`. -> MUST BE `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: User A adds `isAdmin: true` or `email: "leak@example.com"` to `/leaderboard/userA`. -> MUST BE `PERMISSION_DENIED`.
6. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to write to `/leaderboard/{uid}`. -> MUST BE `PERMISSION_DENIED`.
7. **Timestamp Forgery**: User A writes a backdated client timestamp for `createdAt` instead of `serverTimestamp()`. -> MUST BE `PERMISSION_DENIED`.
8. **Immutable Field Tampering**: User A attempts to change `createdAt` or `uid` during an update to `/users/{uid}`. -> MUST BE `PERMISSION_DENIED`.
9. **Daily Leaderboard Overwrite**: User A attempts to `update` or `delete` their already-submitted `/dailyLeaderboard/2026-11-19_userA`. -> MUST BE `PERMISSION_DENIED`.
10. **Daily ID Forgery**: User A attempts to create `/dailyLeaderboard/2026-11-19_fakeSlot` where `entryId != dailyDate + '_' + uid`. -> MUST BE `PERMISSION_DENIED`.
11. **Resource Poisoning (Oversized String / Bad ID)**: User A submits a 2KB `displayName` or invalid characters in `userId` path. -> MUST BE `PERMISSION_DENIED`.
12. **Unbounded Scraping / Cross-User Profile Read**: User A attempts to `list` `/users`, `get` `/users/userB`, or `list` `/leaderboard` with `limit(500)`. -> MUST BE `PERMISSION_DENIED`.
