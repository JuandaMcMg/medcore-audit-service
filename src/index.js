// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { connectDatabase } = require("./database/database");
const { sanitizeInputs } = require("./middlewares/sanitizeMiddleware");

// Importar rutas
const auditRoutes = require("./routes/auditRoutes");
const auditPolicyRoutes = require("./routes/auditPolicyRoutes");

const port = process.env.PORT || 3006;
const app = express();

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Frontend y API Gateway
  credentials: true,
}));
app.use(helmet()); // Añade headers de seguridad
app.use(morgan("dev")); // Logging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sanitizeInputs); // Sanitiza las entradas contra XSS

// Conectar a la base de datos
connectDatabase();

// Health check endpoint
app.get("/health", (_req, res) =>
  res.json({ 
    ok: true, 
    ts: new Date().toISOString(),
    service: "audit-service",
    port: port
  })
);

// Rutas del servicio
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/audit', auditPolicyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Audit Service Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: "Audit service encountered an error",
    service: "audit-service"
  });
});

// Middleware para rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({ 
    error: "Not Found", 
    message: "La ruta solicitada no existe en este servicio",
    service: "audit-service"
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Audit Service corriendo en http://localhost:${port}`);
});

module.exports = app;