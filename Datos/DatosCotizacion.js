// Datos/DatosCotizacion.js
import conexion from "../Config/db.mjs";

// Crear una nueva cotización
export function crearCotizacion(cotizacion, callback) {
  const sql = `
    CALL CrearCotizacion(?, ?, ?, ?, ?, ?, ?,?)
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
      cotizacion.Ubicacion
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

// Obtener detalle de una cotización
export function obtenerCotizacion(idCotizacion, callback) {
  const sql = `
    CALL ObtenerCotizacion(?)
  `;
  conexion.query(sql, [idCotizacion], (err, resultado) => {
    if (err) return callback(err);
    callback(null, resultado[0]);
  });
}

export function obtenerProgresoPorCotizacion(idCotizacion, callback) {
  const sql = `
    CALL ObtenerProgresoPorCotizacion(?)
  `;
  conexion.query(sql, [idCotizacion], (err, result) => {
    if (err) {
      console.error("Error al obtener el progreso:", err);
      callback(err, null);
      return;
    }
    callback(null, result[0]);
  });
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

export function guardarDetallesDisenio(datos, callback) { 
  const sql = `CALL guardarDetallesDisenio(?,?,?,?)`;
  conexion.query(
    sql,
    [datos.Id_Cotizacion, datos.EstiloDeseado, datos.MaterialesDeseados, datos.Id_Tablero],
    callback
  );
}

export function registrarPagoDB(datos, callback) {
  const sql = `
    CALL registrarPago(?,?,'Completado')
  `;
  conexion.query(sql,[datos.Id_Cotizacion, datos.Monto], callback);
}

export function obtenerImagenesProgreso(idCotizacion, callback) {
  const sql = "CALL imagenesProgreso(?)";
  conexion.query(sql, [idCotizacion], callback);
}

export function obtenerComentariosDB(idCotizacion, callback){
  const sql = `SELECT * FROM Comentarios WHERE Id_Cotizacion = ? ORDER BY fecha ASC`;
  conexion.query(sql, [idCotizacion], callback);
}

export function agregarComentarioDB({ Id_Cotizacion, autor, mensaje }, callback){
  const sql = `INSERT INTO Comentarios (Id_Cotizacion, autor, mensaje, fecha) VALUES (?, ?, ?, NOW())`;
  conexion.query(sql, [Id_Cotizacion, autor, mensaje], callback);
}
