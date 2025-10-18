import conexion from "../Config/db.js";

export const obtenerImagenesPaginadas = (offset,limit,callback)=>{
    const sql = `SELECT Id_Imagen, Url, Titulo, Descripcion FROM Imagenes LIMIT ?, ?`;
    conexion.query(sql,[offset,limit],callback);
};

export const registrarLike = (idUsuario, idImagen, callback) => {
  const sql = `CALL RegistrarLike(?,?)`;
  conexion.query(sql, [idUsuario, idImagen], callback);
};

export const obtenerImagenesMeGusta = (idUsuario, callback) => {
    const sql = `CALL LikesPorUsuario(?)`;
    conexion.query(sql, [idUsuario], callback);
};