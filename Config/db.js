import mysql from "mysql2";

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  allowPublicKeyRetrieval: true,
});

conexion.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos ", err);
  } else {
    console.log("Conectado a la base de datos");
  }
});

export default conexion;
