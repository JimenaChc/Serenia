let pagina = 1;
let cargando = false;
const contenedor = document.getElementById("feed");

// Función para cargar imágenes
async function cargarImagenes() {
  if (cargando) return;
  cargando = true;

  try {
    const res = await fetch(`/api/imagenes/feed?pagina=${pagina}`);
    if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);

    const imagenes = await res.json();

    if (!imagenes || imagenes.length === 0) {
      console.log("No hay más imágenes para mostrar");
      window.removeEventListener("scroll", scrollHandler); 
      return;
    }

    imagenes.forEach((img) => {
      const div = document.createElement("div");
      div.classList.add("feed-item");
      div.innerHTML = `
        <img 
          data-id="${img.Id_Imagen}" 
          src="${img.Url}" 
          alt="${img.Titulo || ''}" 
          title="${img.Descripcion || ''}" 
          class="imagen-feed"
        >
      `;
      contenedor.appendChild(div);
    });

    pagina++; // Siguiente página
  } catch (err) {
    console.error("Error cargando imágenes:", err);
    mostrarMensaje("No se pudieron cargar las imágenes");
  } finally {
    cargando = false;
  }
}

// Manejo de scroll infinito
function scrollHandler() {
  const scrollPos = window.innerHeight + window.scrollY;
  const offset = document.body.offsetHeight - 100;

  if (scrollPos >= offset) {
    cargarImagenes();
  }
}

// Inicializar feed
document.addEventListener("DOMContentLoaded", () => {
  if (!contenedor) {
    console.error("Contenedor del feed no encontrado. Verifica el ID.");
    return;
  }

  cargarImagenes();
  inicializarEventosModal();
  window.addEventListener("scroll", scrollHandler);

  // Botones del modal
  document.getElementById("btnLike").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    manejarLike(id);
  });

  document.getElementById("btnGuardar").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    mostrarModalSeleccionarTablero(id);
  });
});

// Función de mensaje flotante
function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}




//Modal imagen
function inicializarEventosModal() {
  const contenedor = document.getElementById("feed");
  const modal = new bootstrap.Modal(document.getElementById("modalImagen"));

  contenedor.addEventListener("click", (e) => {
    const imagen = e.target.closest(".imagen-feed");
    if (!imagen) return; // Si no se hace clic en una imagen, no hace nada

    // Carga los datos de la imagen en el modal
    const id = imagen.getAttribute("data-id");
    const src = imagen.getAttribute("src");
    const titulo = imagen.getAttribute("alt");
    const descripcion = imagen.getAttribute("title");

    document.getElementById("modalImg").src = src;
    document.getElementById("modalTitulo").textContent = titulo;
    document.getElementById("modalDescripcion").textContent = descripcion;
    document.getElementById("btnLike").setAttribute("data-id", id);
    document.getElementById("btnGuardar").setAttribute("data-id", id);

    modal.show(); // Muestra el modal
  });
}

//Me gusta
async function manejarLike(idImagen) {
  try {
    const res = await fetch("/api/imagenes/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idImagen })
    });
    const data = await res.json();
    alert(data.mensaje || "Imagen marcada con 'Me gusta'");
  } catch (err) {
    console.error(err);
    alert("Error al registrar el 'Me gusta'");
  }
}

// Elegir tablero
async function mostrarSeleccionTablero(idImagen) {
  const idUsuario = 1; // ID del usuario logueado

  const modalTableros = new bootstrap.Modal(document.getElementById("modalSeleccionarTablero"));
  const contenedor = document.getElementById("contenedorTableros");
  contenedor.innerHTML = "<p class='text-center text-muted'>Cargando tus tableros...</p>";

  try {
    const res = await fetch(`/api/tableros/listar/${idUsuario}`);
    const tableros = await res.json();

    contenedor.innerHTML = "";

    if (tableros.length === 0) {
      contenedor.innerHTML = "<p class='text-center text-muted'>Aún no tienes tableros creados.</p>";
    } else {
      tableros.forEach(tablero => {
        const btn = document.createElement("button");
        btn.classList.add("btn", "btn-light", "w-100");
        btn.textContent = tablero.Nombre;
        btn.onclick = async () => {
          await fetch("/api/tableros/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTablero: tablero.Id_Tableros, idImagen })
          });

          mostrarMensajeFlotante("Imagen guardada correctamente ✅");
          modalTableros.hide();
        };
        contenedor.appendChild(btn);
      });
    }
  } catch (err) {
    contenedor.innerHTML = "<p class='text-danger text-center'>Error al cargar tableros</p>";
  }

  modalTableros.show();
}

//Crear Tablero
document.getElementById("btnMostrarFormNuevo").addEventListener("click", () => {
  document.getElementById("formNuevoTablero").classList.toggle("d-none");
});

document.getElementById("formNuevoTablero").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreNuevoTablero").value.trim();
  const idUsuario = 1; // cambiar por tu id real
  const idImagen = window.imagenActual || null; // o pásala desde donde abras el modal

  if (!nombre) return mostrarMensajeFlotante(" Escribe un nombre para el tablero.");

  await fetch("/api/tableros/crear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, idUsuario })
  });

  await fetch("/api/tableros/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, idUsuario, idImagen })
  });

  mostrarMensajeFlotante("Tablero creado e imagen guardada.");
  bootstrap.Modal.getInstance(document.getElementById("modalSeleccionarTablero")).hide();
});


//Guarda tablero

async function manejarGuardar(idImagen) {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = usuario?.Id_Usuario || 1; // usar el ID real del usuario logueado

    const res = await fetch(`/api/tableros/listar/${idUsuario}`);
    const tableros = await res.json();

    // Si el usuario no tiene tableros, mostrar directamente el modal para crear uno
    if (!tableros.length) {
      mostrarMensaje("Aún no tienes tableros. Crea uno nuevo para guardar la imagen.");
      window.idImagenSeleccionada = idImagen;
      const modal = new bootstrap.Modal(document.getElementById("modalSeleccionarTablero"));
      modal.show();
      return;
    }

    // Si tiene tableros, mostrar el modal con la lista
    window.idImagenSeleccionada = idImagen;
    const contenedor = document.getElementById("contenedorTableros");
    contenedor.innerHTML = "";

    tableros.forEach((t) => {
      const btn = document.createElement("button");
      btn.textContent = t.Nombre;
      btn.className = "btn btn-light w-100";
      btn.onclick = async () => {
        await fetch("/api/tableros/guardar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idTablero: t.Id_Tableros, idImagen }),
        });
        mostrarMensaje("Imagen guardada correctamente ");
        bootstrap.Modal.getInstance(document.getElementById("modalSeleccionarTablero")).hide();
      };
      contenedor.appendChild(btn);
    });

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("modalSeleccionarTablero"));
    modal.show();

  } catch (err) {
    console.error(err);
    mostrarMensaje("Error al guardar la imagen en tablero ");
  }
}


// --- Modal de seleccionar tablero ---
const modalSeleccionar = new bootstrap.Modal(document.getElementById("modalSeleccionarTablero"));
let idImagenSeleccionada = null;

async function mostrarModalSeleccionarTablero(idImagen) {
  idImagenSeleccionada = idImagen;
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.Id_Usuario;

  const res = await fetch(`/api/tableros/listar/${idUsuario}`);
  const tableros = await res.json();
  const contenedor = document.getElementById("contenedorTableros");
  contenedor.innerHTML = "";

  if (tableros.length === 0) {
    contenedor.innerHTML = "<p class='text-center text-muted'>No tienes tableros aún.</p>";
  } else {
    tableros.forEach((t) => {
      const btn = document.createElement("button");
      btn.textContent = t.Nombre;
      btn.className = "btn btn-light";
      btn.onclick = async () => {
        await guardarEnTablero(t.Id_Tableros, idImagen);
        modalSeleccionar.hide();
      };
      contenedor.appendChild(btn);
    });
  }

  modalSeleccionar.show();
}

async function guardarEnTablero(idTablero, idImagen) {
  await fetch("/api/tableros/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idTablero, idImagen }),
  });
  mostrarMensaje("Imagen guardada correctamente");
}

function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}

// crear nuevo tablero desde el modal
document.getElementById("btnNuevoTablero").addEventListener("click", () => {
  document.getElementById("formNuevoTablero").style.display = "block";
});

document.getElementById("btnGuardarTablero").addEventListener("click", async () => {
  const nombre = document.getElementById("nombreTablero").value.trim();
  if (!nombre) return mostrarMensaje("Ingresa un nombre para el tablero");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.Id_Usuario;

  await fetch("/api/tableros/crear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, idUsuario }),
  });

  mostrarMensaje("Tablero creado con éxito");
  document.getElementById("formNuevoTablero").reset();
  document.getElementById("formNuevoTablero").style.display = "none";

  // volver a mostrar lista actualizada
  mostrarModalSeleccionarTablero(idImagenSeleccionada);
});


//Eventos
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    cargarImagenes();
  }
});

document.getElementById("btnRegresar").addEventListener("click", () => {
  bootstrap.Modal.getInstance(document.getElementById("modalImagen")).hide();
});

document.addEventListener("DOMContentLoaded", () => {
  cargarImagenes();
  inicializarEventosModal();

  // Botones dentro del modal
  document.getElementById("btnLike").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    manejarLike(id);
  });

  document.getElementById("btnGuardar").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    mostrarModalSeleccionarTablero(id);

  });
});
