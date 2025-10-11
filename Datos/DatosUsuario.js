import conexion from "../Config/db.js";

export const crearUsuario = (usuario, callback) => {
  const sql = `CALL RegistrarUsuario(?, ?, ?, ?, ?)`;
  conexion.query(
    sql,
    [usuario.Nombre, usuario.Apellidos, usuario.Correo, usuario.Contrasena, usuario.Telefono],
    callback
  );
};

export function buscarPorCorreo(correo, callback){
   const sql = `CALL LoginUsuario(?)`;
   conexion.query(sql, [correo], (err, resultado) => {
    if (err) return callback(err, null);
     const usuario = resultado[0][0]; 
    callback(null, usuario);
  });
};

