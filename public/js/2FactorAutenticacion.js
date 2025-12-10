// Suponemos que el id del usuario está guardado tras el registro/login
const idUsuario = localStorage.getItem("idUsuario");

async function activar2FA() {
    if (!idUsuario) return console.error("idUsuario no encontrado");
  try {
    const res = await fetch("/api/usuarios/activar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario })
    });
    const data = await res.json();
    document.getElementById("codigoSecreto").textContent =  data.secret || "No se generó el código";
  } catch (error) {
    console.error("Error al activar 2FA:", error);
  }
}

document.getElementById("btnListo").addEventListener("click", () => {
  window.location.href = "/VerificarFA.html"; 
});

// Copiar al portapapeles
    document.getElementById("btnCopiar").addEventListener("click", () => {
      const codigo = document.getElementById("codigoSecreto").textContent;
      navigator.clipboard.writeText(codigo)
        .then(() => mostrarMensaje("Código copiado al portapapeles"))
        .catch(() => mostrarMensaje("No se pudo copiar el código"));
    });

activar2FA();

function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}
