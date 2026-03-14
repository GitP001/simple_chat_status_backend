# simple_chat_status_backend

Backend for the simpleChat status plugin. Stores and serves user availability statuses.

## Setup

```bash
npm install
cp .env .env.local   # edit MONGO_URI if needed
npm run dev
```

Requires MongoDB running locally (default: `mongodb://localhost:27017/simple_chat_status`).

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/status/:userId` | Set/update status. Body: `{ value, label?, color? }` |
| `GET` | `/status/:userId` | Get a user's current status |
| `DELETE` | `/status/:userId` | Clear a user's status |
| `GET` | `/statuses` | Get all users' statuses |

## Example

```bash
# Set status
curl -X PUT http://localhost:3001/status/user123 \
  -H "Content-Type: application/json" \
  -d '{"value":"studying","label":"📚 Studying","color":"#2196F3"}'

# Get status
curl http://localhost:3001/status/user123

# Get all statuses
curl http://localhost:3001/statuses

# Clear status
curl -X DELETE http://localhost:3001/status/user123
```
