const express = require("express");

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
app.post("/register", (req, res) => {
  const { nombre, apellido, correo, contrasena } = req.body;

  console.log("Datos recibidos:", { nombre, apellido, correo });

  res.status(201).json({
    mensaje: "Datos recibidos",
    usuario: { nombre, apellido, correo },
  });
});