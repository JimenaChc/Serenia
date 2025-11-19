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
const paisSelect = document.getElementById("pais");
const provinciaSelect = document.getElementById("provincia");
const cantonSelect = document.getElementById("canton");

const partes = [
  paisSelect?.selectedOptions[0]?.textContent || "",
  provinciaSelect?.selectedOptions[0]?.textContent || "",
  cantonSelect?.selectedOptions[0]?.textContent || "",
].filter(Boolean);

const direccion = partes.join(", ");

  const datos = {
    Id_Usuario: usuario.Id_Usuario,
    Id_Servicio: document.getElementById("idServicio").value,
    NombreProyecto: document.getElementById("nombreProyecto").value,
    Id_Espacio_Evento: document.getElementById("idEspacioEvento").value,
    Descripcion: document.getElementById("descripcion").value,
    MontoEstimado: document.getElementById("montoEstimado").value,
    Id_Tablero: 1,
    Imagenes: imagenesSeleccionadas,
    Ubicacion: direccion
    
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
      setTimeout(() => window.location.href = "feed.html", 800);
    } else {
      mostrarMensaje("Error: " + data.error);
    }
  } catch (error) {
    console.error(error);
    mostrarMensaje("Error al enviar la cotización");
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    cargarServicios(),
    cargarEspacios()
  ]);
});

async function cargarServicios() {
  const select = document.getElementById("idServicio");
  select.innerHTML = `<option>Cargando servicios...</option>`;

  try {
    const res = await fetch("/api/cotizaciones/servicios");
    const serviciosRaw = await res.json();
    const servicios = serviciosRaw[0];

    select.innerHTML = `<option value="">Seleccionar servicio</option>`;
    servicios.forEach(s => {
      const o = document.createElement("option");
      o.value = s.Id_Servicio;
      o.textContent = s.Descripcion;
      select.appendChild(o);
    });

  } catch (err) {
    console.error(err);
    select.innerHTML = `<option>Error cargando servicios</option>`;
  }
}

async function cargarEspacios() {
  const select = document.getElementById("idEspacioEvento");
  select.innerHTML = `<option>Cargando espacios...</option>`;

  try {
    const res = await fetch("/api/cotizaciones/espacios");
    const espaciosRaw = await res.json();
    const espacios = espaciosRaw[0];

    select.innerHTML = `<option value="">Tipo de espacio o evento</option>`;
    espacios.forEach(e => {
      const o = document.createElement("option");
      o.value = e.Id_Categoria;
      o.textContent = e.Nombre;
      select.appendChild(o);
    });

  } catch (err) {
    console.error(err);
    select.innerHTML = `<option>Error cargando espacios</option>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPaises();

  document.getElementById("pais").addEventListener("change", function () {
    cargarProvincias(this.value);
  });

  document.getElementById("provincia").addEventListener("change", function () {
    cargarCantones(this.value);
  });

  document.getElementById("canton").addEventListener("change", function () {
    cargarDistritos(this.value);
  });
});

async function cargarPaises() {
  const res = await fetch("/api/usuarios/paises");
  const data = await res.json();
  llenarSelect("pais", data, "Seleccione un país");
}

async function cargarProvincias(idPais) {
  if (!idPais) return;
  const res = await fetch(`/api/usuarios/hijos/${idPais}`);
  const data = await res.json();
  llenarSelect("provincia", data, "Seleccione una provincia");
  habilitar("provincia");
  deshabilitar("canton");
  deshabilitar("distrito");
}

async function cargarCantones(idProvincia) {
  if (!idProvincia) return;
  const res = await fetch(`/api/usuarios/hijos/${idProvincia}`);
  const data = await res.json();
  llenarSelect("canton", data, "Seleccione un cantón");
  habilitar("canton");
  deshabilitar("distrito");
}


function llenarSelect(id, datos, placeholder) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  datos.forEach(x => {
    const op = document.createElement("option");
    op.value = x.Id;
    op.textContent = x.Descripcion;
    sel.appendChild(op);
  });
}

function habilitar(id) {
  document.getElementById(id).disabled = false;
}

function deshabilitar(id) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">Seleccione una opción</option>`;
  sel.disabled = true;
}
