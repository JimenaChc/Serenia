import mysql from "mysql2";

const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Serenia",
});

conexion.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos ", err);
  } else {
    console.log("Conectado a la base de datos");
  }
});

export default conexion;
