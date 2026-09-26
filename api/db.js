// api/db.js

const { Pool } = require("pg");

/*
 * PostgreSQL connection pool
 *
 * Vercel mein DATABASE_URL environment variable
 * configure karna hoga.
 *
 * Example:
 * DATABASE_URL=postgresql://username:password@host/database
 */

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not configured."
  );
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  /*
   * SSL is normally required when using
   * hosted PostgreSQL providers.
   *
   * rejectUnauthorized: false allows the
   * hosted provider certificate to work
   * with the serverless environment.
   */
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,

  /*
   * Keep the pool small because Vercel
   * functions are serverless.
   */
  max: 5,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 10000,
});


/*
 * Test database connection.
 *
 * Usage:
 *
 * const { query } = require("./db");
 *
 * const result = await query(
 *   "SELECT NOW() AS time"
 * );
 */
async function query(text, params = []) {
  const start = Date.now();

  try {
    const result = await pool.query(
      text,
      params
    );

    const duration =
      Date.now() - start;

    console.log(
      "Database query:",
      {
        duration: `${duration}ms`,
        rows: result.rowCount,
      }
    );

    return result;

  } catch (error) {

    console.error(
      "Database query error:",
      error.message
    );

    throw error;
  }
}


/*
 * Get a database client.
 *
 * Useful for transactions:
 *
 * const client = await getClient();
 *
 * try {
 *   await client.query("BEGIN");
 *   ...
 *   await client.query("COMMIT");
 * } catch (error) {
 *   await client.query("ROLLBACK");
 *   throw error;
 * } finally {
 *   client.release();
 * }
 */
async function getClient() {
  return pool.connect();
}


/*
 * Gracefully close the pool.
 *
 * Usually not required inside Vercel
 * functions, but exported for completeness.
 */
async function closePool() {
  await pool.end();
}


module.exports = {
  pool,
  query,
  getClient,
  closePool,
};
