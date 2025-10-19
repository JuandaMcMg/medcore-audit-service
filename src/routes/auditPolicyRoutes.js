// routes/auditPolicyRoutes.js
const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { sanitizeInputs } = require("../middlewares/sanitizeMiddleware");
const {
  createAuditPolicy,
  getAuditPolicyById,
  listAuditPolicies,
  updateAuditPolicy,
  deleteAuditPolicy
} = require("../controllers/AuditPolicyController");

const router = express.Router();

/**
 * @route POST /api/v1/audit/policies
 * @desc Crear una nueva política de auditoría
 * @access Privado - Requiere autenticación
 */
router.post("/policies", [verifyToken, sanitizeInputs], createAuditPolicy);

/**
 * @route GET /api/v1/audit/policies/:id
 * @desc Obtener una política de auditoría por ID
 * @access Privado - Requiere autenticación
 */
router.get("/policies/:id", verifyToken, getAuditPolicyById);

/**
 * @route GET /api/v1/audit/policies
 * @desc Listar políticas de auditoría con filtros
 * @access Privado - Requiere autenticación
 */
router.get("/policies", verifyToken, listAuditPolicies);

/**
 * @route PUT /api/v1/audit/policies/:id
 * @desc Actualizar una política de auditoría
 * @access Privado - Requiere autenticación
 */
router.put("/policies/:id", [verifyToken, sanitizeInputs], updateAuditPolicy);

/**
 * @route DELETE /api/v1/audit/policies/:id
 * @desc Eliminar una política de auditoría
 * @access Privado - Requiere autenticación
 */
router.delete("/policies/:id", verifyToken, deleteAuditPolicy);

module.exports = router;