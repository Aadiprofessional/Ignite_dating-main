# Events Main APIs (cURL + Response)

Set these first:

```bash
BASE_URL="https://server2.matrixaiserver.com"
TOKEN="USER_JWT_TOKEN"
EVENT_ID="00000000-0000-0000-0000-000000000000"
JOIN_REQUEST_ID="00000000-0000-0000-0000-000000000000"
```

## Create Event (goes to admin approval first)

```bash
curl -s -X POST "$BASE_URL/api/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Ignite Networking Night",
    "description":"Meet and connect",
    "image_url":"https://cdn.example.com/events/e1.jpg",
    "location_name":"Blue Hall",
    "address":"Main Campus Road",
    "city":"Mumbai",
    "country":"India",
    "latitude":19.076,
    "longitude":72.8777,
    "starts_at":"2026-04-10T18:00:00.000Z",
    "ends_at":"2026-04-10T21:00:00.000Z",
    "capacity":80
  }'
```

```json
{
  "event": {
    "id":"uuid",
    "creator_id":"uuid",
    "title":"Ignite Networking Night",
    "status":"pending_approval",
    "capacity":80
  },
  "moderation":{"status":"pending_approval"}
}
```

## List Events (search + filters)

```bash
curl -s "$BASE_URL/api/events?search=ignite&city=Mumbai&from_date=2026-04-01T00:00:00.000Z&limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "events":[
    {
      "id":"uuid",
      "title":"Ignite Networking Night",
      "status":"approved",
      "approved_participants":12,
      "available_slots":68
    }
  ]
}
```

## List My Created Events

```bash
curl -s "$BASE_URL/api/events/my/created" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{"events":[{"id":"uuid","status":"pending_approval","capacity":80}]}
```

## Get Event Details

```bash
curl -s "$BASE_URL/api/events/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "event":{"id":"uuid","status":"approved","capacity":80,"approved_participants":12,"available_slots":68},
  "my_join_request":{"id":"uuid","status":"pending"}
}
```

## Request to Join Event

```bash
curl -s -X POST "$BASE_URL/api/events/$EVENT_ID/join" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Would love to attend this event"}'
```

```json
{
  "join_request":{
    "id":"uuid",
    "event_id":"uuid",
    "requester_id":"uuid",
    "status":"pending",
    "requester_message":"Would love to attend this event"
  }
}
```

## List My Join Requests

```bash
curl -s "$BASE_URL/api/events/my/join-requests" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "join_requests":[
    {
      "id":"uuid",
      "status":"pending",
      "events":{"id":"uuid","title":"Ignite Networking Night","starts_at":"2026-04-10T18:00:00.000Z"}
    }
  ]
}
```

## Creator: View Join Requests for an Event

```bash
curl -s "$BASE_URL/api/events/$EVENT_ID/join-requests" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "join_requests":[
    {
      "id":"uuid",
      "requester_id":"uuid",
      "status":"pending",
      "requester_profile":{"user_id":"uuid","username":"user123","full_name":"User Name"}
    }
  ]
}
```

## Creator: Approve/Reject Join Request

```bash
curl -s -X PATCH "$BASE_URL/api/events/$EVENT_ID/join-requests/$JOIN_REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","creator_note":"Welcome to the event"}'
```

```json
{"join_request":{"id":"uuid","status":"approved","creator_note":"Welcome to the event"}}
```
