import { Pool } from "pg";
export const pool = new Pool({
  user: "postgres",
  password: "000010",
  host: "localhost",
  port: 5432,
  database: "ezPos",
});