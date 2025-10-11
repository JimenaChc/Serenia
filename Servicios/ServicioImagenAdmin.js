import cloudinary from "../Config/cloudinary.js";
import conexion from "../Config/db.js";

export const subirImagen = async(filePath, titulo, descripcion, idCategoria) => {
    try{
        const resultado = await cloudinary.uploader.upload(filePath, {
      folder: "serenia_proyectos",
    });

    // Guarda la URL en la base de datos
    await conexion
      .promise()
      .query(
        "INSERT INTO Imagenes (Url, Titulo, Descripcion, Id_Categoria) VALUES (?, ?, ?, ?)",
        [resultado.secure_url, titulo, descripcion, idCategoria]
      );

    console.log("Imagen subida y guardada en la base de datos");
  } catch (error) {
    console.error("Error al subir imagen:", error);
  }
};