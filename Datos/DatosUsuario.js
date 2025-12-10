import conexion from "../Config/db.js";
import dotenv from "dotenv";
dotenv.config();

// Nota: en Linux / Render los nombres de tabla/proc son case-sensitive. Usa los nombres exactos.
export async function crearUsuario(usuario) {
  try {
    const sql = `CALL RegistrarUsuario(?, ?, ?, ?, ?, ?)`;
    // Cuando haces CALL, mysql2 devuelve un array con resultsets. Aquí devolvemos el primer resultset si existe.
    const rows = await conexion.query(sql, [
      usuario.Nombre,
      usuario.Apellidos,
      usuario.Correo,
      usuario.Contrasena,
      usuario.Telefono,
      usuario.Direccion,
    ]);
    // rows puede ser un array de resultsets; regresamos la info más probable
    return Array.isArray(rows) && rows.length ? rows[0] : rows;
  } catch (err) {
    console.error("Error crearUsuario:", err);
    throw err;
  }
}

export async function buscarPorCorreo(correo) {
  try {
    const sql = `CALL LoginUsuario(?)`;
    const rows = await conexion.query(sql, [correo]);
    // rows suele venir como: [ [ {Id_Usuario,...} ], ... ]
    const usuario = Array.isArray(rows) ? rows[0]?.[0] ?? null : rows?.[0] ?? null;
    return usuario;
  } catch (err) {
    console.error("Error buscarPorCorreo:", err);
    throw err;
  }
}

export function obtenerGoogleClientID() {
  return process.env.GOOGLE_CLIENT_ID;
}

export async function ObtenerUsuario(idUsuario) {
  try {
    const sql = `CALL ObtenerUsuario(?)`;
    const rows = await conexion.query(sql, [idUsuario]);
    return Array.isArray(rows) ? rows[0]?.[0] ?? null : rows?.[0] ?? null;
  } catch (err) {
    console.error("Error ObtenerUsuario:", err);
    throw err;
  }
}

export async function ActualizarDatosUsuario(idUsuario, datos) {
  try {
    const sql = `CALL ActualizarDatosUsuario(?,?,?,?,?,?)`;
    // Asegúrate que el SP tenga ese orden de params; ajusta si es distinto
    const rows = await conexion.query(sql, [
      datos.Nombre,
      datos.Apellidos,
      datos.Telefono,
      datos.Correo,
      datos.Contrasena,
      idUsuario,
    ]);
    return rows;
  } catch (err) {
    console.error("Error ActualizarDatosUsuario:", err);
    throw err;
  }
}

export async function ActualizarFotoPerfil(idUsuario, urlFoto) {
  try {
    const sql = `CALL ActualizarFotoPerfil(?,?)`;
    const rows = await conexion.query(sql, [idUsuario, urlFoto]);
    return rows;
  } catch (err) {
    console.error("Error ActualizarFotoPerfil:", err);
    throw err;
  }
}

export async function guardarSecretFA(idUsuario, secret) {
  try {
    const sql = `CALL guardarSecretFA(?,?)`;
    const rows = await conexion.query(sql, [idUsuario, secret]);
    // normalizar
    return Array.isArray(rows) ? rows[0] : rows;
  } catch (err) {
    console.error("Error guardarSecretFA:", err);
    throw err;
  }
}

export async function obtenerSecretFA(idUsuario) {
  try {
    const sql = `CALL validarSecretFA(?)`;
    const rows = await conexion.query(sql, [idUsuario]);
    const row = Array.isArray(rows) ? rows[0]?.[0] ?? null : rows?.[0] ?? null;
    return row?.SecretFA ?? null;
  } catch (err) {
    console.error("Error obtenerSecretFA:", err);
    throw err;
  }
}

export async function ActualizarContrasena(correoOId, hash) {
  try {
    const sql = `CALL ActualizarContrasena(?, ?)`;
    const rows = await conexion.query(sql, [correoOId, hash]);
    return rows;
  } catch (err) {
    console.error("Error ActualizarContrasena:", err);
    throw err;
  }
}

export async function incrementarIntentos(correo) {
  try {
    const sql = `CALL IncrementarIntentos(?)`;
    const rows = await conexion.query(sql, [correo]);
    return rows;
  } catch (err) {
    console.error("Error incrementarIntentos:", err);
    throw err;
  }
}

export async function bloquearUsuario(correo) {
  try {
    const sql = `CALL BloquearUsuario(?)`;
    const rows = await conexion.query(sql, [correo]);
    return rows;
  } catch (err) {
    console.error("Error bloquearUsuario:", err);
    throw err;
  }
}

export async function resetearIntentos(correo) {
  try {
    const sql = `UPDATE usuarios SET IntentosFallidos = 0, Bloqueado = 'Activo' WHERE Correo = ?`;
    const rows = await conexion.query(sql, [correo]);
    // UPDATE devuelve metadata; devolvemos rows directamente
    return rows;
  } catch (err) {
    console.error("Error resetearIntentos:", err);
    throw err;
  }
}

export async function obtenerPaises() {
  try {
    const sql = "SELECT Id, Descripcion FROM ubicaciones WHERE Dependencia IS NULL";
    const rows = await conexion.query(sql);
    return rows;
  } catch (err) {
    console.error("Error obtenerPaises:", err);
    throw err;
  }
}

export async function obtenerUbiPorDependencia(idPadre) {
  try {
    const sql = "SELECT Id, Descripcion FROM ubicaciones WHERE Dependencia = ?";
    const rows = await conexion.query(sql, [idPadre]);
    return rows;
  } catch (err) {
    console.error("Error obtenerUbiPorDependencia:", err);
    throw err;
  }
}
