const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
const db = new Database(path.join(process.cwd(), "data", "caramelo.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS products (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 description TEXT NOT NULL,
 price_robux INTEGER NOT NULL,
 gamepass_url TEXT NOT NULL,
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY,
 product_id INTEGER NOT NULL,
 product_name TEXT NOT NULL,
 price_robux INTEGER NOT NULL,
 gamepass_url TEXT NOT NULL,
 buyer_id TEXT NOT NULL,
 roblox_username TEXT,
 proof_url TEXT,
 status TEXT NOT NULL DEFAULT 'awaiting_proof',
 delivered INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 approved_at TEXT,
 delivered_at TEXT
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);
module.exports = db;
