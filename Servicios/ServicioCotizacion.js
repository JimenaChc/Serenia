// Servicios/ServicioCotizacion.js
import cloudinary from "../Config/cloudinary.js";
import Encriptador from "../Servicios/ServicioEncriptarDesencriptar.js";
import {
  crearCotizacion,
  agregarImagenACotizacion,
  obtenerCotizacionesDeUsuario,
  obtenerCotizacion,
  obtenerProgresoPorCotizacion,
  obtenerServicios,
   obtenerEspacios,
   guardarDetallesDisenio,
   registrarPagoDB,
   obtenerImagenesProgreso,
   obtenerComentariosDB,
   agregarComentarioDB
   
} from "../Datos/DatosCotizacion.js";

const encriptador = new Encriptador(process.env.ENCRYPTION_SECRET, process.env.ENCRYPTION_SALT);
export async function registrarCotizacion(datos, imagenes = []) {
  return new Promise((resolve, reject) => {

  
    crearCotizacion(datos, async (err, resultado) => {
      if (err) return reject(err);

      // Obtenemos el ID de la cotización recién creada
      const idCotizacion = resultado[0][0].Id_Cotizacion || resultado.insertId;
      const urlsSubidas=[];
      try {
        for (const base64 of imagenes) {
          if (!base64.startsWith("data:image")) continue;

          const subida = await cloudinary.uploader.upload(base64, {
            folder: "cotizaciones_serenia",
            resource_type: "image",
          });

          const url = subida.secure_url;
          urlsSubidas.push(url);

          await new Promise((res, rej) =>
            agregarImagenACotizacion(idCotizacion, url, (e) => (e ? rej(e) : res()))
          );
        }

        resolve({
          mensaje: "Cotización creada correctamente",
          idCotizacion,
          imagenes: urlsSubidas,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}
export function listarCotizacionesUsuario(idUsuario) {
  return new Promise((resolve, reject) => {
    obtenerCotizacionesDeUsuario(idUsuario, (err, resultado) => {
      if (err) return reject(err);
      resolve(resultado);
    });
  });
}

export function servicioObtenerCotizacion(idCotizacion) {
  return new Promise((resolve, reject) => {
    obtenerCotizacion(idCotizacion, (err, resultado) => {
      if (err) return reject(err);
      resolve(resultado);
    });
  });
}

export function consultarProgreso(idCotizacion, callback) {
  obtenerProgresoPorCotizacion(idCotizacion, (err, result) => {
    if (err) return callback(err);

    if (!result || result.length === 0)
      return callback(null, { mensaje: "No hay progreso para esta cotización" });

    const progreso = result[0];
    progreso.imagenes = progreso.Imagenes ? progreso.Imagenes.split(",") : [];
    delete progreso.Imagenes;

    callback(null, progreso);
  });
}

export function servicioListarServicios(callback) {
  obtenerServicios((err, resultados) => {
    if (err) return callback(err);
    callback(null, resultados);
  });
}

export function servicioListarEspacios(callback) {
  obtenerEspacios((err, resultados) => {
    if (err) return callback(err);
    callback(null, resultados);
  });
}

export function servicioGuardarDisenio(datos, callback) {
  guardarDetallesDisenio(datos, callback);
}

export function servicioRegistrarPago(datos, callback) {
  const datosCifrados = {
    ...datos,
    monto: encriptador.cifrar(datos.monto),
  };
  registrarPagoDB(datosCifrados, callback);
}

export function servicioObtenerImagenesProgreso(idCotizacion, callback) {
  obtenerImagenesProgreso(idCotizacion, (err, resultados) => {
    if (err) return callback(err);
    callback(null, resultados[0] || []);
  });
}


export function servicioObtenerComentarios(idCotizacion, callback) {
  obtenerComentariosDB(idCotizacion, callback);
}

export function servicioAgregarComentario(datos, callback) {
  agregarComentarioDB(datos, callback);
}
