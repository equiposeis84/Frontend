/**
 * @file prisma.js
 * @description Exporta una instancia única del cliente Prisma para toda la aplicación.
 */
import { PrismaClient } from '@prisma/client';

// Singleton: se reutiliza la misma instancia para evitar múltiples conexiones
const prisma = new PrismaClient();

export default prisma;
