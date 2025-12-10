// Datos/pagosData.js
import conexion from "../Config/db.mjs";

export function buscarTarjetaPorTelefono(telefono, cb) {
  const sql = `CALL VerificarTarjetaPorTelefono(?)`;

  conexion.query(sql, [telefono], (err, resultado) => {
    if (err) return cb(err);

    const filas = resultado?.[0] || [];
    cb(null, filas);
  });
}

export function buscarTarjetaPorNumero(numTarjeta, cb) {
  const sql = `CALL VerificarTarjetaPorNumero(?)`;

  conexion.query(sql, [numTarjeta], (err, resultado) => {
    if (err) return cb(err);

    const filas = resultado?.[0] || [];
    cb(null, filas);
  });
}

export function descontarSaldo(numTarjeta, monto, cb) {
  const sql = `CALL descontarSaldo(?, ?)`;

  conexion.query(sql, [numTarjeta, monto], (err, resultado) => {
    if (err) return cb(err);
    
    console.log("RESULTADO DEL SP:", resultado);
    const valor = resultado?.[0]?.[0]?.resultado;
    console.log("VALOR EXTRAÍDO:", valor);
    cb(null, valor);
  });
}

export function registrarPagoDB(Id_Cotizacion, Monto, Metodo, cb) {
  const sql = `CALL registrarPago(?, ?, 'Completado')`;

  conexion.query(sql, [Id_Cotizacion, Monto], (err, resultado) => {
    if (err) return cb(err);
    cb(null, resultado);
  });
}

export function actualizarEstadoCotizacion(idCotizacion, nuevoEstado, cb) {
  conexion.query(
    `UPDATE Cotizaciones SET Estado = ? WHERE Id_Cotizacion = ?`,
    [nuevoEstado, idCotizacion],
    (err, resultado) => {
      if (err) return cb(err);
      cb(null, resultado);
    }
  );
}
