/**
 * ExpenseLens — Automated Database Migration Runner
 *
 * Menjalankan semua file SQL di folder migrations/ secara berurutan
 * menggunakan koneksi langsung ke PostgreSQL (Supabase).
 *
 * Usage:
 *   node scripts/migrate.js            → jalankan semua migrasi
 *   node scripts/migrate.js --dry-run  → tampilkan daftar file tanpa eksekusi
 *   node scripts/migrate.js --reset    → reset database (999_reset_database.sql)
 *
 * Env required (in .env.local):
 *   DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// ─── Load .env.local automatically ─────────────────────────────
// Next.js reads .env.local at runtime, but plain Node.js scripts do not.
// This parser covers the standard KEY=VALUE format used in this project.
(function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
})();

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isReset = args.includes("--reset");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

// ─── Helpers ────────────────────────────────────────────────────

function log(level, msg) {
  const prefix =
    {
      info: "\x1b[36m[INFO] \x1b[0m",
      ok: "\x1b[32m[ OK ] \x1b[0m",
      warn: "\x1b[33m[WARN] \x1b[0m",
      error: "\x1b[31m[ERR ] \x1b[0m",
    }[level] || "";
  console.log(`${prefix}${msg}`);
}

function getMigrationFiles() {
  const all = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (isReset) {
    return all.filter((f) => f.startsWith("999_"));
  }

  // Exclude reset file unless explicitly requested
  return all.filter((f) => !f.startsWith("999_"));
}

// ─── Main ───────────────────────────────────────────────────────

async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    log("error", "DATABASE_URL environment variable is not set.");
    log("error", "Add it to your .env.local file:");
    console.log("  DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres");
    process.exit(1);
  }

  const files = getMigrationFiles();

  if (files.length === 0) {
    log("warn", "No migration files found in migrations/");
    process.exit(0);
  }

  log("info", `Found ${files.length} migration file(s):`);
  files.forEach((f, i) => console.log(`  ${String(i + 1).padStart(2, "0")}. ${f}`));
  console.log("");

  if (isDryRun) {
    log("warn", "Dry-run mode — no changes applied.");
    return;
  }

  if (isReset) {
    log("warn", "⚠ RESET mode — all data will be deleted. Proceeding in 3 seconds...");
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Supabase requires SSL on all direct connections.
  // rejectUnauthorized: false is safe here because Supabase uses
  // a self-signed cert on the direct postgres endpoint.
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    log("info", "Connected to database.");
    console.log("");

    let success = 0;
    let failed = 0;

    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, "utf8");

      process.stdout.write(`  Running ${file} ... `);

      try {
        await client.query(sql);
        console.log("\x1b[32mdone\x1b[0m");
        success++;
      } catch (err) {
        console.log("\x1b[31mFAILED\x1b[0m");
        log("error", `  → ${err.message}`);
        failed++;

        // Stop on first failure to preserve DB consistency
        log("error", "Migration stopped due to error. Fix the issue and re-run.");
        break;
      }
    }

    console.log("");
    log("info", `Migration complete. Success: ${success} | Failed: ${failed}`);

    if (failed > 0) process.exit(1);
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  log("error", err.message);
  process.exit(1);
});
