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
    document.getElementById("codigoSecreto").textContent = data.secreto;
  } catch (error) {
    console.error("Error al activar 2FA:", error);
  }
}

document.getElementById("btnListo").addEventListener("click", () => {
  window.location.href = "verificarFA.html"; 
});

activar2FA();
