import conexion from "../Config/db.js"
import { v4 as uuidv4 } from "uuid";

// Crear verificación temporal
export const crearVerificacion = (correo, callback) => {
  const token = uuidv4();
  const sql = `INSERT INTO VerificacionesCorreo (Correo, Token, FechaCreacion) VALUES (?, ?, NOW())`;
  conexion.query(sql, [correo, token], (err) => {
    callback(err, token);
  });
};

// Buscar correo por token
export const obtenerCorreoPorToken = (token, callback) => {
  const sql = `SELECT Correo FROM VerificacionesCorreo WHERE Token = ?`;
  conexion.query(sql, [token], (err, resultados) => {
    if (err) return callback(err, null);
    callback(null, resultados[0]?.Correo || null);
  });
};

// Eliminar token cuando ya se usó
export const eliminarVerificacion = (token, callback) => {
  const sql = `DELETE FROM VerificacionesCorreo WHERE Token = ?`;
  conexion.query(sql, [token], callback);
};