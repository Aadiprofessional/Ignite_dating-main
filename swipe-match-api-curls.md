# Swipe + Match APIs (Body + Response)

Set these before running:

```bash
BASE_URL="http://localhost:49191"
TOKEN="USER_JWT_TOKEN"
TARGET_USER_ID="00000000-0000-0000-0000-000000000000"
SWIPER_USER_ID="00000000-0000-0000-0000-000000000000"
NOTIFICATION_ID="00000000-0000-0000-0000-000000000000"
```

## 1) Discover swipe feed by preferences (location, age, interested_in, university)

```bash
curl -s "$BASE_URL/api/discover?limit=20&university_mode=all&search=" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "profiles": [
    {
      "user_id": "uuid",
      "username": "mira_22",
      "full_name": "Mira Kapoor",
      "first_name": "Mira",
      "last_name": "Kapoor",
      "pronouns": "she/her",
      "bio": "Love coffee and books",
      "occupation": "Designer",
      "education": "B.Des",
      "birth_date": "2000-04-18",
      "gender": "Woman",
      "interested_in": ["Man"],
      "interests": ["Music", "Travel"],
      "relationship_goals": ["Serious"],
      "photo_urls": ["https://cdn.example.com/mira-1.jpg"],
      "height_cm": 165,
      "latitude": 19.076,
      "longitude": 72.8777,
      "city": "Mumbai",
      "country": "India",
      "university_id": "uuid",
      "university_name": "Mumbai University",
      "distance_km": 4.2,
      "liked_you": true,
      "liked_you_at": "2026-03-25T10:40:13.381Z",
      "unlocked_by_me": false
    }
  ]
}
```

## 2) Swipe user (like/superlike/reject)

```bash
curl -s -X POST "$BASE_URL/api/swipes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id":"'"$TARGET_USER_ID"'",
    "action":"like"
  }'
```

```json
{
  "result": {
    "ok": true,
    "action": "like",
    "target_id": "uuid",
    "is_match": false
  },
  "target_user": {
    "user_id": "uuid",
    "username": "target_user",
    "full_name": "Target User",
    "bio": "Hello",
    "photo_urls": ["https://cdn.example.com/p1.jpg"],
    "city": "Pune",
    "country": "India",
    "university_name": "Pune University"
  }
}
```

For swipe, action can be: `like`, `superlike`, `reject`, `unlock_profile`.

## 3) Unlock profile (deducts 100 coins, returns private verification details)

```bash
curl -s -X POST "$BASE_URL/api/swipes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id":"'"$TARGET_USER_ID"'",
    "action":"unlock_profile"
  }'
```

```json
{
  "result": {
    "ok": true,
    "action": "unlock_profile",
    "target_id": "uuid",
    "already_unlocked": false,
    "coins_charged": 100,
    "coin_transaction_id": "uuid",
    "wallet": {
      "user_id": "uuid",
      "available_coins": 900
    },
    "profile": {
      "user_id": "uuid",
      "username": "target_user",
      "full_name": "Target User",
      "photo_urls": ["https://cdn.example.com/p1.jpg"],
      "city": "Pune",
      "country": "India",
      "verification_status": "approved"
    },
    "verification": {
      "user_id": "uuid",
      "university_id": "uuid",
      "custom_university_name": null,
      "phone_number": "+919999999999",
      "passing_year": 2022,
      "nick_name": "target",
      "instagram_link": "https://instagram.com/target",
      "wechat_link": null,
      "xiaohongshu_link": null
    }
  },
  "target_user": {
    "user_id": "uuid",
    "username": "target_user",
    "full_name": "Target User"
  },
  "verification": {
    "instagram_link": "https://instagram.com/target"
  }
}
```

If already unlocked, response returns `"already_unlocked": true` and `"coins_charged": 0`.

## 4) Incoming likes list (users who liked me and waiting for my decision)

```bash
curl -s "$BASE_URL/api/swipes/incoming-likes?limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "incoming_likes": [
    {
      "swipe_id": "uuid",
      "swiper_id": "uuid",
      "action": "like",
      "liked_at": "2026-03-25T11:20:00.000Z",
      "user_id": "uuid",
      "username": "anaya",
      "full_name": "Anaya Singh",
      "bio": "Hiking + coding",
      "photo_urls": ["https://cdn.example.com/anaya-1.jpg"],
      "city": "Delhi",
      "country": "India",
      "university_name": "Delhi University",
      "distance_km": 6.1
    }
  ]
}
```

## 5) Accept or reject incoming like

```bash
curl -s -X POST "$BASE_URL/api/swipes/incoming-likes/$SWIPER_USER_ID/respond" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision":"accept"
  }'
```

```json
{
  "decision": "accept",
  "result": {
    "ok": true,
    "action": "like",
    "target_id": "uuid",
    "is_match": true
  },
  "incoming_like": {
    "id": "uuid",
    "swiper_id": "uuid",
    "target_id": "uuid",
    "action": "like",
    "created_at": "2026-03-25T11:20:00.000Z"
  },
  "user": {
    "user_id": "uuid",
    "username": "anaya",
    "full_name": "Anaya Singh",
    "photo_urls": ["https://cdn.example.com/anaya-1.jpg"],
    "university_name": "Delhi University"
  }
}
```

For reject use `"decision":"reject"`. In that case `result.action` becomes `"reject"` and `is_match` remains false.

## 6) Match list

```bash
curl -s "$BASE_URL/api/matches" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "matches": [
    {
      "id": "uuid",
      "user_a": "uuid",
      "user_b": "uuid",
      "created_at": "2026-03-25T11:21:10.000Z",
      "other_user_id": "uuid",
      "can_chat": true,
      "other_user": {
        "user_id": "uuid",
        "username": "anaya",
        "full_name": "Anaya Singh",
        "bio": "Hiking + coding",
        "photo_urls": ["https://cdn.example.com/anaya-1.jpg"],
        "city": "Delhi",
        "country": "India",
        "university_name": "Delhi University"
      }
    }
  ]
}
```

## 7) Notifications + mark read

```bash
curl -s "$BASE_URL/api/notifications?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "notifications": [
    {
      "id": "uuid",
      "recipient_id": "uuid",
      "actor_id": "uuid",
      "type": "like",
      "entity_id": null,
      "payload": {"from_user_id":"uuid"},
      "is_read": false,
      "created_at": "2026-03-25T11:20:00.000Z"
    },
    {
      "id": "uuid",
      "recipient_id": "uuid",
      "actor_id": "uuid",
      "type": "match",
      "entity_id": "uuid",
      "payload": {"match_id":"uuid"},
      "is_read": false,
      "created_at": "2026-03-25T11:21:10.000Z"
    }
  ]
}
```

```bash
curl -s -X PATCH "$BASE_URL/api/notifications/$NOTIFICATION_ID/read" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "notification": {
    "id": "uuid",
    "is_read": true
  }
}
```
