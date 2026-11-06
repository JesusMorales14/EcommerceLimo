import { BadRequestException, Injectable } from '@nestjs/common';
import type { DealSession } from '@prisma/client';
import { TransactionRunner } from '../../infrastructure/prisma/transaction-runner';
import { DealSessionsRepository } from './deal-sessions.repository';
import type { CreateDealSessionDto } from './dto/create-deal-session.dto';

/** Casos de uso de las "Ofertas del Día" (solo una sesión activa a la vez). */
@Injectable()
export class DealSessionsService {
  constructor(
    private readonly sessions: DealSessionsRepository,
    private readonly transactions: TransactionRunner,
  ) {}

  /** Sesión en curso; si ya venció se desactiva y devuelve `null`. */
  async getActive(now = new Date()): Promise<DealSession | null> {
    const session = await this.sessions.findLatestStarted(now);
    if (!session) return null;
    if (session.endsAt <= now) {
      await this.sessions.deactivate(session.id);
      return null;
    }
    return session;
  }

  getScheduled(now = new Date()): Promise<DealSession | null> {
    return this.sessions.findNextScheduled(now);
  }

  /** Reemplaza cualquier sesión vigente por la nueva (operación atómica). */
  async create(
    dto: CreateDealSessionDto,
    now = new Date(),
  ): Promise<DealSession> {
    const endsAt = new Date(dto.endsAt);
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : now;
    if (endsAt <= now)
      throw new BadRequestException('La fecha de fin debe ser futura');
    if (startsAt >= endsAt)
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la de fin',
      );

    return this.transactions.run(async (tx) => {
      await this.sessions.deactivateAll(tx);
      return this.sessions.create({ startsAt, endsAt, active: true }, tx);
    });
  }

  async cancel(): Promise<{ ok: true }> {
    await this.sessions.deactivateAll();
    return { ok: true };
  }
}
