# Main Website APIs (cURL + Response)

Set these before running:

```bash
BASE_URL="https://server2.matrixaiserver.com"
TOKEN="USER_JWT_TOKEN"
TARGET_USER_ID="00000000-0000-0000-0000-000000000000"
NOTIFICATION_ID="00000000-0000-0000-0000-000000000000"
UNIVERSITY_ID="00000000-0000-0000-0000-000000000000"
```

## Health

```bash
curl -s "$BASE_URL/health"
```

```json
{"ok":true}
```

## Auth

```bash
curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"12345678",
    "username":"user123"
  }'
```

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": null,
  "message": "Signup successful. Complete email verification, then login."
}
```

```bash
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"12345678"
  }'
```

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt",
    "refresh_token": "token"
  },
  "account_state": {
    "onboarding_completed": false,
    "onboarding_step": 0,
    "verification_status": "pending_submission",
    "can_use_app": false
  }
}

{"matches":[]}
```

```bash
curl -s "$BASE_URL/api/notifications?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{"notifications":[]}
```

```bash
curl -s -X PATCH "$BASE_URL/api/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{"notification":{"id":"uuid","is_read":true}}
```

```bash
curl -s -X POST "$BASE_URL/api/blocks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"blocked_id":"'"$TARGET_USER_ID"'"}'
```

```json
{"block":{"id":"uuid","blocker_id":"uuid","blocked_id":"uuid"}}
```

```bash
curl -s -X POST "$BASE_URL/api/reports" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reported_id":"'"$TARGET_USER_ID"'","reason":"Abusive behavior","details":"Details here"}'
```

```json
{"report":{"created":true}}
```
