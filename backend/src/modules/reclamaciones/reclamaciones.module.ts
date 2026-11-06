import { Module } from '@nestjs/common';
import { ReclamacionesController } from './reclamaciones.controller';
import { ReclamacionesRepository } from './reclamaciones.repository';
import { ReclamacionesService } from './reclamaciones.service';

@Module({
  controllers: [ReclamacionesController],
  providers: [ReclamacionesService, ReclamacionesRepository],
})
export class ReclamacionesModule {}
