import { crearTablero, listarTablerosPorUsuario, guardarImagenEnTablero,obtenerImagenesPorTablero } from "../Datos/DatosTableros.js";

export const servicioCrearTablero = (nombre, idUsuario) => {
  return new Promise((resolve, reject) => {
    crearTablero(nombre, idUsuario, (err, resultado) => {
      if (err) reject(err);
      else resolve(resultado);
    });
  });
};

export const servicioListarTableros = (idUsuario) => {
  return new Promise((resolve, reject) => {
    listarTablerosPorUsuario(idUsuario, (err, resultados) => {
      if (err) reject(err);
      else resolve(resultados);
    });
  });
};

export const servicioGuardarImagenEnTablero = (idTablero, idImagen) => {
  return new Promise((resolve, reject) => {
    guardarImagenEnTablero(idTablero, idImagen, (err, resultado) => {
      if (err) reject(err);
      else resolve(resultado);
    });
  });
};

export const servicioListarImagenesTablero = (idTablero) => {
    return new Promise((resolve, reject) => {
        obtenerImagenesPorTablero(idTablero, (err, resultados) => {
            if(err) reject(err);
            else resolve(resultados[0]);
        });
    });
};
