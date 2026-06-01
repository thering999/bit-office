/**
 * Database abstraction
 * - Local/server mode: uses better-sqlite3 (real persistence)
 * - Static/GitHub Pages mode: uses in-memory mock (no native deps)
 */

// Detect static export environment (no Node.js native modules)
const isStaticMode =
  typeof process !== "undefined" &&
  (process.env.GITHUB_ACTIONS === "true" ||
    process.env.NEXT_PUBLIC_CLOUD_MODE === "true");

// ---- In-memory mock for static/cloud mode ----
class MockDatabase {
  private tables: Record<string, any[]> = {
    users: [{ id: 1, username: "admin", password: "admin", created_at: new Date().toISOString() }],
    api_sources: [],
    dashboard_cards: [],
  };

  exec(_sql: string) { /* no-op in mock */ }

  prepare(sql: string) {
    const self = this;
    return {
      get(...params: any[]) {
        if (sql.includes("users") && sql.includes("username = ?")) {
          return self.tables.users.find((u) => u.username === params[0]) ?? null;
        }
        if (sql.includes("api_sources") && sql.includes("name = ?")) {
          return self.tables.api_sources.find((s: any) => s.name === params[0]) ?? null;
        }
        if (sql.includes("dashboard_cards") && sql.includes("title = ?")) {
          return self.tables.dashboard_cards.find((c: any) => c.title === params[0]) ?? null;
        }
        if (sql.includes("SELECT id FROM api_sources")) {
          return self.tables.api_sources.find((s: any) => s.name === params[0]) ?? null;
        }
        return null;
      },
      all(...params: any[]) {
        if (sql.includes("dashboard_cards")) return self.tables.dashboard_cards;
        if (sql.includes("api_sources")) return self.tables.api_sources;
        if (sql.includes("users")) return self.tables.users;
        return [];
      },
      run(...params: any[]) {
        // Basic INSERT simulation
        if (sql.includes("INSERT INTO users")) {
          const id = self.tables.users.length + 1;
          self.tables.users.push({ id, username: params[0], password: params[1], created_at: new Date().toISOString() });
        } else if (sql.includes("INSERT INTO api_sources")) {
          const id = self.tables.api_sources.length + 1;
          self.tables.api_sources.push({ id, name: params[0], url: params[1], method: params[2] || "GET" });
        } else if (sql.includes("INSERT INTO dashboard_cards")) {
          const id = self.tables.dashboard_cards.length + 1;
          self.tables.dashboard_cards.push({ id, title: params[0], source_id: params[1], type: params[2], position: params[3] });
        }
        return { lastInsertRowid: 0, changes: 1 };
      },
    };
  }
}

let db: any;

if (isStaticMode) {
  // Static/GitHub Pages — use in-memory mock (no native deps)
  db = new MockDatabase();
} else {
  // Local/server mode — use real SQLite
  // Dynamic import to prevent bundler from analyzing this path in static mode
  const Database = require("better-sqlite3");
  const path = require("path");
  const dbPath = path.join(process.cwd(), "office.db");
  db = new Database(dbPath);

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      url TEXT,
      api_key TEXT,
      method TEXT DEFAULT 'GET',
      headers TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dashboard_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      source_id INTEGER,
      type TEXT,
      config TEXT,
      position INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_id) REFERENCES api_sources(id)
    );
  `);

  // Seed admin user
  const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
  if (!adminExists) {
    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", "admin");
  }

  // Seed HDC Source
  const hdcExists = db.prepare("SELECT * FROM api_sources WHERE name = ?").get("HDC Open Data");
  if (!hdcExists) {
    db.prepare("INSERT INTO api_sources (name, url, method) VALUES (?, ?, ?)").run("HDC Open Data", "/api/mock/hdc", "GET");
  }

  // Seed HDC Cards
  const hdcSource = db.prepare("SELECT id FROM api_sources WHERE name = ?").get("HDC Open Data") as any;
  if (hdcSource) {
    const cardExists = db.prepare("SELECT * FROM dashboard_cards WHERE title = ?").get("HDC Health Status");
    if (!cardExists) {
      db.prepare("INSERT INTO dashboard_cards (title, source_id, type, position) VALUES (?, ?, ?, ?)").run("HDC Health Status", hdcSource.id, "metric", 1);
      db.prepare("INSERT INTO dashboard_cards (title, source_id, type, position) VALUES (?, ?, ?, ?)").run("Health Trends", hdcSource.id, "graph", 2);
    }
  }
}

export default db;
