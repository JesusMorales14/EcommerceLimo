import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReclamacionDto } from './dto/create-reclamacion.dto';
import { UpdateReclamacionDto } from './dto/update-reclamacion.dto';

const includeUser = {
  user: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class ReclamacionesService {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  async create(dto: CreateReclamacionDto, userId?: number) {
    const rec = await this.prisma.reclamacion.create({
      data: { ...dto, userId: userId ?? null },
    });
    await this.mail.sendReclamacionAdmin(rec);
    return rec;
  }

  findAll() {
    return this.prisma.reclamacion.findMany({
      include: includeUser,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUser(userId: number) {
    return this.prisma.reclamacion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateEstado(id: number, dto: UpdateReclamacionDto) {
    const exists = await this.prisma.reclamacion.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Reclamación no encontrada');
    const updated = await this.prisma.reclamacion.update({
      where: { id },
      data: {
        estado: dto.estado,
        respuesta: dto.respuesta !== undefined ? dto.respuesta : exists.respuesta,
      },
      include: includeUser,
    });
    await this.mail.sendReclamacionRespuesta(updated);
    return updated;
  }
}
