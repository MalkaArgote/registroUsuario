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
const DataBase = require("better-sqlite3");

const app = express();
const PUERTO = 3000;

// Permite que el servidor entienda JSON en las peticiones
app.use(express.json());

// Abre (o crea) el archivo de la base de datos
const db = new DataBase("usuarios.db");

// Crea la tabla si todavía no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    contrasena_hash TEXT NOT NULL,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

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

  const { nombre, apellido, contrasena } = req.body;
  const correo = req.body.correo.trim().toLowerCase();

  try {
    // ¿Ya existe alguien con ese correo?
    const existente = db
      .prepare("SELECT id FROM usuarios WHERE correo = ?")
      .get(correo);

    if (existente) {
      return res.status(409).json({ error: "Ese correo ya está registrado" });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const resultado = db
      .prepare(
        "INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash) VALUES (?, ?, ?, ?)"
      )
      .run(nombre.trim(), apellido.trim(), correo, contrasenaHash);

    res.status(201).json({
      mensaje: "Usuario registrado",
      usuario: {
        id: resultado.lastInsertRowid,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo,
      },
    });
  } catch (error) {
    // Respaldo: si dos peticiones llegan a la vez con el mismo correo
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "Ese correo ya está registrado" });
    }
    console.error("Error al procesar el registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});