let pagina = 1;
let cargando = false;
let idImagenSeleccionada = null;

const contenedor = document.getElementById("feed");
const modalImagen = new bootstrap.Modal(document.getElementById("modalImagen"));
const modalSeleccionar = new bootstrap.Modal(document.getElementById("modalSeleccionarTablero"));

// Mensaje flotante
function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}

// Cargar imágenes
async function cargarImagenes() {
  if (cargando) return;
  cargando = true;

  try {
    const res = await fetch(`/api/imagenes/feed?pagina=${pagina}`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const imagenes = await res.json();

    if (!imagenes || imagenes.length === 0) {
      window.removeEventListener("scroll", scrollHandler);
      return;
    }

    imagenes.forEach(img => {
      const div = document.createElement("div");
      div.classList.add("feed-item");
      div.innerHTML = `
        <img data-id="${img.Id_Imagen}" src="${img.Url}" alt="${img.Titulo || ''}" title="${img.Descripcion || ''}" class="imagen-feed">
      `;
      contenedor.appendChild(div);
    });

    pagina++;
  } catch (err) {
    console.error(err);
    mostrarMensaje("No se pudieron cargar las imágenes");
  } finally {
    cargando = false;
  }
}

// Scroll infinito
function scrollHandler() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    cargarImagenes();
  }
}

// Modal de imagen
function inicializarEventosModal() {
  contenedor.addEventListener("click", (e) => {
    const imagen = e.target.closest(".imagen-feed");
    if (!imagen) return;

    idImagenSeleccionada = imagen.getAttribute("data-id");
    document.getElementById("modalImg").src = imagen.src;
    document.getElementById("modalTitulo").textContent = imagen.alt;
    document.getElementById("modalDescripcion").textContent = imagen.title;
    const btnLike = document.getElementById("btnLike");
    btnLike.setAttribute("data-id", idImagenSeleccionada);
    document.getElementById("btnGuardar").setAttribute("data-id", idImagenSeleccionada);

    modalImagen.show();
  });
}

// Me gusta
async function manejarLike(idImagen) {
  if (!idImagen) {
    mostrarMensaje("No se pudo identificar la imagen");
    return;
  }
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.Id_Usuario;
  if (!idUsuario) {
      mostrarMensaje("Usuario no identificado");
      return;
    }
    const response = await fetch("/api/imagenes/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario,idImagen })
    });
    const data = await response.json();
    mostrarMensaje(data.mensaje || "Me gusta!");
  } catch (err) {
    console.error(err);
    mostrarMensaje("Error al registrar el 'Me gusta'");
  }
}

// Mostrar modal de selección de tablero
async function mostrarModalSeleccionarTablero(idImagen) {
  idImagenSeleccionada = idImagen;
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.Id_Usuario || 1;

  try {
    const res = await fetch(`/api/tableros/listar/${idUsuario}`);
    if (!res.ok) throw new Error("No se pudieron cargar los tableros");
    const tableros = await res.json();

    const contenedorTableros = document.getElementById("contenedorTableros");
    contenedorTableros.innerHTML = "";

    if (!tableros.length) {
      contenedorTableros.innerHTML = "<p class='text-center text-muted'>No tienes tableros aún.</p>";
    } else {
      tableros.forEach(t => {
        const btn = document.createElement("button");
        btn.textContent = t.Titulo;
        btn.className = "btn btn-light w-100 mb-2";
        btn.onclick = async () => {
          await guardarEnTablero(t.Id_Tablero, idImagenSeleccionada);
          modalSeleccionar.hide();
        };
        contenedorTableros.appendChild(btn);
      });
    }

    modalSeleccionar.show();
  } catch (err) {
    console.error(err);
    mostrarMensaje("Error al cargar los tableros");
  }
}

// Guardar en tablero
async function guardarEnTablero(idTablero, idImagen) {
  if (!idTablero || !idImagen) {
    mostrarMensaje("No se pudo guardar la imagen: faltan datos");
    return;
  }

  try {
    const res = await fetch("/api/tableros/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idTablero, idImagen })
    });
    if (!res.ok) throw new Error("Error guardando la imagen");

    const data = await res.json();
    mostrarMensaje(data.mensaje || "Imagen guardada correctamente");
  } catch (err) {
    console.error(err);
    mostrarMensaje("Error al guardar la imagen");
  }
}

// Crear tablero desde modal
async function crearTablero(nombre) {
  if (!nombre) return mostrarMensaje("Ingresa un nombre para el tablero");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.Id_Usuario || 1;

  try {
    const response = await fetch("/api/tableros/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, idUsuario })
    });
    if (!response.ok) throw new Error("Error creando tablero");

    const data = await response.json();
    if (!data.id) throw new Error("No se pudo obtener el ID del tablero");

    // Guardar la imagen recién seleccionada en el tablero creado
    await guardarEnTablero(data.id, idImagenSeleccionada);

    mostrarMensaje("Tablero creado y guardado con éxito");
    document.getElementById("formNuevoTablero").classList.add("d-none");
    document.getElementById("nombreTablero").value = "";

    // Refrescar la lista de tableros en el modal
    await mostrarModalSeleccionarTablero(idImagenSeleccionada);
  } catch (err) {
    console.error(err);
    mostrarMensaje("Error al crear el tablero");
  }
}

// DOM Events
document.addEventListener("DOMContentLoaded", () => {
  cargarImagenes();
  inicializarEventosModal();

  window.addEventListener("scroll", scrollHandler);

  document.getElementById("btnRegresar").addEventListener("click", () => modalImagen.hide());

  document.getElementById("btnLike").addEventListener("click", (e) => {
    const idImagen = e.currentTarget.getAttribute("data-id");
    manejarLike(idImagen);
  });

  document.getElementById("btnGuardar").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    modalImagen.hide();
    setTimeout(() => mostrarModalSeleccionarTablero(id), 300); // Espera 300ms para que Bootstrap termine de cerrarlo
  });

  document.getElementById("btnNuevoTablero").addEventListener("click", () => {
    document.getElementById("formNuevoTablero").classList.toggle("d-none");
  });

  document.getElementById("btnGuardarTablero").addEventListener("click", async () => {
    const nombre = document.getElementById("nombreTablero").value.trim();
    await crearTablero(nombre);
  });
});
