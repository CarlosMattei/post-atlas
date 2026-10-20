import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.NEON_CONNECTION_STRING;
if (!connectionString) {
  throw new Error("NEON_CONNECTION_STRING is not defined in environment variables");
}

// Neon requires SSL with rejectUnauthorized false
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[],
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
