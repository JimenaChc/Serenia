// Datos/DatosCotizacion.js
import conexion from "../Config/db.js";

// Crear una nueva cotización
export function crearCotizacion(cotizacion, callback) {
  const sql = `
    CALL CrearCotizacion(?, ?, ?, ?, ?, ?, ?)
  `;
  conexion.query(
    sql,
    [
      cotizacion.Id_Usuario,
      cotizacion.Id_Servicio,
      cotizacion.NombreProyecto,
      cotizacion.Id_Categoria,
      cotizacion.Descripcion,
      cotizacion.MontoEstimado,
      "En revisión",
    ],
    callback
  );
}

// Asociar una imagen a la cotización
export function agregarImagenACotizacion(idCotizacion, url, callback) {
  const sql = `
   CALL AgregarImagenCotizacion(?,?)
  `;
  conexion.query(sql, [idCotizacion, url], callback);
}

export function obtenerCotizacionesDeUsuario(idUsuario, callback) {
  const sql = `
    CALL ObtenerCotizaciones(?)
  `;
  conexion.query(sql, [idUsuario], callback);
}

export function obtenerProgresoPorCotizacion(idCotizacion, callback) {
  const sql = `
    CALL ObtenerProgresoCotizaciones(?)
  `;
  conexion.query(sql, [idCotizacion], callback);
}

export function obtenerServicios(callback) {
  const sql = "CALL listaServicios";
  conexion.query(sql, (err, resultados) => {
    if (err) return callback(err);
    callback(null, resultados);
  });
}

// Obtener lista de espacios o eventos
export function obtenerEspacios(callback) {
  const sql = "CALL listaEspaciosEventos";
  conexion.query(sql, (err, resultados) => {
    if (err) return callback(err);
    callback(null, resultados);
  });
}

