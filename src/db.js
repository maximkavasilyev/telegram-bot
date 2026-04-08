const { Pool } = require("pg");

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error(
    "Database connection string is missing. Expected POSTGRES_URL or DATABASE_URL."
  );
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (error) => {
  console.error("POSTGRES_POOL_ERROR:", error.message);
});

module.exports = pool;