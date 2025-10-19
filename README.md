# MedCore Audit Service

Este microservicio gestiona el registro de auditoría de todas las acciones realizadas en el sistema MedCore, proporcionando trazabilidad y cumplimiento normativo.

## Características

- Registro centralizado de eventos del sistema
- Auditoría de acciones de usuarios
- Políticas configurables de auditoría
- Búsqueda y filtrado avanzado de logs
- Estadísticas y reportes de actividad

## Tecnologías

- Node.js
- Express
- MongoDB (con Prisma ORM)
- JWT para verificación de identidad

## Requisitos

- Node.js 14.x o superior
- MongoDB
- NPM o Yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd audit-service
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar Prisma:
```bash
npx prisma generate
```

4. Crear archivo `.env` con las siguientes variables:
```
PORT=3006
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

5. Iniciar el servicio:
```bash
npm run dev
```

## Despliegue en Vercel

1. Asegúrate de tener una cuenta en [Vercel](https://vercel.com/) y el CLI instalado:
```bash
npm i -g vercel
```

2. Iniciar sesión en Vercel:
```bash
vercel login
```

3. Configurar variables de entorno en Vercel:
   - Ve a la configuración de tu proyecto en Vercel
   - Añade las variables de entorno mencionadas en el archivo `.env`

4. Desplegar el servicio:
```bash
vercel --prod
```

## Estructura del Proyecto

- `src/index.js`: Punto de entrada de la aplicación
- `src/controllers/`: Controladores para logs y políticas de auditoría
- `src/routes/`: Definiciones de rutas
- `src/middlewares/`: Middleware de autenticación, validación, etc.
- `prisma/`: Esquemas de Prisma para la base de datos

## API Endpoints

- `POST /api/v1/audit/logs`: Crear nuevo registro de auditoría
- `GET /api/v1/audit/logs`: Listar registros de auditoría con filtros
- `GET /api/v1/audit/logs/:id`: Obtener un registro por ID
- `GET /api/v1/audit/stats`: Obtener estadísticas de auditoría
- `GET/POST/PUT/DELETE /api/v1/audit/policies`: CRUD de políticas de auditoría
- `GET /health`: Estado del servicio