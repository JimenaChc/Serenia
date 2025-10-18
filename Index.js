
import express from "express";
import cors from "cors";
import RutaImagenes from "./Rutas/RutaImagenes.js";
import RutaTableros from "./Rutas/RutaTableros.js";
import RutaCotizaciones from "./Rutas/RutaCotizaciones.js";
import RutaUsuarios from "./Rutas/RutaUsuarios.js";

const app = express();

app.use(cors());
app.use(express.static("Public")); 

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/usuarios", RutaUsuarios);
app.use("/api/imagenes",RutaImagenes);
app.use("/api/tableros", RutaTableros);
app.use("/api/cotizaciones", RutaCotizaciones);
app.use("/api/proyectos", RutaCotizaciones);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
