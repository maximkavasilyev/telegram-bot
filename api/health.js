import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    const result = await pool.query("SELECT NOW() as now");
    res.status(200).json({
      ok: true,
      db: true,
      now: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      db: false,
      error: error.message,
    });
  }
}