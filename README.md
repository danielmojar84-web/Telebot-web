# Telegram Autobots (full)

How to run:
1. Set `config.json` values: ownerId (server owner), anything.* credentials (optional). If anything.db_url is empty, project uses local ./data/bots.json file.
2. `npm install`
3. Start: `node index.js`
4. Open browser to `http://localhost:3000/` to add bots or use /bot commands from a Telegram bot that is running (you still need to run a primary bot instance with a token to accept /bot/create etc).

Notes:
- The web UI POSTs to the local server. Make sure server is reachable from browser.
- AnythingClient expects REST endpoints at config.anything.db_url for /bots CRUD. If you use CreateAnything, adapt the db_url to its function endpoint.
