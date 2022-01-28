import mysql from "promise-mysql";

export const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: 3306,
  password: "Ac03901582",
  database: "cosbiome_serviciotecnico_backend",
});
