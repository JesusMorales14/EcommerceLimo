import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Reclamacion } from '@prisma/client';
import { MailService } from '../../infrastructure/mail/mail.service';
import type { CreateReclamacionDto } from './dto/create-reclamacion.dto';
import type { UpdateReclamacionDto } from './dto/update-reclamacion.dto';
import { ReclamacionesRepository } from './reclamaciones.repository';

/** Casos de uso del Libro de Reclamaciones. */
@Injectable()
export class ReclamacionesService {
  private readonly logger = new Logger(ReclamacionesService.name);

  constructor(
    private readonly claims: ReclamacionesRepository,
    private readonly mail: MailService,
  ) {}

  /** Registra la reclamación (anónima o del usuario autenticado) y avisa al administrador. */
  async create(
    dto: CreateReclamacionDto,
    userId?: number,
  ): Promise<Reclamacion> {
    const claim = await this.claims.create({ ...dto, userId: userId ?? null });
    this.notify(() => this.mail.sendNewClaimToAdmin(claim));
    return claim;
  }

  findAll() {
    return this.claims.findAll();
  }

  findByUser(userId: number): Promise<Reclamacion[]> {
    return this.claims.findByUser(userId);
  }

  async updateStatus(id: number, dto: UpdateReclamacionDto) {
    if (!(await this.claims.findById(id)))
      throw new NotFoundException('Reclamación no encontrada');
    const updated = await this.claims.update(id, {
      estado: dto.estado,
      ...(dto.respuesta !== undefined && { respuesta: dto.respuesta.trim() }),
    });
    this.notify(() => this.mail.sendClaimResponse(updated));
    return updated;
  }

  private notify(send: () => Promise<void>): void {
    send().catch((error: unknown) =>
      this.logger.warn(`No se pudo notificar por correo: ${String(error)}`),
    );
  }
}
