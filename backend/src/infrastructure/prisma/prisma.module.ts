import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRunner } from './transaction-runner';

/** Acceso a datos disponible globalmente (una única conexión por proceso). */
@Global()
@Module({
  providers: [PrismaService, TransactionRunner],
  exports: [PrismaService, TransactionRunner],
})
export class PrismaModule {}
