// controllers/AuditPolicyController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Crear una nueva política de auditoría
 */
const createAuditPolicy = async (req, res) => {
  try {
    const { 
      name,
      resourceType,
      actions,
      isActive,
      retentionDays
    } = req.body;

    // Validaciones básicas
    if (!name || !resourceType || !actions || !Array.isArray(actions)) {
      return res.status(400).json({
        message: "Se requieren name, resourceType y actions (array)",
        service: "audit-service"
      });
    }

    // Verificar si ya existe una política con ese nombre
    const existingPolicy = await prisma.auditPolicy.findUnique({
      where: { name }
    });

    if (existingPolicy) {
      return res.status(409).json({
        message: "Ya existe una política de auditoría con ese nombre",
        service: "audit-service"
      });
    }

    // Crear la política de auditoría
    const auditPolicy = await prisma.auditPolicy.create({
      data: {
        name,
        resourceType,
        actions,
        isActive: isActive !== undefined ? isActive : true,
        retentionDays: retentionDays || 365
      }
    });

    return res.status(201).json({
      message: "Política de auditoría creada exitosamente",
      data: auditPolicy,
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al crear política de auditoría:", error);
    return res.status(500).json({
      message: "Error al crear la política de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

/**
 * Obtener una política de auditoría por ID
 */
const getAuditPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la política de auditoría
    const auditPolicy = await prisma.auditPolicy.findUnique({
      where: { id }
    });

    if (!auditPolicy) {
      return res.status(404).json({
        message: "Política de auditoría no encontrada",
        service: "audit-service"
      });
    }

    return res.status(200).json({
      data: auditPolicy,
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al obtener política de auditoría:", error);
    return res.status(500).json({
      message: "Error al obtener la política de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

/**
 * Listar políticas de auditoría con filtros
 */
const listAuditPolicies = async (req, res) => {
  try {
    const { resourceType, isActive } = req.query;

    // Construir el objeto de filtros
    const where = {};
    
    if (resourceType) where.resourceType = resourceType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // Obtener las políticas de auditoría
    const auditPolicies = await prisma.auditPolicy.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({
      data: auditPolicies,
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al listar políticas de auditoría:", error);
    return res.status(500).json({
      message: "Error al listar las políticas de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

/**
 * Actualizar una política de auditoría
 */
const updateAuditPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name,
      resourceType,
      actions,
      isActive,
      retentionDays
    } = req.body;

    // Verificar que la política existe
    const existingPolicy = await prisma.auditPolicy.findUnique({
      where: { id }
    });

    if (!existingPolicy) {
      return res.status(404).json({
        message: "Política de auditoría no encontrada",
        service: "audit-service"
      });
    }

    // Si se proporciona un nuevo nombre, verificar que no exista otra política con ese nombre
    if (name && name !== existingPolicy.name) {
      const policyWithSameName = await prisma.auditPolicy.findUnique({
        where: { name }
      });

      if (policyWithSameName) {
        return res.status(409).json({
          message: "Ya existe otra política de auditoría con ese nombre",
          service: "audit-service"
        });
      }
    }

    // Actualizar la política
    const updatedPolicy = await prisma.auditPolicy.update({
      where: { id },
      data: {
        name: name ?? existingPolicy.name,
        resourceType: resourceType ?? existingPolicy.resourceType,
        actions: actions ?? existingPolicy.actions,
        isActive: isActive !== undefined ? isActive : existingPolicy.isActive,
        retentionDays: retentionDays ?? existingPolicy.retentionDays
      }
    });

    return res.status(200).json({
      message: "Política de auditoría actualizada exitosamente",
      data: updatedPolicy,
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al actualizar política de auditoría:", error);
    return res.status(500).json({
      message: "Error al actualizar la política de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

/**
 * Eliminar una política de auditoría
 */
const deleteAuditPolicy = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la política existe
    const existingPolicy = await prisma.auditPolicy.findUnique({
      where: { id }
    });

    if (!existingPolicy) {
      return res.status(404).json({
        message: "Política de auditoría no encontrada",
        service: "audit-service"
      });
    }

    // Eliminar la política
    await prisma.auditPolicy.delete({
      where: { id }
    });

    return res.status(200).json({
      message: "Política de auditoría eliminada exitosamente",
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al eliminar política de auditoría:", error);
    return res.status(500).json({
      message: "Error al eliminar la política de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

module.exports = {
  createAuditPolicy,
  getAuditPolicyById,
  listAuditPolicies,
  updateAuditPolicy,
  deleteAuditPolicy
};