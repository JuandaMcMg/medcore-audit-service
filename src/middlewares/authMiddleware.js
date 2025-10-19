// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        message: "No se proporcionó token de autenticación",
        service: "audit-service"
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Añadir la información del usuario decodificada al request
    req.user = decoded;
    
    return next();
  } catch (error) {
    console.error("Error de autenticación:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expirado",
        service: "audit-service"
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Token inválido",
        service: "audit-service"
      });
    }
    
    return res.status(500).json({
      message: "Error al procesar la autenticación",
      service: "audit-service"
    });
  }
};

module.exports = {
  verifyToken
};