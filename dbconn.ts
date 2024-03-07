import mysql from "mysql";

export const conn = mysql.createPool({
  connectionLimit: 10,
  host: "sql6.freemysqlhosting.net",
  user: "sql6688898",
  password: "tVu1lSP6h2",
  database: "sql6688898",
});