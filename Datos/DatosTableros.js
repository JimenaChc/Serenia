// Datos/DatosTableros.js
import conexion from "../Config/db.mjs";

export const crearTablero = (nombre, idUsuario, callback) => {
  const sql = `CALL CrearTablero(?,?,NULL,CURDATE())`;
  conexion.query(sql, [idUsuario, nombre], callback);
};

export const listarTablerosPorUsuario = (idUsuario, callback) => {
  const sql = `CALL TablerosUsuario(?)`;
  conexion.query(sql, [idUsuario], callback);
};

export const guardarImagenEnTablero = (idTablero, idImagen, callback) => {
 const sql = `CALL AgregarImagenTablero(?,?)`;
  conexion.query(sql, [idTablero, idImagen], callback);
};

export const obtenerImagenesPorTablero = (idTablero, callback) => {
    const sql = `CALL ImagenesTableros(?)`;
    conexion.query(sql, [idTablero], callback);
};
