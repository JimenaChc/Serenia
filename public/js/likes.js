let idImagenSeleccionada = null;
const contenedor = document.getElementById("feedMeGusta");
const modalImagen = new bootstrap.Modal(document.getElementById("modalImagen"));

// Mensaje flotante
function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}

// Cargar imágenes de me gusta
async function cargarMeGusta() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = usuario?.Id_Usuario;
    if (!idUsuario) return mostrarMensaje("Usuario no encontrado");

    contenedor.innerHTML = `<p class="text-center text-muted">Cargando...</p>`;

    const res = await fetch(`/api/imagenes/megustas?idUsuario=${idUsuario}`);
    if (!res.ok) throw new Error();

    const imagenes = await res.json();

    if (!imagenes.length) {
      contenedor.innerHTML = "<p class='text-center text-muted'>Aún no tienes 'Me gusta'</p>";
      return;
    }

    contenedor.innerHTML = "";
    imagenes.forEach(img => {
      const div = document.createElement("div");
      div.classList.add("feed-item");

      div.innerHTML = `
        <img loading="lazy" data-id="${img.Id_Imagen}" src="${img.Url}" 
        alt="${img.Titulo || ''}" 
        title="${img.Descripcion || ''}" 
        class="imagen-feed">
      `;

      contenedor.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    mostrarMensaje("No se pudieron cargar las imágenes");
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

    modalImagen.show();
  });

  document.getElementById("btnRegresar").addEventListener("click", () => modalImagen.hide());
}

// DOM
document.addEventListener("DOMContentLoaded", () => {
  cargarMeGusta();
  inicializarEventosModal();
});
