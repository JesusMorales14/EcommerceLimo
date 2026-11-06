import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { PublicUser } from './user.select';
import { UsersRepository } from './users.repository';

/** Casos de uso sobre usuarios. */
@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  findAll(): Promise<PublicUser[]> {
    return this.users.findAllPublic();
  }

  async findOne(id: number): Promise<PublicUser> {
    const user = await this.users.findPublicById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  updateProfile(id: number, dto: UpdateProfileDto): Promise<PublicUser> {
    return this.users.updateProfile(id, dto);
  }
}
