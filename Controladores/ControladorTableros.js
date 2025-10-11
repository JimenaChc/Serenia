import { servicioCrearTablero, servicioListarTableros, servicioGuardarImagenEnTablero } from "../Servicios/ServicioTableros.js";

export async function crearTableroController(req, res) {
  try {
    const { nombre } = req.body;
    const idUsuario = req.body.idUsuario; 
    const resultado = await servicioCrearTablero(nombre, idUsuario);
    const id = resultado?.[0]?.[0]?.Id_Tablero ||
      resultado?.[0]?.Id_Tablero ||
      resultado?.insertId ||
      null;
    res.status(201).json({ mensaje: "Tablero creado", id});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear tablero" });
  }
}

export async function listarTablerosController(req, res) {
  try {
    const idUsuario = req.params.idUsuario;
    const resultados = await servicioListarTableros(idUsuario);
    const tableros = resultados[0];
    res.json(tableros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar tableros" });
  }
}

export async function guardarImagenController(req, res) {
  try {
    const { idTablero, idImagen } = req.body;
    await servicioGuardarImagenEnTablero(idTablero, idImagen);
    res.json({ mensaje: "Imagen guardada en el tablero" });
  } catch (err) {
    console.error("Error al guardar imagen en tablero:",err);
    res.status(500).json({ error: "Error al guardar imagen en tablero" });
  }
}
