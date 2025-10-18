import conexion from "../Config/db.js";

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

