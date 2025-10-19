// controllers/AuditController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Crear un nuevo registro de auditoría
 */
const createAuditLog = async (req, res) => {
  try {
    const { 
      userId, 
      userEmail, 
      action, 
      resourceType, 
      resourceId, 
      description,
      status,
      metadata,
      service 
    } = req.body;

    // Validaciones básicas
    if (!action || !resourceType || !description || !status || !service) {
      return res.status(400).json({
        message: "Se requieren action, resourceType, description, status y service",
        service: "audit-service"
      });
    }

    // Validar que el status sea válido
    if (!["success", "failure", "warning"].includes(status)) {
      return res.status(400).json({
        message: "El status debe ser 'success', 'failure' o 'warning'",
        service: "audit-service"
      });
    }

    // Capturar información adicional
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Crear el registro de auditoría
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        resourceType,
        resourceId,
        description,
        ipAddress,
        userAgent,
        status,
        metadata,
        service
      }
    });

    return res.status(201).json({
      message: "Registro de auditoría creado exitosamente",
      data: auditLog,
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al crear registro de auditoría:", error);
    return res.status(500).json({
      message: "Error al crear el registro de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

/**
 * Obtener un registro de auditoría por ID
 */
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el registro de auditoría
    const auditLog = await prisma.auditLog.findUnique({
      where: { id }
    });

    if (!auditLog) {
      return res.status(404).json({
        message: "Registro de auditoría no encontrado",
        service: "audit-service"
      });
    }

    return res.status(200).json({
      data: auditLog,
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al obtener registro de auditoría:", error);
    return res.status(500).json({
      message: "Error al obtener el registro de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

/**
 * Listar registros de auditoría con filtros
 */
const listAuditLogs = async (req, res) => {
  try {
    const { 
      userId, 
      userEmail, 
      action, 
      resourceType, 
      resourceId, 
      status,
      service,
      fromDate,
      toDate
    } = req.query;

    // Construir el objeto de filtros
    const where = {};
    
    if (userId) where.userId = userId;
    if (userEmail) where.userEmail = userEmail;
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (status) where.status = status;
    if (service) where.service = service;
    
    // Filtrado por rango de fechas
    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) where.timestamp.gte = new Date(fromDate);
      if (toDate) where.timestamp.lte = new Date(toDate);
    }

    // Obtener los registros de auditoría paginados
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Contar total de registros que coinciden con el filtro
    const totalCount = await prisma.auditLog.count({ where });

    // Obtener los registros de auditoría
    const auditLogs = await prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' }
    });

    return res.status(200).json({
      data: auditLogs,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit
      },
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al listar registros de auditoría:", error);
    return res.status(500).json({
      message: "Error al listar los registros de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

/**
 * Obtener estadísticas de auditoría
 */
const getAuditStats = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    // Definir rango de fechas para estadísticas
    const dateFilter = {};
    if (fromDate) dateFilter.gte = new Date(fromDate);
    if (toDate) dateFilter.lte = new Date(toDate);
    
    // Obtener total de registros por status
    const statusStats = await prisma.$transaction([
      prisma.auditLog.count({
        where: {
          status: "success",
          ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
        }
      }),
      prisma.auditLog.count({
        where: {
          status: "failure",
          ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
        }
      }),
      prisma.auditLog.count({
        where: {
          status: "warning",
          ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
        }
      })
    ]);
    
    // Obtener total de registros por servicio
    const serviceStats = await prisma.auditLog.groupBy({
      by: ['service'],
      _count: { id: true },
      where: Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : undefined
    });
    
    // Obtener total de registros por tipo de recurso
    const resourceTypeStats = await prisma.auditLog.groupBy({
      by: ['resourceType'],
      _count: { id: true },
      where: Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : undefined
    });

    // Obtener total de registros por acción
    const actionStats = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: { id: true },
      where: Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : undefined
    });
    
    return res.status(200).json({
      data: {
        totalRecords: statusStats[0] + statusStats[1] + statusStats[2],
        statusStats: {
          success: statusStats[0],
          failure: statusStats[1],
          warning: statusStats[2]
        },
        serviceStats: serviceStats.map(item => ({
          service: item.service,
          count: item._count.id
        })),
        resourceTypeStats: resourceTypeStats.map(item => ({
          resourceType: item.resourceType,
          count: item._count.id
        })),
        actionStats: actionStats.map(item => ({
          action: item.action,
          count: item._count.id
        }))
      },
      service: "audit-service"
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de auditoría:", error);
    return res.status(500).json({
      message: "Error al obtener estadísticas de auditoría",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
      service: "audit-service"
    });
  }
};

module.exports = {
  createAuditLog,
  getAuditLogById,
  listAuditLogs,
  getAuditStats
};