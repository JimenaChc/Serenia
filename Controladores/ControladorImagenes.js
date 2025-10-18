import { listarImagenesPaginadas, ServicioRegistrarLike,servicioObtenerMeGusta } from "../Servicios/ServicioImagenes.js";

export async function obtenerFeed(req,res){
       try{
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = 10;
        const offset = (pagina - 1)*limite;

        const imagenes = await listarImagenesPaginadas(offset,limite);
        res.status(200).json(imagenes);
       
       }catch(error){
        console.error(error);
        res.status(500).json({error:"Erroor al obtener imágenes"});
       }
}

export async function registrarLike(req, res) {
  try {
    const { idUsuario, idImagen } = req.body; 
    if (!idUsuario || !idImagen) {
      return res.status(400).json({ error: "Faltan datos (idUsuario o idImagen)" });
    }

    const resultado = await ServicioRegistrarLike(idUsuario, idImagen);
    res.status(200).json({ mensaje: "Me gusta!", resultado });
  } catch (error) {
    console.error("Error al registrar 'Me gusta':", error);
    res.status(500).json({ error: "Error al registrar 'Me gusta'" });
  }
}

export const obtenerMeGustaUsuario = async (req, res) => {
    try {
        const idUsuario = parseInt(req.query.idUsuario);
        if (!idUsuario) return res.status(400).json({ error: "Falta idUsuario" });

        const imagenes = await servicioObtenerMeGusta(idUsuario);
        res.status(200).json(imagenes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener imágenes que te gustaron" });
    }
};