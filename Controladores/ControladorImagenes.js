import { listarImagenesPaginadas } from "../Servicios/ServicioImagenes.js";

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