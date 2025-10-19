// routes/auditRoutes.js
const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { sanitizeInputs } = require("../middlewares/sanitizeMiddleware");
const {
  createAuditLog,
  getAuditLogById,
  listAuditLogs,
  getAuditStats
} = require("../controllers/AuditController");

const router = express.Router();

/**
 * @route POST /api/v1/audit/logs
 * @desc Crear un nuevo registro de auditoría
 * @access Público - Para permitir que cualquier servicio pueda registrar eventos
 */
router.post("/logs", sanitizeInputs, createAuditLog);

/**
 * @route GET /api/v1/audit/logs/:id
 * @desc Obtener un registro de auditoría por ID
 * @access Privado - Requiere autenticación
 */
router.get("/logs/:id", verifyToken, getAuditLogById);

/**
 * @route GET /api/v1/audit/logs
 * @desc Listar registros de auditoría con filtros
 * @access Privado - Requiere autenticación
 */
router.get("/logs", verifyToken, listAuditLogs);

/**
 * @route GET /api/v1/audit/stats
 * @desc Obtener estadísticas de auditoría
 * @access Privado - Requiere autenticación
 */
router.get("/stats", verifyToken, getAuditStats);

module.exports = router;