import mysql from "mysql2/promise";

const conexion = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

conexion.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos ", err);
  } else {
    console.log("Conectado a la base de datos");
  }
});

export default conexion;
