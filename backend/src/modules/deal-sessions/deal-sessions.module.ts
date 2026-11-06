import { Module } from '@nestjs/common';
import { DealSessionsController } from './deal-sessions.controller';
import { DealSessionsRepository } from './deal-sessions.repository';
import { DealSessionsService } from './deal-sessions.service';

@Module({
  controllers: [DealSessionsController],
  providers: [DealSessionsService, DealSessionsRepository],
})
export class DealSessionsModule {}
