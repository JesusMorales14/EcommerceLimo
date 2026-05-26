import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReclamacionesController } from './reclamaciones.controller';
import { ReclamacionesService } from './reclamaciones.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReclamacionesController],
  providers: [ReclamacionesService],
})
export class ReclamacionesModule {}
