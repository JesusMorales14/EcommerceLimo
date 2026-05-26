-- CreateEnum
CREATE TYPE "ReclamacionTipo" AS ENUM ('RECLAMO', 'QUEJA');

-- CreateEnum
CREATE TYPE "ReclamacionBien" AS ENUM ('PRODUCTO', 'SERVICIO');

-- CreateEnum
CREATE TYPE "ReclamacionEstado" AS ENUM ('PENDIENTE', 'EN_REVISION', 'RESUELTO', 'CERRADO');

-- CreateTable
CREATE TABLE "Reclamacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT,
    "tipo" "ReclamacionTipo" NOT NULL,
    "bien" "ReclamacionBien" NOT NULL,
    "pedidoNum" TEXT,
    "detalle" TEXT NOT NULL,
    "accion" TEXT,
    "estado" "ReclamacionEstado" NOT NULL DEFAULT 'PENDIENTE',
    "respuesta" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reclamacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reclamacion" ADD CONSTRAINT "Reclamacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
