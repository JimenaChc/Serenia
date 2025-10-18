import { obtenerImagenesPaginadas , registrarLike,obtenerImagenesMeGusta} from "../Datos/DatosImagenes.js";

export const listarImagenesPaginadas = (offset,limit) =>{
   return new Promise((resolve, reject) => {
    obtenerImagenesPaginadas(offset,limit,(err,resultados)=>{
        if(err)reject(err);
        else resolve(resultados);
    });
   });
};

export const ServicioRegistrarLike = (idUsuario, idImagen) => {
  return new Promise((resolve, reject) => {
    registrarLike(idUsuario, idImagen, (err, resultado) => {
      if (err) reject(err);
      else resolve(resultado);
    });
  });
};

export const servicioObtenerMeGusta = (idUsuario) => {
    return new Promise((resolve, reject) => {
        obtenerImagenesMeGusta(idUsuario, (err, resultados) => {
            if (err) reject(err);
            else resolve(resultados[0]);
        });
    });
};