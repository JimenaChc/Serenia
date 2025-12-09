import conexion from "../Config/db.js";
import dotenv from "dotenv";
dotenv.config();

//Registro
export async function crearUsuario(usuario){
  const sql = `CALL RegistrarUsuario(?, ?, ?, ?, ?,?)`;
  const result = await conexion.query(
    sql,
    [usuario.Nombre, usuario.Apellidos, usuario.Correo, usuario.Contrasena, usuario.Telefono, usuario.Direccion],
    callback
  );
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

// Actualizar contraseña 
export function ActualizarContrasena(correo, hash, callback) {
  const sql = `CALL ActualizarContrasena(?, ?)`;
  conexion.query(sql, [correo,hash], (err, results) => {
    if (err) {
      console.error("Error al actualizar contraseña:", err);
      return callback(err);
    }
    callback(null, results);
  });
}

export function incrementarIntentos(correo, callback) {
  const sql = `CALL IncrementarIntentos(?)`;
  conexion.query(sql, [correo], (err, results) => {
    if (err) {
      console.error("Error al incrementar intentos:", err);
      return callback(err);
    }
    callback(null, results);
  });
}

export function bloquearUsuario(correo, callback) {
  const sql = `CALL BloquearUsuario(?)`;
  conexion.query(sql, [correo], callback);
}

export function resetearIntentos(correo, callback) {
  const sql = `UPDATE usuarios SET IntentosFallidos = 0, Bloqueado = 'Activo' WHERE Correo = ?`;
  conexion.query(sql, [correo], callback);
}

export function obtenerPaises(callback) {
  const sql = "SELECT Id, Descripcion FROM ubicaciones WHERE Dependencia IS NULL";
  conexion.query(sql, callback);
}

export function obtenerUbiPorDependencia(idPadre, callback) {
  const sql = "SELECT Id, Descripcion FROM ubicaciones WHERE Dependencia = ?";
  conexion.query(sql, [idPadre], callback);
}


