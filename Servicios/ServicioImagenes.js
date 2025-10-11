import { obtenerImagenesPaginadas } from "../Datos/DatosImagenes.js";

export const listarImagenesPaginadas = (offset,limit) =>{
   return new Promise((resolve, reject) => {
    obtenerImagenesPaginadas(offset,limit,(err,resultados)=>{
        if(err)reject(err);
        else resolve(resultados);
    });
   });
};