
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import RutaImagenes from "./Rutas/RutaImagenes.js";
import RutaTableros from "./Rutas/RutaTableros.js";
import RutaCotizaciones from "./Rutas/RutaCotizaciones.js";
import RutaUsuarios from "./Rutas/RutaUsuarios.js";
import RutaVerificacion from "./Rutas/RutaVerificacion.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static("Public")); 

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api/usuarios", RutaUsuarios);
app.use("/api/verificacion", RutaVerificacion);
app.use("/api/imagenes",RutaImagenes);
app.use("/api/tableros", RutaTableros);
app.use("/api/cotizaciones", RutaCotizaciones);
app.use("/api/proyectos", RutaCotizaciones);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("GOOGLE_CLIENT_ID desde .env:", process.env.GOOGLE_CLIENT_ID);
});
