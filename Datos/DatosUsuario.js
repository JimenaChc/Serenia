import conexion from "../Config/db.js";
import dotenv from "dotenv";
dotenv.config();

//Registro
export async function crearUsuario(usuario){
  try{
  const sql = `CALL RegistrarUsuario(?, ?, ?, ?, ?,?)`;
  const [result] = await conexion.query(
    sql, [
    [usuario.Nombre, usuario.Apellidos, usuario.Correo, usuario.Contrasena, usuario.Telefono, usuario.Direccion],
    callback
  ]);
      return result[0];
  } catch (err) {
    console.error("Error crearUsuario:", err);
    throw err;
  }
};


//El login
export function buscarPorCorreo(correo, callback) {
  const sql = `CALL LoginUsuario(?)`;

  conexion.query(sql, [correo])
    .then(rows => {
      const usuario = rows?.[0]?.[0] || null;
      callback(null, usuario);
    })
    .catch(err => {
      callback(err, null);
    });
}
//Client ID Google 
export function obtenerGoogleClientID() {
  return process.env.GOOGLE_CLIENT_ID;
}


// Obtener un usuario por ID
export async function ObtenerUsuario(idUsuario) {
  const sql = `CALL ObtenerUsuario(?)`;
  const result = await conexion.query(sql, [idUsuario]);
  return result[0];
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

export async function guardarSecretFA(idUsuario, secret) {
  try {
    const sql = `CALL guardarSecretFA(?,?)`;
    const result = await conexion.query(sql, [idUsuario, secret]);
    const rows = Array.isArray(result) ? result[0] : result;
    return rows;
  } catch (err) {
    console.error("Error guardarSecretFA:", err);
    throw err;
  }
}
// Obtener secreto 2FA para validar el código
export async function obtenerSecretFA(idUsuario) {
  try {
    const sql = `CALL validarSecretFA(?)`;
    const [result] = await conexion.query(sql, [idUsuario]);
    const row = result?.[0]?.[0];
    return row?.SecretFA ?? null;
  } catch (err) {
    console.error("Error obtenerSecretFA:", err);
    throw err;
  }
}

// Actualizar contraseña 
export async function ActualizarContrasena(correo, hash) {
  try {
    const sql = `CALL ActualizarContrasena(?, ?)`;
    const [result] = await conexion.query(sql, [correo, hash]);
    return result;
  } catch (err) {
    console.error("Error ActualizarContrasena:", err);
    throw err;
  }
}


export async function incrementarIntentos(correo) {
  try {
    const sql = `CALL IncrementarIntentos(?)`;
    const [result] = await conexion.query(sql, [correo]);
    return result;
  } catch (err) {
    console.error("Error incrementarIntentos:", err);
    throw err;
  }
}

export async function bloquearUsuario(correo) {
  try {
    const sql = `CALL BloquearUsuario(?)`;
    const [result] = await conexion.query(sql, [correo]);
    return result;
  } catch (err) {
    console.error("Error bloquearUsuario:", err);
    throw err;
  }
}

export async function resetearIntentos(correo) {
  try {
    const sql = `UPDATE usuarios SET IntentosFallidos = 0, Bloqueado = 'Activo' WHERE Correo = ?`;
    const result = await conexion.query(sql, [correo]);
    return Array.isArray(result) ? result[0] : result;
  } catch (err) {
    console.error("Error resetearIntentos:", err);
    throw err;
  }
}

export async function obtenerPaises() {
  try {
    const sql = "SELECT Id, Descripcion FROM ubicaciones WHERE Dependencia IS NULL";
    const [rows] = await conexion.query(sql);
    return rows;
  } catch (err) {
    console.error("Error obtenerPaises:", err);
    throw err;
  }
}


export async function obtenerUbiPorDependencia(idPadre) {
  try {
    const sql = "SELECT Id, Descripcion FROM ubicaciones WHERE Dependencia = ?";
    const [rows] = await conexion.query(sql, [idPadre]);
    return rows;
  } catch (err) {
    console.error("Error obtenerUbiPorDependencia:", err);
    throw err;
  }
}
