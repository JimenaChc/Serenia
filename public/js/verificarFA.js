const idUsuario = localStorage.getItem("idUsuario");

document.getElementById("btnVerificar").addEventListener("click", async () => {
  const codigo = document.getElementById("codigo").value.trim();

  if (!codigo) return alert("Por favor ingresa el código");

  try {
    const res = await fetch("/api/usuarios/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario, codigo })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Autenticación completada correctamente");
      window.location.href = "Feed.html"; // o tu página principal
    } else {
      alert(" Código incorrecto, inténtalo de nuevo");
    }
  } catch (error) {
    console.error("Error al verificar 2FA:", error);
  }
});
