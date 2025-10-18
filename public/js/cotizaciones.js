// frontend/js/cotizaciones.js

const fotoInput = document.getElementById("fotoInput");
const fotoPreview = document.getElementById("fotoPreview");
let imagenesSeleccionadas = [];

//Mensajes por pantalla
function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}
// Mostrar previews y convertir a base64
fotoInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  imagenesSeleccionadas = [];
  fotoPreview.innerHTML = "";
 

     files.forEach((file) => {
    if (file.size > 2 * 1024 * 1024) return alert("Imagen demasiado grande (máx 2MB)");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target.result;
      img.style.width = "100px";
      img.style.borderRadius = "10px";
      img.style.margin = "5px";
      fotoPreview.appendChild(img);
       imagenesSeleccionadas.push(event.target.result);
    };
    reader.readAsDataURL(file);
});
});

document.getElementById("formProyecto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    mostrarMensaje("Debes iniciar sesión antes de crear una cotización");
    return;
  }

  const datos = {
    Id_Usuario: usuario.Id_Usuario,
    Id_Servicio: document.getElementById("idServicio").value,
    NombreProyecto: document.getElementById("nombreProyecto").value,
    Id_Espacio_Evento: document.getElementById("idEspacioEvento").value,
    Descripcion: document.getElementById("descripcion").value,
    MontoEstimado: document.getElementById("montoEstimado").value,
    Id_Tablero: 1,
    Imagenes: imagenesSeleccionadas,
  };

  try {
    const res = await fetch("/api/cotizaciones/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await res.json();
    if (res.ok) {
      mostrarMensaje("Cotización creada correctamente ");
      window.location.href = "feed.html";
    } else {
      mostrarMensaje("Error: " + data.error);
    }
  } catch (error) {
    console.error(error);
    mostrarMensaje("Error al enviar la cotización");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await cargarServicios();
  await cargarEspacios();
});

async function cargarServicios() {
  try {
    const res = await fetch("/api/cotizaciones/servicios");
    const serviciosRaw = await res.json();


    const servicios = serviciosRaw[0];

    console.log("Servicios procesados:", servicios); 

    const select = document.getElementById("idServicio");
    select.innerHTML = '<option value="">Seleccionar servicio</option>';

    servicios.forEach(s => {
      const option = document.createElement("option");
      option.value = s.Id_Servicio;
      option.textContent = s.Descripcion;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando servicios:", err);
  }
}

async function cargarEspacios() {
  try {
    const res = await fetch("/api/cotizaciones/espacios");
    const espaciosRaw = await res.json();

    const espacios = espaciosRaw[0]; 

    console.log("Espacios procesados:", espacios); 

    const select = document.getElementById("idEspacioEvento");
    select.innerHTML = '<option value="">Tipo de espacio o evento</option>';

    espacios.forEach(e => {
      const option = document.createElement("option");
      option.value = e.Id_Categoria;
      option.textContent = e.Nombre;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando espacios:", err);
  }
}
