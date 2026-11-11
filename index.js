// Valida los datos de registro y devuelve una lista de errores
function validarRegistro(datos) {
  const errores = [];

  // Si no llegó ningún cuerpo, no hay nada que revisar
  if (!datos || typeof datos !== "object") {
    return ["El cuerpo de la petición debe ser un JSON válido"];
  }

  const { nombre, apellido, correo, contrasena } = datos;

  if (typeof nombre !== "string" || nombre.trim() === "") {
    errores.push("El nombre es obligatorio");
  }

  if (typeof apellido !== "string" || apellido.trim() === "") {
    errores.push("El apellido es obligatorio");
  }

  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof correo !== "string" || !formatoCorreo.test(correo.trim())) {
    errores.push("El correo es obligatorio y debe tener un formato válido");
  }

  if (typeof contrasena !== "string" || contrasena.length < 8) {
    errores.push("La contraseña es obligatoria y debe tener mínimo 8 caracteres");
  }

  return errores;
}

const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
const PUERTO = 3000;

// Permite que el servidor entienda JSON en las peticiones
app.use(express.json());

// Primera ruta: GET /
app.get("/", (req, res) => {
  res.json({ mensaje: "API de registro de usuarios funcionando" });
});

// Arranca el servidor
app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});

// Ruta: POST /register
app.post("/register", async (req, res) => {
  const errores = validarRegistro(req.body);

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const { nombre, apellido, correo, contrasena } = req.body;

  try {
    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    // Solo para estudiar: en una app real NUNCA imprimas hashes
    console.log("Hash generado:", contrasenaHash);

    res.status(201).json({
      mensaje: "Usuario procesado",
      usuario: { nombre, apellido, correo },
    });
  } catch (error) {
    console.error("Error al procesar el registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});