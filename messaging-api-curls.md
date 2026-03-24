# Messaging + Calls APIs and Socket Events

Set these before running:

```bash
BASE_URL="http://localhost:49191"
TOKEN="USER_JWT_TOKEN"
MATCH_ID="00000000-0000-0000-0000-000000000000"
MESSAGE_ID="00000000-0000-0000-0000-000000000000"
```

## 1) Chat list (all users you can chat with)

```bash
curl -s "$BASE_URL/api/chats?limit=30&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "chats": [
    {
      "match_id": "uuid",
      "conversation_id": "uuid",
      "other_user_id": "uuid",
      "other_username": "alex",
      "other_full_name": "Alex Kumar",
      "other_photo_urls": ["https://cdn.example.com/a1.jpg"],
      "last_message_id": "uuid",
      "last_message_sender_id": "uuid",
      "last_message_type": "TEXT",
      "last_message_content": "Hey",
      "last_message_media_url": null,
      "last_message_created_at": "2026-03-25T12:00:00.000Z",
      "unread_count": 2
    }
  ]
}
```

## 2) Send message (TEXT / IMAGE / GIF / VIDEO)

```bash
curl -s -X POST "$BASE_URL/api/matches/$MATCH_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"TEXT",
    "content":"Hey 👋"
  }'
```

For IMAGE/GIF/VIDEO:

```json
{
  "type": "IMAGE",
  "media_url": "https://cdn.example.com/media.jpg",
  "metadata": {
    "width": 1080,
    "height": 1350
  },
  "reply_to_message_id": "uuid"
}
```

## 3) Cursor pagination (30/page, newest first)

```bash
curl -s "$BASE_URL/api/matches/$MATCH_ID/messages?limit=30" \
  -H "Authorization: Bearer $TOKEN"
```

If response contains `next_cursor`, fetch older messages:

```bash
curl -s "$BASE_URL/api/matches/$MATCH_ID/messages?limit=30&cursor=NEXT_CURSOR" \
  -H "Authorization: Bearer $TOKEN"
```

## 4) Toggle reaction

```bash
curl -s -X POST "$BASE_URL/api/messages/$MESSAGE_ID/react" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emoji":"🔥"
  }'
```

## 5) Delete message

Delete for me:

```bash
curl -s -X DELETE "$BASE_URL/api/messages/$MESSAGE_ID?scope=me" \
  -H "Authorization: Bearer $TOKEN"
```

Delete for everyone (sender only):

```bash
curl -s -X DELETE "$BASE_URL/api/messages/$MESSAGE_ID?scope=everyone" \
  -H "Authorization: Bearer $TOKEN"
```

## 6) Mark read

```bash
curl -s -X POST "$BASE_URL/api/matches/$MATCH_ID/read" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lastReadMessageId":"'"$MESSAGE_ID"'"
  }'
```

## 7) Unread count

```bash
curl -s "$BASE_URL/api/matches/$MATCH_ID/unread-count" \
  -H "Authorization: Bearer $TOKEN"
```

## Socket Connection

Client connect:

```js
const socket = io("http://localhost:49191", {
  path: "/chat",
  auth: { token: "USER_JWT_TOKEN" }
});
```

Client -> Server events:

- `typing_start` payload: `{ match_id }`
- `typing_stop` payload: `{ match_id }`
- `message_read` payload: `{ match_id, last_read_message_id }`
- `call_invite` payload: `{ match_id, offer, metadata, quality_profile }`
- `call_accept` payload: `{ call_id, answer }`
- `call_reject` payload: `{ call_id, reason }`
- `call_end` payload: `{ call_id }`
- `webrtc_offer` payload: `{ match_id, target_user_id, sdp }`
- `webrtc_answer` payload: `{ match_id, target_user_id, sdp }`
- `webrtc_ice_candidate` payload: `{ match_id, target_user_id, candidate }`

Server -> Client events:

- `new_message`
- `message_reaction`
- `message_deleted`
- `message_read`
- `message_delivered`
- `typing`
- `user_online`
- `user_offline`
- `incoming_call`
- `call_ringing`
- `call_accepted`
- `call_rejected`
- `call_ended`
- `call_state`
- `webrtc_offer`
- `webrtc_answer`
- `webrtc_ice_candidate`
