import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  allowPublicKeyRetrieval: true,
});

const conexion = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
};

conexion.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos ", err);
  } else {
    console.log("Conectado a la base de datos");
  }
});

export default conexion;
