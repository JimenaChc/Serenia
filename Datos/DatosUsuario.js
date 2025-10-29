import conexion from "../Config/db.js";
import dotenv from "dotenv";
dotenv.config();


//Registro
export const crearUsuario = (usuario, callback) => {
  const sql = `CALL RegistrarUsuario(?, ?, ?, ?, ?)`;
  conexion.query(
    sql,
    [usuario.Nombre, usuario.Apellidos, usuario.Correo, usuario.Contrasena, usuario.Telefono],
    callback
  );
};


//El login
export function buscarPorCorreo(correo, callback){
   const sql = `CALL LoginUsuario(?)`;
   conexion.query(sql, [correo], (err, resultado) => {
    if (err) return callback(err, null);
     const usuario = resultado[0][0]; 
    callback(null, usuario);
  });
};

//Client ID Google 
export function obtenerGoogleClientID() {
  return process.env.GOOGLE_CLIENT_ID;
}


// Obtener un usuario por ID
export function ObtenerUsuario(idUsuario, callback) {
  const sql = `CALL ObtenerUsuario(?)`;
  conexion.query(sql, [idUsuario], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Actualizar datos generales del usuario
export function ActualizarDatosUsuario(idUsuario, datos, callback) {
  const sql = `
    CALL ActualizarDatosUsuario(?,?,?,?,?)
  `;
  conexion.query(
    sql,
    [datos.Nombre,datos.Apellidos, datos.Telefono, datos.Correo, datos.Contrasena, idUsuario],
    callback
  );
}

// Actualizar la foto de perfil
export function ActualizarFotoPerfil(idUsuario, urlFoto, callback) {
  const sql = `
    CALL ActualizarFotoPerfil(?,?)
  `;
  conexion.query(sql, [idUsuario,urlFoto], callback);
}

export function guardarSecretFA(idUsuario, secret, callback) {
  const sql = `CALL guardarSecretFA(?,?)`;
  conexion.query(sql, [idUsuario, secret], (err, results) => {
    if (err) {
      console.error("guardarSecretFA error:", err);
      return callback(err);
    }
   
    callback(null, results);
  });
}
// Obtener secreto 2FA para validar el código
export function obtenerSecretFA(idUsuario, callback) {
  const sql = `CALL validarSecretFA(?)`;
  conexion.query(sql, [idUsuario], (err, results) => {
    if (err) {
      console.error("obtenerSecretFA error:", err);
      return callback(err);
    }
    const row = results?.[0]?.[0] || results?.[0];
    callback(null, row?.SecretFA ?? null);
  });
}

