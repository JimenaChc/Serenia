import conexion from "../Config/db.js";

export const obtenerImagenesPaginadas = (offset,limit,callback)=>{
    const sql = `SELECT Id_Imagen, Url, Titulo, Descripcion FROM Imagenes LIMIT ?, ?`;``
    conexion.query(sql,[offset,limit],callback);
};